import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-collisionpro-dev-key';

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tenantName, userName, email, password } = req.body;
    
    if (!tenantName || !userName || !email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

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
            role: 'OWNER'
          }
        }
      },
      include: {
        users: true
      }
    });

    const user = tenant.users[0];
    const token = jwt.sign(
      { id: user.id, tenantId: tenant.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
        tenantName: tenant.name
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, tenantId: user.tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { tenant: true }
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
        tenantName: user.tenant.name
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
