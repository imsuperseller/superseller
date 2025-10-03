import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { firstName, lastName, email, businessDescription, targetLeads, pricingTier, leads } = paymentIntent.metadata;

  if (!firstName || !lastName || !email || !businessDescription || !targetLeads || !pricingTier) {
    console.error('Missing required metadata in payment intent');
    return;
  }

  // Prepare data for n8n webhook
  const webhookData = {
    firstName,
    lastName,
    email,
    businessDescription,
    targetLeads,
    tier: pricingTier,
    leads: parseInt(leads),
    paymentIntentId: paymentIntent.id,
    customerId: paymentIntent.customer,
    timestamp: new Date().toISOString()
  };

  try {
    // Send to n8n webhook
    const n8nResponse = await fetch('http://173.254.201.134:5678/webhook/lead-enrichment-saas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n webhook failed: ${n8nResponse.status}`);
    }

    console.log('Successfully triggered n8n workflow for payment:', paymentIntent.id);
    
    // Log to database for tracking
    await logPaymentSuccess(paymentIntent.id, webhookData);

  } catch (error) {
    console.error('Failed to trigger n8n workflow:', error);
    // You might want to implement retry logic or alerting here
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed for intent:', paymentIntent.id);
  
  // Log payment failure for tracking
  await logPaymentFailure(paymentIntent.id, paymentIntent.last_payment_error);
}

async function logPaymentSuccess(paymentIntentId: string, data: any) {
  try {
    // Log to your database or external service
    // This could be Airtable, your database, or a logging service
    console.log('Payment success logged:', { paymentIntentId, data });
  } catch (error) {
    console.error('Failed to log payment success:', error);
  }
}

async function logPaymentFailure(paymentIntentId: string, error: any) {
  try {
    // Log payment failure for analysis
    console.log('Payment failure logged:', { paymentIntentId, error });
  } catch (logError) {
    console.error('Failed to log payment failure:', logError);
  }
}
