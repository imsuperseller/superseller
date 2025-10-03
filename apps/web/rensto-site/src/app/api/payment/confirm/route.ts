import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { AirtableApi } from '@/lib/airtable';

const stripe = new StripeApi();
const airtable = new AirtableApi();

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Confirm payment
    const confirmation = await stripe.confirmPayment(paymentIntentId);

    if (!confirmation.success) {
      return NextResponse.json(
        { success: false, error: confirmation.error },
        { status: 500 }
      );
    }

    // Update payment status in Airtable
    await airtable.updatePaymentStatus(paymentIntentId, confirmation.status);

    // If payment succeeded, grant template access
    if (confirmation.status === 'succeeded') {
      await airtable.grantTemplateAccess(paymentIntentId);
    }

    return NextResponse.json({
      success: true,
      status: confirmation.status,
      paymentIntent: confirmation.paymentIntent
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
