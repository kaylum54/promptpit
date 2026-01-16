import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * Lightweight profile check for middleware
 * Returns tier and role for a given user ID
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const supabase = createServiceRoleClient();

    const { data: profile, error } = await supabase
      .from('promptpit_profiles')
      .select('tier, role')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ tier: 'free', role: null });
    }

    return NextResponse.json({
      tier: profile?.tier || 'free',
      role: profile?.role || null,
    });
  } catch (error) {
    console.error('Profile check error:', error);
    return NextResponse.json({ tier: 'free', role: null });
  }
}
