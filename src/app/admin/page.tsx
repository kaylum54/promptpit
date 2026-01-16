'use client';

import { useState, useEffect } from 'react';
import StatsCard from '@/components/admin/StatsCard';
import { UserGrowthChart, DebatesPerDayChart, ChartSkeleton } from '@/components/admin/Charts';

// Types for API response
interface StatsData {
  kpis: {
    totalUsers: number;
    proSubscribers: number;
    freeUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    mrr: number;
    arr: number;
    arpu: string;
    ltv: string;
    conversionRate: string;
    newProThisMonth: number;
    totalDebates: number;
    debatesToday: number;
    debatesThisWeek: number;
    totalPrds: number;
    prdsToday: number;
    prdsThisWeek: number;
    completedPrds: number;
    avgPrdsPerUser: string;
    prdCompletionRate: string;
  };
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    dauPercentOfTotal: string;
    wauPercentOfTotal: string;
  };
  charts: {
    userGrowth: Array<{ created_at: string }>;
    debatesPerDay: Array<{ created_at: string }>;
    prdsPerDay: Array<{ created_at: string }>;
  };
  recentActivity: {
    users: Array<{ id: string; email: string; tier: string; created_at: string }>;
    debates: Array<{ id: string; prompt: string; user_id: string; created_at: string }>;
    prds: Array<{ id: string; name: string; user_id: string; status: string; created_at: string }>;
  };
}

// Skeleton loading components
const StatsCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
    </div>
    <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex items-center gap-4 p-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

// Icons
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

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

// Section Header Component
const SectionHeader = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

// Mini Stat Card
const MiniStat = ({ label, value, change, positive }: { label: string; value: string | number; change?: string; positive?: boolean }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
    <div className="flex items-end gap-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {change && (
        <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-gray-500'}`}>
          {change}
        </span>
      )}
    </div>
  </div>
);

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
          description: `New user: ${user.email}`,
          detail: user.tier === 'pro' ? 'Pro subscriber' : 'Free tier',
          created_at: user.created_at,
          icon: 'user',
        })),
        ...stats.recentActivity.debates.map((debate) => ({
          type: 'debate' as const,
          id: debate.id,
          description: `New debate: "${debate.prompt.slice(0, 40)}${debate.prompt.length > 40 ? '...' : ''}"`,
          detail: debate.user_id ? `User ${debate.user_id.slice(0, 8)}...` : 'Guest',
          created_at: debate.created_at,
          icon: 'debate',
        })),
        ...stats.recentActivity.prds.map((prd) => ({
          type: 'prd' as const,
          id: prd.id,
          description: `New PRD: "${prd.name.slice(0, 40)}${prd.name.length > 40 ? '...' : ''}"`,
          detail: prd.status === 'complete' ? 'Completed' : 'In Progress',
          created_at: prd.created_at,
          icon: 'prd',
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10)
    : [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">
            Monitor key metrics and platform activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Live Data
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* PRIMARY KPIs ROW */}
      {/* ============================================ */}
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
              label="Total PRDs"
              value={stats?.kpis.totalPrds.toLocaleString() ?? '---'}
              icon={<DocumentIcon />}
              accentColor="primary"
            />
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* USER ENGAGEMENT SECTION */}
      {/* ============================================ */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader
          icon={<ActivityIcon />}
          title="User Engagement"
          subtitle="Daily, weekly, and monthly active users"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <MiniStat
              label="DAU"
              value={stats?.engagement.dau ?? 0}
              change={`${stats?.engagement.dauPercentOfTotal}% of users`}
            />
            <MiniStat
              label="WAU"
              value={stats?.engagement.wau ?? 0}
              change={`${stats?.engagement.wauPercentOfTotal}% of users`}
            />
            <MiniStat
              label="MAU"
              value={stats?.engagement.mau ?? 0}
            />
            <MiniStat
              label="New Today"
              value={stats?.kpis.newUsersToday ?? 0}
              change="users"
            />
            <MiniStat
              label="New This Week"
              value={stats?.kpis.newUsersThisWeek ?? 0}
              change="users"
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* PRD METRICS SECTION */}
      {/* ============================================ */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader
          icon={<DocumentIcon />}
          title="PRD Metrics"
          subtitle="Product requirements document analytics"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <MiniStat
              label="Total PRDs"
              value={stats?.kpis.totalPrds ?? 0}
            />
            <MiniStat
              label="Completed"
              value={stats?.kpis.completedPrds ?? 0}
              change={`${stats?.kpis.prdCompletionRate}%`}
              positive
            />
            <MiniStat
              label="Today"
              value={stats?.kpis.prdsToday ?? 0}
            />
            <MiniStat
              label="This Week"
              value={stats?.kpis.prdsThisWeek ?? 0}
            />
            <MiniStat
              label="Avg/User"
              value={stats?.kpis.avgPrdsPerUser ?? '0'}
            />
            <MiniStat
              label="Completion"
              value={`${stats?.kpis.prdCompletionRate ?? 0}%`}
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* REVENUE HEALTH SECTION */}
      {/* ============================================ */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
        <SectionHeader
          icon={<DollarIcon />}
          title="Revenue Health"
          subtitle="Key SaaS metrics and conversion rates"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-emerald-100 rounded w-16 mb-2"></div>
                <div className="h-8 bg-emerald-100 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">MRR</p>
              <span className="text-2xl font-bold text-emerald-700">${stats?.kpis.mrr ?? 0}</span>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">ARR</p>
              <span className="text-2xl font-bold text-emerald-700">${stats?.kpis.arr?.toLocaleString() ?? 0}</span>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">ARPU</p>
              <span className="text-2xl font-bold text-emerald-700">${stats?.kpis.arpu ?? '0'}</span>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">LTV</p>
              <span className="text-2xl font-bold text-emerald-700">${stats?.kpis.ltv ?? '0'}</span>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">Conversion</p>
              <span className="text-2xl font-bold text-emerald-700">{stats?.kpis.conversionRate ?? 0}%</span>
            </div>
            <div className="bg-white/70 rounded-xl p-4 border border-emerald-200/50">
              <p className="text-xs text-emerald-700 uppercase tracking-wider font-medium mb-1">New Pro/Mo</p>
              <span className="text-2xl font-bold text-emerald-700">{stats?.kpis.newProThisMonth ?? 0}</span>
            </div>
          </div>
        )}

        {/* User Tier Breakdown */}
        {!loading && stats && (
          <div className="mt-6 pt-6 border-t border-emerald-200/50">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pro Users: <strong>{stats.kpis.proSubscribers}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-600">Free Users: <strong>{stats.kpis.freeUsers}</strong></span>
              </div>
              <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.kpis.conversionRate}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* CHARTS SECTION */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer">
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
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Debates Per Day</h2>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:border-gray-400 cursor-pointer">
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

      {/* ============================================ */}
      {/* DEBATES & QUICK STATS */}
      {/* ============================================ */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader
          icon={<ChatIcon />}
          title="Debate Activity"
          subtitle="AI debate generation metrics"
        />

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MiniStat
              label="Total Debates"
              value={stats?.kpis.totalDebates ?? 0}
            />
            <MiniStat
              label="Today"
              value={stats?.kpis.debatesToday ?? 0}
            />
            <MiniStat
              label="This Week"
              value={stats?.kpis.debatesThisWeek ?? 0}
            />
            <MiniStat
              label="Avg/User"
              value={stats?.kpis.totalUsers && stats.kpis.totalUsers > 0
                ? ((stats.kpis.totalDebates || 0) / stats.kpis.totalUsers).toFixed(1)
                : '0'}
            />
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* RECENT ACTIVITY FEED */}
      {/* ============================================ */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest platform events</p>
          </div>
          <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
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
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'user'
                    ? 'bg-blue-50 text-blue-600'
                    : item.type === 'prd'
                    ? 'bg-violet-50 text-violet-600'
                    : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {item.type === 'user' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : item.type === 'prd' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm font-medium truncate">
                    {item.description}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {item.detail}
                  </p>
                </div>
                <span className="text-gray-400 text-xs whitespace-nowrap">
                  {formatRelativeTime(item.created_at)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400 text-sm">No recent activity</p>
            <p className="text-gray-300 text-xs mt-1">Activity will appear here as users interact</p>
          </div>
        )}
      </div>
    </div>
  );
}
