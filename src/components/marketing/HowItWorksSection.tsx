'use client';

import { useState, useEffect, useCallback } from 'react';

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const steps = [
    {
      number: '01',
      title: 'Describe Your Idea',
      description: 'Tell us your idea in plain English. No templates, no forms — just describe what you want to build and let AI understand your vision.',
      fullText: 'I want to build a marketplace for indie game developers to sell their games directly to players, with built-in community features and revenue analytics...',
    },
    {
      number: '02',
      title: 'AI Refines & Debates',
      description: 'Multiple AI models analyze your idea, debate key decisions, and refine every aspect — from features to architecture to security.',
    },
    {
      number: '03',
      title: 'Build with Claude Code',
      description: 'Get a production-ready PRD and one-shot Claude Code prompt. Paste it in, watch your entire app architecture come to life.',
    },
  ];

  // Auto-rotation with progress
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((s) => (s + 1) % steps.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, steps.length]);

  // Typing animation for step 1
  useEffect(() => {
    if (activeStep !== 0) {
      setTypedText('');
      return;
    }

    const text = steps[0].fullText || '';
    let index = 0;
    setTypedText('');

    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setTypedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [activeStep]);

  const handleStepClick = useCallback((index: number) => {
    setActiveStep(index);
    setProgress(0);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 8000);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const codeSnippet = `# PromptPit Generated Spec
## Project: Indie Game Marketplace

### Tech Stack
- Next.js 14 + TypeScript
- Supabase (Auth + Database)
- Stripe Connect (Payments)
- Tailwind CSS

### Core Features
1. Developer storefronts
2. Game upload & versioning
3. Community forums
4. Revenue dashboard
5. Player reviews & ratings

### Database Schema
→ users, games, purchases, reviews...`;

  return (
    <section className="py-24 md:py-32 bg-black relative overflow-hidden" id="features">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a0a] to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,184,0,0.05),transparent_50%)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-gray-400 mb-4">
            How It Works
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
            From idea to production spec
            <br />
            <span className="text-gray-400">in three steps</span>
          </h2>
        </div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Step selector */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => handleStepClick(index)}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-500 group relative overflow-hidden ${
                  activeStep === index
                    ? 'bg-white/[0.08] border-white/30 shadow-lg shadow-white/5'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                {/* Progress bar */}
                {activeStep === index && (
                  <div className="absolute bottom-0 left-0 h-0.5 bg-white transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Step number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-white text-black'
                      : 'bg-white/[0.05] text-gray-500 group-hover:bg-white/[0.08]'
                  }`}>
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium mb-2 transition-colors ${
                      activeStep === index ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm leading-relaxed transition-colors ${
                      activeStep === index ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className={`flex-shrink-0 transition-all duration-300 ${
                    activeStep === index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Live preview */}
          <div className="relative">
            {/* Browser window frame */}
            <div className="bg-[#111111] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
              {/* Browser header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0a0a0a] border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                  <div className="w-3 h-3 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-black rounded-lg px-4 py-1.5 text-xs text-gray-500 font-mono">
                    promptpit.app
                  </div>
                </div>
              </div>

              {/* Preview content */}
              <div className="p-6 min-h-[400px] relative">
                {/* Step 1: Typing animation */}
                <div className={`absolute inset-6 transition-all duration-500 ${
                  activeStep === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                  <div className="bg-black rounded-xl p-6 h-full border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs text-gray-500 font-mono">Describe your idea</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed font-mono text-sm">
                      {typedText}
                      <span className="inline-block w-0.5 h-4 bg-white animate-pulse ml-0.5" />
                    </p>
                  </div>
                </div>

                {/* Step 2: AI Chat & Debate */}
                <div className={`absolute inset-6 transition-all duration-500 ${
                  activeStep === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                  <div className="space-y-4 h-full">
                    {/* AI Message 1 */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-black">
                        C
                      </div>
                      <div className="flex-1 bg-black rounded-xl p-4 border border-white/[0.06]">
                        <p className="text-sm text-gray-300">For the payment system, I recommend Stripe Connect for marketplace payouts. It handles split payments and tax compliance automatically.</p>
                      </div>
                    </div>

                    {/* AI Message 2 - Debate */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                        G
                      </div>
                      <div className="flex-1 bg-black rounded-xl p-4 border border-white/[0.06]">
                        <p className="text-sm text-gray-300">Consider LemonSqueezy as an alternative — lower fees for digital products and built-in EU tax handling.</p>
                      </div>
                    </div>

                    {/* Debate indicator */}
                    <div className="flex items-center justify-center gap-2 py-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      <span className="text-xs text-gray-400 font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        AI Debate in Progress
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    </div>

                    {/* Resolution */}
                    <div className="bg-[#FFB800]/5 rounded-xl p-4 border border-[#FFB800]/20">
                      <p className="text-xs text-[#FFB800] font-medium mb-2">Consensus Reached</p>
                      <p className="text-sm text-gray-300">Stripe Connect for primary payments with LemonSqueezy integration for EU markets.</p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Code Output */}
                <div className={`absolute inset-6 transition-all duration-500 ${
                  activeStep === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                  <div className="bg-black rounded-xl border border-white/[0.06] h-full flex flex-col">
                    {/* Code header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span className="text-xs text-gray-500 font-mono">claude-code-prompt.md</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] transition-colors text-xs text-gray-400 hover:text-white"
                      >
                        {copied ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Code content */}
                    <div className="flex-1 p-4 overflow-auto">
                      <pre className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">
                        {codeSnippet}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 bg-[#FFB800] rounded-xl px-4 py-2 shadow-lg shadow-amber-500/25">
              <p className="text-xs font-medium text-black">Ready for Claude Code</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
