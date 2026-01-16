'use client';

import Link from 'next/link';

interface AdminHeaderProps {
  adminEmail?: string;
}

export default function AdminHeader({ adminEmail }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left side - Spacer for mobile */}
        <div className="flex items-center gap-4">
          {/* Spacer for mobile hamburger menu */}
          <div className="w-10 md:hidden" />

          <h1 className="text-base font-semibold text-gray-900">
            PromptPit Admin
          </h1>
        </div>

        {/* Right side - Admin info */}
        <div className="flex items-center gap-4">
          {/* Quick Actions */}
          <Link
            href="/dashboard"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Exit Admin
          </Link>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-gray-200" />

          {/* Admin User */}
          {adminEmail && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {adminEmail.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {adminEmail.split('@')[0]}
                  </p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Admin</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
