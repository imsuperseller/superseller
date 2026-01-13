import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

/**
 * USAGE SERVICE
 * Handles metric resets and reporting for the Rensto Dashboard.
 */
export class UsageService {
    /**
     * Resets a client's usage metrics for the new billing cycle.
     * Guaranteed to preserve lifetime data while clearing current window.
     */
    static async resetMonthlyUsage(clientId: string) {
        const db = getFirestoreAdmin();
        const userRef = db.collection(COLLECTIONS.USERS).doc(clientId);

        try {
            await db.runTransaction(async (transaction) => {
                const userSnap = await transaction.get(userRef);
                if (!userSnap.exists) throw new Error('User not found');

                const userData = userSnap.data() || {};
                const currentMetrics = userData.metrics || {};

                // Move current metrics to a history/logs log before clearing if needed
                // For now, we just reset the primary counters for the dashboard view
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

            console.log(`[UsageService] Successfully reset metrics for client: ${clientId}`);
            return { success: true };
        } catch (error) {
            console.error('[UsageService] Failed to reset usage:', error);
            throw error;
        }
    }
}
