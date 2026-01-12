import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase';
import Stripe from 'stripe';

// Disable body parsing - we need the raw body for webhook signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          // Get subscription details
          const subscriptionResponse = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          const subscription = subscriptionResponse as Stripe.Subscription;

          // Update user to Pro tier
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEnd = (subscription as any).current_period_end;
          const { error } = await supabase
            .from('promptpit_profiles')
            .update({
              tier: 'pro',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              subscription_status: subscription.status,
              subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq('id', userId);

          if (error) {
            console.error('Error updating user after checkout:', error);
          } else {
            console.log(`User ${userId} upgraded to Pro`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID
        const { data: profile } = await supabase
          .from('promptpit_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const tier = subscription.status === 'active' ? 'pro' : 'free';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const periodEnd = (subscription as any).current_period_end;

          const { error } = await supabase
            .from('promptpit_profiles')
            .update({
              tier,
              subscription_status: subscription.status,
              subscription_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
            })
            .eq('id', profile.id);

          if (error) {
            console.error('Error updating subscription:', error);
          } else {
            console.log(`User ${profile.id} subscription updated to ${subscription.status}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by Stripe customer ID and downgrade to free
        const { data: profile } = await supabase
          .from('promptpit_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const { error } = await supabase
            .from('promptpit_profiles')
            .update({
              tier: 'free',
              subscription_status: 'canceled',
              stripe_subscription_id: null,
            })
            .eq('id', profile.id);

          if (error) {
            console.error('Error downgrading user:', error);
          } else {
            console.log(`User ${profile.id} downgraded to free`);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        // Find user and update subscription status
        const { data: profile } = await supabase
          .from('promptpit_profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (profile) {
          const { error } = await supabase
            .from('promptpit_profiles')
            .update({
              subscription_status: 'past_due',
            })
            .eq('id', profile.id);

          if (error) {
            console.error('Error updating payment status:', error);
          } else {
            console.log(`User ${profile.id} payment failed`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
