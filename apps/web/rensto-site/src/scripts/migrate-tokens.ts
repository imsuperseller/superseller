import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

/**
 * MIGRATION: Secure Dashboard Tokens
 * Run this script to assign non-predictable UUIDs to all existing users.
 */
async function migrateUsers() {
    console.log('🚀 Starting Client Identity Migration...');
    const db = getFirestoreAdmin();

    // 1. Migrate core 'users' collection
    const usersSnap = await db.collection(COLLECTIONS.USERS).get();
    console.log(`Found ${usersSnap.size} core users.`);

    const batch = db.batch();
    let count = 0;

    usersSnap.docs.forEach(doc => {
        const data = doc.data();
        if (!data.dashboardToken) {
            batch.update(doc.ref, {
                dashboardToken: uuidv4(),
                updatedAt: new Date().toISOString()
            });
            count++;
        }
    });

    if (count > 0) {
        await batch.commit();
        console.log(`✅ Successfully assigned ${count} secure tokens to core users.`);
    } else {
        console.log('✨ All core users already have secure tokens.');
    }
}

migrateUsers().catch(console.error);
