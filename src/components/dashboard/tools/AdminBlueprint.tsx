'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface AdminModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  features: {
    id: string;
    name: string;
    description: string;
  }[];
  files: string[];
  dependencies?: string[];
}

interface Project {
  id: string;
  name: string;
  prd_content?: Record<string, unknown>;
}

// ============================================================================
// ADMIN MODULES CONFIGURATION
// ============================================================================

const adminModules: AdminModule[] = [
  {
    id: 'users',
    name: 'User Management',
    description: 'CRUD operations for users, roles, and permissions',
    icon: '👥',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    features: [
      { id: 'user-list', name: 'User List', description: 'Searchable, sortable table with pagination' },
      { id: 'user-modal', name: 'Create/Edit Modal', description: 'Form with validation for user data' },
      { id: 'role-management', name: 'Role Assignment', description: 'Assign and manage user roles' },
      { id: 'bulk-actions', name: 'Bulk Actions', description: 'Select multiple users for batch operations' },
      { id: 'activity-log', name: 'Activity Logs', description: 'Track user actions and login history' },
    ],
    files: [
      '/app/admin/users/page.tsx',
      '/app/admin/users/[id]/page.tsx',
      '/components/admin/users/UserTable.tsx',
      '/components/admin/users/UserModal.tsx',
      '/components/admin/users/RoleSelect.tsx',
      '/app/api/admin/users/route.ts',
    ],
  },
  {
    id: 'analytics',
    name: 'Dashboard Analytics',
    description: 'Key metrics, charts, and KPI tracking',
    icon: '📊',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    features: [
      { id: 'summary-cards', name: 'Summary Cards', description: 'Key metrics at a glance' },
      { id: 'time-series', name: 'Time-series Charts', description: 'Track metrics over time' },
      { id: 'comparison', name: 'Comparison Metrics', description: 'Period-over-period comparisons' },
      { id: 'export', name: 'Export Reports', description: 'Download data as CSV/PDF' },
      { id: 'date-range', name: 'Custom Date Ranges', description: 'Filter by any date period' },
    ],
    files: [
      '/app/admin/analytics/page.tsx',
      '/components/admin/analytics/MetricCard.tsx',
      '/components/admin/analytics/TimeSeriesChart.tsx',
      '/components/admin/analytics/ComparisonWidget.tsx',
      '/app/api/admin/analytics/route.ts',
    ],
  },
  {
    id: 'content',
    name: 'Content Management',
    description: 'Manage pages, posts, and media files',
    icon: '📝',
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    features: [
      { id: 'page-list', name: 'Content List', description: 'View and manage all content' },
      { id: 'rich-editor', name: 'Rich Text Editor', description: 'WYSIWYG content editing' },
      { id: 'media-library', name: 'Media Library', description: 'Upload and manage images/files' },
      { id: 'scheduling', name: 'Publish Scheduling', description: 'Schedule content for future' },
      { id: 'versioning', name: 'Version History', description: 'Track and restore changes' },
    ],
    files: [
      '/app/admin/content/page.tsx',
      '/app/admin/content/[id]/edit/page.tsx',
      '/components/admin/content/ContentEditor.tsx',
      '/components/admin/content/MediaLibrary.tsx',
      '/app/api/admin/content/route.ts',
    ],
  },
  {
    id: 'settings',
    name: 'Settings & Config',
    description: 'Application settings and configuration',
    icon: '⚙️',
    color: 'gray',
    gradient: 'from-gray-500 to-gray-600',
    features: [
      { id: 'general', name: 'General Settings', description: 'App name, logo, basic config' },
      { id: 'feature-flags', name: 'Feature Flags', description: 'Toggle features on/off' },
      { id: 'api-keys', name: 'API Keys', description: 'Manage API access tokens' },
      { id: 'webhooks', name: 'Webhooks', description: 'Configure webhook endpoints' },
      { id: 'backup', name: 'Backup/Restore', description: 'Database backup management' },
    ],
    files: [
      '/app/admin/settings/page.tsx',
      '/app/admin/settings/api-keys/page.tsx',
      '/components/admin/settings/SettingsForm.tsx',
      '/components/admin/settings/FeatureToggle.tsx',
      '/app/api/admin/settings/route.ts',
    ],
  },
  {
    id: 'billing',
    name: 'Billing & Subscriptions',
    description: 'Manage subscriptions, invoices, and payments',
    icon: '💳',
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    features: [
      { id: 'subscription-list', name: 'Subscription List', description: 'View all active subscriptions' },
      { id: 'invoice-history', name: 'Invoice History', description: 'Past invoices and receipts' },
      { id: 'plan-management', name: 'Plan Management', description: 'Create and edit pricing plans' },
      { id: 'refunds', name: 'Refund Processing', description: 'Handle refund requests' },
      { id: 'revenue-metrics', name: 'Revenue Metrics', description: 'MRR, churn, LTV tracking' },
    ],
    files: [
      '/app/admin/billing/page.tsx',
      '/app/admin/billing/subscriptions/page.tsx',
      '/components/admin/billing/SubscriptionTable.tsx',
      '/components/admin/billing/RevenueChart.tsx',
      '/app/api/admin/billing/route.ts',
    ],
    dependencies: ['Stripe'],
  },
  {
    id: 'support',
    name: 'Support Tickets',
    description: 'Customer support and ticket management',
    icon: '🎫',
    color: 'red',
    gradient: 'from-red-500 to-red-600',
    features: [
      { id: 'ticket-list', name: 'Ticket Queue', description: 'View and manage support tickets' },
      { id: 'ticket-detail', name: 'Ticket Detail', description: 'Full conversation thread' },
      { id: 'assignment', name: 'Agent Assignment', description: 'Assign tickets to team members' },
      { id: 'canned-responses', name: 'Canned Responses', description: 'Quick reply templates' },
      { id: 'sla-tracking', name: 'SLA Tracking', description: 'Response time monitoring' },
    ],
    files: [
      '/app/admin/support/page.tsx',
      '/app/admin/support/[id]/page.tsx',
      '/components/admin/support/TicketList.tsx',
      '/components/admin/support/TicketThread.tsx',
      '/app/api/admin/support/route.ts',
    ],
  },
  {
    id: 'audit',
    name: 'Audit Logs',
    description: 'Track all system activities and changes',
    icon: '📋',
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    features: [
      { id: 'activity-timeline', name: 'Activity Timeline', description: 'Chronological event log' },
      { id: 'user-actions', name: 'User Actions', description: 'Track who did what' },
      { id: 'system-events', name: 'System Events', description: 'Automated system actions' },
      { id: 'filters', name: 'Advanced Filters', description: 'Filter by user, action, date' },
      { id: 'export-logs', name: 'Export Logs', description: 'Download for compliance' },
    ],
    files: [
      '/app/admin/audit/page.tsx',
      '/components/admin/audit/AuditTimeline.tsx',
      '/components/admin/audit/AuditFilters.tsx',
      '/lib/audit-logger.ts',
      '/app/api/admin/audit/route.ts',
    ],
  },
  {
    id: 'notifications',
    name: 'Notification Center',
    description: 'Email templates and push notification management',
    icon: '🔔',
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    features: [
      { id: 'email-templates', name: 'Email Templates', description: 'Customize transactional emails' },
      { id: 'push-notifications', name: 'Push Notifications', description: 'Send push to users' },
      { id: 'in-app', name: 'In-App Notifications', description: 'Notification bell system' },
      { id: 'scheduling', name: 'Scheduled Sends', description: 'Queue notifications for later' },
      { id: 'analytics', name: 'Delivery Analytics', description: 'Open rates, click rates' },
    ],
    files: [
      '/app/admin/notifications/page.tsx',
      '/app/admin/notifications/templates/page.tsx',
      '/components/admin/notifications/TemplateEditor.tsx',
      '/lib/notification-sender.ts',
      '/app/api/admin/notifications/route.ts',
    ],
  },
];

// ============================================================================
// COLOR CONFIGURATION
// ============================================================================

const colorConfig: Record<string, { bg: string; border: string; text: string; light: string; ring: string }> = {
  blue: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-600', light: 'bg-blue-50', ring: 'ring-blue-500/20' },
  emerald: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', ring: 'ring-emerald-500/20' },
  amber: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-600', light: 'bg-amber-50', ring: 'ring-amber-500/20' },
  gray: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-600', light: 'bg-gray-50', ring: 'ring-gray-500/20' },
  pink: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-600', light: 'bg-pink-50', ring: 'ring-pink-500/20' },
  red: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-600', light: 'bg-red-50', ring: 'ring-red-500/20' },
  indigo: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50', ring: 'ring-indigo-500/20' },
  violet: { bg: 'bg-violet-500', border: 'border-violet-500', text: 'text-violet-600', light: 'bg-violet-50', ring: 'ring-violet-500/20' },
};

// ============================================================================
// HELPER: Extract tech stack from PRD
// ============================================================================

interface PRDContent {
  techStack?: {
    frontend?: string;
    database?: string;
    auth?: string;
  };
  architecture?: {
    techStack?: {
      frontend?: string;
      database?: string;
      auth?: string;
    };
  };
}

function extractTechStack(project: Project): { frontend: string; database: string; auth: string } | null {
  if (!project.prd_content) return null;
  const prd = project.prd_content as PRDContent;

  return {
    frontend: prd.techStack?.frontend || prd.architecture?.techStack?.frontend || 'Next.js',
    database: prd.techStack?.database || prd.architecture?.techStack?.database || 'PostgreSQL',
    auth: prd.techStack?.auth || prd.architecture?.techStack?.auth || 'NextAuth.js',
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AdminBlueprint() {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedModules, setSelectedModules] = useState<string[]>(['users', 'analytics', 'settings', 'audit']);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [activeDetailModule, setActiveDetailModule] = useState<string | null>('users');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Fetch projects
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/prd');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const prds = data.prds || [];
        setProjects(prds);
        if (prds.length > 0) {
          setSelectedProjectId(prds[0].id);
        }
      } catch {
        console.error('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const techStack = selectedProject ? extractTechStack(selectedProject) : null;

  // Get selected module objects
  const selectedModuleObjects = useMemo(() =>
    adminModules.filter(m => selectedModules.includes(m.id)),
    [selectedModules]
  );

  // Calculate totals
  const totalFiles = useMemo(() =>
    selectedModuleObjects.reduce((acc, m) => acc + m.files.length, 0),
    [selectedModuleObjects]
  );

  const totalFeatures = useMemo(() =>
    selectedModuleObjects.reduce((acc, m) => acc + m.features.length, 0),
    [selectedModuleObjects]
  );

  // Handlers
  const toggleModule = (moduleId: string) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const selectAll = () => {
    setSelectedModules(adminModules.map(m => m.id));
  };

  const deselectAll = () => {
    setSelectedModules([]);
  };

  // Generate Claude Code prompt
  const generatePrompt = () => {
    const moduleNames = selectedModuleObjects.map(m => m.name).join(', ');
    const allFiles = selectedModuleObjects.flatMap(m => m.files);
    const allFeatures = selectedModuleObjects.flatMap(m =>
      m.features.map(f => `- ${m.name}: ${f.name} - ${f.description}`)
    );

    return `Generate a complete admin panel for ${selectedProject?.name || 'my project'}.

## Tech Stack
- Frontend: ${techStack?.frontend || 'Next.js 14 with App Router'}
- Database: ${techStack?.database || 'PostgreSQL with Prisma'}
- Auth: ${techStack?.auth || 'NextAuth.js'}

## Modules to Generate
${moduleNames}

## Required Features
${allFeatures.join('\n')}

## Files to Create
${allFiles.map(f => `- ${f}`).join('\n')}

## Requirements

1. **Use shadcn/ui components** for consistent styling
2. **Implement proper loading states** and error handling
3. **Add pagination** to all list views (10 items per page)
4. **Include search and filter** functionality
5. **Create reusable components** in /components/admin/
6. **Add proper TypeScript types** for all data
7. **Implement proper authentication guards** on all routes
8. **Use React Query** for data fetching and caching

## Admin Layout Structure

Create /app/admin/layout.tsx with:
- Collapsible sidebar with module navigation
- Header with user menu and notifications
- Breadcrumb navigation
- Mobile-responsive design

## Database Schema

Generate Prisma schema additions needed for:
${selectedModuleObjects.map(m => `- ${m.name}: ${m.features.map(f => f.name).join(', ')}`).join('\n')}

Please generate all files with complete, production-ready code.`;
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatePrompt());
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto" />
          <p className="mt-4 text-gray-500">Loading projects...</p>
        </div>
      </div>
    );
  }

  // No projects state
  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏗️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Complete a PRD First</h2>
          <p className="text-gray-500 mb-6">
            The Admin Blueprint generates code tailored to your project&apos;s tech stack and database schema.
          </p>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-violet-500/25 hover:shadow-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Your First PRD
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl shadow-violet-500/20">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-900/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />

          {/* Floating module icons */}
          <div className="absolute top-12 right-12 opacity-20 hidden lg:block">
            <div className="flex gap-3">
              {['👥', '📊', '⚙️', '💳'].map((icon, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl"
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xl">
                  <span className="text-4xl">🏗️</span>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      Pro Tool
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/80 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      Code Generator
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Admin Blueprint</h1>
                  <p className="text-violet-100 text-lg max-w-xl">
                    Generate a complete, production-ready admin panel tailored to your tech stack
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{selectedModules.length}</div>
                  <p className="text-white/70 text-xs font-medium">Modules</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{totalFeatures}</div>
                  <p className="text-white/70 text-xs font-medium">Features</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-center">
                  <div className="text-3xl font-bold text-white mb-1">{totalFiles}</div>
                  <p className="text-white/70 text-xs font-medium">Files</p>
                </div>
              </div>
            </div>

            {/* Project & Tech Stack */}
            <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <span className="text-white/60 text-sm">Generating for:</span>
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl px-4 py-2 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  {projects.map(project => (
                    <option key={project.id} value={project.id} className="text-gray-900">
                      {project.name}
                    </option>
                  ))}
                </select>
                {techStack && (
                  <div className="flex items-center gap-2">
                    {[techStack.frontend, techStack.database, techStack.auth].filter(Boolean).map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/80">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
                >
                  Select All
                </button>
                <span className="text-white/30">|</span>
                <button
                  onClick={deselectAll}
                  className="px-3 py-1.5 text-xs font-medium text-white/70 hover:text-white transition-colors"
                >
                  Deselect All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left - Module Selection */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-sm font-semibold text-gray-900">Select Modules</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Choose what to include in your admin panel
                </p>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {adminModules.map((module) => {
                    const isSelected = selectedModules.includes(module.id);
                    const isHovered = hoveredModule === module.id;
                    const colors = colorConfig[module.color];

                    return (
                      <button
                        key={module.id}
                        onClick={() => toggleModule(module.id)}
                        onMouseEnter={() => {
                          setHoveredModule(module.id);
                          setActiveDetailModule(module.id);
                        }}
                        onMouseLeave={() => setHoveredModule(null)}
                        className={`
                          relative p-4 rounded-xl text-left
                          transition-all duration-300
                          ${isSelected
                            ? `${colors.light} border-2 ${colors.border} shadow-md`
                            : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-white'
                          }
                          ${isHovered ? 'scale-[1.02]' : ''}
                        `}
                      >
                        {/* Selection indicator */}
                        <div className={`
                          absolute top-3 right-3 w-5 h-5 rounded-md
                          flex items-center justify-center
                          transition-all duration-200
                          ${isSelected ? `${colors.bg} text-white` : 'bg-gray-200 text-transparent'}
                        `}>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>

                        {/* Icon */}
                        <div className={`
                          w-12 h-12 rounded-xl mb-3
                          flex items-center justify-center
                          text-2xl
                          ${isSelected ? `bg-gradient-to-br ${module.gradient} shadow-lg` : 'bg-gray-100'}
                          transition-all duration-300
                        `}>
                          {isSelected ? (
                            <span className="filter drop-shadow-sm">{module.icon}</span>
                          ) : (
                            <span className="opacity-60">{module.icon}</span>
                          )}
                        </div>

                        {/* Content */}
                        <h3 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                          {module.name}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {module.description}
                        </p>

                        {/* Feature count */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`
                            px-2 py-0.5 rounded-full text-[10px] font-medium
                            ${isSelected ? `${colors.light} ${colors.text}` : 'bg-gray-100 text-gray-500'}
                          `}>
                            {module.features.length} features
                          </span>
                          {module.dependencies && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                              {module.dependencies[0]}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Generate Button */}
                <button
                  onClick={copyPrompt}
                  disabled={selectedModules.length === 0}
                  className={`
                    w-full mt-6 py-4 rounded-xl
                    font-semibold text-white
                    flex items-center justify-center gap-2
                    transition-all duration-300
                    ${selectedModules.length > 0
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  {copiedPrompt ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Claude Code Prompt
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right - Preview & Details */}
          <div className="col-span-12 lg:col-span-7 space-y-6">
            {/* Live Preview */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Live Preview</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Preview of your generated admin panel
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
              </div>

              {/* Mini Admin Preview */}
              <div className="p-4 bg-gray-900">
                <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                  <div className="flex h-[300px]">
                    {/* Mini Sidebar */}
                    <div className="w-48 bg-gray-900 border-r border-gray-700 p-3">
                      <div className="h-6 w-20 bg-violet-600 rounded mb-4" />
                      <div className="space-y-1">
                        {selectedModuleObjects.slice(0, 6).map((module, i) => (
                          <div
                            key={module.id}
                            className={`
                              flex items-center gap-2 px-2 py-1.5 rounded-md text-xs
                              ${i === 0 ? 'bg-gray-800 text-white' : 'text-gray-400'}
                            `}
                          >
                            <span>{module.icon}</span>
                            <span className="truncate">{module.name}</span>
                          </div>
                        ))}
                        {selectedModuleObjects.length > 6 && (
                          <div className="text-xs text-gray-500 px-2 py-1">
                            +{selectedModuleObjects.length - 6} more
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini Content */}
                    <div className="flex-1 p-4 overflow-hidden">
                      {/* Mini header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-5 w-32 bg-gray-700 rounded" />
                        <div className="h-7 w-24 bg-violet-600 rounded" />
                      </div>

                      {/* Mini stats cards */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-gray-700/50 rounded-lg p-2">
                            <div className="h-3 w-8 bg-gray-600 rounded mb-1" />
                            <div className="h-5 w-12 bg-gray-500 rounded" />
                          </div>
                        ))}
                      </div>

                      {/* Mini table */}
                      <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-4 gap-2 p-2 border-b border-gray-700">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-3 bg-gray-600 rounded" />
                          ))}
                        </div>
                        {[...Array(4)].map((_, row) => (
                          <div key={row} className="grid grid-cols-4 gap-2 p-2 border-b border-gray-700/50">
                            {[...Array(4)].map((_, col) => (
                              <div key={col} className="h-3 bg-gray-700 rounded" />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generated Files */}
              <div className="px-5 py-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                  Files to be Generated ({totalFiles})
                </h3>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                  {selectedModuleObjects.flatMap(m => m.files).slice(0, 12).map((file, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600"
                    >
                      {file}
                    </span>
                  ))}
                  {totalFiles > 12 && (
                    <span className="px-2 py-1 bg-violet-100 rounded text-xs font-mono text-violet-600">
                      +{totalFiles - 12} more files
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Module Details */}
            {activeDetailModule && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {(() => {
                  const activeModule = adminModules.find(m => m.id === activeDetailModule);
                  if (!activeModule) return null;
                  const colors = colorConfig[activeModule.color];
                  const isSelected = selectedModules.includes(activeModule.id);

                  return (
                    <>
                      <div className={`px-5 py-4 border-b border-gray-100 bg-gradient-to-r ${activeModule.gradient}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                            {activeModule.icon}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-sm font-semibold text-white">{activeModule.name}</h2>
                            <p className="text-xs text-white/70">{activeModule.description}</p>
                          </div>
                          {!isSelected && (
                            <button
                              onClick={() => toggleModule(activeModule.id)}
                              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium text-white transition-colors"
                            >
                              Add Module
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
                          Included Features
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {activeModule.features.map((feature) => (
                            <div
                              key={feature.id}
                              className={`p-3 rounded-xl border ${isSelected ? `${colors.light} ${colors.border}` : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${isSelected ? colors.bg : 'bg-gray-300'}`}>
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div>
                                  <p className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                    {feature.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {feature.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* Claude Code Prompt Preview */}
            {selectedModules.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Claude Code Prompt</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Copy this prompt to generate your admin panel
                    </p>
                  </div>
                  <button
                    onClick={copyPrompt}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${copiedPrompt
                        ? 'bg-emerald-500 text-white'
                        : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                      }
                    `}
                  >
                    {copiedPrompt ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Prompt
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4">
                  <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                    {generatePrompt()}
                  </pre>
                </div>

                {/* Workflow hint */}
                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">1</span>
                      Copy prompt
                    </span>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">2</span>
                      Paste in Claude Code
                    </span>
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="flex items-center gap-1">
                      <span className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-semibold">3</span>
                      Get your admin panel
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
