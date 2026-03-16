---
phase: 19-admin-tooling
plan: 01
subsystem: api
tags: [prisma, postgres, nextjs, admin, character-bible, change-requests]

# Dependency graph
requires:
  - phase: 16-change-request-intake
    provides: change_requests table schema with character_bible_version_id FK
  - phase: 18-admin-approval
    provides: CharacterBible versioning pattern (INSERT new row, never UPDATE)
provides:
  - "GET /api/admin/character-versions/[tenantId] — version timeline with LEFT JOIN to change_requests"
  - "POST /api/admin/character-versions/[tenantId]/rollback — append-only rollback via atomic INSERT"
  - "GET /api/admin/change-requests/[tenantId] — audit log with optional status filter and cost totals"
  - "changeDelta Json? field on CharacterBible Prisma model (column already existed in DB)"
affects: [19-02-admin-ui, character-history-tab, admin-panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "params as Promise<{ id: string }> — Next.js 14 dynamic route handler convention"
    - "prisma.$queryRaw with quoted camelCase for Prisma-managed tables (CharacterBible), bare snake_case for raw tables (change_requests)"
    - "Append-only rollback: INSERT new row with version = (SELECT MAX(version)+1) for atomicity"
    - "Two-branch queryRaw for optional filter — no conditional fragments in tagged templates"

key-files:
  created:
    - apps/web/superseller-site/src/app/api/admin/character-versions/[tenantId]/route.ts
    - apps/web/superseller-site/src/app/api/admin/character-versions/[tenantId]/rollback/route.ts
    - apps/web/superseller-site/src/app/api/admin/change-requests/[tenantId]/route.ts
  modified:
    - apps/web/superseller-site/prisma/schema.prisma

key-decisions:
  - "params typed as Promise<{ tenantId: string }> — Next.js 14 requires await params; existing audits/[instanceId] route confirms this pattern"
  - "Two-branch queryRaw for status filter — Prisma tagged templates cannot interpolate conditional WHERE fragments"
  - "tenantId cast to ::uuid in CharacterBible queries — column is UUID type; change_requests.tenant_id is TEXT so no cast needed"
  - "costResult query uses IN ('completed', 'approved') — both terminal states count toward total spend"

patterns-established:
  - "Admin route auth: async checkAuth() returns null on failure, handler returns 401 immediately"
  - "CharacterBible version timeline: LEFT JOIN change_requests ON character_bible_version_id to surface cost/intent per version"
  - "Rollback creates new row rather than updating active flag — preserves full audit trail"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03]

# Metrics
duration: 15min
completed: 2026-03-15
---

# Phase 19 Plan 01: Admin API Routes for Character History Summary

**Three admin API routes backing the Character History tab: version timeline with LEFT JOIN to change_requests, atomic rollback via append-only INSERT, and change request audit log with cost totals — plus changeDelta added to Prisma CharacterBible model**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-15T~
- **Completed:** 2026-03-15T~
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Added `changeDelta Json?` to CharacterBible Prisma schema and regenerated client (column pre-existed in DB from worker migration)
- Created GET character-versions route with LEFT JOIN to change_requests — returns version, changeDelta, intent, scope, estimated_cost_cents per version
- Created POST rollback route — fetches target version, inserts new row with atomic `SELECT MAX(version)+1` subquery and rollback changeDelta JSON
- Created GET change-requests route — optional `?status=` filter via two-branch queryRaw, plus totalCostCents aggregation for completed/approved records
- All routes follow established admin auth pattern (verifySession + role=admin check)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add changeDelta to Prisma schema + regenerate client** - `9eaac1f4` (feat)
2. **Task 2: Create all three admin API routes** - `71c0c0a8` (feat)

## Files Created/Modified

- `apps/web/superseller-site/prisma/schema.prisma` — Added `changeDelta Json?` field to CharacterBible model
- `apps/web/superseller-site/src/app/api/admin/character-versions/[tenantId]/route.ts` — GET handler: version timeline with LEFT JOIN to change_requests
- `apps/web/superseller-site/src/app/api/admin/character-versions/[tenantId]/rollback/route.ts` — POST handler: append-only rollback with atomic version increment
- `apps/web/superseller-site/src/app/api/admin/change-requests/[tenantId]/route.ts` — GET handler: audit log with status filter and cost totals

## Decisions Made

- **params as Promise**: Updated to `params: Promise<{ tenantId: string }>` with `await params` after discovering existing `audits/[instanceId]` route uses this pattern — Next.js 14 requires it for type compliance
- **Two-branch queryRaw**: Used two separate template literals for filtered/unfiltered queries — Prisma tagged templates don't support conditional fragments
- **tenantId cast**: CharacterBible `"tenantId"` column is UUID, so cast `${tenantId}::uuid`; change_requests `tenant_id` is TEXT, no cast needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed params type for Next.js 14 route handler compliance**
- **Found during:** Task 2 (after TypeScript check)
- **Issue:** Initially used `params: { tenantId: string }` but Next.js 14 requires `params: Promise<{ tenantId: string }>` — validator.ts emitted TS2344 errors for all three new routes
- **Fix:** Updated all three route handlers to `await params` with Promise type, matching existing `audits/[instanceId]/responses/route.ts` pattern
- **Files modified:** all three new route files
- **Verification:** `npx tsc --noEmit` — zero errors in new files after fix
- **Committed in:** 71c0c0a8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug — incorrect params type)
**Impact on plan:** Fix was necessary for TypeScript compliance and runtime correctness. No scope creep.

## Issues Encountered

- `npm run lint` failed with "lint" parsed as a directory argument (Next.js CLI version issue). Used `npx tsc --noEmit` to verify type correctness instead — confirmed zero errors in new route files. The 51 pre-existing TS errors are all in test files (not production routes) and pre-date this plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All three API routes are live and type-safe — Plan 02 (admin UI) can consume immediately
- GET /api/admin/character-versions/[tenantId] returns `{ versions: [...] }` with version + changeDelta + CR metadata
- POST /api/admin/character-versions/[tenantId]/rollback accepts `{ targetVersion: number }`, returns `{ success, newVersion: { id, version } }`
- GET /api/admin/change-requests/[tenantId] accepts `?status=` filter, returns `{ changeRequests, totalCostCents }`
- Blocker from Phase 17 (FAL_WEBHOOK_VERIFY) does not affect these routes

---
*Phase: 19-admin-tooling*
*Completed: 2026-03-15*
