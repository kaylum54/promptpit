'use client';

interface PRDPhaseCompleteProps {
  phase: number;
  phaseName: string;
  nextPhase: number;
  nextPhaseName: string;
  summary: string[];
  onContinue: () => void;
}

export function PRDPhaseComplete({
  phase,
  phaseName,
  nextPhase,
  nextPhaseName,
  summary,
  onContinue,
}: PRDPhaseCompleteProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div className="flex-1 max-w-2xl">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-4 bg-green-50 border-b border-green-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-green-800">Phase {phase} Complete: {phaseName}</h4>
            </div>
          </div>

          <div className="p-5">
            <h5 className="text-sm font-medium text-gray-900 mb-3">What we defined:</h5>
            <ul className="space-y-2 mb-6">
              {summary.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={onContinue}
              className="
                w-full py-3 rounded-xl
                bg-black text-white
                font-medium text-sm
                hover:bg-gray-800
                transition-colors
                flex items-center justify-center gap-2
              "
            >
              Continue to Phase {nextPhase}: {nextPhaseName}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for inline use
interface PRDPhaseCompleteBadgeProps {
  phase: number;
  phaseName: string;
}

export function PRDPhaseCompleteBadge({ phase, phaseName }: PRDPhaseCompleteBadgeProps) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-gray-200" />
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium text-green-700">
          Phase {phase}: {phaseName} completed
        </span>
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
