'use client';

import { useState, useEffect, useCallback } from 'react';

interface Debate {
  id: string;
  prompt: string;
  user_id: string | null;
  user_email: string;
  winner: string | null;
  is_multi_round: boolean | null;
  total_rounds: number | null;
  created_at: string;
}

interface Stats { total: number; today: number; thisWeek: number; }

export default function AdminDebatesPage() {
  const [debates, setDebates] = useState<Debate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchDebates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', search });
      const res = await fetch('/api/admin/debates?' + params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setDebates(data.debates || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchDebates(); }, [fetchDebates]);

  async function deleteDebate(id: string) {
    if (!confirm('Delete this debate?')) return;
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/debates/' + id, { method: 'DELETE' });
      if (!res.ok) { alert('Failed'); return; }
      await fetchDebates();
    } catch { alert('Error'); } finally { setActionLoading(null); }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function truncate(s: string, n: number) { return s.length > n ? s.slice(0, n) + '...' : s; }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Debates Management</h1>
        <p className="text-text-secondary">View and manage all platform debates</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
            <p className="text-text-secondary text-sm">Total Debates</p>
            <p className="text-2xl font-bold text-text-primary">{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
            <p className="text-text-secondary text-sm">Today</p>
            <p className="text-2xl font-bold text-text-primary">{stats.today}</p>
          </div>
          <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4">
            <p className="text-text-secondary text-sm">This Week</p>
            <p className="text-2xl font-bold text-text-primary">{stats.thisWeek}</p>
          </div>
        </div>
      )}

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg p-4 mb-6">
        <input type="text" placeholder="Search by prompt..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full px-4 py-2 bg-bg-base border border-border-DEFAULT rounded-lg text-text-primary" />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-6 text-red-400">
          {error} <button onClick={fetchDebates} className="ml-4 underline">Retry</button>
        </div>
      )}

      <div className="bg-bg-surface border border-border-DEFAULT rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-DEFAULT bg-bg-elevated">
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Prompt</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">User</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Winner</th>
              <th className="text-left px-4 py-3 text-text-secondary font-medium text-sm">Date</th>
              <th className="text-right px-4 py-3 text-text-secondary font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? [0,1,2,3,4].map((i) => (
              <tr key={i} className="border-b border-border-subtle">
                <td className="px-4 py-3"><div className="h-4 w-48 bg-bg-elevated rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-24 bg-bg-elevated rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-16 bg-bg-elevated rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-24 bg-bg-elevated rounded animate-pulse" /></td>
                <td className="px-4 py-3"><div className="h-4 w-16 bg-bg-elevated rounded animate-pulse ml-auto" /></td>
              </tr>
            )) : debates.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-text-secondary font-medium mb-1">No debates found</p>
                    <p className="text-text-muted text-sm">
                      {search ? 'Try adjusting your search terms' : 'Debates will appear here once users start debating'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : debates.map((d) => (
              <tr key={d.id} className="border-b border-border-subtle hover:bg-bg-elevated/50">
                <td className="px-4 py-3 text-text-primary">{truncate(d.prompt, 50)}</td>
                <td className="px-4 py-3 text-text-secondary text-sm">{d.user_email}</td>
                <td className="px-4 py-3">
                  {d.winner ? <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">{d.winner}</span> : '-'}
                </td>
                <td className="px-4 py-3 text-text-secondary text-sm">{formatDate(d.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  {actionLoading === d.id ? '...' : (
                    <button onClick={() => deleteDebate(d.id)}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex justify-center gap-4 px-4 py-3 border-t border-border-DEFAULT">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-sm bg-bg-elevated rounded disabled:opacity-50">Prev</button>
            <span className="text-sm text-text-secondary">Page {page}/{totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-sm bg-bg-elevated rounded disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
