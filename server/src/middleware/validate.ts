import { Response } from 'express';
import { ZodType } from 'zod';

/**
 * Validates `data` against a zod schema. On failure, sends a 400 response
 * and returns null; on success, returns the parsed (typed, stripped) data.
 *
 * Usage:
 *   const body = validate(schema, req.body, res);
 *   if (!body) return;
 */
export function validate<T>(schema: ZodType<T>, data: unknown, res: Response): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`),
    });
    return null;
  }
  return result.data;
}

/**
 * Parses ?take= and ?skip= query params with sane bounds.
 */
export function parsePagination(query: Record<string, unknown>): { take: number; skip: number } {
  const take = Math.min(Math.max(Number(query.take) || 100, 1), 200);
  const skip = Math.max(Number(query.skip) || 0, 0);
  return { take, skip };
}
