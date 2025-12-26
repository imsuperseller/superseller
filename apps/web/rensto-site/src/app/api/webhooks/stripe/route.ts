import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil' as any, // Suppress mismatch for now, use latest installed
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!;

export async function POST(req: Request) {
    const body = await req.text();
    const sig = (await headers()).get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        if (!sig || !webhookSecret) return new NextResponse('Missing signature or secret', { status: 400 });
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        // Forward checkout.session.completed to n8n for QuickBooks Invoicing
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log(`Processing checkout session: ${session.id}`);

            if (n8nWebhookUrl) {
                await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event) // Forward the entire event
                });
                console.log('Forwarded to n8n');
            } else {
                console.warn('N8N_WEBHOOK_URL not configured');
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error(`Error processing webhook: ${err.message}`);
        return new NextResponse(`Internal Error: ${err.message}`, { status: 500 });
    }
}
