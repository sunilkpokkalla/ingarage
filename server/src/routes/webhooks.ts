import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { decrypt } from '../utils/encryption';

const router = Router();

// Stripe requires the raw body for signature verification.
// index.ts mounts this route with express.raw() before express.json().

router.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body;

  if (!sig) {
    res.status(400).send('No signature');
    return;
  }

  try {
    // Multi-tenant setup: parse the (unverified) JSON only to discover the tenant,
    // fetch that tenant's webhook secret, then verify the signature properly.
    const eventJson = JSON.parse(rawBody.toString('utf8'));
    const tenantId = eventJson.data?.object?.metadata?.tenantId;

    if (!tenantId) {
      res.status(400).send('Missing tenantId in metadata');
      return;
    }

    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId },
    });

    if (!settings || !settings.webhookSecret || !settings.encryptedSecret) {
      res.status(400).send('Webhook secret not configured for tenant');
      return;
    }

    const webhookSecret = decrypt(settings.webhookSecret);
    const stripeSecretKey = decrypt(settings.encryptedSecret);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' });

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (invoiceId) {
        // Idempotency: Stripe retries webhooks, so guard against processing
        // the same payment twice (which would double-count invoice.paid).
        await prisma.$transaction(async (tx) => {
          const txn = await tx.paymentTransaction.findUnique({
            where: { transactionId: paymentIntent.id },
          });

          if (txn?.status === 'COMPLETED') {
            return; // Already processed — ignore the retry
          }

          const amountPaid = paymentIntent.amount_received / 100;

          if (txn) {
            await tx.paymentTransaction.update({
              where: { id: txn.id },
              data: { status: 'COMPLETED' },
            });
          } else {
            // Webhook arrived before/without our local record — create one
            await tx.paymentTransaction.create({
              data: {
                tenantId,
                invoiceId,
                transactionId: paymentIntent.id,
                amount: amountPaid,
                currency: (paymentIntent.currency || 'usd').toUpperCase(),
                status: 'COMPLETED',
                provider: 'STRIPE',
              },
            });
          }

          const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
          if (invoice) {
            const newPaidAmount = invoice.paid + amountPaid;
            const balance = invoice.subtotal - invoice.discount - newPaidAmount;

            await tx.invoice.update({
              where: { id: invoiceId },
              data: {
                paid: newPaidAmount,
                status: balance <= 0 ? 'Paid' : 'PartiallyPaid',
              },
            });
          }
        });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: paymentIntent.id, status: { not: 'COMPLETED' } },
        data: { status: 'FAILED' },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
