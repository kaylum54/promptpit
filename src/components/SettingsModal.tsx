'use client';

import { useState, useEffect } from 'react';
import ModelSelector from './ModelSelector';
import CustomModelModal from './CustomModelModal';
import { type ModelKey, type ModelConfig, getModelKeys } from '@/lib/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: ModelKey[];
  onModelsChange: (models: ModelKey[]) => void;
  customModels?: ModelConfig[];
  onCustomModelsChange?: (models: ModelConfig[]) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModels,
  onModelsChange,
  customModels = [],
  onCustomModelsChange,
}: SettingsModalProps) {
  const [localModels, setLocalModels] = useState<ModelKey[]>(selectedModels);
  const [showCustomModal, setShowCustomModal] = useState(false);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className="relative border border-border-subtle rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-2xl shadow-glow-md animate-scale-in"
          style={{ background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)' }}
        >
          {/* Top glow line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent" />

          {/* Header */}
          <div className="px-6 py-4 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Built-in Models Section */}
            <h3 className="text-sm font-medium text-text-secondary mb-3">Built-in Models</h3>
            <ModelSelector
              selectedModels={localModels}
              onChange={setLocalModels}
              minModels={2}
            />

            {/* Custom Models Section */}
            {onCustomModelsChange && (
              <div className="mt-6 pt-4 border-t border-border-subtle">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-secondary">Custom Models</h3>
                  <button
                    onClick={() => setShowCustomModal(true)}
                    className="flex items-center gap-1.5 text-sm text-accent-primary hover:text-accent-hover transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Model
                  </button>
                </div>

                {customModels.length === 0 ? (
                  <div className="bg-bg-base rounded-lg p-4 text-center">
                    <p className="text-sm text-text-muted">
                      No custom models added yet.
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Add models from OpenRouter to use your own.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customModels.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between bg-bg-base rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: model.color }}
                          />
                          <span className="text-sm text-text-primary">{model.name}</span>
                        </div>
                        <span className="text-xs text-text-muted font-mono">{model.id}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => setShowCustomModal(true)}
                      className="w-full text-center text-sm text-text-muted hover:text-text-secondary py-2 transition-colors"
                    >
                      Manage custom models
                    </button>
                  </div>
                )}
              </div>
            )}

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
                className="px-4 py-2 text-sm font-medium bg-accent-primary text-white rounded-lg hover:bg-accent-hover hover:translate-y-[-1px] transition-all duration-200 shadow-lg hover:shadow-glow-accent"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Model Modal */}
      {onCustomModelsChange && (
        <CustomModelModal
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          customModels={customModels}
          onModelsChange={onCustomModelsChange}
        />
      )}
    </>
  );
}
