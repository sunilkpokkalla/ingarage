-- InGarage: tenant isolation (RLS), signup provisioning, public-page RPCs,
-- payment-secret encryption, and lifecycle columns.
-- Apply with: psql "$DIRECT_URL" -v encryption_key="$ENCRYPTION_KEY" -f manual_rls_and_lifecycle.sql
-- Idempotent: safe to re-run.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ============================================================
-- 1. New columns
-- ============================================================
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "tax"     DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Job"     ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3);
ALTER TABLE "Job"     ADD COLUMN IF NOT EXISTS "declinedAt" TIMESTAMP(3);

-- ============================================================
-- 2. Private config (encryption key lives outside API-exposed schemas)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.app_config (
  key   text PRIMARY KEY,
  value text NOT NULL
);
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON private.app_config FROM PUBLIC, anon, authenticated;

INSERT INTO private.app_config (key, value)
VALUES ('encryption_key', :'encryption_key')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================================
-- 3. Tenant helper
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT nullif(coalesce(auth.jwt() -> 'user_metadata' ->> 'tenant_id', ''), '')
$$;

-- ============================================================
-- 4. Signup provisioning trigger:
--    - fresh signup (no tenant_id in metadata): create Tenant, stamp tenant_id
--    - invited user (tenant_id present): join that tenant
--    - always mirror into public."User"
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
  tid  text  := nullif(meta ->> 'tenant_id', '');
  tname text := coalesce(nullif(meta ->> 'tenant_name', ''), 'My Auto Shop');
  urole text := coalesce(nullif(meta ->> 'role', ''), 'OWNER');
  uname text := coalesce(nullif(meta ->> 'full_name', ''), nullif(meta ->> 'name', ''), split_part(NEW.email, '@', 1));
BEGIN
  IF tid IS NULL THEN
    tid := gen_random_uuid()::text;
    INSERT INTO "Tenant" (id, name, "createdAt", "updatedAt")
    VALUES (tid, tname, now(), now());
    NEW.raw_user_meta_data := meta || jsonb_build_object('tenant_id', tid, 'tenant_name', tname);
    urole := 'OWNER';
  END IF;

  INSERT INTO "User" (id, "tenantId", name, email, password, role, "createdAt", "updatedAt")
  VALUES (NEW.id::text, tid, uname, NEW.email, 'SUPABASE_AUTH', urole, now(), now())
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. Backfill the existing auth user into the Sunrise tenant
-- ============================================================
UPDATE auth.users
SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || jsonb_build_object('tenant_id', 'cmr4vjp1q0000aluvn85iirke', 'tenant_name', 'Sunrise Body Shop')
WHERE email = 'skpokkalla@gmail.com'
  AND coalesce(raw_user_meta_data ->> 'tenant_id', '') = '';

INSERT INTO "User" (id, "tenantId", name, email, password, role, "createdAt", "updatedAt")
SELECT u.id::text, 'cmr4vjp1q0000aluvn85iirke', 'Sunil Pokkalla', u.email, 'SUPABASE_AUTH', 'OWNER', now(), now()
FROM auth.users u
WHERE u.email = 'skpokkalla@gmail.com'
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- 6. Row Level Security: tenant isolation for authenticated users,
--    no direct table access for anon (public pages use RPCs below).
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['User','Customer','Document','Job','TimeLog','Part','Invoice','TenantPaymentSetting','PaymentTransaction','PlatformSubscription']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I FOR ALL TO authenticated
         USING ("tenantId" = public.current_tenant_id())
         WITH CHECK ("tenantId" = public.current_tenant_id())', t);
  END LOOP;
END $$;

ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self ON "Tenant";
CREATE POLICY tenant_self ON "Tenant" FOR SELECT TO authenticated
  USING (id = public.current_tenant_id());
DROP POLICY IF EXISTS tenant_self_update ON "Tenant";
CREATE POLICY tenant_self_update ON "Tenant" FOR UPDATE TO authenticated
  USING (id = public.current_tenant_id())
  WITH CHECK (id = public.current_tenant_id());

-- ============================================================
-- 7. Public RPCs (security definer): fetch/respond by exact ID only,
--    so the anon key can no longer dump tables.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_estimate(p_job_id text)
RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', j.id,
    'vehicle', j.vehicle,
    'customer', j.customer,
    'status', j.status,
    'laborHours', j."laborHours",
    'laborRate', j."laborRate",
    'damages', j.damages,
    'approvedAt', j."approvedAt",
    'declinedAt', j."declinedAt",
    'tenantName', t.name,
    'parts', coalesce((
      SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'cost', p.cost))
      FROM "Part" p WHERE p."jobId" = j.id
    ), '[]'::jsonb)
  )
  FROM "Job" j JOIN "Tenant" t ON t.id = j."tenantId"
  WHERE j.id = p_job_id
$$;

CREATE OR REPLACE FUNCTION public.respond_estimate(p_job_id text, p_approve boolean)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_approve THEN
    UPDATE "Job"
    SET status = 'Intake', "approvedAt" = now(), "updatedAt" = now()
    WHERE id = p_job_id AND status = 'Estimate Pending';
  ELSE
    UPDATE "Job"
    SET status = 'Estimate Declined', "declinedAt" = now(), "updatedAt" = now()
    WHERE id = p_job_id AND status = 'Estimate Pending';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_invoice(p_invoice_id text)
RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'id', i.id,
    'status', i.status,
    'subtotal', i.subtotal,
    'discount', i.discount,
    'tax', i.tax,
    'taxRate', i."taxRate",
    'paid', i.paid,
    'createdAt', i."createdAt",
    'tenantName', t.name,
    'job', jsonb_build_object(
      'vehicle', j.vehicle,
      'customer', j.customer,
      'vin', j.vin,
      'laborHours', j."laborHours",
      'laborRate', j."laborRate"
    ),
    'parts', coalesce((
      SELECT jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'supplier', p.supplier, 'number', p.number, 'cost', p.cost))
      FROM "Part" p WHERE p."jobId" = i."jobId"
    ), '[]'::jsonb)
  )
  FROM "Invoice" i
  JOIN "Job" j ON j.id = i."jobId"
  JOIN "Tenant" t ON t.id = i."tenantId"
  WHERE i.id = p_invoice_id
$$;

-- ============================================================
-- 8. Payment settings RPCs (secrets encrypted with pgcrypto; never
--    returned to the browser)
-- ============================================================
CREATE OR REPLACE FUNCTION public.save_payment_settings(
  p_provider text,
  p_is_active boolean,
  p_public_key text,
  p_secret_key text DEFAULT NULL,
  p_webhook_secret text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  tid text := public.current_tenant_id();
  enc_key text;
BEGIN
  IF tid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated or no tenant on account';
  END IF;
  SELECT value INTO enc_key FROM private.app_config WHERE key = 'encryption_key';

  INSERT INTO "TenantPaymentSetting" (id, "tenantId", provider, "isActive", "publicKey", "createdAt", "updatedAt")
  VALUES (gen_random_uuid()::text, tid, p_provider, p_is_active, p_public_key, now(), now())
  ON CONFLICT ("tenantId") DO UPDATE
    SET provider = EXCLUDED.provider,
        "isActive" = EXCLUDED."isActive",
        "publicKey" = EXCLUDED."publicKey",
        "updatedAt" = now();

  IF p_secret_key IS NOT NULL AND p_secret_key <> '' THEN
    UPDATE "TenantPaymentSetting"
    SET "encryptedSecret" = encode(extensions.pgp_sym_encrypt(p_secret_key, enc_key), 'base64')
    WHERE "tenantId" = tid;
  END IF;

  IF p_webhook_secret IS NOT NULL AND p_webhook_secret <> '' THEN
    UPDATE "TenantPaymentSetting"
    SET "webhookSecret" = encode(extensions.pgp_sym_encrypt(p_webhook_secret, enc_key), 'base64')
    WHERE "tenantId" = tid;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_payment_settings()
RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'provider', s.provider,
    'isActive', s."isActive",
    'publicKey', s."publicKey",
    'isSecretSet', s."encryptedSecret" IS NOT NULL,
    'isWebhookSet', s."webhookSecret" IS NOT NULL
  )
  FROM "TenantPaymentSetting" s
  WHERE s."tenantId" = public.current_tenant_id()
$$;

-- ============================================================
-- 9. Function grants
-- ============================================================
REVOKE ALL ON FUNCTION public.get_estimate(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.respond_estimate(text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_public_invoice(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_payment_settings(text, boolean, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_payment_settings() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_estimate(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.respond_estimate(text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_invoice(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_payment_settings(text, boolean, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_payment_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon, authenticated;

COMMIT;
