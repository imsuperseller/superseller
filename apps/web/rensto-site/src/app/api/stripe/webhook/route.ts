import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const N8N_URL = 'http://173.254.201.134:5678';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe Webhook Handler
 *
 * Listens for Stripe events and triggers n8n workflows:
 * - checkout.session.completed
 * - payment_intent.succeeded
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 */

async function triggerN8nWorkflow(webhookUrl: string, data: any) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.error('n8n webhook trigger failed:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('n8n webhook trigger error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing Stripe signature or webhook secret');
    return NextResponse.json({ error: 'Webhook signature required' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('✅ Stripe webhook received:', event.type);

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};
      const flowType = metadata.flowType;

      console.log('💳 Payment completed:', {
        sessionId: session.id,
        customerEmail: session.customer_email,
        amount: session.amount_total,
        flowType,
        metadata
      });

      // Trigger appropriate n8n workflow based on flowType
      const webhookMap: Record<string, string> = {
        'marketplace-template': `${N8N_URL}/webhook/stripe-marketplace-template`,
        'marketplace-install': `${N8N_URL}/webhook/stripe-marketplace-install`,
        'ready-solutions': `${N8N_URL}/webhook/stripe-ready-solutions`,
        'subscription': `${N8N_URL}/webhook/stripe-subscription`,
        'custom-solutions': `${N8N_URL}/webhook/stripe-custom`
      };

      const webhookUrl = webhookMap[flowType];
      if (webhookUrl) {
        const payload = {
          event: 'payment_completed',
          sessionId: session.id,
          customerEmail: session.customer_email,
          customerName: metadata.customerName,
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency,
          flowType,
          tier: metadata.tier,
          subscriptionType: metadata.subscriptionType,
          productId: metadata.productId,
          metadata,
          timestamp: new Date().toISOString()
        };

        await triggerN8nWorkflow(webhookUrl, payload);
      }

      break;

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('💰 Payment succeeded:', paymentIntent.id);
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object as Stripe.Subscription;
      console.log('🔄 Subscription created:', subscription.id);

      // Trigger n8n subscription onboarding workflow
      await triggerN8nWorkflow(
        `${N8N_URL}/webhook/stripe-subscription-created`,
        {
          event: 'subscription_created',
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          metadata: subscription.metadata,
          timestamp: new Date().toISOString()
        }
      );
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      console.log('🔄 Subscription updated:', updatedSubscription.id);
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      console.log('❌ Subscription canceled:', deletedSubscription.id);

      // Trigger n8n subscription cancellation workflow
      await triggerN8nWorkflow(
        `${N8N_URL}/webhook/stripe-subscription-canceled`,
        {
          event: 'subscription_canceled',
          subscriptionId: deletedSubscription.id,
          customerId: deletedSubscription.customer,
          metadata: deletedSubscription.metadata,
          timestamp: new Date().toISOString()
        }
      );
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
