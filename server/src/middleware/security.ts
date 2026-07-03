import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Sets common security headers (lightweight replacement for helmet).
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (config.isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * Simple fixed-window, in-memory rate limiter.
 * Suitable for a single-process deployment; swap for a Redis-backed
 * limiter if you scale to multiple instances.
 */
export function rateLimit(opts: RateLimitOptions) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
  }, opts.windowMs);
  cleanup.unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(key, entry);
    }
    entry.count++;

    res.setHeader('X-RateLimit-Limit', String(opts.max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, opts.max - entry.count)));

    if (entry.count > opts.max) {
      res.status(429).json({ error: opts.message || 'Too many requests, please try again later' });
      return;
    }
    next();
  };
}
