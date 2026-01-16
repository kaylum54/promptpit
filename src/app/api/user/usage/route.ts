import { NextResponse } from 'next/server';
import { getAuth0User, getUserProfile } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getDebateLimit, canStartDebate, getDebatesRemaining } from '@/lib/pricing';
import type { PromptPitProfile } from '@/lib/types';

/**
 * Response type for the usage endpoint
 */
interface UsageResponse {
  tier: 'guest' | 'free' | 'pro';
  debatesThisMonth: number;
  debatesLimit: number;
  debatesRemaining: number;
  canStartDebate: boolean;
  monthResetDate: string;
  isGuest: boolean;
  email?: string;
  displayName?: string;
  role?: string;
}

/**
 * GET /api/user/usage
 *
 * Returns the user's current usage and limits.
 * For guests (not logged in), returns free tier limits with 0 usage.
 * For admins (role='admin'), returns unlimited usage with pro tier benefits.
 */
export async function GET() {
  try {
    // Get current Auth0 user
    const auth0User = await getAuth0User();

    // If no user (guest), return guest tier with 1 debate limit
    if (!auth0User) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      const guestResponse: UsageResponse = {
        tier: 'guest',
        debatesThisMonth: 0,
        debatesLimit: getDebateLimit('guest'),
        debatesRemaining: getDebatesRemaining(0, 'guest'),
        canStartDebate: canStartDebate(0, 'guest'),
        monthResetDate: nextMonth.toISOString(),
        isGuest: true,
      };

      return NextResponse.json(guestResponse);
    }

    // Fetch user's profile from Supabase
    const profile = await getUserProfile(auth0User.sub);

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
        email: auth0User.email,
      };

      return NextResponse.json(newUserResponse);
    }

    const userProfile = profile as PromptPitProfile;
    let debatesThisMonth = userProfile.debates_this_month;
    let monthResetDate = userProfile.month_reset_date;

    // Check if user is admin - admins get unlimited access
    const isAdmin = userProfile.role === 'admin';

    if (isAdmin) {
      // Admins get unlimited usage with pro tier benefits
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      nextMonth.setDate(1);
      nextMonth.setHours(0, 0, 0, 0);

      const adminResponse: UsageResponse = {
        tier: 'pro',
        debatesThisMonth: 0,
        debatesLimit: Infinity,
        debatesRemaining: Infinity,
        canStartDebate: true,
        monthResetDate: nextMonth.toISOString(),
        isGuest: false,
        email: auth0User.email,
        displayName: userProfile.display_name || undefined,
        role: 'admin',
      };

      return NextResponse.json(adminResponse);
    }

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
        .eq('id', auth0User.sub);

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
      email: auth0User.email,
      displayName: userProfile.display_name || undefined,
      role: userProfile.role || undefined,
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
