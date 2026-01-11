'use client';

import { useMemo } from 'react';
import { MODELS, type ModelKey } from '@/lib/models';
import type { ModelScores, JudgeVerdict } from '@/lib/types';

interface JudgePanelProps {
  scores: Record<string, ModelScores>;
  verdict: JudgeVerdict | null;
  currentTool: string | null;
  isJudging: boolean;
  isComplete: boolean;
}

const CATEGORIES = {
  reasoning: { name: 'REASONING' },
  clarity: { name: 'CLARITY' },
  persuasiveness: { name: 'PERSUASION' },
} as const;

type CategoryKey = keyof typeof CATEGORIES;

const TOOL_DESCRIPTIONS: Record<string, string> = {
  score_reasoning: 'Analysing reasoning quality...',
  score_clarity: 'Evaluating clarity...',
  score_persuasiveness: 'Scoring persuasiveness...',
  declare_winner: 'Rendering verdict...',
};

const getModelColor = (modelName: string): string => {
  const colorMap: Record<string, string> = {
    'Claude': '#f59e0b',
    'GPT-4o': '#10b981',
    'Gemini': '#8b5cf6',
    'Llama': '#06b6d4',
  };
  return colorMap[modelName] || '#3b82f6';
};

export default function JudgePanel({
  scores,
  verdict,
  currentTool,
  isJudging,
  isComplete,
}: JudgePanelProps) {
  const modelKeys = useMemo(() => Object.keys(scores), [scores]);

  const scoredCategories = useMemo(() => {
    const categories = new Set<CategoryKey>();
    Object.values(scores).forEach((modelScore) => {
      Object.keys(modelScore).forEach((cat) => {
        categories.add(cat as CategoryKey);
      });
    });
    return Array.from(categories);
  }, [scores]);

  const getToolDescription = (tool: string | null): string => {
    if (!tool) return 'Initializing judge...';
    return TOOL_DESCRIPTIONS[tool] || 'Processing...';
  };

  const getHighestScore = (category: CategoryKey): number => {
    let highest = 0;
    modelKeys.forEach((modelKey) => {
      const score = scores[modelKey]?.[category]?.score || 0;
      if (score > highest) highest = score;
    });
    return highest;
  };

  const hasScores = modelKeys.length > 0 && scoredCategories.length > 0;

  return (
    <div className="bg-bg-surface border border-border rounded-xl max-w-content mx-auto mt-10 p-8 relative overflow-hidden">
      <div className="mb-6">
        <h2 className="text-sm font-semibold tracking-widest text-text-tertiary uppercase flex items-center gap-2">
          <span>&#x2696;&#xFE0F;</span>
          <span>VERDICT</span>
          {isJudging && !isComplete && (
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-primary/10 text-accent-primary">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
              Judging
            </span>
          )}
        </h2>
      </div>

      {isJudging && !isComplete && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 fade-in">
            <div className="flex items-center justify-center w-5 h-5">
              <svg className="w-4 h-4 text-accent-primary animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <span className="text-sm text-text-secondary">{getToolDescription(currentTool)}</span>
          </div>
        </div>
      )}

      {!isJudging && !isComplete && !hasScores && (
        <div className="text-center py-8 text-text-muted">
          <p className="text-sm">Waiting for debate to complete...</p>
        </div>
      )}

      {hasScores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {scoredCategories.map((category) => {
            const categoryInfo = CATEGORIES[category];
            const highestScore = getHighestScore(category);

            return (
              <div key={category} className="bg-bg-elevated border border-border-subtle rounded-md p-4 fade-in">
                <h3 className="text-[11px] font-semibold tracking-wider text-text-tertiary uppercase mb-3">
                  {categoryInfo.name}
                </h3>
                <div className="space-y-0">
                  {modelKeys.map((modelKey, idx) => {
                    const modelScore = scores[modelKey]?.[category];
                    const model = MODELS[modelKey as ModelKey];
                    const color = getModelColor(model?.name || modelKey);
                    const isHighest = modelScore?.score === highestScore;
                    const isLast = idx === modelKeys.length - 1;
                    if (!modelScore) return null;
                    const rowClass = "flex items-center justify-between py-1.5" + (!isLast ? " border-b border-border-subtle" : "");
                    const scoreClass = "font-mono text-sm font-semibold " + (isHighest ? "text-success" : "text-text-primary");
                    return (
                      <div key={category + "-" + modelKey} className={rowClass}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-[13px] font-medium text-text-secondary">{model?.name || modelKey}</span>
                        </div>
                        <span className={scoreClass}>{modelScore.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {verdict && (
        <div className="winner-reveal">
          <div className="h-px bg-border mb-6" />
          <div className="text-center">
            <div className="text-3xl mb-3">&#x1F3C6;</div>
            <p className="text-xs font-semibold tracking-widest text-text-tertiary uppercase mb-1">WINNER</p>
            <WinnerName winner={verdict.winner} />
            <p className="max-w-[600px] mx-auto text-base text-text-secondary leading-relaxed italic">
              &ldquo;{verdict.verdict}&rdquo;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function WinnerName({ winner }: { winner: string }) {
  const model = MODELS[winner as ModelKey];
  const color = getModelColor(model?.name || winner);
  const shadowColor = color + "40";
  return (
    <p className="text-[28px] font-extrabold mb-4" style={{ color: color, textShadow: "0 0 30px " + shadowColor }}>
      {model?.name || winner}
    </p>
  );
}
