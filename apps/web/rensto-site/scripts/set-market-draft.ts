
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (reuse logic from seed-firestore.ts)
const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let app;

if (getApps().length === 0) {
    if (serviceAccountVal) {
        const serviceAccount = JSON.parse(serviceAccountVal);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: 'rensto'
        });
    } else {
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found. Trying default credentials...");
        app = initializeApp({ projectId: 'rensto' });
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);
const TEMPLATES_COLLECTION = 'templates';

async function updateTemplatesStatus() {
    try {
        console.log('Fetching all templates...');
        const snapshot = await db.collection(TEMPLATES_COLLECTION).get();

        if (snapshot.empty) {
            console.log('No matching documents.');
            return;
        }

        const batch = db.batch();
        let count = 0;

        // 1. Set ALL to Draft first
        snapshot.forEach(doc => {
            const ref = db.collection(TEMPLATES_COLLECTION).doc(doc.id);
            batch.update(ref, { readinessStatus: 'Draft' });
            count++;
        });

        console.log(`Setting ${count} templates to Draft status...`);
        await batch.commit();
        console.log('All templates set to Draft.');

        // 2. Activate ONLY trusted templates
        // 4OYGXXMYeJFfAo6X: Celebrity Selfie Video Generator
        const activeIds = ['4OYGXXMYeJFfAo6X'];

        console.log(`Activating specific templates: ${activeIds.join(', ')}...`);

        const activationBatch = db.batch();
        for (const id of activeIds) {
            const ref = db.collection(TEMPLATES_COLLECTION).doc(id);
            activationBatch.update(ref, {
                readinessStatus: 'Active',
                video: 'https://rensto.com/videos/celebrity-selfie-generator.mp4'
            });
        }

        await activationBatch.commit();
        console.log('Trusted templates activated.');

    } catch (error) {
        console.error('Error updating documents:', error);
    }
}

updateTemplatesStatus().catch(console.error);
