---
phase: 12-payment-webhooks
plan: 01
subsystem: payments
tags: [prisma, postgres, webhooks, paypal, stripe, whatsapp, worker, retry]

# Dependency graph
requires:
  - phase: prior phases
    provides: Tenant, User, TenantUser, ServiceInstance Prisma models; worker onboarding pipeline

provides:
  - WebhookEvent Prisma model with idempotency constraint on (provider, eventId)
  - ProvisioningService.onboardNewCustomer() shared method for both PayPal and Stripe webhooks
  - fetchWithRetry helper with 3x exponential backoff for worker HTTP calls
  - Worker /api/onboarding/start with WORKER_API_SECRET auth header

affects: [12-02-paypal-webhook, 12-03-stripe-webhook]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WebhookEvent idempotency: CREATE with unique constraint — P2002 = already processed, skip"
    - "fetchWithRetry: 3 attempts, 2s/4s/8s backoff, retries on 5xx/429/ECONNREFUSED/AbortError"
    - "Worker auth: x-worker-secret header checked against WORKER_API_SECRET env var"
    - "WhatsApp alert on onboarding failure via sendWhatsAppAlert to 14695885133@c.us"

key-files:
  created: []
  modified:
    - apps/web/superseller-site/prisma/schema.prisma
    - apps/web/superseller-site/src/lib/services/ProvisioningService.ts
    - apps/worker/src/api/routes.ts

key-decisions:
  - "Created WebhookEvent table via direct SQL (not prisma db push) to avoid pre-existing schema drift destroying production data"
  - "Worker URL env var: WORKER_URL or VIDEO_WORKER_URL fallback to http://172.245.56.50:3002"
  - "Slug uniqueness: append 5-char random suffix on conflict (not counter) for URL-safety"

patterns-established:
  - "Idempotency pattern: prisma.webhookEvent.create in try/catch, P2002 = already processed"
  - "Retry pattern: fetchWithRetry(url, options, retries=3, delayMs=2000) with exponential backoff"
  - "Auth gate pattern: check process.env.WORKER_API_SECRET, return 401 if header mismatch"

requirements-completed: [HOOK-03, HOOK-04, HOOK-05]

# Metrics
duration: 4min
completed: 2026-03-15
---

# Phase 12 Plan 01: Payment Webhook Foundation Summary

**WebhookEvent idempotency table, ProvisioningService.onboardNewCustomer() shared method with 3x retry + WhatsApp alert, and worker endpoint secured with WORKER_API_SECRET auth**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-15T16:47:52Z
- **Completed:** 2026-03-15T16:51:32Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments
- WebhookEvent Prisma model + database table created with unique(provider, eventId) constraint for idempotency
- ProvisioningService.onboardNewCustomer() handles full post-payment chain: idempotency check, tenant creation, user linking, ServiceInstance creation, worker call with 3x retry
- Worker /api/onboarding/start secured with WORKER_API_SECRET header auth, extended with optional productName/serviceType fields

## Task Commits

Each task was committed atomically:

1. **Task 1: Add WebhookEvent model to Prisma schema and run migration** - `d276693a` (feat)
2. **Task 2: Create ProvisioningService.onboardNewCustomer() shared method with retry** - `7b293e36` (feat)
3. **Task 3: Extend worker /api/onboarding/start endpoint with auth and auto-tenant support** - `87ae23fa` (feat)

## Files Created/Modified
- `apps/web/superseller-site/prisma/schema.prisma` - Added WebhookEvent model with @@unique([provider, eventId]) constraint
- `apps/web/superseller-site/src/lib/services/ProvisioningService.ts` - Added onboardNewCustomer(), fetchWithRetry(), sendWhatsAppAlert(), slugify() helpers
- `apps/worker/src/api/routes.ts` - Added WORKER_API_SECRET auth check, optional productName/serviceType schema fields

## Decisions Made
- Created WebhookEvent table via direct SQL (not `prisma db push`) to avoid pre-existing schema drift that would have dropped ~20 production tables
- Worker URL fallback chain: `WORKER_URL` → `VIDEO_WORKER_URL` → `http://172.245.56.50:3002` to match existing pattern
- Auth guard placed OUTSIDE the try/catch so auth failures return 401 before schema validation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used direct SQL instead of prisma db push for schema migration**
- **Found during:** Task 1 (Add WebhookEvent model)
- **Issue:** `prisma db push` detected pre-existing schema drift and would have dropped 20+ production tables with data (contractors, competitor_ads, health_checks, etc.)
- **Fix:** Created WebhookEvent table directly via psql with exact SQL matching the Prisma model definition, then ran `prisma generate` only
- **Files modified:** No extra files — just used psql directly
- **Verification:** `npx prisma validate` passes, table confirmed via SQL
- **Committed in:** d276693a (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required workaround protects production data. WebhookEvent table is functionally identical to what prisma db push would have created.

## Issues Encountered
- Pre-existing schema drift between Prisma schema and live database (20+ tables not in schema). Out of scope — logged to deferred items. Only affected migration approach for Task 1.

## User Setup Required
None - no external service configuration required. WORKER_API_SECRET env var should be added to both web (Vercel) and worker (.env) to enable auth. Without it, the endpoint remains open (backward compatible).

## Next Phase Readiness
- WebhookEvent table ready for idempotency in PayPal (12-02) and Stripe (12-03) webhooks
- ProvisioningService.onboardNewCustomer() ready to call from both webhook handlers
- Worker endpoint secured and ready to receive webhook-triggered onboarding requests

## Self-Check: PASSED

- FOUND: .planning/phases/12-payment-webhooks/12-01-SUMMARY.md
- FOUND: apps/web/superseller-site/prisma/schema.prisma (WebhookEvent model added)
- FOUND: apps/web/superseller-site/src/lib/services/ProvisioningService.ts (onboardNewCustomer + fetchWithRetry)
- FOUND: apps/worker/src/api/routes.ts (WORKER_API_SECRET auth added)
- COMMIT d276693a: feat(12-01): add WebhookEvent model to Prisma schema
- COMMIT 7b293e36: feat(12-01): add onboardNewCustomer() to ProvisioningService
- COMMIT 87ae23fa: feat(12-01): extend worker /api/onboarding/start with auth

---
*Phase: 12-payment-webhooks*
*Completed: 2026-03-15*
