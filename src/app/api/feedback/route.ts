import { NextRequest, NextResponse } from 'next/server';
import { getAuth0User } from '@/lib/auth0';
import { createServiceRoleClient } from '@/lib/supabase';
import { rateLimit, RATE_LIMITS, getRateLimitHeaders, createRateLimitResponse } from '@/lib/rate-limit';

// Request body type for POST
interface FeedbackRequest {
  category: string;
  message: string;
  email?: string;
  page_url?: string;
}

// Response type for POST
interface FeedbackResponse {
  success: boolean;
  id?: string;
}

/**
 * POST /api/feedback - Submit user feedback
 *
 * Accepts feedback from users and saves it to the database.
 * If user is authenticated, associates the feedback with their account.
 */
export async function POST(request: NextRequest) {
  // Check rate limit first (5 requests per minute per IP to prevent spam)
  const rateLimitResult = rateLimit(request, 'feedback', RATE_LIMITS.feedback);
  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      );
    }

    // Get current user (if logged in)
    const auth0User = await getAuth0User();

    // Get user agent from request headers
    const userAgent = request.headers.get('user-agent') || null;

    // Prepare feedback data
    const feedbackData = {
      user_id: auth0User?.sub ?? null,
      email: body.email || auth0User?.email || null,
      category: body.category || null,
      message: body.message,
      page_url: body.page_url || null,
      user_agent: userAgent,
    };

    // Use service role client for inserts to bypass RLS
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving feedback:', error);
      return NextResponse.json(
        { error: 'Failed to save feedback', details: error.message },
        { status: 500 }
      );
    }

    const response: FeedbackResponse = {
      success: true,
      id: data?.id,
    };

    // Include rate limit headers in successful response
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
    return NextResponse.json(response, {
      status: 201,
      headers: rateLimitHeaders,
    });
  } catch (error) {
    console.error('Error in POST /api/feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
