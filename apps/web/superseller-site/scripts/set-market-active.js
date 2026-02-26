const admin = require('firebase-admin');

// Service account from env or default
const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (admin.apps.length === 0) {
    if (serviceAccountVal) {
        const serviceAccount = JSON.parse(serviceAccountVal);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: 'superseller'
        });
    } else {
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found. Trying default credentials...");
        admin.initializeApp({ projectId: 'superseller' });
    }
}

const db = admin.firestore();
const TEMPLATES_COLLECTION = 'templates';

async function updateTemplatesStatus() {
    try {
        console.log('Fetching all templates from collection:', TEMPLATES_COLLECTION);
        const snapshot = await db.collection(TEMPLATES_COLLECTION).get();

        if (snapshot.empty) {
            console.log('No documents found in templates collection.');
            return;
        }

        const batch = db.batch();
        let totalCount = 0;

        // 1. Set ALL to Draft first to clean up any legacy states
        snapshot.forEach(doc => {
            const ref = db.collection(TEMPLATES_COLLECTION).doc(doc.id);
            batch.update(ref, { readinessStatus: 'Draft' });
            totalCount++;
        });

        console.log(`Resetting ${totalCount} templates to Draft...`);
        await batch.commit();

        // 2. Activate ONLY trusted marketplace templates
        const activeIds = [
            '4OYGXXMYeJFfAo6X', // Celebrity Selfie Video Generator
            '8GC371u1uBQ8WLmu', // Meta Ad Library Analyzer
            '5pMi01SwffYB6KeX', // YouTube AI Clone
            'U6EZ2iLQ4zCGg31H', // Call Audio Lead Analyzer
            '5Fl9WUjYTpodcloJ', // AI Calendar Assistant
            'stj8DmATqe66D9j4', // Floor Plan to Property Tour
            'vCxY2DXUZ8vUb30f'  // Monthly CRO Insights Bot
        ];

        console.log(`Activating ${activeIds.length} marketplace templates...`);
        const activationBatch = db.batch();
        for (const id of activeIds) {
            const ref = db.collection(TEMPLATES_COLLECTION).doc(id);
            activationBatch.update(ref, {
                readinessStatus: 'Active',
                tags: ['marketplace']
            });
        }

        await activationBatch.commit();
        console.log('Marketplace templates successfully activated.');

    } catch (error) {
        console.error('Error during update:', error);
    }
}

updateTemplatesStatus();
