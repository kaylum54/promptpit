'use client';

import { useState } from 'react';
import { adminBlueprint } from '@/lib/admin-blueprint';

interface AdminBlueprintProps {
  prdTitle?: string;
}

export function AdminBlueprint({ prdTitle = 'My Project' }: AdminBlueprintProps) {
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    const prompt = adminBlueprint.generatePrompt({ name: prdTitle });
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
            ⚙️
          </div>
          <div>
            <h3 className="text-black font-semibold">Admin Dashboard Blueprint</h3>
            <p className="text-sm text-gray-500">Standard features for your SaaS</p>
          </div>
        </div>
        <button
          onClick={copyPrompt}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${copied ? 'bg-gray-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {copied ? '✓ Copied!' : 'Copy Prompt'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {adminBlueprint.modules.map((module) => (
          <div
            key={module.name}
            className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{module.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded ${module.priority === 'must' ? 'bg-gray-200 text-black' : module.priority === 'should' ? 'bg-gray-100 text-gray-600' : 'bg-gray-500/20 text-gray-600'}`}>
                {module.priority}
              </span>
            </div>
            <h4 className="text-black font-medium mb-2">{module.name}</h4>
            <ul className="space-y-1">
              {module.features.slice(0, 3).map((feature) => (
                <li key={feature.name} className="text-xs text-gray-500">
                  • {feature.name}
                </li>
              ))}
              {module.features.length > 3 && (
                <li className="text-xs text-gray-600">
                  +{module.features.length - 3} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
