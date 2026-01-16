'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface PRDContent {
  techStack?: string;
  features?: string;
  database?: string;
  authentication?: string;
  projectName?: string;
}

interface Project {
  id: string;
  name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface LaunchItem {
  id: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  claudePrompt: string;
}

interface LaunchCategory {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  color: string;
  gradient: string;
  items: LaunchItem[];
}

const launchCategories: LaunchCategory[] = [
  {
    id: 'pre-launch',
    name: 'Pre-Launch',
    description: 'Core features and testing before going live',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-500',
    items: [
      {
        id: 'pre-1',
        name: 'Complete all core features',
        description: 'Ensure MVP features are implemented and tested',
        priority: 'critical',
        claudePrompt: `Review my {{techStack}} application and verify all core features are working:

**Features to verify:**
{{features}}

**For each feature, check:**
1. Happy path works correctly
2. Error states are handled
3. Edge cases are covered
4. Loading states are implemented

List any incomplete features or bugs found.`,
      },
      {
        id: 'pre-2',
        name: 'Run security audit',
        description: 'Check for vulnerabilities and security issues',
        priority: 'critical',
        claudePrompt: `Perform a security audit on my {{techStack}} application.

**Check for:**
- SQL injection vulnerabilities
- XSS attack vectors
- CSRF protection
- Authentication bypass
- Sensitive data exposure
- Insecure dependencies

**Tech Stack:** {{techStack}}
**Auth:** {{authentication}}
**Database:** {{database}}

Provide a prioritized list of security issues to fix before launch.`,
      },
      {
        id: 'pre-3',
        name: 'Test on multiple devices',
        description: 'Verify responsiveness on mobile, tablet, and desktop',
        priority: 'high',
        claudePrompt: `Review my {{techStack}} application for responsive design issues.

**Check:**
- Mobile viewport (320px - 480px)
- Tablet viewport (768px - 1024px)
- Desktop viewport (1024px+)
- Touch targets are at least 44x44px
- Text is readable without zooming
- No horizontal scrolling

Identify any responsive design issues that need fixing.`,
      },
      {
        id: 'pre-4',
        name: 'Set up error monitoring',
        description: 'Configure Sentry, LogRocket, or similar tool',
        priority: 'high',
        claudePrompt: `Help me set up error monitoring for my {{techStack}} application.

**Requirements:**
- Capture uncaught exceptions
- Track API errors
- Log user context
- Set up alerts for critical errors
- Configure source maps

Provide implementation code for error monitoring integration.`,
      },
      {
        id: 'pre-5',
        name: 'Configure analytics',
        description: 'Set up tracking for key events and conversions',
        priority: 'medium',
        claudePrompt: `Help me set up analytics for my {{techStack}} application.

**Track these events:**
- Page views
- User sign-ups
- Key feature usage
- Conversion events
- Error occurrences

Provide implementation code for analytics tracking.`,
      },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Server, database, and deployment setup',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-500',
    items: [
      {
        id: 'infra-1',
        name: 'Set up production environment',
        description: 'Configure servers and environment variables',
        priority: 'critical',
        claudePrompt: `Help me set up a production environment for my {{techStack}} application.

**Requirements:**
- Production server configuration
- Environment variables management
- Secure secrets handling
- Performance optimization settings
- Logging configuration

Provide a production deployment checklist and configuration.`,
      },
      {
        id: 'infra-2',
        name: 'Configure SSL/HTTPS',
        description: 'Ensure all traffic is encrypted',
        priority: 'critical',
        claudePrompt: `Help me configure SSL/HTTPS for my {{techStack}} application.

**Requirements:**
- SSL certificate setup
- Force HTTPS redirects
- HSTS headers
- Secure cookie configuration

Provide implementation steps for SSL configuration.`,
      },
      {
        id: 'infra-3',
        name: 'Set up database backups',
        description: 'Configure automated daily backups',
        priority: 'critical',
        claudePrompt: `Help me set up database backups for my {{database}} database.

**Requirements:**
- Automated daily backups
- Backup retention policy (30 days)
- Backup verification
- Restore procedure documentation
- Off-site backup storage

Provide backup configuration and scripts.`,
      },
      {
        id: 'infra-4',
        name: 'Configure CDN',
        description: 'Set up CDN for static assets',
        priority: 'medium',
        claudePrompt: `Help me configure a CDN for my {{techStack}} application.

**Requirements:**
- Static asset caching
- Image optimization
- Cache invalidation strategy
- Geographic distribution

Provide CDN configuration steps.`,
      },
      {
        id: 'infra-5',
        name: 'Set up uptime monitoring',
        description: 'Configure alerts for downtime',
        priority: 'high',
        claudePrompt: `Help me set up uptime monitoring for my application.

**Requirements:**
- Health check endpoints
- Alert notifications (email, Slack)
- Response time monitoring
- SSL certificate expiry alerts
- Status page setup

Provide implementation steps for monitoring.`,
      },
    ],
  },
  {
    id: 'legal',
    name: 'Legal & Compliance',
    description: 'Privacy, terms, and regulatory compliance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
    color: 'violet',
    gradient: 'from-violet-500 to-purple-500',
    items: [
      {
        id: 'legal-1',
        name: 'Privacy Policy',
        description: 'Create and publish privacy policy page',
        priority: 'critical',
        claudePrompt: `Help me create a privacy policy for my {{techStack}} application.

**Data we collect:**
- User account information
- Usage analytics
- Cookies

**Third-party services:**
{{techStack}}

Generate a GDPR/CCPA compliant privacy policy template.`,
      },
      {
        id: 'legal-2',
        name: 'Terms of Service',
        description: 'Create and publish terms of service page',
        priority: 'critical',
        claudePrompt: `Help me create terms of service for my application.

**Include:**
- User responsibilities
- Acceptable use policy
- Intellectual property rights
- Limitation of liability
- Termination conditions
- Dispute resolution

Generate a comprehensive terms of service template.`,
      },
      {
        id: 'legal-3',
        name: 'Cookie consent',
        description: 'Implement GDPR-compliant cookie banner',
        priority: 'high',
        claudePrompt: `Help me implement a cookie consent banner for my {{techStack}} application.

**Requirements:**
- GDPR compliant
- Granular cookie preferences
- Remember user choice
- Block tracking until consent

Provide implementation code for a cookie consent banner.`,
      },
      {
        id: 'legal-4',
        name: 'Accessibility compliance',
        description: 'Ensure WCAG 2.1 AA compliance',
        priority: 'medium',
        claudePrompt: `Audit my {{techStack}} application for accessibility compliance.

**Check for:**
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Focus indicators
- Alt text for images
- Form labels

Provide a list of accessibility issues and fixes.`,
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Landing page, SEO, and launch promotion',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    color: 'amber',
    gradient: 'from-amber-500 to-orange-500',
    items: [
      {
        id: 'mktg-1',
        name: 'Set up landing page',
        description: 'Create compelling landing page with clear CTA',
        priority: 'high',
        claudePrompt: `Help me create a landing page for my application.

**Include:**
- Hero section with value proposition
- Feature highlights
- Social proof / testimonials
- Clear call-to-action
- FAQ section

**Tech Stack:** {{techStack}}

Provide landing page component code.`,
      },
      {
        id: 'mktg-2',
        name: 'Configure SEO basics',
        description: 'Meta tags, sitemap, robots.txt, Open Graph',
        priority: 'high',
        claudePrompt: `Help me configure SEO for my {{techStack}} application.

**Requirements:**
- Title and meta description tags
- Open Graph tags for social sharing
- Twitter Card tags
- Sitemap.xml generation
- robots.txt configuration
- Structured data (JSON-LD)

Provide implementation code for SEO configuration.`,
      },
      {
        id: 'mktg-3',
        name: 'Prepare launch announcement',
        description: 'Draft blog post, social media, and email',
        priority: 'medium',
        claudePrompt: `Help me prepare a launch announcement for my application.

**Create:**
- Blog post draft
- Twitter/X thread
- LinkedIn post
- Email to subscribers
- Product Hunt description

Generate compelling launch content.`,
      },
      {
        id: 'mktg-4',
        name: 'Set up email list',
        description: 'Configure newsletter signup and welcome sequence',
        priority: 'medium',
        claudePrompt: `Help me set up email marketing for my {{techStack}} application.

**Requirements:**
- Email signup form
- Welcome email sequence (3 emails)
- Email template design
- Unsubscribe handling
- Double opt-in

Provide implementation code and email templates.`,
      },
    ],
  },
  {
    id: 'post-launch',
    name: 'Post-Launch',
    description: 'Monitoring and feedback after going live',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500',
    items: [
      {
        id: 'post-1',
        name: 'Monitor error rates',
        description: 'Watch for spikes in errors after launch',
        priority: 'critical',
        claudePrompt: `Help me set up error rate monitoring for my {{techStack}} application.

**Requirements:**
- Error rate dashboards
- Alert thresholds
- Error categorization
- Trend analysis
- Incident response playbook

Provide monitoring configuration and alert rules.`,
      },
      {
        id: 'post-2',
        name: 'Set up feedback channel',
        description: 'Enable users to report bugs and suggest features',
        priority: 'high',
        claudePrompt: `Help me implement a feedback system for my {{techStack}} application.

**Requirements:**
- In-app feedback widget
- Bug report form
- Feature request collection
- User satisfaction surveys
- Feedback triage process

Provide implementation code for feedback collection.`,
      },
      {
        id: 'post-3',
        name: 'Track key metrics',
        description: 'Monitor user engagement and conversions',
        priority: 'high',
        claudePrompt: `Help me set up key metrics tracking for my application.

**Track:**
- Daily/Weekly/Monthly active users
- User retention rates
- Feature adoption rates
- Conversion funnel
- Churn indicators

Provide analytics dashboard setup and queries.`,
      },
    ],
  },
];

function parsePRDContent(content: string): PRDContent {
  const sections: PRDContent = {};

  const techMatch = content.match(/(?:tech\s*stack|technologies|built\s*with)[:\s]*([^\n]+(?:\n(?![#*])[^\n]+)*)/i);
  if (techMatch) sections.techStack = techMatch[1].trim();

  const dbMatch = content.match(/(?:database|data\s*storage)[:\s]*([^\n]+)/i);
  if (dbMatch) sections.database = dbMatch[1].trim();

  const authMatch = content.match(/(?:authentication|auth\s*provider|auth)[:\s]*([^\n]+)/i);
  if (authMatch) sections.authentication = authMatch[1].trim();

  const featuresMatch = content.match(/(?:features|capabilities)[:\s]*([^\n]+(?:\n(?![#*])[^\n]+)*)/i);
  if (featuresMatch) sections.features = featuresMatch[1].trim();

  return sections;
}

export function LaunchChecklist() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<LaunchCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<LaunchItem | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
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
  const generatePrompt = useCallback((item: LaunchItem) => {
    let template = item.claudePrompt;

    if (prdContext) {
      template = template.replace(/\{\{techStack\}\}/g, prdContext.techStack || '[your tech stack]');
      template = template.replace(/\{\{database\}\}/g, prdContext.database || '[your database]');
      template = template.replace(/\{\{authentication\}\}/g, prdContext.authentication || '[your auth provider]');
      template = template.replace(/\{\{features\}\}/g, prdContext.features || '[your features]');
    } else {
      template = template.replace(/\{\{techStack\}\}/g, '[your tech stack]');
      template = template.replace(/\{\{database\}\}/g, '[your database]');
      template = template.replace(/\{\{authentication\}\}/g, '[your auth provider]');
      template = template.replace(/\{\{features\}\}/g, '[your features]');
    }

    return template;
  }, [prdContext]);

  // Handle item selection
  const handleItemSelect = (item: LaunchItem) => {
    setSelectedItem(item);
    setGeneratedPrompt(generatePrompt(item));
  };

  // Toggle checked
  const toggleChecked = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
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

  // Calculate stats
  const stats = useMemo(() => {
    const allItems = launchCategories.flatMap(cat => cat.items);
    const criticalItems = allItems.filter(item => item.priority === 'critical');
    const criticalCompleted = criticalItems.filter(item => checkedItems.has(item.id)).length;
    const totalCompleted = checkedItems.size;

    return {
      total: allItems.length,
      completed: totalCompleted,
      criticalTotal: criticalItems.length,
      criticalCompleted,
      readyToLaunch: criticalCompleted === criticalItems.length,
      progress: Math.round((criticalCompleted / criticalItems.length) * 100),
    };
  }, [checkedItems]);

  // Category progress
  const getCategoryProgress = (category: LaunchCategory) => {
    const completed = category.items.filter(item => checkedItems.has(item.id)).length;
    const critical = category.items.filter(item => item.priority === 'critical');
    const criticalCompleted = critical.filter(item => checkedItems.has(item.id)).length;
    return {
      completed,
      total: category.items.length,
      criticalCompleted,
      criticalTotal: critical.length,
      allCriticalDone: criticalCompleted === critical.length,
    };
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
    return colors[color] || colors.emerald;
  };

  // Priority config
  const priorityConfig = {
    critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-200' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`text-white ${stats.readyToLaunch
        ? 'bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500'
        : 'bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
              Pro Tool
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-3">Launch Checklist</h1>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl">
            {stats.readyToLaunch
              ? "You're ready for launch! All critical items are complete."
              : "Complete all critical items before launch. Get Claude Code prompts to help with each task."
            }
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.progress}%</div>
              <div className="text-emerald-200 text-sm">Launch Ready</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.criticalCompleted}/{stats.criticalTotal}</div>
              <div className="text-emerald-200 text-sm">Critical Done</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.completed}/{stats.total}</div>
              <div className="text-emerald-200 text-sm">Total Completed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{launchCategories.length}</div>
              <div className="text-emerald-200 text-sm">Categories</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-white transition-all duration-500"
                style={{ width: `${stats.progress}%` }}
              />
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
              <p className="text-sm text-gray-500">Select a project to auto-fill launch checklist context</p>
            </div>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find(p => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
            >
              <option value="">No project selected</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {prdContext && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {prdContext.techStack && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                  Stack: {prdContext.techStack.slice(0, 30)}...
                </span>
              )}
              {prdContext.database && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {launchCategories.map((category) => {
              const colorClasses = getColorClasses(category.color);
              const progress = getCategoryProgress(category);
              const isSelected = selectedCategory?.id === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? null : category);
                    setSelectedItem(null);
                    setGeneratedPrompt('');
                  }}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? `${colorClasses.border} ${colorClasses.light} shadow-lg`
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all ${
                    progress.allCriticalDone
                      ? 'bg-green-100 text-green-600'
                      : isSelected
                        ? `bg-gradient-to-br ${category.gradient} text-white`
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                  }`}>
                    {progress.allCriticalDone ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      category.icon
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                  <p className="text-xs text-gray-500">{progress.completed}/{progress.total} done</p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${progress.allCriticalDone ? 'bg-green-500' : `bg-gradient-to-r ${category.gradient}`}`}
                      style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    />
                  </div>
                  {progress.criticalTotal > 0 && (
                    <div className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${
                      progress.allCriticalDone ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}>
                      {progress.criticalCompleted}/{progress.criticalTotal}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Category Items */}
        {selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedCategory.gradient} text-white flex items-center justify-center`}>
                {selectedCategory.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedCategory.name} Checklist</h3>
            </div>

            <div className="space-y-3">
              {selectedCategory.items.map((item) => {
                const isChecked = checkedItems.has(item.id);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-emerald-300 shadow-md'
                        : isChecked
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-4 flex items-start gap-4">
                      <button
                        onClick={() => toggleChecked(item.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-emerald-400'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className={`font-medium ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </h4>
                            <p className={`text-sm mt-0.5 ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded border flex-shrink-0 ${priorityConfig[item.priority].color}`}>
                            {priorityConfig[item.priority].label}
                          </span>
                        </div>

                        {!isChecked && (
                          <button
                            onClick={() => handleItemSelect(item)}
                            className={`mt-3 text-sm font-medium flex items-center gap-1 transition-colors ${
                              isSelected
                                ? 'text-emerald-600'
                                : 'text-gray-500 hover:text-emerald-600'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Get Claude Code Prompt
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Prompt Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedItem ? selectedItem.name : 'Claude Code Prompt'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedItem ? 'Copy this prompt to complete the checklist item' : 'Select a checklist item to generate a prompt'}
                  </p>
                </div>
                {selectedItem && (
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${priorityConfig[selectedItem.priority].color}`}>
                    {priorityConfig[selectedItem.priority].label}
                  </span>
                )}
              </div>
            </div>

            <div className="p-4">
              {selectedItem ? (
                <textarea
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="w-full h-[350px] p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Your prompt will appear here..."
                />
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <p className="text-center">Select a category and checklist item<br />to generate a Claude Code prompt</p>
                </div>
              )}
            </div>

            {selectedItem && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg shadow-emerald-500/25'
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
                      setSelectedItem(null);
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

          {/* Tips & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Critical Items Remaining
              </h3>
              <div className="space-y-2">
                {launchCategories.flatMap(cat =>
                  cat.items.filter(item => item.priority === 'critical' && !checkedItems.has(item.id))
                ).slice(0, 3).map((item) => {
                  const category = launchCategories.find(cat => cat.items.some(i => i.id === item.id))!;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCategory(category);
                        handleItemSelect(item);
                      }}
                      className="w-full p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.gradient} text-white flex items-center justify-center`}>
                        {category.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{item.name}</div>
                        <div className="text-xs text-gray-500">{category.name}</div>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                        Critical
                      </span>
                    </button>
                  );
                })}
                {launchCategories.flatMap(cat =>
                  cat.items.filter(item => item.priority === 'critical' && !checkedItems.has(item.id))
                ).length === 0 && (
                  <div className="text-center py-4 text-green-600">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="font-medium">All critical items complete!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Tips */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
              <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Launch Tips
              </h4>
              <ul className="space-y-3 text-sm text-emerald-700">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Complete all <strong>critical</strong> items before launching</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Use Claude Code prompts to help complete each item</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Test thoroughly on the day before launch</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Have a rollback plan ready in case of issues</span>
                </li>
              </ul>
            </div>

            {/* Workflow */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Workflow</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">1</div>
                  <span className="text-gray-600 text-sm">Select your project for context</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">2</div>
                  <span className="text-gray-600 text-sm">Pick a launch category</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">3</div>
                  <span className="text-gray-600 text-sm">Get Claude Code prompt for each item</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-semibold text-sm">4</div>
                  <span className="text-gray-600 text-sm">Mark items complete as you go</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-semibold text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <span className="text-gray-600 text-sm">Launch when all critical items done!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
