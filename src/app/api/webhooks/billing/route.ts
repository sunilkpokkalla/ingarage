import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Stripe from 'stripe';

export const runtime = 'edge';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const rawBodyText = await req.text();

  if (!sig) {
    return new NextResponse('No signature', { status: 400 });
  }

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('Platform billing webhook secrets not configured.');
    return new NextResponse('Internal Server Error', { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-02-24.acacia' as any,
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const event = await stripe.webhooks.constructEventAsync(rawBodyText, sig, STRIPE_WEBHOOK_SECRET);
    const supabase = createAdminClient();

    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      const status = subscription.status === 'active' ? 'ACTIVE' : 
                     subscription.status === 'trialing' ? 'TRIAL' :
                     subscription.status === 'past_due' ? 'PAST_DUE' : 'CANCELED';

      await supabase
        .from('PlatformSubscription')
        .update({
          stripeSubscriptionId: subscription.id,
          status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripeCustomerId', customerId);
        
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      await supabase
        .from('PlatformSubscription')
        .update({
          status: 'CANCELED'
        })
        .eq('stripeCustomerId', customerId);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Billing Webhook Error:', err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }
}
