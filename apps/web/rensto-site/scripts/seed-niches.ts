
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
    console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY is missing in .env.local');
    process.exit(1);
}

console.log('Service Account Key length:', serviceAccountKey.length);

// Initialize Firebase Admin
if (getApps().length === 0) {
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        console.log('Service Account parsed successfully. Project ID:', serviceAccount.project_id);
        initializeApp({
            credential: cert(serviceAccount),
            projectId: 'rensto'
        });
    } catch (error) {
        console.error('Error parsing service account:', error);
        process.exit(1);
    }
}

const db = getFirestore();

async function seedNiches() {
    const dataPath = '/Users/shaifriedman/.gemini/antigravity/brain/c4707f2d-4819-43d3-b11b-2e3462afc457/niche_data.json';

    try {
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const niches = JSON.parse(rawData);

        console.log(`Found ${niches.length} niches to seed...`);

        const batch = db.batch();

        for (const niche of niches) {
            const docRef = db.collection('niches').doc(niche.slug);
            batch.set(docRef, {
                ...niche,
                updatedAt: new Date()
            }, { merge: true });
        }

        await batch.commit();
        console.log('Successfully seeded niches to Firebase!');
    } catch (error) {
        console.error('Error seeding niches:', error);
    }
}

seedNiches();
