import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface GalleryDebate {
  id: string;
  prompt: string;
  verdict: {
    winner: string;
    verdict: string;
    highlight: string;
  } | null;
  share_id: string;
  created_at: string;
  reaction_count: number;
}

interface GalleryResponse {
  debates: GalleryDebate[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * GET /api/gallery - Get public debates for the gallery
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'recent'; // recent, popular

    const offset = (page - 1) * limit;

    const serviceClient = createServiceRoleClient();

    // Get public debates
    let query = serviceClient
      .from('debates')
      .select('id, prompt, verdict, share_id, created_at', { count: 'exact' })
      .eq('is_public', true)
      .not('share_id', 'is', null);

    // Apply sorting
    if (sort === 'recent') {
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: debates, error, count } = await query;

    if (error) {
      console.error('Error fetching gallery debates:', error);
      return NextResponse.json(
        { error: 'Failed to fetch debates' },
        { status: 500 }
      );
    }

    // Get reaction counts for these debates
    const debateIds = (debates || []).map((d: { id: string }) => d.id);

    const reactionCounts: Record<string, number> = {};
    if (debateIds.length > 0) {
      const { data: reactions } = await serviceClient
        .from('debate_reactions')
        .select('debate_id')
        .in('debate_id', debateIds);

      if (reactions) {
        for (const reaction of reactions) {
          reactionCounts[reaction.debate_id] = (reactionCounts[reaction.debate_id] || 0) + 1;
        }
      }
    }

    // Format response
    interface DebateRow {
      id: string;
      prompt: string;
      verdict: unknown;
      share_id: string | null;
      created_at: string;
    }
    const galleryDebates: GalleryDebate[] = (debates || []).map((debate: DebateRow) => ({
      id: debate.id,
      prompt: debate.prompt,
      verdict: debate.verdict as GalleryDebate['verdict'],
      share_id: debate.share_id!,
      created_at: debate.created_at,
      reaction_count: reactionCounts[debate.id] || 0,
    }));

    // If sorting by popular, re-sort by reaction count
    if (sort === 'popular') {
      galleryDebates.sort((a, b) => b.reaction_count - a.reaction_count);
    }

    const response: GalleryResponse = {
      debates: galleryDebates,
      totalCount: count || 0,
      hasMore: offset + limit < (count || 0),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/gallery:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
