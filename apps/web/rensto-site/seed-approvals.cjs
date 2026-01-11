const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Manually load .env.local to avoid dotenv dependency issues
const envPath = path.resolve(__dirname, '.env.local');
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
} else {
    console.error('.env.local not found!');
    process.exit(1);
}

async function seed() {
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccount) { console.error('FIREBASE_SERVICE_ACCOUNT_KEY missing'); process.exit(1); }
    if (typeof serviceAccount === 'string') { try { serviceAccount = JSON.parse(serviceAccount); } catch (e) { } }
    if (serviceAccount.private_key) { serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n'); }

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    const db = admin.firestore();
    console.log('Fetching a valid user from service_instances...');

    try {
        const snapshot = await db.collection('service_instances').limit(1).get();
        if (snapshot.empty) { console.log('No service_instances found.'); process.exit(1); }

        const doc = snapshot.docs[0];
        const data = doc.data();
        const uid = data.clientId;
        const email = data.clientEmail || 'unknown@email.com';

        console.log(`Found user: ${email} (${uid})`);
        console.log('Creating sample approval requests...');

        const requests = [
            {
                clientId: uid,
                serviceId: 'linkedin-poster',
                title: 'LinkedIn Post: AI Trends 2026',
                description: 'Generated post analyzing the top 3 AI trends for agencies this year.',
                content: {
                    text: "🚀 AI Agency Trends for 2026:\n1. Hyper-personalization\n2. Autonomous fulfillment\n3. Voice AI integration\n\n#AI #Agency #2026 #BusinessGrowth",
                    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995"
                },
                status: 'pending',
                requestedAt: admin.firestore.Timestamp.now(),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 86400000 * 2) // +2 days
            },
            {
                clientId: uid,
                serviceId: 'writer-agent-v1',
                title: 'Blog Draft: "Why Automation Fails"',
                description: 'Draft article for approval before publishing to WordPress.',
                content: {
                    text: "Automation often fails not because of technology, but because of poor process design...",
                    url: "https://docs.google.com/document/d/xyz"
                },
                status: 'pending',
                requestedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 3600000 * 2),
                expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 86400000)
            },
            {
                clientId: uid,
                serviceId: 'social-poster',
                title: 'Weekly Tweet Thread',
                description: 'Thread about productivity hacks.',
                content: {
                    text: "1/5 optimize your sleep\n2/5 drink water..."
                },
                status: 'approved',
                requestedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000 * 2),
                respondedAt: admin.firestore.Timestamp.fromMillis(Date.now() - 86400000),
                feedback: 'Looks good!'
            }
        ];

        for (const req of requests) {
            await db.collection('approvals').add(req);
            console.log(`Added approval request: ${req.title}`);
        }

        console.log('Success! Added 3 approval requests.');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
