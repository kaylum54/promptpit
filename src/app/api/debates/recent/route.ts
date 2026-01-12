import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Arena types for filtering
type ArenaType = 'debate' | 'code' | 'writing' | 'all';

// Response type for recent debates
interface RecentDebate {
  id: string;
  prompt: string;
  arena: 'debate' | 'code' | 'writing';
  winner: string | null;
  created_at: string;
  share_id: string;
}

interface RecentDebatesResponse {
  debates: RecentDebate[];
}

/**
 * GET /api/debates/recent - Fetch recent public debates
 *
 * Query parameters:
 * - limit (optional): Number of debates to return (default 5, max 20)
 * - arena (optional): Filter by arena type ('debate' | 'code' | 'writing' | 'all', default 'all')
 *
 * Returns recent public debates for display on the homepage.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate limit parameter
    const limitParam = searchParams.get('limit');
    let limit = 5;
    if (limitParam !== null) {
      const parsedLimit = parseInt(limitParam, 10);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return NextResponse.json(
          { error: 'Invalid limit parameter. Must be a positive integer.' },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 20); // Cap at 20
    }

    // Parse and validate arena parameter
    const arenaParam = searchParams.get('arena');
    let arena: ArenaType = 'all';
    if (arenaParam !== null) {
      const validArenas: ArenaType[] = ['debate', 'code', 'writing', 'all'];
      if (!validArenas.includes(arenaParam as ArenaType)) {
        return NextResponse.json(
          { error: "Invalid arena parameter. Must be one of: 'debate', 'code', 'writing', 'all'." },
          { status: 400 }
        );
      }
      arena = arenaParam as ArenaType;
    }

    // Use service role client to bypass RLS for public access
    const adminClient = createServiceRoleClient();

    // Build the query
    let query = adminClient
      .from('debates')
      .select('id, prompt, arena, verdict, created_at, share_id')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply arena filter if not 'all'
    if (arena !== 'all') {
      query = query.eq('arena', arena);
    }

    const { data: debates, error } = await query;

    if (error) {
      console.error('Error fetching recent debates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent debates', details: error.message },
        { status: 500 }
      );
    }

    // Transform the data to extract winner from verdict JSONB
    const recentDebates: RecentDebate[] = (debates || []).map((debate) => {
      // Extract winner from verdict JSONB field
      let winner: string | null = null;
      if (debate.verdict && typeof debate.verdict === 'object') {
        const verdict = debate.verdict as { winner?: string };
        winner = verdict.winner || null;
      }

      return {
        id: debate.id,
        prompt: debate.prompt,
        arena: debate.arena || 'debate', // Default to 'debate' if not set
        winner,
        created_at: debate.created_at,
        share_id: debate.share_id,
      };
    });

    const response: RecentDebatesResponse = {
      debates: recentDebates,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/debates/recent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
