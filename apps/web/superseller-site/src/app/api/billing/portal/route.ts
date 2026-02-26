import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

/**
 * POST /api/billing/portal
 * PayPal doesn't have a hosted billing portal like Stripe.
 * Redirects to PayPal's subscription management page.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.email || !session.clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // PayPal subscriptions are managed at paypal.com
        const paypalMode = process.env.PAYPAL_MODE === 'live' ? '' : 'sandbox.';
        const portalUrl = `https://www.${paypalMode}paypal.com/myaccount/autopay/`;

        return NextResponse.json({ url: portalUrl });
    } catch (error: any) {
        console.error('[billing/portal] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to generate billing portal URL' },
            { status: 500 }
        );
    }
}
