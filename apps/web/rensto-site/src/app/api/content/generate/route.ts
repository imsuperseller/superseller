import { NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as fallback for entitlement check
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';
import * as dbDashboard from '@/lib/db/dashboard';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, type, topic, platform } = body;

        if (!clientId || !type || !topic) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // [MIGRATION] Phase 5: Check entitlements from Postgres first
        let hasEntitlement = false;

        const pgUser = await prisma.user.findUnique({
            where: { id: clientId },
            select: { entitlements: true },
        });

        if (pgUser) {
            const ent = pgUser.entitlements as any;
            hasEntitlement = ent?.pillars?.includes('content') ?? false;
        } else {
            // Fallback: Firestore
            console.info('[Migration] content/generate: User not in Postgres, checking Firestore');
            const db = getFirestoreAdmin();
            const userSnap = await db.collection(COLLECTIONS.USERS).doc(clientId).get();
            const userData = userSnap.data();
            hasEntitlement = userData?.entitlements?.pillars?.includes('content') ?? false;
        }

        if (!hasEntitlement) {
            return NextResponse.json({
                error: 'Content entitlement required',
                upgradeUrl: '/pricing',
            }, { status: 403 });
        }

        // [MIGRATION] Phase 5: Create content item in Postgres (primary)
        const contentItem = await dbDashboard.createContentPost({
            userId: clientId,
            title: topic,
            type,
            status: 'draft',
            platform: platform || 'blog',
        });

        // Backup: Firestore
        await firestoreBackupWrite('content/generate', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.CONTENT_ITEMS).doc(contentItem.id).set({
                id: contentItem.id,
                clientId,
                title: topic,
                type,
                status: 'draft',
                platform: platform || 'blog',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        });

        // Trigger n8n Content Engine
        const N8N_WEBHOOK_URL = 'https://n8n.rensto.com/webhook/content-engine-trigger';
        try {
            await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentId: contentItem.id,
                    clientId,
                    type,
                    topic,
                    platform,
                }),
            });
        } catch (webhookErr) {
            console.error('Failed to trigger n8n webhook:', webhookErr);
        }

        return NextResponse.json({
            success: true,
            contentId: contentItem.id,
            message: 'Content generation started',
        });

    } catch (err: any) {
        console.error('Content generation error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
