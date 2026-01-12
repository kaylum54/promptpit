/**
 * Judge API Route for PromptPit
 * Implements the Judge Agent with tool-use loop to evaluate AI model responses
 * Returns SSE stream with scoring events and final verdict
 *
 * Supports arena-specific judging with different judge personas:
 * - 'debate' -> The Arbiter (default)
 * - 'code' -> The Architect
 * - 'writing' -> The Editor
 */

import { NextRequest } from 'next/server';
import { getJudgeSystemPrompt, buildJudgePrompt } from '@/lib/judge-tools';
import { type ArenaMode } from '@/lib/modes';
import { getJudgeConfig, type ArenaType } from '@/lib/judges';
import { getToolsForArena, type Tool } from '@/lib/judges/tools';
import type { ModelScores, JudgeVerdict, JudgeStreamEvent, ModelAnalysis, StructuredJudgeResult } from '@/lib/types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const JUDGE_MODEL = 'anthropic/claude-sonnet-4';

interface JudgeRequest {
  prompt: string;
  responses: Record<string, string>;
  mode?: ArenaMode;
  arena?: ArenaType;  // New arena parameter: 'debate' | 'code' | 'writing'
}

/**
 * Maps ArenaMode ('creative') to ArenaType ('writing') for judge configs
 * This handles the naming difference between modes and judges
 */
function mapModeToArenaType(mode?: ArenaMode, arena?: ArenaType): ArenaType {
  // If arena is explicitly provided, use it
  if (arena) return arena;

  // Map mode to arena type
  switch (mode) {
    case 'creative':
      return 'writing';
    case 'code':
      return 'code';
    case 'debate':
    default:
      return 'debate';
  }
}

/**
 * Converts arena-specific tools to OpenRouter function format
 */
function convertToolsToOpenRouterFormat(tools: Tool[]) {
  return tools.map(tool => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }));
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

  const { prompt, responses, mode, arena } = body as Record<string, unknown>;

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

  // Validate mode if provided (legacy parameter)
  if (mode !== undefined) {
    const validModes: ArenaMode[] = ['debate', 'code', 'creative'];
    if (typeof mode !== 'string' || !validModes.includes(mode as ArenaMode)) {
      return { valid: false, error: 'mode must be one of: debate, code, creative' };
    }
  }

  // Validate arena if provided (new parameter)
  if (arena !== undefined) {
    const validArenas: ArenaType[] = ['debate', 'code', 'writing'];
    if (typeof arena !== 'string' || !validArenas.includes(arena as ArenaType)) {
      return { valid: false, error: 'arena must be one of: debate, code, writing' };
    }
  }

  return {
    valid: true,
    data: {
      prompt: prompt.trim(),
      responses: responses as Record<string, string>,
      mode: (mode as ArenaMode) || 'debate',
      arena: arena as ArenaType | undefined,
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
 * Now supports arena-specific judge personas and tools
 */
async function callOpenRouter(
  messages: OpenRouterMessage[],
  mode: ArenaMode = 'debate',
  arena?: ArenaType
): Promise<OpenRouterResponse> {
  // Determine the effective arena type
  const effectiveArena = mapModeToArenaType(mode, arena);

  // Get judge configuration for this arena
  const judgeConfig = getJudgeConfig(effectiveArena);

  // Use the new arena-specific tools if arena is provided, otherwise fall back to legacy tools
  let tools;
  let systemPrompt: string;

  if (arena) {
    // New behavior: use arena-specific judge config and tools
    systemPrompt = judgeConfig.systemPrompt;
    const arenaTools = getToolsForArena(effectiveArena);
    tools = convertToolsToOpenRouterFormat(arenaTools);
  } else {
    // Legacy behavior: use the old judge-tools system
    systemPrompt = getJudgeSystemPrompt(mode);
    // Import dynamically to avoid circular deps - use the old getJudgeTools
    const { getJudgeTools } = await import('@/lib/judge-tools');
    tools = getJudgeTools(mode);
  }

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: JUDGE_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      tools,
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
 * Now supports arena-specific judging with structured response building
 */
async function runJudgeLoop(
  prompt: string,
  responses: Record<string, string>,
  writer: WritableStreamDefaultWriter<Uint8Array>,
  mode: ArenaMode = 'debate',
  arena?: ArenaType
): Promise<void> {
  // Initialize conversation with the judge prompt
  const messages: OpenRouterMessage[] = [
    { role: 'user', content: buildJudgePrompt(prompt, responses, mode) },
  ];

  // State to accumulate scores and verdict (legacy format)
  const scores: Record<string, ModelScores> = {};
  let verdict: JudgeVerdict | null = null;

  // State for structured response (new arena format)
  const structuredResult: Partial<StructuredJudgeResult> = {
    modelAnalyses: [],
  };
  const modelScoresMap: Record<string, Record<string, number>> = {};

  // Tool-use loop
  while (true) {
    try {
      const data = await callOpenRouter(messages, mode, arena);
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

          const toolName = toolCall.function.name;

          // Handle scoring tools (both legacy and new formats)
          if (toolName.startsWith('score_')) {
            const category = toolName.replace('score_', '');
            const model = args.model as string;
            const score = args.score as number;
            const rationale = args.rationale as string;

            // Initialize model scores if needed (legacy format)
            if (!scores[model]) {
              scores[model] = {};
            }
            // Record in legacy format
            (scores[model] as Record<string, { score: number; rationale: string }>)[category] = { score, rationale };

            // Also track in new format for structured result
            if (!modelScoresMap[model]) {
              modelScoresMap[model] = {};
            }
            modelScoresMap[model][category] = score;

            // Emit scoring event
            await sendEvent(writer, {
              type: 'scoring',
              model,
              category,
              score,
              rationale,
            });
          }

          // Handle opening remarks (new arena tools)
          if (toolName === 'write_opening_remarks') {
            structuredResult.openingRemarks = args.remarks as string;
          }

          // Handle model analysis (new arena tools)
          if (toolName === 'write_model_analysis') {
            const model = args.model as string;
            const analysis: ModelAnalysis = {
              model,
              scores: modelScoresMap[model] || {},
              analysis: args.analysis as string,
              strongestMoment: (args.strongest_moment || args.strongestMoment) as string,
              weakness: args.weakness as string,
            };
            structuredResult.modelAnalyses = structuredResult.modelAnalyses || [];
            structuredResult.modelAnalyses.push(analysis);
          }

          // Handle head-to-head comparison (new arena tools)
          if (toolName === 'write_head_to_head') {
            structuredResult.headToHead = args.comparison as string;
          }

          // Handle verdict tool (both legacy and new formats)
          if (toolName === 'generate_verdict') {
            const winner = args.winner as string;
            const verdictText = args.verdict as string;
            // New format uses quotable_line, legacy uses highlight
            const highlight = (args.quotable_line || args.highlight || '') as string;

            // Set legacy verdict format
            verdict = {
              winner,
              verdict: verdictText,
              highlight,
            };

            // Set structured result fields
            structuredResult.winner = winner;
            structuredResult.verdict = verdictText;
            structuredResult.quotableLine = highlight;

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
            // Sum all scores dynamically (works for any arena)
            for (const scoreData of Object.values(modelScores)) {
              if (scoreData && typeof scoreData === 'object' && 'score' in scoreData) {
                total += (scoreData as { score: number }).score;
              }
            }
            modelTotals[model] = total;
          }

          const winner = Object.entries(modelTotals).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];

          const arenaType = mapModeToArenaType(mode, arena);
          const arenaLabel = arenaType === 'writing' ? 'writing challenge' : arenaType === 'code' ? 'coding challenge' : 'debate';

          verdict = {
            winner,
            verdict: `Based on the scores, ${winner} wins this ${arenaLabel}.`,
            highlight: 'See individual scores for details.',
          };

          structuredResult.winner = winner;
          structuredResult.verdict = verdict.verdict;
          structuredResult.quotableLine = verdict.highlight;

          await sendEvent(writer, {
            type: 'verdict',
            winner: verdict.winner,
            verdict: verdict.verdict,
            highlight: verdict.highlight,
          });
        }

        // Emit complete event with both legacy and structured data
        await sendEvent(writer, {
          type: 'complete',
          scores,
          verdict: verdict || {
            winner: 'Unknown',
            verdict: 'Unable to determine a winner.',
            highlight: '',
          },
          // Include structured result if arena-specific judging was used
          ...(arena ? { structuredResult: structuredResult as StructuredJudgeResult } : {}),
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

  const { prompt, responses, mode, arena } = validation.data;

  // Create the SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  // Run the judge loop in the background
  // Pass arena parameter for arena-specific judging
  runJudgeLoop(prompt, responses, writer, mode, arena)
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
