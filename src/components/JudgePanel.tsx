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

const CATEGORIES: Record<string, { name: string }> = {
  reasoning: { name: 'REASONING' },
  clarity: { name: 'CLARITY' },
  persuasiveness: { name: 'PERSUASION' },
  correctness: { name: 'CORRECTNESS' },
  code_quality: { name: 'CODE QUALITY' },
  efficiency: { name: 'EFFICIENCY' },
  originality: { name: 'ORIGINALITY' },
  craft: { name: 'CRAFT' },
  emotional_impact: { name: 'IMPACT' },
};

type CategoryKey = string;

const TOOL_DESCRIPTIONS: Record<string, string> = {
  score_reasoning: '// ANALYZING REASONING...',
  score_clarity: '// EVALUATING CLARITY...',
  score_persuasiveness: '// SCORING PERSUASION...',
  score_correctness: '// CHECKING CORRECTNESS...',
  score_code_quality: '// EVALUATING CODE...',
  score_efficiency: '// ASSESSING EFFICIENCY...',
  score_originality: '// JUDGING ORIGINALITY...',
  score_craft: '// EVALUATING CRAFT...',
  score_emotional_impact: '// MEASURING IMPACT...',
  declare_winner: '// RENDERING VERDICT...',
};

export default function JudgePanel({ scores, verdict, currentTool, isJudging, isComplete }: JudgePanelProps) {
  const modelKeys = useMemo(() => Object.keys(scores), [scores]);

  const scoredCategories = useMemo(() => {
    const categories = new Set<CategoryKey>();
    Object.values(scores).forEach((modelScore) => {
      Object.keys(modelScore).forEach((cat) => categories.add(cat as CategoryKey));
    });
    return Array.from(categories);
  }, [scores]);

  const getToolDescription = (tool: string | null): string => {
    if (!tool) return '// INITIALIZING JUDGE...';
    return TOOL_DESCRIPTIONS[tool] || '// PROCESSING...';
  };

  const getHighestScore = (category: CategoryKey): number => {
    let highest = 0;
    modelKeys.forEach((modelKey) => {
      const modelScores = scores[modelKey] as Record<string, { score: number; rationale: string } | undefined> | undefined;
      const score = modelScores?.[category]?.score || 0;
      if (score > highest) highest = score;
    });
    return highest;
  };

  const hasScores = modelKeys.length > 0 && scoredCategories.length > 0;

  return (
    <div className="border-2 border-black bg-white">
      <div className="border-b-2 border-black p-6 text-center">
        <p className="text-xs font-mono tracking-widest text-gray-500 mb-2">
          {isJudging && !isComplete ? '// JUDGMENT IN PROGRESS' : '// VERDICT'}
        </p>
        <h2 className="font-display text-4xl tracking-wider">THE JUDGE</h2>
        {isJudging && !isComplete && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-black animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-gray-500">ACTIVE</span>
          </div>
        )}
      </div>

      {isJudging && !isComplete && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 font-mono text-sm text-gray-700">
            <div className="w-4 h-4 border-2 border-black animate-spin" />
            <span>{getToolDescription(currentTool)}</span>
          </div>
        </div>
      )}

      {!isJudging && !isComplete && !hasScores && (
        <div className="p-12 text-center">
          <p className="text-sm text-gray-400 font-mono">{'// AWAITING BATTLE COMPLETION...'}</p>
        </div>
      )}

      {hasScores && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200">
          {scoredCategories.map((category) => {
            const categoryInfo = CATEGORIES[category];
            const highestScore = getHighestScore(category);
            return (
              <div key={category} className="bg-white p-5">
                <h3 className="text-xs font-mono tracking-widest text-gray-500 mb-4 pb-3 border-b border-gray-200">
                  {categoryInfo?.name || category.replace(/_/g, ' ').toUpperCase()}
                </h3>
                <div className="space-y-4">
                  {modelKeys.map((modelKey) => {
                    const modelScoresObj = scores[modelKey] as Record<string, { score: number; rationale: string } | undefined> | undefined;
                    const modelScore = modelScoresObj?.[category];
                    const model = MODELS[modelKey as ModelKey];
                    const isHighest = modelScore?.score === highestScore;
                    if (!modelScore) return null;
                    return (
                      <div key={category + "-" + modelKey} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-1 h-4 ${isHighest ? 'bg-black' : 'bg-gray-200'}`} />
                            <span className="text-sm text-gray-700 uppercase tracking-wide">{model?.name || modelKey}</span>
                          </div>
                          <span className={`font-display text-2xl ${isHighest ? 'text-black' : 'text-gray-500'}`}>{modelScore.score}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100">
                          <div className={`h-full transition-all duration-500 ${isHighest ? 'bg-black' : 'bg-gray-300'}`} style={{ width: `${(modelScore.score / 10) * 100}%` }} />
                        </div>
                        {modelScore.rationale && <p className="text-xs text-gray-400 mt-2 leading-relaxed font-mono">{modelScore.rationale}</p>}
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
        <div className="border-t-2 border-black p-8 text-center">
          <p className="text-xs font-mono tracking-widest text-gray-500 mb-4">{'// WINNER DECLARED'}</p>
          <WinnerName winner={verdict.winner} />
          <p className="max-w-[600px] mx-auto text-sm text-gray-700 leading-relaxed font-mono mt-6 border-l-2 border-black pl-4 text-left">&quot;{verdict.verdict}&quot;</p>
        </div>
      )}
    </div>
  );
}

function WinnerName({ winner }: { winner: string }) {
  const model = MODELS[winner as ModelKey];
  return (
    <div className="relative inline-block">
      <h3 className="font-display text-6xl tracking-widest text-black">{model?.name?.toUpperCase() || winner.toUpperCase()}</h3>
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: '0 0 60px rgba(0,0,0,0.15)', filter: 'blur(20px)' }} />
    </div>
  );
}
