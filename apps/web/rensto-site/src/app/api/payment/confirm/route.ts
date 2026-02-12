import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import * as dbPayments from '@/lib/db/payments';
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
    const pgPayment = await prisma.payment.findUnique({ where: { id: paymentIntentId } });

    if (pgPayment) {
      await prisma.payment.update({
        where: { id: paymentIntentId },
        data: { status: confirmation.status || 'confirmed' } as any,
      });

      // If payment succeeded, record it as a purchase
      if (confirmation.status === 'succeeded') {
        await dbPayments.createPurchase({
          userId: pgPayment.userId || 'unknown',
          templateId: pgPayment.productId || null,
          customerEmail: pgPayment.customerEmail || '',
          stripeSessionId: paymentIntentId,
          tier: pgPayment.tier || null,
        });
      }
    }

    // Backup: Firestore (non-blocking)
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
