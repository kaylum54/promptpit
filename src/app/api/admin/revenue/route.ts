import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const supabase = createServiceRoleClient();
  const PRO_PRICE = 9;

  // Get pro subscribers
  const { data: proUsers, count: proCount } = await supabase
    .from('promptpit_profiles')
    .select('id, email, tier, stripe_customer_id, created_at', { count: 'exact' })
    .eq('tier', 'pro');

  // Calculate MRR
  const mrr = (proCount || 0) * PRO_PRICE;

  // Get subscribers who joined this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const { count: newThisMonth } = await supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'pro')
    .gte('created_at', monthStart.toISOString());

  return NextResponse.json({
    kpis: {
      mrr,
      activeSubscriptions: proCount || 0,
      newThisMonth: newThisMonth || 0,
      pricePerUser: PRO_PRICE,
    },
    subscribers: proUsers || [],
  });
}
