import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('webhookId');
    const phone = searchParams.get('phone');

    if (!webhookId && !phone) {
        return NextResponse.json({ error: 'Missing webhookId or phone parameter' }, { status: 400 });
    }

    const db = getFirestoreAdmin();
    let query;

    if (webhookId) {
        // Assuming we store webhookId in the config, OR we have a mapping.
        // For V1 of this productization, we might just query by field if it exists,
        // or we search for a client that has this webhookId locally mapped?
        // Ideally, the 'secretary_config' has 'n8nWebhookId'.
        query = db.collection('secretary_configs').where('n8nWebhookId', '==', webhookId);
    } else if (phone) {
        query = db.collection('secretary_configs').where('phoneNumber', '==', phone);
    }

    try {
        // @ts-ignore
        const snapshot = await query.limit(1).get();

        if (snapshot.empty) {
            // Fallback for Hardcoded Legacy IDs during migration
            if (webhookId === '556f1aab-220c-4281-90b8-0570465d50b1') {
                return NextResponse.json({
                    found: true,
                    config: {
                        agentName: 'Rensto AI',
                        greeting: 'Welcome to Rensto.',
                        systemPrompt: 'You are a helpful assistant for Rensto.',
                        clientId: 'rensto-default'
                    }
                });
            }
            return NextResponse.json({ found: false, error: 'Config not found' }, { status: 404 });
        }

        const doc = snapshot.docs[0];
        return NextResponse.json({
            found: true,
            clientId: doc.data().clientId,
            config: doc.data()
        });

    } catch (error) {
        console.error('Lookup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
