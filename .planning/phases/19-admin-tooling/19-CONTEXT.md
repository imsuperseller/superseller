# Phase 19: Admin Tooling - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning
**Mode:** Auto-selected (all defaults)

<domain>
## Phase Boundary

Admin can view the full history of character changes per customer, roll back to any previous CharacterBible version, and audit per-customer iteration spend. All within the existing admin portal at admin.superseller.agency. This is the final phase of v1.3 Character Iteration milestone.

Requirements: ADMIN-01, ADMIN-02, ADMIN-03

</domain>

<decisions>
## Implementation Decisions

### Version Timeline UI (ADMIN-02)
- New admin portal tab or section within existing customer detail view
- Vertical timeline layout: most recent version at top, each entry shows:
  - Version number + date
  - changeDelta diff (old→new for each changed field)
  - Cost of that specific change in dollars (from associated change_request.estimated_cost_cents)
  - Status badge (active, rolled-back, etc.)
- Per-tenant view: admin selects a tenant, sees their CharacterBible version history
- Empty state: "No character changes recorded for this customer"

### Rollback Mechanism (ADMIN-02)
- Rollback = INSERT a new version row that copies the target version's field values (consistent with append-only pattern — never UPDATE or DELETE)
- changeDelta for rollback row: `{ rollback: { fromVersion: N, toVersion: M, rolledBackBy: "admin" } }`
- One-click "Rollback" button per version → confirmation modal: "Roll back to version N? This creates a new version with those settings."
- Rollback does NOT regenerate scenes — it restores the CharacterBible so FUTURE generations use the old settings
- After rollback, admin can optionally trigger a full regen from the admin portal (deferred to future)

### Audit Log Display (ADMIN-01)
- Table view of all change_requests for a tenant
- Columns: date, intent classification, change summary, scene(s) triggered, status, cost (cents)
- Filterable by tenant (required), optionally by status or intent
- Sortable by date (default: newest first)
- Shows all statuses including pending-admin-approval, admin-denied, failed
- Total cost row at bottom: sum of all completed change requests for tenant

### API Routes
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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Admin portal (extend this)
- `apps/web/superseller-site/src/app/admin/` — Existing admin portal structure, tab routing, auth pattern
- `apps/web/superseller-site/src/app/api/admin/` — Existing admin API routes, verifySession auth pattern
- `apps/web/superseller-site/src/components/admin/` — Existing admin components (tables, cards, layouts)

### Character system (data source)
- `apps/worker/src/services/onboarding/character-bible-versioning.ts` — CharacterBibleFields interface, changeDelta format, getLatestCharacterBible()
- `apps/web/superseller-site/prisma/schema.prisma` — CharacterBible model definition (id, tenantId, name, visualStyle, soraHandle, version, metadata, changeDelta, createdAt)

### Change request system (data source)
- `apps/worker/src/services/onboarding/change-request-intake.ts` — change_requests table schema, status values, column definitions

### Cost tracking (data source)
- `apps/worker/src/services/expense-tracker.ts` — api_expenses table, trackExpense() for cost data

### Requirements
- `.planning/REQUIREMENTS.md` — ADMIN-01, ADMIN-02, ADMIN-03 acceptance criteria

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Admin portal tab system: existing pattern for adding new tabs at admin.superseller.agency
- Admin API auth: `verifySession()` + CRON_SECRET Bearer token fallback — reuse for new routes
- Prisma client in web app: direct query access to CharacterBible + change_requests tables
- Existing admin table components: sortable tables, status badges, filter dropdowns

### Established Patterns
- Admin tabs: each tab is a React component rendered by tab router
- Admin API: Next.js API routes at `/api/admin/[resource]/route.ts` with session verification
- Data fetching: SWR or direct fetch from admin client components
- Prisma queries: `prisma.characterBible.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } })`

### Integration Points
- Admin tab router: add "Character History" or "Iterations" tab
- Admin sidebar navigation: add menu item
- CharacterBible table: query directly via Prisma (web app has full schema access)
- change_requests table: query via raw SQL or add to Prisma schema (currently worker-only via raw SQL)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — auto-selected defaults based on existing admin portal patterns and v1.3 data structures.

</specifics>

<deferred>
## Deferred Ideas

- Admin-triggered regen from portal (trigger full character regen without WhatsApp flow)
- Bulk rollback across multiple tenants
- Export change request audit log as CSV
- Cost dashboard with per-provider breakdown (mentioned in Phase 15 deferred)
- Customer-facing version history view (web portal, not WhatsApp)

</deferred>

---

*Phase: 19-admin-tooling*
*Context gathered: 2026-03-16*
