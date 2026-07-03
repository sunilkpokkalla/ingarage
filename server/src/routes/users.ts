import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMail } from '../utils/mailer';

const router = Router();

const inviteSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  role: z.enum(['MANAGER', 'TECHNICIAN']),
  hourlyRate: z.number().min(0).max(10000).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.enum(['OWNER', 'MANAGER', 'TECHNICIAN']).optional(),
  hourlyRate: z.number().min(0).max(10000).nullable().optional(),
});

// List team members for the current tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { tenantId: req.user!.tenantId },
      select: { id: true, name: true, email: true, role: true, hourlyRate: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Invite a team member (email invite with a set-password link)
router.post(
  '/invite',
  authenticate,
  requireRole(['OWNER', 'MANAGER']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const body = validate(inviteSchema, req.body, res);
      if (!body) return;

      const existing = await prisma.user.findUnique({ where: { email: body.email } });
      if (existing) {
        res.status(400).json({ error: 'Email already in use' });
        return;
      }

      const inviteToken = crypto.randomBytes(32).toString('hex');
      // Random unusable password until the invitee sets their own
      const placeholderPassword = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);

      const user = await prisma.user.create({
        data: {
          tenantId: req.user!.tenantId,
          name: body.name,
          email: body.email,
          role: body.role,
          hourlyRate: body.hourlyRate,
          password: placeholderPassword,
          resetToken: inviteToken,
          resetTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId } });
      const link = `${config.appUrl}/reset-password?token=${inviteToken}&invite=1`;
      await sendMail({
        to: body.email,
        subject: `You've been invited to ${tenant?.name || 'InGarage'}`,
        text: `Hi ${body.name},\n\nYou've been invited to join ${tenant?.name || 'a shop'} on InGarage as ${body.role.toLowerCase()}.\n\nSet your password to get started (link valid for 7 days):\n${link}`,
      });

      res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
      console.error('Error inviting user:', error);
      res.status(500).json({ error: 'Failed to invite user' });
    }
  }
);

// Update a team member (role, rate, name) — owner only
router.put(
  '/:id',
  authenticate,
  requireRole(['OWNER']),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const body = validate(updateUserSchema, req.body, res);
      if (!body) return;

      const existing = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
      if (!existing || existing.tenantId !== req.user!.tenantId) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const user = await prisma.user.update({
        where: { id: existing.id },
        data: body,
        select: { id: true, name: true, email: true, role: true, hourlyRate: true },
      });
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

export default router;
