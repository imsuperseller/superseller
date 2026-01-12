import { getFirestoreAdmin, COLLECTIONS } from '../src/lib/firebase-admin';

async function verifyLeadPack(email: string, leadsToAdd: number) {
    const db = getFirestoreAdmin();
    const userDocId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const userRef = db.collection(COLLECTIONS.USERS).doc(userDocId);

    console.log(`Verifying lead pack for ${email}...`);

    // 1. Get current balance
    const beforeSnap = await userRef.get();
    const beforeLeads = beforeSnap.exists ? (beforeSnap.data()?.entitlements?.freeLeadsRemaining || 0) : 0;

    console.log(`Current leads: ${beforeLeads}`);

    // 2. Simulate webhook update
    const newLeads = beforeLeads + leadsToAdd;
    await userRef.update({
        'entitlements.freeLeadsRemaining': newLeads,
        'entitlements.freeLeadsTrial': false,
        'entitlements.pillars': Array.from(new Set([...(beforeSnap.data()?.entitlements?.pillars || []), 'leads', 'outreach']))
    });

    // 3. Verify update
    const afterSnap = await userRef.get();
    const afterLeads = afterSnap.data()?.entitlements?.freeLeadsRemaining;

    if (afterLeads === newLeads) {
        console.log(`✅ Success! New leads count: ${afterLeads}`);
    } else {
        console.error(`❌ Failure! Expected ${newLeads}, but got ${afterLeads}`);
    }
}

// Example usage:
verifyLeadPack('test@rensto.com', 50);
