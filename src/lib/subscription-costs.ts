// lib/subscription-costs.ts
// Subscription Cost Database - Pricing information for common services

export interface ServiceTier {
  name: string;
  monthly: number | 'custom' | 'usage';
  annual?: number;
  limits: string;
  features?: string[];
}

export interface Service {
  name: string;
  category: 'hosting' | 'database' | 'auth' | 'payments' | 'email' | 'monitoring' | 'analytics' | 'ai' | 'search' | 'storage' | 'infrastructure' | 'other';
  description: string;
  tiers: ServiceTier[];
  pricing_url: string;
  when_to_use: string;
  when_to_upgrade: string;
}

export const subscriptionCosts: Record<string, Service> = {
  // === HOSTING ===
  vercel: {
    name: 'Vercel',
    category: 'hosting',
    description: 'Serverless hosting platform, excellent for Next.js',
    tiers: [
      { name: 'Hobby', monthly: 0, limits: '100GB bandwidth, 100 hrs compute, 1 concurrent build' },
      { name: 'Pro', monthly: 20, limits: '1TB bandwidth, 1000 hrs compute, 3 concurrent builds' },
      { name: 'Enterprise', monthly: 'custom', limits: 'Custom limits, SLA, support' },
    ],
    pricing_url: 'https://vercel.com/pricing',
    when_to_use: 'Default choice for Next.js apps, great free tier for MVPs',
    when_to_upgrade: 'When you hit bandwidth limits or need team features',
  },
  railway: {
    name: 'Railway',
    category: 'hosting',
    description: 'Container hosting with databases, good for full-stack apps',
    tiers: [
      { name: 'Starter', monthly: 0, limits: '$5 free credits, 500 hrs/month' },
      { name: 'Pro', monthly: 5, limits: '$5 included + usage-based, 24/7 uptime' },
      { name: 'Team', monthly: 20, limits: 'Per seat + usage, team features' },
    ],
    pricing_url: 'https://railway.app/pricing',
    when_to_use: 'When you need containers, Python backends, or managed databases',
    when_to_upgrade: 'When free credits run out or need team collaboration',
  },
  flyio: {
    name: 'Fly.io',
    category: 'hosting',
    description: 'Global container hosting, great for low-latency apps',
    tiers: [
      { name: 'Free', monthly: 0, limits: '3 shared VMs, 160GB bandwidth' },
      { name: 'Pay as you go', monthly: 'usage', limits: '$0.0071/hr for shared VM' },
    ],
    pricing_url: 'https://fly.io/docs/about/pricing/',
    when_to_use: 'When you need global distribution or persistent containers',
    when_to_upgrade: 'Free tier is quite generous, upgrade when you need more VMs',
  },

  // === DATABASE ===
  supabase: {
    name: 'Supabase',
    category: 'database',
    description: 'PostgreSQL with auth, real-time, and storage built-in',
    tiers: [
      { name: 'Free', monthly: 0, limits: '500MB database, 1GB storage, 50K MAU auth, 2 projects' },
      { name: 'Pro', monthly: 25, limits: '8GB database, 100GB storage, 100K MAU auth, unlimited projects' },
      { name: 'Team', monthly: 599, limits: 'SOC2, priority support, daily backups' },
    ],
    pricing_url: 'https://supabase.com/pricing',
    when_to_use: 'When you want database + auth + real-time in one platform',
    when_to_upgrade: 'When you hit 500MB database or need daily backups',
  },
  neon: {
    name: 'Neon',
    category: 'database',
    description: 'Serverless PostgreSQL with branching',
    tiers: [
      { name: 'Free', monthly: 0, limits: '0.5GB storage, 1 project, 100 hrs compute' },
      { name: 'Launch', monthly: 19, limits: '10GB storage, 100 projects, 300 hrs compute' },
      { name: 'Scale', monthly: 69, limits: '50GB storage, unlimited projects, 750 hrs compute' },
    ],
    pricing_url: 'https://neon.tech/pricing',
    when_to_use: 'When you want serverless Postgres with database branching',
    when_to_upgrade: 'When you need more storage or multiple projects',
  },
  planetscale: {
    name: 'PlanetScale',
    category: 'database',
    description: 'Serverless MySQL with branching and deploy requests',
    tiers: [
      { name: 'Hobby', monthly: 0, limits: '5GB storage, 1B row reads, 10M row writes' },
      { name: 'Scaler', monthly: 29, limits: '10GB storage, unlimited reads, 50M row writes' },
      { name: 'Scaler Pro', monthly: 59, limits: '100GB storage, production-ready' },
    ],
    pricing_url: 'https://planetscale.com/pricing',
    when_to_use: 'When you prefer MySQL or need database branching workflow',
    when_to_upgrade: 'When you hit storage limits or need production features',
  },
  upstash: {
    name: 'Upstash',
    category: 'infrastructure',
    description: 'Serverless Redis and Kafka',
    tiers: [
      { name: 'Free', monthly: 0, limits: '10K commands/day, 256MB storage' },
      { name: 'Pay as you go', monthly: 'usage', limits: '$0.2 per 100K commands' },
      { name: 'Pro', monthly: 10, limits: '10K commands/day included, 1GB storage' },
    ],
    pricing_url: 'https://upstash.com/pricing',
    when_to_use: 'Rate limiting, caching, sessions, queues',
    when_to_upgrade: 'When you exceed 10K commands/day',
  },

  // === AUTH ===
  clerk: {
    name: 'Clerk',
    category: 'auth',
    description: 'Drop-in auth with UI components',
    tiers: [
      { name: 'Free', monthly: 0, limits: '10K MAU, 5 social connections' },
      { name: 'Pro', monthly: 25, limits: '10K MAU included, $0.02 per additional MAU' },
      { name: 'Enterprise', monthly: 'custom', limits: 'Custom, SLA, dedicated support' },
    ],
    pricing_url: 'https://clerk.com/pricing',
    when_to_use: 'When you want auth done fast with great UI components',
    when_to_upgrade: 'When you exceed 10K MAU or need custom domains',
  },
  auth0: {
    name: 'Auth0',
    category: 'auth',
    description: 'Enterprise-grade auth platform',
    tiers: [
      { name: 'Free', monthly: 0, limits: '7.5K MAU, 2 social connections' },
      { name: 'Essential', monthly: 23, limits: '1K MAU included, custom domains' },
      { name: 'Professional', monthly: 240, limits: '1K MAU included, advanced features' },
    ],
    pricing_url: 'https://auth0.com/pricing',
    when_to_use: 'Enterprise requirements, complex auth flows, B2B',
    when_to_upgrade: 'When you need SSO, MFA, or enterprise features',
  },

  // === PAYMENTS ===
  stripe: {
    name: 'Stripe',
    category: 'payments',
    description: 'Payment processing platform',
    tiers: [
      { name: 'Standard', monthly: 0, limits: '2.9% + 30¢ per transaction (US cards)' },
    ],
    pricing_url: 'https://stripe.com/pricing',
    when_to_use: 'Any app that accepts payments',
    when_to_upgrade: 'Volume discounts available at scale',
  },

  // === EMAIL ===
  resend: {
    name: 'Resend',
    category: 'email',
    description: 'Developer-focused transactional email',
    tiers: [
      { name: 'Free', monthly: 0, limits: '3K emails/month, 100/day' },
      { name: 'Pro', monthly: 20, limits: '50K emails/month, no daily limit' },
      { name: 'Enterprise', monthly: 'custom', limits: 'Custom volume' },
    ],
    pricing_url: 'https://resend.com/pricing',
    when_to_use: 'Transactional emails (welcome, reset password, notifications)',
    when_to_upgrade: 'When you exceed 3K emails/month',
  },
  postmark: {
    name: 'Postmark',
    category: 'email',
    description: 'Reliable transactional email with great deliverability',
    tiers: [
      { name: 'Free', monthly: 0, limits: '100 emails/month' },
      { name: '10K', monthly: 15, limits: '10K emails/month' },
      { name: '50K', monthly: 55, limits: '50K emails/month' },
    ],
    pricing_url: 'https://postmarkapp.com/pricing',
    when_to_use: 'When deliverability is critical',
    when_to_upgrade: 'When you exceed 100 emails/month (very quickly)',
  },

  // === MONITORING ===
  sentry: {
    name: 'Sentry',
    category: 'monitoring',
    description: 'Error tracking and performance monitoring',
    tiers: [
      { name: 'Developer', monthly: 0, limits: '5K errors/month, 10K transactions' },
      { name: 'Team', monthly: 26, limits: '50K errors, 100K transactions' },
      { name: 'Business', monthly: 80, limits: '100K errors, 1M transactions' },
    ],
    pricing_url: 'https://sentry.io/pricing',
    when_to_use: 'Any production app — catch errors before users report them',
    when_to_upgrade: 'When you exceed error limits or need advanced features',
  },
  logtail: {
    name: 'Logtail (Better Stack)',
    category: 'monitoring',
    description: 'Log management and uptime monitoring',
    tiers: [
      { name: 'Free', monthly: 0, limits: '1GB logs/month, 5 monitors' },
      { name: 'Pro', monthly: 24, limits: '30GB logs/month, 20 monitors' },
    ],
    pricing_url: 'https://betterstack.com/pricing',
    when_to_use: 'When you need centralised logging and uptime monitoring',
    when_to_upgrade: 'When you exceed 1GB logs/month',
  },

  // === ANALYTICS ===
  plausible: {
    name: 'Plausible',
    category: 'analytics',
    description: 'Privacy-friendly web analytics',
    tiers: [
      { name: '10K', monthly: 9, limits: '10K pageviews/month' },
      { name: '100K', monthly: 19, limits: '100K pageviews/month' },
      { name: '1M', monthly: 69, limits: '1M pageviews/month' },
    ],
    pricing_url: 'https://plausible.io/#pricing',
    when_to_use: 'When you want analytics without cookie banners',
    when_to_upgrade: 'Based on pageview volume',
  },
  posthog: {
    name: 'PostHog',
    category: 'analytics',
    description: 'Product analytics, feature flags, session replay',
    tiers: [
      { name: 'Free', monthly: 0, limits: '1M events/month, 5K sessions' },
      { name: 'Pay as you go', monthly: 'usage', limits: 'Events + sessions based' },
    ],
    pricing_url: 'https://posthog.com/pricing',
    when_to_use: 'When you need product analytics with feature flags',
    when_to_upgrade: 'When you exceed 1M events/month',
  },

  // === AI ===
  openai: {
    name: 'OpenAI',
    category: 'ai',
    description: 'GPT-4, GPT-4o, embeddings, and more',
    tiers: [
      { name: 'Pay as you go', monthly: 'usage', limits: 'GPT-4o: $2.50/1M input, $10/1M output tokens' },
    ],
    pricing_url: 'https://openai.com/pricing',
    when_to_use: 'ChatGPT-style features, embeddings, structured outputs',
    when_to_upgrade: 'N/A — usage based',
  },
  anthropic: {
    name: 'Anthropic',
    category: 'ai',
    description: 'Claude models — Haiku, Sonnet, Opus',
    tiers: [
      { name: 'Pay as you go', monthly: 'usage', limits: 'Claude Sonnet: $3/1M input, $15/1M output tokens' },
    ],
    pricing_url: 'https://anthropic.com/pricing',
    when_to_use: 'Long-form content, nuanced reasoning, safety-focused',
    when_to_upgrade: 'N/A — usage based',
  },
  openrouter: {
    name: 'OpenRouter',
    category: 'ai',
    description: 'Unified API for multiple LLM providers',
    tiers: [
      { name: 'Pay as you go', monthly: 'usage', limits: 'Varies by model, small markup over direct pricing' },
    ],
    pricing_url: 'https://openrouter.ai/pricing',
    when_to_use: 'When you want to use multiple models through one API',
    when_to_upgrade: 'N/A — usage based',
  },

  // === SEARCH ===
  algolia: {
    name: 'Algolia',
    category: 'search',
    description: 'Search-as-a-service with great UX',
    tiers: [
      { name: 'Free', monthly: 0, limits: '10K searches/month, 10K records' },
      { name: 'Grow', monthly: 'usage', limits: 'Pay per 1K searches and records' },
    ],
    pricing_url: 'https://www.algolia.com/pricing',
    when_to_use: 'When search is a core feature and needs to be fast',
    when_to_upgrade: 'When you exceed 10K searches/month',
  },
  meilisearch: {
    name: 'Meilisearch Cloud',
    category: 'search',
    description: 'Open-source search, can self-host',
    tiers: [
      { name: 'Build', monthly: 0, limits: '100K documents, 10K searches/month' },
      { name: 'Pro', monthly: 30, limits: '1M documents, 100K searches/month' },
    ],
    pricing_url: 'https://www.meilisearch.com/pricing',
    when_to_use: 'When you want Algolia-like search at lower cost',
    when_to_upgrade: 'When you exceed free tier limits',
  },

  // === FILE STORAGE ===
  cloudinary: {
    name: 'Cloudinary',
    category: 'storage',
    description: 'Image and video management with transformations',
    tiers: [
      { name: 'Free', monthly: 0, limits: '25 credits/month (rough: 25K transformations)' },
      { name: 'Plus', monthly: 99, limits: '225 credits/month' },
    ],
    pricing_url: 'https://cloudinary.com/pricing',
    when_to_use: 'When you need image resizing, optimization, or video processing',
    when_to_upgrade: 'When you exceed 25 credits/month',
  },
  uploadthing: {
    name: 'UploadThing',
    category: 'storage',
    description: 'File uploads for TypeScript apps',
    tiers: [
      { name: 'Free', monthly: 0, limits: '2GB storage, 2GB bandwidth' },
      { name: 'Pro', monthly: 10, limits: '100GB storage, 100GB bandwidth' },
    ],
    pricing_url: 'https://uploadthing.com/pricing',
    when_to_use: 'Simple file uploads in Next.js/TypeScript apps',
    when_to_upgrade: 'When you exceed 2GB storage',
  },
  s3: {
    name: 'AWS S3',
    category: 'storage',
    description: 'Object storage from AWS',
    tiers: [
      { name: 'Pay as you go', monthly: 'usage', limits: '$0.023/GB storage, $0.09/GB egress' },
    ],
    pricing_url: 'https://aws.amazon.com/s3/pricing/',
    when_to_use: 'Large-scale file storage, CDN origin',
    when_to_upgrade: 'N/A — usage based',
  },
};

// Helper to calculate total monthly cost
export function calculateMonthlyCosts(
  selectedServices: { serviceId: string; tier: string }[]
): {
  total: number;
  breakdown: { service: string; tier: string; cost: number | string }[];
  warnings: string[];
} {
  let total = 0;
  const breakdown: { service: string; tier: string; cost: number | string }[] = [];
  const warnings: string[] = [];

  for (const { serviceId, tier: tierName } of selectedServices) {
    const service = subscriptionCosts[serviceId];
    if (!service) continue;

    const tier = service.tiers.find(t => t.name === tierName);
    if (!tier) continue;

    if (typeof tier.monthly === 'number') {
      total += tier.monthly;
      breakdown.push({ service: service.name, tier: tierName, cost: tier.monthly });
    } else if (tier.monthly === 'usage') {
      breakdown.push({ service: service.name, tier: tierName, cost: 'Usage-based' });
      warnings.push(`${service.name} is usage-based — costs depend on volume`);
    } else {
      breakdown.push({ service: service.name, tier: tierName, cost: 'Custom pricing' });
      warnings.push(`${service.name} requires custom pricing — contact sales`);
    }
  }

  return { total, breakdown, warnings };
}

// Get services by category
export function getServicesByCategory(category: string): Service[] {
  return Object.values(subscriptionCosts).filter(s => s.category === category);
}

// Get all categories
export function getAllServiceCategories(): string[] {
  return Array.from(new Set(Object.values(subscriptionCosts).map(s => s.category)));
}

// Get service by ID
export function getServiceById(id: string): Service | undefined {
  return subscriptionCosts[id];
}
