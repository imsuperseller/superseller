# Firestore → PostgreSQL Migration Plan

**Status**: Not started  
**Created**: Feb 2026  
**Scope**: ~55 files, multi-day project  
**Reference**: CODEBASE_CONSISTENCY_MASTER_PLAN Phase 3, CLAUDE.md

---

## 1. Current State

### Firestore Collections (from firebase-admin.ts + grep)

| Collection | Used In | Domain |
|------------|---------|--------|
| **users** | dashboard, admin/clients, entitlements, billing, impersonate, magic-link, checkout, content/generate, free-leads | Core |
| **customSolutionsClients** | admin, dashboard, magic-link, ProvisioningService | Legacy |
| **clients** | admin onboarding approve | Legacy |
| **templates** | checkout, admin/seed | Marketplace |
| **service_instances** | fulfillment, admin/projects, app/dashboard, app/agents | Fulfillment |
| **whatsapp_instances** | admin/projects, ProvisioningService | WhatsApp |
| **subscriptions** | admin/financials, billing, ProvisioningService | Billing |
| **usage_logs** | dashboard, sync-usage, UsageService, app/runs | Usage |
| **leads** | dashboard, admin/seed | Leads |
| **payments** | webhooks/stripe, billing | Payments |
| **content_posts** | blog, admin/seed, content/generate | Content |
| **secretary_configs** | secretary/lookup, secretary/config, dashboard | Secretary |
| **testimonials** | admin/testimonials | Marketing |
| **audits** | admin, ServiceAuditAgent | Audit |
| **magicLinkTokens** | auth/magic-link | Auth |
| **proposals** | proposals/generate | Sales |
| **onboarding_requests** | onboarding, fulfillment, admin/onboarding | Onboarding |
| **approvals** | app/approvals (client-side) | Approvals |
| **n8n_agent_memory** | admin/n8n/agent | Agent |
| **admin_conversations** | admin/terry/chat | Admin |
| **indexed_documents** | knowledge/index, dashboard | Knowledge |
| **outreach_campaigns** | dashboard, admin/seed | Outreach |
| **voice_call_logs** | dashboard | Voice |
| **restricted/*/items** | VaultManagement (client-side) | Vault |
| **secrets** | admin/onboarding approve | Secrets |

### Prisma Current State

- **Provider**: SQLite (via DATABASE_URL)
- **Models**: Account, Session, User, VerificationToken (NextAuth only)
- **Location**: apps/web/rensto-site/prisma/schema.prisma
- **Missing**: All business entities

### Types

- src/types/firestore.ts – 25+ interfaces
- Map 1:1 to Firestore document shapes

---

## 2. Target Architecture

- **PostgreSQL** – Primary for all relational data
- **Redis** – Sessions, rate limits, queues (separate)
- **Firestore** – Deprecated; remove after migration

---

## 3. Migration Strategy

### Option A: Dual-Write (Recommended)

1. Add Prisma + Postgres; keep Firestore
2. Create lib/db.ts with Prisma client
3. Migrate one domain at a time; dual-write
4. Read from Postgres when ready; fallback Firestore
5. Env: READ_FROM_POSTGRES=true per domain
6. Remove Firestore when verified

### Option B: Big-Bang

Export Firestore → load Postgres → deploy. Higher risk.

---

## 4. Order of Work

| Phase | Domain | Est. Time |
|-------|--------|-----------|
| 3.1 | Foundation: Prisma schema (users, clients), lib/db.ts | Day 1 |
| 3.2 | Users: admin/clients, entitlements, magic-link | Day 2 |
| 3.3 | Payments & checkout: Stripe webhook, templates | Day 3 |
| 3.4 | Fulfillment: service_instances, onboarding | Day 4 |
| 3.5 | Subscriptions & billing | Day 5 |
| 3.6 | Usage, leads, content, secretary, testimonials, audits, etc. | Days 6–8 |
| 3.7 | Cleanup: remove Firestore | Day 9 |

---

## 5. File Inventory (~55 files)

**Libs**: firebase-admin.ts, firebase-client.ts, ProvisioningService, UsageService, ServiceAuditAgent  
**API routes**: 25+ (admin, auth, billing, checkout, dashboard, fulfillment, secretary, etc.)  
**Pages**: admin, dashboard, app/dashboard, app/approvals, app/runs, app/agents, blog, solutions/onboarding

---

## 6. Prerequisites

- [ ] Neon Postgres (via Vercel Marketplace – Vercel Postgres retired Dec 2024)
- [ ] DATABASE_URL in Vercel
- [ ] Firestore export/backup before migration

---

## 7. References

- CODEBASE_CONSISTENCY_MASTER_PLAN.md (Phase 3)
- firestore/FIRESTORE_TECHNICAL_SUMMARY.md
- apps/web/rensto-site/src/types/firestore.ts
- CLAUDE.md (Data storage matrix)
