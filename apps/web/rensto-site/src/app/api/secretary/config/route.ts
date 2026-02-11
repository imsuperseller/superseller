import { NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as backup
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import * as dbDashboard from '@/lib/db/dashboard';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, config } = body;

        if (!clientId || !config) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // [MIGRATION] Phase 5: Upsert to Postgres (primary)
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

        // Backup: Firestore
        await firestoreBackupWrite('secretary/config', async () => {
            const db = getFirestoreAdmin();
            const snapshot = await db.collection('secretary_configs').where('clientId', '==', clientId).limit(1).get();
            const cleanData = JSON.parse(JSON.stringify({
                agentName: config.agentName,
                greeting: config.greeting,
                tone: config.tone,
                businessContext: config.businessContext,
                calendarLink: config.calendarLink,
                availability: config.availability,
                transferNumber: config.transferNumber,
                n8nWebhookId: config.n8nWebhookId,
                updatedAt: new Date().toISOString(),
            }));

            if (!snapshot.empty) {
                await db.collection('secretary_configs').doc(snapshot.docs[0].id).update(cleanData);
            } else {
                await db.collection('secretary_configs').add({
                    clientId,
                    voiceId: 'eleven_monica',
                    whatsappEnabled: false,
                    calendarEnabled: false,
                    ...cleanData,
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating secretary config:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
