import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { Resend } from 'resend';

export const runtime = 'edge';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.APP_URL || 'https://ingarage.app';

export async function POST(req: NextRequest) {
  try {
    const { type, id, customerEmail, customerName, vehicle } = await req.json();

    if (!type || !id || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!resend) {
      return NextResponse.json(
        { error: 'Email sending is not configured: set RESEND_API_KEY in the deployment environment.' },
        { status: 501 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller?.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const tenantId = caller.user.user_metadata?.tenant_id;
    const tenantName = caller.user.user_metadata?.tenant_name || 'Your Auto Shop';

    if (!tenantId) {
      return NextResponse.json({ error: 'No shop linked to session.' }, { status: 400 });
    }

    let subject = '';
    let link = '';
    let actionText = '';

    if (type === 'estimate') {
      subject = `Repair Estimate for your ${vehicle || 'Vehicle'}`;
      link = `${APP_URL}/estimate/${id}`;
      actionText = 'Review Estimate';
    } else if (type === 'invoice') {
      subject = `Invoice for your ${vehicle || 'Vehicle'} Repairs`;
      link = `${APP_URL}/pay/${id}`;
      actionText = 'View & Pay Invoice';
    } else {
      return NextResponse.json({ error: 'Invalid notification type.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: `${tenantName} <support@ingarage.us>`,
      to: customerEmail,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hello ${customerName || 'Customer'},</h2>
          <p>${tenantName} has prepared a ${type} for your vehicle.</p>
          <div style="margin: 30px 0;">
            <a href="${link}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              ${actionText}
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If you have any questions, please contact the shop directly.</p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Notification sent successfully', id: data?.id });
  } catch (error: any) {
    console.error('Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
