'use client';

import { useState, useEffect } from 'react';

type Role = 'owner' | 'admin' | 'editor' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  joinedAt: string;
  lastActive: string;
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  sentAt: string;
  expiresAt: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [showRoleMenu, setShowRoleMenu] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const roleColors: Record<Role, string> = {
    owner: 'bg-amber-100 text-amber-700',
    admin: 'bg-purple-100 text-purple-700',
    editor: 'bg-blue-100 text-blue-700',
    viewer: 'bg-gray-100 text-gray-600',
  };

  const roleLabels: Record<Role, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };

  // Fetch team data on mount
  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/team');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const data = await response.json();
      setMembers(data.members || []);
      setInvitations(data.invitations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    setActionError(null);

    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invitation');
      }

      const data = await response.json();
      setInvitations([...invitations, data.invitation]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('editor');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setMembers(members.map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setShowRoleMenu(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove member');
      }

      setMembers(members.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Error removing member:', err);
    } finally {
      setShowRoleMenu(null);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to resend invitation');
      }

      // Refresh to get updated sent_at
      await fetchTeamData();
    } catch (err) {
      console.error('Error resending invitation:', err);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/team/invitations/${invitationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke invitation');
      }

      setInvitations(invitations.filter(i => i.id !== invitationId));
    } catch (err) {
      console.error('Error revoking invitation:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Now') return dateStr;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchTeamData()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their access</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Member
        </button>
      </div>

      {/* Team Members Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-900">Members ({members.length})</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {members.map((member) => (
            <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="text-gray-600 font-medium text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{member.name}</span>
                    {member.role === 'owner' && (
                      <span className="text-xs text-gray-400">(you)</span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">{member.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Last Active */}
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-gray-400">Last active</span>
                  <p className="text-sm text-gray-600">{member.lastActive}</p>
                </div>

                {/* Role Badge */}
                <div className="relative">
                  <button
                    onClick={() => member.role !== 'owner' && setShowRoleMenu(showRoleMenu === member.id ? null : member.id)}
                    disabled={member.role === 'owner'}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[member.role]} ${member.role !== 'owner' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                  >
                    {roleLabels[member.role]}
                    {member.role !== 'owner' && (
                      <svg className="w-3 h-3 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Role Dropdown */}
                  {showRoleMenu === member.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-200 shadow-lg py-1 z-10">
                      {(['admin', 'editor', 'viewer'] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleChange(member.id, role)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                        >
                          {roleLabels[role]}
                          {member.role === role && (
                            <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Remove member
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* More Actions */}
                {member.role !== 'owner' && (
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {members.length === 1 && (
          <div className="px-6 py-8 text-center border-t border-gray-100">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium">Invite your team</p>
            <p className="text-sm text-gray-400 mt-1">Collaborate with others on your projects</p>
          </div>
        )}
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-medium text-gray-900">Pending Invitations ({invitations.length})</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">{invitation.email}</span>
                    <p className="text-sm text-gray-500">Sent {formatDate(invitation.sentAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[invitation.role]}`}>
                    {roleLabels[invitation.role]}
                  </span>
                  <button
                    onClick={() => handleResendInvitation(invitation.id)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleRevokeInvitation(invitation.id)}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-medium text-gray-900 mb-4">Role Permissions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.owner}`}>Owner</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Full access</li>
              <li>Manage billing</li>
              <li>Delete workspace</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.admin}`}>Admin</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Manage members</li>
              <li>Edit all projects</li>
              <li>Manage settings</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.editor}`}>Editor</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Create projects</li>
              <li>Edit own projects</li>
              <li>View all projects</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors.viewer}`}>Viewer</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>View projects</li>
              <li>Comment</li>
              <li>Download exports</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Invite Team Member</h2>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setActionError(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{actionError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'editor', 'viewer'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setInviteRole(role)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        inviteRole === role
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{roleLabels[inviteRole]}s</span> can{' '}
                  {inviteRole === 'admin' && 'manage team members and all projects.'}
                  {inviteRole === 'editor' && 'create and edit their own projects.'}
                  {inviteRole === 'viewer' && 'view projects and add comments.'}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setActionError(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail || isSubmitting}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
