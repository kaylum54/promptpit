/**
 * Judge API Route for PromptPit
 * Implements the Judge Agent with tool-use loop to evaluate AI model responses
 * Returns SSE stream with scoring events and final verdict
 */

import { NextRequest } from 'next/server';
import { JUDGE_SYSTEM_PROMPT, judgeTools, buildJudgePrompt } from '@/lib/judge-tools';
import type { ModelScores, JudgeVerdict, JudgeStreamEvent } from '@/lib/types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const JUDGE_MODEL = 'anthropic/claude-sonnet-4';

interface JudgeRequest {
  prompt: string;
  responses: Record<string, string>;
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
}

/**
 * Validates the incoming request body
 */
function validateRequest(body: unknown): { valid: true; data: JudgeRequest } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be an object' };
  }

  const { prompt, responses } = body as Record<string, unknown>;

  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'prompt is required and must be a string' };
  }

  if (prompt.trim().length === 0) {
    return { valid: false, error: 'prompt cannot be empty' };
  }

  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) {
    return { valid: false, error: 'responses is required and must be an object mapping model names to response strings' };
  }

  const responseEntries = Object.entries(responses as Record<string, unknown>);
  if (responseEntries.length === 0) {
    return { valid: false, error: 'responses must contain at least one model response' };
  }

  for (const [model, response] of responseEntries) {
    if (typeof response !== 'string') {
      return { valid: false, error: `Response for model "${model}" must be a string` };
    }
  }

  return {
    valid: true,
    data: {
      prompt: prompt.trim(),
      responses: responses as Record<string, string>,
    },
  };
}

/**
 * Gets OpenRouter API headers
 */
function getHeaders(): HeadersInit {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'PromptPit Judge',
  };
}

/**
 * Sends an SSE event to the writer
 */
function sendEvent(writer: WritableStreamDefaultWriter<Uint8Array>, event: JudgeStreamEvent): Promise<void> {
  const encoder = new TextEncoder();
  const data = `data: ${JSON.stringify(event)}\n\n`;
  return writer.write(encoder.encode(data));
}

/**
 * Calls OpenRouter API with tool support (non-streaming for tool loop)
 */
async function callOpenRouter(messages: OpenRouterMessage[]): Promise<OpenRouterResponse> {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: JUDGE_MODEL,
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        ...messages,
      ],
      tools: judgeTools,
      tool_choice: 'auto',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Processes the judge tool-use loop and streams events
 */
async function runJudgeLoop(
  prompt: string,
  responses: Record<string, string>,
  writer: WritableStreamDefaultWriter<Uint8Array>
): Promise<void> {
  // Initialize conversation with the judge prompt
  const messages: OpenRouterMessage[] = [
    { role: 'user', content: buildJudgePrompt(prompt, responses) },
  ];

  // State to accumulate scores and verdict
  const scores: Record<string, ModelScores> = {};
  let verdict: JudgeVerdict | null = null;

  // Tool-use loop
  while (true) {
    try {
      const data = await callOpenRouter(messages);
      const choice = data.choices[0];

      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        // Process each tool call
        for (const toolCall of choice.message.tool_calls) {
          let args: Record<string, unknown>;
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {
            console.error('Failed to parse tool call arguments:', toolCall.function.arguments);
            continue;
          }

          // Emit tool_call event
          await sendEvent(writer, {
            type: 'tool_call',
            tool: toolCall.function.name,
            input: args,
          });

          // Handle scoring tools
          if (toolCall.function.name.startsWith('score_')) {
            const category = toolCall.function.name.replace('score_', '') as keyof ModelScores;
            const model = args.model as string;
            const score = args.score as number;
            const rationale = args.rationale as string;

            // Initialize model scores if needed
            if (!scores[model]) {
              scores[model] = {};
            }

            // Record the score
            scores[model][category] = { score, rationale };

            // Emit scoring event
            await sendEvent(writer, {
              type: 'scoring',
              model,
              category,
              score,
              rationale,
            });
          }

          // Handle verdict tool
          if (toolCall.function.name === 'generate_verdict') {
            verdict = {
              winner: args.winner as string,
              verdict: args.verdict as string,
              highlight: args.highlight as string,
            };

            // Emit verdict event
            await sendEvent(writer, {
              type: 'verdict',
              winner: verdict.winner,
              verdict: verdict.verdict,
              highlight: verdict.highlight,
            });
          }

          // Add assistant message with this tool call to conversation
          messages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall],
          });

          // Add tool result to conversation
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify({ success: true, recorded: args }),
          });
        }
      } else {
        // No more tool calls - we're done
        // If we have scores but no verdict, the judge finished without calling generate_verdict
        // This shouldn't happen with a well-prompted model, but handle it gracefully
        if (!verdict && Object.keys(scores).length > 0) {
          // Generate a default verdict based on scores
          const modelTotals: Record<string, number> = {};
          for (const [model, modelScores] of Object.entries(scores)) {
            let total = 0;
            if (modelScores.reasoning) total += modelScores.reasoning.score;
            if (modelScores.clarity) total += modelScores.clarity.score;
            if (modelScores.persuasiveness) total += modelScores.persuasiveness.score;
            modelTotals[model] = total;
          }

          const winner = Object.entries(modelTotals).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];

          verdict = {
            winner,
            verdict: `Based on the scores, ${winner} wins this debate.`,
            highlight: 'See individual scores for details.',
          };

          await sendEvent(writer, {
            type: 'verdict',
            winner: verdict.winner,
            verdict: verdict.verdict,
            highlight: verdict.highlight,
          });
        }

        // Emit complete event
        await sendEvent(writer, {
          type: 'complete',
          scores,
          verdict: verdict || {
            winner: 'Unknown',
            verdict: 'Unable to determine a winner.',
            highlight: '',
          },
        });

        break;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Judge loop error:', errorMessage);

      // Send error as a complete event with available data
      await sendEvent(writer, {
        type: 'complete',
        scores,
        verdict: verdict || {
          winner: 'Error',
          verdict: `An error occurred during judging: ${errorMessage}`,
          highlight: '',
        },
      });

      break;
    }
  }
}

export async function POST(request: NextRequest) {
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

  const { prompt, responses } = validation.data;

  // Create the SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Run the judge loop in the background
  runJudgeLoop(prompt, responses, writer)
    .catch((error) => {
      console.error('Judge loop failed:', error);
    })
    .finally(() => {
      writer.close().catch(() => {
        // Ignore close errors
      });
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
