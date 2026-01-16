'use client';

import { useState, useEffect } from 'react';

interface ModelConfig {
  key: string;
  id: string;
  name: string;
  provider: string;
}

interface ComparisonResult {
  model: string;
  modelName: string;
  provider: string;
  output: string;
  tokens: number;
  latency: number;
  error?: string;
  rating?: number;
}

const providerColors: Record<string, string> = {
  'OpenAI': 'bg-green-500',
  'Anthropic': 'bg-orange-500',
  'Google': 'bg-blue-500',
  'Meta': 'bg-purple-500',
};

export default function AIComparePage() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch('/api/ai-compare');
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
          // Default to first two models
          if (data.models.length >= 2) {
            setSelectedModels([data.models[0].key, data.models[1].key]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      }
    }
    fetchModels();
  }, []);

  const toggleModel = (modelKey: string) => {
    if (selectedModels.includes(modelKey)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(m => m !== modelKey));
      }
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelKey]);
    }
  };

  const handleCompare = async () => {
    if (!prompt.trim() || selectedModels.length < 2) return;

    setIsComparing(true);
    setResults([]);
    setError(null);

    try {
      const response = await fetch('/api/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          models: selectedModels,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to compare models');
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsComparing(false);
    }
  };

  const rateResult = (model: string, rating: number) => {
    setResults(results.map(r =>
      r.model === model ? { ...r, rating } : r
    ));
  };

  const getModelConfig = (key: string) => models.find(m => m.key === key);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">PRO</span>
          <h1 className="text-2xl font-semibold text-gray-900">AI Compare</h1>
        </div>
        <p className="text-gray-500">Compare responses from different AI models side by side</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {/* Model Selection */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Select Models ({selectedModels.length}/4)
            </label>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showModelSelector ? 'Hide' : 'Change Models'}
            </button>
          </div>

          {/* Selected Models Pills */}
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedModels.map(modelKey => {
              const config = getModelConfig(modelKey);
              if (!config) return null;
              return (
                <span
                  key={modelKey}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                >
                  <span className={`w-2 h-2 rounded-full ${providerColors[config.provider] || 'bg-gray-500'}`} />
                  {config.name}
                  <button
                    onClick={() => toggleModel(modelKey)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={selectedModels.length <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>

          {/* Model Selector Grid */}
          {showModelSelector && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-lg">
              {models.map(model => (
                <button
                  key={model.key}
                  onClick={() => toggleModel(model.key)}
                  disabled={!selectedModels.includes(model.key) && selectedModels.length >= 4}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedModels.includes(model.key)
                      ? 'border-gray-900 bg-white'
                      : 'border-gray-200 bg-white hover:border-gray-300 disabled:opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${providerColors[model.provider] || 'bg-gray-500'}`} />
                    <span className="font-medium text-sm text-gray-900">{model.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{model.provider}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to compare how different AI models respond..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none transition-colors resize-none"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Compare Button */}
        <button
          onClick={handleCompare}
          disabled={!prompt.trim() || selectedModels.length < 2 || isComparing}
          className="w-full sm:w-auto px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isComparing ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Comparing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Compare Models
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Results</h2>

          <div className={`grid gap-6 ${
            results.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
            results.length === 3 ? 'grid-cols-1 lg:grid-cols-3' :
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-4'
          }`}>
            {results.map((result) => (
              <div
                key={result.model}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Model Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${providerColors[result.provider] || 'bg-gray-500'}`} />
                    <span className="font-medium text-gray-900">{result.modelName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{result.tokens} tokens</span>
                    <span>{(result.latency / 1000).toFixed(1)}s</span>
                  </div>
                </div>

                {/* Output */}
                <div className="p-4 max-h-80 overflow-y-auto">
                  {result.error ? (
                    <p className="text-sm text-red-600">{result.error}</p>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {result.output}
                    </p>
                  )}
                </div>

                {/* Rating Footer */}
                {!result.error && (
                  <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rate this response</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => rateResult(result.model, star)}
                          className={`p-1 transition-colors ${
                            result.rating && star <= result.rating
                              ? 'text-amber-400'
                              : 'text-gray-300 hover:text-amber-300'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="font-medium text-gray-900 mb-4">Comparison Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-4 font-medium text-gray-500">Model</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-500">Provider</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-500">Tokens</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-500">Latency</th>
                    <th className="text-left py-2 pl-4 font-medium text-gray-500">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.model} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${providerColors[result.provider] || 'bg-gray-500'}`} />
                          <span className="font-medium text-gray-900">{result.modelName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{result.provider}</td>
                      <td className="py-3 px-4 text-gray-600">{result.tokens}</td>
                      <td className="py-3 px-4 text-gray-600">{(result.latency / 1000).toFixed(2)}s</td>
                      <td className="py-3 pl-4">
                        {result.rating ? (
                          <span className="text-amber-500">{result.rating}/5</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !isComparing && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to compare</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter a prompt above and select at least 2 AI models to see how they respond differently to the same input.
          </p>
        </div>
      )}
    </div>
  );
}
