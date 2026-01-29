import { getFirestoreAdmin, COLLECTIONS } from './src/lib/firebase-admin';

async function getSamples() {
    try {
        const db = getFirestoreAdmin();
        const snapshot = await db.collection(COLLECTIONS.TEMPLATES).limit(3).get();
        const samples = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(JSON.stringify(samples, null, 2));
    } catch (error) {
        console.error('Error fetching samples:', error);
        process.exit(1);
    }
}

getSamples();
