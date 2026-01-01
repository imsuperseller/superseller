'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const clientFirebaseConfig = {
    apiKey: "AIzaSyC0nEzAZZmVExL_65CwiRwGngRgF4BoK94",
    authDomain: "rensto.firebaseapp.com",
    projectId: "rensto",
    storageBucket: "rensto.firebasestorage.app",
    messagingSenderId: "1001545773174",
    appId: "1:1001545773174:web:c7af4528427957c7b7ef57"
};

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
    app = initializeApp(clientFirebaseConfig);
    db = getFirestore(app);
} else {
    app = getApps()[0];
    db = getFirestore(app);
}

export { app, db };
