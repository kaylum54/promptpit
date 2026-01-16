/**
 * Team API Route
 * GET - Fetch team members and invitations
 * POST - Send a new invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  lastActive: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  sentAt: string;
  expiresAt: string;
}

// GET - Fetch team members and invitations
export async function GET() {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    // Get current user profile for owner info
    const { data: profile } = await supabase
      .from('promptpit_profiles')
      .select('display_name, email')
      .eq('id', auth0User.sub)
      .single();

    // Create the owner entry (current user)
    const owner: TeamMember = {
      id: auth0User.sub,
      name: profile?.display_name || 'You',
      email: profile?.email || auth0User.email || '',
      role: 'owner',
      joinedAt: profile?.created_at || new Date().toISOString(),
      lastActive: 'Now',
    };

    // Fetch team members where current user is the owner
    const { data: teamMembers, error: membersError } = await supabase
      .from('promptpit_team_members')
      .select(`
        id,
        member_id,
        role,
        joined_at,
        last_active_at
      `)
      .eq('owner_id', auth0User.sub);

    if (membersError) {
      console.error('Error fetching team members:', membersError);
    }

    // Get member profiles
    const members: TeamMember[] = [owner];

    if (teamMembers && teamMembers.length > 0) {
      const memberIds = teamMembers.map((m: { member_id: string }) => m.member_id);
      const { data: memberProfiles } = await supabase
        .from('promptpit_profiles')
        .select('id, display_name, email')
        .in('id', memberIds);

      for (const tm of teamMembers) {
        const memberProfile = memberProfiles?.find((p: { id: string }) => p.id === tm.member_id);
        members.push({
          id: tm.id,
          name: memberProfile?.display_name || memberProfile?.email || 'Unknown',
          email: memberProfile?.email || '',
          role: tm.role as 'admin' | 'editor' | 'viewer',
          joinedAt: tm.joined_at,
          lastActive: formatLastActive(tm.last_active_at),
        });
      }
    }

    // Fetch pending invitations
    const { data: invitations, error: invitationsError } = await supabase
      .from('promptpit_team_invitations')
      .select('id, email, role, sent_at, expires_at')
      .eq('owner_id', auth0User.sub)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString());

    if (invitationsError) {
      console.error('Error fetching invitations:', invitationsError);
    }

    const pendingInvitations: Invitation[] = (invitations || []).map((inv: {
      id: string;
      email: string;
      role: string;
      sent_at: string;
      expires_at: string;
    }) => ({
      id: inv.id,
      email: inv.email,
      role: inv.role as 'admin' | 'editor' | 'viewer',
      sentAt: inv.sent_at,
      expiresAt: inv.expires_at,
    }));

    return NextResponse.json({
      members,
      invitations: pendingInvitations,
    });
  } catch (error) {
    console.error('Team GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new invitation
export async function POST(request: NextRequest) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const supabase = createServiceRoleClient();

    const body = await request.json();
    const { email, role } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if email is already a team member
    const { data: existingMember } = await supabase
      .from('promptpit_profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (existingMember) {
      const { data: alreadyMember } = await supabase
        .from('promptpit_team_members')
        .select('id')
        .eq('owner_id', auth0User.sub)
        .eq('member_id', existingMember.id)
        .single();

      if (alreadyMember) {
        return NextResponse.json({ error: 'User is already a team member' }, { status: 400 });
      }
    }

    // Check if invitation already exists
    const { data: existingInvite } = await supabase
      .from('promptpit_team_invitations')
      .select('id')
      .eq('owner_id', auth0User.sub)
      .eq('email', email.trim().toLowerCase())
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('promptpit_team_invitations')
      .insert({
        owner_id: auth0User.sub,
        email: email.trim().toLowerCase(),
        role,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating invitation:', error);
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // TODO: Send invitation email here
    // For now, just return success

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        sentAt: invitation.sent_at,
        expiresAt: invitation.expires_at,
      },
    });
  } catch (error) {
    console.error('Team POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function formatLastActive(dateStr: string): string {
  if (!dateStr) return 'Never';

  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 5) return 'Now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
