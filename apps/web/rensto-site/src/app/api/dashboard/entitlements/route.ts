import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-client';
import { doc, getDoc } from 'firebase/firestore';
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

        // Look up user by dashboard token
        // In production, you'd query by token index or use a separate tokens collection
        const userRef = doc(db, 'users', token);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            return NextResponse.json(
                { error: 'Invalid token or user not found' },
                { status: 404 }
            );
        }

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
