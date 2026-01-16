import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getRoutingDecision } from '@/lib/routing';
import { detectIntent } from '@/lib/intent-detection';
import { MODELS } from '@/lib/models';
import type { ChatModelKey, ChatStreamEvent, SendMessageRequest } from '@/lib/types';

// Model ID mapping
const MODEL_IDS: Record<ChatModelKey, string> = {
  claude: 'anthropic/claude-sonnet-4',
  gpt: 'openai/gpt-4o',
  gemini: 'google/gemini-2.0-flash-001',
  llama: 'meta-llama/llama-3.3-70b-instruct',
};

/**
 * POST /api/chats/message
 * Sends a message to a chat with AI routing and streaming response
 */
export async function POST(request: Request) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body: SendMessageRequest = await request.json();
    const { chat_id, content, force_model } = body;

    if (!chat_id || !content) {
      return new Response(JSON.stringify({ error: 'Missing chat_id or content' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createServiceRoleClient();

    // Verify chat ownership
    const { data: chat } = await serviceClient
      .from('chats')
      .select('id, user_id')
      .eq('id', chat_id)
      .eq('user_id', auth0User.sub)
      .single();

    if (!chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save user message
    const { error: userMsgError } = await serviceClient
      .from('chat_messages')
      .insert({
        chat_id,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      return new Response(JSON.stringify({ error: 'Failed to save message' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Detect intent and route to model
    const category = detectIntent(content);
    let selectedModel: ChatModelKey;
    let routingReason: string;

    if (force_model) {
      // User manually selected a model
      selectedModel = force_model;
      routingReason = `Manually selected ${MODELS[force_model]?.name || force_model}`;
    } else {
      // Use AI routing
      const routingDecision = await getRoutingDecision(auth0User.sub, category);
      selectedModel = routingDecision.model as ChatModelKey;
      routingReason = routingDecision.reason;
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: ChatStreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        // Send routing info
        sendEvent({
          type: 'routing',
          model: selectedModel,
          category: category,
          routing_reason: routingReason,
        });

        try {
          // Get previous messages for context
          const { data: previousMessages } = await serviceClient
            .from('chat_messages')
            .select('role, content')
            .eq('chat_id', chat_id)
            .order('created_at', { ascending: true })
            .limit(20);

          // Build messages array for the model
          const typedPrevMessages = (previousMessages || []) as Array<{ role: string; content: string }>;
          const messages = [
            {
              role: 'system' as const,
              content: `You are a helpful AI assistant. Be concise and direct in your responses. The user has asked a ${category} type question.`,
            },
            ...typedPrevMessages
              .filter((m) => m.role !== 'system')
              .slice(-10) // Last 10 messages for context
              .map((m) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
              })),
          ];

          // Call OpenRouter API
          const startTime = Date.now();
          let ttft: number | null = null;
          const modelId = MODEL_IDS[selectedModel];

          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://promptpit.com',
              'X-Title': 'PromptPit Quick Mode',
            },
            body: JSON.stringify({
              model: modelId,
              messages,
              stream: true,
              max_tokens: 2048,
            }),
          });

          if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body');
          }

          const decoder = new TextDecoder();
          let fullContent = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    if (ttft === null) {
                      ttft = Date.now() - startTime;
                    }
                    fullContent += content;
                    sendEvent({ type: 'chunk', content });
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          const totalTime = Date.now() - startTime;

          // Save assistant message
          const { data: assistantMessage, error: assistantMsgError } = await serviceClient
            .from('chat_messages')
            .insert({
              chat_id,
              role: 'assistant',
              content: fullContent,
              model: selectedModel,
              category: category,
              routing_reason: routingReason,
              metadata: {
                latency_ms: totalTime,
                ttft_ms: ttft,
                tokens: Math.ceil(fullContent.length / 4), // Rough estimate
              },
              created_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (assistantMsgError) {
            console.error('Error saving assistant message:', assistantMsgError);
          }

          // Send completion event
          sendEvent({
            type: 'complete',
            message_id: assistantMessage?.id,
            metadata: {
              latency_ms: totalTime,
              ttft_ms: ttft || undefined,
            },
          });

        } catch (error) {
          console.error('Streaming error:', error);
          sendEvent({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in POST /api/chats/message:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
