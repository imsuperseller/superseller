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
            tone: config.tone,
            businessContext: config.businessContext,
            calendarLink: config.calendarLink,
            availability: config.availability,
            transferNumber: config.transferNumber,
            n8nWebhookId: config.n8nWebhookId,
            updatedAt: new Date().toISOString()
        };

        const cleanUpdateData = JSON.parse(JSON.stringify(updateData));

        if (!snapshot.empty) {
            // Update existing
            const docId = snapshot.docs[0].id;
            await db.collection('secretary_configs').doc(docId).update(cleanUpdateData);
        } else {
            // Create new
            const newDoc = {
                clientId,
                voiceId: 'eleven_monica', // Default
                whatsappEnabled: false,
                calendarEnabled: false,
                ...cleanUpdateData
            };
            // ID usually excluded from the spread if using .add(), but we want a clean doc
            await db.collection('secretary_configs').add(newDoc);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating secretary config:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
