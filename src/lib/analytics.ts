'use client';

import { createClient } from './supabase-browser';

/**
 * Allowed analytics event names
 */
export type AnalyticsEventName =
  | 'page_view'
  | 'signup_started'
  | 'signup_completed'
  | 'login'
  | 'debate_started'
  | 'debate_completed'
  | 'upgrade_clicked'
  | 'checkout_started'
  | 'subscription_created'
  | 'feedback_submitted';

/**
 * Analytics event payload sent to the API
 */
interface AnalyticsPayload {
  event_name: AnalyticsEventName;
  user_id: string | null;
  guest_id: string;
  properties?: Record<string, unknown>;
  page_url: string;
}

const GUEST_ID_KEY = 'promptpit_guest_id';

/**
 * Generates a unique guest ID using crypto.randomUUID or fallback
 */
function generateGuestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a guest ID stored in localStorage.
 * Returns an existing guest ID if available, otherwise generates and stores a new one.
 */
export function getGuestId(): string {
  if (typeof window === 'undefined') {
    // Server-side rendering fallback
    return generateGuestId();
  }

  try {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    if (!guestId) {
      guestId = generateGuestId();
      localStorage.setItem(GUEST_ID_KEY, guestId);
    }
    return guestId;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
    return generateGuestId();
  }
}

/**
 * Gets the current user ID from Supabase auth session.
 * Returns null if no user is authenticated.
 */
async function getUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Tracks an analytics event by sending it to the analytics API endpoint.
 *
 * This function is designed to fail silently - it will never throw an error
 * or break the application if analytics tracking fails.
 *
 * @param eventName - The name of the event to track (must be a valid AnalyticsEventName)
 * @param properties - Optional additional properties to include with the event
 *
 * @example
 * ```typescript
 * // Track a simple event
 * await trackEvent('page_view');
 *
 * // Track an event with properties
 * await trackEvent('debate_completed', {
 *   debate_id: '123',
 *   duration_ms: 5000,
 *   winner: 'model_a'
 * });
 * ```
 */
export async function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, unknown>
): Promise<void> {
  try {
    const [userId, guestId] = await Promise.all([
      getUserId(),
      Promise.resolve(getGuestId()),
    ]);

    const payload: AnalyticsPayload = {
      event_name: eventName,
      user_id: userId,
      guest_id: guestId,
      properties,
      page_url: typeof window !== 'undefined' ? window.location.href : '',
    };

    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent failure - analytics errors should never break the app
  }
}
