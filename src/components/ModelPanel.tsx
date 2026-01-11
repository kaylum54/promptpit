'use client';

import { useEffect, useRef } from 'react';
import { MODELS, type ModelKey } from '@/lib/models';
import type { DebateResponse } from '@/lib/types';
import ModelIcon from '@/components/ModelIcon';

interface ModelPanelProps {
  modelKey: string;
  response: DebateResponse;
  blindMode?: boolean;
  showIdentity?: boolean;
}

// Get border color for model
const getModelBorderColor = (key: string, isBlind: boolean): string => {
  if (isBlind) return '#6b7280'; // Gray when blind
  const colorMap: Record<string, string> = {
    claude: '#f59e0b',
    gpt4o: '#10b981',
    gemini: '#8b5cf6',
    llama: '#06b6d4',
  };
  return colorMap[key] || '#3b82f6';
};

// Get blind mode label (Model A, Model B, etc.)
const getBlindLabel = (key: string): string => {
  const labels: Record<string, string> = {
    claude: 'Model A',
    gpt4o: 'Model B',
    gemini: 'Model C',
    llama: 'Model D',
  };
  return labels[key] || 'Model ?';
};

// Token estimation function
const estimateTokens = (text: string): number => {
  // Industry standard estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
};

// Cost calculation function (for output tokens only, input is minimal)
const estimateCost = (tokens: number, outputPricePerMillion: number): string => {
  const cost = (tokens / 1_000_000) * outputPricePerMillion;
  if (cost < 0.0001) return '<$0.0001';
  if (cost < 0.01) return '$' + cost.toFixed(4);
  return '$' + cost.toFixed(3);
};

export default function ModelPanel({ modelKey, response, blindMode = false, showIdentity = true }: ModelPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const model = MODELS[modelKey as ModelKey];

  // Determine if we should hide identity
  const hideIdentity = blindMode && !showIdentity;
  const modelColor = getModelBorderColor(modelKey, hideIdentity);
  const displayName = hideIdentity ? getBlindLabel(modelKey) : (model?.name || modelKey);

  // Auto-scroll during streaming
  useEffect(() => {
    if (response.status === 'streaming' && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [response.content, response.status]);

  // Format latency for display (ms to seconds)
  const formatLatency = (ms: number): string => {
    return (ms / 1000).toFixed(2) + 's';
  };

  // Determine panel state
  const isStreaming = response.status === 'streaming';
  const isComplete = response.status === 'complete';
  const isError = response.status === 'error';

  return (
    <div
      className={`
        relative overflow-hidden flex flex-col min-h-[300px] rounded-xl
        border transition-all duration-300
        ${isComplete ? 'shadow-lg' : ''}
        ${isError ? 'border-error' : 'border-[var(--border-default)]'}
      `}
      style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
        borderColor: isStreaming ? modelColor : undefined,
        boxShadow: isStreaming ? `0 0 20px ${modelColor}40, 0 0 40px ${modelColor}20` : undefined,
        animation: isStreaming ? 'streaming-glow 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Colored top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: isError ? '#ef4444' : modelColor,
        }}
      />

      {/* Corner accent glow */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${modelColor}15 0%, transparent 70%)`,
        }}
      />
      {/* Header Bar */}
      <div
        className="relative z-10 flex items-center justify-between border-b border-[var(--border-subtle)]"
        style={{
          padding: '14px 18px',
          background: 'linear-gradient(180deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
        }}
      >
        {/* Left: Icon + Name */}
        <div className="flex items-center gap-2.5">
          {hideIdentity ? (
            <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-xs text-white font-bold">?</span>
            </div>
          ) : (
            /* Model icon (colored dot) */
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: modelColor,
                boxShadow: `0 0 8px ${modelColor}`,
              }}
            />
          )}
          <h3
            className="text-[15px] font-semibold text-text-primary"
            style={{ letterSpacing: '0.01em' }}
          >
            {displayName}
          </h3>
          {/* Complete checkmark */}
          {isComplete && (
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          {/* Blind mode indicator */}
          {hideIdentity && (
            <span className="text-xs text-text-muted bg-bg-elevated px-2 py-0.5 rounded">
              Hidden
            </span>
          )}
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-2">
          {response.status === 'complete' && response.content && (
            <>
              <div className="inline-flex items-center gap-1 bg-bg-elevated border border-border rounded-full px-2 py-1">
                <svg className="w-3 h-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="font-mono text-xs text-text-secondary">
                  ~{estimateTokens(response.content)} tokens
                </span>
              </div>
              {model?.pricing && (
                <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-1">
                  <span className="font-mono text-xs text-green-400">
                    {estimateCost(estimateTokens(response.content), model.pricing.output)}
                  </span>
                </div>
              )}
            </>
          )}
          <LatencyBadge
            status={response.status}
            latency={response.latency}
            formatLatency={formatLatency}
          />
        </div>
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className="relative z-10 flex-1 min-h-[200px] max-h-[400px] overflow-y-auto p-4 text-[15px] text-text-secondary leading-relaxed"
      >
        {response.status === 'error' ? (
          <div className="text-error bg-error/10 rounded-lg p-4 border border-error/20">
            <p className="font-medium mb-1 text-sm">Error</p>
            <p className="text-error/80 text-sm">{response.error || 'An unknown error occurred'}</p>
          </div>
        ) : response.status === 'idle' ? (
          <div className="text-text-muted italic text-sm">Waiting for prompt...</div>
        ) : (
          <div className="whitespace-pre-wrap">
            {response.content}
            {/* Streaming cursor */}
            {isStreaming && <span className="streaming-cursor" />}
          </div>
        )}
      </div>
    </div>
  );
}

// Latency Badge Component
interface LatencyBadgeProps {
  status: DebateResponse['status'];
  latency: DebateResponse['latency'];
  formatLatency: (ms: number) => string;
}

function LatencyBadge({ status, latency, formatLatency }: LatencyBadgeProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-md"
      style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border-default)',
        borderRadius: '6px',
        padding: '4px 10px',
      }}
    >
      {/* Clock icon */}
      <svg className="w-3 h-3 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <span className="font-mono text-xs text-text-secondary">
        {status === 'streaming' ? (
          <span className="animate-pulse">...</span>
        ) : latency.total > 0 ? (
          formatLatency(latency.total)
        ) : (
          '...'
        )}
      </span>
    </div>
  );
}
