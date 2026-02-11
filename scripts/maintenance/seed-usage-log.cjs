const admin = require('firebase-admin');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the web app
const envPath = path.resolve(__dirname, '../apps/web/rensto-site/.env.local');
dotenv.config({ path: envPath });

async function seed() {
    // Initialize Firebase Admin
    let serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccount) {
        console.error('FIREBASE_SERVICE_ACCOUNT_KEY not found in ' + envPath);
        process.exit(1);
    }

    // Handle potential JSON string format issues
    if (typeof serviceAccount === 'string') {
        // If it's a string (from env), parse it
        // Handle newlines if they are escaped literal "\n"
        try {
            serviceAccount = JSON.parse(serviceAccount);
        } catch (e) {
            // failed to parse, maybe it's already an object or file path? 
            // Proceeding assuming it might work or crash.
            // Actually, if it's a file path string, this won't work with cert().
            // But usually it's the JSON content.
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
    const auth = admin.auth();

    console.log('Fetching users...');

    try {
        // List users (limit 10)
        const listUsersResult = await auth.listUsers(10);
        const users = listUsersResult.users;

        if (users.length === 0) {
            console.log('No users found in Firebase Auth.');
            process.exit(0);
        }

        // Pick the first user (most likely the developer)
        const user = users[0];
        const email = user.email;
        const uid = user.uid;

        console.log(`Found user: ${email} (${uid})`);

        // Create a usage log
        console.log('Creating sample usage logs for this user...');

        const logs = [
            {
                clientId: uid,
                agentId: 'writer-agent-v1',
                timestamp: admin.firestore.Timestamp.now(),
                model: 'gpt-4-turbo',
                tokens: { input: 850, output: 420, total: 1270 },
                cost: 450, // 4.5 cents
                metadata: {
                    status: 'completed',
                    type: 'content'
                }
            },
            {
                clientId: uid,
                agentId: 'seo-analyzer-bot',
                timestamp: admin.firestore.Timestamp.fromMillis(Date.now() - 3600000), // 1 hour ago
                model: 'gpt-3.5-turbo',
                tokens: { input: 1500, output: 100, total: 1600 },
                cost: 50, // 0.5 cents
                metadata: {
                    status: 'completed',
                    type: 'automation'
                }
            }
        ];

        for (const log of logs) {
            await db.collection('usage_logs').add(log);
            console.log(`Added log for ${log.agentId}`);
        }

        console.log('Success! Added 2 usage logs.');

    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

seed();
