import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirestoreAdmin, COLLECTIONS, type MagicLinkToken, type CustomSolutionsClient } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Cookie name for auth session
const AUTH_COOKIE_NAME = 'rensto_client_session';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/auth/error?reason=missing_token', request.url));
        }

        const db = getFirestoreAdmin();
        const tokenRef = db.collection(COLLECTIONS.MAGIC_LINK_TOKENS).doc(token);
        const tokenDoc = await tokenRef.get();

        if (!tokenDoc.exists) {
            return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
        }

        const tokenData = tokenDoc.data() as MagicLinkToken & { redirectTo?: string; role?: string };

        // Check if token was already used
        if (tokenData.used) {
            return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
        }

        // Check expiration
        if (tokenData.expiresAt.toMillis() < Date.now()) {
            // Delete expired token
            await tokenRef.delete();
            return NextResponse.redirect(new URL('/auth/error?reason=expired_token', request.url));
        }

        // Token is valid - mark as used
        await tokenRef.update({ used: true });

        // Update client's last login
        if (tokenData.clientId !== 'admin') {
            try {
                const clientRef = db.collection(COLLECTIONS.CUSTOM_SOLUTIONS_CLIENTS).doc(tokenData.clientId);
                await clientRef.update({
                    lastLogin: Timestamp.now(),
                    updatedAt: Timestamp.now()
                });
            } catch (clientError) {
                console.log('Client update skipped (may not exist yet):', clientError);
            }
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

// Helper function to verify session (for use in middleware or server components)
export async function verifySession(): Promise<{
    isValid: boolean;
    email?: string;
    clientId?: string
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

        return {
            isValid: true,
            email: sessionData.email,
            clientId: sessionData.clientId
        };
    } catch {
        return { isValid: false };
    }
}

// Export for use in other files
export { AUTH_COOKIE_NAME };
