# Firestore Removal — Migration Complete (Feb 2026)

**Status**: Postgres is the sole data store. Firestore is no longer used.

## What Changed

1. **Admin dashboard** — Stats from `User`, `Payment`, `ServiceInstance`, `Audit` (Postgres)
2. **User dashboard** — All data from `User`, `Lead`, `UsageLog`, `OutreachCampaign`, etc. (Postgres)
3. **Auth** — Magic link and session use Postgres only
4. **ServiceAuditAgent** — Logs to `Audit` table (Postgres)
5. **ProvisioningService** — Postgres only (no Firestore backup)
6. **Marketplace** — Templates, downloads, checkout use Postgres only
7. **Blog** — Content from `ContentPost` (Postgres)

## Routes Still Using Firestore Stub (will throw at runtime until migrated)

These import `getFirestoreAdmin`/`COLLECTIONS`. A stub throws. Migrate to Postgres when used:

- `api/admin/products/create`, `api/admin/testimonials`, `api/admin/testimonials/approve`
- `api/admin/launch-tasks/seed`, `api/admin/n8n/agent`, `api/admin/terry/chat`, `api/admin/seed`
- `api/content/generate`, `api/fulfillment/finalize`, `api/fulfillment/initiate`
- `api/free-leads/request`, `api/webhooks/usage`, `api/custom-solutions/intake`
- `api/knowledge/index`, `api/support/create`, `api/support/update`, `api/support/list`
- `api/dashboard/sync-usage`, `api/secretary/config`, `api/secretary/lookup`
- `api/payment/create`, `api/payment/confirm`
- `api/proposals/generate`
- `lib/services/UsageService`

## Marketplace vs Entitlements

- **Marketplace**: Workflow template sales (n8n JSON, one-time). Active product at `/marketplace`. Data in `Template`, `Purchase`, Stripe `marketplace-template`. NOT legacy — current product.
- **Entitlements**: Access flags on `User.entitlements` JSON — pillars (Lead Machine, Secretary, Content, Knowledge), engines, `customSolution`, `marketplaceProducts`, `creditsBalance`. Drives dashboard tab visibility. Mix of legacy (pillars, customSolution) and current (engines, creditsBalance).

## Stripe

- **Always use env vars**: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Never hardcode keys** in code or commits.
