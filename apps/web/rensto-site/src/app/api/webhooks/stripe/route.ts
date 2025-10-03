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

    // Log webhook event to Airtable with proper error handling
    try {
      await airtable.logWebhookEvent({
        eventType: event.type,
        eventId: event.id,
        processed: result.processed,
        timestamp: result.timestamp || new Date().toISOString(),
        processingResult: result.processingResult
      });
    } catch (airtableError) {
      console.error('❌ Failed to log webhook event to Airtable:', airtableError);
      // Return error to Stripe so it will retry
      return NextResponse.json(
        { success: false, error: 'Failed to log webhook event' },
        { status: 500 }
      );
    }

    // Return success only if webhook was processed successfully
    if (!result.processed) {
      console.log(`⚠️ Webhook event ${event.type} was not processed`);
    }

    return NextResponse.json({
      success: true,
      event: event.type,
      processed: result.processed,
      eventId: result.eventId
    });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
