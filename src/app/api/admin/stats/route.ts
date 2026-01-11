import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  // Verify admin access
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = createServiceRoleClient();

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true });

  // Get pro subscribers count
  const { count: proSubscribers } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'pro');

  // Get total debates count
  const { count: totalDebates } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true });

  // Get debates today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: debatesToday } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get debates this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: debatesThisWeek } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // Calculate MRR (Pro subscribers × $9/month - adjust price as needed)
  const PRO_PRICE = 9;
  const mrr = (proSubscribers || 0) * PRO_PRICE;

  // Get user growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: recentUsers } = await supabase
    .from('promptpit_profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Get debates per day (last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: recentDebates } = await supabase
    .from('debates')
    .select('created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Get recent activity (last 10 events - new users and debates)
  const { data: recentProfiles } = await supabase
    .from('promptpit_profiles')
    .select('id, email, tier, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: latestDebates } = await supabase
    .from('debates')
    .select('id, prompt, user_id, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    kpis: {
      totalUsers: totalUsers || 0,
      proSubscribers: proSubscribers || 0,
      mrr,
      totalDebates: totalDebates || 0,
      debatesToday: debatesToday || 0,
      debatesThisWeek: debatesThisWeek || 0,
    },
    charts: {
      userGrowth: recentUsers || [],
      debatesPerDay: recentDebates || [],
    },
    recentActivity: {
      users: recentProfiles || [],
      debates: latestDebates || [],
    },
  });
}
