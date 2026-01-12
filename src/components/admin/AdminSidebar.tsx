'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: '[ ]' },
  { label: 'Users', href: '/admin/users', icon: '[U]' },
  { label: 'Debates', href: '/admin/debates', icon: '[D]' },
  { label: 'Revenue', href: '/admin/revenue', icon: '[$]' },
  { label: 'Analytics', href: '/admin/analytics', icon: '[A]' },
  { label: 'Feedback', href: '/admin/feedback', icon: '[F]' },
  { label: 'Settings', href: '/admin/settings', icon: '[S]' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-bg-surface border border-border-DEFAULT text-text-secondary hover:text-text-primary hover:border-border-strong"
        aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        {isCollapsed ? (
          <span className="text-lg">=</span>
        ) : (
          <span className="text-lg">X</span>
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-[220px]
          bg-gradient-to-b from-bg-surface to-bg-base
          border-r border-border-DEFAULT
          transform transition-transform duration-200 ease-in-out
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
          md:translate-x-0 md:static md:z-0
          relative
        `}
      >
        {/* Right border glow effect */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-accent-primary/20 via-accent-primary/10 to-transparent" />

        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-4 border-b border-border-DEFAULT">
            <Link
              href="/admin"
              className="text-lg font-bold text-text-primary hover:text-accent-primary transition-colors"
            >
              Admin Panel
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsCollapsed(true)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md
                    font-medium text-body-small
                    transition-all duration-200 ease-out
                    ${active
                      ? 'bg-accent-primary/10 text-accent-primary border-l-2 border-l-accent-primary border-y border-r border-y-accent-primary/20 border-r-accent-primary/20 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated border-l-2 border-l-transparent border-y border-r border-transparent hover:border-l-border-strong'
                    }
                  `}
                >
                  <span className={`font-mono text-xs transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-80'}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-border-DEFAULT">
            <div className="text-caption text-text-tertiary">
              v1.0.0
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
