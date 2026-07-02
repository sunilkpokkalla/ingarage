import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import timeRoutes from './routes/time';
import partsRoutes from './routes/parts';
import invoicesRoutes from './routes/invoices';
import settingsRoutes from './routes/settings';
import publicRoutes from './routes/public';
import webhookRoutes from './routes/webhooks';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Webhooks must be mounted BEFORE express.json() because Stripe needs the raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/public', publicRoutes);

// Basic healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CollisionPro API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
