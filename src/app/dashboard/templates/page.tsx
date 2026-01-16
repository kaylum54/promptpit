'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type TemplateCategory = 'all' | 'saas' | 'ecommerce' | 'ai' | 'internal';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  features: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  popular?: boolean;
  new?: boolean;
  pitfalls: string[];
  examplePrompts: string[];
}

const categoryLabels: Record<TemplateCategory, string> = {
  all: 'All Templates',
  saas: 'SaaS & Web',
  ecommerce: 'E-commerce',
  ai: 'AI & ML',
  internal: 'Internal Tools',
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingFromTemplate, setCreatingFromTemplate] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = async (template: Template) => {
    setCreatingFromTemplate(template.id);

    try {
      const response = await fetch('/api/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'full',
          template_id: template.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 403) {
          // Not Pro - show upgrade prompt
          alert('Pro subscription required to create PRDs from templates');
          return;
        }
        throw new Error(data.error || 'Failed to create PRD');
      }

      const data = await response.json();

      // Log activity
      await fetch('/api/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'created',
          entity_type: 'prd',
          entity_id: data.prd.id,
          entity_name: data.prd.title,
          details: `Created from ${template.name} template`,
        }),
      });

      // Redirect to PRD builder
      router.push(`/dashboard/prd/${data.prd.id}`);
    } catch (err) {
      console.error('Error creating PRD from template:', err);
      alert(err instanceof Error ? err.message : 'Failed to create PRD');
    } finally {
      setCreatingFromTemplate(null);
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchTemplates()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Templates</h1>
        <p className="text-gray-500 mt-1">Start your project with a pre-built template</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(categoryLabels) as TemplateCategory[]).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{template.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[template.difficulty]}`}>
                        {template.difficulty}
                      </span>
                      {template.popular && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          Popular
                        </span>
                      )}
                      {template.new && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {template.features.slice(0, 4).map((feature) => (
                  <span
                    key={feature}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
                {template.features.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-400 text-xs rounded">
                    +{template.features.length - 4} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Preview
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    Est. {template.estimatedTime}
                  </span>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    disabled={creatingFromTemplate === template.id}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingFromTemplate === template.id && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    Use Template
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Request Template CTA */}
      <div className="mt-12 bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Don&apos;t see what you need?
        </h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">
          We&apos;re always adding new templates. Let us know what you&apos;d like to see.
        </p>
        <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors">
          Request a Template
        </button>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedTemplate.icon}</span>
                <div>
                  <h2 className="font-semibold text-gray-900">{selectedTemplate.name}</h2>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[selectedTemplate.difficulty]}`}>
                    {selectedTemplate.difficulty}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Included Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Example Ideas */}
              {selectedTemplate.examplePrompts.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Example Ideas</h3>
                  <ul className="space-y-2">
                    {selectedTemplate.examplePrompts.map((prompt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {prompt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Pitfalls */}
              {selectedTemplate.pitfalls.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Common Pitfalls to Avoid</h3>
                  <ul className="space-y-2">
                    {selectedTemplate.pitfalls.map((pitfall, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {pitfall}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Estimated Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estimated build time</span>
                  <span className="font-medium text-gray-900">{selectedTemplate.estimatedTime}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  handleUseTemplate(selectedTemplate);
                }}
                disabled={creatingFromTemplate === selectedTemplate.id}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {creatingFromTemplate === selectedTemplate.id && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
