import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import * as dbDashboard from '@/lib/db/dashboard';
export async function POST(req: Request) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { clientId, config } = body;

        if (!clientId || !config) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const configId = `sec_${clientId}`;
        await dbDashboard.upsertSecretaryConfig(configId, {
            id: configId,
            clientId,
            agentName: config.agentName,
            greeting: config.greeting,
            tone: config.tone,
            businessContext: config.businessContext,
            calendarLink: config.calendarLink,
            availability: config.availability,
            transferNumber: config.transferNumber,
            n8nWebhookId: config.n8nWebhookId,
            voiceId: config.voiceId || 'eleven_monica',
            whatsappEnabled: config.whatsappEnabled ?? false,
            calendarEnabled: config.calendarEnabled ?? false,
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating secretary config:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
