import { NextRequest, NextResponse } from 'next/server';
import { StripeApi } from '@/lib/stripe';
import { AirtableApi } from '@/lib/airtable';

const stripe = new StripeApi();
const airtable = new AirtableApi();

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
    const paymentIntent = await stripe.createPaymentIntent(amount, currency, customer, {
      templateId,
      ...metadata
    });

    if (!paymentIntent.success) {
      return NextResponse.json(
        { success: false, error: paymentIntent.error },
        { status: 500 }
      );
    }

    // Log payment attempt to Airtable
    await airtable.logPaymentAttempt({
      paymentIntentId: paymentIntent.paymentIntentId,
      amount,
      currency,
      customer,
      templateId,
      status: 'pending'
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.clientSecret,
      paymentIntentId: paymentIntent.paymentIntentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    });

  } catch (error) {
    console.error('Payment creation error:', error);
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
