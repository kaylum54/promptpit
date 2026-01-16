'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PRD, PRDReview } from '@/lib/types';

interface PRDOutputViewProps {
  prd: PRD;
  reviews: PRDReview[];
  onTriggerReviews: () => Promise<void>;
}

export function PRDOutputView({ prd, reviews, onTriggerReviews }: PRDOutputViewProps) {
  const [activeTab, setActiveTab] = useState<'prd' | 'prompt' | 'schema' | 'reviews'>('prd');
  const [copied, setCopied] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTriggerReviews = async () => {
    setIsLoadingReviews(true);
    try {
      await onTriggerReviews();
      setActiveTab('reviews');
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const prdContent = prd.prd_markdown || '';
  const promptContent = prd.claude_code_prompt || '';
  const schemaContent = prd.database_schema || '';

  const prdLineCount = prdContent.split('\n').length;
  const promptLineCount = promptContent.split('\n').length;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Project Name */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/prd"
                className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold text-gray-900">{prd.title || 'Untitled PRD'}</h1>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    Complete
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {prd.mode === 'quick' ? 'Quick PRD' : 'Full Build Plan'}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/prd/${prd.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Edit PRD
              </Link>
              <button
                onClick={() => handleCopy(activeTab === 'prd' ? prdContent : activeTab === 'prompt' ? promptContent : schemaContent)}
                disabled={activeTab === 'reviews'}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Success Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your PRD is Ready!</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {prdLineCount} lines · Ready to build with Claude Code
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Export PDF
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Export Markdown
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50">
            {[
              { id: 'prd', label: 'Full PRD', count: prdLineCount },
              { id: 'prompt', label: 'Claude Code Prompt', count: promptLineCount },
              ...(schemaContent ? [{ id: 'schema', label: 'Database Schema' }] : []),
              { id: 'reviews', label: 'AI Reviews', count: reviews.length || undefined },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`
                  px-5 py-3 text-sm font-medium
                  border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-black text-gray-900 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`
                    ml-2 px-1.5 py-0.5 rounded text-xs
                    ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'prd' && (
              <div className="bg-gray-50 rounded-xl border border-gray-100 max-h-[600px] overflow-y-auto">
                <pre className="p-6 text-sm text-gray-700 font-mono whitespace-pre-wrap">
                  {prdContent || 'No PRD content generated yet.'}
                </pre>
              </div>
            )}

            {activeTab === 'prompt' && (
              <div className="space-y-4">
                <div className="bg-gray-900 rounded-xl max-h-[600px] overflow-y-auto">
                  <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {promptContent || 'No prompt content generated yet.'}
                  </pre>
                </div>
                <button
                  onClick={() => handleCopy(promptContent)}
                  className="
                    w-full py-3 rounded-xl
                    bg-black text-white
                    font-medium text-sm
                    hover:bg-gray-800
                    transition-colors
                    flex items-center justify-center gap-2
                  "
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy to Claude Code
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'schema' && schemaContent && (
              <div className="bg-gray-900 rounded-xl max-h-[600px] overflow-y-auto">
                <pre className="p-6 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                  {schemaContent}
                </pre>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Get GPT-4o and Gemini to review your PRD for blind spots and improvements
                    </p>
                    <button
                      onClick={handleTriggerReviews}
                      disabled={isLoadingReviews}
                      className="px-6 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isLoadingReviews ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Getting Reviews...
                        </span>
                      ) : (
                        'Get AI Reviews'
                      )}
                    </button>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setActiveTab('prompt');
              setTimeout(() => handleCopy(promptContent), 100);
            }}
            className="p-6 bg-white rounded-2xl border border-gray-200 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Copy Claude Code Prompt</h3>
            <p className="text-sm text-gray-500">Ready to paste into Claude Code to start building</p>
          </button>

          <button
            onClick={() => {/* Export PDF logic */}}
            className="p-6 bg-white rounded-2xl border border-gray-200 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Export as PDF</h3>
            <p className="text-sm text-gray-500">Share with stakeholders or save for reference</p>
          </button>

          <button
            onClick={() => reviews.length === 0 ? handleTriggerReviews() : setActiveTab('reviews')}
            className="p-6 bg-white rounded-2xl border border-gray-200 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center mb-4 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              {reviews.length > 0 ? 'View AI Reviews' : 'Get AI Reviews'}
            </h3>
            <p className="text-sm text-gray-500">
              {reviews.length > 0
                ? `${reviews.length} reviews from multiple AI models`
                : 'Get feedback from GPT-4o and Gemini'}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: PRDReview }) {
  const modelName = review.model === 'gpt' ? 'GPT-4o' : review.model === 'gemini' ? 'Gemini' : review.model;
  const scoreColor = review.overall_score >= 8
    ? 'text-green-600 bg-green-100'
    : review.overall_score >= 6
      ? 'text-amber-600 bg-amber-100'
      : 'text-red-600 bg-red-100';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-lg">
              {review.model === 'gpt' ? '🤖' : '✨'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{modelName} Review</h4>
            <p className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-lg font-bold ${scoreColor}`}>
          {review.overall_score}/10
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Strengths */}
        {review.strengths.length > 0 && (
          <div>
            <h5 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Strengths
            </h5>
            <ul className="space-y-2">
              {review.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-green-500 mt-1">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {review.concerns.length > 0 && (
          <div>
            <h5 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-3">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Areas for Improvement
            </h5>
            <div className="space-y-3">
              {review.concerns.map((concern, i) => {
                const severityStyles = {
                  high: 'bg-red-50 border-red-200 text-red-800',
                  medium: 'bg-amber-50 border-amber-200 text-amber-800',
                  low: 'bg-blue-50 border-blue-200 text-blue-800',
                };
                const severityBadge = {
                  high: 'bg-red-500 text-white',
                  medium: 'bg-amber-500 text-white',
                  low: 'bg-blue-500 text-white',
                };
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${severityStyles[concern.severity]}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <span className="text-xs text-gray-500 bg-white/50 px-2 py-0.5 rounded">
                        {concern.section}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${severityBadge[concern.severity]}`}>
                        {concern.severity}
                      </span>
                    </div>
                    <p className="font-medium mb-2">{concern.issue}</p>
                    <p className="text-sm opacity-80">
                      <span className="font-medium">Suggestion:</span> {concern.suggestion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {review.summary && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">
              &quot;{review.summary}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
