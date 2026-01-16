import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

export type ReactionType = 'like' | 'fire' | 'think' | 'laugh';

interface ReactionCounts {
  like: number;
  fire: number;
  think: number;
  laugh: number;
}

interface ReactionResponse {
  counts: ReactionCounts;
  userReactions: ReactionType[];
}

/**
 * GET /api/debates/[id]/reactions - Get reaction counts and user's reactions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

  try {
    // Get current user (if logged in) via Auth0
    const auth0User = await getAuth0User();

    const serviceClient = createServiceRoleClient();

    // Get all reactions for this debate
    const { data: reactions, error } = await serviceClient
      .from('debate_reactions')
      .select('reaction_type, user_id')
      .eq('debate_id', debateId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions' },
        { status: 500 }
      );
    }

    // Count reactions by type
    const counts: ReactionCounts = {
      like: 0,
      fire: 0,
      think: 0,
      laugh: 0,
    };

    const userReactions: ReactionType[] = [];

    for (const reaction of reactions || []) {
      const type = reaction.reaction_type as ReactionType;
      counts[type]++;

      if (auth0User && reaction.user_id === auth0User.sub) {
        userReactions.push(type);
      }
    }

    const response: ReactionResponse = {
      counts,
      userReactions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/debates/[id]/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/debates/[id]/reactions - Add a reaction
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

  try {
    // Check authentication via Auth0
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { reaction_type } = body;

    if (!reaction_type || !['like', 'fire', 'think', 'laugh'].includes(reaction_type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type. Must be: like, fire, think, or laugh' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Add the reaction (upsert to handle duplicates gracefully)
    const { error } = await serviceClient
      .from('debate_reactions')
      .upsert({
        debate_id: debateId,
        user_id: auth0User.sub,
        reaction_type,
      }, {
        onConflict: 'debate_id,user_id,reaction_type',
        ignoreDuplicates: true,
      });

    if (error) {
      console.error('Error adding reaction:', error);
      return NextResponse.json(
        { error: 'Failed to add reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/debates/[id]/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/debates/[id]/reactions - Remove a reaction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

  try {
    // Check authentication via Auth0
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get reaction type from query params
    const url = new URL(request.url);
    const reaction_type = url.searchParams.get('type');

    if (!reaction_type || !['like', 'fire', 'think', 'laugh'].includes(reaction_type)) {
      return NextResponse.json(
        { error: 'Invalid reaction type' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Remove the reaction
    const { error } = await serviceClient
      .from('debate_reactions')
      .delete()
      .eq('debate_id', debateId)
      .eq('user_id', auth0User.sub)
      .eq('reaction_type', reaction_type);

    if (error) {
      console.error('Error removing reaction:', error);
      return NextResponse.json(
        { error: 'Failed to remove reaction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/debates/[id]/reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
