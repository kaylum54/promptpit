import { createServiceRoleClient } from './supabase';

export interface FreeTierLimits {
  canCreate: boolean;
  used: number;
  limit: number;
  resetDate: Date | null;
}

export async function checkFreeTierLimit(userId: string | null): Promise<FreeTierLimits> {
  if (!userId) {
    // Not logged in - can create 1, will prompt to sign up after
    return { canCreate: true, used: 0, limit: 1, resetDate: null };
  }

  const supabase = createServiceRoleClient();

  // Get user tier from promptpit_profiles
  const { data: profile } = await supabase
    .from('promptpit_profiles')
    .select('tier, role')
    .eq('id', userId)
    .single();

  // Pro users or admins have unlimited access
  if (profile?.tier === 'pro' || profile?.role === 'admin') {
    return { canCreate: true, used: 0, limit: Infinity, resetDate: null };
  }

  // Count PRDs created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('prds')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());

  const used = count || 0;
  const limit = 1; // Free tier: 1 PRD per month

  // Calculate reset date (first of next month)
  const resetDate = new Date(startOfMonth);
  resetDate.setMonth(resetDate.getMonth() + 1);

  return {
    canCreate: used < limit,
    used,
    limit,
    resetDate,
  };
}
