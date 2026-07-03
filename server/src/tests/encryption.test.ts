import test from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-unit-tests-only';
process.env.ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'test-encryption-key-for-unit-tests';

import { encrypt, decrypt } from '../utils/encryption';

test('encrypt/decrypt round-trips a Stripe-style secret', () => {
  const secret = 'sk_test_51Abc123XyZ';
  const encrypted = encrypt(secret);
  assert.notEqual(encrypted, secret);
  assert.match(encrypted, /^[0-9a-f]{32}:[0-9a-f]+$/);
  assert.equal(decrypt(encrypted), secret);
});

test('encrypting the same value twice produces different ciphertexts (random IV)', () => {
  const secret = 'whsec_abcdef';
  assert.notEqual(encrypt(secret), encrypt(secret));
});

test('decrypting tampered ciphertext throws', () => {
  const encrypted = encrypt('hello');
  const [iv, data] = encrypted.split(':');
  const tampered = `${iv}:${data.slice(0, -2)}ff`;
  assert.throws(() => decrypt(tampered));
});
