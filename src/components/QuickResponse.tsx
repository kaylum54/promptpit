'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ModelKey } from '@/lib/routing';

// Model colors matching the app's color scheme
const modelColors: Record<ModelKey, string> = {
  claude: '#000000',
  gpt: '#4b5563',
  gemini: '#6b7280',
  llama: '#9ca3af',
};

// Category icons
const categoryIcons: Record<string, string> = {
  writing: '✍️',
  code: '💻',
  research: '🔍',
  analysis: '📊',
  general: '💬',
};

interface QuickResponseProps {
  routing: {
    model: ModelKey;
    modelName: string;
    reason: string;
    category: string;
    confidence: number;
  };
  response: string;
  isStreaming: boolean;
  onExpand: () => void;
  onTryDifferent: () => void;
  onCopy: () => void;
}

export default function QuickResponse({
  routing,
  response,
  isStreaming,
  onExpand,
  onTryDifferent,
  onCopy,
}: QuickResponseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modelColor = modelColors[routing.model] || '#6b7280';
  const categoryIcon = categoryIcons[routing.category] || '💬';

  return (
    <div className="bg-white border-2 border-black  overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm font-semibold text-black">Quick Response</span>
          </div>
          <span className="text-lg" title={routing.category}>
            {categoryIcon}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: modelColor }}
          />
          <span className="text-sm text-gray-500">
            Routed to <span className="font-medium text-black">{routing.modelName}</span>
          </span>
          {isStreaming && (
            <div className="flex items-center gap-1.5 ml-2">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-xs text-gray-400">Streaming...</span>
            </div>
          )}
        </div>
      </div>

      {/* Response Content */}
      <div className="px-5 py-5">
        <div className="prose  prose-sm max-w-none">
          <ReactMarkdown
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match;

                if (isInline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-gray-50 text-black text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative group my-4">
                    <SyntaxHighlighter
                      style={oneLight}
                      language={match[1]}
                      PreTag="div"
                      className=" \!bg-gray-100 !p-4 text-sm overflow-x-auto"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(String(children));
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded bg-white/80 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy code"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                );
              },
              p({ children }) {
                return <p className="text-black leading-relaxed mb-4 last:mb-0">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside space-y-1 mb-4 text-black">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside space-y-1 mb-4 text-black">{children}</ol>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold text-black mt-6 mb-3">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-semibold text-black mt-5 mb-2">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold text-black mt-4 mb-2">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-black pl-4 italic text-gray-500 my-4">
                    {children}
                  </blockquote>
                );
              },
            }}
          >
            {response}
          </ReactMarkdown>
          {isStreaming && <span className="inline-block w-2 h-5 bg-black animate-pulse ml-0.5" />}
        </div>
      </div>

      {/* Why this model section */}
      <div className="flex items-center gap-2 px-5 py-3 bg-white border-t border-gray-200">
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <span className="text-xs text-gray-400">
          Why {routing.modelName}? <span className="text-gray-500">{routing.reason}</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-gray-200">
        <button
          onClick={onExpand}
          disabled={isStreaming}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black  text-sm text-gray-500 hover:bg-gray-50 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Expand to Debate</span>
        </button>

        <button
          onClick={handleCopy}
          disabled={isStreaming || !response}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black  text-sm text-gray-500 hover:bg-gray-50 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <svg
                className="w-4 h-4 text-gray-900"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          onClick={onTryDifferent}
          disabled={isStreaming}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-black  text-sm text-gray-500 hover:bg-gray-50 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>Try Different Model</span>
        </button>
      </div>
    </div>
  );
}
