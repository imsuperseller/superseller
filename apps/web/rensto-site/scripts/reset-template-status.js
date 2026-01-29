const admin = require('firebase-admin');
const path = require('path');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'service-account.json');

if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(SERVICE_ACCOUNT_PATH),
        projectId: 'rensto'
    });
}

const db = admin.firestore();
const TEMPLATES_COLLECTION = 'templates';
const TARGET_DOC_ID = 'BZ1wk9DlZncPRN8t';

async function resetTemplateStatus() {
    try {
        console.log(`Targeting template ID: ${TARGET_DOC_ID}`);
        const ref = db.collection(TEMPLATES_COLLECTION).doc(TARGET_DOC_ID);

        const doc = await ref.get();
        if (!doc.exists) {
            console.error(`Document ${TARGET_DOC_ID} does not exist!`);
            return;
        }

        console.log('Current status:', doc.data().status);

        await ref.update({
            status: 'retry',
            retryAttempt: 1, // Set to 1 to bypass the "Hash Changed" check (> 0)
            lastGeneratedHash: '', // Clear hash to force prompt re-generation
            lastResetAt: new Date().toISOString()
        });

        console.log(`Successfully reset status to 'retry' for ${TARGET_DOC_ID}`);
        process.exit(0);
    } catch (error) {
        console.error('Error during reset:', error);
        process.exit(1);
    }
}

resetTemplateStatus();
