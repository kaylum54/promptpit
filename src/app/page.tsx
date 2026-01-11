'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebateStream, type PreviousRound } from '@/hooks/useDebateStream';
import { useJudgeStream } from '@/hooks/useJudgeStream';
import { useAuth } from '@/hooks/useAuth';
import { useUsage } from '@/hooks/useUsage';
import { usePreferences } from '@/hooks/usePreferences';
import DebateInput from '@/components/DebateInput';
import ModelPanel from '@/components/ModelPanel';
import JudgePanel from '@/components/JudgePanel';
import AuthModal from '@/components/AuthModal';
import DebateHistory from '@/components/DebateHistory';
import UsageBadge from '@/components/UsageBadge';
import LimitReachedModal from '@/components/LimitReachedModal';
import SettingsModal from '@/components/SettingsModal';
import DebateReactions from '@/components/DebateReactions';
import Leaderboard from '@/components/Leaderboard';
import ShareButton from '@/components/ShareButton';
import { getModelKeys, MODELS, type ModelKey } from '@/lib/models';
import type { Debate, DebateResponse, ModelScores, JudgeVerdict } from '@/lib/types';

// Convert historical debate data to display format
function convertDebateToResponses(debate: Debate): Record<string, DebateResponse> {
  const modelKeys = getModelKeys();
  const result: Record<string, DebateResponse> = {};

  for (const key of modelKeys) {
    const modelName = MODELS[key].name;
    const content = debate.responses[modelName] || '';
    const latency = debate.latencies?.[modelName] || { ttft: 0, total: 0 };

    result[key] = {
      model: key,
      content,
      latency,
      status: content ? 'complete' : 'idle',
    };
  }

  return result;
}

export default function Home() {
  const { responses, isDebating, currentRound, startDebate, reset: resetDebate } = useDebateStream();
  const { scores, verdict, currentTool, isJudging, isComplete, startJudging, reset: resetJudge } = useJudgeStream();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { usage, refresh: refreshUsage } = useUsage();
  const { selectedModels, setSelectedModels, isLoaded: prefsLoaded } = usePreferences();

  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Multi-round debate state
  const [completedRounds, setCompletedRounds] = useState<PreviousRound[]>([]);
  const [showContinueInput, setShowContinueInput] = useState(false);
  const [continuePrompt, setContinuePrompt] = useState('');
  // State for viewing historical debates
  const [loadedDebate, setLoadedDebate] = useState<Debate | null>(null);
  const [historicalResponses, setHistoricalResponses] = useState<Record<string, DebateResponse> | null>(null);
  const [historicalScores, setHistoricalScores] = useState<Record<string, ModelScores> | null>(null);
  const [historicalVerdict, setHistoricalVerdict] = useState<JudgeVerdict | null>(null);

  // Determine what content to display (historical or live)
  const displayResponses = historicalResponses || responses;
  const displayScores = historicalScores || scores;
  const displayVerdict = historicalVerdict || verdict;
  const isViewingHistory = loadedDebate !== null;

  // Use selected models for display (filter responses to only selected ones)
  const activeModelKeys = selectedModels;

  const hasTriggeredJudge = useRef(false);
  const hasSavedDebate = useRef(false);

  const hasContent = Object.values(displayResponses).some(r => r.content.length > 0);
  const allModelsComplete = Object.values(responses).every(r => r.status === 'complete' || r.status === 'error');
  const hasCompletedModels = Object.values(responses).some(r => r.status === 'complete');

  // Auto-trigger judge when debate completes
  useEffect(() => {
    if (!isViewingHistory && hasContent && allModelsComplete && hasCompletedModels && !isJudging && !isComplete && !hasTriggeredJudge.current) {
      hasTriggeredJudge.current = true;
      const judgeResponses: Record<string, string> = {};
      for (const key of activeModelKeys) {
        if (responses[key]?.status === 'complete') {
          judgeResponses[MODELS[key].name] = responses[key].content;
        }
      }
      startJudging(currentPrompt, judgeResponses);
    }
  }, [isViewingHistory, hasContent, allModelsComplete, hasCompletedModels, isJudging, isComplete, currentPrompt, activeModelKeys, responses, startJudging]);

  // Auto-save debate when judge completes
  useEffect(() => {
    if (!isViewingHistory && isComplete && verdict && !hasSavedDebate.current) {
      hasSavedDebate.current = true;
      const latencies: Record<string, { ttft: number; total: number }> = {};
      for (const key of activeModelKeys) {
        if (responses[key]) {
          latencies[MODELS[key].name] = responses[key].latency;
        }
      }
      const responseData: Record<string, string> = {};
      for (const key of activeModelKeys) {
        if (responses[key]) {
          responseData[MODELS[key].name] = responses[key].content;
        }
      }
      fetch('/api/debates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          responses: responseData,
          scores,
          verdict,
          latencies,
        }),
      })
        .then(() => {
          // Refresh usage after debate is saved
          refreshUsage();
        })
        .catch(err => console.error('Failed to save debate:', err));
    }
  }, [isViewingHistory, isComplete, verdict, currentPrompt, activeModelKeys, responses, scores, refreshUsage]);

  // Show continue input when round completes
  useEffect(() => {
    if (!isViewingHistory && isComplete && verdict && !showContinueInput) {
      setShowContinueInput(true);
    }
  }, [isViewingHistory, isComplete, verdict, showContinueInput]);

  const handleSelectDebate = useCallback((debate: Debate) => {
    resetDebate();
    resetJudge();
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = true;

    setLoadedDebate(debate);
    setCurrentPrompt(debate.prompt);
    setHistoricalResponses(convertDebateToResponses(debate));
    setHistoricalScores(debate.scores || null);
    setHistoricalVerdict(debate.verdict || null);
    // Clear multi-round state when viewing history
    setCompletedRounds([]);
    setShowContinueInput(false);
    setContinuePrompt('');
  }, [resetDebate, resetJudge]);

  const handleStartDebate = (prompt: string, previousRounds?: PreviousRound[]) => {
    // Check if user has reached their debate limit
    if (usage?.canStartDebate === false) {
      setShowLimitModal(true);
      return;
    }

    setLoadedDebate(null);
    setHistoricalResponses(null);
    setHistoricalScores(null);
    setHistoricalVerdict(null);
    setShowContinueInput(false);

    setCurrentPrompt(prompt);
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = false;
    // Pass selected models to the debate
    startDebate(prompt, { previousRounds, models: selectedModels });
  };

  const handleContinueDebate = () => {
    if (!continuePrompt.trim()) return;

    // Save current round to completed rounds
    const currentRoundData: PreviousRound = {
      prompt: currentPrompt,
      responses: {},
    };
    for (const key of activeModelKeys) {
      if (responses[key]?.status === 'complete') {
        currentRoundData.responses[MODELS[key].name] = responses[key].content;
      }
    }

    const newCompletedRounds = [...completedRounds, currentRoundData];
    setCompletedRounds(newCompletedRounds);

    // Reset judge state for new round
    resetJudge();
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = false;
    setShowContinueInput(false);

    // Start new debate with previous rounds context
    handleStartDebate(continuePrompt, newCompletedRounds);
    setContinuePrompt('');
  };

  const handleReset = () => {
    setLoadedDebate(null);
    setHistoricalResponses(null);
    setHistoricalScores(null);
    setHistoricalVerdict(null);
    // Reset multi-round state
    setCompletedRounds([]);
    setShowContinueInput(false);
    setContinuePrompt('');

    setCurrentPrompt('');
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = false;
    resetDebate();
    resetJudge();
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-base">
      {/* Header */}
      <header className="h-16 border-b border-border-subtle bg-bg-base/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-xl">&#x1F3DF;</span>
            <h1 className="text-xl font-bold text-text-primary">PromptPit</h1>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            {/* Gallery Link */}
            <a
              href="/gallery"
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors"
              title="Browse Public Debates"
            >
              <span className="text-lg">&#x1F30D;</span>
            </a>

            {/* Leaderboard Button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors"
              title="Leaderboard"
            >
              <span className="text-lg">&#x1F3C6;</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {user && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
                >
                  History
                </button>
                <a
                  href="/analytics"
                  className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
                >
                  Analytics
                </a>
              </>
            )}
            {user && usage && !usage.isGuest && (
              <UsageBadge
                debatesRemaining={usage.debatesRemaining}
                debatesLimit={usage.debatesLimit}
                tier={usage.tier}
                onClick={() => window.location.href = '/pricing'}
              />
            )}
            {isAuthLoading ? (
              <span className="text-text-muted text-sm">...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-text-tertiary text-sm truncate max-w-[150px] hidden sm:inline" title={user.email || ''}>
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-sm font-medium text-text-secondary hover:text-text-primary px-4 py-2 rounded-md hover:bg-bg-elevated transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6">
        <div className="max-w-content mx-auto">
          {/* Viewing History Banner */}
          {isViewingHistory && (
            <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg px-4 py-3 mt-6 flex items-center justify-between">
              <span className="text-sm text-accent-primary">
                Viewing saved debate from history
              </span>
              <button
                onClick={handleReset}
                className="text-sm font-medium text-accent-primary hover:text-accent-hover"
              >
                Start New Debate
              </button>
            </div>
          )}

          {/* Round Indicator */}
          {!isViewingHistory && currentRound > 1 && (
            <div className="bg-accent-secondary/10 border border-accent-secondary/20 rounded-lg px-4 py-3 mt-6 flex items-center justify-between">
              <span className="text-sm text-accent-secondary">
                Round {currentRound} of multi-round debate
              </span>
              <span className="text-xs text-text-muted">
                {completedRounds.length} previous round{completedRounds.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Selected Models Indicator */}
          {prefsLoaded && selectedModels.length < getModelKeys().length && (
            <div className="mt-4 flex items-center gap-2 text-xs text-text-muted">
              <span>Active models:</span>
              <div className="flex gap-1">
                {selectedModels.map(key => (
                  <span
                    key={key}
                    className="px-2 py-0.5 rounded-full text-white text-xs"
                    style={{ backgroundColor: MODELS[key].color }}
                  >
                    {MODELS[key].name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-accent-primary hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Input Section */}
          <DebateInput
            onSubmit={handleStartDebate}
            isLoading={isDebating || isJudging}
            onReset={handleReset}
          />

          {/* Model Panels Grid */}
          {(isDebating || hasContent) && (
            <section className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeModelKeys.map((key) => (
                  displayResponses[key] && (
                    <ModelPanel
                      key={key}
                      modelKey={key}
                      response={displayResponses[key]}
                    />
                  )
                ))}
              </div>
            </section>
          )}

          {/* Judge Panel */}
          {(hasContent && !isDebating) && (isJudging || isComplete || isViewingHistory || Object.keys(displayScores).length > 0) && (
            <section className="mb-10">
              <JudgePanel
                scores={displayScores}
                verdict={displayVerdict}
                currentTool={isViewingHistory ? null : currentTool}
                isJudging={isViewingHistory ? false : isJudging}
                isComplete={isViewingHistory ? true : isComplete}
              />
            </section>
          )}

          {/* Reactions & Share for Historical Debates */}
          {isViewingHistory && loadedDebate && (
            <section className="mb-10">
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-text-secondary">Rate this debate</span>
                    <DebateReactions
                      debateId={loadedDebate.id}
                      isAuthenticated={!!user}
                      onAuthRequired={() => setShowAuthModal(true)}
                    />
                  </div>
                  <ShareButton
                    debateId={loadedDebate.id}
                    initialShareId={loadedDebate.share_id}
                    isPublic={loadedDebate.is_public}
                    size="md"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Continue Debate Section */}
          {!isViewingHistory && showContinueInput && isComplete && (
            <section className="mb-10">
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-2">Continue the Debate</h3>
                <p className="text-sm text-text-secondary mb-4">
                  Add a follow-up prompt to continue this debate. The models will have context from previous rounds.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={continuePrompt}
                    onChange={(e) => setContinuePrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinueDebate()}
                    placeholder="Enter follow-up prompt..."
                    className="flex-1 bg-bg-base border border-border-subtle rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
                  />
                  <button
                    onClick={handleContinueDebate}
                    disabled={!continuePrompt.trim()}
                    className="px-6 py-3 bg-accent-primary text-white font-medium rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Continue
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-4">
                  <button
                    onClick={handleReset}
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors"
                  >
                    Start Fresh Instead
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle px-6 py-4">
        <div className="max-w-content mx-auto text-center text-text-muted text-sm">
          Powered by OpenRouter
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      <DebateHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectDebate={handleSelectDebate}
        isAuthenticated={!!user}
        onAuthRequired={() => setShowAuthModal(true)}
      />
      {usage && (
        <LimitReachedModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          debatesUsed={usage.debatesThisMonth}
          debatesLimit={usage.debatesLimit}
          tier={usage.tier}
          monthResetDate={usage.monthResetDate}
        />
      )}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        selectedModels={selectedModels}
        onModelsChange={setSelectedModels}
      />
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}
