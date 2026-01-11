import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { MODELS, type ModelKey } from '@/lib/models';

interface ModelWinStats {
  name: string;
  key: ModelKey;
  color: string;
  wins: number;
  winRate: number;
}

interface TimeSeriesPoint {
  date: string;
  count: number;
}

interface AnalyticsResponse {
  overview: {
    totalDebates: number;
    debatesThisMonth: number;
    debatesThisWeek: number;
    totalReactionsReceived: number;
    sharedDebates: number;
  };
  modelWins: ModelWinStats[];
  favoriteModel: string | null;
  debatesOverTime: TimeSeriesPoint[];
  reactionBreakdown: {
    like: number;
    fire: number;
    think: number;
    laugh: number;
  };
}

/**
 * GET /api/analytics - Get user analytics and statistics
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Get all user's debates
    const { data: debates, error: debatesError } = await serviceClient
      .from('debates')
      .select('id, verdict, created_at, is_public, share_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (debatesError) {
      console.error('Error fetching debates for analytics:', debatesError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Calculate overview stats
    let debatesThisMonth = 0;
    let debatesThisWeek = 0;
    let sharedDebates = 0;

    // Calculate model wins
    const modelKeys = Object.keys(MODELS) as ModelKey[];
    const modelWinCounts: Record<string, number> = {};
    for (const key of modelKeys) {
      modelWinCounts[MODELS[key].name] = 0;
    }

    // Process debates
    const debatesWithWinners: string[] = [];
    for (const debate of debates || []) {
      const createdAt = new Date(debate.created_at);

      if (createdAt >= startOfMonth) debatesThisMonth++;
      if (createdAt >= startOfWeek) debatesThisWeek++;
      if (debate.is_public && debate.share_id) sharedDebates++;

      // Count winner
      const verdict = debate.verdict as { winner?: string } | null;
      if (verdict?.winner) {
        const winnerName = normalizeModelName(verdict.winner);
        if (modelWinCounts[winnerName] !== undefined) {
          modelWinCounts[winnerName]++;
          debatesWithWinners.push(debate.id);
        }
      }
    }

    // Calculate win stats
    const totalDebatesWithWinners = debatesWithWinners.length;
    const modelWins: ModelWinStats[] = modelKeys.map(key => {
      const name = MODELS[key].name;
      const wins = modelWinCounts[name];
      const winRate = totalDebatesWithWinners > 0
        ? Math.round((wins / totalDebatesWithWinners) * 100)
        : 0;

      return {
        name,
        key,
        color: MODELS[key].color,
        wins,
        winRate,
      };
    }).sort((a, b) => b.wins - a.wins);

    // Favorite model
    const favoriteModel = modelWins[0]?.wins > 0 ? modelWins[0].name : null;

    // Debates over time (last 30 days)
    const debatesOverTime: TimeSeriesPoint[] = [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const dateCounts: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      dateCounts[dateStr] = 0;
    }

    for (const debate of debates || []) {
      const dateStr = debate.created_at.split('T')[0];
      if (dateCounts[dateStr] !== undefined) {
        dateCounts[dateStr]++;
      }
    }

    for (const [date, count] of Object.entries(dateCounts)) {
      debatesOverTime.push({ date, count });
    }

    // Get reactions on user's debates
    const debateIds = (debates || []).map(d => d.id);
    let reactionBreakdown = { like: 0, fire: 0, think: 0, laugh: 0 };
    let totalReactionsReceived = 0;

    if (debateIds.length > 0) {
      const { data: reactions } = await serviceClient
        .from('debate_reactions')
        .select('reaction_type')
        .in('debate_id', debateIds);

      if (reactions) {
        for (const reaction of reactions) {
          const type = reaction.reaction_type as keyof typeof reactionBreakdown;
          if (reactionBreakdown[type] !== undefined) {
            reactionBreakdown[type]++;
            totalReactionsReceived++;
          }
        }
      }
    }

    const response: AnalyticsResponse = {
      overview: {
        totalDebates: debates?.length || 0,
        debatesThisMonth,
        debatesThisWeek,
        totalReactionsReceived,
        sharedDebates,
      },
      modelWins,
      favoriteModel,
      debatesOverTime,
      reactionBreakdown,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to normalize model names
function normalizeModelName(name: string): string {
  const lowerName = name.toLowerCase();
  const nameMap: Record<string, string> = {
    'claude': 'Claude',
    'gpt-4o': 'GPT-4o',
    'gpt4o': 'GPT-4o',
    'gemini': 'Gemini',
    'llama': 'Llama',
  };
  return nameMap[lowerName] || name;
}
