import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new StripeApi();

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Confirm payment with Stripe
    const confirmation = await stripe.confirmPayment(paymentIntentId);

    if (!confirmation.success) {
      return NextResponse.json(
        { success: false, error: confirmation.error },
        { status: 500 }
      );
    }

    // Update payment status in Firestore
    const db = getFirestoreAdmin();
    const paymentRef = db.collection(COLLECTIONS.PAYMENTS).doc(paymentIntentId);

    await paymentRef.update({
      status: confirmation.status,
      updatedAt: Timestamp.now()
    });

    // If payment succeeded, record it as a purchase
    if (confirmation.status === 'succeeded') {
      const paymentDoc = await paymentRef.get();
      const paymentData = paymentDoc.data();

      if (paymentData) {
        await db.collection(COLLECTIONS.PURCHASES).add({
          paymentIntentId,
          customerId: paymentData.customerId,
          templateId: paymentData.templateId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: 'completed',
          purchasedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        await auditAgent.log({
          service: 'firebase',
          action: 'purchase_recorded',
          status: 'success',
          details: { paymentIntentId, customerId: paymentData.customerId, templateId: paymentData.templateId }
        });
      }
    }

    await auditAgent.log({
      service: 'stripe',
      action: 'payment_confirmed',
      status: 'success',
      details: { paymentIntentId, paymentStatus: confirmation.status }
    });

    return NextResponse.json({
      success: true,
      status: confirmation.status,
      paymentIntent: confirmation.paymentIntent
    });

  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    await auditAgent.log({
      service: 'stripe',
      action: 'payment_confirmation_failed',
      status: 'error',
      errorMessage: error.message
    });
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
