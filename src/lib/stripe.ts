import Stripe from 'stripe';

// Lazy-initialize Stripe to avoid build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

// Export getter for Stripe instance (server-side only)
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get subscriptions() { return getStripe().subscriptions; },
  get webhooks() { return getStripe().webhooks; },
};

// Pricing configuration
export const STRIPE_PLANS = {
  pro: {
    name: 'Pro',
    description: 'Unlimited debates, priority support, and more',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 11,
    interval: 'month' as const,
    features: [
      'Unlimited debates per month',
      'All AI models',
      'Priority response times',
      'Custom models via OpenRouter',
      'Debate history export',
      'Priority support',
    ],
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  planId,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  userEmail: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}): Promise<Stripe.Checkout.Session> {
  const plan = STRIPE_PLANS[planId];

  if (!plan) {
    throw new Error(`Invalid plan: ${planId}`);
  }

  // Check if customer already exists
  const existingCustomers = await stripe.customers.list({
    email: userEmail,
    limit: 1,
  });

  let customerId = existingCustomers.data[0]?.id;

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        userId,
      },
    });
    customerId = customer.id;
  } else {
    // Update existing customer with userId if not set
    await stripe.customers.update(customerId, {
      metadata: {
        userId,
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
        planId,
      },
    },
    metadata: {
      userId,
      planId,
    },
  });

  return session;
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string): Promise<Stripe.Customer | null> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  return customers.data[0] || null;
}

/**
 * Get customer's active subscription
 */
export async function getCustomerSubscription(customerId: string): Promise<Stripe.Subscription | null> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'active',
    limit: 1,
  });

  return subscriptions.data[0] || null;
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
