CREATE OR REPLACE FUNCTION public.create_payment_intent_data(p_invoice_id text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_invoice record;
  v_settings record;
  v_enc_key text;
  v_decrypted_secret text;
  v_balance double precision;
BEGIN
  -- MUST be called by service_role (our Next.js backend API)
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: only service_role can access payment secrets';
  END IF;

  SELECT value INTO v_enc_key FROM private.app_config WHERE key = 'encryption_key';

  SELECT * INTO v_invoice FROM "Invoice" WHERE id = p_invoice_id;
  IF v_invoice IS NULL THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  v_balance := v_invoice.subtotal + v_invoice.tax - v_invoice.discount - v_invoice.paid;
  IF v_balance <= 0 THEN
    RAISE EXCEPTION 'Invoice is already fully paid';
  END IF;

  SELECT * INTO v_settings FROM "TenantPaymentSetting" WHERE "tenantId" = v_invoice."tenantId";
  IF v_settings IS NULL OR NOT v_settings."isActive" OR v_settings."encryptedSecret" IS NULL THEN
    RAISE EXCEPTION 'This shop is not configured to accept online payments';
  END IF;

  IF v_settings.provider <> 'STRIPE' THEN
    RAISE EXCEPTION 'Only Stripe is supported for now';
  END IF;

  v_decrypted_secret := extensions.pgp_sym_decrypt(decode(v_settings."encryptedSecret", 'base64'), v_enc_key);

  RETURN jsonb_build_object(
    'tenantId', v_invoice."tenantId",
    'amount', v_balance,
    'publicKey', v_settings."publicKey",
    'secretKey', v_decrypted_secret
  );
END;
$$;
