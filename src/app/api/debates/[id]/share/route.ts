import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { nanoid } from 'nanoid';

/**
 * POST /api/debates/[id]/share - Generate a share link for a debate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

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

    // Verify user owns this debate
    const { data: debate, error: fetchError } = await serviceClient
      .from('debates')
      .select('id, user_id, share_id, is_public')
      .eq('id', debateId)
      .single();

    if (fetchError || !debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    if (debate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only share your own debates' },
        { status: 403 }
      );
    }

    // If already has a share ID, return it
    if (debate.share_id && debate.is_public) {
      return NextResponse.json({
        shareId: debate.share_id,
        shareUrl: `${getBaseUrl(request)}/share/${debate.share_id}`,
      });
    }

    // Generate new share ID
    const shareId = nanoid(10);

    // Update debate with share info
    const { error: updateError } = await serviceClient
      .from('debates')
      .update({
        share_id: shareId,
        is_public: true,
      })
      .eq('id', debateId);

    if (updateError) {
      console.error('Error updating debate share:', updateError);
      return NextResponse.json(
        { error: 'Failed to create share link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      shareId,
      shareUrl: `${getBaseUrl(request)}/share/${shareId}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/debates/[id]/share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/debates/[id]/share - Remove share link (make private)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

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

    // Verify user owns this debate
    const { data: debate, error: fetchError } = await serviceClient
      .from('debates')
      .select('id, user_id')
      .eq('id', debateId)
      .single();

    if (fetchError || !debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    if (debate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only unshare your own debates' },
        { status: 403 }
      );
    }

    // Remove share
    const { error: updateError } = await serviceClient
      .from('debates')
      .update({
        is_public: false,
      })
      .eq('id', debateId);

    if (updateError) {
      console.error('Error removing debate share:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove share link' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/debates/[id]/share:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to get base URL from request
function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}
