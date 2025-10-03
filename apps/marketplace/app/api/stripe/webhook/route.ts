import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);
  
  const { metadata } = session;
  const customerEmail = metadata?.customerEmail;
  const type = metadata?.type;
  
  if (!customerEmail) {
    console.error('No customer email in session metadata');
    return;
  }

  // Handle different purchase types
  if (type === 'product') {
    await handleProductPurchase(session, metadata);
  } else if (type === 'subscription') {
    await handleSubscriptionPurchase(session, metadata);
  } else if (type === 'deployment') {
    await handleDeploymentPurchase(session, metadata);
  }

  // Send confirmation email
  await sendPurchaseConfirmationEmail(customerEmail, session, metadata);
}

async function handleProductPurchase(session: Stripe.Checkout.Session, metadata: Record<string, string>) {
  const productId = metadata.productId;
  
  if (!productId) {
    console.error('No product ID in metadata');
    return;
  }

  // Grant access to product
  await grantProductAccess(session.customer as string, productId);
  
  // Create customer record in Airtable
  await createCustomerRecord(session, {
    type: 'product',
    productId,
  });
}

async function handleSubscriptionPurchase(session: Stripe.Checkout.Session, metadata: Record<string, string>) {
  const subscriptionTier = metadata.subscriptionTier;
  
  if (!subscriptionTier) {
    console.error('No subscription tier in metadata');
    return;
  }

  // Grant subscription access
  await grantSubscriptionAccess(session.customer as string, subscriptionTier);
  
  // Create customer record in Airtable
  await createCustomerRecord(session, {
    type: 'subscription',
    subscriptionTier,
  });
}

async function handleDeploymentPurchase(session: Stripe.Checkout.Session, metadata: Record<string, string>) {
  const deploymentPackage = metadata.deploymentPackage;
  
  if (!deploymentPackage) {
    console.error('No deployment package in metadata');
    return;
  }

  // Schedule deployment service
  await scheduleDeploymentService(session.customer as string, deploymentPackage);
  
  // Create customer record in Airtable
  await createCustomerRecord(session, {
    type: 'deployment',
    deploymentPackage,
  });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  
  // Update customer access
  await updateCustomerSubscription(subscription.customer as string, subscription);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);
  
  // Update customer access
  await updateCustomerSubscription(subscription.customer as string, subscription);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);
  
  // Revoke customer access
  await revokeCustomerSubscription(subscription.customer as string, subscription);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id);
  
  // Send payment confirmation
  if (invoice.customer_email) {
    await sendPaymentConfirmationEmail(invoice.customer_email, invoice);
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id);
  
  // Send payment failure notification
  if (invoice.customer_email) {
    await sendPaymentFailureEmail(invoice.customer_email, invoice);
  }
}

// Helper functions (implement these based on your needs)
async function grantProductAccess(customerId: string, productId: string) {
  // Implement product access granting logic
  console.log(`Granting product access: ${productId} to customer: ${customerId}`);
}

async function grantSubscriptionAccess(customerId: string, subscriptionTier: string) {
  // Implement subscription access granting logic
  console.log(`Granting subscription access: ${subscriptionTier} to customer: ${customerId}`);
}

async function scheduleDeploymentService(customerId: string, deploymentPackage: string) {
  // Implement deployment service scheduling logic
  console.log(`Scheduling deployment service: ${deploymentPackage} for customer: ${customerId}`);
}

async function updateCustomerSubscription(customerId: string, subscription: Stripe.Subscription) {
  // Implement subscription update logic
  console.log(`Updating subscription for customer: ${customerId}`);
}

async function revokeCustomerSubscription(customerId: string, subscription: Stripe.Subscription) {
  // Implement subscription revocation logic
  console.log(`Revoking subscription for customer: ${customerId}`);
}

async function createCustomerRecord(session: Stripe.Checkout.Session, purchaseData: any) {
  // Implement Airtable customer record creation
  console.log('Creating customer record:', session.customer_email, purchaseData);
}

async function sendPurchaseConfirmationEmail(email: string, session: Stripe.Checkout.Session, metadata: Record<string, string>) {
  // Implement email sending logic
  console.log(`Sending purchase confirmation to: ${email}`);
}

async function sendPaymentConfirmationEmail(email: string, invoice: Stripe.Invoice) {
  // Implement payment confirmation email
  console.log(`Sending payment confirmation to: ${email}`);
}

async function sendPaymentFailureEmail(email: string, invoice: Stripe.Invoice) {
  // Implement payment failure email
  console.log(`Sending payment failure notification to: ${email}`);
}

