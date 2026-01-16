/**
 * Quick Mode Expand API
 * Converts a quick response into a full debate
 */

import { NextRequest } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { getQuickResponse } from '@/lib/preferences';

export async function POST(request: NextRequest) {
  // Get authenticated user
  let userId: string | null = null;

  try {
    const auth0User = await getAuth0User();

    if (auth0User) {
      userId = auth0User.sub;
    }
  } catch (error) {
    console.error('Error checking auth:', error);
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Parse request body
  let body: { quickResponseId: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { quickResponseId } = body;

  if (!quickResponseId || typeof quickResponseId !== 'string') {
    return new Response(JSON.stringify({ error: 'quickResponseId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Get the quick response
  const quickResponse = await getQuickResponse(quickResponseId);

  if (!quickResponse) {
    return new Response(JSON.stringify({ error: 'Quick response not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify ownership
  if (quickResponse.user_id !== userId) {
    return new Response(JSON.stringify({ error: 'Not authorized to access this response' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Return the data needed to start a debate
  // The actual debate will be started by the frontend calling /api/debate
  // After the debate completes, the frontend should call /api/quick/link to link them
  return new Response(
    JSON.stringify({
      prompt: quickResponse.prompt,
      originalModel: quickResponse.model,
      originalResponse: quickResponse.response,
      category: quickResponse.category,
      quickResponseId,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
