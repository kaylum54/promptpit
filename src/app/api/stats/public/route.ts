import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PublicStatsResponse {
  totalDebates: number;
  debatesToday: number;
  leadingModel: {
    name: string;
    winRate: number;
  };
}

/**
 * GET /api/stats/public - Get aggregate statistics for homepage display
 */
export async function GET() {
  try {
    const serviceClient = createServiceRoleClient();

    // Get start of today in UTC
    const now = new Date();
    const startOfTodayUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    )).toISOString();

    // Count total public debates
    const { count: totalDebates, error: totalError } = await serviceClient
      .from('debates')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true);

    if (totalError) {
      console.error('Error fetching total debates:', totalError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Count debates today
    const { count: debatesToday, error: todayError } = await serviceClient
      .from('debates')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .gte('created_at', startOfTodayUTC);

    if (todayError) {
      console.error('Error fetching debates today:', todayError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Get all public debates with verdicts to calculate win rates
    const { data: debates, error: debatesError } = await serviceClient
      .from('debates')
      .select('verdict')
      .eq('is_public', true)
      .not('verdict', 'is', null);

    if (debatesError) {
      console.error('Error fetching debates for win rates:', debatesError);
      return NextResponse.json(
        { error: 'Failed to fetch statistics' },
        { status: 500 }
      );
    }

    // Calculate win counts per model
    const winCounts: Record<string, number> = {};
    let totalWithWinner = 0;

    for (const debate of debates || []) {
      const verdict = debate.verdict as { winner?: string } | null;
      if (verdict?.winner) {
        const winner = verdict.winner;
        winCounts[winner] = (winCounts[winner] || 0) + 1;
        totalWithWinner++;
      }
    }

    // Find the model with the highest win count
    let leadingModel = 'Claude'; // Default
    let leadingModelWins = 0;

    for (const [model, wins] of Object.entries(winCounts)) {
      if (wins > leadingModelWins) {
        leadingModel = model;
        leadingModelWins = wins;
      }
    }

    // Calculate win rate as percentage
    const leadingModelWinRate = totalWithWinner > 0
      ? Math.round((leadingModelWins / totalWithWinner) * 1000) / 10
      : 0;

    const response: PublicStatsResponse = {
      totalDebates: totalDebates || 0,
      debatesToday: debatesToday || 0,
      leadingModel: {
        name: leadingModel,
        winRate: leadingModelWinRate,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/stats/public:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
