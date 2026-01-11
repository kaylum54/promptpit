/**
 * Model configurations for PromptPit
 * Defines the available AI models from OpenRouter
 */

export interface ModelConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
  contextWindow?: number;
  supportsTools?: boolean;
  // Pricing per 1M tokens (in USD)
  pricing?: {
    input: number;
    output: number;
  };
}

export const MODELS: Record<string, ModelConfig> = {
  claude: {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude',
    color: '#f59e0b',
    description: 'Anthropic Claude Sonnet 4 - Balanced performance and capability',
    contextWindow: 200000,
    supportsTools: true,
    pricing: { input: 3, output: 15 },
  },
  gpt4o: {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    color: '#10b981',
    description: 'OpenAI GPT-4o - Multimodal flagship model',
    contextWindow: 128000,
    supportsTools: true,
    pricing: { input: 2.5, output: 10 },
  },
  gemini: {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini',
    color: '#8b5cf6',
    description: 'Google Gemini 2.0 Flash - Fast and capable',
    contextWindow: 1000000,
    supportsTools: true,
    pricing: { input: 0.1, output: 0.4 },
  },
  llama: {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama',
    color: '#06b6d4',
    description: 'Meta Llama 3.3 70B - Open source powerhouse',
    contextWindow: 131072,
    supportsTools: true,
    pricing: { input: 0.4, output: 0.4 },
  },
} as const;

export type ModelKey = keyof typeof MODELS;

/**
 * Get model config by key
 */
export function getModel(key: ModelKey): ModelConfig {
  return MODELS[key];
}

/**
 * Get model config by OpenRouter ID
 */
export function getModelById(id: string): ModelConfig | undefined {
  return Object.values(MODELS).find((model) => model.id === id);
}

/**
 * Get all model keys
 */
export function getModelKeys(): ModelKey[] {
  return Object.keys(MODELS) as ModelKey[];
}

/**
 * Get all models as an array
 */
export function getModelsArray(): Array<ModelConfig & { key: ModelKey }> {
  return Object.entries(MODELS).map(([key, config]) => ({
    key: key as ModelKey,
    ...config,
  }));
}
