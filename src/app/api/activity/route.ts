/**
 * Activity API Route
 * GET - Fetch user's activity log
 * POST - Log a new activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

type ActivityType = 'created' | 'updated' | 'status_changed' | 'commented' | 'exported' | 'shared' | 'archived' | 'debate' | 'chat';
type EntityType = 'prd' | 'debate' | 'chat' | 'team';

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  details?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

// GET - Fetch activity log
export async function GET(request: NextRequest) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServiceRoleClient();

    // Get user profile for display name
    const { data: profile } = await supabase
      .from('promptpit_profiles')
      .select('display_name')
      .eq('id', auth0User.sub)
      .single();

    const userName = profile?.display_name || 'You';

    // Build query
    let query = supabase
      .from('promptpit_activity_log')
      .select('*')
      .eq('user_id', auth0User.sub)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if provided
    if (type && type !== 'all') {
      query = query.eq('activity_type', type);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
    }

    // Transform to frontend format
    const formattedActivities: Activity[] = (activities || []).map((activity: {
      id: string;
      activity_type: string;
      entity_id?: string;
      entity_name?: string;
      details?: string;
      old_value?: string;
      new_value?: string;
      created_at: string;
    }) => ({
      id: activity.id,
      type: activity.activity_type as ActivityType,
      user: {
        name: userName,
      },
      project: activity.entity_name ? {
        id: activity.entity_id,
        name: activity.entity_name,
      } : undefined,
      details: activity.details,
      oldValue: activity.old_value,
      newValue: activity.new_value,
      timestamp: activity.created_at,
    }));

    // Get total count for pagination
    const { count } = await supabase
      .from('promptpit_activity_log')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', auth0User.sub);

    return NextResponse.json({
      activities: formattedActivities,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
    });
  } catch (error) {
    console.error('Activity GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Log a new activity
export async function POST(request: NextRequest) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      activity_type,
      entity_type,
      entity_id,
      entity_name,
      details,
      old_value,
      new_value,
      metadata,
    } = body;

    if (!activity_type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: activity, error } = await supabase
      .from('promptpit_activity_log')
      .insert({
        user_id: auth0User.sub,
        activity_type,
        entity_type,
        entity_id,
        entity_name,
        details,
        old_value,
        new_value,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging activity:', error);
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
    }

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Activity POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
