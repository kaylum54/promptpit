'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ModelPanel from '@/components/ModelPanel';
import JudgePanel from '@/components/JudgePanel';
import DebateReactions from '@/components/DebateReactions';
import { MODELS, getModelKeys, type ModelKey } from '@/lib/models';
import type { DebateResponse, ModelScores, JudgeVerdict } from '@/lib/types';

interface SharedDebate {
  id: string;
  prompt: string;
  responses: Record<string, string>;
  scores: Record<string, ModelScores> | null;
  verdict: JudgeVerdict | null;
  latencies: Record<string, { ttft: number; total: number }> | null;
  created_at: string;
  shareId: string;
}

function convertDebateToResponses(debate: SharedDebate): Record<string, DebateResponse> {
  const modelKeys = getModelKeys();
  const result: Record<string, DebateResponse> = {};

  for (const key of modelKeys) {
    const modelName = MODELS[key].name;
    const content = debate.responses[modelName] || '';
    const latency = debate.latencies?.[modelName] || { ttft: 0, total: 0 };

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
      } catch (err) {
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
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-xl">&#x1F3DF;</span>
            <h1 className="text-xl font-bold text-text-primary">PromptPit</h1>
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
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-tertiary">Loading shared debate...</p>
            </div>
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
                  <span className="text-sm text-accent-primary">Shared Debate</span>
                </div>
                <span className="text-xs text-text-muted">
                  {new Date(debate.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {/* Prompt */}
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6 mb-8">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                  Debate Topic
                </h2>
                <p className="text-lg text-text-primary">{debate.prompt}</p>
              </div>

              {/* Model Panels */}
              <section className="mb-10">
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

              {/* Judge Panel */}
              {(debate.scores || debate.verdict) && (
                <section className="mb-10">
                  <JudgePanel
                    scores={debate.scores || {}}
                    verdict={debate.verdict}
                    currentTool={null}
                    isJudging={false}
                    isComplete={true}
                  />
                </section>
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
