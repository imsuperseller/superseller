const admin = require('firebase-admin');

// Default to 'superseller' project ID
const projectId = 'superseller';

async function seedUser() {
    if (!admin.apps.length) {
        admin.initializeApp({
            projectId: projectId
        });
    }

    const db = admin.firestore();
    const email = 'shai@superseller.agency';
    const userDocId = email.replace(/[^a-z0-9]/g, '_');

    console.log(`Seeding user: ${email} (ID: ${userDocId})`);

    const userData = {
        email: email,
        name: 'Shai Friedman (Test)',
        createdAt: admin.firestore.Timestamp.now(),
        entitlements: {
            freeLeadsTrial: true,
            freeLeadsRemaining: 0,
            pillars: ['leads', 'outreach', 'voice', 'secretary', 'knowledge', 'content'],
            marketplaceProducts: ['celebrity-video', 'ad-analyzer'],
            customSolution: null
        },
        dashboardToken: 'test-token-123',
        updatedAt: admin.firestore.Timestamp.now()
    };

    await db.collection('users').doc(userDocId).set(userData);
    console.log('User seeded successfully!');

    // Also add to customSolutionsClients for fallback checks
    await db.collection('customSolutionsClients').doc('shai-personal').set({
        ...userData,
        status: 'active'
    });
    console.log('Custom solution client seeded successfully!');
}

seedUser().catch(console.error);
