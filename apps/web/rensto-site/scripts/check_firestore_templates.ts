import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const clientFirebaseConfig = {
    apiKey: "AIzaSyC0nEzAZZmVExL_65CwiRwGngRgF4BoK94",
    authDomain: "rensto.firebaseapp.com",
    projectId: "rensto",
    storageBucket: "rensto.firebasestorage.app",
    messagingSenderId: "1001545773174",
    appId: "1:1001545773174:web:c7af4528427957c7b7ef57"
};

const app = initializeApp(clientFirebaseConfig);
const db = getFirestore(app);

async function checkTemplates() {
    console.log('Fetching templates from Firestore...');
    const templatesRef = collection(db, 'templates');
    const snapshot = await getDocs(templatesRef);

    console.log(`Found ${snapshot.size} templates.`);
    snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Name: ${data.name}, Status: ${data.readinessStatus}, Tags: ${JSON.stringify(data.tags)}`);
    });
}

checkTemplates().catch(console.error);
