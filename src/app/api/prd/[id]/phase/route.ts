import { NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { getPhaseCount } from '@/lib/prd-architect-prompts';
import type { PRDMode } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/prd/[id]/phase
 * Advance to the next phase or go back to a previous phase
 */
export async function POST(request: Request, { params }: RouteParams) {
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
      .select('user_id, mode, current_phase, status')
      .eq('id', id)
      .single();

    if (!prd) {
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 });
    }

    if (prd.user_id !== auth0User.sub) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (prd.status === 'completed' || prd.status === 'archived') {
      return NextResponse.json({ error: 'Cannot modify completed or archived PRD' }, { status: 400 });
    }

    const body = await request.json();
    const { action, target_phase } = body;

    const maxPhase = getPhaseCount(prd.mode as PRDMode);
    let newPhase = prd.current_phase;

    if (action === 'next') {
      // Advance to next phase
      if (prd.current_phase >= maxPhase) {
        return NextResponse.json({ error: 'Already at final phase' }, { status: 400 });
      }
      newPhase = prd.current_phase + 1;
    } else if (action === 'back') {
      // Go back one phase
      if (prd.current_phase <= 1) {
        return NextResponse.json({ error: 'Already at first phase' }, { status: 400 });
      }
      newPhase = prd.current_phase - 1;
    } else if (action === 'goto' && typeof target_phase === 'number') {
      // Go to specific phase
      if (target_phase < 1 || target_phase > maxPhase) {
        return NextResponse.json({ error: 'Invalid phase number' }, { status: 400 });
      }
      newPhase = target_phase;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update status if completing
    let newStatus = prd.status;
    if (newPhase === maxPhase && action === 'next') {
      // Moving to output phase
      newStatus = 'review';
    }

    const { data: updatedPrd, error: updateError } = await supabase
      .from('prds')
      .update({
        current_phase: newPhase,
        status: newStatus,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating phase:', updateError);
      return NextResponse.json({ error: 'Failed to update phase' }, { status: 500 });
    }

    // Add system message about phase change
    await supabase
      .from('prd_messages')
      .insert({
        prd_id: id,
        user_id: auth0User.sub,
        role: 'system',
        content: `Moved to phase ${newPhase}.`,
        phase: newPhase,
        message_type: 'chat',
      });

    return NextResponse.json({
      prd: updatedPrd,
      phase: newPhase,
      maxPhase,
    });

  } catch (error) {
    console.error('Error in POST /api/prd/[id]/phase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
