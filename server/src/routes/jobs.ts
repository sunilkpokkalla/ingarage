import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all jobs for the current tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const jobs = await prisma.job.findMany({
      where: { tenantId },
      include: {
        technicians: {
          select: { id: true, name: true }
        },
        estimator: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(jobs);
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create a new job
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { vehicle, customer, insurer, vin, priority, estimatorId, damages } = req.body;

    const job = await prisma.job.create({
      data: {
        tenantId,
        vehicle,
        customer,
        insurer,
        vin,
        priority,
        estimatorId,
        damages: JSON.stringify(damages || []),
        status: 'Intake',
        stage: 0
      }
    });

    res.status(201).json(job);
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update a job
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const jobId = req.params.id;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify job belongs to tenant
    const existing = await prisma.job.findUnique({ where: { id: jobId } });
    if (!existing || existing.tenantId !== tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.tenantId;

    if (updateData.damages && Array.isArray(updateData.damages)) {
      updateData.damages = JSON.stringify(updateData.damages);
    }
    if (updateData.photos && Array.isArray(updateData.photos)) {
      updateData.photos = JSON.stringify(updateData.photos);
    }

    const job = await prisma.job.update({
      where: { id: jobId },
      data: updateData
    });

    res.json(job);
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

export default router;
