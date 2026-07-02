import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { decrypt } from '../utils/encryption';

const router = Router();
const prisma = new PrismaClient();

// Stripe requires the raw body for signature verification
// In index.ts, we need to ensure this route uses raw body parser, not JSON

router.post('/stripe', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  const rawBody = req.body; // Assuming middleware passes raw body here

  if (!sig) {
    res.status(400).send('No signature');
    return;
  }

  try {
    // 1. Try to find the tenant based on the event payload
    // To verify, we actually need the webhook secret for this specific tenant
    // This is tricky because we receive webhooks at a single endpoint.
    // In a multi-tenant Direct-to-Merchant Stripe setup, you typically use Stripe Connect
    // OR the tenant gives us their webhook secret.
    // If they give us their webhook secret, we have to parse the JSON manually first to find `metadata.tenantId`,
    // then fetch the secret, THEN verify the signature.

    const eventJson = JSON.parse(rawBody.toString('utf8'));
    const tenantId = eventJson.data?.object?.metadata?.tenantId;

    if (!tenantId) {
      // Not our transaction or missing metadata
      res.status(400).send('Missing tenantId in metadata');
      return;
    }

    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId }
    });

    if (!settings || !settings.webhookSecret) {
      res.status(400).send('Webhook secret not configured for tenant');
      return;
    }

    const webhookSecret = decrypt(settings.webhookSecret);
    const stripeSecretKey = decrypt(settings.encryptedSecret!);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (invoiceId) {
        // 1. Mark transaction as completed
        await prisma.paymentTransaction.updateMany({
          where: { transactionId: paymentIntent.id },
          data: { status: 'COMPLETED' }
        });

        // 2. Update Invoice
        // We add the amount received (converted back to dollars)
        const amountPaid = paymentIntent.amount_received / 100;
        
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
        if (invoice) {
          const newPaidAmount = invoice.paid + amountPaid;
          const balance = invoice.subtotal - invoice.discount - newPaidAmount;
          
          await prisma.invoice.update({
            where: { id: invoiceId },
            data: { 
              paid: newPaidAmount,
              status: balance <= 0 ? 'Paid' : 'PartiallyPaid'
            }
          });
        }
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await prisma.paymentTransaction.updateMany({
        where: { transactionId: paymentIntent.id },
        data: { status: 'FAILED' }
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
