'use client';

import { useEffect, useRef } from 'react';
import { MODELS, type ModelKey } from '@/lib/models';
import type { DebateResponse } from '@/lib/types';
import ModelIcon from '@/components/ModelIcon';

interface ModelPanelProps {
  modelKey: string;
  response: DebateResponse;
}

// Get border color for model
const getModelBorderColor = (key: string): string => {
  const colorMap: Record<string, string> = {
    claude: '#f59e0b',
    gpt4o: '#10b981',
    gemini: '#8b5cf6',
    llama: '#06b6d4',
  };
  return colorMap[key] || '#3b82f6';
};

export default function ModelPanel({ modelKey, response }: ModelPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const model = MODELS[modelKey as ModelKey];
  const borderColor = getModelBorderColor(modelKey);

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

  // Build className string
  const panelClasses = [
    'bg-bg-surface border border-border rounded-lg overflow-hidden flex flex-col min-h-[300px]',
    isStreaming ? 'animate-streaming-pulse' : '',
    isComplete ? 'shadow-lg' : '',
    isError ? 'border-error' : '',
    'transition-all duration-300',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={panelClasses}
      style={{
        borderTopWidth: '2px',
        borderTopColor: isError ? '#ef4444' : borderColor,
      }}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-bg-subtle border-b border-border-subtle">
        {/* Left: Icon + Name */}
        <div className="flex items-center gap-2.5">
          <ModelIcon modelKey={modelKey as ModelKey} size="sm" />
          <h3
            className="font-semibold text-base"
            style={{ color: borderColor }}
          >
            {model?.name || modelKey}
          </h3>
          {/* Complete checkmark */}
          {isComplete && (
            <svg className="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Right: Latency Badge */}
        <LatencyBadge
          status={response.status}
          latency={response.latency}
          formatLatency={formatLatency}
        />
      </div>

      {/* Content Area */}
      <div
        ref={contentRef}
        className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto p-4 text-[15px] text-text-secondary leading-relaxed"
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
    <div className="inline-flex items-center gap-1.5 bg-bg-elevated border border-border rounded-full px-2.5 py-1">
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
