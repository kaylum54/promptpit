'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function HeroSection() {
  const [idea, setIdea] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (idea.trim()) {
      sessionStorage.setItem('initial_idea', idea);
    }
    router.push('/dashboard/prd/new');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#000 1px, transparent 1px),
            linear-gradient(90deg, #000 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
        {/* Overline */}
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-6 animate-fade-in">
          The AI Product Architect
        </p>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-black leading-[1.1] mb-6 animate-fade-in-up tracking-tight">
          Turn your idea into a{' '}
          <span className="relative inline-block">
            <span className="relative z-10 italic">complete</span>
            <span className="absolute bottom-2 left-0 right-0 h-3 bg-gray-200/70 -z-10" />
          </span>
          {' '}product spec
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up delay-100">
          Features, database schema, security checklist, admin panel, deployment guide — everything you need to start building, in one conversation.
        </p>

        {/* Input Box */}
        <div className="relative max-w-2xl mx-auto animate-fade-in-up delay-200">
          <div className="relative bg-white rounded-2xl p-2 border border-gray-200 shadow-xl focus-within:border-gray-300 focus-within:shadow-2xl transition-all duration-300">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your product idea... (e.g., A platform for freelancers to track time and send invoices)"
              rows={3}
              className="w-full bg-transparent text-gray-900 placeholder-gray-400 px-4 py-3 resize-none focus:outline-none text-base leading-relaxed"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-xs text-gray-400 font-mono">
                {idea.length > 0 ? `${idea.length} characters` : 'Press Enter or click to start'}
              </span>
              <button
                onClick={handleStart}
                className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 text-sm"
              >
                Start Building
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-sm text-gray-400 animate-fade-in-up delay-300">
          Free to try • No credit card required
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-10 md:gap-14 mt-20 animate-fade-in-up delay-400">
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl text-black">2,400+</div>
            <div className="text-sm text-gray-500 mt-1">PRDs Created</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl text-black">500+</div>
            <div className="text-sm text-gray-500 mt-1">Products Shipped</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="font-display text-3xl md:text-4xl text-black">4.9</div>
            <div className="text-sm text-gray-500 mt-1">User Rating</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
