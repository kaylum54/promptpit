import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

// Event row type
interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  guest_id: string;
  properties: Record<string, unknown> | null;
  page_url: string | null;
  created_at: string;
}

interface EventCount {
  event_name: string;
  count: number;
}

interface EventOverTime {
  date: string;
  count: number;
}

/**
 * GET /api/admin/analytics - Get analytics event statistics
 * Query params:
 *   - event_name: Filter by specific event type
 *   - date_range: 'today' | '7days' | '30days' (default: '7days')
 */
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const eventNameFilter = searchParams.get('event_name') || '';
  const dateRange = searchParams.get('date_range') || '7days';

  const supabase = createServiceRoleClient();

  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '7days':
    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      break;
  }

  try {
    // 1. Get event counts by type
    let eventCountsQuery = supabase
      .from('analytics_events')
      .select('event_name')
      .gte('created_at', startDate.toISOString());

    if (eventNameFilter) {
      eventCountsQuery = eventCountsQuery.eq('event_name', eventNameFilter);
    }

    const { data: allEvents, error: eventsError } = await eventCountsQuery;

    if (eventsError) {
      // Table might not exist yet
      if (eventsError.code === '42P01') {
        return NextResponse.json({
          eventCounts: [],
          eventsOverTime: [],
          recentEvents: [],
          message: 'Analytics table not yet created. Events will appear after the first tracking event.',
        });
      }
      throw eventsError;
    }

    // Count events by name
    const eventCountsMap: Record<string, number> = {};
    for (const event of allEvents || []) {
      const name = event.event_name;
      eventCountsMap[name] = (eventCountsMap[name] || 0) + 1;
    }

    const eventCounts: EventCount[] = Object.entries(eventCountsMap)
      .map(([event_name, count]) => ({ event_name, count }))
      .sort((a, b) => b.count - a.count);

    // 2. Get events over time (daily breakdown)
    let eventsOverTimeQuery = supabase
      .from('analytics_events')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (eventNameFilter) {
      eventsOverTimeQuery = eventsOverTimeQuery.eq('event_name', eventNameFilter);
    }

    const { data: timeEvents, error: timeError } = await eventsOverTimeQuery;

    if (timeError) {
      throw timeError;
    }

    // Group by date
    const dateCountsMap: Record<string, number> = {};

    // Initialize all dates in range
    const numDays = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : 30;
    for (let i = 0; i < numDays; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (numDays - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateCountsMap[dateStr] = 0;
    }

    // Count events per day
    for (const event of timeEvents || []) {
      const dateStr = event.created_at.split('T')[0];
      if (dateCountsMap[dateStr] !== undefined) {
        dateCountsMap[dateStr]++;
      }
    }

    const eventsOverTime: EventOverTime[] = Object.entries(dateCountsMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Get recent events (last 20)
    let recentEventsQuery = supabase
      .from('analytics_events')
      .select('id, event_name, user_id, guest_id, page_url, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    if (eventNameFilter) {
      recentEventsQuery = recentEventsQuery.eq('event_name', eventNameFilter);
    }

    const { data: recentEvents, error: recentError } = await recentEventsQuery;

    if (recentError) {
      throw recentError;
    }

    // 4. Get unique event types for filter dropdown
    const { data: uniqueEvents } = await supabase
      .from('analytics_events')
      .select('event_name')
      .limit(1000);

    const uniqueEventTypes = [...new Set((uniqueEvents || []).map(e => e.event_name))].sort();

    return NextResponse.json({
      eventCounts,
      eventsOverTime,
      recentEvents: (recentEvents as AnalyticsEvent[]) || [],
      uniqueEventTypes,
      dateRange,
      eventNameFilter: eventNameFilter || null,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
