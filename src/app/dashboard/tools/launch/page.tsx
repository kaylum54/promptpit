'use client';

import { useAuth } from '@/hooks/useAuth';
import { LaunchChecklist } from '@/components/dashboard/tools/LaunchChecklist';

export default function LaunchChecklistPage() {
  const { profile, isLoading } = useAuth();

  const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Upgrade prompt for non-pro users
  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h2>
          <p className="text-gray-600 mb-6">
            Launch Checklist is available on the Pro plan. Upgrade to get a comprehensive
            pre-launch checklist with Claude Code prompts for each task.
          </p>
          <a
            href="/pricing"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/25"
          >
            Upgrade to Pro
          </a>
        </div>
      </div>
    );
  }

  return <LaunchChecklist />;
}
