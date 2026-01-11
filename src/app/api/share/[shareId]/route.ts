import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

/**
 * GET /api/share/[shareId] - Get a publicly shared debate
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;

  try {
    const serviceClient = createServiceRoleClient();

    // Fetch the debate by share_id
    const { data: debate, error } = await serviceClient
      .from('debates')
      .select('id, prompt, responses, scores, verdict, latencies, created_at, share_id, is_public')
      .eq('share_id', shareId)
      .eq('is_public', true)
      .single();

    if (error || !debate) {
      return NextResponse.json(
        { error: 'Shared debate not found or no longer public' },
        { status: 404 }
      );
    }

    // Return debate without user_id for privacy
    return NextResponse.json({
      id: debate.id,
      prompt: debate.prompt,
      responses: debate.responses,
      scores: debate.scores,
      verdict: debate.verdict,
      latencies: debate.latencies,
      created_at: debate.created_at,
      shareId: debate.share_id,
    });
  } catch (error) {
    console.error('Error in GET /api/share/[shareId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
