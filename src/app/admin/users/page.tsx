'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string | null;
  role: string | null;
  tier: string;
  debate_count: number;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search,
        tier: tierFilter,
        role: roleFilter,
      });
      const res = await fetch('/api/admin/users?' + params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter, roleFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function updateUser(userId: string, updates: { tier?: string; role?: string }) {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users/' + userId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to update user');
        return;
      }
      await fetchUsers();
    } catch {
      alert('Failed to update user');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteUser(userId: string, email: string | null) {
    if (!confirm('Are you sure you want to delete ' + (email || 'this user') + '? This cannot be undone.')) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users/' + userId, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
        return;
      }
      await fetchUsers();
    } catch {
      alert('Failed to delete user');
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getTierBadgeClass(tier: string) {
    if (tier === 'pro') return 'bg-accent-primary/20 text-accent-primary';
    return 'bg-gray-500/20 text-gray-400';
  }

  function getRoleBadgeClass(role: string | null) {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-400';
    return 'bg-gray-500/20 text-gray-400';
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Users Management</h1>
          <p className="text-text-secondary">{pagination ? pagination.total + ' total users' : 'Loading...'}</p>
        </div>
      </div>

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" placeholder="Search by email..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary" />
          </div>
          <select value={tierFilter} onChange={(e) => { setTierFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary">
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </select>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary">
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
          {error} <button onClick={fetchUsers} className="ml-4 underline">Retry</button>
        </div>
      )}

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-DEFAULT bg-bg-elevated">
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Email</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Role</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Tier</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Debates</th>
                <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Joined</th>
                <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [0,1,2,3,4].map((i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="px-4 py-3"><div className="h-4 w-48 bg-bg-elevated rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-bg-elevated rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-bg-elevated rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-12 bg-bg-elevated rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-bg-elevated rounded animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-32 bg-bg-elevated rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-text-secondary font-medium mb-1">No users found</p>
                      <p className="text-text-muted text-sm">
                        {search || tierFilter !== 'all' || roleFilter !== 'all'
                          ? 'Try adjusting your filters or search terms'
                          : 'Users will appear here once they sign up'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border-subtle hover:bg-bg-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-text-primary">{user.email || 'No email'}</td>
                    <td className="px-4 py-3">
                      <span className={'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ' + getRoleBadgeClass(user.role)}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ' + getTierBadgeClass(user.tier)}>
                        {user.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.debate_count}</td>
                    <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === user.id ? (
                          <span className="text-text-muted text-sm">Loading...</span>
                        ) : (
                          <>
                            <select
                              value={user.tier}
                              onChange={(e) => updateUser(user.id, { tier: e.target.value })}
                              className="px-2 py-1 text-xs bg-bg-base border border-border-DEFAULT rounded text-text-primary"
                            >
                              <option value="free">Free</option>
                              <option value="pro">Pro</option>
                            </select>
                            <select
                              value={user.role || 'user'}
                              onChange={(e) => updateUser(user.id, { role: e.target.value })}
                              className="px-2 py-1 text-xs bg-bg-base border border-border-DEFAULT rounded text-text-primary"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => deleteUser(user.id, user.email)}
                              className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border-DEFAULT">
            <p className="text-sm text-text-secondary">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-bg-elevated text-text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-base transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 text-sm bg-bg-elevated text-text-primary rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-base transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
