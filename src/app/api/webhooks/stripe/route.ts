import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const rawBodyText = await req.text(); // Edge runtime supports text() natively

  if (!sig) {
    return new NextResponse('No signature', { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    // 1. Unverified parsing to extract tenantId
    let eventJson;
    try {
      eventJson = JSON.parse(rawBodyText);
    } catch (err) {
      return new NextResponse('Invalid JSON', { status: 400 });
    }

    const tenantId = eventJson?.data?.object?.metadata?.tenantId;
    if (!tenantId) {
      return new NextResponse('Missing tenantId in metadata', { status: 400 });
    }

    // 2. Fetch the decrypted webhook secret and API key for this tenant
    const { data: secrets, error: secretsError } = await supabase
      .rpc('get_decrypted_webhook_secrets', { p_tenant_id: tenantId });

    if (secretsError || !secrets || !secrets.webhookSecret || !secrets.secretKey) {
      console.error('Failed to get secrets:', secretsError);
      return new NextResponse('Webhook secret not configured for tenant', { status: 400 });
    }

    const stripe = new Stripe(secrets.secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    // 3. Verify signature using Stripe SDK
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBodyText, sig, secrets.webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // 4. Process event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (invoiceId) {
        const amountPaid = paymentIntent.amount_received / 100;
        
        const { error: processError } = await supabase.rpc('process_stripe_payment', {
          p_tenant_id: tenantId,
          p_transaction_id: paymentIntent.id,
          p_invoice_id: invoiceId,
          p_amount_paid: amountPaid,
          p_currency: (paymentIntent.currency || 'usd').toUpperCase(),
          p_status: 'COMPLETED'
        });

        if (processError) {
          console.error('Error processing payment:', processError);
          return new NextResponse('Internal server error processing payment', { status: 500 });
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (invoiceId) {
        await supabase.rpc('process_stripe_payment', {
          p_tenant_id: tenantId,
          p_transaction_id: paymentIntent.id,
          p_invoice_id: invoiceId,
          p_amount_paid: 0,
          p_currency: (paymentIntent.currency || 'usd').toUpperCase(),
          p_status: 'FAILED'
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
