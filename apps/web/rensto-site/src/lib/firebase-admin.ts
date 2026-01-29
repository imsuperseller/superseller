// Shared Firebase configuration for server-side usage
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

let firebaseApp: App | null = null;
let firestoreDb: Firestore | null = null;

export function getStorageAdmin() {
    getFirebaseAdmin();
    return getStorage();
}

export function getFirebaseAdmin(): App {
    if (firebaseApp) return firebaseApp;

    if (getApps().length === 0) {
        // Check for service account credentials
        let serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

        if (serviceAccountKey) {
            try {
                let serviceAccount: any;

                // If it looks like a path (starts with . or /), try reading the file
                if (serviceAccountKey.startsWith('./') || serviceAccountKey.startsWith('../') || serviceAccountKey.startsWith('/')) {
                    const absolutePath = path.isAbsolute(serviceAccountKey)
                        ? serviceAccountKey
                        : path.join(process.cwd(), serviceAccountKey);

                    if (fs.existsSync(absolutePath)) {
                        const fileContent = fs.readFileSync(absolutePath, 'utf8');
                        serviceAccount = JSON.parse(fileContent);
                    } else {
                        console.error(`Firebase service account file not found at: ${absolutePath}`);
                        serviceAccount = JSON.parse(serviceAccountKey); // Fallback to parse it as JSON
                    }
                } else {
                    serviceAccount = JSON.parse(serviceAccountKey);
                }

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
    try {
        firestoreDb.settings({ ignoreUndefinedProperties: true });
    } catch (e) {
        // Ignore if already initialized
        console.warn('Firestore settings already initialized');
    }
    return firestoreDb;
}

// Collection names
export const COLLECTIONS = {
    // [DEPRECATED] Legacy collections - Use USERS for primary client data
    CUSTOM_SOLUTIONS_CLIENTS: 'customSolutionsClients',
    CLIENTS: 'clients',

    MAGIC_LINK_TOKENS: 'magicLinkTokens',
    TEMPLATES: 'templates',
    DOWNLOADS: 'downloads',
    AUDITS: 'audits',
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
    CONTENT_ITEMS: 'content_posts',
    SECRETARY_CONFIGS: 'secretary_configs',
    MARKETPLACE_TEMPLATES: 'templates' // Alias for clarity in video workflow
} as const;

// Export interfaces from definitions file
export * from '@/types/firestore';
export * from '@/types/entitlements';
