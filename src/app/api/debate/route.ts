/**
 * Debate API Route for PromptPit
 * Spawns parallel streaming requests to multiple AI models via OpenRouter
 * Returns a single SSE stream that multiplexes all model responses
 */

import { NextRequest } from 'next/server';
import { streamChat, type Message } from '@/lib/openrouter';
import { MODELS, type ModelKey } from '@/lib/models';
import { ARENA_MODES, type ArenaMode } from '@/lib/modes';
import type { DebateStreamEvent, PromptPitProfile } from '@/lib/types';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase';
import { canStartDebate, getDebateLimit } from '@/lib/pricing';

/**
 * Generates a system prompt with optional context from previous debate rounds
 * Uses mode-specific prompts for different arena types
 */
function getSystemPrompt(
  mode: ArenaMode = 'debate',
  previousRounds?: Array<{prompt: string; responses: Record<string, string>}>
): string {
  // Get mode-specific base prompt
  const modeConfig = ARENA_MODES[mode];
  const basePrompt = modeConfig?.systemPrompt || 'You are participating in a debate. Provide a clear, well-reasoned response to the topic. Be concise but thorough. Aim for 2-3 paragraphs.';

  if (!previousRounds || previousRounds.length === 0) {
    return basePrompt;
  }

  // Build context from previous rounds
  let context = basePrompt + '\n\nThis is a continuation of an ongoing session. Here is what was discussed previously:\n\n';

  previousRounds.forEach((round, idx) => {
    context += '--- Round ' + (idx + 1) + ' ---\n';
    context += 'Topic: ' + round.prompt + '\n\n';
    Object.entries(round.responses).forEach(([model, response]) => {
      context += model + "'s response:\n" + response + '\n\n';
    });
  });

  context += '--- Current Round ---\nNow respond to the new topic/question, taking into account the previous discussion.';

  return context;
}

interface DebateRequest {
  prompt: string;
  models?: string[];
  mode?: ArenaMode;
  previousRounds?: Array<{
    prompt: string;
    responses: Record<string, string>;
  }>;
  roundNumber?: number;
}

/**
 * Validates the incoming request body
 */
function validateRequest(body: unknown): { valid: true; data: DebateRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const { prompt, models, mode, previousRounds, roundNumber } = body as Record<string, unknown>;

  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'prompt is required and must be a string' };
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'prompt cannot be empty' };
  }

  if (models !== undefined) {
    if (!Array.isArray(models)) {
      return { valid: false, error: 'models must be an array of strings' };
    }

    const validModelKeys = Object.keys(MODELS);
    for (const model of models) {
      if (typeof model !== 'string' || !validModelKeys.includes(model)) {
        return { valid: false, error: `Invalid model: ${model}. Valid models are: ${validModelKeys.join(', ')}` };
      }
    }
  }

  // Validate previousRounds if provided
  if (previousRounds !== undefined) {
    if (!Array.isArray(previousRounds)) {
      return { valid: false, error: 'previousRounds must be an array' };
    }

    for (let i = 0; i < previousRounds.length; i++) {
      const round = previousRounds[i];
      if (!round || typeof round !== 'object') {
        return { valid: false, error: 'previousRounds[' + i + '] must be an object' };
      }
      if (typeof round.prompt !== 'string') {
        return { valid: false, error: 'previousRounds[' + i + '].prompt must be a string' };
      }
      if (!round.responses || typeof round.responses !== 'object') {
        return { valid: false, error: 'previousRounds[' + i + '].responses must be an object' };
      }
    }
  }

  // Validate roundNumber if provided
  if (roundNumber !== undefined) {
    if (typeof roundNumber !== 'number' || roundNumber < 1 || !Number.isInteger(roundNumber)) {
      return { valid: false, error: 'roundNumber must be a positive integer' };
    }
  }

  // Validate mode if provided
  if (mode !== undefined) {
    const validModes: ArenaMode[] = ['debate', 'code', 'creative'];
    if (typeof mode !== 'string' || !validModes.includes(mode as ArenaMode)) {
      return { valid: false, error: 'mode must be one of: debate, code, creative' };
    }
  }

  return {
    valid: true,
    data: {
      prompt: prompt.trim(),
      models: models as string[] | undefined,
      mode: (mode as ArenaMode) || 'debate',
      previousRounds: previousRounds as DebateRequest['previousRounds'],
      roundNumber: roundNumber as number | undefined
    }
  };
}

/**
 * Sends an SSE event to the writer
 */
function sendEvent(writer: WritableStreamDefaultWriter<Uint8Array>, event: DebateStreamEvent): Promise<void> {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(event)}\n\n`;
  return writer.write(encoder.encode(data));
}

/**
 * Processes a single model's streaming response
 */
async function processModelStream(
  modelKey: string,
  modelId: string,
  messages: Message[],
  writer: WritableStreamDefaultWriter<Uint8Array>,
  onComplete: (modelKey: string, content: string, latency: { ttft: number; total: number }) => void,
  onError: (modelKey: string, error: string) => void
): Promise<void> {
  const startTime = performance.now();
  let ttft: number | null = null;
  let accumulatedContent = '';

  try {
    const stream = await streamChat(modelId, messages);
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      if (value.type === 'content' && value.content) {
        // Record TTFT on first content chunk
        if (ttft === null) {
          ttft = performance.now() - startTime;
        }

        accumulatedContent += value.content;

        // Send chunk event
        await sendEvent(writer, {
          type: 'chunk',
          model: modelKey,
          content: value.content,
        });
      } else if (value.type === 'error') {
        onError(modelKey, value.error || 'Unknown streaming error');
        return;
      }
    }

    const totalTime = performance.now() - startTime;
    const latency = {
      ttft: ttft ?? totalTime,
      total: totalTime,
    };

    // Send model_complete event
    await sendEvent(writer, {
      type: 'model_complete',
      model: modelKey,
      latency,
    });

    onComplete(modelKey, accumulatedContent, latency);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Send error event
    await sendEvent(writer, {
      type: 'error',
      model: modelKey,
      error: errorMessage,
    });

    onError(modelKey, errorMessage);
  }
}

/**
 * Check if the month needs to be reset and return updated profile data
 */
function checkMonthReset(profile: PromptPitProfile): { needsReset: boolean; debatesThisMonth: number } {
  const now = new Date();
  const resetDate = new Date(profile.month_reset_date);

  if (now >= resetDate) {
    // Month has passed, reset needed
    return { needsReset: true, debatesThisMonth: 0 };
  }

  return { needsReset: false, debatesThisMonth: profile.debates_this_month };
}

/**
 * Calculate the next month reset date (first day of next month)
 */
function getNextMonthResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

export async function POST(request: NextRequest) {
  // Get authenticated user (if any)
  let userId: string | null = null;
  let userProfile: PromptPitProfile | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;

      // Fetch user profile from promptpit_profiles
      const { data: profile, error: profileError } = await supabase
        .from('promptpit_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist - create one
        console.log('Creating new profile for user:', user.id);
        const serviceClient = createServiceRoleClient();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1);
        nextMonth.setHours(0, 0, 0, 0);

        const { data: newProfile, error: createError } = await serviceClient
          .from('promptpit_profiles')
          .insert({
            id: user.id,
            email: user.email,
            tier: 'free',
            debates_this_month: 0,
            month_reset_date: nextMonth.toISOString(),
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
          // Continue without profile - treat as guest
        } else if (newProfile) {
          userProfile = newProfile as PromptPitProfile;
        }
      } else if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue without profile - treat as guest
      } else if (profile) {
        userProfile = profile as PromptPitProfile;

        // Check if month needs reset
        const { needsReset, debatesThisMonth } = checkMonthReset(userProfile);

        if (needsReset) {
          // Reset the month counter using service role client
          const serviceClient = createServiceRoleClient();
          const newResetDate = getNextMonthResetDate();

          await serviceClient
            .from('promptpit_profiles')
            .update({
              debates_this_month: 0,
              month_reset_date: newResetDate
            })
            .eq('id', user.id);

          // Update local profile reference
          userProfile = {
            ...userProfile,
            debates_this_month: 0,
            month_reset_date: newResetDate
          };
        }

        // Check usage limit
        const currentDebates = needsReset ? 0 : debatesThisMonth;
        if (!canStartDebate(currentDebates, userProfile.tier)) {
          const debatesLimit = getDebateLimit(userProfile.tier);
          return new Response(JSON.stringify({
            error: 'Monthly debate limit reached',
            code: 'LIMIT_REACHED',
            debatesUsed: currentDebates,
            debatesLimit
          }), {
            status: 429,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }
    // If no user (guest), allow the debate - guests get unlimited but debates aren't saved
  } catch (error) {
    console.error('Error checking auth/profile:', error);
    // Continue without auth - treat as guest
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const validation = validateRequest(body);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { prompt, models: requestedModels, mode, previousRounds } = validation.data;

  // Determine which models to use
  const modelKeys: ModelKey[] = requestedModels
    ? (requestedModels as ModelKey[])
    : (Object.keys(MODELS) as ModelKey[]);

  // Generate dynamic system prompt with mode and previous round context
  const systemPrompt = getSystemPrompt(mode, previousRounds);

  // Prepare messages for each model
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: prompt },
  ];

  // Track completion state
  const responses: Record<string, string> = {};
  const errors: Record<string, string> = {};
  let completedCount = 0;
  const totalModels = modelKeys.length;

  // Create the SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Completion handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleModelComplete = (modelKey: string, content: string, _latency: { ttft: number; total: number }) => {
    responses[modelKey] = content;
    completedCount++;

    // Check if all models are done
    if (completedCount === totalModels) {
      sendAllCompleteAndClose();
    }
  };

  // Error handler
  const handleModelError = (modelKey: string, error: string) => {
    errors[modelKey] = error;
    responses[modelKey] = ''; // Empty response for errored models
    completedCount++;

    // Check if all models are done
    if (completedCount === totalModels) {
      sendAllCompleteAndClose();
    }
  };

  // Send all_complete event and close the stream
  const sendAllCompleteAndClose = async () => {
    try {
      await sendEvent(writer, {
        type: 'all_complete',
        responses,
      });

      // Increment debates_this_month for logged-in users after successful completion
      if (userId && userProfile) {
        try {
          const serviceClient = createServiceRoleClient();
          await serviceClient
            .from('promptpit_profiles')
            .update({
              debates_this_month: userProfile.debates_this_month + 1
            })
            .eq('id', userId);
        } catch (error) {
          console.error('Error incrementing debate count:', error);
          // Don't fail the response - the debate already completed
        }
      }

      await writer.close();
    } catch (error) {
      console.error('Error closing SSE stream:', error);
      try {
        await writer.abort(error);
      } catch {
        // Ignore abort errors
      }
    }
  };

  // Spawn parallel requests for all models
  // We don't await these - they run independently and complete asynchronously
  modelKeys.forEach((modelKey) => {
    const modelConfig = MODELS[modelKey];
    processModelStream(
      modelKey,
      modelConfig.id,
      messages,
      writer,
      handleModelComplete,
      handleModelError
    );
  });

  // Return the SSE response
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

// Handle preflight requests for CORS
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
