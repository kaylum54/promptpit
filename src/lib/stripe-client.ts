'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get the Stripe.js instance (browser-side)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(planId: string): Promise<void> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.url) {
    window.location.href = data.url;
  }
}

/**
 * Redirect to Stripe Customer Portal
 */
export async function redirectToPortal(): Promise<void> {
  const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  if (data.url) {
    window.location.href = data.url;
  }
}
