---
wave: 2
depends_on: [PLAN-A-prisma-models]
files_modified:
  - apps/web/superseller-site/src/app/api/admin/projects/route.ts
autonomous: true
requirements: [R1.4, R1.5, R1.6]
---

# Plan B: Projects API — Replace Fake Synthesis with Real DB

## Objective
Replace the fake `GET /api/admin/projects` (which synthesizes data from `ServiceInstance` + `WhatsAppInstance`) with a real CRUD implementation backed by the `Project` table. Add `POST`, `PATCH`, and `DELETE` handlers to the same route file. Real stats (active/blocked/completed/upcoming counts) are calculated from DB, not hardcoded.

## Tasks

<task id="1">
Completely replace `/Users/shaifriedman/superseller/apps/web/superseller-site/src/app/api/admin/projects/route.ts` with the following implementation:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/auth';

// ── Auth guard ──────────────────────────────────────────────────────────────
async function requireAdmin() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { session };
}

// ── GET /api/admin/projects ─────────────────────────────────────────────────
// Returns all projects + summary stats calculated from DB (R1.5, R1.6)
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const type   = searchParams.get('type')   ?? undefined;
        const status = searchParams.get('status') ?? undefined;

        const [projects, stats] = await Promise.all([
            prisma.project.findMany({
                where: {
                    ...(type   ? { type }   : {}),
                    ...(status ? { status } : {}),
                },
                include: {
                    milestones: { orderBy: { order: 'asc' } },
                    tasks:      { orderBy: { order: 'asc' } },
                },
                orderBy: { updatedAt: 'desc' },
            }),
            // Real counts — R1.6
            prisma.project.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);

        // Shape stats into a simple object
        const statsMap = stats.reduce<Record<string, number>>((acc, row) => {
            acc[row.status] = row._count.status;
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            projects,
            stats: {
                active:    (statsMap['in_progress'] ?? 0) + (statsMap['verification'] ?? 0),
                blocked:   statsMap['blocked']   ?? 0,
                completed: statsMap['completed'] ?? 0,
                upcoming:  statsMap['planning']  ?? 0,
            },
        });
    } catch (error: any) {
        console.error('GET /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ── POST /api/admin/projects ────────────────────────────────────────────────
// Creates a new Project (R1.4)
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const {
            name,
            description,
            type = 'internal',
            status = 'planning',
            progress = 0,
            pillar,
            owner,
            githubRepo,
            vercelProjectId,
            startDate,
            dueDate,
            metadata,
            outlookEventId,
        } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'name is required' }, { status: 400 });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                type,
                status,
                progress,
                pillar,
                owner,
                githubRepo,
                vercelProjectId,
                startDate:      startDate ? new Date(startDate) : undefined,
                dueDate:        dueDate   ? new Date(dueDate)   : undefined,
                metadata,
                outlookEventId,
            },
        });

        return NextResponse.json({ success: true, project }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ── PATCH /api/admin/projects ───────────────────────────────────────────────
// Updates an existing Project by id (R1.4)
export async function PATCH(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        // Coerce date strings to Date objects if present
        if (updates.startDate) updates.startDate = new Date(updates.startDate);
        if (updates.dueDate)   updates.dueDate   = new Date(updates.dueDate);

        const project = await prisma.project.update({
            where: { id },
            data:  updates,
        });

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.error('PATCH /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// ── DELETE /api/admin/projects ──────────────────────────────────────────────
// Deletes a Project by id (R1.4). Cascades to milestones + tasks.
export async function DELETE(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
        }

        await prisma.project.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }
        console.error('DELETE /api/admin/projects failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
```
</task>

<task id="2">
Create the audit routes file at `/Users/shaifriedman/superseller/apps/web/superseller-site/src/app/api/admin/audits/route.ts`:

```typescript
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

// GET /api/admin/audits — list all templates + instances
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const view = searchParams.get('view') ?? 'templates';

    try {
        if (view === 'instances') {
            const instances = await prisma.auditInstance.findMany({
                include: {
                    template: { select: { name: true, version: true } },
                    project:  { select: { name: true, type: true } },
                    _count:   { select: { responses: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            return NextResponse.json({ success: true, instances });
        }

        // Default: list templates with section + item counts
        const templates = await prisma.auditTemplate.findMany({
            include: {
                sections: {
                    include: { _count: { select: { items: true } } },
                    orderBy: { order: 'asc' },
                },
                _count: { select: { instances: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ success: true, templates });
    } catch (error: any) {
        console.error('GET /api/admin/audits failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST /api/admin/audits — create an AuditInstance for a project
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { templateId, projectId, label } = await req.json();

        if (!templateId) {
            return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
        }

        const instance = await prisma.auditInstance.create({
            data: { templateId, projectId, label },
        });

        return NextResponse.json({ success: true, instance }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/audits failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
```
</task>

<task id="3">
Create the audit responses route at `/Users/shaifriedman/superseller/apps/web/superseller-site/src/app/api/admin/audits/[instanceId]/responses/route.ts`:

```typescript
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

type Params = { instanceId: string };

// GET /api/admin/audits/[instanceId]/responses
// Returns full audit with sections, items, and responses in one shot
export async function GET(req: NextRequest, { params }: { params: Params }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { instanceId } = params;

    try {
        const instance = await prisma.auditInstance.findUnique({
            where: { id: instanceId },
            include: {
                template: {
                    include: {
                        sections: {
                            include: {
                                items: { orderBy: { order: 'asc' } },
                            },
                            orderBy: { order: 'asc' },
                        },
                    },
                },
                responses: true,
            },
        });

        if (!instance) {
            return NextResponse.json({ error: 'AuditInstance not found' }, { status: 404 });
        }

        // Build a lookup map for fast response access in the UI
        const responseMap = instance.responses.reduce<Record<string, typeof instance.responses[0]>>(
            (acc, r) => { acc[r.itemId] = r; return acc; },
            {}
        );

        // Compute per-section and overall progress
        let totalItems = 0;
        let completedItems = 0;

        const sectionsWithProgress = instance.template.sections.map(section => {
            const sectionCompleted = section.items.filter(
                item => responseMap[item.id]?.status === 'complete'
            ).length;
            totalItems      += section.items.length;
            completedItems  += sectionCompleted;

            return {
                ...section,
                progress: section.items.length > 0
                    ? Math.round((sectionCompleted / section.items.length) * 100)
                    : 0,
            };
        });

        return NextResponse.json({
            success: true,
            instance: {
                ...instance,
                template: { ...instance.template, sections: sectionsWithProgress },
                responseMap,
                overallProgress: totalItems > 0
                    ? Math.round((completedItems / totalItems) * 100)
                    : 0,
            },
        });
    } catch (error: any) {
        console.error('GET responses failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// PATCH /api/admin/audits/[instanceId]/responses
// Upserts a single response (status + answer + notes)
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { instanceId } = params;

    try {
        const { itemId, status, answer, notes } = await req.json();

        if (!itemId) {
            return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
        }

        const response = await prisma.auditResponse.upsert({
            where:  { instanceId_itemId: { instanceId, itemId } },
            update: { status, answer, notes },
            create: { instanceId, itemId, status, answer, notes },
        });

        return NextResponse.json({ success: true, response });
    } catch (error: any) {
        console.error('PATCH responses failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
```
</task>

## Verification
- [ ] `curl -s -b <admin-session-cookie> https://superseller.agency/api/admin/projects` (or local equivalent) returns `{ success: true, projects: [...], stats: { active, blocked, completed, upcoming } }` with no hardcoded numbers
- [ ] `stats` values come from DB counts (will be 0 if no projects exist yet — that is correct)
- [ ] `POST /api/admin/projects` with `{ name: "Test Project", type: "internal" }` creates a row in the `Project` table
- [ ] `PATCH /api/admin/projects` with `{ id: "<created-id>", status: "in_progress" }` updates the row
- [ ] `DELETE /api/admin/projects?id=<created-id>` removes the row
- [ ] `GET /api/admin/audits` returns `{ success: true, templates: [] }` (empty until Phase 2 seeds data)
- [ ] TypeScript build passes: `cd apps/web/superseller-site && npx tsc --noEmit`

## must_haves
- `GET /api/admin/projects` queries the real `Project` table — zero references to `ServiceInstance` or `WhatsAppInstance`
- All four HTTP verbs (GET, POST, PATCH, DELETE) are implemented and auth-gated
- `stats` object is calculated dynamically from `groupBy` — not hardcoded
- Audit API routes exist and compile cleanly
- Existing admin auth pattern (`verifySession` + `role !== 'admin'`) is preserved on every handler
