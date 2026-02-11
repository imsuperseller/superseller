import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/firestore/setup-collections
 *
 * [MIGRATION] Phase 4: DEPRECATED — Firestore collection setup is no longer needed.
 * PostgreSQL is now the primary database. This endpoint returns a deprecation notice.
 * Remove this file entirely in Phase 7 (cleanup).
 */
export async function POST(request: NextRequest) {
    return NextResponse.json({
        success: false,
        deprecated: true,
        message: 'This endpoint is deprecated. PostgreSQL is now the primary database. Use `npx prisma db push` and `npx prisma db seed` for database setup.',
        migration: 'Firestore → PostgreSQL migration in progress (Phase 4 complete).',
    }, { status: 410 }); // 410 Gone
}
