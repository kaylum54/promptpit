// lib/tech-stack-presets.ts
// Tech Stack Presets - Pre-configured technology stacks for common use cases

export interface TechStackPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  stack: {
    frontend: { framework: string; styling: string; state_management?: string; rationale: string };
    backend: { framework: string; runtime: string; rationale: string };
    database: { type: string; provider: string; orm?: string; rationale: string };
    auth: { provider: string; methods?: string[]; rationale: string };
    hosting: { provider: string; type: string; rationale: string };
  };
  best_for: string[];
  not_ideal_for: string[];
  estimated_monthly_cost: {
    mvp: string;
    growth: string;
    scale: string;
  };
}

export const techStackPresets: Record<string, TechStackPreset> = {
  modern_web: {
    id: 'modern_web',
    name: 'Modern Web Stack',
    description: 'Next.js + Supabase + Vercel — Fast to build, scales well, generous free tiers',
    icon: '🌐',
    stack: {
      frontend: {
        framework: 'Next.js 14 (App Router)',
        styling: 'Tailwind CSS',
        state_management: 'React hooks + Context (Zustand if needed)',
        rationale: 'Best developer experience, excellent performance, huge ecosystem, great docs',
      },
      backend: {
        framework: 'Next.js API Routes + Server Actions',
        runtime: 'Node.js (Edge compatible)',
        rationale: 'Unified codebase, serverless by default, no separate backend to deploy',
      },
      database: {
        type: 'PostgreSQL',
        provider: 'Supabase',
        orm: 'Supabase client (or Prisma/Drizzle)',
        rationale: 'Generous free tier (500MB, 50K auth users), built-in auth, real-time subscriptions, instant REST API',
      },
      auth: {
        provider: 'Supabase Auth',
        methods: ['email', 'google', 'github'],
        rationale: 'Integrated with database, easy OAuth setup, handles sessions automatically',
      },
      hosting: {
        provider: 'Vercel',
        type: 'Serverless + Edge',
        rationale: 'Zero config deployment, excellent Next.js support, generous free tier, global CDN',
      },
    },
    best_for: [
      'Most web applications',
      'MVPs and prototypes',
      'Solo developers and small teams',
      'Products that need auth + database quickly',
    ],
    not_ideal_for: [
      'Heavy compute workloads (ML, video processing)',
      'Applications requiring specific backend languages',
      'Products with strict data residency requirements',
    ],
    estimated_monthly_cost: {
      mvp: '$0-20',
      growth: '$50-150',
      scale: '$200-500',
    },
  },

  fullstack_js: {
    id: 'fullstack_js',
    name: 'Full Stack JavaScript',
    description: 'Next.js + Prisma + PostgreSQL — More control, type-safe, self-hostable',
    icon: '📦',
    stack: {
      frontend: {
        framework: 'Next.js 14 (App Router)',
        styling: 'Tailwind CSS',
        state_management: 'Zustand or Jotai',
        rationale: 'Type-safe throughout, excellent developer experience',
      },
      backend: {
        framework: 'Next.js API Routes',
        runtime: 'Node.js',
        rationale: 'Full control over backend logic, can extend with tRPC for end-to-end types',
      },
      database: {
        type: 'PostgreSQL',
        provider: 'Neon or Railway',
        orm: 'Prisma',
        rationale: 'Type-safe queries, excellent migrations, schema-first development',
      },
      auth: {
        provider: 'Auth.js (NextAuth)',
        methods: ['email', 'google', 'github', 'credentials'],
        rationale: 'Flexible, works with any database, good community support',
      },
      hosting: {
        provider: 'Vercel or Railway',
        type: 'Serverless or Container',
        rationale: 'Choose based on needs — Vercel for simplicity, Railway for more control',
      },
    },
    best_for: [
      'Teams wanting full type safety',
      'Projects that may need to self-host later',
      'Applications with complex data relationships',
      'Products that need fine-grained database control',
    ],
    not_ideal_for: [
      'Quick prototypes (more setup required)',
      'Teams unfamiliar with TypeScript',
    ],
    estimated_monthly_cost: {
      mvp: '$0-25',
      growth: '$50-200',
      scale: '$200-800',
    },
  },

  serverless: {
    id: 'serverless',
    name: 'Serverless First',
    description: 'Edge functions + KV storage — Ultra fast responses, pay per use, global by default',
    icon: '⚡',
    stack: {
      frontend: {
        framework: 'Next.js 14 (App Router)',
        styling: 'Tailwind CSS',
        rationale: 'Edge-ready, fast TTFB worldwide',
      },
      backend: {
        framework: 'Next.js Edge Functions',
        runtime: 'Edge Runtime (V8 isolates)',
        rationale: 'Sub-50ms cold starts, runs close to users globally',
      },
      database: {
        type: 'Key-Value + PostgreSQL',
        provider: 'Vercel KV (Redis) + Neon',
        rationale: 'KV for fast reads and sessions, Postgres for relational data',
      },
      auth: {
        provider: 'Clerk',
        rationale: 'Edge-compatible, handles complexity, great UX components',
      },
      hosting: {
        provider: 'Vercel',
        type: 'Edge',
        rationale: 'Native edge support, automatic global distribution',
      },
    },
    best_for: [
      'Applications needing global low latency',
      'Read-heavy workloads',
      'Products with unpredictable traffic',
      'Cost-sensitive projects (pay per use)',
    ],
    not_ideal_for: [
      'Long-running processes',
      'Heavy database writes',
      'Applications needing Node.js-specific packages',
    ],
    estimated_monthly_cost: {
      mvp: '$0-15',
      growth: '$30-100',
      scale: '$100-400',
    },
  },

  python_api: {
    id: 'python_api',
    name: 'Python Backend',
    description: 'FastAPI + PostgreSQL — Great for data-heavy apps, ML integration, or Python teams',
    icon: '🐍',
    stack: {
      frontend: {
        framework: 'Next.js 14 (or separate SPA)',
        styling: 'Tailwind CSS',
        rationale: 'Decoupled frontend allows flexibility, can also use plain React',
      },
      backend: {
        framework: 'FastAPI',
        runtime: 'Python 3.11+',
        rationale: 'Fast, async, automatic OpenAPI docs, great for ML/data workloads',
      },
      database: {
        type: 'PostgreSQL',
        provider: 'Railway or Supabase',
        orm: 'SQLAlchemy or SQLModel',
        rationale: 'Battle-tested, excellent Python support, can use raw SQL when needed',
      },
      auth: {
        provider: 'Custom JWT or Auth0',
        rationale: 'API-first approach, flexible for different clients',
      },
      hosting: {
        provider: 'Railway or Fly.io',
        type: 'Container',
        rationale: 'Easy Python deployment, good for long-running processes',
      },
    },
    best_for: [
      'Data processing applications',
      'ML/AI integrations',
      'Teams with Python expertise',
      'APIs that need to integrate with Python libraries',
    ],
    not_ideal_for: [
      'Teams without Python experience',
      'Simple CRUD apps (overkill)',
      'Projects prioritising serverless',
    ],
    estimated_monthly_cost: {
      mvp: '$5-25',
      growth: '$50-200',
      scale: '$200-1000',
    },
  },
};

export function getPresetById(id: string): TechStackPreset | undefined {
  return techStackPresets[id];
}

export function getAllPresets(): TechStackPreset[] {
  return Object.values(techStackPresets);
}

export function getPresetIds(): string[] {
  return Object.keys(techStackPresets);
}
