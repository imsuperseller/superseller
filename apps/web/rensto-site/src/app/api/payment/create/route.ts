import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase';
import { auditAgent } from '@/lib/agents/ServiceAuditAgent';
import { Timestamp } from 'firebase-admin/firestore';

const stripe = new StripeApi();

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, customer, templateId, metadata } = await request.json();

    // Validate payment data
    const validation = validatePaymentData({ amount, currency, customer, templateId });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntentResult = await stripe.createPaymentIntent(amount, currency, {
      customerId: customer,
      templateId,
      ...metadata
    });

    if (!paymentIntentResult.success || !paymentIntentResult.paymentIntentId) {
      return NextResponse.json(
        { success: false, error: paymentIntentResult.error || 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    const { paymentIntentId, clientSecret } = paymentIntentResult;

    // Log payment attempt to Firestore
    const db = getFirestoreAdmin();
    await db.collection(COLLECTIONS.PAYMENTS).doc(paymentIntentId as string).set({
      amount,
      currency,
      customerId: customer,
      templateId,
      status: 'pending',
      metadata: metadata || {},
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });

    await auditAgent.log({
      service: 'stripe',
      action: 'payment_intent_created',
      status: 'success',
      details: { paymentIntentId, amount, customer }
    });

    return NextResponse.json({
      success: true,
      clientSecret: clientSecret,
      paymentIntentId: paymentIntentId,
      amount: amount,
      currency: currency
    });

  } catch (error: any) {
    console.error('Payment creation error:', error);
    await auditAgent.log({
      service: 'stripe',
      action: 'payment_creation_failed',
      status: 'error',
      errorMessage: error.message
    });
    return NextResponse.json(
      { success: false, error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}

function validatePaymentData(data: any) {
  const requiredFields = ['amount', 'currency', 'customer', 'templateId'];

  for (const field of requiredFields) {
    if (!data[field]) {
      return {
        valid: false,
        error: `Missing required field: ${field}`
      };
    }
  }

  // Validate amount
  if (data.amount <= 0) {
    return {
      valid: false,
      error: 'Amount must be positive'
    };
  }

  // Validate currency
  const supportedCurrencies = ['usd', 'eur', 'gbp', 'cad'];
  if (!supportedCurrencies.includes(data.currency.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported currency'
    };
  }

  return { valid: true };
}
