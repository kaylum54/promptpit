'use client';

interface UsageBadgeProps {
  debatesRemaining: number;
  debatesLimit: number;
  tier: 'guest' | 'free' | 'pro';
  onClick?: () => void;
}

export default function UsageBadge({
  debatesRemaining,
  debatesLimit,
  tier,
  onClick,
}: UsageBadgeProps) {
  // Calculate usage percentage
  const usagePercentage = (debatesRemaining / debatesLimit) * 100;

  // Determine color based on remaining percentage
  const getColorClasses = () => {
    if (usagePercentage > 50) {
      return {
        text: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/20',
        icon: 'text-success',
      };
    } else if (usagePercentage >= 25) {
      return {
        text: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/20',
        icon: 'text-warning',
      };
    } else {
      return {
        text: 'text-error',
        bg: 'bg-error/10',
        border: 'border-error/20',
        icon: 'text-error',
      };
    }
  };

  const colors = getColorClasses();
  const isPro = tier === 'pro';

  // Use fire icon when low on debates, lightning bolt otherwise
  const Icon = usagePercentage < 25 ? FireIcon : LightningIcon;

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md
        ${colors.bg} ${colors.border} border
        hover:opacity-80 transition-opacity
        cursor-pointer select-none
        text-caption font-medium
      `}
      title={`${debatesRemaining} of ${debatesLimit} debates remaining`}
    >
      <Icon className={`w-3.5 h-3.5 ${colors.icon}`} />
      <span className={colors.text}>
        {debatesRemaining}/{debatesLimit}
      </span>
      {isPro && (
        <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-accent-primary/20 text-accent-primary rounded">
          Pro
        </span>
      )}
    </button>
  );
}

// Lightning bolt icon component
function LightningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

// Fire icon component
function FireIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.577 1.438-4.774 3.5-5.5-.052.334-.08.677-.08 1.026 0 2.485 1.567 4.474 3.58 4.474 2.013 0 3.58-1.989 3.58-4.474 0-.349-.028-.692-.08-1.026C17.562 11.226 19 13.423 19 16c0 3.866-3.134 7-7 7zm-2-14c0-2.761 1.79-5 4-5 0 2 1 4 1 4s2-1.5 2-4c2.209 0 4 2.239 4 5s-1.791 5-4 5c0-2-2-4-3-4-1 0-3 2-3 4-2.209 0-4-2.239-4-5z" />
    </svg>
  );
}
