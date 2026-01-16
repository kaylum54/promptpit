'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function FinalCTASection() {
  const [idea, setIdea] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (idea.trim()) {
      sessionStorage.setItem('initial_idea', idea);
    }
    router.push('/dashboard/prd/new');
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-black">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-cyan-500 rounded-full filter blur-[200px] opacity-10" />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-6">
          Ready to build your next product?
        </h2>
        <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">
          Stop planning in your head. Get a complete blueprint in 30 minutes.
        </p>

        {/* Input */}
        <div className="relative bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your idea..."
            rows={3}
            className="w-full bg-transparent text-black placeholder-gray-400 px-4 py-3 resize-none focus:outline-none text-lg"
          />
          <div className="flex justify-end px-2 pb-2">
            <button
              onClick={handleStart}
              className="bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-200 flex items-center gap-2"
            >
              Start Building
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          First PRD is free. No credit card needed.
        </p>
      </div>
    </section>
  );
}
