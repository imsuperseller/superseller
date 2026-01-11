import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';

/**
 * GET /api/admin/impersonate?userId=xxx
 * Returns a dashboard URL that admin can use to view as client
 * 
 * Security: Only allowed for admin users (hardcoded allowlist for now)
 */

const ADMIN_EMAILS = [
    'shai@rensto.com',
    'admin@rensto.com',
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const adminEmail = searchParams.get('adminEmail'); // In production, get from session

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId parameter' },
                { status: 400 }
            );
        }

        // Verify admin (in production, use proper session/auth)
        if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
            return NextResponse.json(
                { error: 'Unauthorized - admin access required' },
                { status: 403 }
            );
        }

        // Get client's dashboard token
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userData = userSnap.data();
        const dashboardToken = userData.dashboardToken;

        if (!dashboardToken) {
            return NextResponse.json(
                { error: 'User has no dashboard access configured' },
                { status: 400 }
            );
        }

        // Return impersonation URL
        const impersonationUrl = `/dashboard/${userId}?token=${dashboardToken}&impersonating=true`;

        return NextResponse.json({
            success: true,
            impersonationUrl,
            clientEmail: userData.email,
            clientName: userData.name || 'Unknown',
            message: 'Opening as client view - actions are logged'
        });

    } catch (error) {
        console.error('[Admin Impersonate] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate impersonation link' },
            { status: 500 }
        );
    }
}
