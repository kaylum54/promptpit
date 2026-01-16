/**
 * Accept Team Invitation API Route
 * POST - Accept an invitation using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

// POST - Accept invitation
export async function POST(request: NextRequest) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invitation by token
    const { data: invitation, error: fetchError } = await supabase
      .from('promptpit_team_invitations')
      .select('id, owner_id, email, role, expires_at, accepted_at')
      .eq('token', token)
      .single();

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    // Check if already accepted
    if (invitation.accepted_at) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 });
    }

    // Verify email matches (optional - you might want to allow any logged in user to accept)
    // const userEmail = auth0User.email?.toLowerCase();
    // if (userEmail !== invitation.email.toLowerCase()) {
    //   return NextResponse.json({ error: 'This invitation was sent to a different email' }, { status: 403 });
    // }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('promptpit_team_members')
      .select('id')
      .eq('owner_id', invitation.owner_id)
      .eq('member_id', auth0User.sub)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: 'You are already a team member' }, { status: 400 });
    }

    // Can't join your own team
    if (invitation.owner_id === auth0User.sub) {
      return NextResponse.json({ error: 'Cannot accept invitation to your own team' }, { status: 400 });
    }

    // Create team membership
    const { error: memberError } = await supabase
      .from('promptpit_team_members')
      .insert({
        owner_id: invitation.owner_id,
        member_id: auth0User.sub,
        role: invitation.role,
      });

    if (memberError) {
      console.error('Error creating membership:', memberError);
      return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from('promptpit_team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      // Don't fail - membership was already created
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the team',
      role: invitation.role,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
