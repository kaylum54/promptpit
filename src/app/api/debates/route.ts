import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient, type Database } from '@/lib/supabase';
import type { ModelScores, JudgeVerdict, Debate, DebateArena } from '@/lib/types';
import { updatePreferencesFromDebate } from '@/lib/preferences';

// Round data for multi-round debates
interface RoundData {
  roundNumber: number;
  prompt: string;
  responses: Record<string, string>;
  scores?: Record<string, ModelScores>;
  verdict?: JudgeVerdict;
  latencies?: Record<string, { ttft: number; total: number }>;
  createdAt: string;
}

// Request body type for POST
interface SaveDebateRequest {
  prompt: string;
  responses: Record<string, string>;
  scores: Record<string, ModelScores>;
  verdict: JudgeVerdict;
  latencies: Record<string, { ttft: number; total: number }>;
  // Multi-round fields
  is_multi_round?: boolean;
  rounds?: RoundData[];
  total_rounds?: number;
  // Arena type
  arena?: DebateArena;
}

// Response type for POST
interface SaveDebateResponse {
  id: string;
  created_at: string;
}

// Response type for GET
interface GetDebatesResponse {
  debates: Debate[];
  count: number;
}

/**
 * POST /api/debates - Save a debate
 *
 * Saves a completed debate to the database.
 * If user is logged in, associates the debate with their account.
 * If not logged in, saves as guest debate (user_id = null).
 */
export async function POST(request: NextRequest) {
  try {
    const body: SaveDebateRequest = await request.json();

    // Validate required fields
    if (!body.prompt || !body.responses || !body.scores || !body.verdict || !body.latencies) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, responses, scores, verdict, latencies' },
        { status: 400 }
      );
    }

    // Get current user (if logged in) via Auth0
    const auth0User = await getAuth0User();

    // Prepare debate data - user_id must be a valid string or null
    // auth0User.sub is the Auth0 user ID
    // Cast complex objects through unknown to satisfy TypeScript's Json type
    const debateData: Database['public']['Tables']['debates']['Insert'] = {
      user_id: auth0User?.sub ?? null,
      prompt: body.prompt,
      responses: body.responses as unknown as Database['public']['Tables']['debates']['Insert']['responses'],
      scores: body.scores as unknown as Database['public']['Tables']['debates']['Insert']['scores'],
      verdict: body.verdict as unknown as Database['public']['Tables']['debates']['Insert']['verdict'],
      latencies: body.latencies as unknown as Database['public']['Tables']['debates']['Insert']['latencies'],
      // Include multi-round fields if provided
      ...(body.is_multi_round !== undefined && { is_multi_round: body.is_multi_round }),
      ...(body.rounds !== undefined && { rounds: body.rounds as unknown as Database['public']['Tables']['debates']['Insert']['rounds'] }),
      ...(body.total_rounds !== undefined && { total_rounds: body.total_rounds }),
      // Include arena type if provided (defaults to 'debate' for backward compatibility)
      arena: body.arena || 'debate',
    };

    // Use service role client for inserts to bypass RLS
    // This ensures debates can always be saved regardless of auth state
    const adminClient = createServiceRoleClient();

    const { data, error } = await adminClient
      .from('debates')
      .insert(debateData)
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Error saving debate:', error);
      return NextResponse.json(
        { error: 'Failed to save debate', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Failed to save debate - no data returned' },
        { status: 500 }
      );
    }

    // Update user preferences from this debate (for Quick Mode routing)
    if (auth0User?.sub && body.verdict?.winner) {
      try {
        await updatePreferencesFromDebate(auth0User.sub, {
          prompt: body.prompt,
          responses: body.responses,
          verdict: body.verdict,
        });
      } catch (prefError) {
        // Non-fatal: log but don't fail the request
        console.error('Failed to update preferences:', prefError);
      }
    }

    const response: SaveDebateResponse = {
      id: data.id,
      created_at: data.created_at,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/debates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/debates - Fetch debate history
 *
 * Returns the 20 most recent debates for the authenticated user.
 * Returns empty array if user is not logged in.
 */
export async function GET() {
  try {
    // Get current user via Auth0
    const auth0User = await getAuth0User();

    // If not logged in, return empty array
    if (!auth0User) {
      const response: GetDebatesResponse = {
        debates: [],
        count: 0,
      };
      return NextResponse.json(response);
    }

    // Use service role client for DB operations
    const supabase = createServiceRoleClient();

    // Query debates for this user, ordered by most recent first
    const { data: debates, error, count } = await supabase
      .from('debates')
      .select('*', { count: 'exact' })
      .eq('user_id', auth0User.sub)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching debates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch debates', details: error.message },
        { status: 500 }
      );
    }

    const response: GetDebatesResponse = {
      debates: (debates as unknown as Debate[]) || [],
      count: count || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/debates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
