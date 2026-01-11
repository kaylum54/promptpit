// Model types
export interface ModelConfig {
  id: string;
  name: string;
  color: string;
}

// Debate types
export interface DebateResponse {
  model: string;
  content: string;
  latency: {
    ttft: number;  // time to first token in ms
    total: number; // total time in ms
  };
  status: 'idle' | 'streaming' | 'complete' | 'error';
  error?: string;
}

// SSE event types for /api/debate
export type DebateStreamEvent =
  | { type: 'chunk'; model: string; content: string }
  | { type: 'model_complete'; model: string; latency: { ttft: number; total: number } }
  | { type: 'all_complete'; responses: Record<string, string> }
  | { type: 'error'; model: string; error: string };

// Judge types
export interface JudgeScore {
  score: number;
  rationale: string;
}

export interface ModelScores {
  reasoning?: JudgeScore;
  clarity?: JudgeScore;
  persuasiveness?: JudgeScore;
}

export interface JudgeVerdict {
  winner: string;
  verdict: string;
  highlight: string;
}

// SSE event types for /api/judge
export type JudgeStreamEvent =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'tool_call'; tool: string; input: any }
  | { type: 'scoring'; model: string; category: string; score: number; rationale: string }
  | { type: 'verdict'; winner: string; verdict: string; highlight: string }
  | { type: 'complete'; scores: Record<string, ModelScores>; verdict: JudgeVerdict };

// Database types (matches Supabase schema)
export interface Debate {
  id: string;
  user_id?: string;
  prompt: string;  // Initial/primary prompt (for backwards compat)
  responses: Record<string, string>;  // First round responses (for backwards compat)
  scores?: Record<string, ModelScores>;
  verdict?: JudgeVerdict;
  latencies?: Record<string, { ttft: number; total: number }>;
  created_at: string;
  // Multi-round fields
  is_multi_round?: boolean;
  rounds?: DebateRound[];
  total_rounds?: number;
  // Share fields
  share_id?: string | null;
  is_public?: boolean;
}

// Multi-round debate types
export interface DebateRound {
  roundNumber: number;
  prompt: string;
  responses: Record<string, string>;
  scores?: Record<string, ModelScores>;
  verdict?: JudgeVerdict;
  latencies?: Record<string, { ttft: number; total: number }>;
  createdAt: string;
}

export interface MultiRoundDebateRequest {
  prompt: string;
  previousRounds?: DebateRound[];
  roundNumber?: number;
}

export interface User {
  id: string;
  email: string;
  debates_today: number;
  last_debate_date: string;
  created_at: string;
}

// PromptPit user profile (stored in promptpit_profiles table)
// Note: id IS the user_id (references auth.users.id)
export interface PromptPitProfile {
  id: string;  // This is the user's auth.users.id
  email?: string;
  tier: 'free' | 'pro';
  role?: 'user' | 'admin';  // Optional, defaults to 'user' for backwards compatibility
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  debates_this_month: number;
  month_reset_date: string;
  created_at: string;
}

// OpenRouter API types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterStreamChunk {
  choices: Array<{
    delta: {
      content?: string;
      tool_calls?: Array<{
        index: number;
        id?: string;
        type?: string;
        function?: {
          name?: string;
          arguments?: string;
        };
      }>;
    };
    finish_reason?: string | null;
  }>;
}
