import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE, ADMIN_EMAILS, encryptSession } from '@/lib/auth';
import { emails } from '@/lib/email';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.redirect(new URL('/auth/error?reason=missing_token', request.url));
        }
        const pgToken = await prisma.magicLinkToken.findUnique({ where: { id: token } });

        if (!pgToken) {
            return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
        }

        if (pgToken.used) {
            return NextResponse.redirect(new URL('/auth/error?reason=invalid_token', request.url));
        }

        if (pgToken.expiresAt.getTime() < Date.now()) {
            await prisma.magicLinkToken.delete({ where: { id: token } }).catch(() => {});
            return NextResponse.redirect(new URL('/auth/error?reason=expired_token', request.url));
        }

        await prisma.magicLinkToken.update({ where: { id: token }, data: { used: true } });

        // Check if this is the user's first login (for welcome email)
        const existingUser = await prisma.user.findUnique({
            where: { id: pgToken.clientId },
            select: { lastLoginAt: true, name: true, businessName: true },
        });
        const isFirstLogin = !existingUser?.lastLoginAt;

        await prisma.user.update({
            where: { id: pgToken.clientId },
            data: { lastLoginAt: new Date() },
        }).catch(() => {});

        // Send welcome email on first login (fire-and-forget)
        if (isFirstLogin) {
            const displayName = existingUser?.name || existingUser?.businessName || undefined;
            emails.welcome(pgToken.email, displayName).catch((err) =>
                console.error('[welcome-email] Failed:', err)
            );
        }

        const sessionData = {
            email: pgToken.email,
            clientId: pgToken.clientId,
            authenticatedAt: Date.now(),
        };

        const sessionToken = encryptSession(sessionData);

        const isAdmin = ADMIN_EMAILS.includes(pgToken.email.toLowerCase());
        const isProd = process.env.NODE_ENV === 'production';
        const adminUrl = isProd ? 'https://admin.superseller.agency' : '/admin';
        const destination = isAdmin ? adminUrl : `/dashboard/${pgToken.clientId}`;

        // Set auth cookie and redirect
        const response = NextResponse.redirect(
            destination.startsWith('http') ? destination : new URL(destination, request.url)
        );

        response.cookies.set(AUTH_COOKIE_NAME, sessionToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            maxAge: COOKIE_MAX_AGE,
            path: '/',
            domain: isProd ? '.superseller.agency' : undefined,
        });

        return response;

    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.redirect(new URL('/auth/error?reason=verification_failed', request.url));
    }
}
