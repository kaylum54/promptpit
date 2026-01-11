import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import { MODELS, type ModelKey } from '@/lib/models';

interface ModelStats {
  name: string;
  key: ModelKey;
  color: string;
  wins: number;
  totalDebates: number;
  winRate: number;
  avgScore: number;
}

interface LeaderboardResponse {
  modelStats: ModelStats[];
  totalDebates: number;
  recentActivity: {
    debatesLast24h: number;
    debatesLast7d: number;
  };
}

/**
 * GET /api/leaderboard - Get model leaderboard and statistics
 */
export async function GET() {
  try {
    const serviceClient = createServiceRoleClient();

    // Get all debates with verdicts
    const { data: debates, error: debatesError } = await serviceClient
      .from('debates')
      .select('verdict, scores, created_at')
      .not('verdict', 'is', null);

    if (debatesError) {
      console.error('Error fetching debates for leaderboard:', debatesError);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard data' },
        { status: 500 }
      );
    }

    // Initialize stats for each model
    const modelKeys = Object.keys(MODELS) as ModelKey[];
    const stats: Record<string, { wins: number; totalDebates: number; totalScore: number }> = {};

    for (const key of modelKeys) {
      stats[MODELS[key].name] = { wins: 0, totalDebates: 0, totalScore: 0 };
    }

    // Process debates
    let totalDebates = 0;
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let debatesLast24h = 0;
    let debatesLast7d = 0;

    for (const debate of debates || []) {
      totalDebates++;

      const createdAt = new Date(debate.created_at);
      if (createdAt >= last24h) debatesLast24h++;
      if (createdAt >= last7d) debatesLast7d++;

      // Count win
      const verdict = debate.verdict as { winner?: string } | null;
      if (verdict?.winner) {
        const winnerName = normalizeModelName(verdict.winner);
        if (stats[winnerName]) {
          stats[winnerName].wins++;
        }
      }

      // Count participation and scores
      const scores = debate.scores as Record<string, { overall?: number }> | null;
      if (scores) {
        for (const [modelName, modelScores] of Object.entries(scores)) {
          const normalizedName = normalizeModelName(modelName);
          if (stats[normalizedName]) {
            stats[normalizedName].totalDebates++;
            if (modelScores.overall) {
              stats[normalizedName].totalScore += modelScores.overall;
            }
          }
        }
      }
    }

    // Convert to response format and calculate rates
    const modelStats: ModelStats[] = modelKeys.map(key => {
      const modelName = MODELS[key].name;
      const modelStat = stats[modelName];
      const winRate = modelStat.totalDebates > 0
        ? (modelStat.wins / modelStat.totalDebates) * 100
        : 0;
      const avgScore = modelStat.totalDebates > 0
        ? modelStat.totalScore / modelStat.totalDebates
        : 0;

      return {
        name: modelName,
        key,
        color: MODELS[key].color,
        wins: modelStat.wins,
        totalDebates: modelStat.totalDebates,
        winRate: Math.round(winRate * 10) / 10,
        avgScore: Math.round(avgScore * 10) / 10,
      };
    });

    // Sort by wins (descending)
    modelStats.sort((a, b) => b.wins - a.wins);

    const response: LeaderboardResponse = {
      modelStats,
      totalDebates,
      recentActivity: {
        debatesLast24h,
        debatesLast7d,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to normalize model names (handle variations like "claude" vs "Claude")
function normalizeModelName(name: string): string {
  const lowerName = name.toLowerCase();

  // Map of lowercase variations to canonical names
  const nameMap: Record<string, string> = {
    'claude': 'Claude',
    'gpt-4o': 'GPT-4o',
    'gpt4o': 'GPT-4o',
    'gemini': 'Gemini',
    'llama': 'Llama',
  };

  return nameMap[lowerName] || name;
}
