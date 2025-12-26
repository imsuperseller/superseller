import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/app/api/auth/magic-link/verify/route';

export async function POST(request: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Delete the auth cookie
    response.cookies.delete(AUTH_COOKIE_NAME);

    return response;
}
