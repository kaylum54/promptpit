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

// All categories across all arena modes
const CATEGORIES: Record<string, { name: string }> = {
  // Debate mode
  reasoning: { name: 'REASONING' },
  clarity: { name: 'CLARITY' },
  persuasiveness: { name: 'PERSUASION' },
  // Code mode
  correctness: { name: 'CORRECTNESS' },
  code_quality: { name: 'CODE QUALITY' },
  efficiency: { name: 'EFFICIENCY' },
  // Creative mode
  originality: { name: 'ORIGINALITY' },
  craft: { name: 'CRAFT' },
  emotional_impact: { name: 'EMOTIONAL IMPACT' },
};

type CategoryKey = string;

const TOOL_DESCRIPTIONS: Record<string, string> = {
  // Debate tools
  score_reasoning: 'Analysing reasoning quality...',
  score_clarity: 'Evaluating clarity...',
  score_persuasiveness: 'Scoring persuasiveness...',
  // Code tools
  score_correctness: 'Checking code correctness...',
  score_code_quality: 'Evaluating code quality...',
  score_efficiency: 'Assessing efficiency...',
  // Creative tools
  score_originality: 'Judging originality...',
  score_craft: 'Evaluating writing craft...',
  score_emotional_impact: 'Measuring emotional impact...',
  // Common
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
    <div
      className="border border-border-strong rounded-2xl max-w-content mx-auto mt-10 p-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
      }}
    >
      {/* Top spotlight effect */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(255, 215, 0, 0.08) 0%, transparent 70%)',
        }}
      />
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.4) 50%, transparent 100%)',
        }}
      />

      <div className="mb-6 text-center relative">
        <p className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase mb-2">
          {isJudging && !isComplete ? 'JUDGING IN PROGRESS' : 'VERDICT'}
        </p>
        <span className="text-[28px]">&#x2696;&#xFE0F;</span>
        {isJudging && !isComplete && (
          <span className="absolute top-0 right-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent-primary/10 text-accent-primary">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-accent-primary animate-pulse" />
            Judging
          </span>
        )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative">
          {scoredCategories.map((category) => {
            const categoryInfo = CATEGORIES[category];
            const highestScore = getHighestScore(category);

            return (
              <div key={category} className="bg-bg-base border border-border-default rounded-[10px] p-4 fade-in">
                <h3 className="text-[10px] font-semibold tracking-[0.1em] text-text-muted uppercase pb-2 mb-3 border-b border-border-subtle">
                  {categoryInfo?.name || category.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <div className="space-y-3">
                  {modelKeys.map((modelKey) => {
                    const modelScore = scores[modelKey]?.[category];
                    const model = MODELS[modelKey as ModelKey];
                    const color = getModelColor(model?.name || modelKey);
                    const isHighest = modelScore?.score === highestScore;
                    if (!modelScore) return null;

                    return (
                      <div key={category + "-" + modelKey} className="pb-3 border-b border-border-subtle last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="text-[13px] font-medium text-text-primary">{model?.name || modelKey}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-bg-base rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${(modelScore.score / 10) * 100}%`,
                                  backgroundColor: isHighest ? '#10b981' : color,
                                }}
                              />
                            </div>
                            <span className={`font-mono text-sm font-bold min-w-[24px] text-right ${isHighest ? 'text-success' : 'text-text-primary'}`}>
                              {modelScore.score}
                            </span>
                          </div>
                        </div>
                        {modelScore.rationale && (
                          <p className="text-xs text-text-muted pl-4 mt-1 italic leading-relaxed">
                            {modelScore.rationale}
                          </p>
                        )}
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
        <div className="winner-reveal pt-6 border-t border-border-default relative">
          {/* Glow behind winner */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.12) 0%, transparent 70%)',
            }}
          />
          <div className="text-center relative">
            <div
              className="text-4xl mb-3"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.3))',
              }}
            >
              &#x1F3C6;
            </div>
            <p className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase mb-1">WINNER</p>
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
  const shadowColor = color + "60";
  return (
    <p
      className="text-[32px] font-extrabold mb-4"
      style={{
        color: color,
        textShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}`,
      }}
    >
      {model?.name || winner}
    </p>
  );
}
