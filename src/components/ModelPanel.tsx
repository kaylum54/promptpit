'use client';

import { useEffect, useRef } from 'react';
import { MODELS, type ModelKey } from '@/lib/models';
import type { DebateResponse } from '@/lib/types';

interface ModelPanelProps {
  modelKey: string;
  response: DebateResponse;
  blindMode?: boolean;
  showIdentity?: boolean;
}

// Get blind mode label (Model A, Model B, etc.)
const getBlindLabel = (key: string): string => {
  const labels: Record<string, string> = {
    claude: 'CONTESTANT A',
    gpt4o: 'CONTESTANT B',
    gemini: 'CONTESTANT C',
    llama: 'CONTESTANT D',
  };
  return labels[key] || 'CONTESTANT ?';
};

// Token estimation function
const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Cost calculation function
const estimateCost = (tokens: number, outputPricePerMillion: number): string => {
  const cost = (tokens / 1_000_000) * outputPricePerMillion;
  if (cost < 0.0001) return '<$0.0001';
  if (cost < 0.01) return '$' + cost.toFixed(4);
  return '$' + cost.toFixed(3);
};

export default function ModelPanel({ modelKey, response, blindMode = false, showIdentity = true }: ModelPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const model = MODELS[modelKey as ModelKey];

  const hideIdentity = blindMode && !showIdentity;
  const displayName = hideIdentity ? getBlindLabel(modelKey) : (model?.name?.toUpperCase() || modelKey.toUpperCase());

  // Auto-scroll during streaming
  useEffect(() => {
    if (response.status === 'streaming' && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [response.content, response.status]);

  const formatLatency = (ms: number): string => {
    return (ms / 1000).toFixed(2) + 's';
  };

  const isStreaming = response.status === 'streaming';
  const isComplete = response.status === 'complete';
  const isError = response.status === 'error';

  return (
    <div
      className={`
        relative flex flex-col min-h-[300px] bg-white
        transition-all duration-300
        ${isStreaming ? 'border-l-2 border-l-black' : ''}
        ${isComplete ? 'border-l-2 border-l-black' : ''}
        ${isError ? 'border-l-2 border-l-gray-400' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {/* Left: Name */}
        <div className="flex items-center gap-3">
          {hideIdentity ? (
            <div className="w-6 h-6 border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs font-display">?</span>
            </div>
          ) : (
            <div className="w-2 h-6 bg-black" />
          )}
          <h3 className="font-display text-lg tracking-wider text-black">
            {displayName}
          </h3>
          {isComplete && (
            <span className="text-xs uppercase tracking-wider text-gray-500">DONE</span>
          )}
          {isStreaming && (
            <span className="text-xs px-2 py-1 bg-black text-white uppercase tracking-wider text-xs">LIVE</span>
          )}
          {hideIdentity && (
            <span className="text-xs text-gray-400 uppercase tracking-wider">HIDDEN</span>
          )}
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-3">
          {response.status === 'complete' && response.content && (
            <>
              <div className="text-xs text-gray-500 font-mono">
                ~{estimateTokens(response.content)} TKN
              </div>
              {model?.pricing && (
                <div className="text-xs text-gray-700 font-mono">
                  {estimateCost(estimateTokens(response.content), model.pricing.output)}
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
        className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto p-4 text-sm text-gray-700 leading-relaxed font-mono bg-gray-50"
      >
        {response.status === 'error' ? (
          <div className="border-2 border-gray-300 p-4 bg-white">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">{'// ERROR'}</p>
            <p className="text-gray-700">{response.error || 'An unknown error occurred'}</p>
          </div>
        ) : response.status === 'idle' ? (
          <div className="text-gray-400 italic text-xs uppercase tracking-wider">
            {'// AWAITING INPUT...'}
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            {response.content}
            {isStreaming && <span className="inline-block w-0.5 h-4 bg-black animate-pulse ml-0.5" />}
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
    <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>
        {status === 'streaming' ? (
          <span className="animate-pulse">---</span>
        ) : latency.total > 0 ? (
          formatLatency(latency.total)
        ) : (
          '---'
        )}
      </span>
    </div>
  );
}
