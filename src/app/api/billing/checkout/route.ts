import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'edge';

const APP_URL = process.env.APP_URL || 'https://ingarage.app';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_123'; // Default placeholder

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Platform billing not configured: set STRIPE_SECRET_KEY in the deployment environment.' },
        { status: 501 }
      );
    }

    const supabaseAdmin = createAdminClient();

    const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller?.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const tenantId = caller.user.user_metadata?.tenant_id;
    if (!tenantId) {
      return NextResponse.json({ error: 'No shop linked to session.' }, { status: 400 });
    }

    // Get or create PlatformSubscription for tenant
    const { data: subscription } = await supabaseAdmin
      .from('PlatformSubscription')
      .select('*')
      .eq('tenantId', tenantId)
      .single();

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: caller.user.email,
        metadata: { tenantId }
      });
      customerId = customer.id;

      if (!subscription) {
        await supabaseAdmin.from('PlatformSubscription').insert([{
          id: crypto.randomUUID(),
          tenantId,
          stripeCustomerId: customerId,
          plan: 'PROFESSIONAL',
          status: 'TRIAL'
        }]);
      } else {
        await supabaseAdmin.from('PlatformSubscription').update({
          stripeCustomerId: customerId
        }).eq('tenantId', tenantId);
      }
    }

    // Check if they already have an active subscription
    if (subscription?.status === 'ACTIVE' && subscription?.stripeSubscriptionId) {
      // Create a Stripe Customer Portal session instead
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${APP_URL}/settings`,
      });
      return NextResponse.json({ url: portalSession.url });
    }

    // Create a Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${APP_URL}/settings?billing=success`,
      cancel_url: `${APP_URL}/settings?billing=cancel`,
      metadata: {
        tenantId
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Billing Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
