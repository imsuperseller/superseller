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
            try {
                // Diagnostic: Check for common corruption patterns
                const sample = serviceAccountKey.substring(0, 50).replace(/\"/g, "'");
                const hasRawNewlines = /\n/.test(serviceAccountKey);
                const hasDoubleEscapes = /\\\\/.test(serviceAccountKey);

                const serviceAccount = JSON.parse(serviceAccountKey);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
                }
                firebaseApp = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || 'rensto'
                });
            } catch (error: any) {
                const sample = serviceAccountKey ? serviceAccountKey.substring(0, 50).replace(/\"/g, "'") : 'is-null';
                throw new Error(`Firebase Init Failed: ${error.message}. Len: ${serviceAccountKey?.length}. Sample: ${sample}`);
            }
        } else {
            throw new Error('Firebase Init Failed: FIREBASE_SERVICE_ACCOUNT_KEY is missing');
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
    DOWNLOADS: 'downloads',
    AUDITS: 'audits',
    CLIENTS: 'clients',
    ANALYTICS: 'analytics',
    SCORECARDS: 'scorecards',
    CONSULTATIONS: 'consultations',
    PROPOSALS: 'proposals',
    PURCHASES: 'purchases',
    PAYMENTS: 'payments',
    REQUIREMENTS: 'requirements',
    OPTIMIZER_AUDITS: 'optimizer_audits',
    TESTIMONIALS: 'testimonials',
    SERVICE_MANIFESTS: 'service_manifests',
    USAGE_LOGS: 'usage_logs',
    CUSTOMIZATION_REQUESTS: 'customizationRequests',
    SUPPORT_CASES: 'supportCases',
    SERVICE_INSTANCES: 'service_instances'
} as const;

// Export interfaces from definitions file
export * from '@/types/firestore';
