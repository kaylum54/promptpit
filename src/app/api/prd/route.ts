import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getTemplateById } from '@/lib/prd-templates';
import { checkFreeTierLimit } from '@/lib/free-tier';
import { nanoid } from 'nanoid';
import type { PRD, PRDMode, CreatePRDRequest } from '@/lib/types';

/**
 * GET /api/prd
 * List user's PRDs
 */
export async function GET() {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    const { data: prds, error } = await supabase
      .from('prds')
      .select('id, title, mode, status, current_phase, template_id, updated_at, created_at')
      .eq('user_id', auth0User.sub)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching PRDs:', error);
      return NextResponse.json({ error: 'Failed to fetch PRDs' }, { status: 500 });
    }

    return NextResponse.json({
      prds: prds || [],
      total: prds?.length || 0,
    });

  } catch (error) {
    console.error('Error in GET /api/prd:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/prd
 * Create a new PRD
 */
export async function POST(request: Request) {
  try {
    const auth0User = await getAuth0User();
    if (!auth0User) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceRoleClient();

    // Check free tier limits (handles Pro/Admin unlimited access internally)
    const freeTierStatus = await checkFreeTierLimit(auth0User.sub);

    if (!freeTierStatus.canCreate) {
      const resetDateStr = freeTierStatus.resetDate
        ? freeTierStatus.resetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
        : 'next month';
      return NextResponse.json(
        {
          error: 'Monthly PRD limit reached',
          message: `You've used your free PRD this month. Upgrade to Pro for unlimited PRDs, or wait until ${resetDateStr}.`,
          used: freeTierStatus.used,
          limit: freeTierStatus.limit,
          resetDate: freeTierStatus.resetDate?.toISOString() || null,
        },
        { status: 403 }
      );
    }

    const body: CreatePRDRequest = await request.json();
    const { mode, template_id, initial_idea } = body;

    // Validate mode
    if (!mode || !['quick', 'full'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    // Get template defaults if selected
    let templateDefaults: Partial<PRD> = {};
    let templateName: string | undefined;

    if (template_id) {
      const template = getTemplateById(template_id);
      if (template) {
        templateName = template.name;
        templateDefaults = {
          idea_summary: template.default_idea as PRD['idea_summary'],
          features: template.default_features as PRD['features'],
          tech_stack: template.default_tech_stack as PRD['tech_stack'],
        };
      }
    }

    // Generate share token
    const share_token = nanoid(12);

    // Create PRD
    const { data: prd, error: createError } = await supabase
      .from('prds')
      .insert({
        user_id: auth0User.sub,
        title: templateName ? `${templateName} Project` : 'Untitled PRD',
        mode: mode as PRDMode,
        status: 'in_progress',
        current_phase: 1,
        template_id: template_id || null,
        share_token,
        ...templateDefaults,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating PRD:', createError);
      return NextResponse.json({ error: 'Failed to create PRD' }, { status: 500 });
    }

    // Create initial system message
    const systemMessage = initial_idea
      ? `User wants to build: ${initial_idea}`
      : templateName
      ? `User is starting from the "${templateName}" template.`
      : 'User is starting a new PRD.';

    await supabase
      .from('prd_messages')
      .insert({
        prd_id: prd.id,
        user_id: auth0User.sub,
        role: 'system',
        content: systemMessage,
        phase: 1,
        message_type: 'chat',
      });

    return NextResponse.json({ prd });

  } catch (error) {
    console.error('Error in POST /api/prd:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
