/**
 * Team Member API Route
 * PATCH - Update member role
 * DELETE - Remove member from team
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update member role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    const body = await request.json();
    const { role } = body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Verify ownership and update
    const { data: member, error: fetchError } = await supabase
      .from('promptpit_team_members')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.owner_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Not authorized to modify this member' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('promptpit_team_members')
      .update({ role })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating member:', updateError);
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }

    return NextResponse.json({ success: true, role });
  } catch (error) {
    console.error('Team member PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove member from team
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: member, error: fetchError } = await supabase
      .from('promptpit_team_members')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (member.owner_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Not authorized to remove this member' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('promptpit_team_members')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting member:', deleteError);
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Team member DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
