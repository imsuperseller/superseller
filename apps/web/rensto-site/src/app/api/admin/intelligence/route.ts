import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Firestore import was unused — removed.
        const recommendations = [
            {
                id: '1',
                type: 'optimization',
                priority: 'high',
                title: 'UAD Autolister Idling',
                message: "The UAD autolister hasn't posted in 24 hours despite pending tasks. Restarting the GoLogin profile is recommended.",
                action: 'Restart Engine',
                workflowId: 'fb-lister-v2',
            },
            {
                id: '2',
                type: 'growth',
                priority: 'medium',
                title: 'Tarablus Lead Engagement',
                message: "Yossi Tarablus hasn't replied to the last proposal. Suggesting a follow-up with the 'Success Case' PDF from Tax4Us.",
                action: 'Send Follow-up',
                clientId: 'sportek',
            },
        ];

        return NextResponse.json({ success: true, recommendations });
    } catch (error) {
        console.error('Intelligence fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
