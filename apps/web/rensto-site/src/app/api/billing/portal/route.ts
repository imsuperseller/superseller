import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import { getStripeAdmin } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.email || !session.clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stripe = getStripeAdmin();
        const user = await prisma.user.findUnique({
            where: { id: session.clientId },
            select: { stripeCustomerId: true, email: true },
        });

        if (!user?.stripeCustomerId) {
            return NextResponse.json(
                { error: 'No billing account found. Contact support.' },
                { status: 404 }
            );
        }

        const origin = request.headers.get('origin') || 'https://rensto.com';
        const returnUrl = `${origin}/video/account`;

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error: any) {
        console.error('[billing/portal] Error:', error.message);
        return NextResponse.json(
            { error: 'Failed to create billing portal session' },
            { status: 500 }
        );
    }
}
