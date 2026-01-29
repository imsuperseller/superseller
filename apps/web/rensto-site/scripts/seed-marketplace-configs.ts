import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// 1. Initialize Firebase
const serviceAccountPath = '/Users/shaifriedman/New Rensto/rensto/infra/rensto-svc.json';
let app;

if (getApps().length === 0) {
    if (fs.existsSync(serviceAccountPath)) {
        try {
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
            if (serviceAccount.private_key) {
                serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
            }
            app = initializeApp({
                credential: cert(serviceAccount),
                projectId: 'rensto'
            });
            console.log("✅ Authenticated with provided service account");
        } catch (e) {
            console.error("Failed to parse service account JSON", e);
            process.exit(1);
        }
    } else {
        console.log("❌ Service account file not found at: " + serviceAccountPath);
        process.exit(1);
    }
} else {
    app = getApps()[0];
}

const db = getFirestore(app);

// 2. Define The Master Configs (The "Source of Truth")
const CONFIGS = [
    {
        id: 'uad', // Matches ?product=uad
        tableId: '6T8jI35R2tX1Mni9', // UAD Garage Door Table
        flowType: 'IMAGE',
        modelName: 'flux-pro-1.1',
        prompts: [
            "A hyper-realistic photo of a modern garage door, sleek aluminum finish, morning sunlight",
            "A cozy suburban home with a wooden carriage-style garage door, warm evening lighting"
        ],
        technical: {
            profileId: 'Profile_UAD_123', // Example ID
            videoSuffix: '_garage'
        }
    },
    {
        id: 'missparty', // Matches ?product=missparty
        tableId: 'lOkdHmJ3IHnz4cPR', // missParty Bounce House Table
        flowType: 'VIDEO',
        modelName: 'bytedance/v1-pro-fast-image-to-video',
        prompts: [
            "A cinematic video of a beautiful white inflatable bounce house in a sunny backyard, children joyfully bouncing inside, gentle camera movement"
        ],
        technical: {
            profileId: 'Profile_MissParty_456', // Example ID
            videoSuffix: '_bounce'
        }
    }
];

// 3. Seed Function
async function seedConfigs() {
    console.log("🚀 Seeding Marketplace Configs...");
    const batch = db.batch();

    for (const config of CONFIGS) {
        const ref = db.collection('marketplace_configs').doc(config.id);
        batch.set(ref, {
            ...config,
            updatedAt: new Date()
        }, { merge: true });
        console.log(`Prepared: ${config.id} (${config.flowType})`);
    }

    await batch.commit();
    console.log("✅ Successfully seeded marketplace_configs!");
}

seedConfigs().catch(console.error);
