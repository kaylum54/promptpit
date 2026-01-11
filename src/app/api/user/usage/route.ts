import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { getDebateLimit, canStartDebate, getDebatesRemaining } from '@/lib/pricing';
import type { PromptPitProfile } from '@/lib/types';

/**
 * Response type for the usage endpoint
 */
interface UsageResponse {
  tier: 'free' | 'pro';
  debatesThisMonth: number;
  debatesLimit: number;
  debatesRemaining: number;
  canStartDebate: boolean;
  monthResetDate: string;
  isGuest: boolean;
}

/**
 * GET /api/user/usage
 *
 * Returns the user's current usage and limits.
 * For guests (not logged in), returns free tier limits with 0 usage.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If no user (guest), return default free tier with 0 usage
    if (authError || !user) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      const guestResponse: UsageResponse = {
        tier: 'free',
        debatesThisMonth: 0,
        debatesLimit: getDebateLimit('free'),
        debatesRemaining: getDebatesRemaining(0, 'free'),
        canStartDebate: canStartDebate(0, 'free'),
        monthResetDate: nextMonth.toISOString(),
        isGuest: true,
      };

      return NextResponse.json(guestResponse);
    }

    // Fetch user's profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: fetchError } = await (supabase as any)
      .from('promptpit_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // If no profile exists, return defaults (profile should be created via ensure-profile)
    if (!profile) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      const newUserResponse: UsageResponse = {
        tier: 'free',
        debatesThisMonth: 0,
        debatesLimit: getDebateLimit('free'),
        debatesRemaining: getDebatesRemaining(0, 'free'),
        canStartDebate: canStartDebate(0, 'free'),
        monthResetDate: nextMonth.toISOString(),
        isGuest: false,
      };

      return NextResponse.json(newUserResponse);
    }

    const userProfile = profile as PromptPitProfile;
    let debatesThisMonth = userProfile.debates_this_month;
    let monthResetDate = userProfile.month_reset_date;

    // Check if month_reset_date has passed and reset if needed
    const now = new Date();
    const resetDate = new Date(monthResetDate);

    if (now >= resetDate) {
      // Reset debates count and set new reset date to first of next month
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      nextMonth.setHours(0, 0, 0, 0);

      debatesThisMonth = 0;
      monthResetDate = nextMonth.toISOString();

      // Use service role client to update the profile (bypasses RLS)
      const serviceClient = createServiceRoleClient();

      const { error: updateError } = await serviceClient
        .from('promptpit_profiles')
        .update({
          debates_this_month: 0,
          month_reset_date: monthResetDate,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error resetting monthly usage:', updateError);
        // Continue with stale data rather than failing the request
      }
    }

    const tier = userProfile.tier;
    const response: UsageResponse = {
      tier,
      debatesThisMonth,
      debatesLimit: getDebateLimit(tier),
      debatesRemaining: getDebatesRemaining(debatesThisMonth, tier),
      canStartDebate: canStartDebate(debatesThisMonth, tier),
      monthResetDate,
      isGuest: false,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/user/usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
