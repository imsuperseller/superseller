const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Manually load .env.local to avoid dotenv dependency issues
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        // Skipping comments
        if (line.trim().startsWith('#')) return;
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            // Basic unquote logic
            let val = parts.slice(1).join('=').trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            process.env[key] = val;
        }
    });
} else {
    console.error('.env.local not found!');
    process.exit(1);
}

async function seed() {
    // Initialize Firebase Admin
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
        console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in .env.local');
        process.exit(1);
    }

    // Handle potential JSON string format issues
    if (typeof serviceAccount === 'string') {
        try {
            serviceAccount = JSON.parse(serviceAccount);
        } catch (e) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY JSON');
        }
    }

    // Fix private key newlines
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const db = admin.firestore();
    try {
        // List users via service_instances (bypass Auth SDK issues)
        console.log('Fetching a valid user from service_instances...');

        // We assume the database has at least one service instance (the user said they have "Active Agents")
        const snapshot = await db.collection('service_instances').limit(1).get();

        if (snapshot.empty) {
            console.log('No service_instances found. Cannot guess clientId.');
            process.exit(1);
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        const uid = data.clientId;
        const email = data.clientEmail || 'unknown@email.com';

        console.log(`Found user via Service Instance: ${email} (${uid})`);

        // Create a usage log
        console.log('Creating sample usage logs for this user...');

        const logs = [
            {
                clientId: uid,
                agentId: 'writer-agent-v1',
                status: 'completed',
                startedAt: admin.firestore.Timestamp.now(),
                completedAt: admin.firestore.Timestamp.fromMillis(Date.now() + 15000), // +15s
                durationMs: 15000,
                model: 'gpt-4-turbo',
                tokens: { input: 850, output: 420, total: 1270 },
                cost: 450, // 4.5 cents
                output: 'Article "AI Trends 2026" generated successfully.',
                metadata: {
                    type: 'content'
                }
            },
            {
                clientId: uid,
                agentId: 'seo-analyzer-bot',
                status: 'completed',
                startedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 3600000), // 1 hour ago
                completedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 3600000 + 45000),
                durationMs: 45000,
                model: 'gpt-3.5-turbo',
                tokens: { input: 1500, output: 100, total: 1600 },
                cost: 50, // 0.5 cents
                output: 'SEO Audit completed for rensto.com',
                metadata: {
                    type: 'automation'
                }
            },
            {
                clientId: uid,
                agentId: 'linkedin-poster',
                status: 'failed',
                startedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000), // 1 day ago
                completedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000 + 2000),
                durationMs: 2000,
                model: 'gpt-4',
                tokens: { input: 200, output: 0, total: 200 },
                cost: 10, // 0.1 cents
                output: 'Error: LinkedIn API authorization failed.',
                metadata: {
                    type: 'social'
                }
            }
        ];

        for (const log of logs) {
            // Add a random slight jitter to timestamp to ensure sorting doesn't clash
            log.startedAt = admin.firestore.Timestamp.fromMillis(Date.now() - (Math.random() * 10000));
            await db.collection('usage_logs').add(log);
            console.log(`Added log for ${log.agentId}`);
        }

        console.log('Success! Added 3 usage logs.');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
