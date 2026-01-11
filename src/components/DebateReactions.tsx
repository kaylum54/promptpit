'use client';

import { useState, useEffect } from 'react';

type ReactionType = 'like' | 'fire' | 'think' | 'laugh';

interface ReactionCounts {
  like: number;
  fire: number;
  think: number;
  laugh: number;
}

interface DebateReactionsProps {
  debateId: string;
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
}

const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: '👍', label: 'Like' },
  fire: { emoji: '🔥', label: 'Fire' },
  think: { emoji: '🤔', label: 'Interesting' },
  laugh: { emoji: '😂', label: 'Funny' },
};

export default function DebateReactions({
  debateId,
  isAuthenticated,
  onAuthRequired,
}: DebateReactionsProps) {
  const [counts, setCounts] = useState<ReactionCounts>({
    like: 0,
    fire: 0,
    think: 0,
    laugh: 0,
  });
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingReaction, setPendingReaction] = useState<ReactionType | null>(null);

  // Fetch reactions on mount
  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const response = await fetch(`/api/debates/${debateId}/reactions`);
        if (response.ok) {
          const data = await response.json();
          setCounts(data.counts);
          setUserReactions(data.userReactions);
        }
      } catch (error) {
        console.error('Failed to fetch reactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReactions();
  }, [debateId]);

  const handleReaction = async (type: ReactionType) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    if (pendingReaction) return; // Prevent spam clicking

    const hasReaction = userReactions.includes(type);
    setPendingReaction(type);

    // Optimistic update
    if (hasReaction) {
      setUserReactions(prev => prev.filter(r => r !== type));
      setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
    } else {
      setUserReactions(prev => [...prev, type]);
      setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    }

    try {
      if (hasReaction) {
        // Remove reaction
        await fetch(`/api/debates/${debateId}/reactions?type=${type}`, {
          method: 'DELETE',
        });
      } else {
        // Add reaction
        await fetch(`/api/debates/${debateId}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reaction_type: type }),
        });
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
      // Revert optimistic update on error
      if (hasReaction) {
        setUserReactions(prev => [...prev, type]);
        setCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
      } else {
        setUserReactions(prev => prev.filter(r => r !== type));
        setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
      }
    } finally {
      setPendingReaction(null);
    }
  };

  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-32 bg-bg-base animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => {
          const { emoji, label } = REACTION_EMOJIS[type];
          const isActive = userReactions.includes(type);
          const count = counts[type];
          const isPending = pendingReaction === type;

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={isPending}
              title={label}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all
                ${isActive
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                  : 'bg-bg-base hover:bg-bg-elevated border border-border-subtle'
                }
                ${isPending ? 'opacity-50' : ''}
                ${!isAuthenticated ? 'cursor-pointer' : ''}
              `}
            >
              <span className="text-base">{emoji}</span>
              {count > 0 && (
                <span className="text-xs font-medium">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {totalReactions > 0 && (
        <span className="text-xs text-text-muted">
          {totalReactions} reaction{totalReactions !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
