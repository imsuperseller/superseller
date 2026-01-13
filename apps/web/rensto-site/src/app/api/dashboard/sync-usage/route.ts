import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

/**
 * SECURE DATA BRIDGE
 * Allows n8n to push real execution metrics into Firestore for the Client Dashboard.
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const syncSecret = process.env.DASHBOARD_SYNC_SECRET;

        // Basic Secret Auth
        if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            clientId,
            type, // 'lead_generation' | 'message_sent' | 'appointment_booked'
            count = 1,
            metadata = {}
        } = body;

        if (!clientId || !type) {
            return NextResponse.json({ error: 'Missing clientId or type' }, { status: 400 });
        }

        const db = getFirestoreAdmin();
        const batch = db.batch();

        // 1. Log the individual event
        const logRef = db.collection(COLLECTIONS.USAGE_LOGS).doc();
        batch.set(logRef, {
            clientId,
            type,
            count,
            metadata,
            status: 'completed',
            createdAt: FieldValue.serverTimestamp()
        });

        // 2. Increment counters on the client's service record for fast dashboard access
        const clientRef = db.collection(COLLECTIONS.USERS).doc(clientId);

        const incrementField = type === 'lead_generation' ? 'metrics.totalLeads' :
            type === 'message_sent' ? 'metrics.totalMessages' :
                type === 'appointment_booked' ? 'metrics.totalBookings' : null;

        if (incrementField) {
            batch.update(clientRef, {
                [incrementField]: FieldValue.increment(count),
                'metrics.lastActivityAt': FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp()
            });
        }

        await batch.commit();

        return NextResponse.json({
            success: true,
            message: `Logged ${count} ${type} for client ${clientId}`
        });

    } catch (error: any) {
        console.error('Error syncing usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
