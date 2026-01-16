'use client';

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#FAFAFA]">
      {/* Subtle dot pattern background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle, #00000008 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-300" />
            <span className="font-mono text-sm uppercase tracking-[0.2em] text-gray-400">
              Everything Included
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-300" />
          </div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
            Everything you need to ship
          </h2>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Stop building half-baked products. Get the complete blueprint before you write a line of code.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

          {/* === FEATURED: Complete PRD (Dark, Large) === */}
          <div className="
            lg:col-span-2 lg:row-span-2
            group relative
            bg-black
            rounded-3xl p-6 md:p-8
            overflow-hidden
            transition-all duration-300
            hover:shadow-2xl hover:shadow-gray-900/20
            hover:-translate-y-1
          ">
            {/* Subtle grid pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-[80px] opacity-50" />

            <div className="relative">
              {/* Icon */}
              <div className="
                w-14 h-14 rounded-2xl
                bg-white/10 border border-white/20
                flex items-center justify-center
                mb-6
                group-hover:scale-110
                transition-transform duration-300
              ">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-white mb-3">
                Complete PRD
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Features, user stories, acceptance criteria — everything documented and organized. No more scattered notes or forgotten requirements.
              </p>

              {/* Mini preview */}
              <div className="
                bg-white/5 backdrop-blur rounded-xl p-4
                border border-white/10
                font-mono text-xs
              ">
                <div className="text-white mb-2">## Features (MVP)</div>
                <div className="text-gray-500">### User Authentication</div>
                <div className="text-gray-300">- Email/password signup</div>
                <div className="text-gray-300">- OAuth (Google, GitHub)</div>
                <div className="text-gray-300">- Password reset flow</div>
                <div className="text-gray-500 mt-2">### Dashboard</div>
                <div className="text-gray-300">- Overview metrics</div>
                <div className="text-gray-600">...</div>
              </div>
            </div>
          </div>

          {/* === AI Debates (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1m0-5V6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9l-4 4V8z" />
              </svg>
            }
            title="AI Debates"
            description="4 AI models debate key decisions. See different perspectives, you decide."
            color="amber"
            preview={
              <div className="flex gap-1.5 mt-4">
                {[
                  { model: 'Claude', pick: 'Supabase' },
                  { model: 'GPT-4', pick: 'Neon' },
                  { model: 'Gemini', pick: 'Supabase' },
                  { model: 'Llama', pick: 'Neon' },
                ].map((m) => (
                  <div key={m.model} className="flex-1 bg-gray-100 rounded-lg p-2 text-center">
                    <div className="text-[9px] text-gray-400 font-medium">{m.model}</div>
                    <div className="text-[10px] text-gray-700 font-semibold">{m.pick}</div>
                  </div>
                ))}
              </div>
            }
          />

          {/* === Database Schema (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            }
            title="Database Schema"
            description="Production-ready SQL. Tables, relationships, indexes — ready to run."
            color="green"
            preview={
              <div className="mt-4 bg-gray-100 rounded-lg p-3 font-mono text-[10px] text-gray-600">
                <span className="text-green-600">CREATE TABLE</span> users (<br/>
                <span className="text-gray-400 ml-2">id</span> UUID PRIMARY KEY,<br/>
                <span className="text-gray-400 ml-2">email</span> TEXT UNIQUE<br/>
                );
              </div>
            }
          />

          {/* === Security Blueprint (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            title="Security Blueprint"
            description="Auth, validation, rate limiting, headers. Security covered from day one."
            color="red"
          />

          {/* === Admin Dashboard (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            title="Admin Dashboard"
            description="Standard features every SaaS needs. Users, billing, moderation — all planned."
            color="purple"
          />

          {/* === FEATURED: Claude Code Prompt (Dark, Wide) === */}
          <div className="
            lg:col-span-2
            group relative
            bg-black
            rounded-3xl p-6 md:p-8
            overflow-hidden
            transition-all duration-300
            hover:shadow-2xl hover:shadow-gray-900/20
            hover:-translate-y-1
          ">
            {/* Glow */}
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FFB800]/10 rounded-full filter blur-[60px] opacity-50" />

            <div className="relative flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <div className="
                  w-14 h-14 rounded-2xl
                  bg-[#FFB800]/20 border border-[#FFB800]/30
                  flex items-center justify-center
                  mb-4
                  group-hover:scale-110
                  transition-transform duration-300
                ">
                  <svg className="w-7 h-7 text-[#FFB800]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>

                <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
                  Claude Code Prompt
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  One-shot buildable spec. Paste into Claude Code, watch your entire app get built.
                </p>
              </div>

              {/* Code preview */}
              <div className="
                flex-1 w-full md:w-auto
                bg-white/5 backdrop-blur rounded-xl p-4
                border border-white/10
                font-mono text-[11px]
              ">
                <div className="text-gray-500"># DevHabits</div>
                <div className="text-[#FFB800] mt-2">## Tech Stack</div>
                <div className="text-gray-300">Next.js 14, Supabase, Tailwind</div>
                <div className="text-[#FFB800] mt-2">## Build Order</div>
                <div className="text-gray-300">1. Project setup</div>
                <div className="text-gray-300">2. Database schema</div>
                <div className="text-gray-300">3. Auth flow</div>
                <div className="text-gray-500">...</div>
              </div>
            </div>
          </div>

          {/* === Deployment Plan (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            title="Deployment Plan"
            description="Environments, CI/CD, monitoring. Production-ready from day one."
            color="blue"
          />

          {/* === Final Review (Light) === */}
          <LightFeatureCard
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            title="Final Review"
            description="GPT-4o + Gemini review for blind spots before you build."
            color="violet"
            preview={
              <div className="mt-4 space-y-1.5">
                {[
                  { status: 'green', text: 'Schema validated' },
                  { status: 'green', text: 'Security checked' },
                  { status: 'amber', text: '1 suggestion' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'green' ? 'bg-green-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-gray-500">{item.text}</span>
                  </div>
                ))}
              </div>
            }
          />

        </div>
      </div>
    </section>
  );
}

// Light-themed feature card component
interface LightFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'cyan' | 'amber' | 'green' | 'red' | 'purple' | 'blue' | 'violet';
  preview?: React.ReactNode;
}

function LightFeatureCard({ icon, title, description, color, preview }: LightFeatureCardProps) {
  const colorClasses = {
    cyan: {
      iconBg: 'bg-cyan-100',
      iconBorder: 'border-cyan-200',
      iconText: 'text-cyan-600',
      hoverBorder: 'hover:border-cyan-300',
      shadow: 'hover:shadow-cyan-100',
    },
    amber: {
      iconBg: 'bg-amber-100',
      iconBorder: 'border-amber-200',
      iconText: 'text-amber-600',
      hoverBorder: 'hover:border-amber-300',
      shadow: 'hover:shadow-amber-100',
    },
    green: {
      iconBg: 'bg-green-100',
      iconBorder: 'border-green-200',
      iconText: 'text-green-600',
      hoverBorder: 'hover:border-green-300',
      shadow: 'hover:shadow-green-100',
    },
    red: {
      iconBg: 'bg-red-100',
      iconBorder: 'border-red-200',
      iconText: 'text-red-600',
      hoverBorder: 'hover:border-red-300',
      shadow: 'hover:shadow-red-100',
    },
    purple: {
      iconBg: 'bg-purple-100',
      iconBorder: 'border-purple-200',
      iconText: 'text-purple-600',
      hoverBorder: 'hover:border-purple-300',
      shadow: 'hover:shadow-purple-100',
    },
    blue: {
      iconBg: 'bg-blue-100',
      iconBorder: 'border-blue-200',
      iconText: 'text-blue-600',
      hoverBorder: 'hover:border-blue-300',
      shadow: 'hover:shadow-blue-100',
    },
    violet: {
      iconBg: 'bg-violet-100',
      iconBorder: 'border-violet-200',
      iconText: 'text-violet-600',
      hoverBorder: 'hover:border-violet-300',
      shadow: 'hover:shadow-violet-100',
    },
  };

  const c = colorClasses[color];

  return (
    <div className={`
      group relative
      bg-white
      rounded-2xl p-5 md:p-6
      border border-gray-200
      ${c.hoverBorder}
      shadow-sm hover:shadow-xl ${c.shadow}
      transition-all duration-300
      hover:-translate-y-1
    `}>
      {/* Icon */}
      <div className={`
        w-12 h-12 rounded-xl
        ${c.iconBg} border ${c.iconBorder} ${c.iconText}
        flex items-center justify-center
        mb-4
        group-hover:scale-110
        transition-transform duration-300
      `}>
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 leading-relaxed">
        {description}
      </p>

      {preview}
    </div>
  );
}
