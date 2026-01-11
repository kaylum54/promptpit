/**
 * OpenRouter API Helper for PromptPit
 * Handles streaming chat completions with support for tool calls
 */

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface StreamDelta {
  content?: string;
  tool_calls?: Array<{
    index: number;
    id?: string;
    type?: 'function';
    function?: {
      name?: string;
      arguments?: string;
    };
  }>;
}

export interface StreamChoice {
  index: number;
  delta: StreamDelta;
  finish_reason: string | null;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: StreamChoice[];
}

export interface ParsedChunk {
  type: 'content' | 'tool_call' | 'done' | 'error';
  content?: string;
  toolCall?: {
    id: string;
    name: string;
    arguments: string;
  };
  error?: string;
}

// OpenRouter API Configuration
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

function getHeaders(): HeadersInit {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'PromptPit',
  };
}

/**
 * Creates a streaming chat completion request to OpenRouter
 *
 * @param modelId - The OpenRouter model ID (e.g., "anthropic/claude-sonnet-4")
 * @param messages - Array of conversation messages
 * @param tools - Optional array of tool definitions for function calling
 * @returns ReadableStream that yields parsed chunks
 */
export async function streamChat(
  modelId: string,
  messages: Message[],
  tools?: Tool[]
): Promise<ReadableStream<ParsedChunk>> {
  const requestBody: Record<string, unknown> = {
    model: modelId,
    messages,
    stream: true,
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
    requestBody.tool_choice = 'auto';
  }

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  // Track accumulated tool calls by index
  const toolCallAccumulators: Map<number, {
    id: string;
    name: string;
    arguments: string;
  }> = new Map();

  return new ReadableStream<ParsedChunk>({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            // Emit any completed tool calls before closing
            for (const toolCall of Array.from(toolCallAccumulators.values())) {
              controller.enqueue({
                type: 'tool_call',
                toolCall,
              });
            }
            controller.enqueue({ type: 'done' });
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last potentially incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();

            if (!trimmedLine || !trimmedLine.startsWith('data: ')) {
              continue;
            }

            const data = trimmedLine.slice(6); // Remove 'data: ' prefix

            // Handle stream termination
            if (data === '[DONE]') {
              // Emit any completed tool calls
              for (const toolCall of Array.from(toolCallAccumulators.values())) {
                controller.enqueue({
                  type: 'tool_call',
                  toolCall,
                });
              }
              controller.enqueue({ type: 'done' });
              controller.close();
              return;
            }

            try {
              const chunk: StreamChunk = JSON.parse(data);

              for (const choice of chunk.choices) {
                const delta = choice.delta;

                // Handle content delta
                if (delta.content) {
                  controller.enqueue({
                    type: 'content',
                    content: delta.content,
                  });
                }

                // Handle tool call deltas
                if (delta.tool_calls) {
                  for (const toolCallDelta of delta.tool_calls) {
                    const index = toolCallDelta.index;

                    // Initialize accumulator if needed
                    if (!toolCallAccumulators.has(index)) {
                      toolCallAccumulators.set(index, {
                        id: '',
                        name: '',
                        arguments: '',
                      });
                    }

                    const accumulator = toolCallAccumulators.get(index)!;

                    // Accumulate tool call data
                    if (toolCallDelta.id) {
                      accumulator.id = toolCallDelta.id;
                    }
                    if (toolCallDelta.function?.name) {
                      accumulator.name = toolCallDelta.function.name;
                    }
                    if (toolCallDelta.function?.arguments) {
                      accumulator.arguments += toolCallDelta.function.arguments;
                    }
                  }
                }

                // Check for finish reason
                if (choice.finish_reason === 'tool_calls') {
                  // Emit accumulated tool calls
                  for (const toolCall of Array.from(toolCallAccumulators.values())) {
                    controller.enqueue({
                      type: 'tool_call',
                      toolCall,
                    });
                  }
                  toolCallAccumulators.clear();
                }
              }
            } catch (parseError) {
              // Skip malformed JSON chunks
              console.warn('Failed to parse SSE chunk:', data, parseError);
            }
          }
        }
      } catch (error) {
        controller.enqueue({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        controller.close();
      }
    },

    cancel() {
      reader.cancel();
    },
  });
}

/**
 * Non-streaming chat completion (for simpler use cases)
 */
export async function chat(
  modelId: string,
  messages: Message[],
  tools?: Tool[]
): Promise<{
  content: string;
  toolCalls?: ToolCall[];
}> {
  const requestBody: Record<string, unknown> = {
    model: modelId,
    messages,
    stream: false,
  };

  if (tools && tools.length > 0) {
    requestBody.tools = tools;
    requestBody.tool_choice = 'auto';
  }

  const response = await fetch(OPENROUTER_BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices[0];

  return {
    content: choice.message.content || '',
    toolCalls: choice.message.tool_calls,
  };
}

/**
 * Helper to consume a stream and collect all content
 */
export async function collectStream(stream: ReadableStream<ParsedChunk>): Promise<{
  content: string;
  toolCalls: Array<{ id: string; name: string; arguments: string }>;
}> {
  const reader = stream.getReader();
  let content = '';
  const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    if (value.type === 'content' && value.content) {
      content += value.content;
    } else if (value.type === 'tool_call' && value.toolCall) {
      toolCalls.push(value.toolCall);
    }
  }

  return { content, toolCalls };
}
