'use client';

import { useEffect, useRef } from 'react';
import type { ModelKey } from '@/lib/routing';

interface Model {
  id: ModelKey;
  name: string;
  subname: string;
  color: string;
  description: string;
}

const models: Model[] = [
  {
    id: 'claude',
    name: 'Claude',
    subname: 'Sonnet 4',
    color: '#f59e0b',
    description: 'Excels at writing, analysis, and nuanced tasks',
  },
  {
    id: 'gpt',
    name: 'GPT-4o',
    subname: '',
    color: '#10b981',
    description: 'Strong at code, reasoning, and general tasks',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    subname: '2.0 Flash',
    color: '#8b5cf6',
    description: 'Fast and capable for research and factual queries',
  },
  {
    id: 'llama',
    name: 'Llama',
    subname: '3.3 70B',
    color: '#06b6d4',
    description: 'Open-source powerhouse with broad capabilities',
  },
];

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (model: ModelKey) => void;
  currentModel: ModelKey;
}

export default function ModelSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentModel,
}: ModelSelectorModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Try a Different Model</h3>
            <p className="text-sm text-text-tertiary mt-0.5">
              Select a model to regenerate the response
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Model Options */}
        <div className="p-4 space-y-2">
          {models.map((model) => {
            const isCurrent = model.id === currentModel;

            return (
              <button
                key={model.id}
                onClick={() => {
                  if (!isCurrent) {
                    onSelect(model.id);
                    onClose();
                  }
                }}
                disabled={isCurrent}
                className={`
                  w-full flex items-start gap-4 p-4 rounded-lg text-left transition-all
                  ${
                    isCurrent
                      ? 'bg-bg-elevated border-2 border-border-strong cursor-default'
                      : 'bg-bg-base border border-border hover:bg-bg-elevated hover:border-border-strong cursor-pointer'
                  }
                `}
              >
                {/* Model color indicator */}
                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: model.color }}
                >
                  {isCurrent && (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Model info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-primary">{model.name}</span>
                    {model.subname && (
                      <span className="text-sm text-text-secondary">{model.subname}</span>
                    )}
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-accent-primary/10 text-accent-primary rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">{model.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border-subtle bg-bg-base">
          <p className="text-xs text-text-muted text-center">
            Your preference will be remembered for future routing
          </p>
        </div>
      </div>
    </div>
  );
}
