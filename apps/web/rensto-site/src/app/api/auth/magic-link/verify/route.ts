import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 1: Firestore kept as fallback
import { getFirestoreAdmin, COLLECTIONS, type MagicLinkToken } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import prisma from '@/lib/prisma';
import { firestoreBackupWrite } from '@/lib/db/migration-helpers';
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/auth/error?reason=missing_token', request.url));
        }

        // [MIGRATION] Phase 1: Read token from Postgres first
        let tokenData: {
            id: string;
            email: string;
            clientId: string;
            used: boolean;
            expiresAt: Date;
            redirectTo?: string;
            role?: string;
        } | null = null;
        let tokenSource: 'postgres' | 'firestore' = 'postgres';

        const pgToken = await prisma.magicLinkToken.findUnique({ where: { id: token } });

        if (pgToken) {
            tokenData = {
                id: pgToken.id,
                email: pgToken.email,
                clientId: pgToken.clientId,
                used: pgToken.used,
                expiresAt: pgToken.expiresAt,
            };
        } else {
            // Fallback: Firestore
            tokenSource = 'firestore';
            const db = getFirestoreAdmin();
            const tokenRef = db.collection(COLLECTIONS.MAGIC_LINK_TOKENS).doc(token);
            const tokenDoc = await tokenRef.get();

            if (!tokenDoc.exists) {
                return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
            }

            const fsData = tokenDoc.data() as MagicLinkToken & { redirectTo?: string; role?: string };
            tokenData = {
                id: token,
                email: fsData.email,
                clientId: fsData.clientId,
                used: fsData.used,
                expiresAt: new Date(fsData.expiresAt.toMillis()),
                redirectTo: fsData.redirectTo,
                role: fsData.role,
            };
            console.info('[Migration] Token read from Firestore fallback');
        }

        // Check if token was already used
        if (tokenData.used) {
            return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
        }

        // Check expiration
        if (tokenData.expiresAt.getTime() < Date.now()) {
            // Delete expired token from both stores
            await prisma.magicLinkToken.delete({ where: { id: token } }).catch(() => {});
            await firestoreBackupWrite('magic-link/verify-delete-expired', async () => {
                const db = getFirestoreAdmin();
                await db.collection(COLLECTIONS.MAGIC_LINK_TOKENS).doc(token).delete();
            });
            return NextResponse.redirect(new URL('/auth/error?reason=expired_token', request.url));
        }

        // Token is valid — mark as used in Postgres (primary)
        await prisma.magicLinkToken.update({ where: { id: token }, data: { used: true } });

        // Mark as used in Firestore (backup)
        await firestoreBackupWrite('magic-link/verify-mark-used', async () => {
            const db = getFirestoreAdmin();
            await db.collection(COLLECTIONS.MAGIC_LINK_TOKENS).doc(token).update({ used: true });
        });

        // Update client's last login in Postgres
        if (tokenData.clientId !== 'admin') {
            await prisma.user.update({
                where: { id: tokenData.clientId },
                data: { lastLoginAt: new Date() },
            }).catch(() => {});

            // Backup: Firestore
            await firestoreBackupWrite('magic-link/verify-lastlogin', async () => {
                const db = getFirestoreAdmin();
                await db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(tokenData!.clientId).update({
                    lastLogin: Timestamp.now(),
                    updatedAt: Timestamp.now()
                }).catch(() => {});
            });
        }

        // Create session data
        const sessionData = {
            email: tokenData.email,
            clientId: tokenData.clientId,
            authenticatedAt: Date.now()
        };

        // Encode session data
        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

        // Determine Redirect URL
        let destination = `/dashboard/${tokenData.clientId}`;

        if (tokenData.redirectTo) {
            destination = tokenData.redirectTo;
        } else if (tokenData.clientId === 'admin') {
            destination = '/admin';
        }

        // Set auth cookie and redirect to dashboard
        const response = NextResponse.redirect(
            new URL(destination, request.url)
        );

        response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.redirect(new URL('/auth/error?reason=verification_failed', request.url));
    }
}
