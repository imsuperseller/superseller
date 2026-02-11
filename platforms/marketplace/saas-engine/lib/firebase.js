const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Initializes Firebase Admin using a service account or default credentials.
 */
function initAdmin() {
    if (admin.apps.length) return admin.app();

    // Use service account if path is in .env, otherwise use default
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath)),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    } else {
        admin.initializeApp({
            credential: admin.credential.applicationDefault()
        });
    }

    return admin.app();
}

const db = initAdmin().firestore();

/**
 * Fetches the next due items from the posting schedule.
 */
async function getPendingSchedule() {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection('posting_schedule')
        .where('status', '==', 'queued')
        // .where('scheduledFor', '<=', now) // Temporarily disabled due to missing index
        .limit(50)
        .get();

    return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(item => {
            const scheduledFor = item.scheduledFor?.toDate ? item.scheduledFor.toDate() : new Date(item.scheduledFor);
            return scheduledFor <= now.toDate();
        })
        .slice(0, 5);
}

/**
 * Fetches client details including secrets (Admin Only).
 */
async function getClientData(clientId) {
    const clientSnap = await db.doc(`clients/${clientId}`).get();
    const secretsSnap = await db.doc(`secrets/${clientId}`).get();

    if (!clientSnap.exists) throw new Error(`Client ${clientId} not found`);

    return {
        ...clientSnap.data(),
        secrets: secretsSnap.data() || {}
    };
}

/**
 * Updates a schedule item's status.
 */
async function updateScheduleStatus(scheduleId, status, runId = null) {
    await db.doc(`posting_schedule/${scheduleId}`).update({
        status,
        runId,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

/**
 * Logs the result of a posting run.
 */
async function logPostRun(clientId, result) {
    const runRef = db.collection('post_runs').doc();
    await runRef.set({
        clientId,
        ...result,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Also update the client's lastRun status
    await db.doc(`clients/${clientId}`).update({
        lastRun: {
            runId: runRef.id,
            status: result.status,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
    });

    return runRef.id;
}

module.exports = {
    db,
    getPendingSchedule,
    getClientData,
    updateScheduleStatus,
    logPostRun
};
