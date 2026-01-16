'use client';

import Link from 'next/link';

interface User {
  name: string;
  plan: 'free' | 'pro';
}

interface Project {
  id: string;
  name: string;
  status: 'idea' | 'prd' | 'building' | 'launched';
  updatedAt: Date;
  phase?: number;
  template?: string;
}

interface DashboardHomeProps {
  user: User;
  projects: Project[];
  stats: {
    totalProjects: number;
    prdsCompleted: number;
    launched: number;
    timeSaved: number;
  };
}

export function DashboardHome({ user, projects, stats }: DashboardHomeProps) {
  const hasProjects = projects.length > 0;
  const recentProject = projects[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
      {/* Subtle background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.name.split(' ')[0]}
            </h1>
            <p className="text-gray-500 mt-1">
              {hasProjects
                ? "Here's what's happening with your projects"
                : "Ready to build something amazing?"
              }
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="
                w-64 pl-10 pr-4 py-2.5
                bg-white border border-gray-200 rounded-xl
                text-sm text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
                shadow-sm
                transition-all duration-200
              "
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-mono rounded">
              /
            </kbd>
          </div>
        </header>

        {/* Main Grid - Top Row */}
        <div className="grid grid-cols-12 gap-5 mb-6">
          {/* Start Building Card */}
          <div className="col-span-12 md:col-span-5">
            <Link
              href="/dashboard/prd/new"
              className="
                group block h-full min-h-[200px]
                bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
                rounded-2xl p-6
                border border-gray-800
                shadow-xl shadow-gray-900/20
                hover:shadow-2xl hover:shadow-gray-900/30
                hover:-translate-y-1
                transition-all duration-300
                overflow-hidden
                relative
              "
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-500/20 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gray-600/10 to-transparent rounded-full blur-2xl" />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '32px 32px',
                }}
              />

              <div className="relative">
                {/* Icon */}
                <div className="
                  w-12 h-12 rounded-xl
                  bg-white/10 backdrop-blur-sm
                  border border-white/20
                  flex items-center justify-center
                  mb-12
                  group-hover:scale-110 group-hover:bg-white/20
                  transition-all duration-300
                ">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>

                {/* Text */}
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {hasProjects ? 'Start New Project' : 'Start Building'}
                  </h2>
                  <p className="text-gray-400 text-sm mb-4">
                    {hasProjects
                      ? 'Create another PRD from scratch or use a template'
                      : 'Create your first PRD and bring your idea to life'
                    }
                  </p>
                  <div className="flex items-center gap-2 text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                    Get started
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Continue / Recent Project Card */}
          <div className="col-span-12 md:col-span-4">
            {hasProjects && recentProject ? (
              <ContinueProjectCard project={recentProject} />
            ) : (
              <EmptyStateCard />
            )}
          </div>

          {/* Stats Card */}
          <div className="col-span-12 md:col-span-3">
            <StatsCard stats={stats} hasProjects={hasProjects} />
          </div>
        </div>

        {/* Quick Start Templates */}
        <div className="mb-6">
          <QuickStartTemplates />
        </div>

        {/* Bottom Section - Two Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* What You Can Build / Recent Projects */}
          <div>
            {hasProjects ? (
              <RecentProjectsList projects={projects.slice(0, 4)} />
            ) : (
              <WhatYouCanBuild />
            )}
          </div>

          {/* Pro Tips / Activity */}
          <div>
            {hasProjects ? (
              <ActivityFeed />
            ) : (
              <ProTips />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Continue Project Card
function ContinueProjectCard({ project }: { project: Project }) {
  const phaseNames = ['Idea', 'Features', 'Tech', 'Security', 'Costs', 'Output'];

  return (
    <Link
      href={`/dashboard/prd/${project.id}`}
      className="
        group block h-full min-h-[200px]
        bg-white rounded-2xl p-6
        border border-gray-200
        shadow-sm hover:shadow-lg
        hover:border-gray-300
        hover:-translate-y-1
        transition-all duration-300
      "
    >
      <div className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-3">
        <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse" />
        Continue where you left off
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
        {project.name}
      </h3>

      {project.phase && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span>Phase {project.phase}: {phaseNames[project.phase - 1]}</span>
            <span>{Math.round((project.phase / 6) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full transition-all duration-500"
              style={{ width: `${(project.phase / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Updated {formatRelativeTime(project.updatedAt)}
      </div>
    </Link>
  );
}

// Empty State Card (when no projects)
function EmptyStateCard() {
  return (
    <div className="
      h-full min-h-[200px]
      bg-gradient-to-br from-gray-50 to-white
      rounded-2xl p-6
      border border-gray-200 border-dashed
      flex flex-col items-center justify-center text-center
    ">
      <div className="
        w-14 h-14 rounded-2xl
        bg-gray-100
        flex items-center justify-center
        mb-4
      ">
        <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
      </div>
      <p className="text-gray-500 text-sm mb-1">No projects in progress</p>
      <p className="text-gray-400 text-xs">Start a new project to see it here</p>
    </div>
  );
}

// Stats Card
function StatsCard({ stats, hasProjects }: { stats: DashboardHomeProps['stats']; hasProjects: boolean }) {
  return (
    <div className="
      h-full min-h-[200px]
      bg-white rounded-2xl p-5
      border border-gray-200
      shadow-sm
    ">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
        This Month
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <StatItem
          value={stats.totalProjects}
          label="Projects"
        />
        <StatItem
          value={stats.prdsCompleted}
          label="PRDs Done"
        />
        <StatItem
          value={stats.launched}
          label="Launched"
        />
        <StatItem
          value={`${stats.timeSaved}h`}
          label="Time Saved"
          highlight={stats.timeSaved > 0}
        />
      </div>

      {!hasProjects && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Stats will appear once you start building
          </p>
        </div>
      )}
    </div>
  );
}

function StatItem({
  value,
  label,
  highlight
}: {
  value: number | string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className={`
        text-2xl font-bold
        ${highlight ? 'text-green-600' : 'text-gray-900'}
      `}>
        {value}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

// Quick Start Templates
function QuickStartTemplates() {
  const templates = [
    { id: 'saas', name: 'SaaS Starter', icon: '📦', color: 'from-gray-600 to-gray-800' },
    { id: 'mobile', name: 'Mobile App', icon: '📱', color: 'from-gray-700 to-gray-900' },
    { id: 'api', name: 'API Service', icon: '⚡', color: 'from-amber-500 to-orange-500' },
    { id: 'marketplace', name: 'Marketplace', icon: '🏪', color: 'from-emerald-500 to-teal-500' },
    { id: 'chrome', name: 'Chrome Ext', icon: '🧩', color: 'from-gray-500 to-gray-700' },
  ];

  return (
    <div className="
      bg-white rounded-2xl p-5
      border border-gray-200
      shadow-sm
    ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Quick Start Templates</h3>
        <Link
          href="/dashboard/templates"
          className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/dashboard/prd/new?template=${template.id}`}
            className="
              group
              bg-gray-50 hover:bg-white
              rounded-xl p-4
              border border-gray-100 hover:border-gray-200
              hover:shadow-md
              transition-all duration-200
              text-center
            "
          >
            <div className={`
              w-10 h-10 rounded-lg mx-auto mb-2
              bg-gradient-to-br ${template.color}
              flex items-center justify-center
              text-lg
              group-hover:scale-110
              transition-transform duration-200
              shadow-sm
            `}>
              {template.icon}
            </div>
            <p className="text-xs font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
              {template.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// What You Can Build (for new users)
function WhatYouCanBuild() {
  const features = [
    {
      icon: '📄',
      title: 'Complete PRD in minutes',
      description: 'AI guides you through defining your product',
    },
    {
      icon: '🏟️',
      title: 'AI architecture debates',
      description: 'Watch models debate the best tech stack',
    },
    {
      icon: '💰',
      title: 'Cost estimation',
      description: 'Know your monthly costs before you build',
    },
    {
      icon: '🚀',
      title: 'Claude Code prompts',
      description: 'Export directly to Claude Code and start building',
    },
  ];

  return (
    <div className="
      bg-white rounded-2xl p-6
      border border-gray-200
      shadow-sm
    ">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">What You Can Build</h3>

      <div className="space-y-4">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="
              w-9 h-9 rounded-lg
              bg-gradient-to-br from-gray-50 to-gray-100
              border border-gray-200
              flex items-center justify-center
              text-base
              flex-shrink-0
            ">
              {feature.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{feature.title}</p>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pro Tips (for new users)
function ProTips() {
  const tips = [
    {
      icon: '💡',
      tip: 'Start with the problem, not the solution',
      color: 'from-amber-50 to-yellow-50',
      border: 'border-amber-200/60',
    },
    {
      icon: '🎯',
      tip: 'Be specific about your target audience',
      color: 'from-gray-50 to-gray-100',
      border: 'border-gray-200',
    },
    {
      icon: '✂️',
      tip: 'Cut features ruthlessly for your MVP',
      color: 'from-rose-50 to-pink-50',
      border: 'border-rose-200/60',
    },
    {
      icon: '🔄',
      tip: "You can always iterate — shipping beats perfection",
      color: 'from-emerald-50 to-green-50',
      border: 'border-emerald-200/60',
    },
  ];

  return (
    <div className="
      bg-white rounded-2xl p-6
      border border-gray-200
      shadow-sm
    ">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Pro Tips</h3>

      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div
            key={i}
            className={`
              flex items-center gap-3
              bg-gradient-to-r ${tip.color}
              rounded-lg p-3
              border ${tip.border}
            `}
          >
            <span className="text-lg">{tip.icon}</span>
            <p className="text-sm text-gray-700">{tip.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recent Projects List (when user has projects)
function RecentProjectsList({ projects }: { projects: Project[] }) {
  const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    idea: { label: 'Idea', color: 'text-gray-600', bg: 'bg-gray-100', dot: 'bg-gray-400' },
    prd: { label: 'In Progress', color: 'text-amber-600', bg: 'bg-amber-100', dot: 'bg-amber-500' },
    building: { label: 'Building', color: 'text-blue-600', bg: 'bg-blue-100', dot: 'bg-blue-500' },
    launched: { label: 'Launched', color: 'text-green-600', bg: 'bg-green-100', dot: 'bg-green-500' },
  };

  return (
    <div className="
      bg-white rounded-2xl p-6
      border border-gray-200
      shadow-sm
    ">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Recent Projects</h3>
        <Link
          href="/dashboard/projects"
          className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map((project) => {
          const status = statusConfig[project.status];
          return (
            <Link
              key={project.id}
              href={`/dashboard/prd/${project.id}`}
              className="
                flex items-center gap-3 p-3
                bg-gray-50 hover:bg-gray-100
                rounded-xl
                transition-colors duration-200
              "
            >
              <div className={`w-2 h-2 rounded-full ${status.dot} ${project.status === 'prd' ? 'animate-pulse' : ''}`} />
              <span className="flex-1 text-sm font-medium text-gray-900 truncate">
                {project.name}
              </span>
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                ${status.bg} ${status.color}
              `}>
                {status.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Activity Feed
function ActivityFeed() {
  // Placeholder for actual activity data
  const activities = [
    { type: 'prd_created', project: 'SaaS Starter Project', time: '2 hours ago' },
    { type: 'phase_completed', project: 'SaaS Starter Project', phase: 'Idea', time: '2 hours ago' },
  ];

  return (
    <div className="
      bg-white rounded-2xl p-6
      border border-gray-200
      shadow-sm
    ">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Your Activity</h3>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {activity.type === 'prd_created'
                    ? `Created "${activity.project}"`
                    : `Completed ${activity.phase} phase`
                  }
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-gray-400">No activity yet</p>
        </div>
      )}
    </div>
  );
}

// Helper function
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
