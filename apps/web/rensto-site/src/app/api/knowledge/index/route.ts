import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const N8N_INDEXING_WEBHOOK = process.env.N8N_INDEXING_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/knowledge-indexing';

export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type') || '';
        const db = getFirestoreAdmin();

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

            type = 'pdf'; // Default for file uploads for now
            name = file.name;
            size = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            // In a real app, we'd upload to Firebase Storage here.
            // For this implementation, we convert to base64 to pass to n8n
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

        // 1. Create record in indexed_documents
        const docRef = await db.collection('indexed_documents').add({
            clientId,
            name,
            type,
            status: 'processing',
            indexedAt: Timestamp.now(),
            size,
            url,
            createdAt: Timestamp.now()
        });

        // 2. Trigger n8n for real indexing
        try {
            await fetch(N8N_INDEXING_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentId: docRef.id,
                    clientId,
                    type,
                    name,
                    url,
                    fileData, // Base64
                    timestamp: new Date().toISOString()
                })
            });
        } catch (webhookError) {
            console.error('Failed to trigger indexing webhook:', webhookError);
            // We don't fail the request, as the record is created. 
            // n8n might be down, but we can retry later.
        }

        return NextResponse.json({
            success: true,
            documentId: docRef.id,
            message: 'Indexing started locally and sent to orchestrator.'
        });

    } catch (error: any) {
        console.error('Indexing error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
