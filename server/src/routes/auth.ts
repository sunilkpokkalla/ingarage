import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { sendMail } from '../utils/mailer';

const router = Router();

const registerSchema = z.object({
  tenantName: z.string().min(1).max(100),
  userName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotSchema = z.object({
  email: z.string().email(),
});

const resetSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});

function signToken(user: { id: string; tenantId: string; role: string }): string {
  return jwt.sign(
    { id: user.id, tenantId: user.tenantId, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = validate(registerSchema, req.body, res);
    if (!body) return;
    const { tenantName, userName, email, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const tenant = await prisma.tenant.create({
      data: {
        name: tenantName,
        users: {
          create: {
            name: userName,
            email,
            password: hashedPassword,
            role: 'OWNER',
          },
        },
      },
      include: { users: true },
    });

    const user = tenant.users[0];
    const token = signToken({ id: user.id, tenantId: tenant.id, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        tenantName: tenant.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = validate(loginSchema, req.body, res);
    if (!body) return;

    const user = await prisma.user.findUnique({
      where: { email: body.email },
      include: { tenant: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Request a password reset link. Always responds 200 to avoid email enumeration.
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = validate(forgotSchema, req.body, res);
    if (!body) return;

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const link = `${config.appUrl}/reset-password?token=${token}`;
      await sendMail({
        to: user.email,
        subject: 'Reset your InGarage password',
        text: `Hi ${user.name},\n\nClick the link below to reset your password. It expires in 1 hour.\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
      });
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot-password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Complete a password reset (also used to accept team invites).
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = validate(resetSchema, req.body, res);
    if (!body) return;

    const user = await prisma.user.findUnique({ where: { resetToken: body.token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      res.status(400).json({ error: 'Invalid or expired reset link' });
      return;
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    res.json({ message: 'Password updated. You can now log in.' });
  } catch (error) {
    console.error('Reset-password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { tenant: true },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
