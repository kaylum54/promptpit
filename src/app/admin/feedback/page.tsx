'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Types for feedback data
interface FeedbackItem {
  id: string;
  user_id: string | null;
  email: string | null;
  category: string | null;
  message: string;
  page_url: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    reviewed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  const style = styles[status as keyof typeof styles] || styles.new;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${style} capitalize`}>
      {status}
    </span>
  );
};

// Skeleton loading component
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-20"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-32"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-48"></div></td>
    <td className="px-4 py-3"><div className="h-6 bg-bg-subtle rounded w-16"></div></td>
    <td className="px-4 py-3"><div className="h-8 bg-bg-subtle rounded w-32"></div></td>
  </tr>
);

// Icons
const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text helper
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // Fetch feedback data
  const fetchFeedback = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/admin/feedback?${params}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view this page');
        }
        throw new Error(`Failed to fetch feedback: ${response.statusText}`);
      }

      const data = await response.json();
      setFeedback(data.feedback);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Update feedback status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setActionLoading(id);

      const response = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      setFeedback(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete feedback
  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      setActionLoading(id);

      const response = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      // Remove from local state
      setFeedback(prev => prev.filter(item => item.id !== id));

      // Update pagination total
      if (pagination) {
        setPagination(prev => prev ? { ...prev, total: prev.total - 1 } : null);
      }
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback');
    } finally {
      setActionLoading(null);
    }
  };

  // Load more (pagination)
  const loadMore = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchFeedback(pagination.page + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/admin"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeftIcon />
            </Link>
            <h1 className="text-page-title text-text-primary">Feedback Management</h1>
          </div>
          <p className="text-body text-text-secondary">
            Review and manage user feedback submissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchFeedback()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border-subtle rounded-md text-sm text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors disabled:opacity-50"
          >
            <RefreshIcon />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-error text-sm">{error}</p>
          <button
            onClick={() => fetchFeedback()}
            className="ml-auto text-sm text-error hover:text-error/80 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Summary */}
      {pagination && !loading && (
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-text-secondary">
              Total: <span className="text-text-primary font-medium">{pagination.total}</span> feedback items
            </div>
            {statusFilter !== 'all' && (
              <div className="text-text-tertiary">
                Filtered by: <StatusBadge status={statusFilter} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Table */}
      <div className="bg-bg-surface border border-border-DEFAULT rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-base/50">
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : feedback.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <p className="text-text-muted text-sm">No feedback found</p>
                      <p className="text-text-tertiary text-xs mt-1">
                        {statusFilter !== 'all'
                          ? 'Try changing the status filter'
                          : 'Feedback will appear here when users submit it'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedback.map((item) => (
                  <>
                    <tr
                      key={item.id}
                      className={`hover:bg-bg-base/50 transition-colors ${expandedRow === item.id ? 'bg-bg-base/30' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="text-sm text-text-primary" title={formatDate(item.created_at)}>
                          {formatRelativeTime(item.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-secondary capitalize">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-primary">
                          {item.email || <span className="text-text-muted italic">Anonymous</span>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-secondary">
                            {truncateText(item.message, 60)}
                          </span>
                          {item.message.length > 60 && (
                            <button
                              onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                              className="text-accent-primary hover:text-accent-hover text-xs"
                            >
                              {expandedRow === item.id ? 'Less' : 'More'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status || 'new'} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {item.status !== 'reviewed' && (
                            <button
                              onClick={() => updateStatus(item.id, 'reviewed')}
                              disabled={actionLoading === item.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded hover:bg-yellow-500/20 transition-colors disabled:opacity-50"
                              title="Mark as Reviewed"
                            >
                              <EyeIcon />
                              <span className="hidden lg:inline">Reviewed</span>
                            </button>
                          )}
                          {item.status !== 'resolved' && (
                            <button
                              onClick={() => updateStatus(item.id, 'resolved')}
                              disabled={actionLoading === item.id}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                              title="Mark as Resolved"
                            >
                              <CheckIcon />
                              <span className="hidden lg:inline">Resolved</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteFeedback(item.id)}
                            disabled={actionLoading === item.id}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-error/10 text-error border border-error/20 rounded hover:bg-error/20 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <TrashIcon />
                            <span className="hidden lg:inline">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row for full message */}
                    {expandedRow === item.id && (
                      <tr key={`${item.id}-expanded`} className="bg-bg-base/50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs text-text-tertiary uppercase tracking-wider">Full Message:</span>
                              <p className="text-sm text-text-primary mt-1 whitespace-pre-wrap">
                                {item.message}
                              </p>
                            </div>
                            {item.page_url && (
                              <div>
                                <span className="text-xs text-text-tertiary uppercase tracking-wider">Page URL:</span>
                                <p className="text-sm text-text-secondary mt-1">{item.page_url}</p>
                              </div>
                            )}
                            {item.user_agent && (
                              <div>
                                <span className="text-xs text-text-tertiary uppercase tracking-wider">User Agent:</span>
                                <p className="text-xs text-text-muted mt-1 font-mono">{truncateText(item.user_agent, 100)}</p>
                              </div>
                            )}
                            <div>
                              <span className="text-xs text-text-tertiary uppercase tracking-wider">Submitted:</span>
                              <p className="text-sm text-text-secondary mt-1">{formatDate(item.created_at)}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Load More / Pagination */}
        {pagination && pagination.page < pagination.totalPages && !loading && (
          <div className="border-t border-border-subtle px-4 py-4 flex justify-center">
            <button
              onClick={loadMore}
              className="px-4 py-2 bg-bg-base border border-border-subtle rounded-md text-sm text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
            >
              Load More ({pagination.total - feedback.length} remaining)
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {pagination && !loading && feedback.length > 0 && (
          <div className="border-t border-border-subtle px-4 py-3 bg-bg-base/30">
            <p className="text-xs text-text-tertiary text-center">
              Showing {feedback.length} of {pagination.total} items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
