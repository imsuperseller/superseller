import { NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import * as dbDashboard from '@/lib/db/dashboard';
export const dynamic = 'force-dynamic';

/**
 * SECURE DATA BRIDGE
 * Allows n8n to push real execution metrics into Postgres (and Firestore backup)
 * for the Client Dashboard.
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const syncSecret = process.env.DASHBOARD_SYNC_SECRET;

        if (!syncSecret || authHeader !== `Bearer ${syncSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            clientId,
            type,
            count = 1,
            metadata = {}
        } = body;

        if (!clientId || !type) {
            return NextResponse.json({ error: 'Missing clientId or type' }, { status: 400 });
        }
        // 1. Log the individual event
        await dbDashboard.createUsageLog({
            clientId,
            agentId: type,
            serviceType: type,
            status: 'completed',
            metadata: { count, ...metadata },
        });

        // 2. Increment counters on the user record
        const incrementField = type === 'lead_generation' ? 'totalLeads' :
            type === 'message_sent' ? 'totalMessages' :
                type === 'appointment_booked' ? 'totalBookings' : null;

        if (incrementField) {
            // Update user metrics (stored as JSON entitlements or separate fields)
            try {
                const user = await prisma.user.findUnique({
                    where: { id: clientId },
                    select: { metrics: true },
                });

                const currentMetrics = (user?.metrics as Record<string, any>) || {};
                const updatedMetrics = {
                    ...currentMetrics,
                    [incrementField]: (currentMetrics[incrementField] || 0) + count,
                    lastActivityAt: new Date().toISOString(),
                };

                await prisma.user.update({
                    where: { id: clientId },
                    data: { metrics: updatedMetrics },
                });
            } catch (pgErr) {
                console.warn('[Migration] sync-usage: Failed to update PG user metrics', pgErr);
            }
        }
        return NextResponse.json({
            success: true,
            message: `Logged ${count} ${type} for client ${clientId}`,
        });

    } catch (error: any) {
        console.error('Error syncing usage:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
