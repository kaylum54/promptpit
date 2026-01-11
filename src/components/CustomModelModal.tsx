'use client';

import { useState, useEffect } from 'react';
import { type ModelConfig } from '@/lib/models';

interface CustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  customModels: ModelConfig[];
  onModelsChange: (models: ModelConfig[]) => void;
}

const AVAILABLE_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

export default function CustomModelModal({
  isOpen,
  onClose,
  customModels,
  onModelsChange,
}: CustomModelModalProps) {
  const [name, setName] = useState('');
  const [modelId, setModelId] = useState('');
  const [color, setColor] = useState(AVAILABLE_COLORS[0].value);
  const [error, setError] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setModelId('');
      setColor(AVAILABLE_COLORS[0].value);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = () => {
    // Validate inputs
    if (!name.trim()) {
      setError('Model name is required');
      return;
    }
    if (!modelId.trim()) {
      setError('Model ID is required');
      return;
    }

    // Check for duplicate
    if (customModels.some(m => m.id === modelId.trim())) {
      setError('A model with this ID already exists');
      return;
    }

    // Create new model config
    const newModel: ModelConfig = {
      id: modelId.trim(),
      name: name.trim(),
      color: color,
      description: `Custom model: ${modelId.trim()}`,
    };

    // Add to list
    onModelsChange([...customModels, newModel]);

    // Reset form
    setName('');
    setModelId('');
    setColor(AVAILABLE_COLORS[0].value);
    setError('');
  };

  const handleRemove = (id: string) => {
    onModelsChange(customModels.filter(m => m.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative border border-border rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-lg shadow-glow-md animate-scale-in"
        style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <h2 className="text-lg font-semibold text-text-primary">Custom Models</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Info banner */}
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-text-secondary">
              Add custom models from OpenRouter. You can find model IDs at{' '}
              <a
                href="https://openrouter.ai/models"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                openrouter.ai/models
              </a>
            </p>
          </div>

          {/* Add new model form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., GPT-4 Turbo"
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:shadow-glow-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                OpenRouter Model ID
              </label>
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="e.g., openai/gpt-4-turbo"
                className="w-full bg-bg-elevated border border-border rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary focus:shadow-glow-accent transition-all font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-bg-surface' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg p-3 shadow-[0_0_15px_rgba(239,68,68,0.15)]">{error}</p>
            )}

            <button
              onClick={handleAdd}
              className="w-full bg-accent-primary hover:bg-accent-hover hover:translate-y-[-1px] text-white font-medium py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-glow-accent"
            >
              Add Model
            </button>
          </div>

          {/* Custom models list */}
          {customModels.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Your Custom Models</h3>
              <div className="space-y-2">
                {customModels.map((model) => (
                  <div
                    key={model.id}
                    className="flex items-center justify-between bg-bg-elevated border border-border rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <div>
                        <p className="text-text-primary font-medium">{model.name}</p>
                        <p className="text-text-muted text-xs font-mono">{model.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(model.id)}
                      className="text-text-muted hover:text-error transition-colors"
                      title="Remove model"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-bg-base/50">
          <button
            onClick={onClose}
            className="w-full bg-bg-elevated hover:bg-bg-surface text-text-primary font-medium py-2.5 rounded-lg transition-all duration-200 border border-border hover:border-border-strong"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
