---
phase: 12-payment-webhooks
plan: 02
subsystem: payments
tags: [paypal, stripe, webhooks, onboarding, whatsapp, provisioning]

# Dependency graph
requires:
  - phase: 12-payment-webhooks-01
    provides: ProvisioningService.onboardNewCustomer() shared method; WebhookEvent idempotency table

provides:
  - PayPal BILLING.SUBSCRIPTION.ACTIVATED fires onboardNewCustomer with customer data
  - Stripe checkout.session.completed fires onboardNewCustomer as step 10
  - PAYPAL_WEBHOOK_ID now mandatory — returns 500 if missing (not silently skip)

affects: [12-03-checkout-pages, 12-04-end-to-end]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Additive trigger pattern: call onboardNewCustomer after existing business logic, wrapped in non-blocking try/catch"
    - "Phone fallback chain: PayPal subscriber.phone.phone_number.national_number || customMetadata.phone || ''"
    - "Missing phone logged as error (not warn) so monitoring catches it — operator must follow up manually"
    - "Static import pattern: ProvisioningService imported at module level, not dynamically"

key-files:
  created: []
  modified:
    - apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts
    - apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts

key-decisions:
  - "onboardNewCustomer is additive — all existing webhook behavior (subscription CRUD, credits, n8n forward) is preserved"
  - "PAYPAL_WEBHOOK_ID changed from optional (silently skipped) to required (returns 500) — per plan decisions"
  - "Phone number for PayPal: tries PayPal subscriber phone first, falls back to customMetadata.phone (compact key set in checkout page)"
  - "Stripe phone: sourced from session metadata.phone set by the checkout page built in plan 03"

patterns-established:
  - "Non-blocking onboarding: wrap ProvisioningService.onboardNewCustomer() in try/catch, never re-throw"
  - "Phone gate: onboarding only fires when phone is present; missing phone logs error with customer email"

requirements-completed: [HOOK-01, HOOK-02]

# Metrics
duration: 5min
completed: 2026-03-15
---

# Phase 12 Plan 02: Webhook Onboarding Triggers Summary

**PayPal and Stripe webhooks wired to call ProvisioningService.onboardNewCustomer() additively — payment fires and WhatsApp onboarding begins automatically without breaking any existing payment processing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-15T17:14:42Z
- **Completed:** 2026-03-15T17:19:30Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- PayPal BILLING.SUBSCRIPTION.ACTIVATED now calls onboardNewCustomer after subscription creation and credit provisioning (additive, non-blocking)
- Stripe checkout.session.completed now calls onboardNewCustomer as step 10 after all existing 9 steps (additive, non-blocking)
- PAYPAL_WEBHOOK_ID made mandatory — returns 500 before processing if missing (previously silently skipped verification)
- Missing phone number logged as error (not warn) with customer email so operations team can manually follow up

## Task Commits

Each task was committed atomically:

1. **Task 1: Add onboarding trigger to PayPal webhook** - `9372321c` (feat)
2. **Task 2: Add onboarding trigger to Stripe webhook** - `9d419360` (feat)

## Files Created/Modified
- `apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts` - PAYPAL_WEBHOOK_ID mandatory check + onboardNewCustomer call after BILLING.SUBSCRIPTION.ACTIVATED
- `apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts` - ProvisioningService static import + onboardNewCustomer as step 10 after checkout.session.completed

## Decisions Made
- Both triggers are additive — zero existing webhook behavior was removed or modified
- PAYPAL_WEBHOOK_ID changed from `process.env.PAYPAL_WEBHOOK_ID!` (non-null assertion, silently ignored) to a hard runtime check with 500 response before any processing — prevents security bypass
- Phone fallback for PayPal: `subscriber.phone.phone_number.national_number` first, then `customMetadata.phone` (compact key `phone` set by checkout page per plan 03 decisions)
- Both failures logged at `console.error` level (not `console.warn`) to ensure monitoring/alerting catches missing phone numbers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None — no new environment variables required. Existing PAYPAL_WEBHOOK_ID and STRIPE_WEBHOOK_SECRET are already required for signature verification.

## Next Phase Readiness
- Both webhook handlers are fully wired to onboarding
- The automation chain is complete: payment event → webhook → ProvisioningService → worker → WhatsApp group
- Plan 03 (checkout pages) must set `phone` in Stripe session metadata and `customMetadata.phone` in PayPal custom_id for the phone gate to pass
- Plans 03 checkout pages are already built (per STATE.md — plan 03 completed before plan 02)

## Self-Check: PASSED

- FOUND: apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts (onboardNewCustomer + PAYPAL_WEBHOOK_ID check)
- FOUND: apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts (ProvisioningService import + onboardNewCustomer step 10)
- COMMIT 9372321c: feat(12-02): add onboarding trigger to PayPal webhook
- COMMIT 9d419360: feat(12-02): add onboarding trigger to Stripe webhook

---
*Phase: 12-payment-webhooks*
*Completed: 2026-03-15*
