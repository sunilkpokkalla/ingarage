import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-unit-tests-only';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-for-unit-tests';

import { validate, parsePagination } from '../middleware/validate';

function mockRes() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    status(code: number) { this.statusCode = code; return this; },
    json(payload: unknown) { this.body = payload; return this; },
  };
  return res;
}

test('validate returns parsed data on success', () => {
  const res = mockRes();
  const schema = z.object({ email: z.string().email() });
  const result = validate(schema, { email: 'a@b.com', extra: 'stripped' }, res);
  assert.deepEqual(result, { email: 'a@b.com' });
  assert.equal(res.statusCode, 200);
});

test('validate sends 400 with details on failure', () => {
  const res = mockRes();
  const schema = z.object({ password: z.string().min(8) });
  const result = validate(schema, { password: 'short' }, res);
  assert.equal(result, null);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'Validation failed');
  assert.ok(Array.isArray(res.body.details));
});

test('parsePagination applies defaults and bounds', () => {
  assert.deepEqual(parsePagination({}), { take: 100, skip: 0 });
  assert.deepEqual(parsePagination({ take: '50', skip: '10' }), { take: 50, skip: 10 });
  assert.deepEqual(parsePagination({ take: '99999' }), { take: 200, skip: 0 });
  assert.deepEqual(parsePagination({ take: '-5', skip: '-1' }), { take: 1, skip: 0 });
});
