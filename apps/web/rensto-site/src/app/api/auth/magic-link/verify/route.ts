import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'admin@rensto.com').split(',').map(e => e.trim().toLowerCase());

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

        await prisma.user.update({
            where: { id: pgToken.clientId },
            data: { lastLoginAt: new Date() },
        }).catch(() => {});

        const sessionData = {
            email: pgToken.email,
            clientId: pgToken.clientId,
            authenticatedAt: Date.now(),
        };

        const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

        const isAdmin = ADMIN_EMAILS.includes(pgToken.email.toLowerCase());
        const destination = isAdmin ? '/admin' : `/dashboard/${pgToken.clientId}`;

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
