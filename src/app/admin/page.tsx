'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import { UserGrowthChart, DebatesPerDayChart, ChartSkeleton } from '@/components/admin/Charts';

// Types for API response
interface StatsData {
  kpis: {
    totalUsers: number;
    proSubscribers: number;
    mrr: number;
    totalDebates: number;
    debatesToday: number;
    debatesThisWeek: number;
  };
  charts: {
    userGrowth: Array<{ created_at: string }>;
    debatesPerDay: Array<{ created_at: string }>;
  };
  recentActivity: {
    users: Array<{ id: string; email: string; tier: string; created_at: string }>;
    debates: Array<{ id: string; prompt: string; user_id: string; created_at: string }>;
  };
}

// Skeleton loading component for stats cards
const StatsCardSkeleton = () => (
  <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-4 bg-bg-subtle rounded w-24"></div>
      <div className="h-5 w-5 bg-bg-subtle rounded"></div>
    </div>
    <div className="h-10 bg-bg-subtle rounded w-20 mb-2"></div>
  </div>
);

// Activity item skeleton
const ActivitySkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 bg-bg-subtle rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-bg-subtle rounded w-48 mb-2"></div>
      <div className="h-3 bg-bg-subtle rounded w-32"></div>
    </div>
  </div>
);

// Icons as simple SVG components
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l3.057-3L12 5.885 15.943 0 19 3l-2 9H7L5 3zm0 13h14v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/admin/stats');

        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Combine and sort recent activity
  const recentActivityItems = stats?.recentActivity
    ? [
        ...stats.recentActivity.users.map((user) => ({
          type: 'user' as const,
          id: user.id,
          description: `New user signed up: ${user.email}`,
          detail: user.tier === 'pro' ? 'Pro subscriber' : 'Free tier',
          created_at: user.created_at,
        })),
        ...stats.recentActivity.debates.map((debate) => ({
          type: 'debate' as const,
          id: debate.id,
          description: `New debate: "${debate.prompt.slice(0, 50)}${debate.prompt.length > 50 ? '...' : ''}"`,
          detail: debate.user_id ? `User ${debate.user_id.slice(0, 8)}...` : 'Guest',
          created_at: debate.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-page-title text-text-primary">Dashboard Overview</h1>
        <p className="text-body text-text-secondary mt-1">
          Monitor key metrics and platform activity
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-error flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-error text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-sm text-error hover:text-error/80 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              label="Total Users"
              value={stats?.kpis.totalUsers.toLocaleString() ?? '---'}
              icon={<UsersIcon />}
              accentColor="primary"
            />
            <StatsCard
              label="Pro Subscribers"
              value={stats?.kpis.proSubscribers.toLocaleString() ?? '---'}
              icon={<CrownIcon />}
              accentColor="success"
            />
            <StatsCard
              label="MRR"
              value={stats?.kpis.mrr != null ? `$${stats.kpis.mrr.toLocaleString()}` : '$---'}
              icon={<DollarIcon />}
              accentColor="warning"
            />
            <StatsCard
              label="Total Debates"
              value={stats?.kpis.totalDebates.toLocaleString() ?? '---'}
              icon={<ChatIcon />}
              accentColor="primary"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-section-header text-text-primary">User Growth</h2>
            <select className="bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-accent-primary cursor-pointer">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last year</option>
            </select>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <UserGrowthChart data={stats?.charts.userGrowth} />
          )}
        </div>

        {/* Debates Per Day Chart */}
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-section-header text-text-primary">Debates Per Day</h2>
            <select className="bg-bg-base border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-secondary focus:outline-none focus:border-accent-primary cursor-pointer">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          {loading ? (
            <ChartSkeleton />
          ) : (
            <DebatesPerDayChart data={stats?.charts.debatesPerDay} />
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-section-header text-text-primary">Recent Activity</h2>
          <button className="text-sm text-accent-primary hover:text-accent-hover transition-colors font-medium">
            View all
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </div>
        ) : recentActivityItems.length > 0 ? (
          <div className="space-y-2">
            {recentActivityItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-bg-base/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'user'
                    ? 'bg-accent-primary/10 text-accent-primary'
                    : 'bg-success/10 text-success'
                }`}>
                  {item.type === 'user' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary text-sm font-medium truncate">
                    {item.description}
                  </p>
                  <p className="text-text-tertiary text-xs">
                    {item.detail}
                  </p>
                </div>
                <span className="text-text-muted text-xs whitespace-nowrap">
                  {formatRelativeTime(item.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-border-subtle rounded-lg bg-bg-base/50">
            <svg className="w-12 h-12 text-text-muted mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-muted text-sm">No recent activity</p>
            <p className="text-text-tertiary text-xs mt-1">Activity will appear here as users interact</p>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-5 hover:border-border-strong transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase tracking-wider font-medium">Conversion Rate</p>
              <p className="text-text-primary text-xl font-bold">
                {loading ? '---' : stats?.kpis.totalUsers && stats.kpis.proSubscribers
                  ? `${((stats.kpis.proSubscribers / stats.kpis.totalUsers) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-5 hover:border-border-strong transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase tracking-wider font-medium">Debates Today</p>
              <p className="text-text-primary text-xl font-bold">
                {loading ? '---' : stats?.kpis.debatesToday?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-DEFAULT rounded-xl p-5 hover:border-border-strong transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-text-tertiary text-xs uppercase tracking-wider font-medium">Debates This Week</p>
              <p className="text-text-primary text-xl font-bold">
                {loading ? '---' : stats?.kpis.debatesThisWeek?.toLocaleString() ?? '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
