import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient, type Database } from '@/lib/supabase';
import type { ModelScores, JudgeVerdict, Debate } from '@/lib/types';

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

    // Create Supabase client with session access
    const supabase = await createServerSupabaseClient();

    // Get current user (if logged in)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error (non-fatal, treating as guest):', authError.message);
    }

    // Prepare debate data - user_id must be a valid UUID or null
    // user.id from Supabase auth is already a UUID that matches auth.users.id
    // Cast complex objects through unknown to satisfy TypeScript's Json type
    const debateData: Database['public']['Tables']['debates']['Insert'] = {
      user_id: user?.id ?? null,
      prompt: body.prompt,
      responses: body.responses as unknown as Database['public']['Tables']['debates']['Insert']['responses'],
      scores: body.scores as unknown as Database['public']['Tables']['debates']['Insert']['scores'],
      verdict: body.verdict as unknown as Database['public']['Tables']['debates']['Insert']['verdict'],
      latencies: body.latencies as unknown as Database['public']['Tables']['debates']['Insert']['latencies'],
      // Include multi-round fields if provided
      ...(body.is_multi_round !== undefined && { is_multi_round: body.is_multi_round }),
      ...(body.rounds !== undefined && { rounds: body.rounds as unknown as Database['public']['Tables']['debates']['Insert']['rounds'] }),
      ...(body.total_rounds !== undefined && { total_rounds: body.total_rounds }),
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
    // Create Supabase client
    const supabase = await createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // If not logged in or auth error, return empty array
    if (authError || !user) {
      const response: GetDebatesResponse = {
        debates: [],
        count: 0,
      };
      return NextResponse.json(response);
    }

    // Query debates for this user, ordered by most recent first
    const { data: debates, error, count } = await supabase
      .from('debates')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
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
