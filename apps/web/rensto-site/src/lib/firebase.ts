// Shared Firebase configuration for server-side usage
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Firebase Admin SDK for server-side operations
// Note: For client-side, use the config from DashboardContent.tsx

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;

export function getFirebaseAdmin(): App {
    if (firebaseApp) return firebaseApp;

    if (getApps().length === 0) {
        // Check for service account credentials
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccountKey) {
            // Use service account for full access
            try {
                const serviceAccount = JSON.parse(serviceAccountKey);
                firebaseApp = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: 'rensto'
                });
            } catch (error) {
                console.error('Failed to parse service account:', error);
                // Fallback to default credentials
                firebaseApp = initializeApp({
                    projectId: 'rensto'
                });
            }
        } else {
            // Use application default credentials (works in GCP/Firebase hosting)
            firebaseApp = initializeApp({
                projectId: 'rensto'
            });
        }
    } else {
        firebaseApp = getApps()[0];
    }

    return firebaseApp;
}

export function getFirestoreAdmin(): Firestore {
    if (firestoreDb) return firestoreDb;

    getFirebaseAdmin();
    firestoreDb = getFirestore();
    return firestoreDb;
}

// Collection names
export const COLLECTIONS = {
    CUSTOM_SOLUTIONS_CLIENTS: 'customSolutionsClients',
    MAGIC_LINK_TOKENS: 'magicLinkTokens',
    TEMPLATES: 'templates',
    CLIENTS: 'clients',
    ANALYTICS: 'analytics'
} as const;

// TypeScript types for Custom Solutions
export interface CustomSolutionsClient {
    id: string;
    email: string;
    name: string;
    websiteUrl?: string;

    // Qualification
    qualificationScore: number;
    qualificationTier: 'high' | 'medium' | 'low';
    answers: Record<string, string>;

    // Solution
    selectedTier?: 'starter' | 'professional' | 'enterprise';
    solutionPlan?: Record<string, unknown>;

    // Payment
    stripeSessionId?: string;
    stripeCustomerId?: string;
    amountPaid?: number;

    // Contract
    contractId?: string;
    contractStatus?: 'pending' | 'signed' | 'declined';

    // Status
    status: 'qualified' | 'contract_sent' | 'paid' | 'onboarding' | 'active';

    // Timestamps
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    lastLogin?: FirebaseFirestore.Timestamp;
}

export interface MagicLinkToken {
    id: string;
    email: string;
    clientId: string;
    expiresAt: FirebaseFirestore.Timestamp;
    used: boolean;
    createdAt: FirebaseFirestore.Timestamp;
}

// Client-side Firebase config (for reference - use in client components)
export const clientFirebaseConfig = {
    apiKey: "AIzaSyC0nEzAZZmVExL_65CwiRwGngRgF4BoK94",
    authDomain: "rensto.firebaseapp.com",
    projectId: "rensto",
    storageBucket: "rensto.firebasestorage.app",
    messagingSenderId: "1001545773174",
    appId: "1:1001545773174:web:c7af4528427957c7b7ef57"
};
