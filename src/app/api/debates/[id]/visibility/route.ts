export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';

/**
 * PUT /api/debates/[id]/visibility - Toggle debate public/private visibility
 *
 * Request body: { is_public: boolean }
 * Response: { success: boolean, is_public: boolean }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: debateId } = await params;

  try {
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate is_public is a boolean
    if (typeof body !== 'object' || body === null || !('is_public' in body)) {
      return NextResponse.json(
        { error: 'Missing required field: is_public' },
        { status: 400 }
      );
    }

    const { is_public } = body as { is_public: unknown };

    if (typeof is_public !== 'boolean') {
      return NextResponse.json(
        { error: 'is_public must be a boolean' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const serviceClient = createServiceRoleClient();

    // Fetch the debate to verify ownership
    const { data: debate, error: fetchError } = await serviceClient
      .from('debates')
      .select('id, user_id')
      .eq('id', debateId)
      .single();

    if (fetchError) {
      // PGRST116 is "No rows found"
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Debate not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching debate:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!debate) {
      return NextResponse.json(
        { error: 'Debate not found' },
        { status: 404 }
      );
    }

    // Verify user owns this debate
    if (debate.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only change visibility of your own debates' },
        { status: 403 }
      );
    }

    // Update the visibility
    const { error: updateError } = await serviceClient
      .from('debates')
      .update({ is_public })
      .eq('id', debateId);

    if (updateError) {
      console.error('Error updating debate visibility:', updateError);
      return NextResponse.json(
        { error: 'Failed to update visibility' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      is_public,
    });
  } catch (error) {
    console.error('Error in PUT /api/debates/[id]/visibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
