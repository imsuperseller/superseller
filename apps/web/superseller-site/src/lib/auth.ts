/**
 * Auth utilities — session verification and cookie management.
 * Postgres-only. No Firestore.
 * Sessions encrypted with AES-256-GCM when SESSION_SECRET is set.
 */
import crypto from 'crypto';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export const AUTH_COOKIE_NAME = 'superseller_client_session';
export const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/** Centralized admin emails list. Import this instead of duplicating the fallback. */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'shai@superseller.agency,shai@superseller.agency').split(',').map(e => e.trim().toLowerCase());

// --- Session encryption helpers ---
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getSessionKey(): Buffer | null {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;
    return crypto.createHash('sha256').update(secret).digest();
}

/** Encrypt session JSON. Returns hex(iv + tag + ciphertext) when SESSION_SECRET is set, base64 otherwise. */
export function encryptSession(data: object): string {
    const key = getSessionKey();
    const json = JSON.stringify(data);
    if (!key) {
        // Fallback: base64 (backwards-compat until SESSION_SECRET is configured)
        return Buffer.from(json).toString('base64');
    }
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('hex');
}

/** Decrypt a session token. Handles both encrypted (hex) and legacy base64 formats. */
export function decryptSession(token: string): Record<string, any> | null {
    try {
        const key = getSessionKey();
        // Try encrypted format first (hex string, min length = (iv+tag)*2 = 56 hex chars)
        if (key && /^[0-9a-f]+$/i.test(token) && token.length > 56) {
            const buf = Buffer.from(token, 'hex');
            const iv = buf.subarray(0, IV_LENGTH);
            const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
            const ciphertext = buf.subarray(IV_LENGTH + TAG_LENGTH);
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(tag);
            const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
            return JSON.parse(decrypted.toString('utf8'));
        }
        // Fallback: legacy base64
        return JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    } catch {
        return null;
    }
}

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

        const sessionData = decryptSession(sessionCookie.value);
        if (!sessionData?.email || !sessionData?.authenticatedAt) {
            return { isValid: false };
        }

        // Check if session is still valid (30 days)
        const sessionAge = Date.now() - sessionData.authenticatedAt;
        if (sessionAge > COOKIE_MAX_AGE * 1000) {
            return { isValid: false };
        }

        const email = sessionData.email.toLowerCase();
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
