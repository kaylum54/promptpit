'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useDebateStream, type PreviousRound } from '@/hooks/useDebateStream';
import { useJudgeStream } from '@/hooks/useJudgeStream';
import { useQuickMode } from '@/hooks/useQuickMode';
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
import Footer from '@/components/Footer';
import ArenaSelector from '@/components/ArenaSelector';
import LandingPage from '@/components/LandingPage';
import SuggestedPrompts from '@/components/SuggestedPrompts';
import ModeToggle, { type AppMode } from '@/components/ModeToggle';
import QuickResponse from '@/components/QuickResponse';
import ModelSelectorModal from '@/components/ModelSelectorModal';
import type { ModelKey } from '@/lib/routing';
import StatsBar from '@/components/StatsBar';
import RecentBattles from '@/components/RecentBattles';
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
  const { routing: quickRouting, response: quickResponse, isStreaming: isQuickStreaming, startQuick, reset: resetQuick } = useQuickMode();
  const { user, isLoading: isAuthLoading, signOut } = useAuth();
  const { usage, refresh: refreshUsage } = useUsage();
  const { selectedModels, setSelectedModels, customModels, setCustomModels, isLoaded: prefsLoaded } = usePreferences();

  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [appMode, setAppMode] = useState<AppMode>('debate');
  const appSectionRef = useRef<HTMLDivElement>(null);
  const [blindMode, setBlindMode] = useState(false);
  const [arenaMode, setArenaMode] = useState<ArenaMode>('debate');
  const [selectedArena, setSelectedArena] = useState<'debate' | 'code' | 'writing'>('debate');
  const [completedRounds, setCompletedRounds] = useState<PreviousRound[]>([]);
  const [showContinueInput, setShowContinueInput] = useState(false);
  const [continuePrompt, setContinuePrompt] = useState('');
  const [loadedDebate, setLoadedDebate] = useState<Debate | null>(null);
  const [historicalResponses, setHistoricalResponses] = useState<Record<string, DebateResponse> | null>(null);
  const [historicalScores, setHistoricalScores] = useState<Record<string, ModelScores> | null>(null);
  const [historicalVerdict, setHistoricalVerdict] = useState<JudgeVerdict | null>(null);

  const displayResponses = historicalResponses || responses;
  const displayScores = historicalScores || scores;
  const displayVerdict = historicalVerdict || verdict;
  const isViewingHistory = loadedDebate !== null;
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
      startJudging(currentPrompt, judgeResponses, arenaMode, selectedArena);
    }
  }, [isViewingHistory, hasContent, allModelsComplete, hasCompletedModels, isJudging, isComplete, currentPrompt, activeModelKeys, responses, startJudging, arenaMode, selectedArena]);

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
        .then(() => refreshUsage())
        .catch(err => console.error('Failed to save debate:', err));
    }
  }, [isViewingHistory, isComplete, verdict, currentPrompt, activeModelKeys, responses, scores, refreshUsage]);

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
    setCompletedRounds([]);
    setShowContinueInput(false);
    setContinuePrompt('');
  }, [resetDebate, resetJudge]);

  const handleStartDebate = (prompt: string, previousRounds?: PreviousRound[]) => {
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
    startDebate(prompt, { previousRounds, models: selectedModels, mode: arenaMode, arena: selectedArena });
  };

  const handleContinueDebate = () => {
    if (!continuePrompt.trim()) return;
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
    resetJudge();
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = false;
    setShowContinueInput(false);
    handleStartDebate(continuePrompt, newCompletedRounds);
    setContinuePrompt('');
  };

  const handleReset = () => {
    setLoadedDebate(null);
    setHistoricalResponses(null);
    setHistoricalScores(null);
    setHistoricalVerdict(null);
    setCompletedRounds([]);
    setShowContinueInput(false);
    setContinuePrompt('');
    setCurrentPrompt('');
    hasTriggeredJudge.current = false;
    hasSavedDebate.current = false;
    resetDebate();
    resetJudge();
    resetQuick();
  };

  const handleUpgradeRequired = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      window.location.href = '/pricing';
    }
  };

  const handleQuickSubmit = (prompt: string) => {
    setCurrentPrompt(prompt);
    startQuick(prompt);
  };

  const handleQuickExpand = () => {
    setAppMode('debate');
    resetQuick();
    handleStartDebate(currentPrompt);
  };

  const handleQuickTryDifferent = () => {
    setShowModelSelector(true);
  };

  const handleQuickModelSelect = (model: ModelKey) => {
    startQuick(currentPrompt, model);
    setShowModelSelector(false);
  };

  const handleQuickCopy = () => {
    if (quickResponse) {
      navigator.clipboard.writeText(quickResponse);
    }
  };

  const handlePromptSubmit = (prompt: string) => {
    if (appMode === 'quick') {
      handleQuickSubmit(prompt);
    } else {
      handleStartDebate(prompt);
    }
  };

  const handleSelectSuggestedPrompt = (prompt: string) => {
    if (!isDebating && !isJudging && !isQuickStreaming) {
      handlePromptSubmit(prompt);
    }
  };

  const isPro = usage?.tier === 'pro';

  // Landing page handlers
  const handleLandingStartDebate = () => {
    setShowLanding(false);
    setAppMode('debate');
    setTimeout(() => {
      appSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleLandingStartQuick = () => {
    if (!isPro) {
      if (!user) {
        setShowAuthModal(true);
      } else {
        window.location.href = '/pricing';
      }
      return;
    }
    setShowLanding(false);
    setAppMode('quick');
    setTimeout(() => {
      appSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Show landing only when no active content
  const shouldShowLanding = showLanding && !hasContent && !isDebating && !isQuickStreaming && !quickRouting && !isViewingHistory;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - Brutalist */}
      <header className="border-b-2 border-gray-200 sticky top-0 z-30 bg-white">
        <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 border-2 border-black flex items-center justify-center">
              <span className="font-display text-xl tracking-wider">P</span>
            </div>
            <span className="font-display text-2xl tracking-widest hidden sm:block">PROMPTPIT</span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {/* Gallery */}
            <Link
              href="/gallery"
              className="nav-link"
              title="Gallery"
            >
              <span className="hidden sm:inline">GALLERY</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Link>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="nav-link"
              title="Pricing"
            >
              <span className="hidden sm:inline">PRICING</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>

            {/* Leaderboard */}
            <button
              onClick={() => setShowLeaderboard(true)}
              className="nav-link"
              title="Leaderboard"
            >
              <span className="hidden sm:inline">RANKS</span>
              <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3v-8zM9 9h2v12H9V9zM15 5h2v16h-2V5zM21 1h2v20h-2V1z" />
              </svg>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="nav-link"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-2" />

            {user && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="nav-link"
                >
                  <span className="hidden sm:inline">HISTORY</span>
                  <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <Link href="/analytics" className="nav-link hidden sm:flex items-center">
                  ANALYTICS
                </Link>
              </>
            )}

            {usage && (
              <UsageBadge
                debatesRemaining={usage.debatesRemaining}
                debatesLimit={usage.debatesLimit}
                tier={usage.tier}
                onClick={() => usage.isGuest ? setShowAuthModal(true) : window.location.href = '/pricing'}
              />
            )}

            {isAuthLoading ? (
              <div className="flex items-center gap-2 px-3">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-black animate-spin" />
              </div>
            ) : user ? (
              <button
                onClick={() => signOut()}
                className="nav-link"
              >
                <span className="hidden sm:inline">EXIT</span>
                <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-sm py-2 px-4"
              >
                ENTER
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Viewing History Banner */}
          {isViewingHistory && (
            <div className="border-2 border-black mt-8 p-4 flex items-center justify-between">
              <span className="text-sm uppercase tracking-wider">
                {'//'} VIEWING ARCHIVED BATTLE
              </span>
              <button
                onClick={handleReset}
                className="btn-ghost"
              >
                NEW BATTLE
              </button>
            </div>
          )}

          {/* Guest Sign-up Prompt */}
          {!user && !isAuthLoading && (
            <div className="border-2 border-gray-200 mt-8 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-wider text-black">
                  SIGN UP FOR 5 EXTRA BATTLES FREE
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Guests: 1/month — Registered: 6/month
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-primary text-sm"
              >
                REGISTER FREE
              </button>
            </div>
          )}

          {/* Round Indicator */}
          {!isViewingHistory && currentRound > 1 && (
            <div className="border-2 border-black mt-8 p-4 flex items-center justify-between">
              <span className="font-display text-xl tracking-wider">
                ROUND {currentRound}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">
                {completedRounds.length} PREVIOUS ROUND{completedRounds.length !== 1 ? 'S' : ''}
              </span>
            </div>
          )}

          {/* Landing Page */}
          {shouldShowLanding && (
            <LandingPage
              onStartDebate={handleLandingStartDebate}
              onStartQuick={handleLandingStartQuick}
              isAuthenticated={!!user}
              isPro={isPro}
            />
          )}

          {/* App Section - Interactive Elements */}
          <div ref={appSectionRef}>
          {/* Mode Toggle */}
          {!shouldShowLanding && !isViewingHistory && !hasContent && !isDebating && !isQuickStreaming && (
            <div className="mt-8">
              <ModeToggle
                mode={appMode}
                onChange={setAppMode}
                isPro={isPro}
                onUpgradeClick={() => user ? (window.location.href = '/pricing') : setShowAuthModal(true)}
                disabled={isDebating || isJudging || isQuickStreaming}
              />
            </div>
          )}

          {/* Arena Selector */}
          {!shouldShowLanding && !isViewingHistory && appMode === 'debate' && (
            <div className="mt-6">
              <ArenaSelector
                selectedArena={selectedArena}
                onSelect={setSelectedArena}
                userTier={usage?.tier || 'guest'}
                onUpgradeRequired={handleUpgradeRequired}
              />
            </div>
          )}

          {/* Stats Bar */}
          {!shouldShowLanding && <StatsBar className="mt-6" />}

          {/* Selected Models Indicator */}
          {!shouldShowLanding && prefsLoaded && selectedModels.length < getModelKeys().length && (
            <div className="mt-4 flex items-center gap-3 text-xs uppercase tracking-wider text-gray-500">
              <span>ACTIVE:</span>
              <div className="flex gap-2">
                {selectedModels.map(key => (
                  <span
                    key={key}
                    className="px-2 py-1 border border-gray-200 text-black"
                  >
                    {MODELS[key].name}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-black hover:underline"
              >
                CHANGE
              </button>
            </div>
          )}

          {/* Mode Selector & Blind Mode */}
          {!shouldShowLanding && !isViewingHistory && (
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <ModeSelector
                currentMode={arenaMode}
                onModeChange={setArenaMode}
                disabled={isDebating || isJudging}
              />
              <button
                onClick={() => setBlindMode(!blindMode)}
                className={`flex items-center gap-2 px-4 py-2 border-2 text-sm uppercase tracking-wider transition-all ${
                  blindMode
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {blindMode ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
                {blindMode ? 'BLIND: ON' : 'BLIND MODE'}
              </button>
            </div>
          )}

          {/* Input Section */}
          {!shouldShowLanding && (
            <DebateInput
              onSubmit={handlePromptSubmit}
              isLoading={isDebating || isJudging || isQuickStreaming}
              onReset={handleReset}
              placeholder={appMode === 'quick' ? 'Ask anything...' : ARENA_MODES[arenaMode].placeholder}
              examples={appMode === 'quick' ? ['Write a Python function to sort a list', 'Explain quantum computing simply', 'Draft an email declining a meeting'] : ARENA_MODES[arenaMode].examples}
              mode={arenaMode}
            />
          )}

          {/* Suggested Prompts */}
          {!shouldShowLanding && !isViewingHistory && !isDebating && !hasContent && !isQuickStreaming && !quickRouting && appMode === 'debate' && (
            <SuggestedPrompts
              arena={selectedArena}
              onSelectPrompt={handleSelectSuggestedPrompt}
            />
          )}

          {/* Quick Response */}
          {appMode === 'quick' && quickRouting && (
            <section className="mt-8 mb-10">
              <QuickResponse
                routing={quickRouting}
                response={quickResponse}
                isStreaming={isQuickStreaming}
                onExpand={handleQuickExpand}
                onTryDifferent={handleQuickTryDifferent}
                onCopy={handleQuickCopy}
              />
            </section>
          )}

          {/* Model Panels Grid */}
          {(isDebating || hasContent) && (
            <section className="mb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 border-2 border-gray-200">
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

          {/* Reactions & Share */}
          {isViewingHistory && loadedDebate && (
            <section className="mb-10">
              <div className="border-2 border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xs uppercase tracking-wider text-gray-500">RATE</span>
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

          {/* Continue Debate */}
          {!isViewingHistory && showContinueInput && isComplete && (
            <section className="mb-10">
              <div className="border-2 border-gray-200 p-6">
                <h3 className="font-display text-xl tracking-wider mb-2">CONTINUE BATTLE</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add follow-up. Models retain context from previous rounds.
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={continuePrompt}
                    onChange={(e) => setContinuePrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleContinueDebate()}
                    placeholder="Enter follow-up..."
                    className="input flex-1"
                  />
                  <button
                    onClick={handleContinueDebate}
                    disabled={!continuePrompt.trim()}
                    className="btn-primary disabled:opacity-30"
                  >
                    CONTINUE
                  </button>
                </div>
                <button
                  onClick={handleReset}
                  className="btn-ghost mt-4"
                >
                  START FRESH
                </button>
              </div>
            </section>
          )}

          {/* Recent Battles */}
          {!shouldShowLanding && (
            <section className="mb-10">
              <RecentBattles />
            </section>
          )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
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
          isAuthenticated={!!user}
          onAuthRequired={() => {
            setShowLimitModal(false);
            setShowAuthModal(true);
          }}
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
      <Leaderboard isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      {quickRouting && (
        <ModelSelectorModal
          isOpen={showModelSelector}
          onClose={() => setShowModelSelector(false)}
          onSelect={handleQuickModelSelect}
          currentModel={quickRouting.model}
        />
      )}
    </div>
  );
}
