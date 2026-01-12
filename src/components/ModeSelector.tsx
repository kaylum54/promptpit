'use client';

import { ARENA_MODES, type ArenaMode } from '@/lib/modes';

interface ModeSelectorProps {
  currentMode: ArenaMode;
  onModeChange: (mode: ArenaMode) => void;
  disabled?: boolean;
}

export default function ModeSelector({ currentMode, onModeChange, disabled = false }: ModeSelectorProps) {
  const modes = Object.values(ARENA_MODES);

  return (
    <div className="flex flex-wrap items-center gap-1 bg-bg-surface/50 rounded-xl p-1">
      {modes.map((mode) => {
        const isActive = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            disabled={disabled}
            title={mode.description}
            className={`
              flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 border transform min-h-[44px]
              ${isActive
                ? 'border-transparent'
                : 'bg-bg-surface border-border-subtle text-text-secondary hover:text-text-primary hover:border-border hover:translate-y-[-1px] hover:shadow-sm'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            style={isActive ? {
              backgroundColor: `${mode.color}15`,
              borderColor: mode.color,
              color: mode.color,
              boxShadow: `0 0 12px ${mode.color}30, 0 0 4px ${mode.color}20`,
            } : {}}
          >
            <svg
              className={`transition-all duration-200 ${isActive ? 'w-5 h-5' : 'w-4 h-4'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={mode.icon} />
            </svg>
            <span>{mode.name}</span>
          </button>
        );
      })}
    </div>
  );
}
