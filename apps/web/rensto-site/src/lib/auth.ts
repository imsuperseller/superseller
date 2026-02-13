/**
 * Auth utilities — session verification and cookie management.
 *
 * Moved from api/auth/magic-link/verify/route.ts to avoid
 * exporting non-handler functions from Next.js route files.
 *
 * [MIGRATION] Phase 1: Reads from Postgres with Firestore fallback.
 */
import { cookies } from 'next/headers';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

export const AUTH_COOKIE_NAME = 'rensto_client_session';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Verify the current session from the auth cookie.
 * Returns user identity, role, and entitlements.
 */
export async function verifySession(): Promise<{
    isValid: boolean;
    email?: string;
    clientId?: string;
    role?: 'admin' | 'client';
    entitlements?: any;
    businessName?: string;
}> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME);

        if (!sessionCookie?.value) {
            return { isValid: false };
        }

        const sessionData = JSON.parse(
            Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
        );

        // Check if session is still valid (30 days)
        const sessionAge = Date.now() - sessionData.authenticatedAt;
        if (sessionAge > COOKIE_MAX_AGE * 1000) {
            return { isValid: false };
        }

        const email = sessionData.email.toLowerCase();
        const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@rensto.com').split(',');
        const pgUser = await prisma.user.findUnique({ where: { email } });

        if (pgUser) {
            return {
                isValid: true,
                email: pgUser.email,
                clientId: sessionData.clientId,
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'client',
                entitlements: (pgUser.entitlements as any) || { pillars: [] },
                businessName: pgUser.businessName || pgUser.name || '',
            };
        }

        // Fallback: Firestore
        console.info('[Migration] verifySession: Postgres miss, falling back to Firestore');
        const db = getFirestoreAdmin();
        const userId = email.replace(/[^a-z0-9]/g, '_');
        const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
        const userSnap = await userRef.get();
        const userData = userSnap.exists ? userSnap.data() : null;

        const csRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS);
        const csSnap = await csRef.where('email', '==', email.toLowerCase()).limit(1).get();
        const csData = !csSnap.empty ? csSnap.docs[0].data() : null;

        return {
            isValid: true,
            email: sessionData.email,
            clientId: sessionData.clientId,
            role: ADMIN_EMAILS.includes(email) ? 'admin' : 'client',
            entitlements: userData?.entitlements || csData?.entitlements || { pillars: [] },
            businessName: userData?.businessName || csData?.name || ''
        };
    } catch (error) {
        console.error('verifySession error:', error);
        return { isValid: false };
    }
}
