'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface PRDContent {
  id: string;
  projectName: string;
  problemStatement: string;
  targetAudience: string;
  techStack: {
    frontend: string;
    backend: string;
    database: string;
    auth: string;
    hosting: string;
    storage?: string;
    payments?: string;
  };
  coreFeatures: {
    id: string;
    name: string;
    description: string;
    userInput: boolean;
    fileUpload: boolean;
    payments: boolean;
    sensitiveData: boolean;
    publicFacing: boolean;
    apiEndpoints: string[];
  }[];
  databaseSchema: {
    tables: {
      name: string;
      fields: { name: string; type: string; sensitive?: boolean }[];
      hasUserData: boolean;
    }[];
  };
  apiRoutes: {
    path: string;
    method: string;
    description: string;
    requiresAuth: boolean;
    acceptsUserInput: boolean;
  }[];
}

interface PromptTemplate {
  name: string;
  description: string;
  prompt: string;
}

interface SecurityVulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  affectedFeatures: string[];
  affectedEndpoints: string[];
  affectedTables: string[];
  contextualRisk: string;
  attackScenario: string;
  status: 'vulnerable' | 'needs-review' | 'secured';
  prompts: {
    analyze: PromptTemplate;
    implement: PromptTemplate;
    verify: PromptTemplate;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  prd_content?: any;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const severityConfig = {
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-200',
    gradient: 'from-red-500 to-red-600',
    ring: 'ring-red-500/20',
    icon: '🚨',
  },
  high: {
    label: 'High',
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    gradient: 'from-orange-500 to-orange-600',
    ring: 'ring-orange-500/20',
    icon: '⚠️',
  },
  medium: {
    label: 'Medium',
    color: 'text-yellow-700',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
    gradient: 'from-yellow-500 to-yellow-600',
    ring: 'ring-yellow-500/20',
    icon: '📋',
  },
  low: {
    label: 'Low',
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'ring-blue-500/20',
    icon: 'ℹ️',
  },
};

const categoryIcons: Record<string, string> = {
  'Authentication': '🔐',
  'Data Protection': '🛡️',
  'API Security': '⚡',
  'Network Security': '🌐',
  'Infrastructure': '🏗️',
  'Dependencies': '📦',
};

// ============================================================================
// SECURITY ANALYSIS ENGINE
// ============================================================================

function analyzeSecurityFromPRD(prd: PRDContent): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];

  // Get categorized endpoints
  const authEndpoints = prd.apiRoutes.filter(r =>
    r.path.includes('auth') || r.path.includes('login') ||
    r.path.includes('register') || r.path.includes('signup') ||
    r.path.includes('password')
  );
  const inputEndpoints = prd.apiRoutes.filter(r => r.acceptsUserInput);
  const publicEndpoints = prd.apiRoutes.filter(r => !r.requiresAuth && r.acceptsUserInput);

  // Get categorized features
  const fileUploadFeatures = prd.coreFeatures.filter(f => f.fileUpload);
  const paymentFeatures = prd.coreFeatures.filter(f => f.payments);
  const sensitiveDataFeatures = prd.coreFeatures.filter(f => f.sensitiveData);

  // Get sensitive tables
  const sensitiveTables = prd.databaseSchema.tables.filter(t =>
    t.fields.some(f => f.sensitive ||
      ['password', 'ssn', 'credit_card', 'token', 'secret', 'key', 'hash'].some(s =>
        f.name.toLowerCase().includes(s)
      )
    )
  );

  // ====== VULNERABILITY 1: Auth Rate Limiting ======
  if (authEndpoints.length > 0) {
    const endpointList = authEndpoints.map(e => `- \`${e.method} ${e.path}\` - ${e.description}`).join('\n');

    vulnerabilities.push({
      id: 'auth-rate-limit',
      title: 'Authentication Rate Limiting',
      severity: 'critical',
      category: 'Authentication',
      affectedFeatures: ['User Authentication', 'Login', 'Registration'],
      affectedEndpoints: authEndpoints.map(e => `${e.method} ${e.path}`),
      affectedTables: ['users'],
      contextualRisk: `Your ${prd.techStack.auth || 'authentication system'} has ${authEndpoints.length} endpoint${authEndpoints.length > 1 ? 's' : ''} (${authEndpoints.map(e => e.path).join(', ')}) without verified rate limiting. These are prime targets for brute force attacks.`,
      attackScenario: `An attacker could attempt thousands of password combinations against your users' accounts, or flood your registration endpoint with spam accounts.`,
      status: 'vulnerable',
      prompts: {
        analyze: {
          name: 'Analyze Current Rate Limiting',
          description: 'Scan your codebase for existing rate limiting',
          prompt: `Analyze rate limiting implementation for my ${prd.projectName} authentication system.

## Project Context
- **Project:** ${prd.projectName}
- **Framework:** ${prd.techStack.frontend}
- **Auth Provider:** ${prd.techStack.auth || 'Custom'}
- **Database:** ${prd.techStack.database}
- **Hosting:** ${prd.techStack.hosting}

## Auth Endpoints to Analyze
${endpointList}

## Your Task

1. **Search for existing rate limiting:**
   - Look for rate limiting packages (e.g., @upstash/ratelimit, express-rate-limit)
   - Check if any custom rate limiting logic exists

2. **Check each auth endpoint:**
   - Is there middleware applied?
   - What are the current limits (if any)?
   - Is state stored in memory (bad) or Redis (good)?

3. **Identify gaps:**
   - List endpoints with NO rate limiting
   - Note any limits that are too permissive

## Expected Output

Provide a structured report with:
- Current implementation status per endpoint
- Risk assessment (Critical/High/Medium)
- Specific recommendations`,
        },
        implement: {
          name: 'Implement Rate Limiting',
          description: `Add Upstash rate limiting to auth endpoints`,
          prompt: `Implement rate limiting for ${prd.projectName}'s authentication endpoints.

## Project Context
- **Framework:** ${prd.techStack.frontend}
- **Auth:** ${prd.techStack.auth || 'Custom authentication'}
- **Database:** ${prd.techStack.database}
- **Hosting:** ${prd.techStack.hosting}

## Endpoints to Protect
${endpointList}

## Implementation Requirements

### 1. Install Dependencies
\`\`\`bash
npm install @upstash/ratelimit @upstash/redis
\`\`\`

### 2. Create Rate Limiter Utility (/lib/rate-limit.ts)

\`\`\`typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
  analytics: true,
  prefix: '${prd.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}:auth',
});

export const registrationRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  analytics: true,
  prefix: '${prd.projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}:register',
});
\`\`\`

### 3. Apply to Each Auth Endpoint

For each endpoint, add rate limiting BEFORE auth logic:
\`\`\`typescript
const ip = headers().get('x-forwarded-for') ?? 'anonymous';
const { success, limit, remaining, reset } = await authRateLimiter.limit(ip);

if (!success) {
  return NextResponse.json(
    { error: 'Too many attempts. Please try again later.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
      }
    }
  );
}
\`\`\`

### 4. Environment Variables
Add to \`.env.local\`:
\`\`\`
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
\`\`\``,
        },
        verify: {
          name: 'Verify Rate Limiting',
          description: 'Test that rate limiting works correctly',
          prompt: `Create tests to verify rate limiting on ${prd.projectName}'s auth endpoints.

## Endpoints to Test
${endpointList}

## Test Script (/scripts/test-rate-limit.ts)

\`\`\`typescript
const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testRateLimit(endpoint: string, limit: number) {
  console.log(\`\\nTesting \${endpoint}...\`);

  for (let i = 0; i < limit + 2; i++) {
    const res = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
    });

    console.log(\`  Request \${i + 1}: \${res.status} (remaining: \${res.headers.get('x-ratelimit-remaining') ?? 'N/A'})\`);

    if (i >= limit && res.status !== 429) {
      console.log(\`  ❌ FAILED: Should have been rate limited!\`);
    } else if (i < limit && res.status === 429) {
      console.log(\`  ❌ FAILED: Rate limited too early!\`);
    }
  }
}

// Test each endpoint
${authEndpoints.map(e => `await testRateLimit('${e.path}', 5);`).join('\n')}
\`\`\`

## Manual Test
\`\`\`bash
for i in {1..7}; do
  echo "Request $i:"
  curl -s -X POST http://localhost:3000${authEndpoints[0]?.path || '/api/auth/login'} \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test@test.com","password":"wrong"}' \\
    -w "Status: %{http_code}\\n" | tail -1
  sleep 0.2
done
\`\`\`

Expected: Requests 1-5 succeed (200 or 401), requests 6+ get 429.`,
        },
      },
    });
  }

  // ====== VULNERABILITY 2: Input Validation ======
  if (inputEndpoints.length > 0) {
    const endpointList = inputEndpoints.map(e => `- \`${e.method} ${e.path}\` - ${e.description}`).join('\n');
    const schemaInfo = prd.databaseSchema.tables.map(t =>
      `- **${t.name}:** ${t.fields.map(f => `${f.name}${f.sensitive ? '*' : ''}`).join(', ')}`
    ).join('\n');

    vulnerabilities.push({
      id: 'input-validation',
      title: 'Input Validation & Sanitization',
      severity: 'critical',
      category: 'Data Protection',
      affectedFeatures: prd.coreFeatures.filter(f => f.userInput).map(f => f.name),
      affectedEndpoints: inputEndpoints.map(e => `${e.method} ${e.path}`),
      affectedTables: prd.databaseSchema.tables.map(t => t.name),
      contextualRisk: `${inputEndpoints.length} API endpoints in ${prd.projectName} accept user input without verified validation. This includes ${inputEndpoints.slice(0, 3).map(e => e.path).join(', ')}${inputEndpoints.length > 3 ? ` and ${inputEndpoints.length - 3} more` : ''}.`,
      attackScenario: `Attackers could inject malicious SQL queries through form fields to dump your ${prd.databaseSchema.tables.filter(t => t.hasUserData).map(t => t.name).join(', ')} tables, or inject JavaScript to steal session cookies from other users.`,
      status: 'vulnerable',
      prompts: {
        analyze: {
          name: 'Analyze Input Validation',
          description: 'Scan for missing or weak validation',
          prompt: `Analyze input validation in ${prd.projectName}.

## Project Context
- **Framework:** ${prd.techStack.frontend}
- **Database:** ${prd.techStack.database}

## Endpoints Accepting User Input
${endpointList}

## Database Tables (validation targets)
${schemaInfo}
(*sensitive fields)

## Analysis Tasks

1. **Search for validation libraries:**
   \`\`\`bash
   grep -r "zod\\|yup\\|joi\\|validator" package.json
   \`\`\`

2. **For each endpoint, check:**
   - Is there schema validation before processing?
   - Does validation match database constraints?
   - Is there both client AND server validation?

3. **Look for dangerous patterns:**
   - Direct use of req.body without validation
   - String interpolation in queries
   - eval() or Function() with user data

## Output

For each endpoint, report:
- Validation present? (Yes/No)
- Library used? (Zod/Yup/Custom/None)
- Fields validated vs missing
- Risk level`,
        },
        implement: {
          name: 'Implement Validation',
          description: 'Add Zod schemas for all endpoints',
          prompt: `Implement input validation for ${prd.projectName} using Zod.

## Setup
\`\`\`bash
npm install zod
\`\`\`

## Create Validation Schemas (/lib/validations/schemas.ts)

\`\`\`typescript
import { z } from 'zod';

// Common patterns
export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/);
export const uuidSchema = z.string().uuid();

// Table-specific schemas
${prd.databaseSchema.tables.map(table => `
export const ${table.name.toLowerCase()}Schema = z.object({
${table.fields.map(field => {
  let validation = 'z.string()';
  const name = field.name.toLowerCase();
  if (name.includes('email')) validation = 'emailSchema';
  else if (name.includes('password')) validation = 'passwordSchema';
  else if (name === 'id' || name.endsWith('_id')) validation = 'uuidSchema';
  else if (field.type.includes('int')) validation = 'z.number().int()';
  else if (field.type.includes('bool')) validation = 'z.boolean()';
  return `  ${field.name}: ${validation},`;
}).join('\n')}
});`).join('\n')}
\`\`\`

## Validation Middleware (/lib/validations/validate.ts)

\`\`\`typescript
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export async function validateBody<T extends z.ZodSchema>(
  request: NextRequest,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: NextResponse.json({
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        }, { status: 400 }),
      };
    }
    return {
      success: false,
      error: NextResponse.json({ error: 'Invalid request' }, { status: 400 }),
    };
  }
}
\`\`\`

## Apply to Each Endpoint

\`\`\`typescript
import { validateBody } from '@/lib/validations/validate';
import { someSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  const validation = await validateBody(request, someSchema);
  if (!validation.success) return validation.error;

  const { data } = validation;
  // Now safe to use data...
}
\`\`\``,
        },
        verify: {
          name: 'Test Validation',
          description: 'Test with malicious payloads',
          prompt: `Test input validation in ${prd.projectName} with attack payloads.

## Test Script (/scripts/test-validation.ts)

\`\`\`typescript
const BASE_URL = 'http://localhost:3000';

const ATTACK_PAYLOADS = [
  // SQL Injection
  "' OR '1'='1",
  "'; DROP TABLE ${prd.databaseSchema.tables[0]?.name || 'users'};--",
  "' UNION SELECT * FROM ${prd.databaseSchema.tables.find(t => t.hasUserData)?.name || 'users'}--",

  // XSS
  "<script>alert('XSS')</script>",
  "<img src=x onerror=alert('XSS')>",
  "javascript:alert('XSS')",

  // Boundary tests
  "",
  "a".repeat(10000),
  "\\x00\\x00\\x00",
];

async function testEndpoint(method: string, path: string, field: string) {
  console.log(\`\\nTesting \${method} \${path}...\`);
  let vulnerabilities = 0;

  for (const payload of ATTACK_PAYLOADS) {
    const res = await fetch(\`\${BASE_URL}\${path}\`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: payload }),
    });

    if (res.status === 200 || res.status === 500) {
      console.log(\`  ❌ VULNERABLE: \${payload.slice(0, 30)}...\`);
      vulnerabilities++;
    }
  }

  if (vulnerabilities === 0) {
    console.log(\`  ✅ All malicious payloads rejected\`);
  }
}

${inputEndpoints.slice(0, 5).map(e => `await testEndpoint('${e.method}', '${e.path}', 'input');`).join('\n')}
\`\`\`

Expected: All attack payloads should return 400 (validation error), not 200 or 500.`,
        },
      },
    });
  }

  // ====== VULNERABILITY 3: SQL Injection ======
  if (prd.techStack.database && prd.databaseSchema.tables.length > 0) {
    const isUsingORM = prd.techStack.database.toLowerCase().includes('prisma') ||
      prd.techStack.database.toLowerCase().includes('drizzle');
    const userTables = prd.databaseSchema.tables.filter(t => t.hasUserData).map(t => t.name);

    vulnerabilities.push({
      id: 'sql-injection',
      title: 'SQL Injection Prevention',
      severity: 'critical',
      category: 'Data Protection',
      affectedFeatures: prd.coreFeatures.filter(f => f.userInput).map(f => f.name),
      affectedEndpoints: inputEndpoints.map(e => `${e.method} ${e.path}`),
      affectedTables: prd.databaseSchema.tables.map(t => t.name),
      contextualRisk: `${prd.projectName} uses ${prd.techStack.database} with ${prd.databaseSchema.tables.length} tables. ${isUsingORM ? 'While the ORM provides protection, raw queries need review.' : 'All queries must use parameterized statements.'} Tables at risk: ${userTables.join(', ')}.`,
      attackScenario: `A SQL injection attack could expose all data from your ${userTables.join(', ')} tables, including user credentials and personal information.`,
      status: isUsingORM ? 'needs-review' : 'vulnerable',
      prompts: {
        analyze: {
          name: 'Analyze SQL Security',
          description: 'Scan for SQL injection vulnerabilities',
          prompt: `Analyze ${prd.projectName} for SQL injection vulnerabilities.

## Database Setup
- **Database:** ${prd.techStack.database}
- **Tables:** ${prd.databaseSchema.tables.map(t => t.name).join(', ')}

## Analysis Tasks

1. **Find raw SQL usage:**
   \`\`\`bash
   ${prd.techStack.database.includes('Prisma')
              ? 'grep -r "\\$queryRaw\\|\\$executeRaw\\|Prisma.sql" --include="*.ts"'
              : 'grep -r "query(\\|execute(\\|raw(" --include="*.ts"'
            }
   \`\`\`

2. **Find string interpolation in queries:**
   \`\`\`bash
   grep -r "\\$\\{" --include="*.ts" | grep -iE "select|insert|update|delete|where"
   \`\`\`

3. **Check each finding for user input contamination**

## Output
List vulnerabilities found with file locations and severity.`,
        },
        implement: {
          name: 'Fix SQL Vulnerabilities',
          description: 'Convert to safe parameterized queries',
          prompt: `Fix SQL injection vulnerabilities in ${prd.projectName}.

## Your Database: ${prd.techStack.database}

${prd.techStack.database.includes('Prisma') ? `
## Safe Prisma Patterns

### ❌ DANGEROUS:
\`\`\`typescript
const users = await prisma.$queryRaw\`
  SELECT * FROM users WHERE email = '\${userInput}'
\`;
\`\`\`

### ✅ SAFE:
\`\`\`typescript
// Use Prisma's type-safe API (preferred)
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// If raw SQL is needed, use Prisma.sql
import { Prisma } from '@prisma/client';
const users = await prisma.$queryRaw(
  Prisma.sql\`SELECT * FROM users WHERE email = \${userInput}\`
);
\`\`\`
` : `
## Safe Query Patterns

### ❌ DANGEROUS:
\`\`\`typescript
const query = "SELECT * FROM users WHERE id = " + id;
\`\`\`

### ✅ SAFE:
\`\`\`typescript
const query = "SELECT * FROM users WHERE id = $1";
const result = await pool.query(query, [id]);
\`\`\`
`}

Apply these patterns to all database queries in your codebase.`,
        },
        verify: {
          name: 'Test SQL Security',
          description: 'Test with SQL injection payloads',
          prompt: `Test ${prd.projectName} for SQL injection vulnerabilities.

## SQL Injection Payloads

\`\`\`typescript
const PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE ${prd.databaseSchema.tables[0]?.name || 'users'};--",
  "' UNION SELECT NULL,NULL FROM information_schema.tables--",
  "' AND SLEEP(5)--",
];
\`\`\`

## Test Each Endpoint

${inputEndpoints.slice(0, 3).map(e => `
### ${e.method} ${e.path}
\`\`\`bash
curl -X ${e.method} 'http://localhost:3000${e.path}' \\
  -H 'Content-Type: application/json' \\
  -d '{"field": "\\' OR \\'1\\'=\\'1"}'
\`\`\``).join('\n')}

## Expected Results
- ✅ SAFE: Returns 400 with validation error
- ⚠️ WARNING: Returns 500 (possible injection)
- ❌ VULNERABLE: Returns 200 or unexpected data`,
        },
      },
    });
  }

  // ====== VULNERABILITY 4: Session Security ======
  if (prd.techStack.auth) {
    vulnerabilities.push({
      id: 'session-security',
      title: 'Session Management Security',
      severity: 'critical',
      category: 'Authentication',
      affectedFeatures: ['User Sessions', 'Authentication'],
      affectedEndpoints: authEndpoints.map(e => `${e.method} ${e.path}`),
      affectedTables: ['sessions', 'users'],
      contextualRisk: `You're using ${prd.techStack.auth} for authentication. Session cookies must be configured with HTTP-only, Secure, and SameSite flags to prevent session hijacking.`,
      attackScenario: `Without proper cookie settings, an XSS attack could steal session tokens, allowing attackers to impersonate any logged-in user and access their data.`,
      status: 'needs-review',
      prompts: {
        analyze: {
          name: 'Analyze Session Security',
          description: 'Review session and cookie configuration',
          prompt: `Analyze session security in ${prd.projectName} using ${prd.techStack.auth}.

## Check These Areas

1. **Cookie configuration:**
   - Are cookies HTTP-only? (prevents JS access)
   - Is Secure flag set? (HTTPS only)
   - Is SameSite set? (CSRF protection)
   - What's the session timeout?

2. **Session storage:**
   - Where are sessions stored? (JWT, database, Redis)
   - Is session invalidation on logout working?

3. **Protected routes:**
   - Are all dashboard routes protected?
   - Are API routes protected separately?

## How to Check

\`\`\`bash
# Check cookie settings in browser DevTools > Application > Cookies
# Look for: HttpOnly, Secure, SameSite attributes

# Search for session configuration
grep -r "cookie\\|session" --include="*.ts" | grep -iE "httponly\\|secure\\|samesite"
\`\`\``,
        },
        implement: {
          name: 'Secure Sessions',
          description: 'Implement secure session configuration',
          prompt: `Implement secure session management for ${prd.projectName} with ${prd.techStack.auth}.

## Secure Cookie Configuration

\`\`\`typescript
// For ${prd.techStack.auth} configuration
const sessionOptions = {
  cookieName: 'session',
  password: process.env.SESSION_SECRET!, // 32+ chars
  cookieOptions: {
    httpOnly: true,      // Prevents XSS from reading cookie
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    sameSite: 'lax',     // CSRF protection
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  },
};
\`\`\`

## Session Invalidation on Logout

\`\`\`typescript
export async function logout() {
  // 1. Clear the session cookie
  cookies().delete('session');

  // 2. If using database sessions, delete the record
  await prisma.session.delete({
    where: { token: sessionToken }
  });

  // 3. Redirect to login
  redirect('/login');
}
\`\`\`

## Middleware Protection (/middleware.ts)

\`\`\`typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/api/'];
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Redirect authenticated users away from auth pages
  if (session && authRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (!session && protectedRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
\`\`\``,
        },
        verify: {
          name: 'Verify Session Security',
          description: 'Test session and cookie security',
          prompt: `Test session security in ${prd.projectName}.

## Test Cases

### 1. Cookie Security
Open browser DevTools > Application > Cookies and verify:
- ✅ HttpOnly: true (cannot access via document.cookie)
- ✅ Secure: true (in production)
- ✅ SameSite: Lax or Strict

### 2. Session Invalidation
\`\`\`bash
# Login and get session cookie
SESSION_COOKIE=$(curl -c - http://localhost:3000/api/auth/login \\
  -d '{"email":"test@test.com","password":"test"}' | grep session)

# Logout
curl http://localhost:3000/api/auth/logout -b "$SESSION_COOKIE"

# Try to use old session (should fail)
curl http://localhost:3000/dashboard -b "$SESSION_COOKIE"
# Expected: 401 or redirect to login
\`\`\`

### 3. Protected Routes
\`\`\`bash
# Access dashboard without auth
curl http://localhost:3000/dashboard
# Expected: Redirect to /login

# Access API without auth
curl http://localhost:3000/api/user/profile
# Expected: 401 Unauthorized
\`\`\``,
        },
      },
    });
  }

  // ====== VULNERABILITY 5: File Upload Security ======
  if (fileUploadFeatures.length > 0) {
    vulnerabilities.push({
      id: 'file-upload-security',
      title: 'File Upload Security',
      severity: 'high',
      category: 'Data Protection',
      affectedFeatures: fileUploadFeatures.map(f => f.name),
      affectedEndpoints: fileUploadFeatures.flatMap(f => f.apiEndpoints),
      affectedTables: [],
      contextualRisk: `${prd.projectName}'s ${fileUploadFeatures.map(f => f.name).join(', ')} feature${fileUploadFeatures.length > 1 ? 's' : ''} accept file uploads${prd.techStack.storage ? ` to ${prd.techStack.storage}` : ''}. Without validation, attackers can upload malicious files.`,
      attackScenario: `Attackers could upload web shells disguised as images, executable files, or malware. A web shell could give attackers complete server access.`,
      status: 'vulnerable',
      prompts: {
        analyze: {
          name: 'Analyze Upload Security',
          description: 'Review file upload implementation',
          prompt: `Analyze file upload security in ${prd.projectName}.

## Features with File Upload
${fileUploadFeatures.map(f => `- **${f.name}:** ${f.description}`).join('\n')}

## Storage: ${prd.techStack.storage || 'Local/Unknown'}

## Check for:

1. **File type validation:**
   - Is MIME type checked?
   - Is file extension validated?
   - Is there magic byte verification?

2. **File size limits:**
   - Is there a max file size?

3. **File naming:**
   - Are files renamed on upload?
   - Could path traversal occur (../../)?

4. **Malware scanning:**
   - Is there any virus scanning?`,
        },
        implement: {
          name: 'Secure File Uploads',
          description: 'Implement secure upload handling',
          prompt: `Implement secure file upload handling for ${prd.projectName}.

## File Upload Security (/lib/upload-security.ts)

\`\`\`typescript
import { createHash } from 'crypto';

const ALLOWED_TYPES = {
  image: {
    mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    magicBytes: [
      [0xFF, 0xD8, 0xFF], // JPEG
      [0x89, 0x50, 0x4E, 0x47], // PNG
      [0x47, 0x49, 0x46], // GIF
    ],
  },
};

export async function validateUpload(
  file: File,
  maxSizeMB: number = 5
): Promise<{ isValid: boolean; error?: string; sanitizedName?: string }> {
  // Check size
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { isValid: false, error: \`File too large. Max: \${maxSizeMB}MB\` };
  }

  // Check MIME type
  const allowedMimes = ALLOWED_TYPES.image.mimes;
  if (!allowedMimes.includes(file.type)) {
    return { isValid: false, error: \`File type not allowed: \${file.type}\` };
  }

  // Verify magic bytes
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const validMagic = ALLOWED_TYPES.image.magicBytes.some(magic =>
    magic.every((byte, i) => bytes[i] === byte)
  );

  if (!validMagic) {
    return { isValid: false, error: 'File content does not match type' };
  }

  // Generate safe filename
  const hash = createHash('sha256').update(Buffer.from(buffer)).digest('hex').slice(0, 16);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  return { isValid: true, sanitizedName: \`\${hash}.\${ext}\` };
}
\`\`\``,
        },
        verify: {
          name: 'Test Upload Security',
          description: 'Test with malicious files',
          prompt: `Test file upload security in ${prd.projectName}.

## Create Test Files

\`\`\`bash
# PHP web shell disguised as image
echo '<?php system($_GET["cmd"]); ?>' > malicious.php.jpg

# Test uploads
${fileUploadFeatures.flatMap(f => f.apiEndpoints).slice(0, 2).map(ep => `
curl -X POST 'http://localhost:3000${ep}' \\
  -F 'file=@malicious.php.jpg'
# Expected: 400 (rejected)`).join('\n')}
\`\`\`

## Expected Results
- ✅ PHP files rejected
- ✅ Double extensions (file.php.jpg) rejected
- ✅ Oversized files rejected
- ✅ Files renamed to hash`,
        },
      },
    });
  }

  // ====== VULNERABILITY 6: Payment Security ======
  if (paymentFeatures.length > 0 || prd.techStack.payments) {
    const paymentTables = prd.databaseSchema.tables.filter(t =>
      t.name.toLowerCase().includes('payment') ||
      t.name.toLowerCase().includes('subscription') ||
      t.name.toLowerCase().includes('order')
    );

    vulnerabilities.push({
      id: 'payment-security',
      title: 'Payment Security',
      severity: 'critical',
      category: 'Data Protection',
      affectedFeatures: paymentFeatures.map(f => f.name),
      affectedEndpoints: paymentFeatures.flatMap(f => f.apiEndpoints),
      affectedTables: paymentTables.map(t => t.name),
      contextualRisk: `${prd.projectName} processes payments with ${prd.techStack.payments || 'a payment provider'}. Payment endpoints and webhook handlers must be secured to prevent fraud.`,
      attackScenario: `Insecure payment handling could allow attackers to manipulate prices, steal payment tokens, or process fraudulent transactions.`,
      status: 'needs-review',
      prompts: {
        analyze: {
          name: 'Analyze Payment Security',
          description: 'Review payment implementation',
          prompt: `Analyze payment security in ${prd.projectName}.

## Payment Setup
- **Provider:** ${prd.techStack.payments || 'Unknown'}

## Check:

1. **Never store card data:**
   - Search for card number fields in database
   - Check if raw card data is logged

2. **Webhook verification:**
   - Are webhooks cryptographically verified?

3. **Price manipulation:**
   - Is price validated server-side?

4. **Idempotency:**
   - Are payments idempotent?`,
        },
        implement: {
          name: 'Secure Payments',
          description: 'Implement payment security',
          prompt: `Implement payment security for ${prd.projectName} with ${prd.techStack.payments || 'Stripe'}.

## Webhook Verification

\`\`\`typescript
// /app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle event...
}
\`\`\`

## Price Validation

\`\`\`typescript
// Always get price from YOUR database
const product = await prisma.product.findUnique({ where: { id } });
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      unit_amount: product.priceInCents, // From YOUR database
    },
  }],
});
\`\`\``,
        },
        verify: {
          name: 'Test Payment Security',
          description: 'Test payment implementation',
          prompt: `Test payment security in ${prd.projectName}.

## Tests

### 1. Webhook Without Signature
\`\`\`bash
curl -X POST 'http://localhost:3000/api/webhooks/stripe' \\
  -H 'Content-Type: application/json' \\
  -d '{"type":"checkout.session.completed"}'
# Expected: 400 (invalid signature)
\`\`\`

### 2. Price Manipulation
\`\`\`bash
curl -X POST 'http://localhost:3000/api/checkout' \\
  -d '{"productId":"abc","price":1}'
# Expected: Price ignored, fetched from server
\`\`\``,
        },
      },
    });
  }

  // ====== VULNERABILITY 7: HTTPS & Security Headers ======
  vulnerabilities.push({
    id: 'https-headers',
    title: 'HTTPS & Security Headers',
    severity: 'high',
    category: 'Network Security',
    affectedFeatures: [],
    affectedEndpoints: prd.apiRoutes.map(e => `${e.method} ${e.path}`),
    affectedTables: [],
    contextualRisk: `${prd.projectName} on ${prd.techStack.hosting} needs HTTPS, HSTS, and security headers to protect users from man-in-the-middle attacks and XSS.`,
    attackScenario: `Without proper HTTPS and headers, attackers on the same network could intercept credentials and session tokens.`,
    status: prd.techStack.hosting === 'Vercel' ? 'needs-review' : 'vulnerable',
    prompts: {
      analyze: {
        name: 'Analyze Security Headers',
        description: 'Check current header configuration',
        prompt: `Analyze security headers for ${prd.projectName}.

## Check Headers

\`\`\`bash
curl -I https://your-domain.com
\`\`\`

## Required Headers

| Header | Purpose |
|--------|---------|
| Strict-Transport-Security | Force HTTPS |
| X-Content-Type-Options | Prevent MIME sniffing |
| X-Frame-Options | Prevent clickjacking |
| Content-Security-Policy | Prevent XSS |

## Check next.config.js for headers() function`,
      },
      implement: {
        name: 'Implement Security Headers',
        description: 'Add all required headers',
        prompt: `Add security headers to ${prd.projectName}.

## next.config.js

\`\`\`javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none'"
          },
        ],
      },
    ];
  },
};
\`\`\``,
      },
      verify: {
        name: 'Verify Headers',
        description: 'Test security headers',
        prompt: `Verify security headers for ${prd.projectName}.

## Quick Check
\`\`\`bash
curl -I https://your-domain.com | grep -iE "strict-transport|x-frame|x-content|content-security"
\`\`\`

## Online Tools
- Security Headers: https://securityheaders.com/
- SSL Labs: https://www.ssllabs.com/ssltest/
- Mozilla Observatory: https://observatory.mozilla.org/`,
      },
    },
  });

  // ====== VULNERABILITY 8: Secrets Management ======
  const integrations = [prd.techStack.database, prd.techStack.auth, prd.techStack.payments, prd.techStack.storage].filter(Boolean);

  vulnerabilities.push({
    id: 'secrets-management',
    title: 'Secrets Management',
    severity: 'high',
    category: 'Infrastructure',
    affectedFeatures: [],
    affectedEndpoints: [],
    affectedTables: [],
    contextualRisk: `${prd.projectName} uses ${integrations.join(', ')} which require API keys. These must never be exposed in client code or committed to git.`,
    attackScenario: `Exposed API keys could allow attackers to access your database, impersonate your application, or charge payments to your account.`,
    status: 'needs-review',
    prompts: {
      analyze: {
        name: 'Audit Secrets',
        description: 'Check for exposed secrets',
        prompt: `Audit secrets management in ${prd.projectName}.

## Expected Environment Variables
${prd.techStack.database.includes('Prisma') ? '- DATABASE_URL\n' : ''}${prd.techStack.auth ? '- AUTH_SECRET / NEXTAUTH_SECRET\n' : ''}${prd.techStack.payments?.includes('Stripe') ? '- STRIPE_SECRET_KEY\n- STRIPE_WEBHOOK_SECRET\n' : ''}${prd.techStack.storage?.includes('S3') ? '- AWS_ACCESS_KEY_ID\n- AWS_SECRET_ACCESS_KEY\n' : ''}

## Checks

\`\`\`bash
# Check for hardcoded secrets
grep -r "sk_live\\|sk_test\\|AKIA" --include="*.ts" --include="*.tsx"

# Check .gitignore
grep -E "env" .gitignore

# Check for .env in git history
git log --all --full-history -- "*.env"

# Check for server secrets in client code
grep -r "STRIPE_SECRET\\|DATABASE_URL" --include="*.ts" | grep -v "process.env"
\`\`\``,
      },
      implement: {
        name: 'Secure Secrets',
        description: 'Implement proper secrets handling',
        prompt: `Implement proper secrets management for ${prd.projectName}.

## 1. .env.local (NEVER commit)

\`\`\`bash
# Database
DATABASE_URL="postgresql://..."

${prd.techStack.auth ? `# Auth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
` : ''}${prd.techStack.payments?.includes('Stripe') ? `# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."
` : ''}
\`\`\`

## 2. .env.example (commit this)

\`\`\`bash
# Copy to .env.local and fill in
DATABASE_URL=
${prd.techStack.auth ? 'NEXTAUTH_SECRET=\n' : ''}${prd.techStack.payments?.includes('Stripe') ? 'STRIPE_SECRET_KEY=\nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\n' : ''}
\`\`\`

## 3. .gitignore

\`\`\`
.env
.env.local
.env.*.local
\`\`\``,
      },
      verify: {
        name: 'Verify Secrets',
        description: 'Check secrets are secure',
        prompt: `Verify secrets security in ${prd.projectName}.

## Checks

\`\`\`bash
# Verify .env files not in git
git status --ignored | grep env

# Check no secrets in git history
git log -p --all -S "sk_live" --source --all

# Check no NEXT_PUBLIC_ with secret values
grep "NEXT_PUBLIC" .env.local | grep -iE "secret|key|password"
# Should return nothing (secrets shouldn't be public)
\`\`\``,
      },
    },
  });

  // ====== VULNERABILITY 9: Dependency Audit ======
  vulnerabilities.push({
    id: 'dependency-audit',
    title: 'Dependency Security Audit',
    severity: 'high',
    category: 'Dependencies',
    affectedFeatures: [],
    affectedEndpoints: [],
    affectedTables: [],
    contextualRisk: `${prd.projectName}'s ${prd.techStack.frontend} app has many npm dependencies. Any could have known vulnerabilities that attackers actively exploit.`,
    attackScenario: `A vulnerable dependency could allow remote code execution, data theft, or complete system compromise.`,
    status: 'needs-review',
    prompts: {
      analyze: {
        name: 'Audit Dependencies',
        description: 'Scan for vulnerable packages',
        prompt: `Audit dependencies in ${prd.projectName}.

## Run These Commands

\`\`\`bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated
\`\`\`

## Analyze Results

- Group by severity (Critical > High > Medium > Low)
- Identify direct vs transitive dependencies
- Check if patches are available`,
      },
      implement: {
        name: 'Fix Vulnerabilities',
        description: 'Update vulnerable packages',
        prompt: `Fix dependency vulnerabilities in ${prd.projectName}.

## Fix Process

1. **Try automatic fixes:**
\`\`\`bash
npm audit fix
\`\`\`

2. **For breaking changes:**
\`\`\`bash
npm audit fix --force  # Use cautiously
\`\`\`

3. **For stubborn transitive deps, add overrides in package.json:**
\`\`\`json
{
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}
\`\`\`

4. **Setup ongoing monitoring:**
- Configure Dependabot in GitHub
- Add \`npm audit\` to CI/CD`,
      },
      verify: {
        name: 'Verify Dependencies',
        description: 'Confirm vulnerabilities fixed',
        prompt: `Verify dependency vulnerabilities are fixed.

## Run

\`\`\`bash
npm audit
\`\`\`

## Expected Output

\`\`\`
found 0 vulnerabilities
\`\`\`

## Setup CI Check

Add to \`.github/workflows/security.yml\`:
\`\`\`yaml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm audit --audit-level=high
\`\`\``,
      },
    },
  });

  return vulnerabilities;
}

// ============================================================================
// HELPER: Extract PRD content from raw data
// ============================================================================

function extractPRDContent(project: Project): PRDContent | null {
  if (!project.prd_content) return null;

  const prd = project.prd_content;

  // Extract tech stack from architecture phase
  const techStack = {
    frontend: prd.techStack?.frontend || prd.architecture?.techStack?.frontend || 'Next.js',
    backend: prd.techStack?.backend || prd.architecture?.techStack?.backend || 'Next.js API Routes',
    database: prd.techStack?.database || prd.architecture?.techStack?.database || 'PostgreSQL',
    auth: prd.techStack?.auth || prd.architecture?.techStack?.auth || 'NextAuth.js',
    hosting: prd.techStack?.hosting || prd.architecture?.techStack?.hosting || 'Vercel',
    storage: prd.techStack?.storage || prd.architecture?.techStack?.storage,
    payments: prd.techStack?.payments || prd.architecture?.techStack?.payments,
  };

  // Extract features
  const coreFeatures = (prd.features || prd.coreFeatures || []).map((f: any, i: number) => ({
    id: f.id || `feature-${i}`,
    name: f.name || f.title || `Feature ${i + 1}`,
    description: f.description || '',
    userInput: f.userInput ?? f.acceptsInput ?? true,
    fileUpload: f.fileUpload ?? f.hasFileUpload ?? false,
    payments: f.payments ?? f.hasPayments ?? false,
    sensitiveData: f.sensitiveData ?? f.hasSensitiveData ?? false,
    publicFacing: f.publicFacing ?? f.isPublic ?? true,
    apiEndpoints: f.apiEndpoints || f.endpoints || [],
  }));

  // Extract database schema
  const databaseSchema = {
    tables: (prd.databaseSchema?.tables || prd.schema?.tables || []).map((t: any) => ({
      name: t.name || 'unknown',
      fields: (t.fields || t.columns || []).map((f: any) => ({
        name: f.name || f.column || 'unknown',
        type: f.type || 'string',
        sensitive: f.sensitive ?? ['password', 'token', 'secret', 'key'].some(s =>
          (f.name || '').toLowerCase().includes(s)
        ),
      })),
      hasUserData: t.hasUserData ?? (t.name || '').toLowerCase().includes('user'),
    })),
  };

  // Extract API routes
  const apiRoutes = (prd.apiRoutes || prd.endpoints || []).map((r: any) => ({
    path: r.path || r.endpoint || '/api/unknown',
    method: r.method || 'GET',
    description: r.description || '',
    requiresAuth: r.requiresAuth ?? r.authenticated ?? true,
    acceptsUserInput: r.acceptsUserInput ?? r.hasInput ?? (r.method !== 'GET'),
  }));

  // If no API routes defined, generate some based on features
  if (apiRoutes.length === 0 && coreFeatures.length > 0) {
    coreFeatures.forEach((f: any) => {
      apiRoutes.push({
        path: `/api/${f.name.toLowerCase().replace(/\s+/g, '-')}`,
        method: 'POST',
        description: f.description,
        requiresAuth: true,
        acceptsUserInput: f.userInput,
      });
    });
  }

  // Add common auth endpoints if auth is configured
  if (techStack.auth && !apiRoutes.some((r: any) => r.path.includes('auth'))) {
    apiRoutes.push(
      { path: '/api/auth/login', method: 'POST', description: 'User login', requiresAuth: false, acceptsUserInput: true },
      { path: '/api/auth/register', method: 'POST', description: 'User registration', requiresAuth: false, acceptsUserInput: true },
      { path: '/api/auth/logout', method: 'POST', description: 'User logout', requiresAuth: true, acceptsUserInput: false },
    );
  }

  return {
    id: project.id,
    projectName: project.name || prd.projectName || 'My Project',
    problemStatement: prd.problemStatement || prd.problem || '',
    targetAudience: prd.targetAudience || prd.audience || '',
    techStack,
    coreFeatures,
    databaseSchema,
    apiRoutes,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SecurityChecker() {
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>([]);
  const [selectedVuln, setSelectedVuln] = useState<SecurityVulnerability | null>(null);
  const [activePromptType, setActivePromptType] = useState<'analyze' | 'implement' | 'verify'>('analyze');
  const [securedVulns, setSecuredVulns] = useState<Set<string>>(new Set());
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/prd');
        if (!res.ok) throw new Error('Failed to fetch projects');
        const data = await res.json();
        setProjects(data.prds || []);
      } catch (err) {
        setError('Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Analyze selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setVulnerabilities([]);
      setSelectedVuln(null);
      return;
    }

    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return;

    const prdContent = extractPRDContent(project);
    if (!prdContent) {
      setVulnerabilities([]);
      setError('This project has no PRD content to analyze');
      return;
    }

    const vulns = analyzeSecurityFromPRD(prdContent);
    setVulnerabilities(vulns);
    setSelectedVuln(vulns[0] || null);
    setError(null);
  }, [selectedProjectId, projects]);

  // Stats
  const stats = useMemo(() => {
    const critical = vulnerabilities.filter(v => v.severity === 'critical' && !securedVulns.has(v.id));
    const high = vulnerabilities.filter(v => v.severity === 'high' && !securedVulns.has(v.id));
    const secured = securedVulns.size;
    const total = vulnerabilities.length;
    return { critical: critical.length, high: high.length, secured, total };
  }, [vulnerabilities, securedVulns]);

  // Group vulnerabilities by category
  const groupedVulns = useMemo(() => {
    const groups: Record<string, SecurityVulnerability[]> = {};
    vulnerabilities.forEach(v => {
      if (!groups[v.category]) groups[v.category] = [];
      groups[v.category].push(v);
    });
    return groups;
  }, [vulnerabilities]);

  // Handlers
  const toggleSecured = (vulnId: string) => {
    setSecuredVulns(prev => {
      const next = new Set(prev);
      if (next.has(vulnId)) {
        next.delete(vulnId);
      } else {
        next.add(vulnId);
      }
      return next;
    });
  };

  const copyPrompt = async (prompt: string, promptId: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopiedPrompt(promptId);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20">
      {/* Background pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.015) 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative max-w-[1600px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-rose-700 rounded-3xl p-8 mb-8 shadow-2xl shadow-red-500/20">
          {/* Decorations */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-rose-900/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center shadow-xl">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      Pro Tool
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/80 rounded-lg text-xs font-bold text-white uppercase tracking-wider">
                      PRD-Aware Analysis
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">Security Checker</h1>
                  <p className="text-red-100 text-lg max-w-xl">
                    Analyze your PRD to identify specific vulnerabilities and get targeted Claude Code prompts
                  </p>
                </div>
              </div>

              {/* Project Selector */}
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 min-w-[300px]">
                <label className="block text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">
                  Select Project to Analyze
                </label>
                <select
                  value={selectedProjectId || ''}
                  onChange={(e) => setSelectedProjectId(e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="" className="text-gray-900">Choose a project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-900">
                      {p.name}
                    </option>
                  ))}
                </select>
                {selectedProject && (
                  <p className="mt-2 text-white/60 text-xs">
                    Analyzing security based on your PRD content
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            {selectedProjectId && vulnerabilities.length > 0 && (
              <div className="mt-6 flex items-center gap-4">
                <div className="bg-red-900/30 border border-red-400/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats.critical}</p>
                  <p className="text-red-200 text-xs">Critical</p>
                </div>
                <div className="bg-orange-900/30 border border-orange-400/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats.high}</p>
                  <p className="text-orange-200 text-xs">High</p>
                </div>
                <div className="bg-emerald-900/30 border border-emerald-400/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-2xl font-bold text-white">{stats.secured}</p>
                  <p className="text-emerald-200 text-xs">Secured</p>
                </div>
                <div className="flex-1" />
                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${(stats.secured / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">
                      {stats.secured}/{stats.total} fixed
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading / Error / Empty States */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto" />
            <p className="mt-4 text-gray-500">Loading projects...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {!isLoading && !error && !selectedProjectId && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Project</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose a project with a completed PRD to analyze its security vulnerabilities and get targeted fix recommendations.
            </p>
            {projects.length === 0 && (
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                Create Your First PRD
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        )}

        {/* Main Content */}
        {!isLoading && selectedProjectId && vulnerabilities.length > 0 && (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar - Vulnerabilities List */}
            <div className="col-span-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-sm font-semibold text-gray-900">Detected Vulnerabilities</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Based on {selectedProject?.name}'s PRD
                  </p>
                </div>

                <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                  {Object.entries(groupedVulns).map(([category, vulns]) => (
                    <div key={category} className="border-b border-gray-100 last:border-b-0">
                      <div className="px-4 py-2.5 bg-gray-50/50 flex items-center gap-2">
                        <span className="text-lg">{categoryIcons[category] || '🔒'}</span>
                        <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">{category}</span>
                        <span className="ml-auto text-xs text-gray-400">{vulns.length}</span>
                      </div>

                      {vulns.map((vuln) => {
                        const config = severityConfig[vuln.severity];
                        const isSelected = selectedVuln?.id === vuln.id;
                        const isSecured = securedVulns.has(vuln.id);

                        return (
                          <button
                            key={vuln.id}
                            onClick={() => setSelectedVuln(vuln)}
                            className={`
                              w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                              ${isSelected
                                ? 'bg-white shadow-sm border-l-4 border-l-red-500'
                                : 'hover:bg-white/70 border-l-4 border-l-transparent'
                              }
                            `}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSecured(vuln.id);
                              }}
                              className={`
                                w-5 h-5 rounded-md border-2 flex items-center justify-center
                                transition-all duration-200 flex-shrink-0
                                ${isSecured
                                  ? 'bg-emerald-500 border-emerald-500'
                                  : `${config.border} hover:border-red-400`
                                }
                              `}
                            >
                              {isSecured && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSecured ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                {vuln.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {vuln.affectedEndpoints.length > 0
                                  ? `${vuln.affectedEndpoints.length} endpoint${vuln.affectedEndpoints.length > 1 ? 's' : ''}`
                                  : vuln.affectedFeatures.slice(0, 2).join(', ')
                                }
                              </p>
                            </div>

                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.bg} ${config.color}`}>
                              {config.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content - Vulnerability Details & Prompts */}
            <div className="col-span-8">
              {selectedVuln ? (
                <div className="space-y-6">
                  {/* Vulnerability Header */}
                  <div className={`bg-gradient-to-br ${severityConfig[selectedVuln.severity].gradient} rounded-2xl p-6 shadow-lg`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold text-white uppercase">
                            {severityConfig[selectedVuln.severity].label}
                          </span>
                          <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-medium text-white">
                            {selectedVuln.category}
                          </span>
                          {securedVulns.has(selectedVuln.id) && (
                            <span className="px-3 py-1 bg-emerald-500 rounded-lg text-xs font-bold text-white uppercase flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              Secured
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedVuln.title}</h2>
                      </div>
                      <button
                        onClick={() => toggleSecured(selectedVuln.id)}
                        className={`
                          px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                          ${securedVulns.has(selectedVuln.id)
                            ? 'bg-white/20 text-white hover:bg-white/30'
                            : 'bg-white text-red-600 hover:bg-red-50 shadow-lg'
                          }
                        `}
                      >
                        {securedVulns.has(selectedVuln.id) ? 'Mark as Vulnerable' : 'Mark as Secured'}
                      </button>
                    </div>
                  </div>

                  {/* Context & Risk */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        Why This Matters for Your Project
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedVuln.contextualRisk}</p>

                      {selectedVuln.affectedEndpoints.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Affected Endpoints</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedVuln.affectedEndpoints.slice(0, 5).map((ep, i) => (
                              <code key={i} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">{ep}</code>
                            ))}
                            {selectedVuln.affectedEndpoints.length > 5 && (
                              <span className="px-2 py-1 text-xs text-gray-500">+{selectedVuln.affectedEndpoints.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <span className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </span>
                        Attack Scenario
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{selectedVuln.attackScenario}</p>

                      {selectedVuln.affectedTables.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tables at Risk</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedVuln.affectedTables.map((table, i) => (
                              <code key={i} className="px-2 py-1 bg-red-50 rounded text-xs text-red-700">{table}</code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Claude Code Prompts */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="flex items-center border-b border-gray-200 bg-gray-50/50">
                      {[
                        { id: 'analyze', label: 'Analyze', icon: '🔍', description: 'Scan your codebase' },
                        { id: 'implement', label: 'Implement', icon: '🛠️', description: 'Apply the fix' },
                        { id: 'verify', label: 'Verify', icon: '✅', description: 'Test it works' },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActivePromptType(tab.id as 'analyze' | 'implement' | 'verify')}
                          className={`
                            flex-1 flex items-center justify-center gap-3 px-6 py-4
                            text-sm font-medium transition-all
                            ${activePromptType === tab.id
                              ? 'bg-white text-gray-900 border-b-2 border-red-500 -mb-px'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                            }
                          `}
                        >
                          <span className="text-lg">{tab.icon}</span>
                          <div className="text-left">
                            <p className="font-semibold">{tab.label}</p>
                            <p className="text-xs text-gray-400">{tab.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Prompt Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {selectedVuln.prompts[activePromptType].name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {selectedVuln.prompts[activePromptType].description}
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="absolute top-3 right-3 z-10">
                          <button
                            onClick={() => copyPrompt(
                              selectedVuln.prompts[activePromptType].prompt,
                              `${selectedVuln.id}-${activePromptType}`
                            )}
                            className={`
                              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                              transition-all duration-200 shadow-lg
                              ${copiedPrompt === `${selectedVuln.id}-${activePromptType}`
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                              }
                            `}
                          >
                            {copiedPrompt === `${selectedVuln.id}-${activePromptType}` ? (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy to Claude Code
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="bg-gray-900 text-gray-100 rounded-xl p-5 pt-14 text-sm font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
                          {selectedVuln.prompts[activePromptType].prompt}
                        </pre>
                      </div>

                      {/* Workflow hint */}
                      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">1</span>
                          Copy prompt
                        </span>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">2</span>
                          Paste in Claude Code
                        </span>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">3</span>
                          Review & apply
                        </span>
                        <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">4</span>
                          Mark as secured
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a vulnerability</h3>
                  <p className="text-gray-500">Click on a vulnerability to see details and get Claude Code prompts</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
