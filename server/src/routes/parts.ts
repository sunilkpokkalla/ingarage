import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, parsePagination } from '../middleware/validate';

const router = Router();

const PART_STATUSES = ['Ordered', 'InTransit', 'Received', 'Installed'] as const;

const createPartSchema = z.object({
  jobId: z.string().min(1),
  supplier: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  number: z.string().max(100).nullable().optional(),
  cost: z.number().min(0).optional(),
  status: z.enum(PART_STATUSES).optional(),
  eta: z.string().datetime({ offset: true }).nullable().optional(),
});

const updatePartSchema = z.object({
  supplier: z.string().min(1).max(200).optional(),
  name: z.string().min(1).max(200).optional(),
  number: z.string().max(100).nullable().optional(),
  cost: z.number().min(0).optional(),
  status: z.enum(PART_STATUSES).optional(),
  eta: z.string().datetime({ offset: true }).nullable().optional(),
});

// Get all parts for a tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { take, skip } = parsePagination(req.query);

    const parts = await prisma.part.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        job: { select: { id: true, vehicle: true, customer: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    res.json(parts);
  } catch (error) {
    console.error('Error fetching parts:', error);
    res.status(500).json({ error: 'Failed to fetch parts' });
  }
});

// Create a new part order
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(createPartSchema, req.body, res);
    if (!body) return;

    // Verify the job belongs to this tenant
    const job = await prisma.job.findUnique({ where: { id: body.jobId } });
    if (!job || job.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const part = await prisma.part.create({
      data: {
        tenantId: req.user!.tenantId,
        jobId: body.jobId,
        supplier: body.supplier,
        name: body.name,
        number: body.number,
        cost: body.cost || 0,
        status: body.status || 'Ordered',
        eta: body.eta ? new Date(body.eta) : null,
      },
    });

    res.status(201).json(part);
  } catch (error) {
    console.error('Error creating part:', error);
    res.status(500).json({ error: 'Failed to create part' });
  }
});

// Update a part
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(updatePartSchema, req.body, res);
    if (!body) return;

    const existing = await prisma.part.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Part not found' });
      return;
    }

    const { eta, ...rest } = body;
    const data: Record<string, unknown> = { ...rest };
    if (eta !== undefined) data.eta = eta ? new Date(eta) : null;

    const part = await prisma.part.update({
      where: { id: existing.id },
      data,
    });

    res.json(part);
  } catch (error) {
    console.error('Error updating part:', error);
    res.status(500).json({ error: 'Failed to update part' });
  }
});

export default router;
