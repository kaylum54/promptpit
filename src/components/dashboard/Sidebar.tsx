'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  status: 'idea' | 'prd' | 'building' | 'launched';
  updatedAt: Date;
}

interface SidebarProps {
  projects: Project[];
  currentProjectId?: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
    plan: 'free' | 'pro';
  };
  onNewProject?: () => void;
  onSignOut?: () => void;
}

export function Sidebar({ projects, currentProjectId, user, onNewProject, onSignOut }: SidebarProps) {
  const pathname = usePathname();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isPro = user.plan === 'pro';

  const statusColors: Record<string, string> = {
    idea: 'bg-gray-400',
    prd: 'bg-black',
    building: 'bg-blue-500',
    launched: 'bg-green-500',
  };

  const mainNav = [
    { label: 'Home', href: '/dashboard', icon: 'home' },
    { label: 'All Projects', href: '/dashboard/projects', icon: 'folder' },
    { label: 'Templates', href: '/dashboard/templates', icon: 'template' },
    { label: 'AI Compare', href: '/dashboard/ai-compare', icon: 'compare' },
  ];

  const proTools = [
    { label: 'Security Checker', href: '/dashboard/tools/security', icon: 'shield' },
    { label: 'Admin Blueprint', href: '/dashboard/tools/admin', icon: 'layout' },
    { label: 'Debug Prompts', href: '/dashboard/tools/debug', icon: 'bug' },
    { label: 'Launch Checklist', href: '/dashboard/tools/launch', icon: 'rocket' },
  ];

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-[#FAFAFA] via-[#F5F5F5] to-[#F0F0F0] border-r border-gray-200/80 flex flex-col relative overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Subtle gradient line on right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300/40 to-transparent" />

      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200/60 relative bg-white/40 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center shadow-md shadow-gray-400/30 group-hover:shadow-lg group-hover:shadow-gray-400/40 transition-all duration-200">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <span className="font-semibold text-gray-900 text-[15px] group-hover:text-gray-700 transition-colors">PromptPit</span>
        </Link>

        {/* Search Shortcut */}
        <button
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-md transition-all duration-200 hover:scale-105 active:scale-95"
          title="Search (Cmd+K)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />
      </div>

      {/* New Project Button */}
      <div className="p-3 relative z-10">
        <Link
          href="/dashboard/prd/new"
          onClick={(e) => {
            if (onNewProject) {
              e.preventDefault();
              onNewProject();
            }
          }}
          className="
            w-full flex items-center justify-center gap-2
            bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white
            px-4 py-2.5 rounded-lg
            font-medium text-sm
            hover:from-gray-800 hover:via-gray-700 hover:to-gray-800
            transition-all duration-300
            shadow-lg shadow-gray-400/40
            hover:shadow-xl hover:shadow-gray-400/50
            hover:-translate-y-0.5
            active:translate-y-0 active:shadow-md
          "
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 relative z-10">
        {/* Main Navigation */}
        <nav className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  text-[13px] font-medium
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                  }
                `}
              >
                <NavIcon name={item.icon} active={isActive} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-3 py-2">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="
                flex items-center gap-2
                text-[11px] font-semibold text-gray-400 uppercase tracking-wider
                hover:text-gray-600 cursor-pointer
                transition-all duration-200
              "
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${projectsExpanded ? 'rotate-0' : '-rotate-90'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              Projects
            </button>
            <Link
              href="/dashboard/prd/new"
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>

          {projectsExpanded && (
            <div className="mt-1 space-y-0.5">
              {projects.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mx-auto mb-2 shadow-inner">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">No projects yet</p>
                  <Link
                    href="/dashboard/prd/new"
                    className="text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Create your first project →
                  </Link>
                </div>
              ) : (
                <>
                  {projects.slice(0, 5).map((project) => (
                    <Link
                      key={project.id}
                      href={`/dashboard/prd/${project.id}`}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg
                        text-[13px]
                        transition-all duration-200
                        ${currentProjectId === project.id
                          ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                        }
                      `}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusColors[project.status]} flex-shrink-0 shadow-sm`} />
                      <span className="flex-1 truncate">{project.name}</span>
                    </Link>
                  ))}

                  {projects.length > 5 && (
                    <Link
                      href="/dashboard/projects"
                      className="
                        flex items-center gap-2 px-3 py-2
                        text-xs text-gray-600 hover:text-gray-800
                        transition-all duration-200 hover:translate-x-0.5
                      "
                    >
                      View all {projects.length} projects
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Pro Tools Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Pro Tools
            </span>
            {isPro && (
              <span className="px-1.5 py-0.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white text-[9px] font-bold rounded shadow-sm">
                PRO
              </span>
            )}
          </div>

          <div className="mt-1 space-y-0.5">
            {proTools.map((item) => {
              const isActive = pathname === item.href;
              const isLocked = !isPro;

              return (
                <Link
                  key={item.href}
                  href={isLocked ? '/pricing?mode=signup&upgrade=dashboard' : item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    text-[13px] font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                      : isLocked
                        ? 'text-gray-400 hover:text-gray-500 hover:bg-white/40'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                    }
                  `}
                >
                  <NavIcon name={item.icon} active={isActive} />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isLocked && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-6">
          <div className="px-3 py-2">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              Team
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            <Link
              href="/dashboard/team"
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-[13px] font-medium
                transition-all duration-200
                ${pathname === '/dashboard/team'
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                }
              `}
            >
              <NavIcon name="users" active={pathname === '/dashboard/team'} />
              Members
            </Link>
            <Link
              href="/dashboard/activity"
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-[13px] font-medium
                transition-all duration-200
                ${pathname === '/dashboard/activity'
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                }
              `}
            >
              <NavIcon name="activity" active={pathname === '/dashboard/activity'} />
              Activity
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-shrink-0 relative z-10">
        {/* Upgrade Card (for free users) */}
        {!isPro && (
          <div className="px-3 pb-3">
            <div className="
              relative overflow-hidden
              bg-gradient-to-br from-gray-50 via-white to-gray-100
              border border-gray-200/80
              rounded-xl p-4
              shadow-sm
            ">
              {/* Decorative blur spots */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gray-200/40 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gray-300/30 rounded-full blur-xl" />

              <div className="flex items-start gap-3 relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-800 to-black flex items-center justify-center flex-shrink-0 shadow-md shadow-gray-400/30">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
                  <p className="text-xs text-gray-500 mt-0.5">Unlock all tools & features</p>
                </div>
              </div>
              <Link
                href="/pricing?mode=signup&upgrade=dashboard"
                className="
                  relative mt-3 w-full flex items-center justify-center
                  bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white
                  py-2 rounded-lg
                  text-xs font-semibold
                  hover:from-gray-800 hover:via-gray-700 hover:to-gray-800
                  shadow-md shadow-gray-400/30
                  hover:shadow-lg hover:shadow-gray-400/40
                  transition-all duration-300
                  hover:-translate-y-0.5
                  active:translate-y-0
                "
              >
                Go Pro — $20/mo
              </Link>
            </div>
          </div>
        )}

        {/* Settings & Help */}
        <div className="px-3 py-2 border-t border-gray-200/60 bg-white/30 backdrop-blur-sm">
          <nav className="space-y-0.5">
            <Link
              href="/dashboard/settings"
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-[13px] font-medium
                transition-all duration-200
                ${pathname.startsWith('/dashboard/settings')
                  ? 'bg-white text-gray-900 shadow-md shadow-gray-200/60'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:translate-x-0.5'
                }
              `}
            >
              <NavIcon name="settings" active={pathname.startsWith('/dashboard/settings')} />
              Settings
            </Link>
            <a
              href="/help"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-3 px-3 py-2 rounded-lg
                text-[13px] font-medium
                text-gray-600 hover:text-gray-900 hover:bg-white/60
                transition-all duration-200 hover:translate-x-0.5
              "
            >
              <NavIcon name="help" active={false} />
              <span className="flex-1">Help & Support</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </nav>
        </div>

        {/* User Profile */}
        <div className="px-3 py-3 border-t border-gray-200/60 bg-gradient-to-t from-gray-100/50 to-transparent">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="
              w-full flex items-center gap-3 p-2 rounded-lg
              hover:bg-white/70
              transition-all duration-200
              text-left
              hover:shadow-sm
            "
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md shadow-gray-400/30 ring-2 ring-white/50">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                {isPro ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded text-[10px] font-semibold shadow-inner">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    PRO
                  </span>
                ) : (
                  'Free Plan'
                )}
              </p>
            </div>

            {/* Chevron */}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div className="mt-2 py-1 bg-white rounded-lg border border-gray-200/80 shadow-xl shadow-gray-200/50 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <Link
                href="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Account Settings
              </Link>
              <Link
                href="/dashboard/settings/billing"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                Billing
              </Link>
              <div className="my-1 border-t border-gray-100" />
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onSignOut?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// Navigation Icon Component
function NavIcon({ name, active }: { name: string; active: boolean }) {
  const className = `w-[18px] h-[18px] ${active ? 'text-gray-600' : 'text-gray-400'} transition-colors duration-200`;

  const icons: Record<string, React.ReactNode> = {
    home: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    folder: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    template: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    compare: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    shield: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    layout: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    bug: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75V8.25m0 0c1.657 0 3-1.007 3-2.25S13.657 3.75 12 3.75s-3 1.007-3 2.25S10.343 8.25 12 8.25z" />
      </svg>
    ),
    rocket: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    activity: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    help: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  };

  return icons[name] || null;
}
