import { NextRequest, NextResponse } from 'next/server';
import { UserEntitlements, getDefaultFreeTrialEntitlements } from '@/types/entitlements';
import prisma from '@/lib/prisma';

/**
 * GET /api/dashboard/entitlements?token=xxx
 * Returns user entitlements for dashboard rendering
 *
 * Reads from Postgres (Firestore fully retired Feb 2026).
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

        return NextResponse.json(
            { error: 'Invalid token or user not found' },
            { status: 404 }
        );

    } catch (error) {
        console.error('[Entitlements API] Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch entitlements' },
            { status: 500 }
        );
    }
}
