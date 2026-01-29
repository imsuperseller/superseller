
import { getFirestoreAdmin, COLLECTIONS } from './src/lib/firebase-admin';

async function main() {
    const db = getFirestoreAdmin();
    console.log('Retrieving users...');

    try {
        const usersSnap = await db.collection(COLLECTIONS.USERS).limit(10).get();
        console.log(`Found ${usersSnap.size} users`);
        usersSnap.forEach(doc => {
            const data = doc.data();
            console.log(`\nUser ID: ${doc.id}`);
            console.log(`Email: ${data.email}`);
            console.log(`n8nInstance:`, JSON.stringify(data.n8nInstance, null, 2));
            if (data.entitlements) {
                console.log(`Entitlements:`, JSON.stringify(data.entitlements, null, 2));
            }
        });

        // Check secretary_configs
        const configsSnap = await db.collection(COLLECTIONS.SECRETARY_CONFIGS).get();
        console.log(`\nFound ${configsSnap.size} secretary_configs`);
        configsSnap.forEach(doc => {
            console.log(`Doc ID: ${doc.id}, data:`, JSON.stringify(doc.data(), null, 2));
        });

    } catch (error) {
        console.error('Error exploring Firestore:', error);
    }
}

main();
