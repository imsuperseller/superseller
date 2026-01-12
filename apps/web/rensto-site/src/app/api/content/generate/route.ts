import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, type, topic, platform } = body;

        if (!clientId || !type || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getFirestoreAdmin();

        // 1. Verify Entitlements
        const userRef = db.collection(COLLECTIONS.USERS).doc(clientId);
        const userSnap = await userRef.get();
        const userData = userSnap.data();

        const hasEntitlement = userData?.entitlements?.pillars?.includes('content');

        if (!hasEntitlement) {
            return NextResponse.json({
                error: 'Content entitlement required',
                upgradeUrl: '/pricing'
            }, { status: 403 });
        }

        // 2. Create "Draft" Content Item in Firestore immediately for UI feedback
        const contentRef = db.collection(COLLECTIONS.CONTENT_ITEMS).doc();
        const contentItem = {
            id: contentRef.id,
            clientId,
            title: topic,
            type,
            status: 'draft',
            platform: platform || 'blog',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await contentRef.set(contentItem);

        // 3. Trigger n8n Workflow (The Content Engine)
        // Using the N8N webhook URL - ensure this is set in env vars or hardcoded for now
        const N8N_WEBHOOK_URL = 'https://n8n.rensto.com/webhook/content-engine-trigger';

        // Non-blocking fetch to n8n (fire and forget from client perspective logic, but we await to ensure trigger success)
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: contentRef.id,
                    clientId,
                    type,
                    topic,
                    platform
                })
            });
        } catch (webhookErr) {
            console.error('Failed to trigger n8n webhook:', webhookErr);
            // We still return success because the item was created in DB, n8n can pick it up via polling or retry
        }

        return NextResponse.json({
            success: true,
            contentId: contentRef.id,
            message: 'Content generation started'
        });

    } catch (err: any) {
        console.error('Content generation error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
