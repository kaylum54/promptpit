'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
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
import { getModelKeys, MODELS } from '@/lib/models';
import { ARENA_MODES, type ArenaMode } from '@/lib/modes';
import ModeSelector from '@/components/ModeSelector';
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
  const { selectedModels, setSelectedModels, customModels, setCustomModels, isLoaded: prefsLoaded } = usePreferences();

  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  // Blind mode - hide model names until verdict is revealed
  const [blindMode, setBlindMode] = useState(false);
  // Arena mode state
  const [arenaMode, setArenaMode] = useState<ArenaMode>('debate');
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
      startJudging(currentPrompt, judgeResponses, arenaMode);
    }
  }, [isViewingHistory, hasContent, allModelsComplete, hasCompletedModels, isJudging, isComplete, currentPrompt, activeModelKeys, responses, startJudging, arenaMode]);

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
    // Pass selected models and arena mode to the debate
    startDebate(prompt, { previousRounds, models: selectedModels, mode: arenaMode });
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
      <header className="h-16 border-b border-border bg-bg-base/80 backdrop-blur-md sticky top-0 z-30 relative">
        {/* Subtle glow line at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1) 20%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.1) 80%, transparent)',
          }}
        />
        <div className="max-w-[1400px] mx-auto h-full px-6 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="PromptPit Logo" width={32} height={32} className="rounded-md" />
            <h1
              className="text-xl font-bold text-text-primary tracking-wide"
              style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.1)' }}
            >
              PromptPit
            </h1>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            {/* Gallery Link */}
            <a
              href="/gallery"
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors group"
              title="Browse Public Debates"
            >
              <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </a>

            {/* Leaderboard Button */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 rounded-md hover:bg-bg-elevated transition-colors group"
              title="Leaderboard"
            >
              <svg className="w-5 h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
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

          {/* Mode Selector & Blind Mode Toggle */}
          {!isViewingHistory && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Arena Mode Selector */}
              <ModeSelector
                currentMode={arenaMode}
                onModeChange={setArenaMode}
                disabled={isDebating || isJudging}
              />

              {/* Blind Mode Toggle */}
              <button
                onClick={() => setBlindMode(!blindMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${blindMode ? 'bg-accent-primary text-white' : 'bg-bg-elevated text-text-secondary hover:text-text-primary border border-border'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {blindMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
                {blindMode ? 'Blind Mode ON' : 'Blind Mode'}
              </button>
            </div>
          )}

          {/* Input Section */}
          <DebateInput
            onSubmit={handleStartDebate}
            isLoading={isDebating || isJudging}
            onReset={handleReset}
            placeholder={ARENA_MODES[arenaMode].placeholder}
            examples={ARENA_MODES[arenaMode].examples}
            mode={arenaMode}
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
                      blindMode={blindMode}
                      showIdentity={isComplete || isViewingHistory}
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
                    className="flex-1 bg-[#1a1a1a] border border-border-subtle rounded-lg px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary"
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
        customModels={customModels}
        onCustomModelsChange={setCustomModels}
      />
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />
    </div>
  );
}
