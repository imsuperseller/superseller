import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tenantId } = await params;

    try {
        const versions: any[] = await prisma.$queryRaw`
            SELECT
                cb.id,
                cb."tenantId",
                cb.name,
                cb."visualStyle",
                cb."soraHandle",
                cb."personaDescription",
                cb.version,
                cb."changeDelta",
                cb."createdAt",
                cr.intent,
                cr.scope,
                cr.scene_number,
                cr.estimated_cost_cents,
                cr.status AS cr_status,
                cr.change_summary
            FROM "CharacterBible" cb
            LEFT JOIN change_requests cr ON cr.character_bible_version_id = cb.id
            WHERE cb."tenantId" = ${tenantId}::uuid
            ORDER BY cb.version DESC
        `;

        return NextResponse.json({ versions });
    } catch (error) {
        console.error('Error fetching character versions:', error);
        return NextResponse.json({ error: 'Failed to fetch character versions' }, { status: 500 });
    }
}
