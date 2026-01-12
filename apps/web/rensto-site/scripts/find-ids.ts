import { getFirestoreAdmin } from './src/lib/firebase-admin';
import { COLLECTIONS } from './src/types/firestore';

async function listClients() {
    const db = getFirestoreAdmin();
    const snap = await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).limit(5).get();
    snap.forEach(doc => {
        console.log('Client ID:', doc.id);
    });

    const userSnap = await db.collection(COLLECTIONS.USERS).limit(5).get();
    userSnap.forEach(doc => {
        console.log('User ID:', doc.id);
    });
}

listClients();
