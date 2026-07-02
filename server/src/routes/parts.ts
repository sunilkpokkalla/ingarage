import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all parts for a tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const parts = await prisma.part.findMany({
      where: { tenantId },
      include: {
        job: { select: { id: true, vehicle: true, customer: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(parts);
  } catch (error: any) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});

// Create a new part order
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { jobId, supplier, name, number, cost, status, eta } = req.body;

    const part = await prisma.part.create({
      data: {
        tenantId,
        jobId,
        supplier,
        name,
        number,
        cost: Number(cost || 0),
        status: status || 'Ordered',
        eta: eta ? new Date(eta) : null
      }
    });

    res.status(201).json(part);
  } catch (error: any) {
    console.error('Error creating part:', error);
    res.status(500).json({ error: 'Failed to create part' });
  }
});

// Update part status
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const partId = req.params.id;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existing = await prisma.part.findUnique({ where: { id: partId } });
    if (!existing || existing.tenantId !== tenantId) {
      res.status(404).json({ error: 'Part not found' });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.tenantId;

    if (updateData.eta) updateData.eta = new Date(updateData.eta);

    const part = await prisma.part.update({
      where: { id: partId },
      data: updateData
    });

    res.json(part);
  } catch (error: any) {
    console.error('Error updating part:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

export default router;
