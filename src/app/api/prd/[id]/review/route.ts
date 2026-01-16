import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getReviewPrompt } from '@/lib/prd-architect-prompts';
import type { PRDReview, PRDReviewConcern } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Models for final review
const REVIEW_MODELS = [
  { key: 'gpt', id: 'openai/gpt-4o' },
  { key: 'gemini', id: 'google/gemini-2.0-flash-001' },
];

/**
 * POST /api/prd/[id]/review
 * Trigger final reviews from GPT-4o and Gemini
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
      .select('*')
      .eq('id', id)
      .single();

    if (!prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    if (prd.user_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if PRD has markdown content to review
    if (!prd.prd_markdown) {
      return NextResponse.json({ error: 'PRD must have generated content to review' }, { status: 400 });
    }

    // Check if reviews already exist
    const { data: existingReviews } = await supabase
      .from('prd_reviews')
      .select('id')
      .eq('prd_id', id);

    if (existingReviews && existingReviews.length > 0) {
      return NextResponse.json({ error: 'Reviews already exist for this PRD' }, { status: 400 });
    }

    // Get reviews from both models in parallel
    const prompt = getReviewPrompt(prd.prd_markdown);

    const reviewPromises = REVIEW_MODELS.map(async ({ key, id: modelId }) => {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://promptpit.com',
            'X-Title': 'PromptPit PRD Review',
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2048,
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
          strengths: parsed.strengths || [],
          concerns: (parsed.concerns || []).map((c: PRDReviewConcern) => ({
            severity: c.severity || 'medium',
            section: c.section || 'General',
            issue: c.issue || '',
            suggestion: c.suggestion || '',
            addressed: false,
          })),
          overall_score: parsed.overall_score || 5,
          summary: parsed.summary || '',
        };
      } catch (error) {
        console.error(`Error getting ${key} review:`, error);
        return {
          model: key,
          strengths: ['Review failed to complete'],
          concerns: [{
            severity: 'low' as const,
            section: 'General',
            issue: 'Review could not be completed',
            suggestion: 'Try regenerating the review',
            addressed: false,
          }],
          overall_score: 5,
          summary: 'Review failed to complete.',
        };
      }
    });

    const reviewResults = await Promise.all(reviewPromises);

    // Save reviews to database
    const savedReviews: PRDReview[] = [];

    for (const review of reviewResults) {
      const { data, error } = await supabase
        .from('prd_reviews')
        .insert({
          prd_id: id,
          model: review.model,
          strengths: review.strengths,
          concerns: review.concerns,
          overall_score: review.overall_score,
          summary: review.summary,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error saving ${review.model} review:`, error);
      } else if (data) {
        savedReviews.push(data as PRDReview);
      }
    }

    // Add a message about the reviews
    const avgScore = reviewResults.reduce((acc, r) => acc + r.overall_score, 0) / reviewResults.length;
    const totalConcerns = reviewResults.reduce((acc, r) => acc + r.concerns.length, 0);
    const highConcerns = reviewResults.reduce(
      (acc, r) => acc + r.concerns.filter((c: PRDReviewConcern) => c.severity === 'high').length,
      0
    );

    let reviewMessage = `## 🔍 Final Review Complete\n\n`;
    reviewMessage += `**Average Score**: ${avgScore.toFixed(1)}/10\n`;
    reviewMessage += `**Total Concerns**: ${totalConcerns} (${highConcerns} high priority)\n\n`;

    for (const review of reviewResults) {
      const modelName = review.model === 'gpt' ? 'GPT-4o' : 'Gemini';
      reviewMessage += `### ${modelName} Review (${review.overall_score}/10)\n\n`;

      if (review.strengths.length > 0) {
        reviewMessage += `**Strengths**:\n`;
        for (const s of review.strengths) {
          reviewMessage += `- ${s}\n`;
        }
        reviewMessage += '\n';
      }

      if (review.concerns.length > 0) {
        reviewMessage += `**Concerns**:\n`;
        for (const c of review.concerns) {
          const icon = c.severity === 'high' ? '🔴' : c.severity === 'medium' ? '🟡' : '🟢';
          reviewMessage += `- ${icon} **${c.section}**: ${c.issue}\n  → ${c.suggestion}\n`;
        }
        reviewMessage += '\n';
      }

      if (review.summary) {
        reviewMessage += `${review.summary}\n\n`;
      }
    }

    await supabase
      .from('prd_messages')
      .insert({
        prd_id: id,
        user_id: auth0User.sub,
        role: 'assistant',
        content: reviewMessage,
        phase: prd.current_phase,
        message_type: 'review',
      });

    // Update PRD status
    await supabase
      .from('prds')
      .update({ status: 'completed' })
      .eq('id', id);

    return NextResponse.json({
      reviews: savedReviews,
      summary: {
        avgScore,
        totalConcerns,
        highConcerns,
      },
    });

  } catch (error) {
    console.error('Error in POST /api/prd/[id]/review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/prd/[id]/review
 * Get reviews for a PRD
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

    // Get reviews
    const { data: reviews } = await supabase
      .from('prd_reviews')
      .select('*')
      .eq('prd_id', id);

    return NextResponse.json({ reviews: reviews || [] });

  } catch (error) {
    console.error('Error in GET /api/prd/[id]/review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/prd/[id]/review
 * Mark a concern as addressed
 */
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Get PRD and verify ownership
    const { data: prd } = await supabase
      .from('prds')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    if (prd.user_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { review_id, concern_index, addressed } = body;

    if (!review_id || typeof concern_index !== 'number' || typeof addressed !== 'boolean') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current review
    const { data: review } = await supabase
      .from('prd_reviews')
      .select('concerns')
      .eq('id', review_id)
      .single();

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Update concern
    const concerns = review.concerns as PRDReviewConcern[];
    if (concern_index >= concerns.length) {
      return NextResponse.json({ error: 'Invalid concern index' }, { status: 400 });
    }

    concerns[concern_index].addressed = addressed;
    concerns[concern_index].addressed_at = addressed ? new Date().toISOString() : undefined;

    const { error: updateError } = await supabase
      .from('prd_reviews')
      .update({ concerns })
      .eq('id', review_id);

    if (updateError) {
      console.error('Error updating concern:', updateError);
      return NextResponse.json({ error: 'Failed to update concern' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in PATCH /api/prd/[id]/review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
