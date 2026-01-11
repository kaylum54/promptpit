'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, this would come from your auth provider
  // For now, we'll use a placeholder
  const [adminEmail, setAdminEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    // TODO: Replace with actual admin auth check
    // This is a placeholder - integrate with your auth system
    setAdminEmail('admin@promptpit.com');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-base via-bg-base to-bg-surface/50 flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <AdminHeader adminEmail={adminEmail} />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-content mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border-DEFAULT bg-bg-surface/30 backdrop-blur-sm relative">
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-strong/50 to-transparent" />

          <div className="max-w-content mx-auto px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-caption text-text-tertiary">
              <div className="flex items-center gap-2">
                <span>PromptPit Admin Dashboard</span>
                <span className="hidden sm:inline text-border-strong">|</span>
                <span className="hidden sm:inline">Internal Use Only</span>
              </div>
              {adminEmail && (
                <div className="flex items-center gap-2">
                  <span>Logged in as:</span>
                  <span className="text-text-secondary font-medium">{adminEmail}</span>
                </div>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
