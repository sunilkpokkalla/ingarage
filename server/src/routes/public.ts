import { Router, Response, Request } from 'express';
import { PrismaClient } from '@prisma/client';
import { decrypt } from '../utils/encryption';
import Stripe from 'stripe';

const router = Router();
const prisma = new PrismaClient();

// Get public invoice details (No auth required)
router.get('/invoices/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: String(id) },
      include: {
        tenant: true,
        job: {
          include: {
            parts: true,
            timeLogs: true
          }
        }
      }
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId: invoice.tenantId }
    });

    // Public details safe to show
    res.json({
      id: invoice.id,
      status: invoice.status,
      subtotal: invoice.subtotal,
      discount: invoice.discount,
      paid: invoice.paid,
      total: invoice.subtotal - invoice.discount,
      balance: invoice.subtotal - invoice.discount - invoice.paid,
      tenantName: invoice.tenant.name,
      job: {
        vehicle: invoice.job.vehicle,
        customer: invoice.job.customer
      },
      paymentConfig: {
        provider: settings?.provider,
        publicKey: settings?.publicKey,
        isActive: settings?.isActive
      }
    });
  } catch (error) {
    console.error('Error fetching public invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create payment intent
router.post('/invoices/:id/pay', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id: String(id) },
    });

    if (!invoice) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const balance = invoice.subtotal - invoice.discount - invoice.paid;
    if (balance <= 0) {
      res.status(400).json({ error: 'Invoice is already fully paid' });
      return;
    }

    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId: invoice.tenantId }
    });

    if (!settings || !settings.isActive || !settings.encryptedSecret) {
      res.status(400).json({ error: 'This shop is not configured to accept online payments' });
      return;
    }

    if (settings.provider !== 'STRIPE') {
      res.status(400).json({ error: 'Only Stripe is supported for now' });
      return;
    }

    // Decrypt the shop owner's secret key
    const stripeSecretKey = decrypt(settings.encryptedSecret);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(balance * 100), // Stripe expects cents
      currency: 'usd',
      metadata: {
        invoiceId: invoice.id,
        tenantId: invoice.tenantId
      }
    });

    // Log the pending transaction
    await prisma.paymentTransaction.create({
      data: {
        tenantId: invoice.tenantId,
        invoiceId: invoice.id,
        transactionId: paymentIntent.id,
        amount: balance,
        currency: 'USD',
        status: 'PENDING',
        provider: 'STRIPE'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      publicKey: settings.publicKey
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
