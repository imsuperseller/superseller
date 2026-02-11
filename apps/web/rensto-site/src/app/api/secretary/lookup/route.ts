import { NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as fallback
import { getFirestoreAdmin } from '@/lib/firebase-admin';
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
        // [MIGRATION] Phase 5: Read from Postgres first
        let config: any = null;

        if (webhookId) {
            config = await dbDashboard.getSecretaryConfigByWebhookId(webhookId);
        } else if (phone) {
            config = await dbDashboard.getSecretaryConfigByPhone(phone!);
        }
        // sessionId lookup not yet in DAL - falls through to Firestore

        if (config) {
            return NextResponse.json({
                found: true,
                clientId: config.clientId,
                config,
            });
        }

        // Fallback: Firestore
        console.info('[Migration] secretary/lookup: Postgres miss, falling back to Firestore');
        const db = getFirestoreAdmin();
        let query;

        if (webhookId) {
            query = db.collection('secretary_configs').where('n8nWebhookId', '==', webhookId);
        } else if (phone) {
            query = db.collection('secretary_configs').where('phoneNumber', '==', phone);
        } else if (sessionId) {
            query = db.collection('secretary_configs').where('whatsappSessionId', '==', sessionId);
        }

        // @ts-ignore
        const snapshot = await query.limit(1).get();

        if (snapshot.empty) {
            if (webhookId === '556f1aab-220c-4281-90b8-0570465d50b1') {
                return NextResponse.json({
                    found: true,
                    config: {
                        agentName: 'Rensto AI',
                        greeting: 'Welcome to Rensto.',
                        systemPrompt: 'You are a helpful assistant for Rensto.',
                        clientId: 'rensto-default',
                    },
                });
            }
            return NextResponse.json({ found: false, error: 'Config not found' }, { status: 404 });
        }

        const doc = snapshot.docs[0];
        return NextResponse.json({
            found: true,
            clientId: doc.data().clientId,
            config: doc.data(),
        });

    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
