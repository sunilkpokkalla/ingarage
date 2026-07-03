import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { encrypt } from '../utils/encryption';

const router = Router();

const paymentSettingsSchema = z.object({
  provider: z.enum(['STRIPE', 'PAYPAL', 'SQUARE', 'RAZORPAY']).optional(),
  publicKey: z.string().max(500).nullable().optional(),
  secretKey: z.string().max(500).optional(),
  webhookSecret: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// Get tenant payment settings
router.get('/payments', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId: req.user!.tenantId },
    });

    if (!settings) {
      res.json(null);
      return;
    }

    // Never return the encrypted secret back to the frontend
    res.json({
      id: settings.id,
      provider: settings.provider,
      publicKey: settings.publicKey,
      isActive: settings.isActive,
      hasSecretKey: !!settings.encryptedSecret,
      hasWebhookSecret: !!settings.webhookSecret,
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update payment settings — owner only
router.post(
  '/payments',
  authenticate,
  requireRole(['OWNER']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const body = validate(paymentSettingsSchema, req.body, res);
      if (!body) return;

      const tenantId = req.user!.tenantId;
      const { provider, publicKey, secretKey, webhookSecret, isActive } = body;

      const updateData: Record<string, unknown> = { provider, publicKey, isActive };

      // Only update secrets if provided (don't overwrite when only publicKey changes)
      if (secretKey) updateData.encryptedSecret = encrypt(secretKey);
      if (webhookSecret) updateData.webhookSecret = encrypt(webhookSecret);

      const settings = await prisma.tenantPaymentSetting.upsert({
        where: { tenantId },
        create: {
          tenantId,
          provider: provider || 'STRIPE',
          publicKey,
          encryptedSecret: secretKey ? encrypt(secretKey) : null,
          webhookSecret: webhookSecret ? encrypt(webhookSecret) : null,
          isActive: isActive !== undefined ? isActive : false,
        },
        update: updateData,
      });

      res.json({
        id: settings.id,
        provider: settings.provider,
        publicKey: settings.publicKey,
        isActive: settings.isActive,
        hasSecretKey: !!settings.encryptedSecret,
        hasWebhookSecret: !!settings.webhookSecret,
      });
    } catch (error) {
      console.error('Error saving payment settings:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
