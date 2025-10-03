import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { AirtableApi } from '@/lib/airtable';

const stripe = new StripeApi();
const airtable = new AirtableApi();

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing stripe signature' },
        { status: 400 }
      );
    }

    // Handle webhook
    const webhookResult = await stripe.handleWebhook(body, signature);

    if (!webhookResult.success) {
      return NextResponse.json(
        { success: false, error: webhookResult.error },
        { status: 400 }
      );
    }

    // Process webhook event
    const event = webhookResult.event;
    const result = webhookResult.result;

    // Log webhook event to Airtable
    await airtable.logWebhookEvent({
      eventType: event.type,
      eventId: event.id,
      processed: result.processed,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      event: event.type,
      processed: result.processed
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
