import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as backup
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as dbDashboard from '@/lib/db/dashboard';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

const N8N_INDEXING_WEBHOOK = process.env.N8N_INDEXING_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/knowledge-indexing';

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';

        let clientId = '';
        let type: 'pdf' | 'url' | 'text' = 'text';
        let name = '';
        let url = '';
        let fileData: string | null = null;
        let size = '';

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File;
            clientId = formData.get('clientId') as string;

            if (!file || !clientId) {
                return NextResponse.json({ success: false, error: 'Missing file or clientId' }, { status: 400 });
            }

            type = 'pdf';
            name = file.name;
            size = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            const buffer = await file.arrayBuffer();
            fileData = Buffer.from(buffer).toString('base64');
        } else {
            const body = await request.json();
            clientId = body.clientId;
            url = body.url;

            if (!url || !clientId) {
                return NextResponse.json({ success: false, error: 'Missing url or clientId' }, { status: 400 });
            }

            type = 'url';
            name = new URL(url).hostname + new URL(url).pathname;
        }

        // [MIGRATION] Phase 5: Create record in Postgres (primary)
        const doc = await dbDashboard.createIndexedDocument({
            clientId,
            name,
            type,
            status: 'processing',
            url: url || null,
            size: size || null,
        });

        // Backup: Firestore
        await firestoreBackupWrite('knowledge/index', async () => {
            const db = getFirestoreAdmin();
            await db.collection('indexed_documents').doc(doc.id).set({
                clientId,
                name,
                type,
                status: 'processing',
                indexedAt: Timestamp.now(),
                size,
                url,
                createdAt: Timestamp.now(),
            });
        });

        // Trigger n8n for real indexing
        try {
            await fetch(N8N_INDEXING_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: doc.id,
                    clientId,
                    type,
                    name,
                    url,
                    fileData,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (webhookError) {
            console.error('Failed to trigger indexing webhook:', webhookError);
        }

        return NextResponse.json({
            success: true,
            documentId: doc.id,
            message: 'Indexing started locally and sent to orchestrator.',
        });

    } catch (error: any) {
        console.error('Indexing error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
