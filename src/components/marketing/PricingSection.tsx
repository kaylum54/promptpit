import Link from 'next/link';

export function PricingSection() {
  return (
    <section className="py-24 md:py-32 bg-gray-50" id="pricing">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400 mb-4">
            Pricing
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-black mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-gray-500">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Free tier */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="mb-8">
              <h3 className="text-xl text-black font-medium mb-2">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl text-black">$0</span>
                <span className="text-gray-500">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                { included: true, text: '1 Full PRD per month' },
                { included: true, text: 'All 6 phases' },
                { included: true, text: 'AI debates on decisions' },
                { included: true, text: 'Final review by GPT-4o & Gemini' },
                { included: true, text: 'Claude Code prompt' },
                { included: true, text: 'Markdown export' },
                { included: false, text: 'Security guidance' },
                { included: false, text: 'Admin dashboard blueprint' },
                { included: false, text: 'Debug prompts' },
                { included: false, text: 'Iteration & versioning' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {item.included ? (
                    <svg className="w-5 h-5 text-black flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={item.included ? 'text-gray-700' : 'text-gray-400'}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?mode=signup"
              className="block w-full text-center bg-gray-100 text-black px-6 py-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro tier */}
          <div className="relative bg-black rounded-2xl p-8">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-white text-black text-xs font-medium">
              Most Popular
            </div>

            <div className="mb-8">
              <h3 className="text-xl text-white font-medium mb-2">Pro</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-5xl text-white">$20</span>
                <span className="text-gray-400">/month</span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Unlimited PRDs + Pro tools
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {[
                { text: 'Unlimited PRDs', highlight: true },
                { text: 'All 6 phases' },
                { text: 'AI debates on decisions' },
                { text: 'Final review by GPT-4o & Gemini' },
                { text: 'Claude Code prompt' },
                { text: 'All export formats' },
                { text: 'Security guidance', highlight: true },
                { text: 'Admin dashboard blueprint', highlight: true },
                { text: 'Debug prompts', highlight: true },
                { text: 'Iteration & versioning' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className={item.highlight ? 'text-white font-medium' : 'text-gray-300'}>
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/login?mode=signup&plan=pro"
              className="block w-full text-center bg-white text-black px-6 py-4 rounded-xl font-medium hover:bg-gray-100 transition-colors"
            >
              Get Pro
            </Link>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <blockquote className="text-lg text-gray-600 italic mb-3">
            "I built 3 SaaS products this month using PromptPit. The security checklist alone saved me from shipping auth bugs. Worth every penny."
          </blockquote>
          <cite className="text-sm text-gray-400 not-italic">— @indie_hacker_dan</cite>
        </div>
      </div>
    </section>
  );
}
