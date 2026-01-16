/**
 * AI Compare API Route
 * Calls multiple AI models in parallel and returns their responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { chat, type Message } from '@/lib/openrouter';
import { getAuth0User, getUserProfile } from '@/lib/auth0';

// Model configurations for AI Compare
const COMPARE_MODELS: Record<string, { id: string; name: string; provider: string }> = {
  'gpt-4o': {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
  },
  'gpt-4o-mini': {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
  },
  'claude-3-sonnet': {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet',
    provider: 'Anthropic',
  },
  'claude-3-haiku': {
    id: 'anthropic/claude-3-5-haiku-20241022',
    name: 'Claude Haiku',
    provider: 'Anthropic',
  },
  'gemini-pro': {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0',
    provider: 'Google',
  },
  'llama-3': {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
  },
};

interface CompareRequest {
  prompt: string;
  models: string[];
}

interface ModelResult {
  model: string;
  modelName: string;
  provider: string;
  output: string;
  tokens: number;
  latency: number;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth0User = await getAuth0User();

    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is Pro (AI Compare is a Pro feature)
    const profile = await getUserProfile(auth0User.sub);

    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
    if (!isPro) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 });
    }

    const body: CompareRequest = await request.json();
    const { prompt, models } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!models || models.length < 2) {
      return NextResponse.json({ error: 'At least 2 models are required' }, { status: 400 });
    }

    if (models.length > 4) {
      return NextResponse.json({ error: 'Maximum 4 models allowed' }, { status: 400 });
    }

    // Validate models
    const validModels = models.filter(m => COMPARE_MODELS[m]);
    if (validModels.length !== models.length) {
      return NextResponse.json({ error: 'Invalid model selection' }, { status: 400 });
    }

    // Build messages
    const messages: Message[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide a clear, concise, and helpful response to the user\'s question or request. Be direct and informative.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    // Call all models in parallel
    const startTime = Date.now();
    const results = await Promise.all(
      validModels.map(async (modelKey): Promise<ModelResult> => {
        const modelConfig = COMPARE_MODELS[modelKey];
        const modelStartTime = Date.now();

        try {
          const response = await chat(modelConfig.id, messages);
          const latency = Date.now() - modelStartTime;

          // Estimate tokens (rough approximation)
          const estimatedTokens = Math.ceil((prompt.length + response.content.length) / 4);

          return {
            model: modelKey,
            modelName: modelConfig.name,
            provider: modelConfig.provider,
            output: response.content,
            tokens: estimatedTokens,
            latency,
          };
        } catch (error) {
          const latency = Date.now() - modelStartTime;
          return {
            model: modelKey,
            modelName: modelConfig.name,
            provider: modelConfig.provider,
            output: '',
            tokens: 0,
            latency,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
    );

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      results,
      totalTime,
      prompt,
    });
  } catch (error) {
    console.error('AI Compare error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Return available models
export async function GET() {
  const models = Object.entries(COMPARE_MODELS).map(([key, config]) => ({
    key,
    ...config,
  }));

  return NextResponse.json({ models });
}
