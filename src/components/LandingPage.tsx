'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LandingPageProps {
  onStartDebate: () => void;
  onStartQuick: () => void;
  isAuthenticated: boolean;
  isPro: boolean;
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration, start]);

  return { count, ref };
}

// Hero Section
function HeroSection({ onStartDebate, onStartQuick, isPro }: Omit<LandingPageProps, 'isAuthenticated'>) {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b-2 border-gray-200">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white" />

      <div className="relative z-10 container-brutal text-center py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-3 mb-8 px-4 py-2 border border-gray-200">
          <span className="w-2 h-2 bg-black animate-pulse-slow" />
          <span className="text-micro text-gray-500 tracking-ultra">AI ROUTING NOW LIVE</span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-massive text-black mb-6 tracking-tight">
          YOUR AI<br />
          <span className="text-gray-500">COMMAND CENTER</span>
        </h1>

        {/* Subheadline */}
        <p className="font-mono text-body-lg text-gray-500 max-w-[600px] mx-auto mb-12 leading-relaxed">
          One platform. Every AI model. Intelligent routing that learns your preferences.
          <span className="text-black"> Stop switching between ChatGPT, Claude, and Gemini.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onStartDebate}
            className="btn-primary text-lg px-8 py-4 group"
          >
            <span>TRY FREE DEBATE</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {isPro ? (
            <button
              onClick={onStartQuick}
              className="btn-secondary text-lg px-8 py-4"
            >
              QUICK MODE
            </button>
          ) : (
            <Link href="/pricing" className="btn-secondary text-lg px-8 py-4">
              UNLOCK PRO
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-12">
          <StatItem value="4" label="AI MODELS" />
          <StatItem value="50K+" label="DEBATES RUN" />
          <StatItem value="<2s" label="AVG RESPONSE" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-micro text-gray-400 tracking-ultra">SCROLL</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-400 to-transparent" />
      </div>
    </section>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-title text-black">{value}</div>
      <div className="text-micro text-gray-400 tracking-ultra">{label}</div>
    </div>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { num: '01', title: 'ASK ANYTHING', desc: 'Enter your prompt once' },
    { num: '02', title: '4 AIs COMPETE', desc: 'Claude, GPT-4, Gemini, Llama respond' },
    { num: '03', title: 'AI JUDGES', desc: 'Objective evaluation picks the winner' },
  ];

  return (
    <section className="py-24 border-b-2 border-gray-200">
      <div className="container-brutal">
        <div className="text-center mb-16">
          <span className="text-micro text-gray-400 tracking-ultra block mb-4">HOW IT WORKS</span>
          <h2 className="font-display text-hero text-black">THREE STEPS.<br />ONE WINNER.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 max-w-[1000px] mx-auto">
          {steps.map((step, i) => (
            <div key={step.num} className="bg-white p-8 group hover:bg-gray-50 transition-colors">
              <div className="font-display text-massive text-gray-200 group-hover:text-gray-400 transition-colors mb-4">
                {step.num}
              </div>
              <h3 className="font-display text-heading text-black mb-2">{step.title}</h3>
              <p className="font-mono text-small text-gray-500">{step.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-gray-400 text-2xl">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// AI Routing Feature Section (The Star Feature)
function AIRoutingSection({ isPro }: { isPro: boolean }) {
  return (
    <section className="py-24 border-b-2 border-gray-200 bg-gray-50">
      <div className="container-brutal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-black text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-micro tracking-ultra font-semibold">PRO FEATURE</span>
            </div>

            <h2 className="font-display text-hero text-black mb-6">
              INTELLIGENT<br />AI ROUTING
            </h2>

            <p className="font-mono text-body-lg text-gray-500 mb-8 leading-relaxed">
              Stop guessing which AI is best for your task. Our system learns from your debate history
              and <span className="text-black">automatically routes to the model that wins most often for your task type.</span>
            </p>

            <div className="space-y-4 mb-8">
              <FeatureItem text="Learns from every debate you run" />
              <FeatureItem text="Categorizes tasks: writing, code, research, analysis" />
              <FeatureItem text="Shows reasoning: 'You prefer Claude for writing (73% win rate)'" />
              <FeatureItem text="Override anytime - try a different model with one click" />
            </div>

            {!isPro && (
              <Link href="/pricing" className="btn-primary">
                UNLOCK AI ROUTING
              </Link>
            )}
          </div>

          {/* Right - Visual */}
          <div className="relative">
            <div className="border-2 border-black bg-white p-8">
              {/* Mock routing display */}
              <div className="mb-6">
                <span className="text-micro text-gray-400 tracking-ultra block mb-2">DETECTED TASK TYPE</span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">&#9998;</span>
                  <span className="font-display text-heading text-black">WRITING</span>
                </div>
              </div>

              <div className="h-px bg-gray-200 mb-6" />

              <div className="mb-6">
                <span className="text-micro text-gray-400 tracking-ultra block mb-4">ROUTING DECISION</span>
                <div className="flex items-center gap-4 p-4 border border-gray-200 bg-gray-50">
                  <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                    <span className="font-display text-xl">C</span>
                  </div>
                  <div>
                    <div className="font-display text-subhead text-black">CLAUDE</div>
                    <div className="text-small text-gray-500">Sonnet 4 &middot; Anthropic</div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-display text-heading text-black">73%</div>
                    <div className="text-micro text-gray-400 tracking-ultra">WIN RATE</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-100 border border-gray-200">
                <span className="text-small text-gray-500">
                  &#9889; Why Claude? <span className="text-black">You&apos;ve preferred Claude for writing tasks based on 47 previous debates.</span>
                </span>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-black bg-white" />
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-2 border-black bg-white" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 border border-black flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-mono text-body text-gray-500">{text}</span>
    </div>
  );
}

// Platform Section - Why come back
function PlatformSection() {
  const { count: conversationsCount, ref: conversationsRef } = useCounter(12847, 2000);
  const { count: usersCount, ref: usersRef } = useCounter(3420, 2000);

  const features = [
    {
      icon: '&#128194;',
      title: 'CONVERSATION HISTORY',
      desc: 'Every debate saved. Search, revisit, and learn from past comparisons.',
    },
    {
      icon: '&#9889;',
      title: 'PERSONALIZED ROUTING',
      desc: 'AI routing improves with every debate. Your preferences, remembered.',
    },
    {
      icon: '&#128200;',
      title: 'USAGE ANALYTICS',
      desc: 'Track which models win for you. See patterns in your AI usage.',
    },
    {
      icon: '&#128274;',
      title: 'SECURE & PRIVATE',
      desc: 'Your conversations stay yours. No training on your data.',
    },
  ];

  return (
    <section className="py-24 border-b-2 border-gray-200">
      <div className="container-brutal">
        <div className="text-center mb-16">
          <span className="text-micro text-gray-400 tracking-ultra block mb-4">YOUR AI WORKSPACE</span>
          <h2 className="font-display text-hero text-black mb-6">
            NOT A TOOL.<br />A PLATFORM.
          </h2>
          <p className="font-mono text-body-lg text-gray-500 max-w-[600px] mx-auto">
            PromptPit remembers your preferences, stores your conversations, and gets smarter with every use.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-16 mb-16">
          <div ref={conversationsRef} className="text-center">
            <div className="font-display text-title text-black">{conversationsCount.toLocaleString()}</div>
            <div className="text-micro text-gray-400 tracking-ultra">CONVERSATIONS STORED</div>
          </div>
          <div ref={usersRef} className="text-center">
            <div className="font-display text-title text-black">{usersCount.toLocaleString()}</div>
            <div className="text-micro text-gray-400 tracking-ultra">ACTIVE USERS</div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 max-w-[900px] mx-auto">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-8 hover:bg-gray-50 transition-colors group">
              <div className="text-3xl mb-4" dangerouslySetInnerHTML={{ __html: feature.icon }} />
              <h3 className="font-display text-heading text-black mb-2 group-hover:text-gray-600 transition-colors">
                {feature.title}
              </h3>
              <p className="font-mono text-small text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Models Section
function ModelsSection() {
  const models = [
    { name: 'CLAUDE', version: 'Sonnet 4', company: 'Anthropic', strength: 'Nuanced writing & reasoning' },
    { name: 'GPT-4o', version: '', company: 'OpenAI', strength: 'Versatile & reliable' },
    { name: 'GEMINI', version: '2.0 Flash', company: 'Google', strength: 'Fast & accurate research' },
    { name: 'LLAMA', version: '3.3 70B', company: 'Meta', strength: 'Open-source power' },
  ];

  return (
    <section className="py-24 border-b-2 border-gray-200 bg-gray-50">
      <div className="container-brutal">
        <div className="text-center mb-16">
          <span className="text-micro text-gray-400 tracking-ultra block mb-4">THE COMPETITORS</span>
          <h2 className="font-display text-hero text-black">FOUR GIANTS.<br />HEAD TO HEAD.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 max-w-[1200px] mx-auto">
          {models.map((model) => (
            <div key={model.name} className="bg-white p-6 text-center group hover:bg-gray-100 transition-colors">
              <div className="w-16 h-16 border-2 border-gray-200 group-hover:border-black mx-auto mb-4 flex items-center justify-center transition-colors">
                <span className="font-display text-section text-black">{model.name[0]}</span>
              </div>
              <h3 className="font-display text-heading text-black mb-1">{model.name}</h3>
              {model.version && (
                <div className="text-small text-gray-500 mb-1">{model.version}</div>
              )}
              <div className="text-micro text-gray-400 tracking-ultra mb-3">{model.company}</div>
              <div className="text-small text-gray-500">{model.strength}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing CTA Section
function PricingSection({ isAuthenticated, isPro }: { isAuthenticated: boolean; isPro: boolean }) {
  return (
    <section className="py-24 border-b-2 border-gray-200">
      <div className="container-brutal">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
          {/* Free Tier */}
          <div className="border-2 border-gray-200 p-8 hover:border-gray-400 transition-colors">
            <div className="mb-6">
              <span className="text-micro text-gray-400 tracking-ultra">FREE TIER</span>
              <div className="font-display text-title text-black mt-2">$0</div>
              <div className="text-small text-gray-500">Forever free</div>
            </div>

            <div className="h-px bg-gray-200 mb-6" />

            <ul className="space-y-3 mb-8">
              <PricingItem included text="6 debates per month" />
              <PricingItem included text="All 4 AI models" />
              <PricingItem included text="AI judge verdicts" />
              <PricingItem included text="Debate history (30 days)" />
              <PricingItem text="AI routing (Quick Mode)" />
              <PricingItem text="Unlimited debates" />
              <PricingItem text="Priority response times" />
            </ul>

            {!isAuthenticated && (
              <Link href="/pricing" className="btn-secondary w-full justify-center">
                GET STARTED FREE
              </Link>
            )}
          </div>

          {/* Pro Tier */}
          <div className="border-2 border-black p-8 relative bg-gray-50">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-black text-white text-micro tracking-ultra">
              RECOMMENDED
            </div>

            <div className="mb-6">
              <span className="text-micro text-gray-400 tracking-ultra">PRO TIER</span>
              <div className="font-display text-title text-black mt-2">$12<span className="text-heading text-gray-500">/mo</span></div>
              <div className="text-small text-gray-500">Billed monthly</div>
            </div>

            <div className="h-px bg-gray-200 mb-6" />

            <ul className="space-y-3 mb-8">
              <PricingItem included text="Unlimited debates" highlight />
              <PricingItem included text="AI routing (Quick Mode)" highlight />
              <PricingItem included text="All 4 AI models" />
              <PricingItem included text="AI judge verdicts" />
              <PricingItem included text="Unlimited history" />
              <PricingItem included text="Priority response times" />
              <PricingItem included text="Usage analytics" />
            </ul>

            {!isPro && (
              <Link href="/pricing" className="btn-primary w-full justify-center">
                UPGRADE TO PRO
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingItem({ text, included = false, highlight = false }: { text: string; included?: boolean; highlight?: boolean }) {
  return (
    <li className={`flex items-center gap-3 ${highlight ? 'text-black' : included ? 'text-gray-500' : 'text-gray-400'}`}>
      {included ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span className="font-mono text-small">{text}</span>
    </li>
  );
}

// Final CTA Section
function FinalCTASection({ onStartDebate }: { onStartDebate: () => void }) {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-brutal text-center">
        <h2 className="font-display text-hero text-black mb-6">
          READY TO FIND<br />YOUR BEST AI?
        </h2>
        <p className="font-mono text-body-lg text-gray-500 max-w-[500px] mx-auto mb-8">
          Run your first debate free. See which AI wins for your specific use case.
        </p>
        <button onClick={onStartDebate} className="btn-primary text-lg px-12 py-4">
          START FREE DEBATE
        </button>
      </div>
    </section>
  );
}

// Main Landing Page Component
export default function LandingPage({
  onStartDebate,
  onStartQuick,
  isAuthenticated,
  isPro,
}: LandingPageProps) {
  return (
    <div className="bg-white">
      <HeroSection
        onStartDebate={onStartDebate}
        onStartQuick={onStartQuick}
        isPro={isPro}
      />
      <HowItWorksSection />
      <AIRoutingSection isPro={isPro} />
      <PlatformSection />
      <ModelsSection />
      <PricingSection isAuthenticated={isAuthenticated} isPro={isPro} />
      <FinalCTASection onStartDebate={onStartDebate} />
    </div>
  );
}
