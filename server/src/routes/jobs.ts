import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, parsePagination } from '../middleware/validate';

const router = Router();

const createJobSchema = z.object({
  vehicle: z.string().min(1).max(200),
  customer: z.string().min(1).max(200),
  customerId: z.string().nullable().optional(),
  insurer: z.string().max(200).nullable().optional(),
  vin: z.string().max(30).nullable().optional(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).optional(),
  estimatorId: z.string().nullable().optional(),
  damages: z.array(z.string().max(500)).max(50).optional(),
});

const updateJobSchema = z.object({
  vehicle: z.string().min(1).max(200).optional(),
  customer: z.string().min(1).max(200).optional(),
  customerId: z.string().nullable().optional(),
  insurer: z.string().max(200).nullable().optional(),
  vin: z.string().max(30).nullable().optional(),
  status: z.string().max(50).optional(),
  stage: z.number().int().min(0).max(100).optional(),
  eta: z.string().datetime({ offset: true }).nullable().optional().or(z.null()),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']).optional(),
  estimatorId: z.string().nullable().optional(),
  laborHours: z.number().min(0).optional(),
  laborRate: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  photos: z.array(z.string()).max(100).optional(),
  damages: z.array(z.string().max(500)).max(50).optional(),
});

// Get all jobs for the current tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { take, skip } = parsePagination(req.query);

    const jobs = await prisma.job.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        technicians: { select: { id: true, name: true } },
        estimator: { select: { id: true, name: true } },
        customerRef: { select: { id: true, name: true, email: true, phone: true } },
        parts: { select: { cost: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    const jobsWithPartsCost = jobs.map((job) => {
      const partsCost = job.parts.reduce((sum, part) => sum + (part.cost || 0), 0);
      return { ...job, partsCost };
    });

    res.json(jobsWithPartsCost);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create a new job
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(createJobSchema, req.body, res);
    if (!body) return;

    // If a customerId is given, verify it belongs to this tenant
    if (body.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: body.customerId } });
      if (!customer || customer.tenantId !== req.user!.tenantId) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
    }

    const job = await prisma.job.create({
      data: {
        tenantId: req.user!.tenantId,
        vehicle: body.vehicle,
        customer: body.customer,
        customerId: body.customerId || null,
        insurer: body.insurer,
        vin: body.vin,
        priority: body.priority || 'Normal',
        estimatorId: body.estimatorId || null,
        damages: JSON.stringify(body.damages || []),
        status: 'Intake',
        stage: 0,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update a job
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(updateJobSchema, req.body, res);
    if (!body) return;

    const existing = await prisma.job.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const { damages, photos, eta, ...rest } = body;
    const data: Record<string, unknown> = { ...rest };
    if (damages !== undefined) data.damages = JSON.stringify(damages);
    if (photos !== undefined) data.photos = JSON.stringify(photos);
    if (eta !== undefined) data.eta = eta ? new Date(eta) : null;

    const job = await prisma.job.update({
      where: { id: existing.id },
      data,
    });

    res.json(job);
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

export default router;
