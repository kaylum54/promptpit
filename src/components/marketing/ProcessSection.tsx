'use client';

import { useState } from 'react';

export function ProcessSection() {
  const [activePhase, setActivePhase] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);

  const phases = [
    {
      num: 1,
      name: 'Idea',
      description: 'Refine your concept',
    },
    {
      num: 2,
      name: 'Features',
      description: 'Define MVP scope',
    },
    {
      num: 3,
      name: 'Architecture',
      description: 'Tech stack & database',
    },
    {
      num: 4,
      name: 'Production',
      description: 'Security & scaling',
    },
    {
      num: 5,
      name: 'Costs',
      description: 'Budget planning',
    },
    {
      num: 6,
      name: 'Output',
      description: 'PRD & prompts',
    },
  ];

  const handlePhaseClick = (num: number) => {
    if (num === activePhase) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActivePhase(num);
      setIsAnimating(false);
    }, 150);
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-black">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full filter blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="font-mono text-sm uppercase tracking-[0.2em] text-gray-400">
              The Journey
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-white/30 to-transparent max-w-[200px]" />
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-white">
            The 6-Phase Process
          </h2>
        </div>

        {/* Phase Selector */}
        <div className="mb-12">
          {/* Progress bar background */}
          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/10" />
            <div
              className="absolute top-6 left-0 h-0.5 bg-white transition-all duration-500"
              style={{ width: `${((activePhase - 1) / (phases.length - 1)) * 100}%` }}
            />

            {/* Phase circles */}
            <div className="relative flex items-start justify-between">
              {phases.map((phase) => {
                const isActive = activePhase === phase.num;
                const isCompleted = activePhase > phase.num;

                return (
                  <button
                    key={phase.num}
                    onClick={() => handlePhaseClick(phase.num)}
                    className="group flex flex-col items-center gap-3 focus:outline-none"
                  >
                    {/* Circle */}
                    <div className={`
                      relative w-12 h-12 rounded-full
                      flex items-center justify-center
                      font-semibold text-sm
                      transition-all duration-300
                      ${isActive
                        ? 'bg-white text-black scale-110 shadow-lg shadow-white/30'
                        : isCompleted
                          ? 'bg-white/20 text-white border-2 border-white/50'
                          : 'bg-white/5 text-gray-500 border border-white/10 group-hover:border-white/30'
                      }
                    `}>
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        phase.num
                      )}

                      {/* Glow ring for active */}
                      {isActive && (
                        <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="text-center">
                      <div className={`
                        text-sm font-medium transition-colors
                        ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-400'}
                      `}>
                        {phase.name}
                      </div>
                      <div className={`
                        text-xs mt-0.5 transition-colors hidden md:block
                        ${isActive ? 'text-gray-400' : 'text-gray-600'}
                      `}>
                        {phase.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Card */}
        <div className={`
          relative
          bg-[#111111] backdrop-blur-sm
          rounded-3xl
          border border-white/10
          overflow-hidden
          transition-all duration-300
          ${isAnimating ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'}
        `}>
          {/* Top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          {/* Content */}
          <div className="p-6 md:p-8">
            <PhasePreview phase={activePhase} />
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Click each phase to see what happens at every step of the journey.
        </p>
      </div>
    </section>
  );
}

// Phase-specific preview content
function PhasePreview({ phase }: { phase: number }) {
  switch (phase) {
    case 1:
      return <IdeaPreview />;
    case 2:
      return <FeaturesPreview />;
    case 3:
      return <ArchitecturePreview />;
    case 4:
      return <ProductionPreview />;
    case 5:
      return <CostsPreview />;
    case 6:
      return <OutputPreview />;
    default:
      return null;
  }
}

// Phase 1: Idea
function IdeaPreview() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-purple-400 uppercase tracking-wider mb-1">
            Idea Refinement
          </div>
          <div className="text-white font-medium">
            Let's shape your concept into something buildable
          </div>
        </div>
      </div>

      <div className="bg-black rounded-xl p-5 border border-white/5">
        <div className="space-y-4">
          {/* AI Question */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex-1">
              <p className="text-sm text-gray-300">
                What problem are you solving? Who experiences this problem most acutely?
              </p>
            </div>
          </div>

          {/* User Response */}
          <div className="flex gap-3 justify-end">
            <div className="bg-white/10 border border-white/20 rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-100">
                Developers lose track of their coding habits. I want to help them build consistency by connecting to GitHub...
              </p>
            </div>
          </div>

          {/* AI Follow-up */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 text-sm">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="bg-white/5 rounded-2xl rounded-tl-md px-4 py-3 flex-1">
              <p className="text-sm text-gray-300">
                Interesting! So it's a <span className="text-white font-medium">habit tracker</span> with <span className="text-white font-medium">GitHub integration</span>. Is this for solo developers or teams?
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          AI asks clarifying questions to understand your vision
        </div>
      </div>
    </div>
  );
}

// Phase 2: Features
function FeaturesPreview() {
  const features = [
    { name: 'GitHub OAuth', priority: 'must', status: 'defined' },
    { name: 'Habit Dashboard', priority: 'must', status: 'defined' },
    { name: 'Streak Tracking', priority: 'must', status: 'defined' },
    { name: 'Email Reminders', priority: 'should', status: 'defined' },
    { name: 'Team Leaderboards', priority: 'could', status: 'v2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-blue-400 uppercase tracking-wider mb-1">
            Feature Definition
          </div>
          <div className="text-white font-medium">
            Prioritizing your MVP feature set
          </div>
        </div>
      </div>

      <div className="bg-black rounded-xl p-5 border border-white/5">
        <div className="space-y-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3">
                <div className={`
                  w-2 h-2 rounded-full
                  ${feature.priority === 'must' ? 'bg-green-500' :
                    feature.priority === 'should' ? 'bg-amber-500' : 'bg-gray-500'}
                `} />
                <span className="text-sm text-gray-300">{feature.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`
                  text-xs px-2 py-0.5 rounded
                  ${feature.priority === 'must' ? 'bg-green-500/20 text-green-400' :
                    feature.priority === 'should' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'}
                `}>
                  {feature.priority}
                </span>
                {feature.status === 'v2' && (
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                    v2
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Must have
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Should have
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          Could have
        </div>
      </div>
    </div>
  );
}

// Phase 3: Architecture (Model Debate)
function ArchitecturePreview() {
  const models = [
    {
      name: 'Claude',
      color: 'amber',
      pick: 'Supabase',
      reason: 'Built-in auth + real-time. One less integration.',
      isWinner: true,
    },
    {
      name: 'GPT-4o',
      color: 'green',
      pick: 'Neon + Prisma',
      reason: 'Type-safe queries, better schema migrations.',
      isWinner: false,
    },
    {
      name: 'Gemini',
      color: 'blue',
      pick: 'Supabase',
      reason: 'Best free tier, fastest to production.',
      isWinner: true,
    },
    {
      name: 'Llama',
      color: 'purple',
      pick: 'Neon',
      reason: 'Serverless scaling, pay for what you use.',
      isWinner: false,
    },
  ];

  const colorClasses: Record<string, { dot: string; border: string; bg: string }> = {
    amber: { dot: 'bg-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/5' },
    green: { dot: 'bg-green-500', border: 'border-green-500/30', bg: 'bg-green-500/5' },
    blue: { dot: 'bg-blue-500', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
    purple: { dot: 'bg-purple-500', border: 'border-purple-500/30', bg: 'bg-purple-500/5' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1m0-5V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 4V8z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-amber-400 uppercase tracking-wider mb-1">
            Model Debate
          </div>
          <div className="text-white font-medium">
            Which database for this project?
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {models.map((model) => {
          const c = colorClasses[model.color];
          return (
            <div
              key={model.name}
              className={`
                relative p-4 rounded-xl
                border transition-all duration-300
                ${model.isWinner
                  ? `${c.bg} ${c.border} shadow-lg`
                  : 'bg-white/[0.02] border-white/5 opacity-60'
                }
              `}
            >
              {/* Winner badge */}
              {model.isWinner && (
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
                  <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Model name */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-xs text-gray-400">{model.name}</span>
              </div>

              {/* Pick */}
              <div className="text-white font-semibold mb-2">
                {model.pick}
              </div>

              {/* Reason */}
              <p className="text-xs text-gray-500 leading-relaxed">
                "{model.reason}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Verdict Bar */}
      <div className="
        flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
        bg-gradient-to-r from-[#FFB800]/10 to-white/5
        rounded-xl p-4
        border border-[#FFB800]/30
      ">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-xs text-gray-400">Verdict</div>
            <div className="text-white font-semibold">Supabase (3-1)</div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="
            flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium
            bg-[#FFB800] text-black
            hover:bg-[#FFCC00] transition-colors
          ">
            Use Supabase
          </button>
          <button className="
            flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium
            bg-white/5 text-white border border-white/10
            hover:bg-white/10 transition-colors
          ">
            Let me decide
          </button>
        </div>
      </div>

      {/* Caption */}
      <p className="text-center text-sm text-gray-500">
        Different AI models have different opinions. See them debate. You decide.
      </p>
    </div>
  );
}

// Phase 4: Production
function ProductionPreview() {
  const checks = [
    { category: 'Authentication', items: ['JWT tokens', 'Refresh strategy', 'OAuth scopes'], status: 'complete' },
    { category: 'Security', items: ['Input validation', 'Rate limiting', 'CORS config'], status: 'complete' },
    { category: 'Error Handling', items: ['Error format', 'User messages', 'Logging'], status: 'in-progress' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-red-400 uppercase tracking-wider mb-1">
            Production Readiness
          </div>
          <div className="text-white font-medium">
            Security, error handling, and scaling considerations
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {checks.map((check) => (
          <div
            key={check.category}
            className="bg-black rounded-xl p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">{check.category}</span>
              {check.status === 'complete' ? (
                <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                </span>
              )}
            </div>
            <ul className="space-y-1.5">
              {check.items.map((item) => (
                <li key={item} className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Phase 5: Costs
function CostsPreview() {
  const services = [
    { name: 'Vercel', tier: 'Pro', cost: '$20', purpose: 'Hosting' },
    { name: 'Supabase', tier: 'Free', cost: '$0', purpose: 'Database + Auth' },
    { name: 'Resend', tier: 'Free', cost: '$0', purpose: 'Emails' },
    { name: 'Sentry', tier: 'Free', cost: '$0', purpose: 'Error tracking' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-green-400 uppercase tracking-wider mb-1">
            Cost Estimation
          </div>
          <div className="text-white font-medium">
            Monthly subscription costs for your stack
          </div>
        </div>
      </div>

      <div className="bg-black rounded-xl p-5 border border-white/5">
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-white font-medium">{service.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">
                  {service.tier}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-white font-medium">{service.cost}/mo</div>
                <div className="text-xs text-gray-500">{service.purpose}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-gray-400">Total monthly</span>
          <span className="text-xl font-bold text-green-400">$20/mo</span>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        <span className="text-amber-400">Tip:</span> Start with free tiers. Upgrade when you hit limits.
      </p>
    </div>
  );
}

// Phase 6: Output
function OutputPreview() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="font-mono text-xs text-gray-400 uppercase tracking-wider mb-1">
            Output Generation
          </div>
          <div className="text-white font-medium">
            Your complete PRD and Claude Code prompt
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* PRD Preview */}
        <div className="bg-black rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-white">Full PRD</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 ml-auto">
              2,847 lines
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 space-y-1">
            <div>## Overview</div>
            <div>## Features (MVP)</div>
            <div>## Technical Architecture</div>
            <div>## Database Schema</div>
            <div>## API Endpoints</div>
            <div>## Security</div>
            <div className="text-gray-600">...</div>
          </div>
        </div>

        {/* Claude Code Prompt Preview */}
        <div className="bg-black rounded-xl p-4 border border-[#FFB800]/30">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-sm font-medium text-white">Claude Code Prompt</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 ml-auto">
              Ready to build
            </span>
          </div>
          <div className="font-mono text-xs text-gray-500 space-y-1">
            <div className="text-amber-400"># DevHabits - Build Instructions</div>
            <div>## Tech Stack: Next.js, Supabase</div>
            <div>## Build Order</div>
            <div>1. Project setup</div>
            <div>2. Database schema</div>
            <div className="text-gray-600">...</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button className="
          flex-1 py-3 rounded-xl font-semibold text-sm
          bg-[#FFB800] text-black
          hover:bg-[#FFCC00] transition-colors
          shadow-lg shadow-amber-500/20
        ">
          Copy to Claude Code →
        </button>
        <button className="
          px-6 py-3 rounded-xl font-semibold text-sm
          bg-white/5 text-white border border-white/10
          hover:bg-white/10 transition-colors
        ">
          Export
        </button>
      </div>
    </div>
  );
}
