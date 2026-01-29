import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, COLLECTIONS } from '@/lib/firebase-admin';
import { UserEntitlements, getDefaultFreeTrialEntitlements } from '@/types/entitlements';

/**
 * GET /api/dashboard/entitlements?token=xxx
 * Returns user entitlements for dashboard rendering
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

        // Look up user by secure dashboard token
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

        // Return entitlements (with defaults if not set)
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
