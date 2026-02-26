import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
    const rateLimited = apiRateLimiter.middleware()(request);
    if (rateLimited) return rateLimited;

    try {
        const body = await request.json();
        const { name, email, message, company, budget, timeline } = body;

        // Basic server-side validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields: name, email, message' },
                { status: 400 }
            );
        }

        // Prepare payload for n8n
        const payload = {
            source: 'superseller_contact_form',
            timestamp: new Date().toISOString(),
            data: {
                name,
                email,
                company: company || '',
                message,
                budget: budget || '',
                timeline: timeline || ''
            }
        };

        // Forward to n8n Webhook
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

        if (n8nWebhookUrl) {
            try {
                const n8nResponse = await fetch(n8nWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!n8nResponse.ok) {
                    console.error(`[Contact API] n8n webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
                    // We still return success to the user so they don't worry, but log the error
                } else {
                    console.log(`[Contact API] Forwarded to n8n successfully`);
                }
            } catch (webhookError) {
                console.error('[Contact API] Failed to call n8n webhook:', webhookError);
            }
        } else {
            console.warn('[Contact API] N8N_WEBHOOK_URL is not defined. Data was received but not forwarded.');
            // Development mode fallback logging
            console.log('[Contact API] Payload (Mock):', JSON.stringify(payload, null, 2));
        }

        return NextResponse.json({ success: true, message: 'Message received' });

    } catch (error) {
        console.error('[Contact API] Internal Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
