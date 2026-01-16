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

  // Date helpers
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // ============================================
  // USER METRICS
  // ============================================

  // Get total users count
  const { count: totalUsers } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true });

  // Get pro subscribers count
  const { count: proSubscribers } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'pro');

  // Get free users count
  const freeUsers = (totalUsers || 0) - (proSubscribers || 0);

  // Get new users today
  const { count: newUsersToday } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get new users this week
  const { count: newUsersThisWeek } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // ============================================
  // USER ENGAGEMENT (DAU/WAU/MAU)
  // ============================================

  // Daily Active Users (users who created debates or PRDs today)
  const { data: dauDebates } = await supabase
    .from('debates')
    .select('user_id')
    .gte('created_at', today.toISOString())
    .not('user_id', 'is', null);

  const { data: dauPrds } = await supabase
    .from('prds')
    .select('user_id')
    .gte('updated_at', today.toISOString());

  const dauUserIds = new Set([
    ...(dauDebates || []).map(d => d.user_id),
    ...(dauPrds || []).map(p => p.user_id),
  ].filter(Boolean));
  const dau = dauUserIds.size;

  // Weekly Active Users
  const { data: wauDebates } = await supabase
    .from('debates')
    .select('user_id')
    .gte('created_at', weekAgo.toISOString())
    .not('user_id', 'is', null);

  const { data: wauPrds } = await supabase
    .from('prds')
    .select('user_id')
    .gte('updated_at', weekAgo.toISOString());

  const wauUserIds = new Set([
    ...(wauDebates || []).map(d => d.user_id),
    ...(wauPrds || []).map(p => p.user_id),
  ].filter(Boolean));
  const wau = wauUserIds.size;

  // Monthly Active Users
  const { data: mauDebates } = await supabase
    .from('debates')
    .select('user_id')
    .gte('created_at', monthAgo.toISOString())
    .not('user_id', 'is', null);

  const { data: mauPrds } = await supabase
    .from('prds')
    .select('user_id')
    .gte('updated_at', monthAgo.toISOString());

  const mauUserIds = new Set([
    ...(mauDebates || []).map(d => d.user_id),
    ...(mauPrds || []).map(p => p.user_id),
  ].filter(Boolean));
  const mau = mauUserIds.size;

  // ============================================
  // DEBATE METRICS
  // ============================================

  // Get total debates count
  const { count: totalDebates } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true });

  // Get debates today
  const { count: debatesToday } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get debates this week
  const { count: debatesThisWeek } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // ============================================
  // PRD METRICS (PromptPit-specific)
  // ============================================

  // Get total PRDs count
  const { count: totalPrds } = await supabase
    .from('prds')
    .select('*', { count: 'exact', head: true });

  // Get PRDs created today
  const { count: prdsToday } = await supabase
    .from('prds')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get PRDs created this week
  const { count: prdsThisWeek } = await supabase
    .from('prds')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  // Get completed PRDs (status = 'complete')
  const { count: completedPrds } = await supabase
    .from('prds')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'complete');

  // Average PRDs per user
  const avgPrdsPerUser = totalUsers && totalUsers > 0
    ? ((totalPrds || 0) / totalUsers).toFixed(1)
    : '0';

  // PRD completion rate
  const prdCompletionRate = totalPrds && totalPrds > 0
    ? (((completedPrds || 0) / totalPrds) * 100).toFixed(1)
    : '0';

  // Get PRD growth data (last 30 days)
  const { data: recentPrds } = await supabase
    .from('prds')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // ============================================
  // REVENUE METRICS
  // ============================================

  // Calculate MRR (Pro subscribers × $11/month - adjust price as needed)
  const PRO_PRICE = 11;
  const mrr = (proSubscribers || 0) * PRO_PRICE;

  // ARR
  const arr = mrr * 12;

  // ARPU (Average Revenue Per User)
  const arpu = totalUsers && totalUsers > 0
    ? (mrr / totalUsers).toFixed(2)
    : '0';

  // LTV estimate (assuming 12 month average lifespan)
  const avgLifespanMonths = 12;
  const ltv = proSubscribers && proSubscribers > 0
    ? (PRO_PRICE * avgLifespanMonths).toFixed(2)
    : '0';

  // Conversion rate
  const conversionRate = totalUsers && totalUsers > 0
    ? (((proSubscribers || 0) / totalUsers) * 100).toFixed(1)
    : '0';

  // New Pro subscribers this month
  const { count: newProThisMonth } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'pro')
    .gte('created_at', monthAgo.toISOString());

  // ============================================
  // CHART DATA
  // ============================================

  // Get user growth data (last 30 days)
  const { data: recentUsers } = await supabase
    .from('promptpit_profiles')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // Get debates per day (last 14 days)
  const { data: recentDebates } = await supabase
    .from('debates')
    .select('created_at')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: true });

  // ============================================
  // RECENT ACTIVITY
  // ============================================

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

  const { data: latestPrds } = await supabase
    .from('prds')
    .select('id, name, user_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return NextResponse.json({
    kpis: {
      totalUsers: totalUsers || 0,
      proSubscribers: proSubscribers || 0,
      freeUsers,
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      mrr,
      arr,
      arpu,
      ltv,
      conversionRate,
      newProThisMonth: newProThisMonth || 0,
      totalDebates: totalDebates || 0,
      debatesToday: debatesToday || 0,
      debatesThisWeek: debatesThisWeek || 0,
      totalPrds: totalPrds || 0,
      prdsToday: prdsToday || 0,
      prdsThisWeek: prdsThisWeek || 0,
      completedPrds: completedPrds || 0,
      avgPrdsPerUser,
      prdCompletionRate,
    },
    engagement: {
      dau,
      wau,
      mau,
      dauPercentOfTotal: totalUsers ? ((dau / totalUsers) * 100).toFixed(1) : '0',
      wauPercentOfTotal: totalUsers ? ((wau / totalUsers) * 100).toFixed(1) : '0',
    },
    charts: {
      userGrowth: recentUsers || [],
      debatesPerDay: recentDebates || [],
      prdsPerDay: recentPrds || [],
    },
    recentActivity: {
      users: recentProfiles || [],
      debates: latestDebates || [],
      prds: latestPrds || [],
    },
  });
}
