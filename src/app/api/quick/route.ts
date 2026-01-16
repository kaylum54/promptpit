/**
 * Quick Mode API Route for PromptPit
 * Routes prompts to the best AI model based on user preferences
 * Returns a single SSE stream with the model's response
 */

import { NextRequest } from 'next/server';
import { streamChat, type Message } from '@/lib/openrouter';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { detectIntent } from '@/lib/intent-detection';
import { getRoutingDecisionWithFallback, getOpenRouterModelId, modelDisplayNames } from '@/lib/routing';
import { saveQuickResponse } from '@/lib/preferences';
import { rateLimit, RATE_LIMITS, getRateLimitHeaders, createRateLimitResponse } from '@/lib/rate-limit';
import type { PromptPitProfile } from '@/lib/types';

interface QuickStreamEvent {
  type: 'routing' | 'content' | 'done' | 'error';
  model?: string;
  modelName?: string;
  reason?: string;
  confidence?: number;
  category?: string;
  content?: string;
  fullResponse?: string;
  responseId?: string;
  error?: string;
}

/**
 * Sends an SSE event to the writer
 */
function sendEvent(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  event: QuickStreamEvent
): Promise<void> {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(event)}\n\n`;
  return writer.write(encoder.encode(data));
}

/**
 * Gets the system prompt for Quick Mode
 */
function getQuickModeSystemPrompt(category: string): string {
  const prompts: Record<string, string> = {
    writing:
      'You are a skilled writing assistant. Provide clear, engaging, and well-structured content. Match the tone and style requested. Be creative yet professional.',
    code:
      'You are an expert software engineer. Provide clean, well-documented code with explanations. Follow best practices and consider edge cases.',
    research:
      'You are a knowledgeable research assistant. Provide accurate, well-sourced information. Be thorough but concise. Acknowledge limitations and uncertainties.',
    analysis:
      'You are a strategic analyst. Provide balanced, thoughtful analysis. Consider multiple perspectives. Give clear recommendations when appropriate.',
    general:
      'You are a helpful AI assistant. Provide clear, accurate, and useful responses. Be concise but thorough.',
  };

  return prompts[category] || prompts.general;
}

export async function POST(request: NextRequest) {
  // Check rate limit (same as debate for now)
  const rateLimitResult = rateLimit(request, 'debate', RATE_LIMITS.debate);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  // Get authenticated user
  let userId: string | null = null;
  let userProfile: PromptPitProfile | null = null;

  try {
    const auth0User = await getAuth0User();

    if (auth0User) {
      userId = auth0User.sub;

      // Fetch user profile
      const supabase = createServiceRoleClient();
      const { data: profile } = await supabase
        .from('promptpit_profiles')
        .select('*')
        .eq('id', auth0User.sub)
        .single();

      if (profile) {
        userProfile = profile as PromptPitProfile;
      }
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }

  // Quick Mode requires Pro subscription
  if (!userProfile || (userProfile.tier !== 'pro' && userProfile.role !== 'admin')) {
    return new Response(
      JSON.stringify({
        error: 'Pro subscription required',
        code: 'PRO_REQUIRED',
        message: 'Quick Mode is a Pro feature. Please upgrade to Pro to use Quick Mode.',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Parse request body
  let body: { prompt: string; model?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt, model: overrideModel } = body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return new Response(JSON.stringify({ error: 'prompt is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detect intent category
  const category = detectIntent(prompt.trim());

  // Get routing decision (or use override model if provided)
  let routingDecision = await getRoutingDecisionWithFallback(userId, category);

  if (overrideModel) {
    // User explicitly chose a different model
    const validModels = ['claude', 'gpt', 'gemini', 'llama'];
    if (validModels.includes(overrideModel)) {
      routingDecision = {
        model: overrideModel as 'claude' | 'gpt' | 'gemini' | 'llama',
        reason: 'You selected this model',
        confidence: 100,
        category,
      };
    }
  }

  // Get OpenRouter model ID
  const modelId = getOpenRouterModelId(routingDecision.model);
  const modelName = modelDisplayNames[routingDecision.model];

  // Prepare messages
  const systemPrompt = getQuickModeSystemPrompt(category);
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt.trim() },
  ];

  // Create SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Start streaming
  (async () => {
    let fullResponse = '';

    try {
      // Send routing info first
      await sendEvent(writer, {
        type: 'routing',
        model: routingDecision.model,
        modelName,
        reason: routingDecision.reason,
        confidence: routingDecision.confidence,
        category,
      });

      // Stream the response
      const stream = await streamChat(modelId, messages);
      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        if (value.type === 'content' && value.content) {
          fullResponse += value.content;

          await sendEvent(writer, {
            type: 'content',
            content: value.content,
          });
        } else if (value.type === 'error') {
          await sendEvent(writer, {
            type: 'error',
            error: value.error || 'Unknown streaming error',
          });
          await writer.close();
          return;
        }
      }

      // Save the quick response to database
      let responseId: string | null = null;
      if (userId) {
        responseId = await saveQuickResponse({
          userId,
          prompt: prompt.trim(),
          category,
          model: routingDecision.model,
          response: fullResponse,
        });
      }

      // Send completion event
      await sendEvent(writer, {
        type: 'done',
        fullResponse,
        responseId: responseId || undefined,
      });

      await writer.close();
    } catch (error) {
      console.error('Error in quick mode stream:', error);
      try {
        await sendEvent(writer, {
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        await writer.close();
      } catch {
        // Ignore close errors
      }
    }
  })();

  // Return SSE response
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      ...rateLimitHeaders,
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
