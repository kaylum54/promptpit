'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ModelPanel from '@/components/ModelPanel';
import JudgePanel from '@/components/JudgePanel';
import DebateReactions from '@/components/DebateReactions';
import { MODELS, getModelKeys, type ModelKey } from '@/lib/models';
import type { DebateResponse, ModelScores, JudgeVerdict, DebateRound } from '@/lib/types';

interface SharedDebate {
  id: string;
  prompt: string;
  responses: Record<string, string>;
  scores: Record<string, ModelScores> | null;
  verdict: JudgeVerdict | null;
  latencies: Record<string, { ttft: number; total: number }> | null;
  created_at: string;
  shareId: string;
  // Multi-round fields
  is_multi_round?: boolean;
  rounds?: DebateRound[];
  total_rounds?: number;
}

function convertResponsesToDebateResponses(
  responses: Record<string, string>,
  latencies?: Record<string, { ttft: number; total: number }> | null
): Record<string, DebateResponse> {
  const modelKeys = getModelKeys();
  const result: Record<string, DebateResponse> = {};

  for (const key of modelKeys) {
    const modelName = MODELS[key].name;
    const content = responses[modelName] || '';
    const latency = latencies?.[modelName] || { ttft: 0, total: 0 };

    if (content) {
      result[key] = {
        model: key,
        content,
        latency,
        status: 'complete',
      };
    }
  }

  return result;
}

function convertDebateToResponses(debate: SharedDebate): Record<string, DebateResponse> {
  return convertResponsesToDebateResponses(debate.responses, debate.latencies);
}

export default function SharePage() {
  const params = useParams();
  const shareId = params.shareId as string;

  const [debate, setDebate] = useState<SharedDebate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebate = async () => {
      try {
        const response = await fetch(`/api/share/${shareId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('This debate is no longer shared or does not exist.');
          } else {
            setError('Failed to load debate');
          }
          return;
        }
        const data = await response.json();
        setDebate(data);
      } catch {
        setError('Failed to load debate');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebate();
  }, [shareId]);

  const displayResponses = debate ? convertDebateToResponses(debate) : {};
  const activeModelKeys = Object.keys(displayResponses) as ModelKey[];

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity">
            <Image src="/logo.jpeg" alt="PromptPit" width={120} height={40} className="rounded-md -mt-1" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-accent-primary hover:text-accent-hover px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
          >
            Start Your Own Debate
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-content mx-auto">
          {/* Loading Skeleton */}
          {isLoading && (
            <>
              {/* Shared Badge Skeleton */}
              <div className="bg-bg-elevated border border-border-subtle rounded-lg px-4 py-3 mb-6 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-bg-subtle rounded" />
                  <div className="h-4 bg-bg-subtle rounded w-24" />
                </div>
                <div className="h-3 bg-bg-subtle rounded w-20" />
              </div>

              {/* Prompt Skeleton */}
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-6 animate-pulse">
                <div className="h-3 bg-bg-subtle rounded w-24 mb-3" />
                <div className="space-y-2">
                  <div className="h-5 bg-bg-subtle rounded w-full" />
                  <div className="h-5 bg-bg-subtle rounded w-4/5" />
                </div>
              </div>

              {/* Model Panels Skeleton */}
              <section className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-bg-elevated border border-border-subtle rounded-xl overflow-hidden animate-pulse"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      {/* Header */}
                      <div className="border-b border-border-subtle p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-bg-subtle rounded-full" />
                          <div className="h-4 bg-bg-subtle rounded w-20" />
                        </div>
                        <div className="h-5 bg-bg-subtle rounded w-16" />
                      </div>
                      {/* Content */}
                      <div className="p-4 min-h-[200px] space-y-2">
                        <div className="h-4 bg-bg-subtle rounded w-full" />
                        <div className="h-4 bg-bg-subtle rounded w-11/12" />
                        <div className="h-4 bg-bg-subtle rounded w-4/5" />
                        <div className="h-4 bg-bg-subtle rounded w-full" />
                        <div className="h-4 bg-bg-subtle rounded w-3/4" />
                        <div className="h-4 bg-bg-subtle rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Judge Panel Skeleton */}
              <div className="border border-border-subtle rounded-2xl p-8 animate-pulse">
                <div className="text-center mb-6">
                  <div className="h-3 bg-bg-subtle rounded w-20 mx-auto mb-2" />
                  <div className="w-8 h-8 bg-bg-subtle rounded mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-bg-base border border-border-subtle rounded-lg p-4">
                      <div className="h-3 bg-bg-subtle rounded w-20 mb-3" />
                      <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="h-3 bg-bg-subtle rounded w-16" />
                              <div className="h-3 bg-bg-subtle rounded w-8" />
                            </div>
                            <div className="h-1.5 bg-bg-subtle rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Winner Skeleton */}
                <div className="pt-6 border-t border-border-subtle text-center">
                  <div className="w-10 h-10 bg-bg-subtle rounded mx-auto mb-3" />
                  <div className="h-3 bg-bg-subtle rounded w-16 mx-auto mb-2" />
                  <div className="h-8 bg-bg-subtle rounded w-24 mx-auto mb-4" />
                  <div className="h-4 bg-bg-subtle rounded w-3/4 mx-auto" />
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && !isLoading && (
            <div className="text-center py-20">
              <span className="text-6xl mb-6 block">🔒</span>
              <h2 className="text-xl font-bold text-text-primary mb-2">Debate Not Found</h2>
              <p className="text-text-secondary mb-6">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-accent-primary text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Start a New Debate
              </Link>
            </div>
          )}

          {/* Debate Content */}
          {debate && !isLoading && (
            <>
              {/* Shared Badge */}
              <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg px-4 py-3 mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔗</span>
                  <span className="text-sm text-accent-primary">
                    Shared Debate
                    {debate.is_multi_round && debate.total_rounds && (
                      <span className="ml-2 text-xs text-text-muted">
                        ({debate.total_rounds} round{debate.total_rounds > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(debate.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Initial Round (Round 1) */}
              <div className="mb-8">
                {/* Round 1 Prompt */}
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-6">
                  <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                    {debate.is_multi_round ? 'Round 1 - Initial Topic' : 'Debate Topic'}
                  </h2>
                  <p className="text-lg text-text-primary">{debate.prompt}</p>
                </div>

                {/* Round 1 Model Panels */}
                <section className="mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeModelKeys.map((key) => (
                      <ModelPanel
                        key={key}
                        modelKey={key}
                        response={displayResponses[key]}
                      />
                    ))}
                  </div>
                </section>

                {/* Round 1 Judge Panel (only show if NOT multi-round, or if no additional rounds) */}
                {(!debate.is_multi_round || !debate.rounds || debate.rounds.length === 0) && (debate.scores || debate.verdict) && (
                  <section className="mb-6">
                    <JudgePanel
                      scores={debate.scores || {}}
                      verdict={debate.verdict}
                      currentTool={null}
                      isJudging={false}
                      isComplete={true}
                    />
                  </section>
                )}
              </div>

              {/* Additional Rounds (for multi-round debates) */}
              {debate.is_multi_round && debate.rounds && debate.rounds.length > 0 && (
                <>
                  {debate.rounds.map((round, index) => {
                    const roundResponses = convertResponsesToDebateResponses(round.responses, round.latencies);
                    const roundModelKeys = Object.keys(roundResponses) as ModelKey[];
                    const isLastRound = index === debate.rounds!.length - 1;

                    return (
                      <div key={round.roundNumber} className="mb-8 border-t border-border-subtle pt-8">
                        {/* Round Header */}
                        <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-6">
                          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                            Round {round.roundNumber} - Follow-up
                          </h2>
                          <p className="text-lg text-text-primary">{round.prompt}</p>
                        </div>

                        {/* Round Model Panels */}
                        <section className="mb-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {roundModelKeys.map((key) => (
                              <ModelPanel
                                key={`${round.roundNumber}-${key}`}
                                modelKey={key}
                                response={roundResponses[key]}
                              />
                            ))}
                          </div>
                        </section>

                        {/* Round Judge Panel (show for last round, or if round has verdict) */}
                        {(isLastRound || round.verdict) && (round.scores || round.verdict) && (
                          <section className="mb-6">
                            <JudgePanel
                              scores={round.scores || {}}
                              verdict={round.verdict || null}
                              currentTool={null}
                              isJudging={false}
                              isComplete={true}
                            />
                          </section>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* Reactions */}
              <section className="mb-10">
                <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">React to this debate</span>
                    <DebateReactions
                      debateId={debate.id}
                      isAuthenticated={false}
                      onAuthRequired={() => {
                        // Could redirect to sign in, for now just show alert
                        alert('Sign in to react to debates!');
                      }}
                    />
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-4">
        <div className="max-w-content mx-auto text-center text-text-muted text-sm">
          <Link href="/" className="hover:text-accent-primary transition-colors">
            Create your own AI debate on PromptPit
          </Link>
        </div>
      </footer>
    </div>
  );
}
