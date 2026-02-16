/**
 * Auth utilities — session verification and cookie management.
 * Postgres-only. No Firestore.
 */
import { cookies } from 'next/headers';
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
        const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'service@rensto.com,admin@rensto.com').split(',').map(e => e.trim().toLowerCase());
        const pgUser = await prisma.user.findUnique({ where: { email } });

        if (pgUser) {
            return {
                isValid: true,
                email: pgUser.email,
                clientId: pgUser.id,
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'client',
                entitlements: (pgUser.entitlements as any) || { pillars: [] },
                businessName: pgUser.businessName || pgUser.name || '',
            };
        }

        return { isValid: false };
    } catch (error) {
        console.error('verifySession error:', error);
        return { isValid: false };
    }
}
