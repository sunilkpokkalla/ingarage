import { config } from '../config';

export interface Mail {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: unknown | null | undefined;

function getTransporter(): { sendMail: (opts: object) => Promise<unknown> } | null {
  if (transporter !== undefined) {
    return transporter as { sendMail: (opts: object) => Promise<unknown> } | null;
  }

  if (!config.smtp.host) {
    transporter = null;
    return null;
  }

  try {
    // Optional dependency: `npm install nodemailer` to enable real sending.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require('nodemailer');
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
  } catch {
    console.warn(
      '[mailer] SMTP_HOST is set but nodemailer is not installed. ' +
      'Run `npm install nodemailer` in the server folder. Falling back to console logging.'
    );
    transporter = null;
  }
  return transporter as { sendMail: (opts: object) => Promise<unknown> } | null;
}

/**
 * Sends an email via SMTP if configured; otherwise logs it to the console
 * so development flows (password reset, invites) still work.
 */
export async function sendMail(mail: Mail): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(
      `\n[mailer] (console fallback — configure SMTP_* in .env to send for real)\n` +
      `  To:      ${mail.to}\n` +
      `  Subject: ${mail.subject}\n` +
      `  Body:    ${mail.text}\n`
    );
    return;
  }

  await t.sendMail({
    from: config.smtp.from,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
  });
}
