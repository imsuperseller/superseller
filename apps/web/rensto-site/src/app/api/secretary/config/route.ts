import { NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { SecretaryConfig } from '@/types/firestore';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, config } = body;

        if (!clientId || !config) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getFirestoreAdmin();
        const configRef = db.collection('secretary_configs').where('clientId', '==', clientId).limit(1);
        const snapshot = await configRef.get();

        const updateData: Partial<SecretaryConfig> = {
            agentName: config.agentName,
            greeting: config.greeting,
            transferNumber: config.transferNumber,
            n8nWebhookId: config.n8nWebhookId,
            // Preserve existing fields if not provided or add defaults
            updatedAt: new Date().toISOString()
        };

        if (!snapshot.empty) {
            // Update existing
            const docId = snapshot.docs[0].id;
            await db.collection('secretary_configs').doc(docId).update(updateData);
        } else {
            // Create new
            const newDoc: SecretaryConfig = {
                id: 'secretary', // This might need to be unique if singleton per client
                clientId,
                voiceId: 'eleven_monica', // Default
                whatsappEnabled: false,
                calendarEnabled: false,
                ...updateData
            } as SecretaryConfig;

            await db.collection('secretary_configs').add(newDoc);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating secretary config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
