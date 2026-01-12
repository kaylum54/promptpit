'use client';

// Step data for How It Works section
const steps = [
  {
    number: 1,
    title: "Enter Your Prompt",
    description: "Ask any question or give any task"
  },
  {
    number: 2,
    title: "4 AIs Respond",
    description: "Watch all models answer simultaneously"
  },
  {
    number: 3,
    title: "Judge Decides",
    description: "AI judge evaluates and picks a winner"
  }
];

// Competitor data
const competitors = [
  {
    name: "Claude",
    model: "Sonnet 4",
    provider: "Anthropic",
    color: "#f59e0b",
  },
  {
    name: "GPT-4o",
    model: "",
    provider: "OpenAI",
    color: "#10b981",
  },
  {
    name: "Gemini",
    model: "2.0 Flash",
    provider: "Google",
    color: "#8b5cf6",
  },
  {
    name: "Llama",
    model: "3.3 70B",
    provider: "Meta",
    color: "#06b6d4",
  }
];

// Use case data
const useCases = [
  {
    icon: "🏛️",
    title: "Legal Questions",
    description: "Compare how models explain contracts, compliance, and intellectual property"
  },
  {
    icon: "💰",
    title: "Financial Decisions",
    description: "Get multiple perspectives on investments, tax strategies, and business planning"
  },
  {
    icon: "🏗️",
    title: "Technical Architecture",
    description: "Evaluate stack choices, trade-offs, and implementation approaches"
  },
  {
    icon: "📝",
    title: "Content Creation",
    description: "Find the voice, tone, and style that fits your brand"
  },
  {
    icon: "🎓",
    title: "Learning & Explanation",
    description: "Different explanations help concepts click — find what works for you"
  },
  {
    icon: "🔬",
    title: "Research & Synthesis",
    description: "Compare depth and accuracy when exploring complex topics"
  }
];

function HowItWorks() {
  return (
    <section className="text-center py-12 px-6 border-b border-border-subtle">
      <h2 className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase mb-8">
        How It Works
      </h2>

      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center gap-6">
            <div className="bg-bg-surface border border-border rounded-xl p-6 text-center min-w-[140px]">
              <div className="w-8 h-8 bg-bg-elevated border border-border-strong rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-semibold text-text-primary">
                {step.number}
              </div>
              <h3 className="text-[15px] font-semibold text-text-primary mb-1">
                {step.title}
              </h3>
              <p className="text-[13px] text-text-tertiary">
                {step.description}
              </p>
            </div>

            {index < steps.length - 1 && (
              <span className="text-text-muted text-xl hidden md:block">→</span>
            )}
            {index < steps.length - 1 && (
              <span className="text-text-muted text-xl md:hidden rotate-90">→</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-[15px] text-text-secondary max-w-[500px] mx-auto leading-relaxed">
        Your prompt runs against four leading AI models simultaneously. A specialist AI judge evaluates each response and declares a winner.
      </p>
    </section>
  );
}

function Competitors() {
  return (
    <section className="text-center py-12 px-6 border-b border-border-subtle">
      <h2 className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase mb-8">
        The Competitors
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-[700px] mx-auto">
        {competitors.map((competitor) => (
          <div
            key={competitor.name}
            className="bg-bg-surface border border-border rounded-xl p-5 text-center relative overflow-hidden"
          >
            {/* Colored top border */}
            <div
              className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
              style={{ backgroundColor: competitor.color }}
            />

            {/* Color dot icon */}
            <div
              className="w-6 h-6 rounded-full mx-auto mb-2"
              style={{ backgroundColor: competitor.color }}
            />

            <h3 className="text-base font-bold text-text-primary mb-0.5">
              {competitor.name}
            </h3>
            <p className="text-[13px] font-medium text-text-secondary mb-1 min-h-[18px]">
              {competitor.model}
            </p>
            <p className="text-xs text-text-muted">
              {competitor.provider}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function UseCases() {
  return (
    <section className="py-12 px-6 border-b border-border-subtle">
      <h2 className="text-xs font-semibold tracking-[0.15em] text-text-muted uppercase text-center mb-8">
        Why Use PromptPit?
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[700px] mx-auto">
        {useCases.map((useCase) => (
          <div
            key={useCase.title}
            className="bg-bg-surface border border-border rounded-xl p-5 transition-all duration-150 hover:bg-bg-elevated hover:border-border-strong"
          >
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xl">{useCase.icon}</span>
              <h3 className="text-[15px] font-semibold text-text-primary">
                {useCase.title}
              </h3>
            </div>
            <p className="text-[13px] text-text-secondary leading-relaxed">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomepageExplainer() {
  return (
    <div className="max-w-content mx-auto">
      <HowItWorks />
      <Competitors />
      <UseCases />
    </div>
  );
}
