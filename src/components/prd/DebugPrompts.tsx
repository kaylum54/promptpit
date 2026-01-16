'use client';

import { useState } from 'react';
import { debugTemplates, generateDebugPrompt } from '@/lib/debug-prompts';

interface DebugPromptsProps {
  prdTitle?: string;
  techStack?: string;
}

export function DebugPrompts({ prdTitle, techStack }: DebugPromptsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [errorContext, setErrorContext] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!selectedTemplate) return;

    const prompt = generateDebugPrompt(
      { title: prdTitle, tech_stack: techStack },
      selectedTemplate,
      errorContext
    );
    setGeneratedPrompt(prompt);
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
          🐛
        </div>
        <div>
          <h3 className="text-black font-semibold">Debug Prompts</h3>
          <p className="text-sm text-gray-500">Context-aware debugging help</p>
        </div>
      </div>

      {/* Template selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 mb-2 block">What&apos;s the issue?</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(debugTemplates).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-3 rounded-lg text-left text-sm transition-colors ${selectedTemplate === key ? 'bg-gray-100 border border-gray-400 text-black' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-gray-300'}`}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error context input */}
      {selectedTemplate && (
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">
            Paste your error message or describe the issue:
          </label>
          <textarea
            value={errorContext}
            onChange={(e) => setErrorContext(e.target.value)}
            rows={4}
            className="w-full bg-gray-50 text-black rounded-lg p-4 border border-gray-200 focus:border-gray-400 focus:outline-none resize-none font-mono text-sm"
            placeholder="Paste error message here..."
          />
          <button
            onClick={handleGenerate}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
          >
            Generate Debug Prompt
          </button>
        </div>
      )}

      {/* Generated prompt */}
      {generatedPrompt && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-600">Generated prompt:</label>
            <button
              onClick={copyPrompt}
              className={`text-sm transition-colors ${copied ? 'text-green-600' : 'text-gray-600 hover:text-black'}`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-xs text-gray-700 overflow-auto max-h-64 font-mono whitespace-pre-wrap">
            {generatedPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
