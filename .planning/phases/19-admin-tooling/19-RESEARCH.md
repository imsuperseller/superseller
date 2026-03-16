# Phase 19: Admin Tooling - Research

**Researched:** 2026-03-16
**Domain:** Next.js admin portal (React tabs + API routes), PostgreSQL raw-SQL queries, append-only versioned data reads, confirmation modals
**Confidence:** HIGH

## Summary

Phase 19 adds three views to the existing admin portal at `admin.superseller.agency`: a change-request audit log (ADMIN-01), a CharacterBible version timeline with rollback (ADMIN-02, ADMIN-03). All data already exists — `CharacterBible` rows are fully versioned in Postgres, and `change_requests` rows record every intake event with intent, scope, cost, and status. The only work is building the read layer (API routes) and the write layer (rollback insert), then wiring them to new admin tab components.

The admin portal is a single client component (`AdminDashboardClient.tsx`) that switches content via `activeTab` state. Adding new functionality means: (1) adding a nav item to the inline array, (2) adding an `activeTab === 'character-history'` branch in JSX, (3) creating the backing React component, and (4) creating the API routes it calls. The pattern is well-established and consistent across 20+ existing tabs.

The critical integration detail is that `change_requests` is a worker-side raw-SQL table, not in the Prisma schema. The web app must query it via `prisma.$queryRaw` — the same pattern already used by `financials/route.ts`, `customers/route.ts`, and others. `CharacterBible` IS in the Prisma schema and supports typed `prisma.characterBible.findMany()`. Rollback is purely an append-only INSERT — no UPDATE or DELETE — matching the established versioning pattern from Phase 16.

**Primary recommendation:** One new admin tab ("Character History") containing two sub-views toggled by inner state — the change-request audit log and the CharacterBible version timeline. Three new API routes back it. All under 200 lines each.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Version Timeline UI (ADMIN-02)**
- New admin portal tab or section within existing customer detail view
- Vertical timeline layout: most recent version at top, each entry shows:
  - Version number + date
  - changeDelta diff (old→new for each changed field)
  - Cost of that specific change in dollars (from associated change_request.estimated_cost_cents)
  - Status badge (active, rolled-back, etc.)
- Per-tenant view: admin selects a tenant, sees their CharacterBible version history
- Empty state: "No character changes recorded for this customer"

**Rollback Mechanism (ADMIN-02)**
- Rollback = INSERT a new version row that copies the target version's field values (consistent with append-only pattern — never UPDATE or DELETE)
- changeDelta for rollback row: `{ rollback: { fromVersion: N, toVersion: M, rolledBackBy: "admin" } }`
- One-click "Rollback" button per version → confirmation modal: "Roll back to version N? This creates a new version with those settings."
- Rollback does NOT regenerate scenes — it restores the CharacterBible so FUTURE generations use the old settings
- After rollback, admin can optionally trigger a full regen from the admin portal (deferred to future)

**Audit Log Display (ADMIN-01)**
- Table view of all change_requests for a tenant
- Columns: date, intent classification, change summary, scene(s) triggered, status, cost (cents)
- Filterable by tenant (required), optionally by status or intent
- Sortable by date (default: newest first)
- Shows all statuses including pending-admin-approval, admin-denied, failed
- Total cost row at bottom: sum of all completed change requests for tenant

**API Routes**
- `GET /api/admin/character-versions/[tenantId]` — Returns all CharacterBible versions for a tenant, ordered by version DESC, with associated change_request data (cost, intent, status)
- `POST /api/admin/character-versions/[tenantId]/rollback` — Body: `{ targetVersion: number }`. Creates new version row with target's fields. Returns new version.
- `GET /api/admin/change-requests/[tenantId]` — Returns all change_requests for tenant with intent, scope, scenes, status, cost. Supports `?status=` filter.
- All routes use existing admin auth (verifySession + CRON_SECRET Bearer fallback)

### Claude's Discretion
- Exact React component structure within admin portal
- Whether to create a new tab or add to existing customer detail view
- Timeline visual styling (cards vs list vs accordion)
- Pagination strategy for long version histories
- Whether to join change_requests to CharacterBible versions in a single query or separate

### Deferred Ideas (OUT OF SCOPE)
- Admin-triggered regen from portal (trigger full character regen without WhatsApp flow)
- Bulk rollback across multiple tenants
- Export change request audit log as CSV
- Cost dashboard with per-provider breakdown (mentioned in Phase 15 deferred)
- Customer-facing version history view (web portal, not WhatsApp)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ADMIN-01 | Every change request logged with intent classification, scope, scenes triggered, and cost | `change_requests` table already has all columns: `intent`, `scope`, `scene_number`, `change_summary`, `estimated_cost_cents`, `status`. API route + table component reads it via `prisma.$queryRaw`. |
| ADMIN-02 | CharacterBible version history viewable in admin portal | `CharacterBible` table is append-only with `version`, `changeDelta`, `createdAt`. Prisma model exists. New tab in `AdminDashboardClient.tsx` with timeline component and tenant selector. |
| ADMIN-03 | Admin can rollback CharacterBible to previous version | Rollback = `prisma.characterBible.create()` copying target row fields + rollback changeDelta. POST endpoint at `/api/admin/character-versions/[tenantId]/rollback`. One-click with confirmation modal. |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 14+ | API routes + React Server/Client Components | Established in project |
| Prisma Client | Current project version | CharacterBible queries (typed) | In web app, direct access to CharacterBible model |
| `prisma.$queryRaw` | — | `change_requests` raw-SQL queries | Established pattern for worker-side tables not in Prisma schema |
| React `useState` | — | Tab state, modal state, tenant selection | Established in all admin components |
| `verifySession()` | `/lib/auth` | Admin auth | Consistent across all existing admin routes |
| Lucide React | Current | Icons (History, RotateCcw, Table2, Clock) | Established in all admin components |
| Badge, Button from `/components/ui/` | — | Status badges, action buttons | Established admin UI primitives |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `card-enhanced` | — | Card layout wrapper | Used by all admin tab components |
| `badge-enhanced` | — | Status color coding | Used by CustomerManagement, AuditManagement, etc. |
| `button-enhanced` | — | Action buttons with variants | Used by all admin components |
| `select` or custom dropdown | — | Tenant selector, status filter | Tenant picker for audit log / version history |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `prisma.$queryRaw` for change_requests | Add model to Prisma schema | Adding to schema requires Prisma migration; raw SQL is simpler and the pattern already exists |
| Single combined query joining CharacterBible + change_requests | Two separate fetches | Single query is more efficient; two separate fetches are simpler to reason about — either is fine |

**Installation:** No new packages required. All dependencies are already present.

---

## Architecture Patterns

### Recommended Project Structure

New files this phase:
```
apps/web/superseller-site/src/
├── app/api/admin/
│   ├── character-versions/[tenantId]/route.ts    # GET versions list
│   └── character-versions/[tenantId]/rollback/route.ts  # POST rollback
│   └── change-requests/[tenantId]/route.ts       # GET change_requests
├── components/admin/
│   └── CharacterHistoryTab.tsx                   # New tab component
```

`AdminDashboardClient.tsx` gets one new nav item and one new `activeTab === 'character-history'` branch.

### Pattern 1: Admin Tab Registration

**What:** Admin tabs are registered by adding to the inline `navItems` array and adding a `{activeTab === 'X' && <Component />}` branch in the JSX render section.

**When to use:** Any new admin section.

**Example (from AdminDashboardClient.tsx lines 360-386):**
```typescript
// Source: AdminDashboardClient.tsx (verified from codebase)
// 1. Add to nav array:
{ id: 'character-history', label: 'Char History', icon: History },

// 2. Add render branch:
{activeTab === 'character-history' && (
  <CharacterHistoryTab />
)}
```

### Pattern 2: Admin API Route Auth

**What:** All admin routes use `verifySession()` with role check. Bearer token fallback for CRON_SECRET is documented in CONTEXT.md but only needed for cron-called routes.

**When to use:** Every new admin API route.

**Example (from clients/route.ts — verified):**
```typescript
// Source: apps/web/superseller-site/src/app/api/admin/clients/route.ts
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function checkAuth() {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return null;
    }
    return session;
}

export async function GET(req: NextRequest) {
    const session = await checkAuth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // ...
}
```

### Pattern 3: Raw SQL for Worker-Side Tables

**What:** Tables created by the worker (not in Prisma schema) are queried via `prisma.$queryRaw` template literals. Returns typed `any[]`.

**When to use:** `change_requests` table — it was created by `initChangeRequestTable()` in the worker, not via Prisma migration.

**Example (from financials/route.ts — verified):**
```typescript
// Source: apps/web/superseller-site/src/app/api/admin/financials/route.ts
const result: any[] = await prisma.$queryRaw`
    SELECT id, tenant_id, intent, scope, scene_number, change_summary,
           status, estimated_cost_cents, created_at
    FROM change_requests
    WHERE tenant_id = ${tenantId}
    ORDER BY created_at DESC
`;
```

### Pattern 4: Prisma CharacterBible Query

**What:** `CharacterBible` IS in the Prisma schema — use typed `prisma.characterBible.findMany()`.

**When to use:** Version timeline fetches.

**Example:**
```typescript
// Source: schema.prisma (verified — CharacterBible model at line 1903)
const versions = await prisma.characterBible.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    select: {
        id: true,
        version: true,
        name: true,
        visualStyle: true,
        soraHandle: true,
        personaDescription: true,
        metadata: true,
        changeDelta: true,   // Note: added via raw migration in change-request-intake.ts, not in Prisma schema — use raw SQL or add to schema
        createdAt: true,
    },
});
```

**Important caveat:** The `changeDelta` column was added via idempotent raw SQL in `initChangeRequestTable()` in the worker, but the Prisma schema model at line 1903-1923 does NOT include `changeDelta`. Two options:
1. Fetch via `prisma.$queryRaw` to get `changeDelta` — safe, consistent with existing pattern
2. Add `changeDelta Json?` to the Prisma schema model and run `db:push` — cleaner typing

Recommendation: Add `changeDelta Json?` to the `CharacterBible` model in `schema.prisma` and run `db:push`. The column already exists in the DB. This gives typed access and avoids raw SQL for a Prisma model.

### Pattern 5: Rollback as Append-Only Insert

**What:** Rollback copies all field values from target version and inserts a new row with `version = latestVersion + 1` and a rollback-specific changeDelta.

**When to use:** POST `/api/admin/character-versions/[tenantId]/rollback`

**Example:**
```typescript
// Derived from character-bible-versioning.ts pattern (verified)
// 1. Fetch target version by version number
const target = await prisma.$queryRaw<any[]>`
    SELECT * FROM "CharacterBible"
    WHERE "tenantId" = ${tenantId} AND version = ${targetVersion}
    LIMIT 1
`;

// 2. Fetch latest to get current version number
const latest = await prisma.$queryRaw<any[]>`
    SELECT version FROM "CharacterBible"
    WHERE "tenantId" = ${tenantId}
    ORDER BY "createdAt" DESC LIMIT 1
`;

const newVersion = (latest[0]?.version ?? 1) + 1;
const rollbackDelta = { rollback: { fromVersion: latest[0]?.version, toVersion: targetVersion, rolledBackBy: 'admin' } };

// 3. Insert new row — never UPDATE
await prisma.$queryRaw`
    INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata, version, "changeDelta", "createdAt", "updatedAt")
    VALUES (gen_random_uuid()::text, ${tenantId}, ${target[0].name}, ${target[0].personaDescription}, ${target[0].visualStyle}, ${target[0].soraHandle}, ${target[0].metadata}::jsonb, ${newVersion}, ${JSON.stringify(rollbackDelta)}::jsonb, NOW(), NOW())
    RETURNING id
`;
```

### Pattern 6: Dynamic Route Segment for tenantId

**What:** API routes use `[tenantId]` dynamic segment, accessed via `params.tenantId`.

**When to use:** All three new routes.

**Example (standard Next.js App Router pattern):**
```typescript
// Source: Next.js App Router convention
export async function GET(
    req: NextRequest,
    { params }: { params: { tenantId: string } }
) {
    const { tenantId } = params;
    // ...
}
```

### Anti-Patterns to Avoid
- **Updating existing CharacterBible rows:** The system is append-only. Never `UPDATE "CharacterBible"` — always INSERT a new row.
- **Deleting CharacterBible rows:** Same reason — audit trail must be preserved.
- **Using the worker's db/client.ts from the web app:** Web app has its own Prisma client. Do not import from worker packages.
- **Fetching change_requests via Prisma model:** The table is not in Prisma schema. Use `$queryRaw`.
- **Triggering scene regen from rollback:** Explicitly out of scope. Rollback only restores CharacterBible — regen is a separate deferred feature.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Admin auth | Custom session check | `verifySession()` from `/lib/auth` | Already handles role check, consistent with all other routes |
| Status badge coloring | Custom CSS classes | `badge-enhanced` component | Project standard, consistent visual language |
| Modal/confirmation dialog | Custom overlay | Inline React state with conditional render (as done in AuditManagement.tsx) | No dialog library needed — existing pattern uses `useState(showModal)` |
| Tenant list for selector | Separate fetch | Reuse `GET /api/admin/tenants` (already exists and returns `{ tenants: [{id, slug, name}] }`) | Already implemented, no new endpoint needed |

**Key insight:** The tenant list endpoint already exists at `/api/admin/tenants`. No need to create a new one for the tenant selector dropdown.

---

## Common Pitfalls

### Pitfall 1: changeDelta Missing from Prisma Schema
**What goes wrong:** `prisma.characterBible.findMany()` won't return `changeDelta` field because it's not in the schema model (added via raw migration by worker).
**Why it happens:** The Prisma schema at line 1903-1923 lacks the `changeDelta Json?` field even though it exists in the database.
**How to avoid:** Add `changeDelta Json?` to the `CharacterBible` model in `schema.prisma` before running queries. Then run `npm run db:generate` (NOT `db:push` since the column already exists, just regenerate the client).
**Warning signs:** TypeScript error accessing `.changeDelta` on CharacterBible result type.

### Pitfall 2: tenantId UUID Format Mismatch
**What goes wrong:** `CharacterBible.tenantId` is a UUID (`@db.Uuid`) — passing a slug string will return no results.
**Why it happens:** The tenant selector in the UI will show tenant names/slugs — the API must map slug to UUID before querying CharacterBible.
**How to avoid:** Accept `tenantId` as the UUID (fetched from `/api/admin/tenants`), not slug. Or do a join: `SELECT t.id FROM "Tenant" t WHERE t.slug = $slug` then query CharacterBible.
**Warning signs:** Empty results even for tenants with known CharacterBibles.

### Pitfall 3: change_requests Uses Snake_case, CharacterBible Uses CamelCase
**What goes wrong:** Mixing column name conventions causes query errors.
**Why it happens:** `change_requests` uses `snake_case` (raw SQL table). `CharacterBible` uses `camelCase` quoted identifiers (`"tenantId"`, `"changeDelta"`).
**How to avoid:** Raw SQL for `change_requests` uses bare snake_case. Prisma queries for `CharacterBible` use camelCase keys. When using `$queryRaw` on CharacterBible, remember to quote the camelCase column names: `"tenantId"`, `"personaDescription"`, etc.

### Pitfall 4: Rollback Version Number Collision
**What goes wrong:** Two concurrent admin actions could both read the same `latest.version` and try to INSERT with the same version number.
**Why it happens:** The version increment is not atomic.
**How to avoid:** Wrap rollback insert in a single `SELECT MAX(version) + 1` subquery: `version = (SELECT COALESCE(MAX(version), 1) + 1 FROM "CharacterBible" WHERE "tenantId" = $1)` in the INSERT statement itself.

### Pitfall 5: Cost Display Units
**What goes wrong:** `estimated_cost_cents` is stored as integer cents. Display math errors if passed directly.
**Why it happens:** The CONTEXT.md says "cost in cents" for audit log, but "cost in dollars" for the version timeline.
**How to avoid:** Audit log table: display raw cents value with label "cents". Version timeline: divide by 100 and format as `$X.XX`.

---

## Code Examples

### GET /api/admin/character-versions/[tenantId]
```typescript
// Pattern: dynamic route with admin auth + Prisma query
// Source: derived from tenants/route.ts + clients/route.ts patterns (verified)
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: { tenantId: string } }
) {
    const session = await verifySession();
    if (!session.isValid || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId } = params;

    // CharacterBible is in Prisma schema — typed query (after adding changeDelta to schema)
    const versions: any[] = await prisma.$queryRaw`
        SELECT cb.id, cb."tenantId", cb.name, cb."visualStyle", cb."soraHandle",
               cb."personaDescription", cb.metadata, cb.version, cb."changeDelta", cb."createdAt",
               cr.intent, cr.scope, cr.scene_number, cr.estimated_cost_cents, cr.status as cr_status
        FROM "CharacterBible" cb
        LEFT JOIN change_requests cr ON cr.character_bible_version_id = cb.id
        WHERE cb."tenantId" = ${tenantId}
        ORDER BY cb.version DESC
    `;

    return NextResponse.json({ versions });
}
```

### GET /api/admin/change-requests/[tenantId]
```typescript
// Source: derived from financials/route.ts $queryRaw pattern (verified)
const { searchParams } = new URL(req.url);
const statusFilter = searchParams.get('status');

const rows: any[] = await prisma.$queryRaw`
    SELECT id, tenant_id, intent, scope, scene_number, change_summary,
           status, estimated_cost_cents, created_at, updated_at
    FROM change_requests
    WHERE tenant_id = ${tenantId}
    ${statusFilter ? prisma.$queryRaw`AND status = ${statusFilter}` : prisma.$queryRaw``}
    ORDER BY created_at DESC
`;
```
**Note:** Prisma tagged template literals do not support conditional fragments cleanly. Build the query as plain SQL string with `Prisma.sql` or use two separate query branches (with/without filter).

### Confirmation Modal Pattern
```typescript
// Source: inline state pattern used across admin components (verified in AuditManagement.tsx)
const [rollbackTarget, setRollbackTarget] = useState<number | null>(null);

// Trigger:
<Button onClick={() => setRollbackTarget(version.version)}>Rollback</Button>

// Modal:
{rollbackTarget !== null && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="font-black uppercase tracking-widest text-white mb-2">Confirm Rollback</h3>
            <p className="text-slate-400 text-sm mb-6">
                Roll back to version {rollbackTarget}? This creates a new version with those settings.
                Future scene generations will use these character settings.
            </p>
            <div className="flex gap-3">
                <Button onClick={() => handleRollback(rollbackTarget)} variant="destructive">Confirm</Button>
                <Button onClick={() => setRollbackTarget(null)} variant="outline">Cancel</Button>
            </div>
        </div>
    </div>
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Firebase/Firestore for real-time admin data | PostgreSQL + Prisma | Mar 2026 | All admin queries go through Prisma or raw SQL on PostgreSQL |
| Updating CharacterBible in-place | Append-only INSERT pattern | Phase 16 | Full version history preserved; rollback is just another insert |

**Deprecated/outdated:**
- Firebase/Firestore: fully removed Mar 2026. Never use for admin data queries.
- Airtable.com: retired. Never use.

---

## Open Questions

1. **`changeDelta` not in Prisma schema**
   - What we know: The column exists in the DB (added by worker migration). The Prisma model at line 1903 does not include it.
   - What's unclear: Whether the web app can access it via Prisma typed queries or must use `$queryRaw`.
   - Recommendation: Planner should add `changeDelta Json?` to `CharacterBible` model in schema.prisma as Wave 0 task, then run `npm run db:generate`. No `db:push` needed (column already exists).

2. **Tenant selector implementation**
   - What we know: `/api/admin/tenants` GET exists and returns tenant list. New UI needs a way to select which tenant to view.
   - What's unclear: Whether the tab component fetches tenants on mount or receives them as props.
   - Recommendation: Fetch tenant list on component mount from `/api/admin/tenants`. State: `selectedTenantId`. On selection change, fetch versions and change_requests for that tenant.

3. **`change_requests.tenant_id` vs `CharacterBible.tenantId` UUID format**
   - What we know: `CharacterBible.tenantId` is `@db.Uuid` (Postgres UUID). `change_requests.tenant_id` is `TEXT`. The worker populates tenant_id as a string.
   - What's unclear: Whether tenant_id in change_requests is the UUID string or the slug.
   - Recommendation: Planner should verify by inspecting a real row. If it's the UUID string (likely, since the worker works with tenant IDs not slugs), queries join cleanly. If it's a slug, a join through the Tenant table is needed.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected (no jest.config, no vitest.config, no pytest.ini in web app) |
| Config file | None — Wave 0 gap |
| Quick run command | `npm run lint` (from apps/web/superseller-site) |
| Full suite command | `npm run build` (catches TypeScript errors) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | Audit log returns change_requests for tenant | manual-only (no test framework) | `curl https://admin.superseller.agency/api/admin/change-requests/[tenantId]` | N/A |
| ADMIN-02 | Version timeline shows CharacterBible versions with changeDelta | manual-only | `curl https://admin.superseller.agency/api/admin/character-versions/[tenantId]` | N/A |
| ADMIN-03 | Rollback inserts new row, does not modify existing | manual-only | `curl -X POST .../rollback -d '{"targetVersion":1}'` + verify DB row count +1 | N/A |

### Sampling Rate
- **Per task commit:** `cd apps/web/superseller-site && npm run lint` (< 30 seconds)
- **Per wave merge:** `cd apps/web/superseller-site && npm run build` (TypeScript compilation catches all type errors)
- **Phase gate:** Build green + manual browser verification of admin portal before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Add `changeDelta Json?` to `CharacterBible` model in `apps/web/superseller-site/prisma/schema.prisma` and run `npm run db:generate` — this is a schema-only change (column already exists in DB)

*(No test file creation needed — project has no unit test infrastructure for web app)*

---

## Sources

### Primary (HIGH confidence)
- `apps/web/superseller-site/src/app/[locale]/(main)/admin/AdminDashboardClient.tsx` — Tab navigation pattern, nav item array, conditional render pattern (lines 360-407, verified)
- `apps/web/superseller-site/src/app/api/admin/clients/route.ts` — Admin API auth pattern with `verifySession()` (full file, verified)
- `apps/web/superseller-site/src/app/api/admin/financials/route.ts` — `prisma.$queryRaw` pattern for non-Prisma tables (lines 36-54, verified)
- `apps/web/superseller-site/src/app/api/admin/tenants/route.ts` — Existing tenant list endpoint (full file, verified)
- `apps/worker/src/services/onboarding/character-bible-versioning.ts` — CharacterBibleFields interface, append-only INSERT pattern (full file, verified)
- `apps/worker/src/services/onboarding/change-request-intake.ts` — change_requests table schema, all column definitions, status values (full file, verified)
- `apps/web/superseller-site/prisma/schema.prisma` — CharacterBible model definition lines 1903-1923, Tenant.characterBibles relation line 30 (verified)
- `apps/web/superseller-site/src/components/admin/CustomerManagement.tsx` — Client component pattern for admin tabs (verified)
- `apps/web/superseller-site/src/app/api/admin/customers/route.ts` — Pattern for joining multiple queries, error handling (full file, verified)

### Secondary (MEDIUM confidence)
- `.planning/phases/19-admin-tooling/19-CONTEXT.md` — Locked design decisions for all three requirements

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries are already installed and in use; no new dependencies
- Architecture: HIGH — Admin tab pattern verified directly from AdminDashboardClient.tsx source; raw SQL pattern verified from financials/route.ts; rollback logic derived from existing character-bible-versioning.ts pattern
- Pitfalls: HIGH — changeDelta schema gap verified by reading schema.prisma and comparing to the migration in change-request-intake.ts; UUID mismatch verified from schema

**Research date:** 2026-03-16
**Valid until:** 2026-06-16 (stable — Next.js + Prisma patterns are long-lived)
