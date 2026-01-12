import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const tier = searchParams.get('tier') || '';
  const role = searchParams.get('role') || '';

  const supabase = createServiceRoleClient();
  const offset = (page - 1) * limit;

  // Build count query
  let countQuery = supabase
    .from('promptpit_profiles')
    .select('*', { count: 'exact', head: true });

  if (search) {
    countQuery = countQuery.ilike('email', `%${search}%`);
  }
  if (tier && tier !== 'all') {
    countQuery = countQuery.eq('tier', tier);
  }
  if (role && role !== 'all') {
    countQuery = countQuery.eq('role', role);
  }

  const { count } = await countQuery;

  // Build data query
  let dataQuery = supabase
    .from('promptpit_profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    dataQuery = dataQuery.ilike('email', `%${search}%`);
  }
  if (tier && tier !== 'all') {
    dataQuery = dataQuery.eq('tier', tier);
  }
  if (role && role !== 'all') {
    dataQuery = dataQuery.eq('role', role);
  }

  const { data: users, error } = await dataQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get debate counts for each user
  type UserRow = { id: string; email: string | null; tier: string; role: string | null; created_at: string; debates_this_month: number };
  const userIds = (users as UserRow[] | null)?.map((u: UserRow) => u.id) || [];
  const debateCountMap: Record<string, number> = {};

  if (userIds.length > 0) {
    const { data: debateCounts } = await supabase
      .from('debates')
      .select('user_id')
      .in('user_id', userIds);

    debateCounts?.forEach((d: { user_id: string | null }) => {
      if (d.user_id) {
        debateCountMap[d.user_id] = (debateCountMap[d.user_id] || 0) + 1;
      }
    });
  }

  // Add debate counts to users
  const usersWithCounts = (users as UserRow[] | null)?.map((user: UserRow) => ({
    ...user,
    debate_count: debateCountMap[user.id] || 0,
  }));

  return NextResponse.json({
    users: usersWithCounts,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
