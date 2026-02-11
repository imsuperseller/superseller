/**
 * tools/sync_leads_to_aitable.js
 * 
 * Purpose: Syncs "New" Leads from Firestore to AITable for manual admin processing.
 * Protocol: BLAST Layer 3 (Atomic Tool)
 * 
 * Usage: node tools/sync_leads_to_aitable.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../service-account.json');
const fs = require('fs');
const path = require('path');

// Load .env.local manually for local testing
const envPath = path.resolve(__dirname, '../.env.local');
console.log('📂 Loading environment from:', envPath);
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = match[2] || '';
            // Remove leading/trailing quotes
            value = value.replace(/(^['"]|['"]$)/g, '').trim();
            process.env[key] = value;
        }
    });
}
console.log('🔑 AITABLE_API_TOKEN status:', process.env.AITABLE_API_TOKEN ? 'LOADED' : 'MISSING');

// Initialize Firebase (if not already)
if (!process.env.FIREBASE_CONFIG) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();
const AITABLE_API_TOKEN = process.env.AITABLE_API_TOKEN;
const LEADS_ID = process.env.AITABLE_RENSTO_LEADS_ID;
const CLIENTS_ID = process.env.AITABLE_RENSTO_CLIENTS_ID;
const PRODUCTS_ID = process.env.AITABLE_RENSTO_PRODUCTS_ID;

async function syncCollection(collectionName, datasheetId, mapper) {
    if (!datasheetId) {
        console.warn(`⚠️ Skipping ${collectionName}: Datasheet ID missing.`);
        return;
    }

    console.log(`🔍 Checking for unsynced ${collectionName}...`);
    const snapshot = await db.collection(collectionName)
        // Check for syncedToAITable flag (handle case where it doesn't exist yet)
        .where('syncedToAITable', '==', false)
        .limit(50)
        .get();

    if (snapshot.empty) {
        console.log(`✅ No new ${collectionName} to sync.`);
        return;
    }

    const docs = [];
    snapshot.forEach(doc => docs.push({ id: doc.id, ...doc.data() }));

    const records = docs.map(mapper);

    try {
        const response = await fetch(`https://aitable.ai/fusion/v1/datasheets/${datasheetId}/records`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AITABLE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ records })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        console.log(`✅ Successfully pushed ${docs.length} records to ${collectionName}.`);

        const batch = db.batch();
        docs.forEach(doc => {
            const ref = db.collection(collectionName).doc(doc.id);
            batch.update(ref, { syncedToAITable: true });
        });
        await batch.commit();
        console.log(`✅ Firestore ${collectionName} updated.`);
    } catch (error) {
        console.error(`❌ ${collectionName} Sync Failed:`, error.message);
    }
}

async function main() {
    if (!AITABLE_API_TOKEN) {
        console.error('❌ AITABLE_API_TOKEN missing.');
        return;
    }

    // 1. Sync Leads
    await syncCollection('leads', LEADS_ID, lead => ({
        fields: {
            "Lead Name": lead.name || "Unknown",
            "Email": lead.email || "",
            "Phone": lead.phone || "",
            "Source": lead.source || "Website",
            "Status": "New",
            "Firestore ID": lead.id,
            "Created At": lead.createdAt?.toDate ? lead.createdAt.toDate().toISOString() : new Date().toISOString()
        }
    }));

    // 2. Sync Clients (Users collection)
    await syncCollection('users', CLIENTS_ID, user => ({
        fields: {
            "Client Name": `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || "Unknown",
            "Email": user.email || "",
            "Status": user.status || "Active",
            "Subscription": user.subscriptionPlan || "N/A",
            "Firestore ID": user.id,
            "Created At": user.createdAt?.toDate ? user.createdAt.toDate().toISOString() : new Date().toISOString()
        }
    }));

    // 3. Sync Products
    // Products are mostly in ProductRegistry.ts but we can port them as a one-time thing or keep in sync if they hit Firestore
    // For now, let's just run the Leads and Clients.
}

main();
