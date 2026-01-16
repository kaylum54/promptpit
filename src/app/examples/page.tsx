'use client';

import { useState } from 'react';
import { Navigation } from '@/components/marketing/Navigation';
import { Footer } from '@/components/marketing/Footer';

const examples = [
  {
    id: 'devhabits',
    category: 'SaaS',
    title: 'DevHabits',
    tagline: 'Habit tracker for developers',
    idea: 'I want to build a habit tracker that connects to GitHub and helps developers build coding consistency.',
    techStack: ['Next.js 14', 'Supabase', 'GitHub API', 'Tailwind CSS'],
    features: [
      'GitHub OAuth integration',
      'Daily coding streak tracking',
      'Contribution heatmaps',
      'Weekly email summaries',
      'Team leaderboards',
    ],
    schema: ['users', 'habits', 'streaks', 'github_connections', 'notifications'],
    timeEstimate: '3-4 weeks',
    complexity: 'Medium',
    prdLines: 2847,
  },
  {
    id: 'artisan-market',
    category: 'Marketplace',
    title: 'Artisan Market',
    tagline: 'Handmade goods marketplace',
    idea: 'A marketplace where artisans can sell handmade goods directly to customers, with built-in shipping and reviews.',
    techStack: ['Next.js 14', 'PostgreSQL', 'Stripe Connect', 'Cloudinary', 'Resend'],
    features: [
      'Seller storefronts',
      'Product listings with variants',
      'Secure checkout with Stripe',
      'Order tracking & shipping',
      'Reviews & ratings',
      'Seller analytics dashboard',
    ],
    schema: ['users', 'shops', 'products', 'orders', 'reviews', 'payouts'],
    timeEstimate: '6-8 weeks',
    complexity: 'High',
    prdLines: 4521,
  },
  {
    id: 'focusflow',
    category: 'Productivity',
    title: 'FocusFlow',
    tagline: 'Deep work timer with analytics',
    idea: 'A Pomodoro-style focus timer that tracks productivity patterns and helps you optimize your work sessions.',
    techStack: ['Next.js 14', 'Supabase', 'Chart.js', 'PWA'],
    features: [
      'Customizable focus timers',
      'Session history & streaks',
      'Productivity analytics',
      'Browser notifications',
      'Offline support (PWA)',
      'Spotify integration',
    ],
    schema: ['users', 'sessions', 'projects', 'settings', 'integrations'],
    timeEstimate: '2-3 weeks',
    complexity: 'Low',
    prdLines: 1923,
  },
  {
    id: 'teamsynq',
    category: 'B2B SaaS',
    title: 'TeamSynq',
    tagline: 'Async standup tool for remote teams',
    idea: 'An async standup tool where remote team members post daily updates, blockers, and wins without scheduling meetings.',
    techStack: ['Next.js 14', 'Supabase', 'Slack API', 'Resend', 'OpenAI'],
    features: [
      'Daily standup prompts',
      'Slack bot integration',
      'Team digest emails',
      'AI-powered summaries',
      'Mood tracking',
      'Manager dashboards',
    ],
    schema: ['organizations', 'teams', 'users', 'standups', 'summaries', 'integrations'],
    timeEstimate: '4-5 weeks',
    complexity: 'Medium',
    prdLines: 3156,
  },
  {
    id: 'petpal',
    category: 'Mobile App',
    title: 'PetPal',
    tagline: 'Pet care & vet appointment app',
    idea: 'A mobile app for pet owners to track vaccinations, schedule vet appointments, and get pet care reminders.',
    techStack: ['React Native', 'Supabase', 'Expo', 'Push Notifications'],
    features: [
      'Pet profiles with health records',
      'Vaccination tracking',
      'Vet appointment booking',
      'Medication reminders',
      'Pet food tracking',
      'Nearby vet finder',
    ],
    schema: ['users', 'pets', 'vaccinations', 'appointments', 'medications', 'vets'],
    timeEstimate: '5-6 weeks',
    complexity: 'Medium',
    prdLines: 2734,
  },
  {
    id: 'courseforge',
    category: 'EdTech',
    title: 'CourseForge',
    tagline: 'Course creation platform for creators',
    idea: 'A platform where creators can build and sell online courses with videos, quizzes, and certificates.',
    techStack: ['Next.js 14', 'PostgreSQL', 'Mux Video', 'Stripe', 'Resend'],
    features: [
      'Drag-and-drop course builder',
      'Video hosting & streaming',
      'Quiz & assessment tools',
      'Student progress tracking',
      'Certificate generation',
      'Creator analytics & payouts',
    ],
    schema: ['creators', 'courses', 'lessons', 'enrollments', 'progress', 'certificates', 'payouts'],
    timeEstimate: '8-10 weeks',
    complexity: 'High',
    prdLines: 5892,
  },
];

const categories = ['All', 'SaaS', 'Marketplace', 'Productivity', 'B2B SaaS', 'Mobile App', 'EdTech'];

export default function ExamplesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  const filteredExamples = activeCategory === 'All'
    ? examples
    : examples.filter(e => e.category === activeCategory);

  return (
    <main className="bg-white min-h-screen">
      <Navigation />

      {/* Spacer for fixed nav */}
      <div className="h-20" />

      {/* Hero */}
      <section className="py-16 md:py-24 text-center px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium tracking-wide mb-6">
          <span>EXAMPLES</span>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-gray-900 mb-6 max-w-4xl mx-auto">
          See what you can build with PromptPit
        </h1>

        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-8">
          Explore real product specs generated from simple ideas. Each example includes features, database schema, tech stack, and a Claude Code prompt ready to build.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-12 pt-8 border-t border-gray-200 max-w-xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-serif text-gray-900">2,400+</div>
            <div className="text-sm text-gray-500">PRDs Generated</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-gray-900">500+</div>
            <div className="text-sm text-gray-500">Products Shipped</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-serif text-gray-900">12</div>
            <div className="text-sm text-gray-500">Categories</div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeCategory === category
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Grid */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {filteredExamples.map((example) => (
              <div
                key={example.id}
                className={`
                  group relative
                  bg-white rounded-2xl
                  border border-gray-200
                  overflow-hidden
                  transition-all duration-300
                  hover:shadow-xl hover:shadow-gray-200/50
                  hover:border-gray-300
                  ${expandedExample === example.id ? 'md:col-span-2' : ''}
                `}
              >
                {/* Header */}
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-3">
                        {example.category}
                      </span>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {example.title}
                      </h3>
                      <p className="text-gray-500">{example.tagline}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">PRD Lines</div>
                      <div className="text-lg font-semibold text-gray-900">{example.prdLines.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Original Idea */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Original Idea</div>
                    <p className="text-gray-700 italic">&quot;{example.idea}&quot;</p>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Complexity</div>
                      <div className={`
                        inline-block px-2 py-0.5 rounded text-xs font-medium
                        ${example.complexity === 'Low' ? 'bg-green-100 text-green-700' :
                          example.complexity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'}
                      `}>
                        {example.complexity}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Est. Build Time</div>
                      <div className="text-sm text-gray-900 font-medium">{example.timeEstimate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-medium">Tables</div>
                      <div className="text-sm text-gray-900 font-medium">{example.schema.length}</div>
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div className="mb-6">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Tech Stack</div>
                    <div className="flex flex-wrap gap-2">
                      {example.techStack.map((tech) => (
                        <span key={tech} className="px-2.5 py-1 bg-gray-900 text-white text-xs rounded-md font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Features Preview */}
                  <div className="mb-6">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">Key Features</div>
                    <div className="grid grid-cols-2 gap-2">
                      {example.features.slice(0, expandedExample === example.id ? undefined : 4).map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedExample === example.id && (
                    <div className="border-t border-gray-200 pt-6 mt-6">
                      {/* Database Schema */}
                      <div className="mb-6">
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Database Schema</div>
                        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                          {example.schema.map((table, i) => (
                            <div key={table} className="text-gray-300">
                              <span className="text-gray-500">{i + 1}.</span>{' '}
                              <span className="text-white">{table}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sample PRD Output */}
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Sample PRD Output</div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 font-mono text-xs text-gray-600 space-y-1">
                          <div className="text-gray-900 font-semibold">## {example.title} - Product Requirements</div>
                          <div className="text-gray-500">### Overview</div>
                          <div>{example.tagline} built with {example.techStack[0]}...</div>
                          <div className="text-gray-500 mt-2">### Features (MVP)</div>
                          {example.features.slice(0, 3).map((f) => (
                            <div key={f}>- {f}</div>
                          ))}
                          <div className="text-gray-400">...</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
                    <button
                      onClick={() => setExpandedExample(expandedExample === example.id ? null : example.id)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
                    >
                      {expandedExample === example.id ? 'Show Less' : 'View Full Spec'}
                    </button>
                    <a
                      href="/dashboard/prd/new"
                      className="flex-1 py-3 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors text-center"
                    >
                      Build Something Like This
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Mini Section */}
      <section className="py-16 md:py-24 px-6 bg-gray-50 border-y border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-6">
            From idea to spec in minutes
          </h2>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Each example above started as a single sentence. PromptPit transforms your idea through 6 phases of AI-powered refinement.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Describe',
                desc: 'Tell us your idea in plain English. No forms, no templates.',
              },
              {
                step: '02',
                title: 'Refine',
                desc: 'AI models debate decisions, refine features, plan architecture.',
              },
              {
                step: '03',
                title: 'Build',
                desc: 'Get a complete PRD + Claude Code prompt. Start building.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-4 font-mono text-sm text-gray-500">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 text-center px-6">
        <h2 className="font-serif text-3xl md:text-4xl text-gray-900 mb-4">
          Ready to build your product?
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Start with your first PRD for free. No credit card required.
        </p>
        <a
          href="/dashboard/prd/new"
          className="inline-block bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg"
        >
          Start Building Free
        </a>
      </section>

      <Footer />
    </main>
  );
}
