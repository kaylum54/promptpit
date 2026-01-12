'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Types for analytics data
interface EventCount {
  event_name: string;
  count: number;
}

interface EventOverTime {
  date: string;
  count: number;
}

interface RecentEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  guest_id: string;
  page_url: string | null;
  created_at: string;
}

interface AnalyticsData {
  eventCounts: EventCount[];
  eventsOverTime: EventOverTime[];
  recentEvents: RecentEvent[];
  uniqueEventTypes: string[];
  dateRange: string;
  eventNameFilter: string | null;
  message?: string;
}

// Skeleton loading component for table rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-16"></div></td>
  </tr>
);

const EventRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-32"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-24"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-bg-subtle rounded w-40"></div></td>
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

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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

// Helper to format date for chart
const formatChartDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Event type badge component
const EventBadge = ({ eventName }: { eventName: string }) => {
  const colorMap: Record<string, string> = {
    page_view: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    signup_started: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    signup_completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    login: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    debate_started: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    debate_completed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    upgrade_clicked: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    checkout_started: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    subscription_created: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    feedback_submitted: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };

  const style = colorMap[eventName] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${style}`}>
      {eventName.replace(/_/g, ' ')}
    </span>
  );
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('7days');

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (eventFilter) {
        params.set('event_name', eventFilter);
      }
      params.set('date_range', dateRange);

      const response = await fetch(`/api/admin/analytics?${params}`);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('You do not have permission to view this page');
        }
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [eventFilter, dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Calculate totals
  const totalEvents = data?.eventCounts.reduce((sum, e) => sum + e.count, 0) || 0;
  const maxDailyEvents = data?.eventsOverTime ? Math.max(...data.eventsOverTime.map(e => e.count), 1) : 1;

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
            <h1 className="text-page-title text-text-primary">Event Analytics</h1>
          </div>
          <p className="text-body text-text-secondary">
            Track user events and platform activity
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Event Type Filter */}
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            <option value="">All Events</option>
            {data?.uniqueEventTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-bg-base border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => fetchAnalytics()}
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
            onClick={() => fetchAnalytics()}
            className="ml-auto text-sm text-error hover:text-error/80 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Message Banner (e.g., table not created) */}
      {data?.message && (
        <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-accent-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-accent-primary text-sm">{data.message}</p>
        </div>
      )}

      {/* Stats Summary */}
      {!loading && data && !data.message && (
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <ChartIcon />
              <span className="text-text-secondary">
                Total Events: <span className="text-text-primary font-medium">{totalEvents.toLocaleString()}</span>
              </span>
            </div>
            {eventFilter && (
              <div className="text-text-tertiary">
                Filtered by: <EventBadge eventName={eventFilter} />
              </div>
            )}
            <div className="text-text-tertiary">
              Date range: <span className="text-text-secondary font-medium">
                {dateRange === 'today' ? 'Today' : dateRange === '7days' ? 'Last 7 days' : 'Last 30 days'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout for counts and chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Counts Table */}
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-base/50">
            <h2 className="text-sm font-medium text-text-primary">Event Counts by Type</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-base/30">
                <tr className="border-b border-border-subtle">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Event Name
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Count
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
                  </>
                ) : data?.eventCounts.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                          <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-text-secondary font-medium mb-1">No events recorded</p>
                        <p className="text-text-muted text-xs">Events will appear as users interact with the platform</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data?.eventCounts.map((event) => (
                    <tr
                      key={event.event_name}
                      className="hover:bg-bg-base/50 transition-colors cursor-pointer"
                      onClick={() => setEventFilter(event.event_name)}
                    >
                      <td className="px-4 py-3">
                        <EventBadge eventName={event.event_name} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-text-primary font-medium">{event.count.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Events Over Time Chart */}
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle bg-bg-base/50">
            <h2 className="text-sm font-medium text-text-primary">Events Over Time</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : data?.eventsOverTime.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium mb-1 text-sm">No data available</p>
                <p className="text-text-muted text-xs">Chart data will appear once events are recorded</p>
              </div>
            ) : (
              <div className="h-48">
                {/* Simple bar chart */}
                <div className="h-full flex items-end gap-1">
                  {data?.eventsOverTime.map((point) => {
                    const heightPercent = (point.count / maxDailyEvents) * 100;
                    const hasActivity = point.count > 0;

                    return (
                      <div
                        key={point.date}
                        className="flex-1 group relative flex flex-col justify-end"
                        style={{ minHeight: '100%' }}
                      >
                        {/* Bar */}
                        <div
                          className={`w-full rounded-t transition-all ${
                            hasActivity
                              ? 'bg-accent-primary hover:bg-accent-hover'
                              : 'bg-bg-subtle hover:bg-bg-base'
                          }`}
                          style={{
                            height: hasActivity ? `${Math.max(heightPercent, 8)}%` : '4px',
                            minHeight: hasActivity ? '12px' : '4px'
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-elevated border border-border-subtle rounded text-xs text-text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                          {formatChartDate(point.date)}: {point.count} event{point.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* X-axis labels */}
                <div className="flex justify-between mt-2 text-xs text-text-muted">
                  <span>{formatChartDate(data?.eventsOverTime[0]?.date || '')}</span>
                  <span>{formatChartDate(data?.eventsOverTime[data.eventsOverTime.length - 1]?.date || '')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className="bg-bg-surface border border-border-DEFAULT rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle bg-bg-base/50">
          <h2 className="text-sm font-medium text-text-primary">Recent Events (Last 20)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg-base/30">
              <tr className="border-b border-border-subtle">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-tertiary uppercase tracking-wider">
                  User / Guest ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <>
                  <EventRowSkeleton />
                  <EventRowSkeleton />
                  <EventRowSkeleton />
                  <EventRowSkeleton />
                  <EventRowSkeleton />
                </>
              ) : data?.recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-12 h-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-text-muted text-sm">No events recorded yet</p>
                      <p className="text-text-tertiary text-xs mt-1">
                        Events will appear here as users interact with the platform
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="hover:bg-bg-base/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-text-primary" title={new Date(event.created_at).toLocaleString()}>
                        {formatRelativeTime(event.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EventBadge eventName={event.event_name} />
                    </td>
                    <td className="px-4 py-3">
                      {event.user_id ? (
                        <div className="flex flex-col">
                          <span className="text-sm text-text-primary font-mono">
                            {event.user_id.slice(0, 8)}...
                          </span>
                          <span className="text-xs text-text-muted">User</span>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm text-text-secondary font-mono">
                            {event.guest_id.slice(0, 8)}...
                          </span>
                          <span className="text-xs text-text-muted">Guest</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
