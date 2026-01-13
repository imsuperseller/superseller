import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/app/api/auth/magic-link/verify/route';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        // 1. Verify Admin Session (Real Security)
        const session = await verifySession();
        if (!session.isValid || session.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized - admin access required' },
                { status: 403 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'Missing userId parameter' },
                { status: 400 }
            );
        }

        const db = getFirestoreAdmin();

        // 2. Get client's dashboard token using unified collections
        const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
        const userSnap = await userRef.get();

        let userData = userSnap.exists ? userSnap.data() : null;

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

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
