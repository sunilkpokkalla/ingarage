# InGarage

Multi-tenant shop management for auto-repair / collision shops: jobs, labor tracking, parts, invoices, customers, documents, and online payments via Stripe.

- **Frontend**: React 19 + TypeScript + Vite + Tailwind 4 (`src/`)
- **Backend**: Express + Prisma + PostgreSQL (Supabase) (`server/`)

## One-time setup after the July 2026 security overhaul

The following steps are REQUIRED before the app will run again:

### 1. Rotate the database password
The old password was committed to git in plain text — treat it as compromised.
In Supabase: **Settings → Database → Reset database password**, then update
`DATABASE_URL` and `DIRECT_URL` in `server/.env`.
**Important:** if the password contains special characters (`@`, `#`, etc.), URL-encode them (`@` → `%40`).

### 2. Push the new schema and install server deps
New models were added (Customer, Document, password-reset fields, indexes):

```bash
cd server
npm install          # picks up new deps: zod, nodemailer (bcrypt was removed)
npx prisma db push   # applies schema changes to Supabase
npx prisma generate
```

### 3. Re-enter Stripe keys in Settings
`ENCRYPTION_KEY` is now a real secret (it previously fell back to a value in
source code). Any Stripe secret keys saved before this change can no longer be
decrypted — re-enter them once in **Settings → Payment Gateway**.

### 4. (Optional) Configure SMTP
Password reset, team invites, and invoice emails send via SMTP when
`SMTP_HOST` etc. are set in `server/.env`. Until then, emails are printed to
the server console so you can copy the links during development.

## Development

```bash
# API (port 3001)
cd server && npm run dev

# Frontend (port 5173)
npm run dev
```

## Production

```bash
# API
cd server && npm run build && npm start

# Frontend
npm run build   # outputs to dist/
```

Set these in the server's production environment: `DATABASE_URL`, `DIRECT_URL`,
`JWT_SECRET`, `ENCRYPTION_KEY`, `CORS_ORIGIN` (your frontend URL), `APP_URL`
(your frontend URL, used in emailed links), `NODE_ENV=production`, and the
`SMTP_*` variables. For the frontend, set `VITE_API_URL` to your API URL
(see `.env.example`).

## Tests

```bash
cd server && npm test
```

## Security notes

- JWT secret and AES-256 encryption key are required env vars — the server exits at boot if they're missing (no insecure fallbacks).
- CORS is restricted to `CORS_ORIGIN`; security headers and per-IP rate limiting (stricter on `/api/auth/*`) are applied.
- All route input is validated with zod; invoice/job updates only accept whitelisted fields.
- Payment settings can only be modified by OWNER; invites by OWNER/MANAGER.
- Stripe webhooks are signature-verified per tenant and idempotent (retries can't double-count payments).
- Documents are stored in Postgres (10 MB/file cap) and are tenant-scoped like everything else.
