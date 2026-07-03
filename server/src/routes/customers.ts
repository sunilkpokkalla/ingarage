import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, parsePagination } from '../middleware/validate';

const router = Router();

const customerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
});

// List customers (with job count and vehicles)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { take, skip } = parsePagination(req.query);
    const customers = await prisma.customer.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        jobs: { select: { id: true, vehicle: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create a customer
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(customerSchema, req.body, res);
    if (!body) return;

    const customer = await prisma.customer.create({
      data: { ...body, tenantId: req.user!.tenantId },
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update a customer
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(customerSchema.partial(), req.body, res);
    if (!body) return;

    const existing = await prisma.customer.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    const customer = await prisma.customer.update({
      where: { id: existing.id },
      data: body,
    });
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete a customer (jobs keep their text customer name; link is cleared)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    await prisma.$transaction([
      prisma.job.updateMany({ where: { customerId: existing.id }, data: { customerId: null } }),
      prisma.customer.delete({ where: { id: existing.id } }),
    ]);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
