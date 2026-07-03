import dotenv from 'dotenv';
dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `FATAL: Missing required environment variable ${name}. ` +
      `Copy .env.example to .env and fill it in.`
    );
    process.exit(1);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 3001),
  jwtSecret: required('JWT_SECRET'),
  encryptionKey: required('ENCRYPTION_KEY'),
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  appUrl: process.env.APP_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'InGarage <no-reply@ingarage.app>',
  },
  isProduction: process.env.NODE_ENV === 'production',
};
