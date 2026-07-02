import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { encrypt } from '../utils/encryption';

const router = Router();
const prisma = new PrismaClient();

// Get tenant payment settings
router.get('/payments', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const settings = await prisma.tenantPaymentSetting.findUnique({
      where: { tenantId }
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
      hasSecretKey: !!settings.encryptedSecret, // Just let the frontend know it's configured
      hasWebhookSecret: !!settings.webhookSecret
    });
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update payment settings
router.post('/payments', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Only owners can modify payment settings
    if (req.user?.role !== 'OWNER') {
      res.status(403).json({ error: 'Only owners can modify payment settings' });
      return;
    }

    const { provider, publicKey, secretKey, webhookSecret, isActive } = req.body;

    const updateData: any = {
      provider,
      publicKey,
      isActive
    };

    // Only update secrets if they were provided (don't overwrite with empty if they just updated publicKey)
    if (secretKey) {
      updateData.encryptedSecret = encrypt(secretKey);
    }
    
    if (webhookSecret) {
      updateData.webhookSecret = encrypt(webhookSecret);
    }

    const settings = await prisma.tenantPaymentSetting.upsert({
      where: { tenantId },
      create: {
        tenantId,
        provider: provider || 'STRIPE',
        publicKey,
        encryptedSecret: secretKey ? encrypt(secretKey) : null,
        webhookSecret: webhookSecret ? encrypt(webhookSecret) : null,
        isActive: isActive !== undefined ? isActive : false
      },
      update: updateData
    });

    res.json({
      id: settings.id,
      provider: settings.provider,
      publicKey: settings.publicKey,
      isActive: settings.isActive,
      hasSecretKey: !!settings.encryptedSecret,
      hasWebhookSecret: !!settings.webhookSecret
    });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
