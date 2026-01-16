'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { PRD, PRDMessage, PRDDebate, PRDMode } from '@/lib/types';

interface Phase {
  id: number;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  tips: string[];
  whatWeDefine: string[];
}

const phases: Phase[] = [
  {
    id: 1,
    name: 'Idea Refinement',
    shortName: 'Idea',
    description: 'Define the problem and solution',
    icon: '💡',
    color: '#8B5CF6',
    tips: [
      'Be specific about who has this problem',
      'Describe the pain point, not just the solution',
      'Think about why existing solutions fall short',
    ],
    whatWeDefine: [
      'Problem statement',
      'Target audience',
      'Core value proposition',
      'Success metrics',
    ],
  },
  {
    id: 2,
    name: 'Feature Definition',
    shortName: 'Features',
    description: 'Scope your MVP features',
    icon: '📝',
    color: '#3B82F6',
    tips: [
      'Focus on must-haves for launch',
      'Be ruthless about cutting nice-to-haves',
      'Think about the core user journey first',
    ],
    whatWeDefine: [
      'MVP feature list',
      'User stories',
      'Feature prioritization',
      'Out of scope items',
    ],
  },
  {
    id: 3,
    name: 'Architecture',
    shortName: 'Tech',
    description: 'Choose your tech stack',
    icon: '🏗️',
    color: '#F59E0B',
    tips: [
      "Consider your team's expertise",
      'Balance speed vs scalability',
      'Watch the AI debate different options',
    ],
    whatWeDefine: [
      'Frontend framework',
      'Backend/API',
      'Database choice',
      'Third-party services',
    ],
  },
  {
    id: 4,
    name: 'Production',
    shortName: 'Security',
    description: 'Security & error handling',
    icon: '🔒',
    color: '#EF4444',
    tips: [
      'Security is not optional',
      'Plan for errors from day one',
      'Think about data privacy requirements',
    ],
    whatWeDefine: [
      'Auth strategy',
      'API security',
      'Error handling',
      'Logging & monitoring',
    ],
  },
  {
    id: 5,
    name: 'Cost Planning',
    shortName: 'Costs',
    description: 'Budget and service costs',
    icon: '💰',
    color: '#22C55E',
    tips: [
      'Start with free tiers where possible',
      "Plan for scale but don't over-engineer",
      'Factor in development time costs',
    ],
    whatWeDefine: [
      'Service costs',
      'Infrastructure budget',
      'Scaling triggers',
      'Cost optimization',
    ],
  },
  {
    id: 6,
    name: 'Output',
    shortName: 'Export',
    description: 'Generate your PRD',
    icon: '🚀',
    color: '#06B6D4',
    tips: [
      'Review the full PRD before exporting',
      'The Claude Code prompt is ready to use',
      'You can iterate and regenerate anytime',
    ],
    whatWeDefine: [
      'Complete PRD document',
      'Claude Code prompt',
      'Database schema',
      'API specifications',
    ],
  },
];

interface PRDBuilderProps {
  prd: PRD;
  initialMessages: PRDMessage[];
  initialDebates: PRDDebate[];
  onSendMessage: (content: string) => Promise<void>;
  onPhaseAction: (action: 'next' | 'back') => Promise<void>;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

export function PRDBuilder({
  prd,
  initialMessages,
  initialDebates,
  onSendMessage,
  onPhaseAction,
  isStreaming,
  streamingContent,
  error,
}: PRDBuilderProps) {
  const [messages, setMessages] = useState<PRDMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [currentPhase, setCurrentPhase] = useState(prd.current_phase);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const mode = prd.mode as PRDMode;
  const totalPhases = mode === 'quick' ? 4 : 6;

  // Map quick mode phase 4 to output phase
  const displayPhaseIndex = mode === 'quick' && currentPhase === 4 ? 5 : currentPhase - 1;
  const phase = phases[displayPhaseIndex] || phases[0];

  // Update messages when initialMessages changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Update phase when prd changes
  useEffect(() => {
    setCurrentPhase(prd.current_phase);
  }, [prd.current_phase]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const content = input.trim();
    setInput('');
    await onSendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get relevant debates for current phase
  const phaseDebates = initialDebates.filter(d => d.phase === currentPhase);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Subtle noise texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header - Enhanced with blur and gradient line */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex-shrink-0 relative">
        {/* Subtle gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent" />

        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Project Name */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/prd"
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 rounded-lg transition-all duration-200 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{prd.title || 'Untitled PRD'}</h1>
                <p className="text-sm text-gray-500">
                  {mode === 'quick' ? 'Quick PRD' : 'Full Build Plan'}
                  {prd.template_id && ` · ${prd.template_id}`}
                </p>
              </div>
            </div>

            {/* Center: Phase Progress - Enhanced with pill container */}
            <div className="flex items-center gap-1 p-2 bg-gray-50/80 rounded-2xl border border-gray-100">
              {Array.from({ length: totalPhases }, (_, i) => {
                const phaseNum = i + 1;
                const isActive = currentPhase === phaseNum;
                const isComplete = currentPhase > phaseNum;

                return (
                  <div key={phaseNum} className="flex items-center">
                    <button
                      onClick={() => isComplete && setCurrentPhase(phaseNum)}
                      disabled={!isComplete && !isActive}
                      className={`
                        relative w-9 h-9 rounded-full
                        flex items-center justify-center
                        font-medium text-sm
                        transition-all duration-300
                        ${isActive
                          ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-400/40 scale-110'
                          : isComplete
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer hover:scale-105'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                      `}
                      title={phases[i]?.name}
                    >
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        phaseNum
                      )}
                    </button>
                    {i < totalPhases - 1 && (
                      <div className={`
                        w-6 h-0.5 mx-0.5 rounded-full
                        transition-colors duration-300
                        ${currentPhase > phaseNum ? 'bg-gray-400' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-lg transition-all duration-200 active:scale-95">
                Save Draft
              </button>
              {currentPhase === totalPhases && (
                <Link
                  href={`/dashboard/prd/${prd.id}/output`}
                  className="px-4 py-2 text-sm font-medium bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  Export PRD
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Phase Info - Enhanced */}
        <aside className="w-72 bg-gradient-to-b from-white to-gray-50/50 border-r border-gray-200/60 flex-shrink-0 overflow-y-auto relative">
          {/* Subtle side highlight */}
          <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-white via-gray-200/50 to-white" />

          <div className="p-6">
            {/* Current Phase - Enhanced Card */}
            <div className="mb-8 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-sm shadow-gray-200/30">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm shadow-gray-100">
                <span className="text-2xl">{phase.icon}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phase {currentPhase}
                </span>
                <span className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {phase.name}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                {phase.description}
              </p>
            </div>

            {/* What We're Defining - Enhanced */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-gray-600 to-gray-400" />
                What we&apos;re defining
              </h3>
              <ul className="space-y-2.5">
                {phase.whatWeDefine.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm text-gray-600 p-2 rounded-lg hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tips - Enhanced Cards */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-500 to-amber-300" />
                Tips for this phase
              </h3>
              <div className="space-y-3">
                {phase.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm text-gray-600 bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-200/60 rounded-xl p-3.5 hover:border-amber-300/60 transition-all duration-200"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Navigation - Enhanced */}
            <div className="pt-6 border-t border-gray-200/60">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-gradient-to-b from-gray-400 to-gray-300" />
                All Phases
              </h3>
              <nav className="space-y-1.5">
                {phases.slice(0, totalPhases).map((p, i) => {
                  const phaseNum = i + 1;
                  const isActive = currentPhase === phaseNum;
                  const isComplete = currentPhase > phaseNum;
                  const isLocked = currentPhase < phaseNum;

                  return (
                    <button
                      key={p.id}
                      onClick={() => !isLocked && setCurrentPhase(phaseNum)}
                      disabled={isLocked}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-left text-sm
                        transition-all duration-200
                        ${isActive
                          ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 font-medium border border-gray-200/60 shadow-sm'
                          : isComplete
                            ? 'text-gray-600 hover:bg-gray-50/80 hover:translate-x-0.5'
                            : 'text-gray-400 cursor-not-allowed opacity-60'
                        }
                      `}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="flex-1">{p.shortName}</span>
                      {isComplete && (
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {isLocked && (
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Phase Actions - Enhanced */}
            <div className="pt-6 mt-6 border-t border-gray-200/60 flex gap-2">
              {currentPhase > 1 && (
                <button
                  onClick={() => onPhaseAction('back')}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
                >
                  Back
                </button>
              )}
              {currentPhase < totalPhases && (
                <button
                  onClick={() => onPhaseAction('next')}
                  className="flex-1 px-3 py-2.5 text-sm font-medium bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* Chat Area - Enhanced */}
        <main className="flex-1 flex flex-col bg-white relative overflow-hidden">
          {/* Subtle background gradient */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-radial from-gray-100/40 via-transparent to-transparent pointer-events-none blur-3xl" />

          {/* Subtle corner accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50/30 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-gray-50/50 to-transparent pointer-events-none" />

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto py-8 px-6">
              {/* Welcome Message (if no messages) */}
              {messages.filter(m => m.role !== 'system').length === 0 && (
                <WelcomeMessage phase={phase} projectName={prd.title || 'your project'} />
              )}

              {/* Messages */}
              <div className="space-y-6">
                {messages.filter(m => m.role !== 'system').map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLatest={index === messages.filter(m => m.role !== 'system').length - 1}
                  />
                ))}

                {/* Debates */}
                {phaseDebates.map((debate) => (
                  <DebateMessage key={debate.id} debate={debate} />
                ))}

                {/* Streaming content */}
                {streamingContent && (
                  <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 shadow-sm shadow-gray-100">
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <div className="max-w-[80%] bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl rounded-tl-md px-5 py-4 border border-gray-100 shadow-sm">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-900">
                        {streamingContent}
                        <span className="animate-pulse ml-0.5">▊</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator - Enhanced */}
                {isStreaming && !streamingContent && (
                  <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 shadow-sm shadow-gray-100">
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
                    </div>
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl rounded-tl-md px-5 py-4 border border-gray-100">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm shadow-sm">
                    {error}
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - Enhanced */}
          <div className="relative flex-shrink-0 border-t border-gray-200/60 bg-gradient-to-t from-gray-50/80 to-white">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300/30 to-transparent" />

            <div className="max-w-3xl mx-auto p-4">
              {/* Suggested Responses - Enhanced */}
              {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
                <SuggestedResponses
                  phaseId={currentPhase}
                  onSelect={(response) => {
                    setInput(response);
                    inputRef.current?.focus();
                  }}
                />
              )}

              {/* Input - Enhanced */}
              <div className="flex items-end gap-3">
                <div className="flex-1 relative bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:shadow-lg focus-within:shadow-gray-200/50 focus-within:border-gray-300 transition-all duration-300">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your response..."
                    rows={1}
                    disabled={isStreaming}
                    className="w-full px-5 py-4 pr-16 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none resize-none rounded-2xl disabled:opacity-50"
                    style={{ minHeight: '56px', maxHeight: '150px' }}
                  />
                  <div className="absolute right-4 bottom-4 flex items-center gap-2 text-xs text-gray-400">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-mono">↵</kbd>
                    <span>to send</span>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="p-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg shadow-gray-400/30 hover:shadow-xl hover:shadow-gray-400/40 transition-all duration-300 active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Welcome Message Component - Enhanced
function WelcomeMessage({ phase, projectName }: { phase: Phase; projectName: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-50 shadow-sm shadow-gray-100">
        <span className="text-3xl">{phase.icon}</span>
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Let&apos;s build {projectName}
      </h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        We&apos;ll start by {phase.description.toLowerCase()}. I&apos;ll ask you some questions to understand your vision.
      </p>

      {/* Initial prompt from AI will appear here */}
      <div className="inline-flex items-center gap-2 text-sm text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        AI is preparing your first question...
      </div>
    </div>
  );
}

// Message Bubble Component - Enhanced
function MessageBubble({ message, isLatest }: { message: PRDMessage; isLatest: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`
        flex items-start gap-4
        ${isUser ? 'flex-row-reverse' : ''}
        ${isLatest ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}
      `}
    >
      {/* Avatar - Enhanced */}
      <div className={`
        w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-gray-300'
          : 'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 shadow-gray-100'
        }
      `}>
        {isUser ? (
          <span className="text-xs font-semibold">You</span>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        )}
      </div>

      {/* Message - Enhanced */}
      <div className={`
        max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm
        ${isUser
          ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-tr-md shadow-gray-300'
          : 'bg-gradient-to-br from-gray-50 to-gray-100/80 text-gray-900 rounded-tl-md border border-gray-100 shadow-gray-200/50'
        }
      `}>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
}

// Debate Message Component - Enhanced
function DebateMessage({ debate }: { debate: PRDDebate }) {
  return (
    <div className="flex items-start gap-4">
      {/* AI Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center flex-shrink-0 shadow-sm shadow-gray-100">
        <span className="text-sm">🏟️</span>
      </div>

      {/* Debate Card - Enhanced */}
      <div className="flex-1 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-300">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Model Debate
            </div>
            <h4 className="text-gray-900 font-semibold">{debate.decision_label}</h4>
          </div>

          {/* Model Opinions */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {debate.responses.map((response) => {
              const isWinner = debate.verdict?.winner === response.recommendation;
              return (
                <div
                  key={response.model}
                  className={`
                    p-4 rounded-xl border transition-all duration-200
                    ${isWinner
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50/50 border-green-200 shadow-sm'
                      : 'bg-gradient-to-br from-gray-50 to-white border-gray-100 hover:border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">{response.model}</span>
                    {isWinner && (
                      <span className="px-1.5 py-0.5 bg-green-500 text-white text-[10px] font-semibold rounded">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">{response.recommendation}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">&quot;{response.reasoning}&quot;</p>
                </div>
              );
            })}
          </div>

          {/* Verdict - Enhanced */}
          {debate.verdict && (
            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏆</span>
                <div>
                  <div className="text-xs text-gray-500">Verdict</div>
                  <div className="font-semibold text-gray-900">
                    {debate.verdict.winner}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gradient-to-br from-gray-800 to-gray-900 text-white text-sm font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95">
                  Use {debate.verdict.winner}
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95">
                  Let me decide
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Suggested Responses Component - Enhanced
function SuggestedResponses({ phaseId, onSelect }: { phaseId: number; onSelect: (response: string) => void }) {
  const suggestions = getSuggestionsForPhase(phaseId);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, i) => (
        <button
          key={i}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 bg-white hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 rounded-full border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 active:scale-95"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}

function getSuggestionsForPhase(phaseId: number): string[] {
  const suggestions: Record<number, string[]> = {
    1: [
      'Solo developers building side projects',
      'Small teams of 2-5 people',
      'Let me explain the problem in detail...',
    ],
    2: [
      'Focus on the core feature first',
      'I want to include all of these',
      'Can you help me prioritize?',
    ],
    3: [
      "I'm comfortable with this stack",
      'Tell me more about the alternatives',
      'I prefer the simplest option',
    ],
    4: [
      'Standard security is fine',
      'I need enterprise-grade security',
      "What's the minimum I should do?",
    ],
    5: [
      'I want to start free',
      'Budget is around $50/month',
      'Show me the cost breakdown',
    ],
    6: [
      'Generate the final PRD',
      'I want to review everything first',
      'Export to Claude Code',
    ],
  };

  return suggestions[phaseId] || [];
}
