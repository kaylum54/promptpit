import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * POST /api/auth/check-email
 *
 * Checks if an email address is already registered.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Use service role client to check promptpit_profiles table
    const supabase = createServiceRoleClient();

    // Check if email exists in promptpit_profiles (created on signup)
    const { data, error } = await supabase
      .from('promptpit_profiles')
      .select('id')
      .ilike('email', email)
      .limit(1);

    if (error) {
      console.error('Error checking email:', error);
      return NextResponse.json(
        { error: 'Failed to check email' },
        { status: 500 }
      );
    }

    const exists = data && data.length > 0;

    return NextResponse.json({ exists });

  } catch (error) {
    console.error('Error in POST /api/auth/check-email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
