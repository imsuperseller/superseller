import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

async function requireAdmin() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { session };
}

// GET /api/admin/ci — list recent CI runs with optional filters
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if ('error' in auth && auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const repo = searchParams.get('repo') ?? undefined;
        const status = searchParams.get('status') ?? undefined;
        const projectId = searchParams.get('projectId') ?? undefined;
        const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

        const [runs, stats] = await Promise.all([
            prisma.ciRun.findMany({
                where: {
                    ...(repo ? { repo } : {}),
                    ...(status ? { status } : {}),
                    ...(projectId ? { projectId } : {}),
                },
                include: {
                    project: { select: { name: true, type: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
            }),
            prisma.ciRun.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);

        const statsMap = stats.reduce<Record<string, number>>((acc, row) => {
            acc[row.status] = row._count.status;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            runs,
            stats: {
                passed: statsMap['passed'] ?? 0,
                failed: statsMap['failed'] ?? 0,
                running: statsMap['running'] ?? 0,
                total: Object.values(statsMap).reduce((a, b) => a + b, 0),
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/ci failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/ci — create or update a CI run (called by GitHub Actions)
export async function POST(req: NextRequest) {
    // Auth: either admin session OR CI secret token
    const authHeader = req.headers.get('authorization');
    const ciSecret = process.env.CI_WEBHOOK_SECRET;

    if (authHeader === `Bearer ${ciSecret}` && ciSecret) {
        // CI webhook auth — valid
    } else {
        const auth = await requireAdmin();
        if ('error' in auth && auth.error) return auth.error;
    }

    try {
        const body = await req.json();
        const {
            id, repo, branch, commitSha, commitMsg, status,
            duration, typeCheck, lint, build, testCount, failCount,
            errorLog, workflowUrl, triggeredBy, projectId,
        } = body;

        if (!repo || !commitSha) {
            return NextResponse.json({ error: 'repo and commitSha are required' }, { status: 400 });
        }

        // If id provided, upsert (update existing run). Otherwise create.
        if (id) {
            const run = await prisma.ciRun.update({
                where: { id },
                data: {
                    status, duration, typeCheck, lint, build,
                    testCount, failCount, errorLog, workflowUrl,
                },
            });
            return NextResponse.json({ success: true, run });
        }

        // Auto-match project by repo
        let resolvedProjectId = projectId;
        if (!resolvedProjectId) {
            const project = await prisma.project.findFirst({
                where: { githubRepo: repo },
                select: { id: true },
            });
            if (project) resolvedProjectId = project.id;
        }

        const run = await prisma.ciRun.create({
            data: {
                repo, branch: branch ?? 'main', commitSha, commitMsg,
                status: status ?? 'running', duration, typeCheck, lint, build,
                testCount, failCount, errorLog, workflowUrl, triggeredBy,
                projectId: resolvedProjectId,
            },
        });

        return NextResponse.json({ success: true, run }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/ci failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
