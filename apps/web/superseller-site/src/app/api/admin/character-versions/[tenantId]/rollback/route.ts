import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') return null;
    return session;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ tenantId: string }> }
) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { tenantId } = await params;

    let body: { targetVersion?: number };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { targetVersion } = body;
    if (!targetVersion || !Number.isInteger(targetVersion) || targetVersion < 1) {
        return NextResponse.json({ error: 'targetVersion must be a positive integer' }, { status: 400 });
    }

    try {
        // Fetch the target version row
        const targets: any[] = await prisma.$queryRaw`
            SELECT * FROM "CharacterBible"
            WHERE "tenantId" = ${tenantId}::uuid AND version = ${targetVersion}
            LIMIT 1
        `;

        if (!targets.length) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        const target = targets[0];

        // Get current max version for reference in changeDelta
        const maxResult: any[] = await prisma.$queryRaw`
            SELECT COALESCE(MAX(version), 0) AS max_version
            FROM "CharacterBible"
            WHERE "tenantId" = ${tenantId}::uuid
        `;
        const currentVersion = Number(maxResult[0]?.max_version ?? 0);

        const changeDelta = JSON.stringify({
            rollback: {
                fromVersion: currentVersion,
                toVersion: targetVersion,
                rolledBackBy: 'admin',
            },
        });

        // Insert new row with atomic version increment
        const inserted: any[] = await prisma.$queryRaw`
            INSERT INTO "CharacterBible" (
                id,
                "tenantId",
                name,
                "personaDescription",
                "visualStyle",
                "soraHandle",
                metadata,
                version,
                "changeDelta",
                "createdAt",
                "updatedAt"
            )
            VALUES (
                gen_random_uuid()::text,
                ${tenantId}::uuid,
                ${target.name},
                ${target.personaDescription ?? null},
                ${target.visualStyle ?? null},
                ${target.soraHandle ?? null},
                ${target.metadata ? JSON.stringify(target.metadata) : null}::jsonb,
                (SELECT COALESCE(MAX(version), 0) + 1 FROM "CharacterBible" WHERE "tenantId" = ${tenantId}::uuid),
                ${changeDelta}::jsonb,
                NOW(),
                NOW()
            )
            RETURNING id, version
        `;

        const newVersion = inserted[0];
        return NextResponse.json({ success: true, newVersion: { id: newVersion.id, version: Number(newVersion.version) } });
    } catch (error) {
        console.error('Error rolling back character version:', error);
        return NextResponse.json({ error: 'Failed to rollback character version' }, { status: 500 });
    }
}
