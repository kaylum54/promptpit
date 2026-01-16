'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { prdTemplates } from '@/lib/prd-templates';
import { UpgradePrompt } from '@/components/marketing/UpgradePrompt';
import { useAuth } from '@/hooks/useAuth';
import type { PRDMode } from '@/lib/types';

// Templates available for free users
const FREE_TEMPLATES = ['saas-starter', 'chrome-extension'];

interface PRDLimits {
  canCreate: boolean;
  used: number;
  limit: number | 'unlimited';
  resetDate: string | null;
  isLoggedIn: boolean;
}

export default function NewPRDPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [selectedMode, setSelectedMode] = useState<PRDMode | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limits, setLimits] = useState<PRDLimits | null>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);

  const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

  const isTemplateAvailable = (templateId: string) => {
    return isPro || FREE_TEMPLATES.includes(templateId);
  };

  useEffect(() => {
    async function checkLimits() {
      try {
        const res = await fetch('/api/prd/limits');
        if (res.ok) {
          const data = await res.json();
          setLimits(data);
        }
      } catch (err) {
        console.error('Error checking limits:', err);
      } finally {
        setIsCheckingLimits(false);
      }
    }
    checkLimits();
  }, []);

  async function handleCreate() {
    if (!selectedMode) return;
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          template_id: selectedTemplate,
          title: projectName || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create PRD');
      }

      const data = await response.json();
      router.push(`/dashboard/prd/${data.prd.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsCreating(false);
    }
  }

  if (isCheckingLimits) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-gray-900 rounded-full" />
      </div>
    );
  }

  if (limits && !limits.canCreate) {
    return (
      <UpgradePrompt
        limits={{
          used: limits.used,
          limit: typeof limits.limit === 'number' ? limits.limit : 999,
          resetDate: limits.resetDate ? new Date(limits.resetDate) : null,
        }}
      />
    );
  }

  const selectedTemplateData = selectedTemplate
    ? prdTemplates.find(t => t.id === selectedTemplate)
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Start a New Project
          </h1>
          <p className="text-gray-500 text-lg">
            Choose how you want to begin building
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Quick PRD */}
            <ModeCard
              selected={selectedMode === 'quick'}
              onClick={() => setSelectedMode('quick')}
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              }
              title="Quick PRD"
              duration="~10 minutes"
              phases={4}
              description="Streamlined process for MVPs and simple projects. Get a buildable spec fast."
              features={[
                'Core features definition',
                'Basic architecture decisions',
                'Database schema',
                'Claude Code prompt',
              ]}
            />

            {/* Full Build Plan */}
            <ModeCard
              selected={selectedMode === 'full'}
              onClick={() => setSelectedMode('full')}
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              }
              title="Full Build Plan"
              duration="~30 minutes"
              phases={6}
              description="Comprehensive specification with cost estimates, security planning, and deployment strategy."
              features={[
                'Everything in Quick PRD',
                'AI model debates on decisions',
                'Cost estimation & budgeting',
                'Security considerations',
                'Deployment planning',
                'Final review by multiple AIs',
              ]}
              recommended
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FAFAFA] px-4 text-sm text-gray-400">
              or start from a template
            </span>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Blank option */}
            <TemplateCard
              id="blank"
              name="Blank"
              icon="plus"
              selected={selectedTemplate === null}
              onClick={() => setSelectedTemplate(null)}
              locked={false}
            />

            {/* Template options from prdTemplates */}
            {prdTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                id={template.id}
                name={template.name}
                icon={getIconName(template.category)}
                selected={selectedTemplate === template.id}
                onClick={() => setSelectedTemplate(
                  selectedTemplate === template.id ? null : template.id
                )}
                locked={!isTemplateAvailable(template.id)}
                pro={!FREE_TEMPLATES.includes(template.id)}
              />
            ))}
          </div>
        </div>

        {/* Template Preview */}
        {selectedTemplateData && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                  <TemplateIcon name={getIconName(selectedTemplateData.category)} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTemplateData.name}</h3>
                  <p className="text-sm text-gray-500">{selectedTemplateData.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Default Features */}
              {selectedTemplateData.default_features?.v1 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Pre-configured Features</h4>
                  <ul className="space-y-2">
                    {selectedTemplateData.default_features.v1.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech Stack */}
              {selectedTemplateData.default_tech_stack && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Suggested Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplateData.default_tech_stack.frontend && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {selectedTemplateData.default_tech_stack.frontend.framework}
                      </span>
                    )}
                    {selectedTemplateData.default_tech_stack.database && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {selectedTemplateData.default_tech_stack.database.provider}
                      </span>
                    )}
                    {selectedTemplateData.default_tech_stack.auth && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {selectedTemplateData.default_tech_stack.auth.provider}
                      </span>
                    )}
                    {selectedTemplateData.suggested_integrations?.slice(0, 2).map((integration, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Create Section */}
        {selectedMode && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="max-w-md mx-auto">
              {/* Project Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full py-4 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Start {selectedMode === 'quick' ? 'Quick PRD' : 'Full Build Plan'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>

              {/* Selected info */}
              <p className="text-center text-sm text-gray-400 mt-4">
                {selectedTemplate
                  ? `Using "${prdTemplates.find(t => t.id === selectedTemplate)?.name}" template`
                  : 'Starting from scratch'
                }
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Mode Card Component
interface ModeCardProps {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  duration: string;
  phases: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

function ModeCard({
  selected,
  onClick,
  icon,
  title,
  duration,
  phases,
  description,
  features,
  recommended
}: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative text-left
        bg-white rounded-2xl p-6
        border-2 transition-all duration-200
        ${selected
          ? 'border-gray-900 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
          Recommended
        </div>
      )}

      {/* Selection Indicator */}
      <div className={`
        absolute top-4 right-4 w-6 h-6 rounded-full
        flex items-center justify-center
        transition-all duration-200
        ${selected
          ? 'bg-gray-900'
          : 'border-2 border-gray-200'
        }
      `}>
        {selected && (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div className={`
        w-14 h-14 rounded-xl
        flex items-center justify-center
        mb-5
        transition-colors duration-200
        ${selected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}
      `}>
        {icon}
      </div>

      {/* Title & Meta */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {duration}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{phases} phases</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm mb-5 leading-relaxed">
        {description}
      </p>

      {/* Features List */}
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selected ? 'text-gray-900' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </button>
  );
}

// Template Card Component
interface TemplateCardProps {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
  locked: boolean;
  pro?: boolean;
}

function TemplateCard({ name, icon, selected, onClick, locked, pro }: TemplateCardProps) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`
        relative text-left
        bg-white rounded-xl p-4
        border transition-all duration-200
        ${locked
          ? 'opacity-60 cursor-not-allowed border-gray-100'
          : selected
            ? 'border-gray-900 shadow-md'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      {/* Pro Badge */}
      {pro && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-[10px] font-semibold rounded-full shadow-sm">
          PRO
        </div>
      )}

      {/* Selection Check */}
      {selected && !locked && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* Icon */}
      <div className={`
        w-10 h-10 rounded-lg
        flex items-center justify-center
        mb-3
        ${locked ? 'bg-gray-50 text-gray-300' : selected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}
      `}>
        <TemplateIcon name={icon} />
      </div>

      {/* Name */}
      <h4 className={`font-medium text-sm ${locked ? 'text-gray-400' : 'text-gray-900'}`}>
        {name}
      </h4>

      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl">
          <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      )}
    </button>
  );
}

// Template Icon Component
function TemplateIcon({ name }: { name: string }) {
  const className = "w-5 h-5";

  const icons: Record<string, React.ReactNode> = {
    plus: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    saas: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
    marketplace: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
    social: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    tool: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    api: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    extension: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
      </svg>
    ),
    ai: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  };

  return icons[name] || icons.plus;
}

// Helper to map template category to icon name
function getIconName(category: string): string {
  const mapping: Record<string, string> = {
    saas: 'saas',
    marketplace: 'marketplace',
    social: 'social',
    tool: 'tool',
    api: 'api',
    extension: 'extension',
    ai: 'ai',
  };
  return mapping[category] || 'plus';
}
