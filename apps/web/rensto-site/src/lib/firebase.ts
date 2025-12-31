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

export interface UsageLog {
    id: string;
    clientId: string;
    agentId: string; // matches ServiceManifest.id
    timestamp: any; // Firestore Timestamp
    model: string; // "gpt-4-turbo"
    tokens: {
        input: number;
        output: number;
        total: number;
    };
    cost: number; // in cents, calculated by n8n or generic calculator
    metadata?: Record<string, any>; // workflow execution ID, etc.
}

export interface ServiceManifest {
    id: string; // "review-responder"
    name: string; // "Review Responder Agent"
    slug: string; // URL friendly slug
    description: string;
    type: "n8n_workflow" | "code_function";
    active: boolean;
    pricing: {
        subscription: number; // In cents
        setup: number; // In cents
    };
    n8n: {
        webhookId: string; // "review-responder-prod"
        inputs: Array<{ name: string; type: "text" | "number" | "email" }>;
    };
    stripe: {
        productId: string;
        priceId: string; // Subscription price ID
        setupPriceId?: string; // One-time setup fee price ID
    };
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any; // Firestore Timestamp
}

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
    createdAt: any;
    updatedAt: any;
    lastLogin?: any;
}

export interface MagicLinkToken {
    id: string;
    email: string;
    clientId: string;
    expiresAt: any;
    used: boolean;
    createdAt: any;
}

export interface Template {
    id: string;
    workflowId: string;
    name: string;
    description: string;
    category: string;
    price: number;
    installPrice: number;
    customPrice: number;
    features: string[];
    installation: boolean;
    popular: boolean;
    version: string;
    fileSize: number;
    content?: string;
    readinessStatus: 'Draft' | 'Active' | 'Internal';
    createdAt: any;
    updatedAt: any;
}

export interface DownloadEvent {
    id: string;
    templateId: string;
    userEmail: string;
    paymentIntentId: string;
    timestamp: any;
    status: string;
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
