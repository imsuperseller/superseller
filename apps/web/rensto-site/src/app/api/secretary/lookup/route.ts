import { NextResponse } from 'next/server';
import * as dbDashboard from '@/lib/db/dashboard';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('webhookId');
    const phone = searchParams.get('phone');
    const sessionId = searchParams.get('sessionId');

    if (!webhookId && !phone && !sessionId) {
        return NextResponse.json({ error: 'Missing webhookId, phone, or sessionId parameter' }, { status: 400 });
    }

    try {
        let config: any = null;

        if (webhookId) {
            config = await dbDashboard.getSecretaryConfigByWebhookId(webhookId);
        } else if (phone) {
            config = await dbDashboard.getSecretaryConfigByPhone(phone!);
        }
        // Note: sessionId lookup not yet implemented in DAL (no whatsappSessionId column in schema)

        if (config) {
            return NextResponse.json({
                found: true,
                clientId: config.clientId,
                config,
            });
        }

        return NextResponse.json({ found: false, error: 'Config not found' }, { status: 404 });

    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
