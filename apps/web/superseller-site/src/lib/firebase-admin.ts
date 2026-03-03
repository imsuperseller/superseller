/**
 * Firebase Admin — Storage ONLY. Firestore removed (Feb 2026).
 * Use Postgres for all data. getStorageAdmin kept for onboarding secrets migration.
 */
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';

let firebaseApp: App | null = null;

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
                    projectId: serviceAccount.project_id || 'superseller'
                });
            } catch (error: any) {
                console.error('Failed to initialize Firebase Admin:', error);
                throw error;
            }
        } else {
            firebaseApp = initializeApp({
                projectId: 'superseller'
            });
        }
    } else {
        firebaseApp = getApps()[0];
    }

    return firebaseApp;
}

// DEPRECATED - Firestore removed Feb 2026. Use Postgres. Throws if called.
export function getFirestoreAdmin(): never {
    throw new Error('Firestore removed. Use Postgres. See FIRESTORE_REMOVAL.md');
}
export const COLLECTIONS = {} as Record<string, string>;

// Legacy type re-exports removed — import from @/types/legacy-types or @/types/entitlements directly
