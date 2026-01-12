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
                const serviceAccount = JSON.parse(serviceAccountKey);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
                }
                firebaseApp = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || 'rensto'
                });
            } catch (error: any) {
                console.error('Failed to initialize Firebase Admin:', error);
                throw error;
            }
        } else {
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
    // Existing collections
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
    SERVICE_INSTANCES: 'service_instances',

    // New collections (Jan 2026 - Optimized for SMB Service Businesses)
    USERS: 'users',
    WHATSAPP_INSTANCES: 'whatsapp_instances',
    WHATSAPP_MESSAGES: 'whatsapp_messages',
    APPOINTMENT_BOOKINGS: 'appointment_bookings',
    SUBSCRIPTIONS: 'subscriptions',
    CARE_PLAN_DELIVERABLES: 'care_plan_deliverables',
    LEADS: 'leads',
    BUSINESS_NICHES: 'business_niches',
    RESPONSE_TIME_METRICS: 'response_time_metrics',
    LAUNCH_TASKS: 'launch_tasks',
    OUTREACH_CAMPAIGNS: 'outreach_campaigns',
    VOICE_CALL_LOGS: 'voice_call_logs',
    CONTENT_ITEMS: 'content_items'
} as const;

// Export interfaces from definitions file
export * from '@/types/firestore';
export * from '@/types/entitlements';
