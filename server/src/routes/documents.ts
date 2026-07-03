import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { validate, parsePagination } from '../middleware/validate';

const router = Router();

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const uploadSchema = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  dataBase64: z.string().min(1),
  jobId: z.string().nullable().optional(),
});

// List document metadata (never the file bytes)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { take, skip } = parsePagination(req.query);
    const jobId = typeof req.query.jobId === 'string' ? req.query.jobId : undefined;

    const documents = await prisma.document.findMany({
      where: { tenantId: req.user!.tenantId, ...(jobId ? { jobId } : {}) },
      select: {
        id: true,
        name: true,
        mimeType: true,
        size: true,
        jobId: true,
        createdAt: true,
        job: { select: { vehicle: true, customer: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Upload a document (base64 JSON body)
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = validate(uploadSchema, req.body, res);
    if (!body) return;

    let data: Buffer;
    try {
      data = Buffer.from(body.dataBase64, 'base64');
    } catch {
      res.status(400).json({ error: 'Invalid base64 data' });
      return;
    }

    if (data.length === 0 || data.length > MAX_FILE_BYTES) {
      res.status(400).json({ error: `File must be between 1 byte and ${MAX_FILE_BYTES / 1024 / 1024} MB` });
      return;
    }

    if (body.jobId) {
      const job = await prisma.job.findUnique({ where: { id: body.jobId } });
      if (!job || job.tenantId !== req.user!.tenantId) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
    }

    const doc = await prisma.document.create({
      data: {
        tenantId: req.user!.tenantId,
        jobId: body.jobId || null,
        name: body.name,
        mimeType: body.mimeType,
        size: data.length,
        data: new Uint8Array(data),
        uploadedById: req.user!.id,
      },
      select: { id: true, name: true, mimeType: true, size: true, jobId: true, createdAt: true },
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Download a document
router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: String(req.params.id) } });
    if (!doc || doc.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    res.setHeader('Content-Type', doc.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${doc.name.replace(/"/g, '')}"`);
    res.send(Buffer.from(doc.data));
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Delete a document
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: String(req.params.id) },
      select: { id: true, tenantId: true },
    });
    if (!doc || doc.tenantId !== req.user!.tenantId) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }

    await prisma.document.delete({ where: { id: doc.id } });
    res.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
