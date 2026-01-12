'use client';

interface SuggestedPromptsProps {
  arena: 'debate' | 'code' | 'writing';
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS_BY_ARENA = {
  debate: [
    "Is free will an illusion?",
    "Should AI have legal rights?",
    "Is democracy the best form of government?",
    "Can war ever be justified?",
    "Is privacy dead in the digital age?",
  ],
  code: [
    "Implement a LRU cache",
    "Reverse a linked list",
    "Design a rate limiter",
    "Implement binary search",
    "Build a simple event emitter",
  ],
  writing: [
    "Write the opening paragraph of a thriller",
    "Describe a city waking up at dawn",
    "Write a dialogue between two old friends reuniting",
    "Craft a twist ending in under 100 words",
    "Write a letter from the future to the past",
  ],
};

export default function SuggestedPrompts({ arena, onSelectPrompt }: SuggestedPromptsProps) {
  const prompts = PROMPTS_BY_ARENA[arena];

  return (
    <div className="mt-4">
      <p className="text-sm text-text-tertiary mb-3">Try one of these:</p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="text-sm text-text-secondary bg-bg-surface border border-border rounded-full px-4 py-2 hover:text-text-primary hover:border-border-strong hover:bg-bg-elevated transition-all duration-200"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
