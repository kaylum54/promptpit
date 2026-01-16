'use client';

export function ProFeaturesSection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `radial-gradient(circle at center, #00000005 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium tracking-wide mb-6">
            <span>PRO</span>
          </div>

          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6">
            Ship with Confidence
          </h2>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            Pro unlocks the tools that separate shipped products from abandoned side projects.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">

          {/* Security Guidance */}
          <div className="
            group
            bg-white
            rounded-2xl p-8
            border border-gray-200
            shadow-sm
            hover:shadow-xl hover:shadow-gray-200/50
            hover:border-gray-300
            hover:-translate-y-1
            transition-all duration-300
          ">
            {/* Icon - monochrome */}
            <div className="
              w-12 h-12 rounded-xl
              bg-gray-100
              flex items-center justify-center
              mb-6
              group-hover:bg-gray-900 group-hover:text-white
              transition-all duration-300
            ">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Security Guidance
            </h3>

            <p className="text-gray-500 mb-6 leading-relaxed">
              Phase-by-phase security checklists as you build. Don't ship vulnerabilities.
            </p>

            {/* Checklist */}
            <div className="space-y-3">
              {[
                { title: 'Auth setup', desc: 'Session handling, token refresh' },
                { title: 'API routes', desc: 'Input validation, rate limiting' },
                { title: 'Database', desc: 'RLS policies, encryption' },
                { title: 'Payments', desc: 'Webhook verification' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Dashboard Blueprint */}
          <div className="
            group
            bg-white
            rounded-2xl p-8
            border border-gray-200
            shadow-sm
            hover:shadow-xl hover:shadow-gray-200/50
            hover:border-gray-300
            hover:-translate-y-1
            transition-all duration-300
          ">
            {/* Icon - monochrome */}
            <div className="
              w-12 h-12 rounded-xl
              bg-gray-100
              flex items-center justify-center
              mb-6
              group-hover:bg-gray-900 group-hover:text-white
              transition-all duration-300
            ">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Admin Dashboard Blueprint
            </h3>

            <p className="text-gray-500 mb-6 leading-relaxed">
              Every SaaS needs an admin panel. We spec it for you — users, billing, moderation.
            </p>

            {/* Module Grid - monochrome */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: 'users', label: 'Users' },
                { icon: 'chart', label: 'Analytics' },
                { icon: 'card', label: 'Billing' },
                { icon: 'shield', label: 'Moderation' },
                { icon: 'chat', label: 'Support' },
                { icon: 'cog', label: 'Settings' },
              ].map((module) => (
                <div
                  key={module.label}
                  className="
                    flex flex-col items-center gap-1.5
                    p-3 rounded-lg
                    bg-gray-50
                    group-hover:bg-gray-100
                    transition-colors
                  "
                >
                  <AdminIcon name={module.icon} />
                  <span className="text-[10px] text-gray-500 font-medium">{module.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Debug Prompts */}
          <div className="
            group
            bg-white
            rounded-2xl p-8
            border border-gray-200
            shadow-sm
            hover:shadow-xl hover:shadow-gray-200/50
            hover:border-gray-300
            hover:-translate-y-1
            transition-all duration-300
          ">
            {/* Icon - monochrome */}
            <div className="
              w-12 h-12 rounded-xl
              bg-gray-100
              flex items-center justify-center
              mb-6
              group-hover:bg-gray-900 group-hover:text-white
              transition-all duration-300
            ">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Debug Prompts
            </h3>

            <p className="text-gray-500 mb-6 leading-relaxed">
              Stuck during the build? Get AI debugging prompts tailored to YOUR project context.
            </p>

            {/* Code Preview */}
            <div className="
              bg-gray-900 rounded-lg p-4
              font-mono text-xs
              text-gray-300
            ">
              <div className="text-gray-500 mb-2">// Auto-filled with your PRD context</div>
              <div className="text-gray-100">
                "I'm implementing auth from my PRD.
              </div>
              <div className="text-gray-100">
                Stack: Next.js + Supabase.
              </div>
              <div className="text-gray-400">
                Error: <span className="text-gray-500">[paste here]</span>"
              </div>
            </div>
          </div>

        </div>

        {/* Additional Pro Features - Cleaner List */}
        <div className="border-t border-gray-200 pt-12">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">
              Also included with Pro
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {[
              'Unlimited PRDs',
              'Version History',
              'Iteration Support',
              'Collaboration',
              'PDF Export',
              'Notion Export',
              'Priority Support',
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2 text-gray-600"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// Monochrome admin icons component
function AdminIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    users: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    chart: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    card: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    shield: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    chat: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    cog: (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return icons[name] || null;
}
