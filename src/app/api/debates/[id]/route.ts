import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';
import type { Debate } from '@/lib/types';

/**
 * GET /api/debates/[id] - Fetch a single debate by ID
 *
 * Returns a single debate with all fields needed for replay.
 * Debates are public (for shareable links), so no auth check required.
 * Returns 404 if debate not found.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid debate ID format' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS for public access
    const adminClient = createServiceRoleClient();

    const { data: debate, error } = await adminClient
      .from('debates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 is "No rows found" - return 404
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Debate not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching debate:', error);
      return NextResponse.json(
        { error: 'Failed to fetch debate', details: error.message },
        { status: 500 }
      );
    }

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    // Return the debate with proper typing
    const response: Debate = {
      id: debate.id,
      user_id: debate.user_id ?? undefined,
      prompt: debate.prompt,
      responses: debate.responses as Record<string, string>,
      scores: debate.scores as Debate['scores'],
      verdict: debate.verdict as Debate['verdict'],
      latencies: debate.latencies as Debate['latencies'],
      created_at: debate.created_at,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/debates/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
