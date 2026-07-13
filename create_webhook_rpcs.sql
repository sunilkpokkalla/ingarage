CREATE OR REPLACE FUNCTION public.get_decrypted_webhook_secrets(p_tenant_id text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions
AS $$
DECLARE
  v_settings record;
  v_enc_key text;
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT value INTO v_enc_key FROM private.app_config WHERE key = 'encryption_key';
  
  SELECT * INTO v_settings FROM "TenantPaymentSetting" WHERE "tenantId" = p_tenant_id;
  IF v_settings IS NULL THEN
    RAISE EXCEPTION 'Settings not found';
  END IF;

  RETURN jsonb_build_object(
    'secretKey', extensions.pgp_sym_decrypt(decode(v_settings."encryptedSecret", 'base64'), v_enc_key),
    'webhookSecret', extensions.pgp_sym_decrypt(decode(v_settings."webhookSecret", 'base64'), v_enc_key)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.process_stripe_payment(
  p_tenant_id text,
  p_transaction_id text,
  p_invoice_id text,
  p_amount_paid double precision,
  p_currency text,
  p_status text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_txn record;
  v_invoice record;
  v_new_paid double precision;
  v_balance double precision;
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_status = 'COMPLETED' THEN
    -- Idempotency check
    SELECT * INTO v_txn FROM "PaymentTransaction" WHERE "transactionId" = p_transaction_id;
    IF v_txn.status = 'COMPLETED' THEN
      RETURN;
    END IF;

    -- Update or Insert transaction
    IF v_txn IS NOT NULL THEN
      UPDATE "PaymentTransaction" SET status = 'COMPLETED' WHERE id = v_txn.id;
    ELSE
      INSERT INTO "PaymentTransaction" ("id", "tenantId", "invoiceId", "transactionId", "amount", "currency", "status", "provider", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, p_tenant_id, p_invoice_id, p_transaction_id, p_amount_paid, p_currency, 'COMPLETED', 'STRIPE', now(), now());
    END IF;

    -- Update Invoice
    SELECT * INTO v_invoice FROM "Invoice" WHERE id = p_invoice_id;
    IF v_invoice IS NOT NULL THEN
      v_new_paid := v_invoice.paid + p_amount_paid;
      v_balance := v_invoice.subtotal + v_invoice.tax - v_invoice.discount - v_new_paid;
      
      UPDATE "Invoice"
      SET paid = v_new_paid,
          status = CASE WHEN v_balance <= 0 THEN 'Paid' ELSE 'PartiallyPaid' END
      WHERE id = p_invoice_id;
    END IF;
  ELSIF p_status = 'FAILED' THEN
    UPDATE "PaymentTransaction"
    SET status = 'FAILED'
    WHERE "transactionId" = p_transaction_id AND status <> 'COMPLETED';
  END IF;
END;
$$;
