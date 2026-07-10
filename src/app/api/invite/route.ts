import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
import { createClient } from '@supabase/supabase-js';

// We need the service role key to bypass RLS and use the auth admin API to invite users.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { email, name, role } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    if (!supabaseServiceKey) {
      // In development mode, if they haven't set up the service role key, just mock the success so they can test the UI
      return NextResponse.json({ 
        message: 'Simulated success because SUPABASE_SERVICE_ROLE_KEY is not set.',
        user: { email, name, role }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Invite the user via Supabase Auth Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { name, role }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insert the user into the public.User table
    // The user id from authData.user.id is used to link them
    const { error: dbError } = await supabaseAdmin.from('User').insert([{
      id: authData.user.id,
      email,
      name,
      role,
      password: 'SSO_OR_MAGIC_LINK' // Not used when using Supabase Auth, just fulfilling schema
    }]);

    if (dbError) {
      // If the user already exists in the table, that's fine, we invited them.
      if (dbError.code !== '23505') { // 23505 is unique violation
        console.error('Failed to insert user profile:', dbError);
      }
    }

    return NextResponse.json({ message: 'User invited successfully.', user: authData.user });
  } catch (error: any) {
    console.error('Invite Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
