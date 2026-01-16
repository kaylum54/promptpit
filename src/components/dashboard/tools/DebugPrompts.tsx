'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface PRDContent {
  techStack?: string;
  features?: string;
  database?: string;
  authentication?: string;
  integrations?: string;
  projectName?: string;
}

interface Project {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface DebugCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  gradient: string;
  prompts: DebugPrompt[];
}

interface DebugPrompt {
  id: string;
  name: string;
  description: string;
  template: string;
  contextFields: string[];
}

const debugCategories: DebugCategory[] = [
  {
    id: 'api',
    name: 'API Issues',
    description: 'Debug API endpoints, REST calls, and request/response problems',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    prompts: [
      {
        id: 'api-error',
        name: 'API Error Analysis',
        description: 'Debug endpoint errors with full context',
        template: `Analyze this API error in my {{techStack}} application.

**Endpoint:** [endpoint URL]
**Method:** [GET/POST/PUT/DELETE]
**Status Code:** [status code]

**Request:**
\`\`\`json
[request body]
\`\`\`

**Error Response:**
\`\`\`json
[error response]
\`\`\`

**Route Handler Code:**
\`\`\`typescript
[paste route handler]
\`\`\`

Identify the root cause and provide a fix with proper error handling.`,
        contextFields: ['techStack'],
      },
      {
        id: 'api-integration',
        name: 'Third-Party Integration',
        description: 'Debug external API connections',
        template: `I'm having trouble integrating with an external API in my {{techStack}} app.

**Service:** [API service name]
**Endpoint:** [endpoint URL]
**Auth Method:** [API key/OAuth/etc]

**My Integration Code:**
\`\`\`typescript
[integration code]
\`\`\`

**Expected:** [what should happen]
**Actual:** [what's happening]

**Error/Response:**
\`\`\`
[error or unexpected response]
\`\`\`

Debug this integration and suggest proper error handling.`,
        contextFields: ['techStack'],
      },
      {
        id: 'api-cors',
        name: 'CORS Issues',
        description: 'Debug cross-origin request problems',
        template: `I'm getting CORS errors in my {{techStack}} application.

**Frontend URL:** [origin URL]
**API URL:** [API endpoint]
**Request Method:** [method]

**Browser Error:**
\`\`\`
[CORS error message]
\`\`\`

**Current Headers/Config:**
\`\`\`typescript
[current CORS setup]
\`\`\`

Fix this CORS issue with proper headers configuration.`,
        contextFields: ['techStack'],
      },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Debug queries, migrations, and data issues',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    prompts: [
      {
        id: 'db-query',
        name: 'Query Debugging',
        description: 'Fix slow or incorrect queries',
        template: `Debug this {{database}} query issue in my {{techStack}} app.

**Query/ORM Code:**
\`\`\`sql
[your query or ORM code]
\`\`\`

**Expected Result:** [what you expect]
**Actual Result:** [what you're getting]

**Table Schema:**
\`\`\`sql
[relevant table structure]
\`\`\`

**Sample Data:** [describe or provide examples]

Fix this query and optimize for performance.`,
        contextFields: ['database', 'techStack'],
      },
      {
        id: 'db-migration',
        name: 'Migration Issues',
        description: 'Debug migration failures',
        template: `I'm having a {{database}} migration issue.

**Migration Tool:** [Prisma/Drizzle/Supabase/etc]

**Migration Code:**
\`\`\`
[migration file content]
\`\`\`

**Error:**
\`\`\`
[error message]
\`\`\`

**Current State:** [describe current schema]
**Target State:** [describe desired schema]

Fix this migration and ensure data integrity.`,
        contextFields: ['database'],
      },
      {
        id: 'db-performance',
        name: 'Query Performance',
        description: 'Optimize slow database operations',
        template: `This {{database}} query is running slowly in my {{techStack}} app.

**Slow Query:**
\`\`\`sql
[the slow query]
\`\`\`

**Current Execution Time:** [time in ms]
**Target Time:** [target time]

**Table Size:** [approximate row count]
**Existing Indexes:** [list any indexes]

**EXPLAIN Output:**
\`\`\`
[query plan if available]
\`\`\`

Optimize this query with indexes and query rewrites.`,
        contextFields: ['database', 'techStack'],
      },
    ],
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Debug login, sessions, and access control',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    prompts: [
      {
        id: 'auth-session',
        name: 'Session Issues',
        description: 'Debug session persistence problems',
        template: `Debug this {{authentication}} session issue in my {{techStack}} app.

**Auth Provider:** {{authentication}}
**Issue:** [session not persisting/expired/unauthorized]

**Auth Flow:**
1. [step 1]
2. [step 2]
3. [where it breaks]

**Relevant Code:**
\`\`\`typescript
[auth-related code]
\`\`\`

**Environment:**
- Hosting: [Vercel/etc]
- Session Storage: [cookies/localStorage]

**Error/Behavior:** [describe what's happening]

Fix this session issue with proper handling.`,
        contextFields: ['authentication', 'techStack'],
      },
      {
        id: 'auth-middleware',
        name: 'Middleware Auth',
        description: 'Debug route protection issues',
        template: `My middleware authentication isn't working correctly with {{authentication}}.

**Middleware Code:**
\`\`\`typescript
[your middleware code]
\`\`\`

**Protected Routes:** [list of routes]
**Public Routes:** [list of routes]

**Issue:**
- Route: [affected route]
- Expected: [should allow/block]
- Actual: [what's happening]

**Request Headers/Cookies:** [relevant info]

Fix this middleware to properly protect routes.`,
        contextFields: ['authentication'],
      },
      {
        id: 'auth-callback',
        name: 'OAuth Callback',
        description: 'Debug OAuth redirect issues',
        template: `OAuth callback is failing with {{authentication}}.

**Provider:** [Google/GitHub/etc]
**Callback URL:** [your callback URL]

**Callback Handler:**
\`\`\`typescript
[callback route code]
\`\`\`

**Error:**
\`\`\`
[error message or behavior]
\`\`\`

**OAuth Config:** [relevant settings]

Fix this OAuth callback flow.`,
        contextFields: ['authentication'],
      },
    ],
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Debug slow pages, memory leaks, and render issues',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    prompts: [
      {
        id: 'perf-slow-page',
        name: 'Slow Page Load',
        description: 'Debug page performance issues',
        template: `This page is loading slowly in my {{techStack}} app.

**Route:** [page route]
**Page Type:** [Server/Client Component, SSR/SSG]

**Page Code:**
\`\`\`typescript
[page component code]
\`\`\`

**Data Fetching:**
\`\`\`typescript
[data fetching code]
\`\`\`

**Observed Load Time:** [current time]
**Target Load Time:** [target]

**Tried:**
- [optimization 1]
- [optimization 2]

Identify bottlenecks and optimize this page.`,
        contextFields: ['techStack'],
      },
      {
        id: 'perf-renders',
        name: 'Excessive Re-renders',
        description: 'Debug React render issues',
        template: `This component has excessive re-renders in my {{techStack}} app.

**Component:**
\`\`\`typescript
[component code]
\`\`\`

**Parent Component:** [brief description]
**State/Props:** [relevant state/props]

**Symptoms:**
- [ ] UI lag/jank
- [ ] High CPU usage
- [ ] DevTools shows many renders

**Trigger:** [what causes re-renders]

Optimize this component to prevent unnecessary re-renders.`,
        contextFields: ['techStack'],
      },
      {
        id: 'perf-memory',
        name: 'Memory Leak',
        description: 'Debug memory issues',
        template: `I suspect a memory leak in my {{techStack}} app.

**Affected Component/Area:**
\`\`\`typescript
[relevant code]
\`\`\`

**Symptoms:**
- [ ] Memory increases over time
- [ ] Browser tab crashing
- [ ] Performance degrades over time

**When it happens:** [trigger/pattern]
**Memory Profile:** [observations if available]

Find and fix this memory leak with proper cleanup.`,
        contextFields: ['techStack'],
      },
    ],
  },
  {
    id: 'general',
    name: 'General Debug',
    description: 'Debug any error with structured context',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    prompts: [
      {
        id: 'general-error',
        name: 'Error Analysis',
        description: 'Debug any error with context',
        template: `Debug this error in my {{techStack}} application.

**Error Message:**
\`\`\`
[full error and stack trace]
\`\`\`

**Code Causing Error:**
\`\`\`typescript
[relevant code]
\`\`\`

**Steps to Reproduce:**
1. [step 1]
2. [step 2]
3. [error occurs]

**Environment:**
- Node: [version]
- Browser: [if applicable]

**Tried:**
- [attempt 1]
- [attempt 2]

Find the root cause and provide a fix.`,
        contextFields: ['techStack'],
      },
      {
        id: 'general-logic',
        name: 'Logic Bug',
        description: 'Debug incorrect behavior',
        template: `Help me debug this logic issue in my {{techStack}} app.

**Feature:** [what it should do]

**Current Code:**
\`\`\`typescript
[your implementation]
\`\`\`

**Expected Behavior:** [what should happen]
**Actual Behavior:** [what's happening]

**Test Case:**
- Input: [test input]
- Expected Output: [expected]
- Actual Output: [actual]

Fix this logic bug.`,
        contextFields: ['techStack'],
      },
      {
        id: 'general-typescript',
        name: 'TypeScript Error',
        description: 'Fix TypeScript type issues',
        template: `Help me fix this TypeScript error in my {{techStack}} app.

**Error:**
\`\`\`
[TypeScript error message]
\`\`\`

**Code:**
\`\`\`typescript
[code with error]
\`\`\`

**Related Types:**
\`\`\`typescript
[relevant type definitions]
\`\`\`

**What I'm Trying to Do:** [goal]

Fix these types while maintaining type safety.`,
        contextFields: ['techStack'],
      },
    ],
  },
];

function parsePRDContent(content: string): PRDContent {
  const sections: PRDContent = {};

  // Extract tech stack
  const techMatch = content.match(/(?:tech\s*stack|technologies|built\s*with)[:\s]*([^\n]+(?:\n(?![#*])[^\n]+)*)/i);
  if (techMatch) sections.techStack = techMatch[1].trim();

  // Extract database
  const dbMatch = content.match(/(?:database|data\s*storage)[:\s]*([^\n]+)/i);
  if (dbMatch) sections.database = dbMatch[1].trim();

  // Extract authentication
  const authMatch = content.match(/(?:authentication|auth\s*provider|auth)[:\s]*([^\n]+)/i);
  if (authMatch) sections.authentication = authMatch[1].trim();

  // Extract features
  const featuresMatch = content.match(/(?:features|capabilities)[:\s]*([^\n]+(?:\n(?![#*])[^\n]+)*)/i);
  if (featuresMatch) sections.features = featuresMatch[1].trim();

  // Extract integrations
  const intMatch = content.match(/(?:integrations|third.party|external\s*services)[:\s]*([^\n]+(?:\n(?![#*])[^\n]+)*)/i);
  if (intMatch) sections.integrations = intMatch[1].trim();

  return sections;
}

export function DebugPrompts() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DebugCategory | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<DebugPrompt | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [promptsGenerated, setPromptsGenerated] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/prd');
        if (response.ok) {
          const data = await response.json();
          setProjects(data.prds || []);
          if (data.prds?.length > 0) {
            setSelectedProject(data.prds[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Parse PRD content
  const prdContext = useMemo(() => {
    if (!selectedProject) return null;
    return parsePRDContent(selectedProject.content);
  }, [selectedProject]);

  // Generate prompt with context
  const generatePrompt = useCallback((prompt: DebugPrompt) => {
    let template = prompt.template;

    if (prdContext) {
      // Replace context placeholders
      template = template.replace(/\{\{techStack\}\}/g, prdContext.techStack || '[your tech stack]');
      template = template.replace(/\{\{database\}\}/g, prdContext.database || '[your database]');
      template = template.replace(/\{\{authentication\}\}/g, prdContext.authentication || '[your auth provider]');
      template = template.replace(/\{\{features\}\}/g, prdContext.features || '[your features]');
      template = template.replace(/\{\{integrations\}\}/g, prdContext.integrations || '[your integrations]');
    } else {
      // Use placeholders if no project
      template = template.replace(/\{\{techStack\}\}/g, '[your tech stack]');
      template = template.replace(/\{\{database\}\}/g, '[your database]');
      template = template.replace(/\{\{authentication\}\}/g, '[your auth provider]');
      template = template.replace(/\{\{features\}\}/g, '[your features]');
      template = template.replace(/\{\{integrations\}\}/g, '[your integrations]');
    }

    return template;
  }, [prdContext]);

  // Handle prompt selection
  const handlePromptSelect = (prompt: DebugPrompt) => {
    setSelectedPrompt(prompt);
    setGeneratedPrompt(generatePrompt(prompt));
    setPromptsGenerated(prev => prev + 1);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get color classes
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; light: string }> = {
      blue: { bg: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-600', light: 'bg-blue-50' },
      emerald: { bg: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-600', light: 'bg-emerald-50' },
      violet: { bg: 'bg-violet-500', border: 'border-violet-200', text: 'text-violet-600', light: 'bg-violet-50' },
      amber: { bg: 'bg-amber-500', border: 'border-amber-200', text: 'text-amber-600', light: 'bg-amber-50' },
      rose: { bg: 'bg-rose-500', border: 'border-rose-200', text: 'text-rose-600', light: 'bg-rose-50' },
    };
    return colors[color] || colors.amber;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              Pro Tool
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-3">Debug Prompts</h1>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl">
            AI-ready prompt templates that use your project context to debug issues faster.
            Select a category and get instant Claude Code prompts.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{debugCategories.length}</div>
              <div className="text-amber-200 text-sm">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">
                {debugCategories.reduce((acc, cat) => acc + cat.prompts.length, 0)}
              </div>
              <div className="text-amber-200 text-sm">Prompt Templates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{promptsGenerated}</div>
              <div className="text-amber-200 text-sm">Prompts Generated</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{promptsGenerated * 5}m</div>
              <div className="text-amber-200 text-sm">Time Saved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Project Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Context</h3>
              <p className="text-sm text-gray-500">Select a project to auto-fill debug context</p>
            </div>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
            >
              <option value="">No project selected</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Context Pills */}
          {prdContext && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {prdContext.techStack && (
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm">
                  Stack: {prdContext.techStack.slice(0, 30)}...
                </span>
              )}
              {prdContext.database && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                  DB: {prdContext.database.slice(0, 20)}
                </span>
              )}
              {prdContext.authentication && (
                <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                  Auth: {prdContext.authentication.slice(0, 20)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Category Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {debugCategories.map((category) => {
              const colorClasses = getColorClasses(category.color);
              const isSelected = selectedCategory?.id === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : category);
                    setSelectedPrompt(null);
                    setGeneratedPrompt('');
                  }}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? `${colorClasses.border} ${colorClasses.light} shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${category.gradient} text-white`
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{category.description}</p>
                  <div className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${
                    isSelected ? `${colorClasses.text} ${colorClasses.light}` : 'text-gray-400 bg-gray-100'
                  }`}>
                    {category.prompts.length}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Prompts */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedCategory.gradient} text-white flex items-center justify-center`}>
                {selectedCategory.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedCategory.name} Prompts</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedCategory.prompts.map((prompt) => {
                const colorClasses = getColorClasses(selectedCategory.color);
                const isSelected = selectedPrompt?.id === prompt.id;

                return (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptSelect(prompt)}
                    className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? `${colorClasses.border} ${colorClasses.light} shadow-md`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? `bg-gradient-to-br ${selectedCategory.gradient} text-white` : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                        <p className="text-sm text-gray-500">{prompt.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className={`mt-3 text-xs ${colorClasses.text} font-medium`}>
                        Selected - Edit below
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedPrompt ? selectedPrompt.name : 'Prompt Editor'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedPrompt ? 'Edit and customize your debug prompt' : 'Select a category and prompt to get started'}
                  </p>
                </div>
                {selectedPrompt && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${selectedCategory?.gradient} text-white`}>
                    {selectedCategory?.name}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              {selectedPrompt ? (
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="w-full h-[400px] p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Your prompt will appear here..."
                />
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-center">Select a category and prompt<br />to generate a debug template</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedPrompt && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copy for Claude Code
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPrompt(null);
                      setGeneratedPrompt('');
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tips & Workflow */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Debug Actions
              </h3>
              <div className="space-y-2">
                {debugCategories.slice(0, 3).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      handlePromptSelect(cat.prompts[0]);
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all text-left flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.gradient} text-white flex items-center justify-center`}>
                      {cat.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{cat.prompts[0].name}</div>
                      <div className="text-xs text-gray-500">{cat.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pro Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
              <h4 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Debug Pro Tips
              </h4>
              <ul className="space-y-3 text-sm text-amber-700">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Fill in all <code className="bg-amber-100 px-1 rounded">[bracketed]</code> sections with your specific details</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Include full error messages and stack traces for better debugging</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Add relevant code snippets - more context = better answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Describe what you&apos;ve already tried to avoid duplicate suggestions</span>
                </li>
              </ul>
            </div>

            {/* Workflow */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Workflow</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm">1</div>
                  <span className="text-gray-600 text-sm">Select your project for auto-context</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm">2</div>
                  <span className="text-gray-600 text-sm">Choose a debug category</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm">3</div>
                  <span className="text-gray-600 text-sm">Pick a specific prompt template</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-semibold text-sm">4</div>
                  <span className="text-gray-600 text-sm">Fill in the details and copy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm">Paste into Claude Code and debug!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
