import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Clock in (Start time log)
router.post('/clock-in', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { jobId } = req.body;

    // Verify job belongs to tenant
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.tenantId !== tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get user hourly rate
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const laborRate = user?.hourlyRate || 85.0; // Fallback to 85 if not set

    // Check if already clocked into this job
    const activeLog = await prisma.timeLog.findFirst({
      where: { tenantId, userId, jobId, endTime: null }
    });

    if (activeLog) {
      res.status(400).json({ error: 'Already clocked into this job' });
      return;
    }

    const log = await prisma.timeLog.create({
      data: {
        tenantId,
        userId,
        jobId,
        laborRate
      }
    });

    res.status(201).json(log);
  } catch (error: any) {
    console.error('Error clocking in:', error);
    res.status(500).json({ error: 'Failed to clock in' });
  }
});

// Clock out (End time log)
router.post('/clock-out', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;
    if (!tenantId || !userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { jobId } = req.body;

    const activeLog = await prisma.timeLog.findFirst({
      where: { tenantId, userId, jobId, endTime: null }
    });

    if (!activeLog) {
      res.status(400).json({ error: 'No active time log found for this job' });
      return;
    }

    const endTime = new Date();
    const startTime = new Date(activeLog.startTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    const updatedLog = await prisma.timeLog.update({
      where: { id: activeLog.id },
      data: { endTime }
    });

    // Increment job labor hours
    await prisma.job.update({
      where: { id: jobId },
      data: {
        laborHours: { increment: parseFloat(hours.toFixed(2)) }
      }
    });

    res.json(updatedLog);
  } catch (error: any) {
    console.error('Error clocking out:', error);
    res.status(500).json({ error: 'Failed to clock out' });
  }
});

export default router;
