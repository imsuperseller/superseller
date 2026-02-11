import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../apps/web/rensto-site/.env.local') });

async function seedFirestore() {
    console.log('🚀 Starting Firestore Seed...');

    // 1. Initialize Firebase
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY missing in .env.local');
    }

    const serviceAccount = JSON.parse(serviceAccountKey);
    if (getApps().length === 0) {
        initializeApp({
            credential: cert(serviceAccount),
            projectId: 'rensto'
        });
    }

    const db = getFirestore();
    const COLLECTIONS = { TEMPLATES: 'templates' };

    // 2. Read Categorization File
    const filePath = path.join(__dirname, '../workflows/templates-library/WORKFLOW_CATEGORIZATION.md');
    if (!fs.existsSync(filePath)) {
        throw new Error(`Categorization file not found at ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const templates: any[] = [];
    let currentCategory = '';

    console.log('📄 Parsing WORKFLOW_CATEGORIZATION.md...');

    for (const line of lines) {
        if (line.startsWith('### ')) {
            currentCategory = line.replace('### ', '').split(' (')[0].trim();
        }

        if (line.startsWith('| `')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 5) {
                const workflowId = parts[1].replace(/`/g, '');
                const name = parts[2];
                const status = parts[3];
                const tags = parts[4].split(',').map(t => t.replace(/`/g, '').trim()).filter(Boolean);

                templates.push({
                    workflowId,
                    name,
                    category: currentCategory.toLowerCase().replace(/ /g, '-'),
                    status,
                    tags,
                    description: `Rensto ${currentCategory} solution: ${name}`,
                    price: currentCategory === 'Internal Operations' ? 0 : 97,
                    installPrice: currentCategory === 'Internal Operations' ? 0 : 797,
                    customPrice: currentCategory === 'Internal Operations' ? 0 : 1497,
                });
            }
        }
    }

    console.log(`📦 Found ${templates.length} templates. Starting batch write...`);

    // 3. Batch Write to Firestore
    const batchSize = 100;
    for (let i = 0; i < templates.length; i += batchSize) {
        const batch = db.batch();
        const currentBatch = templates.slice(i, i + batchSize);
        const now = Timestamp.now();

        for (const template of currentBatch) {
            const docRef = db.collection(COLLECTIONS.TEMPLATES).doc(template.workflowId);
            batch.set(docRef, {
                workflowId: template.workflowId,
                name: template.name,
                description: template.description,
                category: template.category,
                price: template.price,
                installPrice: template.installPrice,
                customPrice: template.customPrice,
                features: template.tags,
                installation: true,
                popular: template.status.includes('✅'),
                version: '1.0.0',
                readinessStatus: template.status.includes('✅') ? 'Active' : 'Draft',
                fileSize: 15,
                createdAt: now,
                updatedAt: now
            }, { merge: true });
        }

        await batch.commit();
        console.log(`✅ Progress: ${Math.min(i + batchSize, templates.length)}/${templates.length}`);
    }

    console.log('✨ Firestore Seeding Complete!');
}

seedFirestore().catch(err => {
    console.error('❌ Seeding Failed:', err);
    process.exit(1);
});
