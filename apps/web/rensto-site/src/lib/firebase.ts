// Shared Firebase configuration for server-side usage
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { auditAgent } from './agents/ServiceAuditAgent';

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
                // Ensure private key handles newlines correctly
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
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
    SUPPORT_CASES: 'supportCases'
} as const;

// Export interfaces from definitions file
export * from '@/types/firestore';
