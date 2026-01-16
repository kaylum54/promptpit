import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getArchitectSystemPrompt } from '@/lib/prd-architect-prompts';
import { getTemplateById } from '@/lib/prd-templates';
import type { PRDMode, PRDMessage, PRDMessageStreamEvent, PRDDecisionType } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Model to use for the architect
const ARCHITECT_MODEL = 'anthropic/claude-sonnet-4';

/**
 * POST /api/prd/[id]/message
 * Send a message to the PRD architect AI
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabase = createServiceRoleClient();

    // Get PRD and verify access
    const { data: prd } = await supabase
      .from('prds')
      .select('*')
      .eq('id', id)
      .single();

    if (!prd) {
      return new Response(JSON.stringify({ error: 'PRD not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (prd.user_id !== auth0User.sub) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Message content required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Save user message
    await supabase
      .from('prd_messages')
      .insert({
        prd_id: id,
        user_id: auth0User.sub,
        role: 'user',
        content,
        phase: prd.current_phase,
        message_type: 'chat',
      });

    // Get previous messages for context
    const { data: previousMessages } = await supabase
      .from('prd_messages')
      .select('role, content')
      .eq('prd_id', id)
      .order('created_at', { ascending: true })
      .limit(50);

    // Get template if applicable
    let template = undefined;
    if (prd.template_id) {
      const t = getTemplateById(prd.template_id);
      if (t) {
        template = {
          name: t.name,
          description: t.description,
          default_idea: t.default_idea,
          default_features: t.default_features,
          default_tech_stack: t.default_tech_stack,
          common_pitfalls: t.common_pitfalls,
        };
      }
    }

    // Build context from PRD data
    const prdContext = {
      title: prd.title,
      idea_summary: prd.idea_summary,
      features: prd.features,
      tech_stack: prd.tech_stack,
    };

    // Get system prompt for current phase
    const systemPrompt = getArchitectSystemPrompt(
      prd.mode as PRDMode,
      prd.current_phase,
      prdContext,
      template
    );

    // Build messages array
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...((previousMessages || []) as PRDMessage[])
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
    ];

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: PRDMessageStreamEvent) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };

        try {
          // Call OpenRouter API
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://promptpit.com',
              'X-Title': 'PromptPit PRD Builder',
            },
            body: JSON.stringify({
              model: ARCHITECT_MODEL,
              messages,
              stream: true,
              max_tokens: 4096,
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
                    fullContent += content;
                    sendEvent({ type: 'chunk', content });
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Check for special triggers in the response
          let debateInfo = undefined;
          let shouldTriggerReview = false;

          // Check for MODEL_DEBATE trigger
          const debateMatch = fullContent.match(/🏟️ MODEL_DEBATE\nDecision: (\w+)\nLabel: ([^\n]+)\nContext: (\{[\s\S]*?\})/);
          if (debateMatch) {
            try {
              debateInfo = {
                decision_type: debateMatch[1] as PRDDecisionType,
                label: debateMatch[2],
                context: JSON.parse(debateMatch[3]),
              };
            } catch {
              // Invalid context JSON, ignore
            }
          }

          // Check for TRIGGER_REVIEW
          if (fullContent.includes('🔍 TRIGGER_REVIEW')) {
            shouldTriggerReview = true;
          }

          // Check for phase completion hints
          if (fullContent.toLowerCase().includes("say 'continue'") ||
              fullContent.toLowerCase().includes('say "continue"')) {
            // User can now move to next phase
          }

          // Save assistant message
          const { data: assistantMessage } = await supabase
            .from('prd_messages')
            .insert({
              prd_id: id,
              user_id: auth0User.sub,
              role: 'assistant',
              content: fullContent,
              phase: prd.current_phase,
              message_type: debateInfo ? 'debate_intro' : 'chat',
              metadata: debateInfo ? { debate_info: debateInfo } : undefined,
            })
            .select()
            .single();

          // Send completion event
          const completionEvent: PRDMessageStreamEvent = {
            type: 'complete',
            message_id: assistantMessage?.id,
          };

          if (debateInfo) {
            completionEvent.type = 'debate_trigger';
            completionEvent.debate_info = debateInfo as PRDMessageStreamEvent['debate_info'];
          } else if (shouldTriggerReview) {
            completionEvent.type = 'review_trigger';
          }

          sendEvent(completionEvent);

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
    console.error('Error in POST /api/prd/[id]/message:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
