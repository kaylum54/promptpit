'use client';

import { useState, useEffect } from 'react';
import { MODELS, type ModelKey, getModelKeys } from '@/lib/models';

interface ModelSelectorProps {
  selectedModels: ModelKey[];
  onChange: (models: ModelKey[]) => void;
  minModels?: number;
}

export default function ModelSelector({
  selectedModels,
  onChange,
  minModels = 2
}: ModelSelectorProps) {
  const allModels = getModelKeys();

  const handleToggle = (key: ModelKey) => {
    if (selectedModels.includes(key)) {
      // Don't allow deselecting if we're at minimum
      if (selectedModels.length <= minModels) return;
      onChange(selectedModels.filter(k => k !== key));
    } else {
      onChange([...selectedModels, key]);
    }
  };

  const isDisabled = (key: ModelKey) => {
    return selectedModels.includes(key) && selectedModels.length <= minModels;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-secondary">Select Models</h4>
        <span className="text-xs text-text-muted">
          {selectedModels.length} of {allModels.length} selected (min {minModels})
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {allModels.map((key) => {
          const model = MODELS[key];
          const isSelected = selectedModels.includes(key);
          const disabled = isDisabled(key);

          return (
            <button
              key={key}
              onClick={() => handleToggle(key)}
              disabled={disabled}
              className={`
                relative p-3 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? 'border-accent-primary bg-accent-primary/10'
                  : 'border-border-subtle bg-bg-base hover:border-border-default'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: model.color }}
                />
                <span className="font-medium text-text-primary">{model.name}</span>
              </div>
              <p className="text-xs text-text-muted mt-1 line-clamp-2">
                {model.description}
              </p>

              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
