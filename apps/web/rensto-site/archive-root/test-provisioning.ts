import { getFirestoreAdmin, COLLECTIONS } from './src/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

async function testProvisioning() {
    const db = getFirestoreAdmin();
    const testSessionId = 'test_sesh_' + Date.now();
    const templateId = '4OYGXXMYeJFfAo6X'; // Celebrity Selfie
    const customerEmail = 'tester@rensto.com';

    console.log(`Simulating provisioning for ${templateId}...`);

    try {
        const docRef = await db.collection(COLLECTIONS.SERVICE_INSTANCES).add({
            clientId: 'test_client_antigravity',
            clientEmail: customerEmail,
            productName: 'Celebrity Selfie Movie Sets Generator',
            productId: templateId,
            status: 'pending_setup',
            type: 'marketplace_implementation',
            stripeSessionId: testSessionId,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });

        console.log(`Success! Service Instance created: ${docRef.id}`);

        // Check if it exists
        const doc = await docRef.get();
        console.log('Document Data:', doc.data());

        // Clean up
        // await docRef.delete();
        // console.log('Cleaned up test document.');
    } catch (error) {
        console.error('Provisioning test failed:', error);
    }
}

testProvisioning();
