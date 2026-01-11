import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { PromptPitProfile } from '@/lib/types';

/**
 * POST /api/user/ensure-profile
 *
 * Creates a profile for the authenticated user if it doesn't exist.
 * Returns the user's profile data.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingProfile, error: fetchError } = await (supabase as any)
      .from('promptpit_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected if profile doesn't exist
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // If profile exists, return it
    if (existingProfile) {
      return NextResponse.json({
        profile: existingProfile as PromptPitProfile,
        created: false,
      });
    }

    // Create new profile with default values
    const now = new Date();
    const monthResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

    const newProfile = {
      id: user.id,
      tier: 'free',
      debates_this_month: 0,
      month_reset_date: monthResetDate,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: createdProfile, error: insertError } = await (supabase as any)
      .from('promptpit_profiles')
      .insert(newProfile)
      .select('*')
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: createdProfile as PromptPitProfile,
      created: true,
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/user/ensure-profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
