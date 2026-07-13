import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { createClient } from '@supabase/supabase-js';

// The service role key is required to use the auth admin invite API.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Team invites are not configured: set SUPABASE_SERVICE_ROLE_KEY in the deployment environment.' },
        { status: 501 }
      );
    }

    // The invite must be scoped to the caller's shop, so verify the caller's
    // session token and read the tenant from it — never trust a client-sent tenant.
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller?.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const tenantId = caller.user.user_metadata?.tenant_id;
    const tenantName = caller.user.user_metadata?.tenant_name;
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Your session has no shop linked. Sign out and back in, then retry.' },
        { status: 400 }
      );
    }

    // The on_auth_user_created DB trigger reads tenant_id/role/full_name from
    // this metadata and creates the public."User" row automatically.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name, role, tenant_id: tenantId, tenant_name: tenantName }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User invited successfully.', user: authData.user });
  } catch (error: any) {
    console.error('Invite Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
