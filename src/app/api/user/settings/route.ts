/**
 * User Settings API Route
 * GET - Fetch user settings
 * PATCH - Update user settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

interface UserSettings {
  display_name: string | null;
  email: string | null;
  timezone: string;
  language: string;
  notify_weekly_digest: boolean;
  notify_prd_complete: boolean;
  notify_team_updates: boolean;
  notify_marketing: boolean;
  // Read-only fields
  tier: string;
  role: string;
  subscription_status: string | null;
  subscription_period_end: string | null;
  created_at: string;
}

// GET - Fetch user settings
export async function GET() {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: profile, error } = await supabase
      .from('promptpit_profiles')
      .select(`
        display_name,
        email,
        timezone,
        language,
        notify_weekly_digest,
        notify_prd_complete,
        notify_team_updates,
        notify_marketing,
        tier,
        role,
        subscription_status,
        subscription_period_end,
        created_at
      `)
      .eq('id', auth0User.sub)
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Get email from auth if not in profile
    const settings: UserSettings = {
      display_name: profile.display_name || null,
      email: profile.email || auth0User.email || null,
      timezone: profile.timezone || 'UTC',
      language: profile.language || 'en',
      notify_weekly_digest: profile.notify_weekly_digest ?? true,
      notify_prd_complete: profile.notify_prd_complete ?? true,
      notify_team_updates: profile.notify_team_updates ?? true,
      notify_marketing: profile.notify_marketing ?? false,
      tier: profile.tier || 'free',
      role: profile.role || 'user',
      subscription_status: profile.subscription_status,
      subscription_period_end: profile.subscription_period_end,
      created_at: profile.created_at,
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = [
      'display_name',
      'timezone',
      'language',
      'notify_weekly_digest',
      'notify_prd_complete',
      'notify_team_updates',
      'notify_marketing',
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from('promptpit_profiles')
      .update(updates)
      .eq('id', auth0User.sub);

    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true, updated: Object.keys(updates) });
  } catch (error) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
