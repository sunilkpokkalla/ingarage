import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Active Jobs (Exclude ones that are complete/delivered)
    const activeJobsCount = await prisma.job.count({
      where: { 
        tenantId,
        status: { notIn: ['Delivered', 'Completed', 'Canceled'] }
      }
    });

    // Labor Captured (Sum of laborHours across active jobs)
    const laborAgg = await prisma.job.aggregate({
      where: { 
        tenantId,
        status: { notIn: ['Delivered', 'Completed', 'Canceled'] }
      },
      _sum: {
        laborHours: true
      }
    });

    // Parts in Transit
    const partsCount = await prisma.part.count({
      where: {
        tenantId,
        status: { in: ['Ordered', 'InTransit'] }
      }
    });

    // Online Payments (Revenue)
    const revenueAgg = await prisma.invoice.aggregate({
      where: {
        tenantId,
        status: { in: ['Paid', 'PartiallyPaid'] }
      },
      _sum: {
        paid: true
      }
    });

    res.json({
      activeJobs: activeJobsCount,
      laborCaptured: laborAgg._sum.laborHours || 0,
      partsInTransit: partsCount,
      revenue: revenueAgg._sum.paid || 0
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
