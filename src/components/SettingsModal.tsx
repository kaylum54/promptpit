'use client';

import { useState, useEffect } from 'react';
import ModelSelector from './ModelSelector';
import { type ModelKey, getModelKeys } from '@/lib/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: ModelKey[];
  onModelsChange: (models: ModelKey[]) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModels,
  onModelsChange,
}: SettingsModalProps) {
  const [localModels, setLocalModels] = useState<ModelKey[]>(selectedModels);

  // Sync local state when prop changes
  useEffect(() => {
    setLocalModels(selectedModels);
  }, [selectedModels]);

  const handleSave = () => {
    onModelsChange(localModels);
    onClose();
  };

  const handleReset = () => {
    setLocalModels(getModelKeys());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-bg-elevated border border-border-subtle rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-bg-base transition-colors"
            >
              <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          <ModelSelector
            selectedModels={localModels}
            onChange={setLocalModels}
            minModels={2}
          />

          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-muted">
              Choose which AI models will participate in your debates.
              At least 2 models are required for a proper debate.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-bg-base/50 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-base transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
