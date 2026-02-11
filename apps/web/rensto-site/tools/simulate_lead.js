/**
 * tools/simulate_lead.js
 * 
 * Purpose: Inserts a test lead into Firestore to verify the AITable sync.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../service-account.json');

// Initialize Firebase (if not already)
if (!process.env.FIREBASE_CONFIG) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function createTestLead() {
    const testLead = {
        name: "Test User " + Date.now(),
        email: `test${Date.now()}@example.com`,
        phone: "+15550101",
        source: "Manual Simulation",
        syncedToAITable: false,
        createdAt: new Date()
    };

    try {
        const docRef = await db.collection('leads').add(testLead);
        console.log(`✅ Created Test Lead: ${docRef.id}`);
        console.log(testLead);
    } catch (error) {
        console.error('❌ Error creating lead:', error);
    }
}

createTestLead();
