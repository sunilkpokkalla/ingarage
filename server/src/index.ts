import express from 'express';
import cors from 'cors';
import { config } from './config';
import { securityHeaders, rateLimit } from './middleware/security';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import timeRoutes from './routes/time';
import partsRoutes from './routes/parts';
import invoicesRoutes from './routes/invoices';
import settingsRoutes from './routes/settings';
import publicRoutes from './routes/public';
import webhookRoutes from './routes/webhooks';
import statsRoutes from './routes/stats';
import customersRoutes from './routes/customers';
import documentsRoutes from './routes/documents';
import usersRoutes from './routes/users';

const app = express();

// Behind a reverse proxy (Render, Railway, Fly, nginx...) trust X-Forwarded-For
// so rate limiting keys on the real client IP.
app.set('trust proxy', 1);

app.use(securityHeaders);

// CORS restricted to configured origins (comma-separated in CORS_ORIGIN)
app.use(cors({ origin: config.corsOrigins }));

// Webhooks must be mounted BEFORE express.json() because Stripe needs the raw body
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRoutes);

// 15mb limit so base64 document uploads (max 10MB decoded) fit
app.use(express.json({ limit: '15mb' }));

// Rate limits: strict on auth endpoints, generous everywhere else
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, message: 'Too many attempts, please try again later' });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 300 });

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter);
app.use('/api/jobs', jobRoutes);
app.use('/api/time', timeRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/users', usersRoutes);

// Basic healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InGarage API is running' });
});

app.listen(config.port, () => {
  console.log(`InGarage API listening on port ${config.port}`);
});
