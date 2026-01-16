// lib/prd-templates.ts
// PRD Template Library - Pre-built starting points for common project types

export interface PRDFeature {
  name: string;
  description: string;
  user_story: string;
  acceptance_criteria: string[];
  priority: 'must' | 'should' | 'could';
}

export interface PRDTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'saas' | 'marketplace' | 'social' | 'tool' | 'api' | 'extension' | 'ai';
  default_idea: {
    platform?: 'web' | 'mobile' | 'desktop' | 'api' | 'extension';
    monetisation?: 'free' | 'freemium' | 'paid' | 'usage_based' | 'enterprise';
  };
  default_features: {
    v1?: PRDFeature[];
  };
  default_tech_stack: {
    preset?: string;
    frontend?: { framework: string; styling: string; state_management?: string };
    backend?: { framework: string; runtime: string };
    database?: { type: string; provider: string; orm?: string };
    auth?: { provider: string; methods?: string[] };
    hosting?: { provider: string; type: string };
    additional?: { name: string; purpose: string }[];
  };
  suggested_integrations: string[];
  common_pitfalls: string[];
  example_prompts: string[];
}

export const prdTemplates: PRDTemplate[] = [
  {
    id: 'saas-starter',
    name: 'SaaS Starter',
    description: 'Subscription-based software product with user accounts, billing, and a dashboard',
    icon: '🚀',
    category: 'saas',
    default_idea: {
      platform: 'web',
      monetisation: 'freemium',
    },
    default_features: {
      v1: [
        {
          name: 'User Authentication',
          description: 'Email/password and OAuth login with email verification',
          user_story: 'As a user, I want to create an account so I can access the product',
          acceptance_criteria: ['Email/password signup', 'Google OAuth', 'Email verification', 'Password reset'],
          priority: 'must'
        },
        {
          name: 'User Dashboard',
          description: 'Main interface showing key metrics and actions',
          user_story: 'As a user, I want a dashboard so I can see my data at a glance',
          acceptance_criteria: ['Key metrics displayed', 'Quick actions available', 'Responsive design'],
          priority: 'must'
        },
        {
          name: 'Subscription Billing',
          description: 'Stripe integration for subscription payments',
          user_story: 'As a user, I want to upgrade to Pro so I can access premium features',
          acceptance_criteria: ['Stripe checkout', 'Plan management', 'Invoice history', 'Cancel/resume'],
          priority: 'must'
        },
        {
          name: 'Settings Page',
          description: 'Account and preference management',
          user_story: 'As a user, I want to manage my settings so I can customise my experience',
          acceptance_criteria: ['Profile editing', 'Password change', 'Notification preferences', 'Delete account'],
          priority: 'should'
        },
      ],
    },
    default_tech_stack: {
      preset: 'modern_web',
      frontend: { framework: 'Next.js 14 (App Router)', styling: 'Tailwind CSS', state_management: 'React hooks + Context' },
      backend: { framework: 'Next.js API Routes', runtime: 'Node.js (Edge compatible)' },
      database: { type: 'PostgreSQL', provider: 'Supabase', orm: 'Supabase client' },
      auth: { provider: 'Supabase Auth', methods: ['email', 'google', 'github'] },
      hosting: { provider: 'Vercel', type: 'Serverless' },
    },
    suggested_integrations: ['Stripe', 'Resend', 'Sentry', 'Plausible'],
    common_pitfalls: [
      'Scope creep on V1 features — keep it minimal',
      'Underestimating auth complexity (edge cases, security)',
      'Not planning for subscription edge cases (cancellations, refunds, plan changes, failed payments)',
      'Building admin features before you have users',
      'Over-engineering for scale you don\'t have yet',
    ],
    example_prompts: [
      'A SaaS that helps freelancers track time and generate invoices',
      'A subscription tool for managing social media content calendars',
      'A SaaS dashboard for monitoring website uptime',
    ],
  },
  {
    id: 'marketplace',
    name: 'Two-Sided Marketplace',
    description: 'Platform connecting buyers and sellers with listings, search, and transactions',
    icon: '🏪',
    category: 'marketplace',
    default_idea: {
      platform: 'web',
      monetisation: 'usage_based',
    },
    default_features: {
      v1: [
        {
          name: 'Seller Listings',
          description: 'Create, edit, and manage product or service listings',
          user_story: 'As a seller, I want to create listings so buyers can find my products',
          acceptance_criteria: ['Create listing with images', 'Edit listing', 'Set pricing', 'Mark as sold/unavailable'],
          priority: 'must'
        },
        {
          name: 'Search & Discovery',
          description: 'Browse, search, and filter listings',
          user_story: 'As a buyer, I want to search listings so I can find what I need',
          acceptance_criteria: ['Keyword search', 'Category filters', 'Price filters', 'Sort options'],
          priority: 'must'
        },
        {
          name: 'User Profiles',
          description: 'Public profiles for buyers and sellers with ratings',
          user_story: 'As a user, I want to see seller profiles so I can trust who I\'m buying from',
          acceptance_criteria: ['Profile page', 'Rating display', 'Review history', 'Verification badges'],
          priority: 'must'
        },
        {
          name: 'Messaging',
          description: 'Communication between buyers and sellers',
          user_story: 'As a buyer, I want to message sellers so I can ask questions',
          acceptance_criteria: ['Direct messaging', 'Message history', 'Notifications'],
          priority: 'should'
        },
        {
          name: 'Secure Payments',
          description: 'Transaction handling with escrow',
          user_story: 'As a buyer, I want secure payments so I\'m protected if something goes wrong',
          acceptance_criteria: ['Stripe Connect', 'Escrow/hold', 'Release on delivery', 'Refund handling'],
          priority: 'must'
        },
      ],
    },
    default_tech_stack: {
      preset: 'modern_web',
      database: { type: 'PostgreSQL', provider: 'Supabase' },
      additional: [
        { name: 'Algolia', purpose: 'Search' },
        { name: 'Stripe Connect', purpose: 'Marketplace payments' },
        { name: 'Cloudinary', purpose: 'Image hosting' },
      ],
    },
    suggested_integrations: ['Stripe Connect', 'Algolia', 'Cloudinary', 'Twilio', 'Postmark'],
    common_pitfalls: [
      'Chicken-and-egg problem — need both buyers AND sellers to start',
      'Payment disputes and refund handling complexity',
      'Trust and safety (fraud, scams, fake listings)',
      'Search relevance requires ongoing tuning',
      'Taking on too much liability in transactions',
    ],
    example_prompts: [
      'A marketplace for buying and selling vintage furniture',
      'A platform connecting freelance photographers with clients',
      'A marketplace for handmade crafts and artisan goods',
    ],
  },
  {
    id: 'social-app',
    name: 'Social / Community App',
    description: 'User-generated content platform with feeds, profiles, and social interactions',
    icon: '👥',
    category: 'social',
    default_idea: {
      platform: 'web',
      monetisation: 'freemium',
    },
    default_features: {
      v1: [
        {
          name: 'User Profiles',
          description: 'Public profiles with bio, avatar, and content',
          user_story: 'As a user, I want a profile so others can learn about me',
          acceptance_criteria: ['Profile page', 'Bio editing', 'Avatar upload', 'Content display'],
          priority: 'must'
        },
        {
          name: 'Content Feed',
          description: 'Chronological or algorithmic feed of posts',
          user_story: 'As a user, I want a feed so I can see content from people I follow',
          acceptance_criteria: ['Feed display', 'Pagination/infinite scroll', 'Refresh'],
          priority: 'must'
        },
        {
          name: 'Post Creation',
          description: 'Create and share content (text, images)',
          user_story: 'As a user, I want to create posts so I can share with others',
          acceptance_criteria: ['Text posts', 'Image upload', 'Edit/delete', 'Draft saving'],
          priority: 'must'
        },
        {
          name: 'Social Interactions',
          description: 'Likes, comments, and shares',
          user_story: 'As a user, I want to interact with posts so I can engage with content',
          acceptance_criteria: ['Like/unlike', 'Comment', 'Share/repost', 'Counts displayed'],
          priority: 'must'
        },
        {
          name: 'Follow System',
          description: 'Follow users to see their content',
          user_story: 'As a user, I want to follow others so I see their posts in my feed',
          acceptance_criteria: ['Follow/unfollow', 'Follower/following counts', 'Following list'],
          priority: 'should'
        },
        {
          name: 'Notifications',
          description: 'Alerts for activity on your content',
          user_story: 'As a user, I want notifications so I know when people interact with my content',
          acceptance_criteria: ['In-app notifications', 'Notification list', 'Mark as read'],
          priority: 'should'
        },
      ],
    },
    default_tech_stack: {
      preset: 'modern_web',
      additional: [
        { name: 'Redis/Upstash', purpose: 'Feed caching' },
        { name: 'Cloudinary', purpose: 'Image/video handling' },
        { name: 'Pusher/Ably', purpose: 'Real-time updates' },
      ],
    },
    suggested_integrations: ['Cloudinary', 'Upstash', 'Pusher', 'Resend'],
    common_pitfalls: [
      'Feed performance degrades at scale — plan caching early',
      'Content moderation is legally required and complex',
      'Notification spam drives users away',
      'Privacy concerns (especially with location/personal data)',
      'Engagement metrics can be gamed',
    ],
    example_prompts: [
      'A social platform for book lovers to share reviews and recommendations',
      'A community app for local runners to share routes and meet up',
      'A platform for developers to share code snippets and get feedback',
    ],
  },
  {
    id: 'internal-tool',
    name: 'Internal Tool / Admin Panel',
    description: 'Business tool for internal teams with data management and workflows',
    icon: '🔧',
    category: 'tool',
    default_idea: {
      platform: 'web',
      monetisation: 'free',
    },
    default_features: {
      v1: [
        {
          name: 'Data Tables',
          description: 'View and manage records with sorting and filtering',
          user_story: 'As an admin, I want to view data in tables so I can manage records',
          acceptance_criteria: ['Table view', 'Sorting', 'Filtering', 'Pagination'],
          priority: 'must'
        },
        {
          name: 'CRUD Operations',
          description: 'Create, read, update, delete records',
          user_story: 'As an admin, I want to edit records so I can keep data accurate',
          acceptance_criteria: ['Create form', 'Edit form', 'Delete confirmation', 'Bulk actions'],
          priority: 'must'
        },
        {
          name: 'Search & Filters',
          description: 'Find and filter data quickly',
          user_story: 'As an admin, I want to search so I can find specific records',
          acceptance_criteria: ['Global search', 'Column filters', 'Saved filters'],
          priority: 'must'
        },
        {
          name: 'Role-Based Access',
          description: 'Different permissions for different users',
          user_story: 'As an admin, I want to control access so users only see what they should',
          acceptance_criteria: ['Role definitions', 'Permission checks', 'Access denied handling'],
          priority: 'should'
        },
        {
          name: 'Audit Log',
          description: 'Track who changed what and when',
          user_story: 'As an admin, I want to see change history so I can track issues',
          acceptance_criteria: ['Log all changes', 'User attribution', 'Timestamp', 'Searchable'],
          priority: 'should'
        },
      ],
    },
    default_tech_stack: {
      preset: 'modern_web',
      auth: { provider: 'Supabase Auth', methods: ['email', 'google'] },
    },
    suggested_integrations: ['Slack', 'Google Sheets', 'Zapier'],
    common_pitfalls: [
      'Scope creep from stakeholder requests — get requirements in writing',
      'Permission complexity grows fast — plan the model early',
      'Data migration from existing systems is always harder than expected',
      'Users will request "just one more feature" forever',
    ],
    example_prompts: [
      'An admin panel for managing customer support tickets',
      'An internal tool for tracking inventory across warehouses',
      'A dashboard for managing employee onboarding tasks',
    ],
  },
  {
    id: 'api-service',
    name: 'API / Backend Service',
    description: 'RESTful or GraphQL API for other applications to consume',
    icon: '⚡',
    category: 'api',
    default_idea: {
      platform: 'api',
      monetisation: 'usage_based',
    },
    default_features: {
      v1: [
        {
          name: 'Core API Endpoints',
          description: 'Main API functionality',
          user_story: 'As a developer, I want clear endpoints so I can integrate easily',
          acceptance_criteria: ['RESTful design', 'Consistent responses', 'Error handling'],
          priority: 'must'
        },
        {
          name: 'Authentication',
          description: 'API keys or OAuth for access control',
          user_story: 'As a developer, I want API keys so I can authenticate requests',
          acceptance_criteria: ['API key generation', 'Key rotation', 'OAuth option'],
          priority: 'must'
        },
        {
          name: 'Rate Limiting',
          description: 'Prevent abuse and enforce usage limits',
          user_story: 'As a provider, I want rate limits so the API stays stable',
          acceptance_criteria: ['Per-key limits', 'Clear error messages', 'Retry-After header'],
          priority: 'must'
        },
        {
          name: 'Documentation',
          description: 'OpenAPI/Swagger documentation',
          user_story: 'As a developer, I want docs so I can understand how to use the API',
          acceptance_criteria: ['OpenAPI spec', 'Interactive docs', 'Code examples'],
          priority: 'must'
        },
        {
          name: 'Usage Tracking',
          description: 'Track API calls per user/key',
          user_story: 'As a provider, I want usage stats so I can bill and monitor',
          acceptance_criteria: ['Request counting', 'Usage dashboard', 'Alerts'],
          priority: 'should'
        },
        {
          name: 'Webhooks',
          description: 'Event notifications to subscribers',
          user_story: 'As a developer, I want webhooks so I get notified of events',
          acceptance_criteria: ['Webhook registration', 'Retry logic', 'Signature verification'],
          priority: 'could'
        },
      ],
    },
    default_tech_stack: {
      preset: 'serverless',
      frontend: { framework: 'None (API only)', styling: 'N/A' },
      backend: { framework: 'Next.js API Routes or FastAPI', runtime: 'Edge or Python' },
      additional: [
        { name: 'Upstash', purpose: 'Rate limiting' },
        { name: 'Scalar', purpose: 'API documentation' },
      ],
    },
    suggested_integrations: ['Upstash', 'Sentry', 'Scalar/Swagger'],
    common_pitfalls: [
      'Rate limiting strategy needs thought — too strict loses users, too loose gets abused',
      'API versioning is hard to retrofit — plan from day 1',
      'Documentation falls out of date fast — automate from code',
      'Breaking changes will upset users — have a deprecation policy',
    ],
    example_prompts: [
      'An API for converting documents between formats',
      'A service that provides real-time currency exchange rates',
      'An API for generating and validating short URLs',
    ],
  },
  {
    id: 'chrome-extension',
    name: 'Chrome Extension',
    description: 'Browser extension that enhances or automates web experiences',
    icon: '🧩',
    category: 'extension',
    default_idea: {
      platform: 'extension',
      monetisation: 'freemium',
    },
    default_features: {
      v1: [
        {
          name: 'Core Functionality',
          description: 'Main extension feature',
          user_story: 'As a user, I want the extension to do X so I can Y',
          acceptance_criteria: ['Feature works reliably', 'Handles edge cases'],
          priority: 'must'
        },
        {
          name: 'Popup UI',
          description: 'Extension popup interface',
          user_story: 'As a user, I want a popup so I can control the extension',
          acceptance_criteria: ['Clean UI', 'Quick access to features', 'Status display'],
          priority: 'must'
        },
        {
          name: 'Content Scripts',
          description: 'Inject functionality into web pages',
          user_story: 'As a user, I want the extension to work on pages so it enhances my browsing',
          acceptance_criteria: ['Works on target sites', 'Doesn\'t break pages', 'Minimal permissions'],
          priority: 'must'
        },
        {
          name: 'Options Page',
          description: 'User settings and preferences',
          user_story: 'As a user, I want settings so I can customise the extension',
          acceptance_criteria: ['Settings persist', 'Sync across devices optional'],
          priority: 'should'
        },
        {
          name: 'Sync Storage',
          description: 'Sync data across devices via Chrome account',
          user_story: 'As a user, I want my data synced so I can use it on any device',
          acceptance_criteria: ['Chrome storage sync API', 'Conflict handling'],
          priority: 'could'
        },
      ],
    },
    default_tech_stack: {
      preset: 'custom',
      frontend: { framework: 'React or Vanilla JS', styling: 'Tailwind CSS' },
      backend: { framework: 'Optional API backend', runtime: 'N/A for extension-only' },
      additional: [
        { name: 'Chrome Storage API', purpose: 'Local/sync storage' },
        { name: 'Chrome Identity API', purpose: 'OAuth if needed' },
      ],
    },
    suggested_integrations: [],
    common_pitfalls: [
      'Chrome Web Store review process can take days and reject for unclear reasons',
      'Manifest V3 has significant limitations vs V2 — check if your idea is possible',
      'Cross-browser compatibility (Firefox, Safari) requires separate work',
      'Permission requests scare users — request only what you need',
      'Content scripts can break when sites update their HTML',
    ],
    example_prompts: [
      'An extension that summarises long articles with AI',
      'A productivity extension that blocks distracting sites',
      'An extension that saves items from any shopping site to a wishlist',
    ],
  },
  {
    id: 'ai-wrapper',
    name: 'AI-Powered App',
    description: 'Application that leverages LLMs or other AI APIs for its core functionality',
    icon: '🤖',
    category: 'ai',
    default_idea: {
      platform: 'web',
      monetisation: 'freemium',
    },
    default_features: {
      v1: [
        {
          name: 'AI Core Feature',
          description: 'Main AI-powered functionality',
          user_story: 'As a user, I want AI to help me with X so I can Y faster/better',
          acceptance_criteria: ['AI produces useful output', 'Handles errors gracefully', 'Response time acceptable'],
          priority: 'must'
        },
        {
          name: 'User Input Interface',
          description: 'Where users provide input to the AI',
          user_story: 'As a user, I want a clear input area so I can tell the AI what I need',
          acceptance_criteria: ['Clear input field', 'Input validation', 'Supports expected formats'],
          priority: 'must'
        },
        {
          name: 'Response Display',
          description: 'Show AI output clearly and usefully',
          user_story: 'As a user, I want to see AI responses clearly so I can use them',
          acceptance_criteria: ['Streaming responses', 'Formatted output', 'Copy/export options'],
          priority: 'must'
        },
        {
          name: 'Usage Limits',
          description: 'Track and limit API usage per user',
          user_story: 'As a provider, I want usage limits so costs stay controlled',
          acceptance_criteria: ['Usage tracking', 'Limit enforcement', 'Clear messaging'],
          priority: 'must'
        },
        {
          name: 'History',
          description: 'Save past interactions',
          user_story: 'As a user, I want history so I can reference past AI interactions',
          acceptance_criteria: ['Save interactions', 'Search history', 'Delete option'],
          priority: 'should'
        },
      ],
    },
    default_tech_stack: {
      preset: 'modern_web',
      additional: [
        { name: 'OpenRouter', purpose: 'Multi-model LLM API access' },
        { name: 'Vercel AI SDK', purpose: 'Streaming responses' },
        { name: 'Upstash', purpose: 'Rate limiting and usage tracking' },
      ],
    },
    suggested_integrations: ['OpenRouter', 'Anthropic', 'OpenAI', 'Vercel AI SDK', 'Upstash'],
    common_pitfalls: [
      'API costs can spike unexpectedly — implement hard limits early',
      'Prompt engineering is iterative — expect to refine prompts significantly',
      'Rate limiting and abuse prevention are critical — people will try to exploit it',
      'Latency and streaming UX matter a lot — users expect fast responses',
      'Differentiating from other AI wrappers is hard — need a unique angle',
      'AI outputs can be wrong or harmful — plan for content moderation',
    ],
    example_prompts: [
      'An AI tool that generates social media posts from blog content',
      'A writing assistant that helps with email tone and clarity',
      'An AI that generates SQL queries from natural language',
    ],
  },
];

export function getTemplateById(id: string): PRDTemplate | undefined {
  return prdTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): PRDTemplate[] {
  return prdTemplates.filter(t => t.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(prdTemplates.map(t => t.category)));
}
