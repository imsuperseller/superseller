---
phase: 12-payment-webhooks
plan: "04"
subsystem: payments
tags: [webhook, monitoring, admin, prisma, next.js, system-monitor]

# Dependency graph
requires:
  - phase: 12-payment-webhooks plan 01
    provides: WebhookEvent Prisma model with idempotency table

provides:
  - Webhook processing health metrics in system-monitoring API (per-provider stats + recent failures)
  - Webhook Health tab in SystemMonitor.tsx admin component
  - Webhook section in SystemMonitoring.tsx with provider table and failure cards
  - Auto-alert when webhook failure rate exceeds 20% in last 24 hours

affects:
  - admin dashboard (SystemMonitor, SystemMonitoring)
  - payment webhook observability

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prisma $queryRaw with bigint → Number() coercion for aggregate SQL queries"
    - "Parallel fetch of monitoring and system-monitoring APIs in admin component"

key-files:
  created: []
  modified:
    - apps/web/superseller-site/src/app/api/admin/system-monitoring/route.ts
    - apps/web/superseller-site/src/components/admin/SystemMonitor.tsx
    - apps/web/superseller-site/src/components/admin/SystemMonitoring.tsx

key-decisions:
  - "Added webhook metrics to system-monitoring API (not /api/admin/monitoring) since SystemMonitoring.tsx already consumes that endpoint"
  - "SystemMonitor.tsx fetches system-monitoring API in parallel alongside its existing /api/admin/monitoring call — no separate endpoint needed"
  - "Used $queryRaw for aggregate webhook stats with explicit bigint->Number coercion to handle PostgreSQL COUNT return type"
  - "Auto-approved checkpoint:human-verify per auto_advance=true config"

patterns-established:
  - "Pattern: Admin health tabs fetch from multiple APIs in parallel, merge results into local state"

requirements-completed: [HOOK-05]

# Metrics
duration: 18min
completed: "2026-03-15"
---

# Phase 12 Plan 04: Webhook Monitoring Summary

**Webhook processing health tab added to admin System Monitor with per-provider success rate, 24h stats table, and recent failure cards queried from the WebhookEvent Prisma table**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-03-15T17:00:00Z
- **Completed:** 2026-03-15T17:18:00Z
- **Tasks:** 2 (1 auto + 1 auto-approved checkpoint)
- **Files modified:** 3

## Accomplishments

- Extended `/api/admin/system-monitoring` to query WebhookEvent table for last-24h per-provider stats (total/completed/failed/processing) plus 5 most recent failures
- Added "Webhook Health" tab to SystemMonitor.tsx with success rate badge (green/yellow/red), provider summary table, and failure list cards
- Added equivalent webhook section to SystemMonitoring.tsx (the component that directly consumes the system-monitoring API)
- Added auto-alert when webhook failure rate exceeds 20% in last 24h

## Task Commits

Each task was committed atomically:

1. **Task 1: Add webhook metrics to System Monitor API and UI** - `aad8a6a6` (feat)
2. **Task 2: Verify full end-to-end flow** - checkpoint auto-approved (auto_advance=true)

## Files Created/Modified

- `apps/web/superseller-site/src/app/api/admin/system-monitoring/route.ts` - Added Prisma webhook queries + webhookMetrics/recentFailures fields in response
- `apps/web/superseller-site/src/components/admin/SystemMonitor.tsx` - Added Webhook Health tab, parallel fetch, WebhookMetricSummary/WebhookFailureSummary interfaces
- `apps/web/superseller-site/src/components/admin/SystemMonitoring.tsx` - Added WebhookHealthSection component with provider table and failure cards

## Decisions Made

- Added webhook metrics to the system-monitoring API since `SystemMonitoring.tsx` already consumes `/api/admin/system-monitoring` — kept consistent with existing architecture
- `SystemMonitor.tsx` fetches system-monitoring in parallel alongside `/api/admin/monitoring` — minimal change, no new API endpoint needed
- Used `$queryRaw` with explicit `bigint` type and `Number()` coercion — PostgreSQL COUNT returns bigint, which must be converted before JSON serialization

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — pre-existing TypeScript errors in test files (webhook-approval.test.ts, approval-flow.test.ts, magic-link.test.ts) and webhooks/stripe/route.ts were present before this plan and are out of scope.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

Phase 12 complete. All 4 plans shipped:
1. Plan 01: WebhookEvent table + ProvisioningService + worker API
2. Plan 02: PayPal + Stripe webhook handlers with idempotency
3. Plan 03: Pre-checkout form + success page + Stripe session API
4. Plan 04: Admin webhook health monitoring

Ready for Phase 13 (Whisper/voice processing) or Phase 14 (WhatsApp RTL agent).

---
*Phase: 12-payment-webhooks*
*Completed: 2026-03-15*
