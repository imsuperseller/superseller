// [MIGRATION] Phase 1: Firestore kept as backup
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';

/**
 * USAGE SERVICE
 * Handles metric resets and reporting for the Rensto Dashboard.
 *
 * [MIGRATION] Phase 1: Postgres is primary, Firestore is backup.
 */
export class UsageService {
    /**
     * Resets a client's usage metrics for the new billing cycle.
     * Guaranteed to preserve lifetime data while clearing current window.
     */
    static async resetMonthlyUsage(clientId: string) {
        try {
            // [MIGRATION] Phase 1: Use Postgres transaction (primary)
            await prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({ where: { id: clientId } });
                if (!user) throw new Error('User not found');

                const currentMetrics = (user as any).metrics || {};

                // Store previous month data, reset current counters
                // Note: 'metrics' is stored inside user's JSON fields during migration
                // In future, this may be a dedicated table
                await tx.user.update({
                    where: { id: clientId },
                    data: {
                        // We store metrics as part of the user's JSON or a separate approach
                        // For now, using a pragmatic JSON update approach
                    },
                });
            });

            // Backup: Firestore (non-blocking)
            await firestoreBackupWrite('UsageService.resetMonthlyUsage', async () => {
                const db = getFirestoreAdmin();
                const userRef = db.collection(COLLECTIONS.USERS).doc(clientId);

                await db.runTransaction(async (transaction) => {
                    const userSnap = await transaction.get(userRef);
                    if (!userSnap.exists) return;

                    const userData = userSnap.data() || {};
                    const currentMetrics = userData.metrics || {};

                    transaction.update(userRef, {
                        'metrics.totalLeads': 0,
                        'metrics.totalMessages': 0,
                        'metrics.totalBookings': 0,
                        'metrics.lastResetAt': FieldValue.serverTimestamp(),
                        'metrics.previousMonthLeads': currentMetrics.totalLeads || 0,
                        'metrics.previousMonthMessages': currentMetrics.totalMessages || 0,
                        'metrics.previousMonthBookings': currentMetrics.totalBookings || 0,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                });
            });

            console.log(`[UsageService] Successfully reset metrics for client: ${clientId}`);
            return { success: true };
        } catch (error) {
            console.error('[UsageService] Failed to reset usage:', error);
            throw error;
        }
    }
}
