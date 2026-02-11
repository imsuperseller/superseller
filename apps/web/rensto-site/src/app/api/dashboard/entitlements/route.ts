import { NextRequest, NextResponse } from 'next/server';
// [MIGRATION] Phase 1: Firestore kept as fallback
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { UserEntitlements, getDefaultFreeTrialEntitlements } from '@/types/entitlements';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard/entitlements?token=xxx
 * Returns user entitlements for dashboard rendering
 *
 * [MIGRATION] Phase 1: Reads from Postgres first, Firestore fallback.
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { error: 'Missing dashboard token' },
                { status: 401 }
            );
        }

        // [MIGRATION] Phase 1: Look up user by dashboardToken in Postgres
        const pgUser = await prisma.user.findUnique({
            where: { dashboardToken: token },
        });

        if (pgUser) {
            const entitlements: UserEntitlements =
                (pgUser.entitlements as unknown as UserEntitlements) || getDefaultFreeTrialEntitlements();

            return NextResponse.json({
                success: true,
                email: pgUser.email,
                name: pgUser.name || null,
                entitlements,
            });
        }

        // Fallback: Firestore
        console.info('[Migration] dashboard/entitlements: Postgres miss, falling back to Firestore');
        const dbAdmin = getFirestoreAdmin();
        const usersRef = dbAdmin.collection(COLLECTIONS.USERS);
        const querySnap = await usersRef.where('dashboardToken', '==', token).limit(1).get();

        if (querySnap.empty) {
            return NextResponse.json(
                { error: 'Invalid token or user not found' },
                { status: 404 }
            );
        }

        const userSnap = querySnap.docs[0];
        const userData = userSnap.data();

        const entitlements: UserEntitlements = userData.entitlements || getDefaultFreeTrialEntitlements();

        return NextResponse.json({
            success: true,
            email: userData.email,
            name: userData.name || null,
            entitlements,
        });

    } catch (error) {
        console.error('[Entitlements API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entitlements' },
            { status: 500 }
        );
    }
}
