export interface DebugTemplate {
  label: string;
  category: string;
  promptTemplate: string;
}

export const debugTemplates: Record<string, DebugTemplate> = {
  auth_error: {
    label: 'Authentication Error',
    category: 'auth',
    promptTemplate: `I'm implementing authentication for my project.

**Tech Stack:** {stack}
**What I'm trying to do:** {goal}
**Error message:**
\`\`\`
{error}
\`\`\`

**Relevant code:**
\`\`\`
{code}
\`\`\`

Help me debug this authentication issue.`,
  },
  api_error: {
    label: 'API Route Error',
    category: 'api',
    promptTemplate: `I'm building an API route and getting an error.

**Tech Stack:** {stack}
**Endpoint:** {endpoint}
**Error message:**
\`\`\`
{error}
\`\`\`

**Route code:**
\`\`\`
{code}
\`\`\`

Help me fix this API error.`,
  },
  database_error: {
    label: 'Database Query Error',
    category: 'database',
    promptTemplate: `I'm having issues with a database query.

**Database:** {database}
**Query/Operation:** {operation}
**Error message:**
\`\`\`
{error}
\`\`\`

**Relevant code:**
\`\`\`
{code}
\`\`\`

Help me debug this database issue.`,
  },
  ui_bug: {
    label: 'UI/Component Bug',
    category: 'frontend',
    promptTemplate: `I have a UI bug in my component.

**Framework:** {framework}
**Component:** {component}
**Expected behavior:** {expected}
**Actual behavior:** {actual}

**Component code:**
\`\`\`
{code}
\`\`\`

Help me fix this UI issue.`,
  },
  deployment_error: {
    label: 'Deployment Error',
    category: 'deployment',
    promptTemplate: `I'm getting an error during deployment.

**Platform:** {platform}
**Build command:** {command}
**Error log:**
\`\`\`
{error}
\`\`\`

Help me fix this deployment issue.`,
  },
  performance: {
    label: 'Performance Issue',
    category: 'optimization',
    promptTemplate: `I have a performance issue in my application.

**Tech Stack:** {stack}
**Area:** {area}
**Symptoms:** {symptoms}

**Relevant code:**
\`\`\`
{code}
\`\`\`

Help me optimize this for better performance.`,
  },
};

export function generateDebugPrompt(
  prd: { title?: string; tech_stack?: string },
  templateKey: string,
  errorContext: string
): string {
  const template = debugTemplates[templateKey];
  if (!template) return '';

  const stack = prd.tech_stack || 'Next.js + Supabase';

  let prompt = template.promptTemplate
    .replace('{stack}', stack)
    .replace('{framework}', 'React/Next.js')
    .replace('{database}', 'Supabase/PostgreSQL')
    .replace('{error}', errorContext || '[Paste error here]')
    .replace('{code}', '[Paste relevant code here]')
    .replace('{goal}', '[Describe what you\'re trying to achieve]')
    .replace('{endpoint}', '[e.g., POST /api/users]')
    .replace('{operation}', '[e.g., SELECT, INSERT, UPDATE]')
    .replace('{component}', '[Component name]')
    .replace('{expected}', '[What should happen]')
    .replace('{actual}', '[What actually happens]')
    .replace('{platform}', '[e.g., Vercel, Railway]')
    .replace('{command}', '[e.g., npm run build]')
    .replace('{area}', '[e.g., page load, API response]')
    .replace('{symptoms}', '[e.g., slow load times, high memory usage]');

  if (prd.title) {
    prompt = `**Project:** ${prd.title}\n\n${prompt}`;
  }

  return prompt;
}
