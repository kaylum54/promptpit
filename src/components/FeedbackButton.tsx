'use client';

import { useState } from 'react';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Fixed position feedback button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="
          fixed bottom-4 right-4 z-40
          w-10 h-10 md:w-12 md:h-12
          rounded-full
          bg-accent-primary text-white
          hover:bg-accent-hover hover:scale-105
          active:scale-95
          shadow-lg hover:shadow-glow-accent
          transition-all duration-200
          flex items-center justify-center
        "
        aria-label="Send feedback"
        title="Send feedback"
      >
        {/* Chat/Speech bubble icon */}
        <svg
          className="w-5 h-5 md:w-6 md:h-6"
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
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
