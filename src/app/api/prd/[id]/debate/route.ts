import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getDebatePrompt } from '@/lib/prd-architect-prompts';
import type { PRDDebate, PRDDebateResponse, ChatModelKey, TriggerDebateRequest, SubmitDebateChoiceRequest } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Model configurations for debates
const DEBATE_MODELS: { key: ChatModelKey; id: string }[] = [
  { key: 'claude', id: 'anthropic/claude-sonnet-4' },
  { key: 'gpt', id: 'openai/gpt-4o' },
  { key: 'gemini', id: 'google/gemini-2.0-flash-001' },
  { key: 'llama', id: 'meta-llama/llama-3.3-70b-instruct' },
];

/**
 * POST /api/prd/[id]/debate
 * Trigger a new debate or submit a choice for an existing debate
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Check if user is Pro
    const { data: profile } = await supabase
      .from('promptpit_profiles')
      .select('tier, role')
      .eq('id', auth0User.sub)
      .single();

    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

    if (!isPro) {
      return NextResponse.json(
        { error: 'Pro subscription required for this feature' },
        { status: 403 }
      );
    }

    // Get PRD and verify access
    const { data: prd } = await supabase
      .from('prds')
      .select('user_id, current_phase')
      .eq('id', id)
      .single();

    if (!prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    if (prd.user_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();

    // Check if this is a choice submission or a new debate trigger
    if (body.debate_id) {
      // Submit choice for existing debate
      return await handleDebateChoice(supabase, body as SubmitDebateChoiceRequest);
    } else {
      // Trigger new debate
      return await handleNewDebate(supabase, id, prd.current_phase, body as TriggerDebateRequest, auth0User.sub);
    }

  } catch (error) {
    console.error('Error in POST /api/prd/[id]/debate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handle submitting a choice for an existing debate
 */
async function handleDebateChoice(
  supabase: ReturnType<typeof createServiceRoleClient>,
  body: SubmitDebateChoiceRequest
) {
  const { debate_id, choice, rationale } = body;

  const { data: debate, error: updateError } = await supabase
    .from('prd_debates')
    .update({
      user_choice: choice,
      user_rationale: rationale || null,
    })
    .eq('id', debate_id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating debate:', updateError);
    return NextResponse.json({ error: 'Failed to submit choice' }, { status: 500 });
  }

  return NextResponse.json({ debate });
}

/**
 * Handle triggering a new debate
 */
async function handleNewDebate(
  supabase: ReturnType<typeof createServiceRoleClient>,
  prdId: string,
  phase: number,
  body: TriggerDebateRequest,
  userId: string
) {
  const { decision_type, decision_label, context } = body;

  if (!decision_type || !decision_label || !context) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get recommendations from all models in parallel
  const prompt = getDebatePrompt(decision_type, decision_label, context);

  const modelPromises = DEBATE_MODELS.map(async ({ key, id: modelId }) => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://promptpit.com',
          'X-Title': 'PromptPit PRD Debate',
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      // Parse JSON response
      const parsed = JSON.parse(content);

      return {
        model: key,
        recommendation: parsed.recommendation || 'Unknown',
        reasoning: parsed.reasoning || '',
        pros: parsed.pros || [],
        cons: parsed.cons || [],
      } as PRDDebateResponse;
    } catch (error) {
      console.error(`Error getting ${key} recommendation:`, error);
      return {
        model: key,
        recommendation: 'Error',
        reasoning: 'Failed to get recommendation from this model.',
        pros: [],
        cons: [],
      } as PRDDebateResponse;
    }
  });

  const responses = await Promise.all(modelPromises);

  // Calculate verdict (which recommendation appears most)
  const recommendationCounts: Record<string, number> = {};
  for (const r of responses) {
    if (r.recommendation !== 'Error') {
      const key = r.recommendation.toLowerCase();
      recommendationCounts[key] = (recommendationCounts[key] || 0) + 1;
    }
  }

  let winner = '';
  let maxCount = 0;
  for (const [rec, count] of Object.entries(recommendationCounts)) {
    if (count > maxCount) {
      maxCount = count;
      winner = rec;
    }
  }

  // Find the actual recommendation string (with proper casing)
  const winningResponse = responses.find(
    r => r.recommendation.toLowerCase() === winner
  );

  const verdict = {
    winner: winningResponse?.recommendation || winner,
    vote_count: Object.fromEntries(
      responses.map(r => [r.model, r.recommendation])
    ),
    reasoning: `${maxCount} out of ${responses.length} models recommend ${winningResponse?.recommendation || winner}.`,
  };

  // Save debate
  const { data: debate, error: createError } = await supabase
    .from('prd_debates')
    .insert({
      prd_id: prdId,
      decision_type,
      decision_label,
      context,
      responses,
      verdict,
      phase,
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating debate:', createError);
    return NextResponse.json({ error: 'Failed to create debate' }, { status: 500 });
  }

  // Also save a message about the debate
  await supabase
    .from('prd_messages')
    .insert({
      prd_id: prdId,
      user_id: userId,
      role: 'assistant',
      content: formatDebateResultMessage(debate as PRDDebate),
      phase,
      message_type: 'debate_result',
      metadata: { debate_id: debate.id },
    });

  return NextResponse.json({ debate });
}

/**
 * Format debate result as a message
 */
function formatDebateResultMessage(debate: PRDDebate): string {
  let message = `## 🏟️ Model Debate: ${debate.decision_label}\n\n`;

  for (const response of debate.responses) {
    const modelName = {
      claude: 'Claude',
      gpt: 'GPT-4o',
      gemini: 'Gemini',
      llama: 'Llama',
    }[response.model] || response.model;

    message += `### ${modelName}\n`;
    message += `**Recommends**: ${response.recommendation}\n\n`;
    message += `${response.reasoning}\n\n`;
    message += `**Pros**: ${response.pros.join(', ')}\n`;
    message += `**Cons**: ${response.cons.join(', ')}\n\n`;
  }

  if (debate.verdict) {
    message += `---\n\n`;
    message += `**🏆 Consensus**: ${debate.verdict.winner}\n`;
    message += `${debate.verdict.reasoning}\n\n`;
    message += `*Click on a model's recommendation to select it, or type your own choice.*`;
  }

  return message;
}

/**
 * GET /api/prd/[id]/debate
 * Get all debates for a PRD
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get PRD and verify access
    const { data: prd } = await supabase
      .from('prds')
      .select('user_id, is_public, collaborators')
      .eq('id', id)
      .single();

    if (!prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    const isOwner = prd.user_id === auth0User.sub;
    const isPublic = prd.is_public;
    const isCollaborator = prd.collaborators?.some(
      (c: { user_id: string }) => c.user_id === auth0User.sub
    );

    if (!isOwner && !isPublic && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get debates
    const { data: debates } = await supabase
      .from('prd_debates')
      .select('*')
      .eq('prd_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({ debates: debates || [] });

  } catch (error) {
    console.error('Error in GET /api/prd/[id]/debate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
