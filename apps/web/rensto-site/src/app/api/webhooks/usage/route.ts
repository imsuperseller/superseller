import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS, UsageLog } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate Request
        const apiKey = request.headers.get('x-api-key');
        // Retrieve valid API key from environment
        const VALID_API_KEY = process.env.RENSTO_API_KEY;

        if (!apiKey || apiKey !== VALID_API_KEY) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse Payload
        const body = await request.json();
        const { clientId, agentId, model, tokens, cost, metadata } = body;

        // Basic validation
        if (!clientId || !agentId || !cost) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const db = getFirestoreAdmin();
        const batch = db.batch();

        // 3. Create Usage Log Entry
        const logRef = db.collection(COLLECTIONS.USAGE_LOGS).doc();
        const logEntry: UsageLog = {
            id: logRef.id,
            clientId,
            agentId,
            timestamp: FieldValue.serverTimestamp(),
            model: model || 'unknown',
            tokens: tokens || { input: 0, output: 0, total: 0 },
            cost, // passed from n8n in cents
            metadata
        };

        batch.set(logRef, logEntry);

        // 4. Update Client Aggregated Usage (Total Spend)
        // Stored on the client document for quick access
        const clientRef = db.collection(COLLECTIONS.CLIENTS).doc(clientId);
        batch.update(clientRef, {
            'usage.totalSpend': FieldValue.increment(cost),
            'usage.lastActiveString': new Date().toISOString()
        });

        // 5. Update Agent-Specific Usage for Client
        // Stored in a subcollection or map on the client doc?
        // Let's store it on a monthly ledger or just simple increment for now.
        // For simple v1: Just incrementing a top-level usage map on the client doc might be risky if map grows too large.
        // Safer: Subcollection `clients/{clientId}/agent_usage/{agentId}`
        const agentUsageRef = clientRef.collection('agent_usage').doc(agentId);

        // Use set with merge to handle init
        batch.set(agentUsageRef, {
            agentId,
            totalSpend: FieldValue.increment(cost),
            totalRuns: FieldValue.increment(1),
            lastUsed: FieldValue.serverTimestamp()
        }, { merge: true });

        await batch.commit();

        return NextResponse.json({ success: true, logId: logRef.id });

    } catch (error: any) {
        console.error('Usage Webhook Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
