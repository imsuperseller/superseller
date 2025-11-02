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

    // Update payment status in Airtable (if method exists)
    try {
      if (typeof (airtable as any).updatePaymentStatus === 'function') {
        await (airtable as any).updatePaymentStatus(paymentIntentId, confirmation.status);
      }
    } catch (error) {
      console.warn('Airtable updatePaymentStatus not available:', error);
    }

    // If payment succeeded, grant template access (if method exists)
    if (confirmation.status === 'succeeded') {
      try {
        if (typeof (airtable as any).grantTemplateAccess === 'function') {
          await (airtable as any).grantTemplateAccess(paymentIntentId);
        }
      } catch (error) {
        console.warn('Airtable grantTemplateAccess not available:', error);
      }
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
