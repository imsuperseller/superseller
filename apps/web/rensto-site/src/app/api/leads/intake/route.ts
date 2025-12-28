import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.email && !body.phone) {
            return NextResponse.json(
                { ok: false, error: 'Email or phone required' },
                { status: 400 }
            );
        }

        // Forward to n8n lead-intake webhook
        const webhookUrl = env.N8N_LEAD_INTAKE_URL || 'https://n8n.rensto.com/webhook/lead-intake';

        const n8nResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullName: body.fullName || body.name || '',
                email: body.email || '',
                phone: body.phone || '',
                message: body.message || '',
                company: body.company || '',
                website: body.website || '',
                source: body.source || 'rensto-website',
                consent: body.consent ?? true
            })
        });

        const result = await n8nResponse.json();

        return NextResponse.json({
            ok: true,
            ...result
        });

    } catch (error) {
        console.error('[Lead Intake API] Error:', error);
        return NextResponse.json(
            { ok: false, error: 'Failed to process lead' },
            { status: 500 }
        );
    }
}
