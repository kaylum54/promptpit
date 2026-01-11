'use client';

import Link from 'next/link';

interface AdminHeaderProps {
  adminEmail?: string;
}

export default function AdminHeader({ adminEmail }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full bg-bg-surface/80 backdrop-blur-md border-b border-border-DEFAULT relative">
      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent" />

      <div className="flex items-center justify-between h-14 px-4 md:px-6">
        {/* Left side - Back link and title */}
        <div className="flex items-center gap-4">
          {/* Spacer for mobile hamburger menu */}
          <div className="w-8 md:hidden" />

          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-all duration-200 text-body-small font-medium hover:translate-x-[-2px]"
          >
            <span className="font-mono">&larr;</span>
            <span className="hidden sm:inline">Back to App</span>
          </Link>

          <div className="hidden sm:block h-5 w-px bg-border-DEFAULT" />

          <h1 className="text-model-name text-text-primary font-bold">
            PromptPit Admin
          </h1>
        </div>

        {/* Right side - Admin email */}
        <div className="flex items-center gap-3">
          {adminEmail && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-body-small text-text-secondary truncate max-w-[150px] sm:max-w-[200px]">
                {adminEmail}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
