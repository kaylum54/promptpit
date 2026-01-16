import { Navigation } from '@/components/marketing/Navigation';
import { PricingSection } from '@/components/marketing/PricingSection';
import { Footer } from '@/components/marketing/Footer';

export const metadata = {
  title: 'Pricing — PromptPit',
  description: 'Simple pricing for PromptPit. Start free, upgrade when you need more.',
};

export default function PricingPage() {
  return (
    <main className="bg-white min-h-screen">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-20" />

      {/* Hero */}
      <section className="py-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-black mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto px-6">
          Start building for free. Upgrade when you need unlimited PRDs and Pro features.
        </p>
      </section>

      <PricingSection />

      {/* FAQ Section */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <h2 className="font-serif text-3xl text-black text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          {[
            {
              q: 'What counts as a PRD?',
              a: 'Each new project you start in PromptPit counts as one PRD. You can iterate and refine a PRD as many times as you want without it counting against your limit.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes! You can cancel your Pro subscription at any time. You\'ll keep access until the end of your billing period.',
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards through Stripe. We also support annual billing for a 28% discount.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes, we offer a 14-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
            },
            {
              q: 'What\'s included in the Free tier?',
              a: 'Free users get 1 full PRD per month with all 6 phases, AI debates, final review, and Claude Code prompt export.',
            },
            {
              q: 'What extra features do Pro users get?',
              a: 'Pro unlocks unlimited PRDs, security guidance checklists, admin dashboard blueprints, debug prompts, version history, collaboration, and all export formats.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-black font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center border-t border-gray-200">
        <h2 className="font-serif text-3xl text-black mb-4">
          Ready to build your next product?
        </h2>
        <p className="text-gray-600 mb-8">
          Start with your first PRD for free. No credit card required.
        </p>
        <a
          href="/dashboard/prd/new"
          className="inline-block bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-900 transition-colors shadow-lg "
        >
          Start Building Free
        </a>
      </section>

      <Footer />
    </main>
  );
}
