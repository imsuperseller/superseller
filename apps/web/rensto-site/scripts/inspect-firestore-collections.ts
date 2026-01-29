import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || './service-account.json';
let app;

if (getApps().length === 0) {
    try {
        let serviceAccount;
        if (serviceAccountPath && serviceAccountPath.startsWith('{')) {
            serviceAccount = JSON.parse(serviceAccountPath);
        } else {
            const fs = require('fs');
            const path = require('path');
            const fullPath = path.resolve(__dirname, '..', serviceAccountPath);
            serviceAccount = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        }

        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        app = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || 'rensto'
        });
    } catch (error) {
        console.log("No FIREBASE_SERVICE_ACCOUNT_KEY found or invalid path. Trying default credentials...");
        app = initializeApp({ projectId: 'rensto' });
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// Collections to inspect for marketplace video workflow compatibility
const COLLECTIONS_TO_INSPECT = [
    'templates',
    'workflows',
    'service_manifests'
];

async function inspectCollections() {
    console.log("=== FIRESTORE COLLECTION AUDIT ===\n");

    for (const collectionName of COLLECTIONS_TO_INSPECT) {
        console.log(`\n--- Collection: ${collectionName} ---`);
        try {
            const snapshot = await db.collection(collectionName).limit(500).get();
            if (snapshot.empty) {
                console.log(`  (empty or does not exist)`);
                continue;
            }
            console.log(`  Documents found: ${snapshot.size}`);
            snapshot.docs.forEach((doc, idx) => {
                const data = doc.data();
                console.log(`\n  [${idx + 1}] Doc ID: ${doc.id}`);
                console.log(`      Fields: ${Object.keys(data).join(', ')}`);
                // Show a sample of key fields
                if (data.name) console.log(`      name: ${data.name}`);
                if (data.status) console.log(`      status: ${data.status}`);
                if (data.readinessStatus) console.log(`      readinessStatus: ${data.readinessStatus}`);
                if (data.tags) console.log(`      tags: ${JSON.stringify(data.tags)}`);
                if (data.videoUrl) console.log(`      videoUrl: ${data.videoUrl}`);
                if (data.promptPacks) console.log(`      promptPacks: (object present)`);
            });
        } catch (err: any) {
            console.log(`  Error: ${err.message}`);
        }
    }

    console.log("\n=== END AUDIT ===");
}

inspectCollections().catch(console.error);
