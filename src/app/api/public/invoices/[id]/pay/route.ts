import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: invoiceId } = await params;
    if (!invoiceId) {
      return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Fetch encrypted credentials and amounts using our secure RPC
    const { data: intentData, error: intentError } = await supabase
      .rpc('create_payment_intent_data', { p_invoice_id: invoiceId });

    if (intentError) {
      console.error('RPC Error:', intentError);
      return NextResponse.json({ error: intentError.message }, { status: 400 });
    }

    if (!intentData) {
      return NextResponse.json({ error: 'Failed to fetch payment config' }, { status: 400 });
    }

    const { tenantId, amount, publicKey, secretKey } = intentData as any;

    if (!secretKey) {
      return NextResponse.json({ error: 'No secret key available' }, { status: 400 });
    }

    // 2. Initialize Stripe
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      httpClient: Stripe.createFetchHttpClient(), // REQUIRED for Edge runtime!
    });

    // 3. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: {
        invoiceId,
        tenantId
      }
    });

    // 4. Log the pending transaction to Supabase using the service_role key
    const { error: insertError } = await supabase
      .from('PaymentTransaction')
      .insert({
        tenantId,
        invoiceId,
        transactionId: paymentIntent.id,
        amount,
        currency: 'USD',
        status: 'PENDING',
        provider: 'STRIPE'
      });

    if (insertError) {
      console.error('Error logging transaction:', insertError);
      // We don't abort, the intent is still valid, webhooks will sync it later.
    }

    // 5. Return the client secret to the frontend
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publicKey
    });
  } catch (error: any) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
