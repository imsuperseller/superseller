# Phase 12: Payment Webhooks - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

PayPal and Stripe subscription webhooks auto-create tenant, provision service instances, and fire the onboarding pipeline — resulting in a WhatsApp group within seconds of payment, with no admin action required. Checkout page changes are included to collect required customer data (phone, business name) before payment.

</domain>

<decisions>
## Implementation Decisions

### Customer Data Flow
- Phone number collected at checkout via a pre-checkout page on superseller.agency
- Pre-checkout page collects: phone number, business name, email — then redirects to PayPal or Stripe
- Both PayPal and Stripe on same checkout page — customer chooses payment method
- Checkout page shows product name, price, and key features
- Checkout page matches superseller.agency brand styling
- Product info embedded in checkout metadata (productName, serviceType) — Claude's discretion on metadata vs plan ID mapping
- Tenant auto-created from webhook data (name from customer data, slug derived) — no manual pre-setup
- Tenant name source: Claude's discretion based on what payment providers give us
- Phone number validated at checkout (basic format check); if WAHA group creation fails later, admin alerted with customer email for manual follow-up

### Onboarding Trigger Chain
- Shared post-payment service: `ProvisioningService.onboardNewCustomer()` called by both PayPal and Stripe webhooks
- Worker creates WhatsApp group (not web app) — keeps webhook fast, retryable via BullMQ
- Web app communicates with worker via HTTP call to worker API endpoint (NOT direct BullMQ — Redis is local to RackNerd, unreachable from Vercel)
- Worker API endpoint auth: shared secret header (WORKER_API_SECRET env var, similar to existing CRON_SECRET pattern)
- Onboarding worker extended: if no groupId provided, creates WhatsApp group first (using group-bootstrap pattern), then continues with pipeline initialization — single job handles everything
- Both PayPal and Stripe get equal treatment — same shared service, same onboarding experience

### Idempotency & Retries
- DB unique constraint via new `webhook_events` Prisma table (provider, event_id unique)
- Webhooks always return 200 (ACK immediately) — internal retry via BullMQ with exponential backoff
- 3 retries before alerting admin (matches existing module failure pattern)
- PayPal signature verification mandatory (reject if PAYPAL_WEBHOOK_ID missing — current code silently skips)
- PayPal's existing /v1/notifications/verify-webhook-signature API call is sufficient — Claude's discretion on whether to add local HMAC

### Admin Visibility
- Fully automatic: payment → Tenant + group created → onboarding fires immediately, no admin gate
- Rich single WhatsApp notification to Shai: customer name, amount, product, phone, AND onboarding group link
- On failure (3 retries exhausted): WhatsApp alert + admin retry command pattern (existing APPROVE/RETRY/SKIP/PAUSE)

### Webhook Migration Strategy
- Additive only: existing webhook behavior stays intact, new onboarding trigger is ADDED after existing steps
- Shared service handles: Tenant creation, ServiceInstance, User/TenantUser linking, onboarding trigger
- Stripe webhook keeps: Subscription record, invoice PDF, email, admin project update, n8n forward
- PayPal webhook gets same shared service call (currently only does Subscription CRUD)

### Multi-Product Edge Case
- Same customer email subscribes to second product: find existing Tenant, create new ServiceInstance
- Same WhatsApp group, new modules added to pipeline (not a new group per product)
- Products with no onboarding modules: Claude's discretion (aligned with "every customer gets a WhatsApp group from Day 1" principle)

### Post-Payment Flow
- Branded success page at superseller.agency/checkout/success
- Static message: "Payment confirmed! You'll receive a WhatsApp group invitation within 30 seconds."
- No live status polling — customer checks WhatsApp on their own

### Database Schema
- New `webhook_events` table in Prisma schema: id, provider, event_id, event_type, processed_at, payload JSONB — unique on (provider, event_id)
- Tenant settings JSONB for payment/onboarding metadata: Claude's discretion on columns vs JSONB (existing pattern uses settings JSONB for stripeSubscriptionId)

### Deployment Order
- Ship order: 1) Worker API endpoint + onboarding extension → 2) Webhook changes (add shared service call) → 3) Checkout page
- Worker ready before webhooks try to call it

### Monitoring
- Worker onboarding endpoint added to health check monitoring system
- Webhook processing metrics (success rate, recent failures) added to existing System Monitor admin tab
- Webhook failures: console.error + WhatsApp alert + metrics in webhook_events table

### Claude's Discretion
- Product info: metadata vs plan ID mapping approach
- Tenant name derivation from payment data
- PayPal HMAC verification (API call likely sufficient)
- Checkout page: new /checkout/[product] page vs extending existing routes
- No-module products: create group + welcome only (aligns with core value)
- Tenant settings: JSONB vs proper columns for payment metadata
- Exact checkout page component structure and layout

</decisions>

<specifics>
## Specific Ideas

- Pre-checkout page with both PayPal + Stripe on same page — customer picks payment method after filling in phone + business name + email
- Success criteria explicitly require "within seconds" — webhook → group creation must be fast
- Existing Stripe webhook already has a 9-step post-payment flow that must not break (additive approach)
- Worker already has group-bootstrap pattern in character-pipeline that can be reused

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/worker/src/services/character-pipeline/group-bootstrap.ts`: WhatsApp group creation + agent registration pattern — reuse for onboarding group creation
- `apps/worker/src/queue/workers/onboarding.worker.ts`: BullMQ worker that handles pipeline initialization, module selection, stale detection — extend with group creation capability
- `apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts`: Full Stripe webhook handler with 9-step post-payment flow — add shared service call
- `apps/web/superseller-site/src/app/api/webhooks/paypal/route.ts`: PayPal webhook with signature verification — add shared service call
- `apps/web/superseller-site/src/lib/services/ProvisioningService.ts`: Already imported in PayPal webhook — extend for onboarding trigger
- `apps/worker/src/api/routes.ts`: Worker API routes — add onboarding trigger endpoint

### Established Patterns
- WAHA client (`waha-client.ts`): createGroup, sendText, sendPoll — proven
- Pipeline state (`pipeline-state.ts`): upsertPipelineState with idempotent checks
- BullMQ queues (`queues.ts`): customerOnboardingQueue with OnboardingJobData type
- Admin notifications via WhatsApp: notifyAdmin() pattern in onboarding worker
- CRON_SECRET auth pattern: shared secret for internal API calls

### Integration Points
- Webhook handlers (Next.js API routes) → HTTP call → Worker API endpoint → BullMQ queue
- Worker creates WhatsApp group via WAHA → registers agent → sends welcome + module poll
- Redis on RackNerd (127.0.0.1:6379) — NOT accessible from Vercel, hence HTTP approach
- Prisma schema for new webhook_events table
- System Monitor admin tab for webhook metrics

</code_context>

<deferred>
## Deferred Ideas

- Admin portal "Webhook Events" tab — full UI for browsing webhook history (Phase 12 adds metrics to System Monitor only)
- Live status polling on success page — real-time "Creating your group..." progress
- Upstash/managed Redis for direct BullMQ from Vercel — would enable direct enqueue but adds cost
- Google/Apple Pay webhook support — out of scope per requirements

</deferred>

---

*Phase: 12-payment-webhooks*
*Context gathered: 2026-03-15*
