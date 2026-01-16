import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import type { PRD, PRDStatus } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/prd/[id]
 * Get a specific PRD with messages and debates
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get PRD
    const { data: prd, error: prdError } = await supabase
      .from('prds')
      .select('*')
      .eq('id', id)
      .single();

    if (prdError || !prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    // Check access - owner, public, or collaborator
    const isOwner = prd.user_id === auth0User.sub;
    const isPublic = prd.is_public;
    const isCollaborator = prd.collaborators?.some(
      (c: { user_id: string }) => c.user_id === auth0User.sub
    );

    if (!isOwner && !isPublic && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages
    const { data: messages } = await supabase
      .from('prd_messages')
      .select('*')
      .eq('prd_id', id)
      .order('created_at', { ascending: true });

    // Get debates
    const { data: debates } = await supabase
      .from('prd_debates')
      .select('*')
      .eq('prd_id', id)
      .order('created_at', { ascending: true });

    // Get reviews if in review/completed status
    let reviews = null;
    if (prd.status === 'review' || prd.status === 'completed') {
      const { data } = await supabase
        .from('prd_reviews')
        .select('*')
        .eq('prd_id', id);
      reviews = data;
    }

    return NextResponse.json({
      prd,
      messages: messages || [],
      debates: debates || [],
      reviews: reviews || [],
      canEdit: isOwner || isCollaborator,
    });

  } catch (error) {
    console.error('Error in GET /api/prd/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/prd/[id]
 * Update a PRD
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: existingPrd } = await supabase
      .from('prds')
      .select('user_id, collaborators')
      .eq('id', id)
      .single();

    if (!existingPrd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    const isOwner = existingPrd.user_id === auth0User.sub;
    const isEditor = existingPrd.collaborators?.some(
      (c: { user_id: string; role: string }) => c.user_id === auth0User.sub && c.role === 'editor'
    );

    if (!isOwner && !isEditor) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Define allowed fields for update
    const allowedFields = [
      'title', 'status', 'current_phase',
      'idea_summary', 'features', 'tech_stack',
      'database_schema', 'api_structure', 'file_structure',
      'security', 'error_handling', 'performance',
      'scaling', 'observability', 'deployment',
      'cost_estimate', 'prd_markdown', 'claude_code_prompt',
      'is_public',
    ];

    // Filter body to only allowed fields
    const updateData: Partial<PRD> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        (updateData as Record<string, unknown>)[field] = body[field];
      }
    }

    // Validate status if provided
    if (updateData.status) {
      const validStatuses: PRDStatus[] = ['in_progress', 'review', 'completed', 'archived'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    }

    const { data: prd, error: updateError } = await supabase
      .from('prds')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating PRD:', updateError);
      return NextResponse.json({ error: 'Failed to update PRD' }, { status: 500 });
    }

    return NextResponse.json({ prd });

  } catch (error) {
    console.error('Error in PATCH /api/prd/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/prd/[id]
 * Delete (archive) a PRD
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: existingPrd } = await supabase
      .from('prds')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existingPrd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    if (existingPrd.user_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Only the owner can delete a PRD' }, { status: 403 });
    }

    // Soft delete by archiving
    const { error: deleteError } = await supabase
      .from('prds')
      .update({ status: 'archived' })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting PRD:', deleteError);
      return NextResponse.json({ error: 'Failed to delete PRD' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/prd/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
