import Link from 'next/link';

interface UpgradePromptProps {
  limits: {
    used: number;
    limit: number;
    resetDate: Date | null;
  };
}

export function UpgradePrompt({ limits }: UpgradePromptProps) {
  const resetDateStr = limits.resetDate
    ? limits.resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="text-6xl mb-6">🚀</div>
        <h1 className="font-display text-3xl text-black mb-4">
          You've used your free PRD this month
        </h1>
        <p className="text-gray-500 mb-8">
          You've created {limits.used} of {limits.limit} free PRDs.
          {resetDateStr && ` Your limit resets on ${resetDateStr}.`}
        </p>

        <div className="space-y-4">
          <Link
            href="/pricing"
            className="block w-full bg-black text-white px-6 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Upgrade to Pro — Unlimited PRDs
          </Link>

          <Link
            href="/dashboard/prd"
            className="block w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors border border-gray-200"
          >
            View Your Existing PRDs
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          Pro includes unlimited PRDs, security guidance, admin blueprints, debug prompts, and more.
        </p>
      </div>
    </div>
  );
}
