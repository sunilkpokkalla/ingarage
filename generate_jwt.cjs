const crypto = require('crypto');
const secret = "3c968614a86688b8171b5aa71c3be23993cfb878ea298224d281416ca9b5471e2f36e714aff6ef4bc37affa61d359ceb";

function base64url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const header = {
  alg: 'HS256',
  typ: 'JWT'
};

const payload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10) // 10 years
};

const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));

const signature = crypto.createHmac('sha256', secret)
  .update(encodedHeader + '.' + encodedPayload)
  .digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

console.log(encodedHeader + '.' + encodedPayload + '.' + signature);
