---
phase: 12-payment-webhooks
plan: 03
subsystem: payments
tags: [paypal, stripe, checkout, next.js, react, typescript, subscription]

# Dependency graph
requires:
  - phase: 12-payment-webhooks
    provides: "Webhook handlers for PayPal and Stripe already exist — this adds the pre-checkout data collection layer upstream of those webhooks"
provides:
  - /checkout/[product] page: pre-payment data collection (phone, businessName, email) with PayPal subscription + Stripe card payment buttons
  - /checkout/success page: branded confirmation with WhatsApp onboarding expectation message
  - checkout-config.ts: product slug to PayPal plan ID / Stripe price ID mapping with env var resolution
  - POST /api/checkout/create-session: Stripe subscription session creator with customer metadata
affects: [12-payment-webhooks, phase-13, phase-14, stripe-webhook, paypal-webhook]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Checkout config via env var references (paypalPlanIdEnvVar / stripePriceIdEnvVar) — adding new products requires only an env var + config entry, no code changes"
    - "PayPal JS SDK loaded via script tag in 'use client' component; buttons re-rendered when form becomes valid"
    - "PayPal custom_id JSON capped to 127 chars: {phone, bn (40 chars), svc (20 chars)}"
    - "Stripe metadata carries: phone, businessName, productName, serviceType, productSlug"
    - "Form gating: payment buttons disabled until phone (8+ digits), businessName, and email all valid"

key-files:
  created:
    - apps/web/superseller-site/src/lib/checkout-config.ts
    - apps/web/superseller-site/src/app/api/checkout/create-session/route.ts
    - apps/web/superseller-site/src/app/checkout/[product]/page.tsx
    - apps/web/superseller-site/src/app/checkout/[product]/CheckoutForm.tsx
    - apps/web/superseller-site/src/app/checkout/success/page.tsx
  modified: []

key-decisions:
  - "PayPal custom_id JSON is minimal: {phone, bn, svc} instead of full businessName to stay under 127 char PayPal limit"
  - "CheckoutForm is a separate 'use client' component loaded from the server page component — Next.js App Router pattern"
  - "PayPal SDK loaded via script tag (not @paypal/react-paypal-js) — that package not in project dependencies"
  - "Stripe create-session route validates phone server-side (8+ digits) as a second defense layer beyond client validation"
  - "Success page is static — no query param processing or status polling (per plan decisions)"
  - "Font is Outfit (matches layout.tsx) not Inter (plan context was approximate)"

patterns-established:
  - "Checkout config: env var name stored, resolved at getProductConfig() call time — safe for server and client components"
  - "Pre-checkout data collection pattern: form → PayPal JS SDK subscription OR Stripe session API → success page"

requirements-completed: [HOOK-01, HOOK-02]

# Metrics
duration: 18min
completed: 2026-03-15
---

# Phase 12 Plan 03: Checkout Pages Summary

**Pre-checkout page at /checkout/[product] collects phone+businessName+email before routing to PayPal subscription or Stripe card checkout, with metadata passed to both payment providers for webhook-triggered WhatsApp onboarding**

## Performance

- **Duration:** 18 min
- **Started:** 2026-03-15T00:00:00Z
- **Completed:** 2026-03-15
- **Tasks:** 2
- **Files modified:** 5 created, 0 modified

## Accomplishments
- Product config system with env-var-resolved PayPal plan IDs and Stripe price IDs (3 seed products)
- Pre-checkout page validates phone (8+ digits), business name, and email before enabling payment buttons
- PayPal subscription flow: JS SDK loads via script tag, custom_id carries compact JSON (phone+bn+svc, max 127 chars)
- Stripe flow: POST to /api/checkout/create-session with full metadata (phone, businessName, productName, serviceType)
- Branded success page with exact required message and WhatsApp expectation ("within 30 seconds")

## Task Commits

1. **Task 1: Checkout product config and Stripe session API** - `6968890c` (feat)
2. **Task 2: Pre-checkout page and success page** - `7e90ad9e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `apps/web/superseller-site/src/lib/checkout-config.ts` — product config registry with PayPal/Stripe IDs via env vars; exports getProductConfig() and getAllProducts()
- `apps/web/superseller-site/src/app/api/checkout/create-session/route.ts` — POST endpoint creating Stripe subscription session with phone+businessName metadata
- `apps/web/superseller-site/src/app/checkout/[product]/page.tsx` — server component loading product config, rendering branded layout with features + CheckoutForm
- `apps/web/superseller-site/src/app/checkout/[product]/CheckoutForm.tsx` — client component: form validation, PayPal SDK integration, Stripe redirect
- `apps/web/superseller-site/src/app/checkout/success/page.tsx` — static branded confirmation page with WhatsApp onboarding expectation

## Decisions Made
- PayPal custom_id uses compact keys (bn, svc) to stay under PayPal's 127 char limit
- CheckoutForm is 'use client' while page.tsx is a server component — standard Next.js App Router pattern
- Stripe server-side validates phone format (duplicate of client validation) for security
- Font confirmed as Outfit not Inter (layout.tsx uses Outfit)
- PayPal SDK loaded via script tag since @paypal/react-paypal-js is not in project dependencies

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- None — all patterns from existing codebase (paypal.ts, stripe-subscribe route) provided sufficient context

## User Setup Required

To activate products for new customers, add env vars:
- `NEXT_PUBLIC_PAYPAL_CLIENT_ID` — PayPal client ID for JS SDK (already likely set)
- `PAYPAL_PLAN_CONTENT_AUTOMATION`, `PAYPAL_PLAN_VIDEO_BUNDLE`, `PAYPAL_PLAN_GROWTH_STARTER` — PayPal plan IDs per product
- `STRIPE_PRICE_CONTENT_AUTOMATION`, `STRIPE_PRICE_VIDEO_BUNDLE`, `STRIPE_PRICE_GROWTH_STARTER` — Stripe price IDs per product

Payment buttons silently hide if the env vars are missing (graceful degradation).

## Next Phase Readiness
- Checkout pages are complete and ready for routing (link from pricing page to /checkout/[slug])
- PayPal and Stripe webhooks (plans 01 and 02) can now receive phone+businessName metadata from these pages
- Success page is static — WhatsApp group creation happens asynchronously via webhooks

---
*Phase: 12-payment-webhooks*
*Completed: 2026-03-15*
