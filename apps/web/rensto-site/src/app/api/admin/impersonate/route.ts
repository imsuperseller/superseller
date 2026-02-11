import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
// [MIGRATION] Phase 1: Firestore kept as fallback
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import prisma from '@/lib/prisma';

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

        // [MIGRATION] Phase 1: Read from Postgres first
        let userData: { email: string; name: string | null; dashboardToken: string | null } | null = null;

        const pgUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true, dashboardToken: true },
        });

        if (pgUser) {
            userData = pgUser;
        } else {
            // Fallback: Firestore
            console.info('[Migration] admin/impersonate: Postgres miss, falling back to Firestore');
            const db = getFirestoreAdmin();
            const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
            const userSnap = await userRef.get();
            if (userSnap.exists) {
                const d = userSnap.data()!;
                userData = { email: d.email, name: d.name || null, dashboardToken: d.dashboardToken || null };
            }
        }

        if (!userData) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!userData.dashboardToken) {
            return NextResponse.json(
                { error: 'User has no dashboard access configured' },
                { status: 400 }
            );
        }

        // Return impersonation URL
        const impersonationUrl = `/dashboard/${userId}?token=${userData.dashboardToken}&impersonating=true`;

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
