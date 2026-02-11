import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 5: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import * as dbDashboard from '@/lib/db/dashboard';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('x-api-key');
        const VALID_API_KEY = process.env.RENSTO_API_KEY;

        if (!apiKey || apiKey !== VALID_API_KEY) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { clientId, agentId, model, tokens, cost, metadata } = body;

        if (!clientId || !agentId || !cost) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // [MIGRATION] Phase 5: Write to Postgres (primary)
        const log = await dbDashboard.createUsageLog({
            clientId,
            agentId,
            model: model || 'unknown',
            tokens: tokens || { input: 0, output: 0, total: 0 },
            cost,
            metadata,
            status: 'completed',
        });

        // Update user-level usage aggregation
        try {
            const user = await prisma.user.findUnique({
                where: { id: clientId },
                select: { metrics: true },
            });
            const currentMetrics = (user?.metrics as Record<string, any>) || {};
            await prisma.user.update({
                where: { id: clientId },
                data: {
                    metrics: {
                        ...currentMetrics,
                        totalSpend: (currentMetrics.totalSpend || 0) + cost,
                        lastActiveString: new Date().toISOString(),
                    },
                },
            });
        } catch (pgErr) {
            console.warn('[Migration] webhooks/usage: Failed to update user metrics', pgErr);
        }

        // Backup: Firestore
        await firestoreBackupWrite('webhooks/usage', async () => {
            const db = getFirestoreAdmin();
            const batch = db.batch();

            const logRef = db.collection(COLLECTIONS.USAGE_LOGS).doc(log.id);
            batch.set(logRef, {
                id: log.id,
                clientId,
                agentId,
                timestamp: FieldValue.serverTimestamp(),
                model: model || 'unknown',
                tokens: tokens || { input: 0, output: 0, total: 0 },
                cost,
                metadata,
            });

            const clientRef = db.collection(COLLECTIONS.CLIENTS).doc(clientId);
            batch.update(clientRef, {
                'usage.totalSpend': FieldValue.increment(cost),
                'usage.lastActiveString': new Date().toISOString(),
            });

            await batch.commit();
        });

        return NextResponse.json({ success: true, logId: log.id });

    } catch (error: any) {
        console.error('Usage Webhook Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
