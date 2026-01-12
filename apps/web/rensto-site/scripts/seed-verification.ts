
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        if (line.trim().startsWith('#')) return;
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    });
}

const serviceAccountVal = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountVal) {
    console.error("No FIREBASE_SERVICE_ACCOUNT_KEY found in .env.local");
    process.exit(1);
}

const serviceAccount = JSON.parse(serviceAccountVal);
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
        projectId: 'rensto'
    });
}

const db = getFirestore();

const TEST_CLIENT_ID = 'test-verification-client';

async function seed() {
    console.log(`Seeding verification data for client: ${TEST_CLIENT_ID}`);

    const batch = db.batch();

    // 1. Create User with Entitlements
    const userRef = db.collection('users').doc(TEST_CLIENT_ID);
    batch.set(userRef, {
        id: TEST_CLIENT_ID,
        email: 'test@rensto.com',
        name: 'Verification Tester',
        createdAt: Timestamp.now(),
        entitlements: {
            freeLeadsTrial: true,
            freeLeadsRemaining: 7,
            pillars: ['leads'],
            marketplaceProducts: [],
            customSolution: null
        }
    }, { merge: true });

    // 2. Create Sample Leads
    const leadsCount = 5;
    for (let i = 0; i < leadsCount; i++) {
        const leadRef = db.collection('leads').doc();
        batch.set(leadRef, {
            userId: TEST_CLIENT_ID,
            name: `Lead ${i + 1}`,
            company: `Test Co ${i + 1}`,
            email: `lead${i + 1}@example.com`,
            phone: `+1-555-010${i}`,
            website: `https://testco${i + 1}.com`,
            source: 'Rensto AI Agent',
            status: ['new', 'contacted', 'qualified', 'quoted', 'converted'][i % 5],
            createdAt: Timestamp.fromMillis(Date.now() - (i * 86400000)), // Spread over days
            notes: 'Generated via verification script'
        });
    }

    // 3. Create Usage Logs
    const agents = ['lead-finder-v1', 'email-writer-pro', 'linkedin-automation'];
    for (let i = 0; i < 15; i++) {
        const logRef = db.collection('usage_logs').doc();
        const tokensInput = Math.floor(Math.random() * 2000) + 500;
        const tokensOutput = Math.floor(Math.random() * 1000) + 100;
        batch.set(logRef, {
            clientId: TEST_CLIENT_ID,
            agentId: agents[i % agents.length],
            status: Math.random() > 0.1 ? 'completed' : 'failed',
            startedAt: Timestamp.fromMillis(Date.now() - (i * 3600000)), // One every hour
            completedAt: Timestamp.fromMillis(Date.now() - (i * 3600000) + 15000),
            durationMs: 15000,
            model: Math.random() > 0.5 ? 'gpt-4-turbo' : 'gpt-3.5-turbo',
            tokens: {
                input: tokensInput,
                output: tokensOutput,
                total: tokensInput + tokensOutput
            },
            cost: Math.floor((tokensInput + tokensOutput) * 0.003), // estimate in cents
            output: 'Success',
            metadata: { test: true }
        });
    }

    // 4. Create Service Instances (to show in "Active Agents")
    for (let i = 0; i < agents.length; i++) {
        const siRef = db.collection('service_instances').doc(`${TEST_CLIENT_ID}_${agents[i]}`);
        batch.set(siRef, {
            clientId: TEST_CLIENT_ID,
            agentId: agents[i],
            status: 'active',
            lastRun: Timestamp.now(),
            createdAt: Timestamp.now()
        }, { merge: true });
    }

    await batch.commit();
    console.log('Verification data seeded successfully!');
    console.log(`Access at: /dashboard/${TEST_CLIENT_ID}`);
}

seed().catch(console.error);
