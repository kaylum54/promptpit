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

// Extended response structure for arena-specific judging
export interface ModelAnalysis {
  model: string;
  scores: Record<string, number>;
  analysis: string;
  strongestMoment: string;
  weakness: string;
}

export interface StructuredJudgeResult {
  openingRemarks: string;
  modelAnalyses: ModelAnalysis[];
  headToHead: string;
  winner: string;
  verdict: string;
  quotableLine: string;
}

// SSE event types for /api/judge
export type JudgeStreamEvent =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'tool_call'; tool: string; input: any }
  | { type: 'scoring'; model: string; category: string; score: number; rationale: string }
  | { type: 'verdict'; winner: string; verdict: string; highlight: string }
  | { type: 'complete'; scores: Record<string, ModelScores>; verdict: JudgeVerdict; structuredResult?: StructuredJudgeResult };

// Arena types for debates
export type DebateArena = 'debate' | 'code' | 'writing';

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
  // Arena type
  arena?: DebateArena;
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
  subscription_status?: 'active' | 'past_due' | 'canceled' | 'incomplete' | null;
  subscription_period_end?: string;
  debates_this_month: number;
  month_reset_date: string;
  created_at: string;
  // User settings
  display_name?: string;
  timezone?: string;
  language?: string;
  notify_weekly_digest?: boolean;
  notify_prd_complete?: boolean;
  notify_team_updates?: boolean;
  notify_marketing?: boolean;
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

// =============================================
// Pro Dashboard: Chat Types
// =============================================

export type ChatRole = 'user' | 'assistant' | 'system';
export type IntentCategory = 'writing' | 'code' | 'research' | 'analysis' | 'general';
export type ChatModelKey = 'claude' | 'gpt' | 'gemini' | 'llama';

// Chat session
export interface Chat {
  id: string;
  user_id: string;
  title: string;
  last_message_at: string;
  created_at: string;
  archived: boolean;
  message_count: number;
  primary_category: IntentCategory;
}

// Individual message in a chat
export interface ChatMessage {
  id: string;
  chat_id: string;
  role: ChatRole;
  content: string;
  // AI routing info (assistant messages only)
  model?: ChatModelKey;
  category?: IntentCategory;
  routing_reason?: string;
  // Performance metadata
  metadata?: ChatMessageMetadata;
  created_at: string;
}

export interface ChatMessageMetadata {
  latency_ms?: number;
  tokens?: number;
  cost_estimate?: string;
  ttft_ms?: number;
}

// API request/response types
export interface CreateChatRequest {
  title?: string;
}

export interface SendMessageRequest {
  chat_id: string;
  content: string;
  // Optional: force a specific model instead of auto-routing
  force_model?: ChatModelKey;
}

export interface ChatStreamEvent {
  type: 'routing' | 'chunk' | 'complete' | 'error';
  model?: ChatModelKey;
  category?: IntentCategory;
  routing_reason?: string;
  content?: string;
  message_id?: string;
  metadata?: ChatMessageMetadata;
  error?: string;
}

// Chat list response
export interface ChatListResponse {
  chats: Chat[];
  total: number;
  hasMore: boolean;
}

// Chat with messages response
export interface ChatWithMessages {
  chat: Chat;
  messages: ChatMessage[];
}

// =============================================
// PRD Builder Types
// =============================================

export type PRDMode = 'quick' | 'full';
export type PRDStatus = 'in_progress' | 'review' | 'completed' | 'archived';
export type PRDDecisionType = 'framework' | 'database' | 'auth' | 'hosting' | 'caching' | 'scaling' | 'architecture' | 'other';
export type PRDPlatform = 'web' | 'mobile' | 'desktop' | 'api' | 'extension';
export type PRDMonetisation = 'free' | 'freemium' | 'paid' | 'usage_based' | 'enterprise';
export type PRDPriority = 'must' | 'should' | 'could';
export type PRDSeverity = 'high' | 'medium' | 'low';

// PRD Idea Summary
export interface PRDIdeaSummary {
  problem: string;
  target_user: string;
  unique_value_prop: string;
  platform: PRDPlatform;
  monetisation: PRDMonetisation;
  competitors?: { name: string; strengths: string; weaknesses: string }[];
  differentiators?: string[];
  risks?: { risk: string; mitigation: string }[];
}

// PRD Feature
export interface PRDFeature {
  name: string;
  description: string;
  user_story: string;
  acceptance_criteria: string[];
  priority: PRDPriority;
}

// PRD Features
export interface PRDFeatures {
  v1: PRDFeature[];
  v2?: { name: string; description: string; rationale: string }[];
  out_of_scope?: { name: string; reason: string }[];
  user_flows?: { name: string; steps: string[] }[];
}

// PRD Tech Stack
export interface PRDTechStack {
  preset?: string;
  frontend?: { framework: string; styling: string; state_management?: string; rationale?: string };
  backend?: { framework: string; runtime: string; rationale?: string };
  database?: { type: string; provider: string; orm?: string; rationale?: string };
  auth?: { provider: string; methods?: string[]; rationale?: string };
  hosting?: { provider: string; type: string; rationale?: string };
  additional?: { name: string; purpose: string }[];
}

// PRD Security
export interface PRDSecurity {
  authentication?: {
    flow: string;
    session_handling: string;
    token_strategy?: string;
  };
  authorization?: {
    model: 'rbac' | 'abac' | 'simple';
    roles?: { name: string; permissions: string[] }[];
  };
  input_validation?: { strategy: string; libraries?: string[] };
  rate_limiting?: { strategy: string; limits?: Record<string, unknown> };
  secrets_management?: { strategy: string; provider?: string };
  cors?: { strategy: string; allowed_origins?: string[] };
  security_headers?: string[];
}

// PRD Cost Estimate
export interface PRDCostEstimate {
  build_costs?: {
    estimated_hours: number;
    hourly_rate_suggestion: number;
    total_estimate: number;
    breakdown?: { phase: string; hours: number; description: string }[];
  };
  subscription_costs?: {
    service: string;
    tier: string;
    monthly_cost: number;
    annual_cost?: number;
    purpose: string;
    free_tier_limits?: string;
    when_to_upgrade?: string;
  }[];
  operational_costs?: {
    mvp?: { users: string; monthly_cost: number; breakdown?: Record<string, unknown> };
    growth?: { users: string; monthly_cost: number; breakdown?: Record<string, unknown> };
    scale?: { users: string; monthly_cost: number; breakdown?: Record<string, unknown> };
  };
  total_monthly?: { mvp: number; growth: number; scale: number };
  cost_optimisation_tips?: string[];
}

// Main PRD object
export interface PRD {
  id: string;
  user_id: string;
  title?: string;
  mode: PRDMode;
  status: PRDStatus;
  current_phase: number;
  template_id?: string;

  // Phase data
  idea_summary?: PRDIdeaSummary;
  features?: PRDFeatures;
  tech_stack?: PRDTechStack;
  database_schema?: string;
  api_structure?: Record<string, unknown>;
  file_structure?: string;
  security?: PRDSecurity;
  error_handling?: Record<string, unknown>;
  performance?: Record<string, unknown>;
  scaling?: Record<string, unknown>;
  observability?: Record<string, unknown>;
  deployment?: Record<string, unknown>;
  cost_estimate?: PRDCostEstimate;

  // Outputs
  prd_markdown?: string;
  claude_code_prompt?: string;

  // Collaboration
  is_public: boolean;
  share_token?: string;
  collaborators?: { user_id: string; email?: string; role: 'viewer' | 'commenter' | 'editor'; added_at: string }[];

  // Versioning
  version: number;
  parent_prd_id?: string;

  created_at: string;
  updated_at: string;
}

// PRD Message
export interface PRDMessage {
  id: string;
  prd_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  phase?: number;
  message_type: 'chat' | 'debate_intro' | 'debate_result' | 'review';
  metadata?: Record<string, unknown>;
  created_at: string;
}

// PRD Debate Response
export interface PRDDebateResponse {
  model: ChatModelKey;
  recommendation: string;
  reasoning: string;
  pros: string[];
  cons: string[];
}

// PRD Debate
export interface PRDDebate {
  id: string;
  prd_id: string;
  decision_type: PRDDecisionType;
  decision_label: string;
  context: Record<string, unknown>;
  responses: PRDDebateResponse[];
  verdict?: {
    winner: string;
    vote_count?: Record<string, string>;
    reasoning?: string;
  };
  user_choice?: string;
  user_rationale?: string;
  phase: number;
  created_at: string;
}

// PRD Review Concern
export interface PRDReviewConcern {
  severity: PRDSeverity;
  section: string;
  issue: string;
  suggestion: string;
  addressed?: boolean;
  addressed_at?: string;
}

// PRD Review
export interface PRDReview {
  id: string;
  prd_id: string;
  model: string;
  strengths: string[];
  concerns: PRDReviewConcern[];
  overall_score: number;
  summary?: string;
  created_at: string;
}

// PRD Comment
export interface PRDComment {
  id: string;
  prd_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  section?: string;
  resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

// PRD Version
export interface PRDVersion {
  id: string;
  prd_id: string;
  version: number;
  snapshot: PRD;
  change_summary?: string;
  changes?: { section: string; change_type: 'added' | 'modified' | 'removed'; description: string }[];
  created_by?: string;
  created_at: string;
}

// API Request/Response types
export interface CreatePRDRequest {
  mode: PRDMode;
  template_id?: string;
  initial_idea?: string;
}

export interface PRDListResponse {
  prds: PRD[];
  total: number;
}

export interface SendPRDMessageRequest {
  content: string;
}

export interface PRDMessageStreamEvent {
  type: 'chunk' | 'complete' | 'debate_trigger' | 'review_trigger' | 'phase_complete' | 'error';
  content?: string;
  message_id?: string;
  debate_info?: { decision_type: PRDDecisionType; label: string; context: Record<string, unknown> };
  phase?: number;
  error?: string;
}

export interface TriggerDebateRequest {
  decision_type: PRDDecisionType;
  decision_label: string;
  context: Record<string, unknown>;
}

export interface SubmitDebateChoiceRequest {
  debate_id: string;
  choice: string;
  rationale?: string;
}
