import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all invoices for a tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        job: { select: { id: true, vehicle: true, customer: true, laborHours: true, laborRate: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(invoices);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create/Generate an invoice for a job
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { jobId, discount } = req.body;

    // Ensure job belongs to tenant and exists
    const job = await prisma.job.findUnique({ 
      where: { id: jobId },
      include: { parts: true } 
    });
    
    if (!job || job.tenantId !== tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({ where: { jobId } });
    if (existing) {
      res.status(400).json({ error: 'Invoice already exists for this job' });
      return;
    }

    // Calculate subtotal: (Labor Hours * Rate) + Parts Cost
    const laborCost = job.laborHours * job.laborRate;
    const partsCost = job.parts.reduce((sum, p) => sum + p.cost, 0);
    const subtotal = laborCost + partsCost;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        jobId,
        subtotal,
        discount: discount || 0,
        paid: 0,
        status: 'Draft'
      }
    });

    res.status(201).json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Pay/Update an invoice
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tenantId = req.user?.tenantId;
    const invoiceId = req.params.id;
    if (!tenantId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const existing = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!existing || existing.tenantId !== tenantId) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const updateData = { ...req.body };
    delete updateData.id;
    delete updateData.tenantId;

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData
    });

    res.json(invoice);
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

export default router;
