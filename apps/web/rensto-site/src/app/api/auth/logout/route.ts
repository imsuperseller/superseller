import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Delete the auth cookie (domain must match what was set)
    const isProd = process.env.NODE_ENV === 'production';
    response.cookies.set(AUTH_COOKIE_NAME, '', {
        maxAge: 0,
        path: '/',
        domain: isProd ? '.rensto.com' : undefined,
    });

    return response;
}
