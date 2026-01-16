/**
 * Team Invitation API Route
 * POST - Resend invitation
 * DELETE - Revoke invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST - Resend invitation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('promptpit_team_invitations')
      .select('id, owner_id, email, role')
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.owner_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Not authorized to resend this invitation' }, { status: 403 });
    }

    // Update sent_at and expires_at to extend the invitation
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const { error: updateError } = await supabase
      .from('promptpit_team_invitations')
      .update({
        sent_at: new Date().toISOString(),
        expires_at: newExpiresAt.toISOString(),
        token: crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error resending invitation:', updateError);
      return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
    }

    // TODO: Send invitation email here

    return NextResponse.json({ success: true, message: 'Invitation resent' });
  } catch (error) {
    console.error('Invitation POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Revoke invitation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    // Verify ownership
    const { data: invitation, error: fetchError } = await supabase
      .from('promptpit_team_invitations')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.owner_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Not authorized to revoke this invitation' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('promptpit_team_invitations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error revoking invitation:', deleteError);
      return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Invitation DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
