import { db } from '../../apps/web/rensto-site/src/lib/firebase-client';
import { collection, getDocs } from 'firebase/firestore';

async function listCollections() {
    console.log('🔍 Listing active collections in Firestore...');
    const collections = ['clients', 'solutions', 'templates', 'solution_instances', 'restricted'];

    for (const collName of collections) {
        try {
            const q = collection(db, collName);
            const snapshot = await getDocs(q);
            console.log(`\n📂 Collection: ${collName} (${snapshot.size} documents)`);
            snapshot.docs.slice(0, 3).forEach(doc => {
                console.log(`  📄 Doc: ${doc.id}`);
                // console.log(JSON.stringify(doc.data(), null, 2));
            });
        } catch (error) {
            console.error(`❌ Failed to read collection ${collName}:`, error.message);
        }
    }
}

listCollections();
