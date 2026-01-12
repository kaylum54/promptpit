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
  const winner = searchParams.get('winner') || '';

  const supabase = createServiceRoleClient();
  const offset = (page - 1) * limit;

  // Get total count
  let countQuery = supabase.from('debates').select('*', { count: 'exact', head: true });
  if (search) {
    countQuery = countQuery.ilike('prompt', '%' + search + '%');
  }
  const { count } = await countQuery;

  // Get debates with pagination
  let dataQuery = supabase
    .from('debates')
    .select('id, prompt, user_id, verdict, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    dataQuery = dataQuery.ilike('prompt', '%' + search + '%');
  }

  const { data: debates, error } = await dataQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get user emails for debates
  type DebateRow = { id: string; prompt: string; user_id: string | null; verdict: { winner?: string } | null; created_at: string };
  const userIds = Array.from(new Set((debates as DebateRow[] | null)?.filter((d: DebateRow) => d.user_id).map((d: DebateRow) => d.user_id) || [])) as string[];
  const userMap: Record<string, string> = {};

  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('promptpit_profiles')
      .select('id, email')
      .in('id', userIds);
    users?.forEach((u: { id: string; email: string | null }) => { userMap[u.id] = u.email || 'Unknown'; });
  }

  // Add user emails and extract winner
  const debatesWithUsers = (debates as DebateRow[] | null)?.map((d: DebateRow) => ({
    ...d,
    user_email: d.user_id ? userMap[d.user_id] || 'Unknown' : 'Guest',
    winner: d.verdict?.winner || null,
  }));

  // Filter by winner if specified
  let filteredDebates = debatesWithUsers;
  if (winner && winner !== 'all') {
    filteredDebates = debatesWithUsers?.filter((d: { winner: string | null }) => d.winner === winner);
  }

  // Get stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: debatesToday } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: debatesThisWeek } = await supabase
    .from('debates')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  return NextResponse.json({
    debates: filteredDebates,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
    stats: {
      total: count || 0,
      today: debatesToday || 0,
      thisWeek: debatesThisWeek || 0,
    },
  });
}
