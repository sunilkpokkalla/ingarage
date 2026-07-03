import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, parsePagination } from '../middleware/validate';
import { sendMail } from '../utils/mailer';

const router = Router();

const createInvoiceSchema = z.object({
  jobId: z.string().min(1),
  discount: z.number().min(0).optional(),
});

const updateInvoiceSchema = z.object({
  discount: z.number().min(0).optional(),
  paid: z.number().min(0).optional(),
  status: z.enum(['Draft', 'Sent', 'PartiallyPaid', 'Paid']).optional(),
});

const sendInvoiceSchema = z.object({
  email: z.string().email().optional(),
});

// Get all invoices for a tenant
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { take, skip } = parsePagination(req.query);

    const invoices = await prisma.invoice.findMany({
      where: { tenantId: req.user!.tenantId },
      include: {
        job: {
          select: {
            id: true,
            vehicle: true,
            customer: true,
            laborHours: true,
            laborRate: true,
            customerRef: { select: { email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Create/Generate an invoice for a job
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(createInvoiceSchema, req.body, res);
    if (!body) return;

    const job = await prisma.job.findUnique({
      where: { id: body.jobId },
      include: { parts: true },
    });

    if (!job || job.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const existing = await prisma.invoice.findUnique({ where: { jobId: body.jobId } });
    if (existing) {
      res.status(400).json({ error: 'Invoice already exists for this job' });
      return;
    }

    // Subtotal: (Labor Hours * Rate) + Parts Cost
    const laborCost = job.laborHours * job.laborRate;
    const partsCost = job.parts.reduce((sum, p) => sum + p.cost, 0);
    const subtotal = laborCost + partsCost;

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: req.user!.tenantId,
        jobId: body.jobId,
        subtotal,
        discount: body.discount || 0,
        paid: 0,
        status: 'Draft',
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// Update an invoice (only discount / paid / status can change)
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(updateInvoiceSchema, req.body, res);
    if (!body) return;

    const existing = await prisma.invoice.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const invoice = await prisma.invoice.update({
      where: { id: existing.id },
      data: body,
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// Email the invoice payment link to the customer
router.post('/:id/send', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(sendInvoiceSchema, req.body, res);
    if (!body) return;

    const invoice = await prisma.invoice.findUnique({
      where: { id: String(req.params.id) },
      include: {
        tenant: true,
        job: { include: { customerRef: true } },
      },
    });

    if (!invoice || invoice.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Invoice not found' });
      return;
    }

    const email = body.email || invoice.job.customerRef?.email;
    if (!email) {
      res.status(400).json({
        error: 'No customer email on file. Provide an email address or add one to the customer record.',
      });
      return;
    }

    const total = invoice.subtotal - invoice.discount;
    const balance = total - invoice.paid;
    const link = `${config.appUrl}/pay/${invoice.id}`;

    await sendMail({
      to: email,
      subject: `Invoice from ${invoice.tenant.name} — ${invoice.job.vehicle}`,
      text:
        `Hi ${invoice.job.customer},\n\n` +
        `Your invoice from ${invoice.tenant.name} for the ${invoice.job.vehicle} is ready.\n\n` +
        `Total: $${total.toFixed(2)}\n` +
        `Balance due: $${balance.toFixed(2)}\n\n` +
        `View and pay online:\n${link}\n\nThank you!`,
    });

    if (invoice.status === 'Draft') {
      await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'Sent' } });
    }

    res.json({ message: `Invoice sent to ${email}` });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ error: 'Failed to send invoice' });
  }
});

export default router;
