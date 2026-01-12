'use client';

interface ArenaSelectorProps {
  selectedArena: 'debate' | 'code' | 'writing';
  onSelect: (arena: 'debate' | 'code' | 'writing') => void;
  userTier: 'guest' | 'free' | 'pro';
  onUpgradeRequired?: () => void;
}

interface ArenaConfig {
  id: 'debate' | 'code' | 'writing';
  name: string;
  icon: string;
  judge: string;
  requiresPro: boolean;
}

const ARENAS: ArenaConfig[] = [
  {
    id: 'debate',
    name: 'General Debate',
    icon: '⚖️',
    judge: 'The Arbiter',
    requiresPro: false,
  },
  {
    id: 'code',
    name: 'Code Arena',
    icon: '💻',
    judge: 'The Architect',
    requiresPro: true,
  },
  {
    id: 'writing',
    name: 'Writing Arena',
    icon: '✍️',
    judge: 'The Editor',
    requiresPro: true,
  },
];

export default function ArenaSelector({
  selectedArena,
  onSelect,
  userTier,
  onUpgradeRequired,
}: ArenaSelectorProps) {
  const isPro = userTier === 'pro';

  const handleClick = (arena: ArenaConfig) => {
    if (arena.requiresPro && !isPro) {
      onUpgradeRequired?.();
      return;
    }
    onSelect(arena.id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {ARENAS.map((arena) => {
        const isSelected = selectedArena === arena.id;
        const isLocked = arena.requiresPro && !isPro;

        return (
          <button
            key={arena.id}
            onClick={() => handleClick(arena)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200
              text-left cursor-pointer
              ${isSelected
                ? 'border-accent-primary bg-accent-primary/10 shadow-glow-accent'
                : 'border-border-subtle bg-bg-surface hover:border-border-default hover:bg-bg-elevated'
              }
              ${isLocked ? 'opacity-70' : ''}
            `}
          >
            {/* PRO Badge */}
            {isLocked && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent-primary text-white text-[10px] font-bold uppercase tracking-wider rounded">
                PRO
              </div>
            )}

            {/* Icon */}
            <div className="text-[32px] mb-2">{arena.icon}</div>

            {/* Arena Name */}
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary mb-1">
              {arena.name}
            </h3>

            {/* Judge Name */}
            <p className="text-xs text-text-secondary">
              {arena.judge} judges
            </p>

            {/* Selected Checkmark */}
            {isSelected && (
              <div className="absolute bottom-3 right-3 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
