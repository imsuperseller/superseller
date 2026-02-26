---
name: customer-journey
description: >-
  Customer journey and onboarding pipeline for SuperSeller AI SaaS. Covers the 4-stage funnel
  (Awareness → Purchase → Onboarding → Retention), Stripe webhook provisioning,
  magic-link auth, customer portals, dashboard tabs, entitlements, and lifecycle automation.
  Use when working on onboarding, customer dashboard, provisioning, entitlements,
  subscription management, or customer lifecycle. Not for admin portal, video pipeline,
  or landing page content.
  Example: "Wire provisioning for the new Studio product" or "Add a dashboard tab for leads".
autoTrigger:
  - "onboarding"
  - "provisioning"
  - "customer journey"
  - "entitlements"
  - "customer dashboard"
  - "ProvisioningService"
  - "subscription management"
  - "customer portal"
  - "dashboard tab"
  - "magic-link"
  - "ServiceInstance"
negativeTrigger:
  - "admin portal"
  - "video pipeline"
  - "TourReel"
  - "landing page content"
  - "FB Marketplace"
  - "UI design"
---

# Customer Journey & Onboarding

## Critical
- **Provisioning is webhook-driven** — Stripe `checkout.session.completed` triggers `ProvisioningService`. Never provision manually.
- **Three provisioning paths** — marketplace-template, managed-plan, registry-driven. Each has different flows.
- **Entitlements are JSON in User model** — `User.entitlements.engines[]` tracks active services. Always update atomically.
- **Dashboard tabs are dynamic** — shown/hidden based on user entitlements. Never hardcode tab visibility.
- **Magic-link auth** — 30-day session, encrypted AES-256-GCM cookie `superseller_client_session`.
- **Current status**: Purchase → Onboarding is ~40-60% automated. Customer portals NOT built yet.

## 4-Stage Funnel

```
Stage 1: AWARENESS → PURCHASE
  ✅ SEO, pricing pages, Stripe checkout (LIVE)

Stage 2: PURCHASE → ONBOARDING
  ⚠️ 40-60% automated
  Stripe webhook → ProvisioningService → Email notifications
  Missing: guided onboarding wizard, progress tracking

Stage 3: ONBOARDING → ACTIVE
  ❌ NOT BUILT
  Missing: customer portal, self-service, asset management

Stage 4: ACTIVE → RETENTION
  ❌ NOT BUILT
  Missing: lifecycle automation, churn prevention, upsell triggers
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/superseller-site/src/app/api/webhooks/stripe/route.ts` | Stripe webhook handler (100+ lines) |
| `apps/web/superseller-site/src/lib/services/ProvisioningService.ts` | 3-path provisioning orchestrator (150+ lines) |
| `apps/web/superseller-site/src/lib/auth.ts` | Magic-link session auth (AES-256-GCM) |
| `apps/web/superseller-site/src/lib/email.ts` | Email templates (11 types) via Resend (80+ lines) |
| `apps/web/superseller-site/src/app/(main)/dashboard/[clientId]/page.tsx` | Customer dashboard page |
| `apps/web/superseller-site/src/app/(main)/dashboard/[clientId]/ClientDashboardClient.tsx` | Dashboard client (100+ lines) |

## Provisioning Flows

### 1. Marketplace Template (`marketplace-template`)
```
Stripe webhook → generate download token → Create Purchase record
  → Update ServiceInstance → Sync User.entitlements.engines
  → Send download email via Resend
```

### 2. Managed Plan (`managed-plan`)
```
Stripe webhook → Create Subscription (Stripe-linked)
  → Create WhatsAppInstance → Add to User.entitlements.engines
  → Enable WhatsApp bundle
```

### 3. Registry-Driven (dynamic products)
```
Stripe webhook → Fetch product from registry
  → Apply feature flags via entitlements
  → Create ServiceInstance → Update User.activeServices
```

## Customer Dashboard Tabs (7)

| Tab | Component | Shows When |
|-----|-----------|-----------|
| Leads | LeadsTab.tsx | Always |
| Outreach | OutreachTab.tsx | Has outreach entitlement |
| Secretary | SecretaryTab.tsx | Has WhatsApp/voice entitlement |
| Content | ContentTab.tsx | Has content entitlement |
| Knowledge | KnowledgeTab.tsx | Has RAG entitlement |
| Solutions | SolutionsTab.tsx | Has purchased solutions |
| Earnings | EarningsTab.tsx | Has affiliate program |

## User Entitlements Structure

```typescript
User.entitlements = {
  engines: [{
    id: string,
    solutionId: string,
    name: string,
    status: "active" | "suspended" | "cancelled",
    type: string,
    activatedAt: Date
  }],
  pillars: [],      // Feature flags
  activeServices: {
    marketplace: boolean,
    whatsapp: boolean,
    subscriptions: boolean,
    custom_solutions: boolean,
    care_plan: boolean
  }
}
```

## ServiceInstance Lifecycle

```
pending_setup → configuring → provisioning → active → suspended / cancelled
```

| Status | Meaning |
|--------|---------|
| pending_setup | Stripe payment received, awaiting config |
| configuring | Customer providing details |
| provisioning | System setting up resources |
| active | Live and operational |
| suspended | Payment issue or manual hold |
| cancelled | Terminated |

## Email Templates (Resend)

| Template | Trigger |
|----------|---------|
| `welcome` | First-time signup |
| `download-delivery` | Template purchase |
| `fulfillment-started` | Service onboarding begins |
| `fulfillment-complete` | System goes live |
| `subscription-renewal` | Recurring billing |
| `support-ticket` | Support case created |
| `invoice-receipt` | Payment confirmation |
| `retention-reengagement` | Win-back |
| `system-alert` | Monitoring alerts |
| `marketplace-posted` | FB listing live |
| `marketplace-failed` | Posting failure + refund |

## Database Models

| Model | Purpose |
|-------|---------|
| `User` | Identity, entitlements, activeServices |
| `Subscription` | Stripe-linked recurring (type: whatsapp/care_plan/content_ai) |
| `Payment` | Invoice + payment history |
| `ServiceInstance` | Per-product instance with lifecycle status |
| `Purchase` | One-time purchases (templates) |
| `OnboardingRequest` | Pending onboarding approvals |

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| Webhook returns 400 | Stripe signature verification failed | Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard |
| Provisioning doesn't trigger | Event type not handled | Check webhook handler — only `checkout.session.completed` is processed |
| Dashboard shows no tabs | User.entitlements empty or malformed | Query user, check entitlements JSON structure |
| Magic link expired | >30 days since last login | User must re-request magic link |
| ServiceInstance stuck in pending_setup | Provisioning flow errored | Check logs, manually transition via admin |
| Email not sent | Resend API key invalid or sender unverified | Verify sender domain in Resend dashboard |

## References

- `PRODUCT_BIBLE.md` — Subscription tiers, credit allocations
- `stripe-credits` skill — Detailed Stripe integration
- NotebookLM 719854ee — SuperSeller AI website customer-facing content
