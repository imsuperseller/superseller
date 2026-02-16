import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import * as dbDashboard from '@/lib/db/dashboard';
const N8N_INDEXING_WEBHOOK = process.env.N8N_INDEXING_WEBHOOK_URL || 'https://n8n.rensto.com/webhook/knowledge-indexing';

export async function POST(request: NextRequest) {
    try {
        const session = await verifySession();
        if (!session.isValid || !session.clientId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
        const doc = await dbDashboard.createIndexedDocument({
            clientId,
            name,
            type,
            status: 'processing',
            url: url || null,
            size: size || null,
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
