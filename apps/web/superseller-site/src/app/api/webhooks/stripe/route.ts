import { NextResponse } from 'next/server';

/**
 * DEPRECATED: Stripe webhooks replaced by PayPal (Feb 2026).
 * See /api/webhooks/paypal/route.ts for active webhook handler.
 *
 * This endpoint is kept temporarily to handle any in-flight Stripe events
 * during the migration period. Returns 200 to acknowledge without processing.
 */
export async function POST() {
    console.log('[stripe/webhook] Received event on deprecated Stripe endpoint — migration to PayPal complete');
    return NextResponse.json({ received: true, deprecated: true });
}
