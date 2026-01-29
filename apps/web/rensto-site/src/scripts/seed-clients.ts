import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

/**
 * SEEDING: Multi-Tenant Clients & Leads
 * This script sets up Ben's cluster and marks Avi/Yossi as leads.
 */
async function seedClientClusters() {
    console.log('🚀 Seeding Client Identity Clusters...');
    const db = getFirestoreAdmin();

    // 1. Ben Ginati (Tax4Us) - Multi-tenant cloud instance
    const benEmail = 'ai@tax4us.co.il';
    const benRef = db.collection(COLLECTIONS.USERS).doc(benEmail);

    await benRef.set({
        email: benEmail,
        name: 'Ben Ginati',
        businessName: 'Tax4Us',
        status: 'active',
        n8nInstance: {
            url: 'https://tax4usllc.app.n8n.cloud',
            apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0NjA1OTA2fQ.J3vPZjOepbtoBoo_tFiFqbU0eNbrIUOp9V06UAFFUGQ',
            mcpToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjM4OTQwMTM4LTVhZDUtNDBmZi1hZDM1LTgwZTY4MmRhYWZlNiIsImlhdCI6MTc2NDA1MjcyNX0.s_3K8cJYO3h6VuY4rpc94rIIo5eZOkWnyOfBAn5VnV4'
        },
        updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Configured n8n Cluster for ${benEmail}`);

    // 2. Avi Hershko (SimPass) - Prospect
    const aviEmail = 'avi@simpass.io';
    await db.collection(COLLECTIONS.USERS).doc(aviEmail).set({
        email: aviEmail,
        name: 'Avi Hershko',
        businessName: 'SimPass',
        status: 'qualified',
        updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Marked ${aviEmail} as Qualified Lead`);

    // 3. Yossi Tarablus - Under Investigation Prospect
    const yossiEmail = 'yossi@sportek.com'; // Placeholder from context
    await db.collection(COLLECTIONS.USERS).doc(yossiEmail).set({
        email: yossiEmail,
        name: 'Yossi Tarablus',
        businessName: 'Sportek Projects',
        status: 'prospect',
        updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`✅ Marked ${yossiEmail} as Prospect`);
}

seedClientClusters().catch(console.error);
