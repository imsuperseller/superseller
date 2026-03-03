# Data Dictionary — Where Everything Lives

> **Authority**: This document is the single reference for "where does X data live?" across all SuperSeller AI systems.
> **Last updated**: 2026-03-02
> **Rule**: PostgreSQL is the SSOT for all transactional data. External stores are mirrors or caches.

---

## Storage Systems

| System | Role | What Goes Here | What Does NOT Go Here |
|--------|------|---------------|----------------------|
| **PostgreSQL** | Primary SSOT | All transactional data: users, payments, leads, jobs, credits, subscriptions, services, configs | Raw media files, ephemeral job state |
| **Aitable.ai** | Dashboard mirror | Read-only dashboards for leads, clients, products, payments, LLM costs | Never write from Aitable back to Postgres |
| **Redis** | Ephemeral cache | BullMQ job queues, sessions, rate limits | Persistent business data |
| **Cloudflare R2** | Media storage | Videos, clips, frames, thumbnails, generated images | Metadata (stored in Postgres with R2 URLs) |
| **Firebase Storage** | Legacy (storage only) | Onboarding certificates (deprecated — migrate to R2) | Everything else (Firestore fully removed Feb 2026) |
| **Ollama** | Stateless compute | Nothing persistent — embedding requests only | Data (vectors stored in Postgres pgvector) |
| **NotebookLM** | Reference docs | Specs, methodology, pipeline docs, B.L.A.S.T. | Runtime data, configs, credentials |
| **n8n** | Backup automation | Webhook receivers, reference workflows | Primary automation (use Antigravity) |
| **PayPal** | Billing SSOT | Subscriptions, payments, invoices, refunds | Customer profiles (mirrored to Postgres). Note: DB columns keep `stripe*` names but store PayPal IDs (intentional — avoids migration risk). |

---

## Sync Rules

| Direction | Trigger | Frequency | Failure Handling |
|-----------|---------|-----------|-----------------|
| **Postgres -> Aitable** | Sync scripts (`tools/sync_leads_to_aitable.js`, etc.) | Manual / scheduled (needs cron) | `Lead.syncedToAITable` flag tracks state |
| **PayPal -> Postgres** | Webhook (`/api/paypal/webhook`) | Real-time on payment events | PayPal IPN retry (built-in) |
| **Worker -> Postgres** | Direct DB writes (Drizzle) | Real-time during job processing | Job marked `failed` with error |
| **Postgres -> R2** | Upload during video pipeline | Per-job | `jobs.finalR2Key` stores URL |
| **Postgres -> Redis** | BullMQ `queue.add()` | Per-job creation | Job metadata persists in Postgres |

**Conflict resolution**: If data exists in both Postgres and an external store and they differ, **Postgres wins**. External stores are mirrors.

---

## Entity-to-Store Mapping

### Group 0: Multi-Tenancy

| Entity | Postgres Table | Prisma Model | Drizzle Table | Aitable | Notes |
|--------|---------------|-------------|--------------|---------|-------|
| Business Account | `Tenant` | `Tenant` | `tenants` | -- | Shared table — manual sync required |
| User-Tenant Link | `TenantUser` | `TenantUser` | `tenantUsers` | -- | Shared table — manual sync required |

### Group 1: Auth & Identity

| Entity | Postgres Table | Prisma Model | Drizzle Table | Aitable | Notes |
|--------|---------------|-------------|--------------|---------|-------|
| User/Customer | `User` | `User` | `users` | `CLIENTS` (mirror) | **CRITICAL shared table** — Prisma has 40+ fields, Drizzle has 25 |
| OAuth Account | `Account` | `Account` | -- | -- | Future use (NextAuth) |
| Session | `Session` | `Session` | -- | -- | Future use (NextAuth) |
| Verification Token | `VerificationToken` | `VerificationToken` | -- | -- | Future use (NextAuth) |
| Magic Link | `MagicLinkToken` | `MagicLinkToken` | -- | -- | Custom auth |
| Legacy Client | `CustomSolutionsClient` | `CustomSolutionsClient` | -- | -- | Deprecated — backward compat only |
| Branding Record | `Client` | `Client` | -- | -- | Legacy — testimonials link only |

### Group 2: Payments & Purchases

| Entity | Postgres Table | PayPal | Aitable | Notes |
|--------|---------------|--------|---------|-------|
| Payment Event | `Payment` | Payment (SSOT) | `PAYMENTS` (mirror) | Postgres mirrors PayPal via webhook. DB column `stripeSessionId` stores PayPal payment ID. |
| Purchase | `Purchase` | -- | -- | Marketplace download tokens |
| Download Event | `Download` | -- | -- | Analytics tracking |

### Group 3: Services & Subscriptions

| Entity | Postgres Table | PayPal | n8n | Notes |
|--------|---------------|--------|-----|-------|
| Service Instance | `ServiceInstance` | -- | `n8nWorkflowId` ref | Active service deployments |
| Subscription | `Subscription` | Subscription (SSOT) | -- | PayPal owns lifecycle; Postgres mirrors. DB column `stripeSubscriptionId` stores PayPal subscription ID. |
| Care Plan | `CarePlanDeliverable` | -- | -- | Monthly deliverable tracking |
| Service Blueprint | `ServiceManifest` | `stripeProductId` ref (stores PayPal product ID) | `n8n.webhookId` ref | Reusable templates |

### Group 4: Marketplace & Solutions

| Entity | Postgres Table | Aitable | Notes |
|--------|---------------|---------|-------|
| Template | `Template` | `MASTER_PRODUCTS` (mirror) | Product catalog |
| Customization Request | `CustomizationRequest` | -- | Per-template |
| Solution | `Solution` | `SOLUTIONS` (mirror) | Outcome-focused products |
| Solution Instance | `SolutionInstance` | -- | Per-client deployment |

### Group 5: WhatsApp AI

| Entity | Postgres Table | External | Notes |
|--------|---------------|----------|-------|
| WhatsApp Instance | `WhatsAppInstance` | WAHA (`wahaInstanceId`) | Per-customer agent |
| Message | `WhatsAppMessage` | -- | Speed-to-lead tracking |
| Appointment | `AppointmentBooking` | Calendar (`calendarEventId`) | TidyCal/Calendly/Google |

### Group 6: Leads & Outreach

| Entity | Postgres Table | Aitable | Notes |
|--------|---------------|---------|-------|
| Lead | `Lead` | `LEADS` (mirror) | `syncedToAITable` tracks sync state |
| Lead Request | `LeadRequest` | -- | Free-trial requests |
| Outreach Campaign | `OutreachCampaign` | `CAMPAIGNS` (mirror) | Multi-channel campaigns |
| Response Metrics | `ResponseTimeMetrics` | -- | Monthly KPIs |

### Group 7: Dashboard & Content

| Entity | Postgres Table | External | Notes |
|--------|---------------|----------|-------|
| Usage Log | `UsageLog` | -- | Agent execution logs |
| Content Post | `ContentPost` | -- | Blog/social content |
| Indexed Document | `IndexedDocument` | pgvector (embeddings) | RAG knowledge base |
| Secretary Config | `SecretaryConfig` | n8n (`n8nWebhookId`) | Voice/WhatsApp AI config |
| Voice Call Log | `VoiceCallLog` | -- | Call data as JSON |

### Group 8: Admin & Support

| Entity | Postgres Table | Notes |
|--------|---------------|-------|
| Support Case | `SupportCase` | AI-assisted resolution |
| Approval Request | `ApprovalRequest` | Workflow approvals |
| Testimonial | `Testimonial` | Links to legacy `Client` model |
| Onboarding Request | `OnboardingRequest` | Solution setup forms |
| Audit Trail | `Audit` | System-level logging |
| Service Health | `ServiceHealth` (`service_health`) | Monitoring results (30-day TTL) |
| Alert Rule | `AlertRule` (`alert_rules`) | Threshold config |
| Alert History | `AlertHistory` (`alert_history`) | Fired alerts |
| API Expense | `ApiExpense` (`api_expenses`) | Per-call cost tracking |
| Launch Task | `LaunchTask` | Pre-launch checklist |
| Proposal | `Proposal` | AI-generated proposals |
| Scorecard | `Scorecard` | Qualification results |
| Consultation | `Consultation` | Discovery calls, proposals |
| Requirement | `Requirement` | Business requirements |
| Optimizer Audit | `OptimizerAudit` | Workflow audit results |
| Admin Chat | `AdminConversation` | Terry AI history |
| Agent Memory | `N8nAgentMemory` | n8n persistent memory |

### Group 9: Credits & Billing

| Entity | Postgres Table | Prisma Model | Drizzle Table | Notes |
|--------|---------------|-------------|--------------|-------|
| Entitlement | `entitlements` | `Entitlement` | `entitlementsTable` | **Shared table** — credits balance, plan, status |
| Usage Event | `usage_events` | `UsageEvent` | `usageEvents` | **Shared table** — type column name differs (`event_type` vs `type`) |
| LLM Model Config | `llm_model_configs` | `LlmModelConfig` | -- | Cost registry, seeded with 8 models |
| Notification | `notifications` | `Notification` | -- | Multi-channel (in_app, whatsapp, email, push) |

### Group 10: Business Config

| Entity | Postgres Table | Notes |
|--------|---------------|-------|
| Business Niche | `BusinessNiche` | Industry templates with WhatsApp FAQs |
| Vault Item | `VaultItem` | Encrypted secrets (replaces Firestore) |
| Analytics | `Analytics` | Generic analytics events |

### Video Pipeline (Worker-only)

| Entity | Drizzle Table | Prisma Model | R2 | Notes |
|--------|--------------|-------------|-----|-------|
| Video Job | `jobs` | -- | `finalR2Key` -> video URL | Main pipeline job |
| Asset | `assets` | -- | `r2Key` -> media URL | Floorplans, photos, clips |
| Clip | `clips` | -- | `resultR2Key` -> clip URL | Individual video segments |
| Stripe Customer | `stripeCustomers` | -- | -- | 1:1 user mapping (worker-only) |
| System Settings | `systemSettings` | -- | -- | Global config key-value |

---

## Aitable.ai Datasheets

| Datasheet | ID | Postgres Source | Sync Direction | Sync Script |
|-----------|----|----------------|----------------|-------------|
| Expenses | `dstCyqF689UtB92Zgx` | `ApiExpense` | Postgres -> Aitable | Manual |
| LLM Registry | `dstQm1dje81lWkUPkZ` | `LlmModelConfig` | Postgres -> Aitable | Manual |
| Leads | `dstbftVH9AdzDKcu70` | `Lead` | Postgres -> Aitable | `tools/sync_leads_to_aitable.js` |
| Clients | `dst1zXPh3cf72vKpmR` | `User` | Postgres -> Aitable | `tools/sync_extended_to_aitable.js` |
| Campaigns | `dstt7Keh14AkVXF0Vl` | `OutreachCampaign` | Postgres -> Aitable | Manual |
| Knowledge | `dstxq3xnpvu7XY37bT` | `IndexedDocument` | Postgres -> Aitable | Manual |
| Master Registry | `dstwsqbXSmK5wYMmeQ` | `ServiceManifest` | Postgres -> Aitable | Manual |
| Master Products | `dstGdPYy6nNTVq9Jiq` | `Template` | Postgres -> Aitable | `tools/sync_products_to_aitable.js` |
| Payments | `dstjnQPSkUBffmb5gM` | `Payment` | Postgres -> Aitable | Manual |
| Solutions | `dstBYSsqrzrdrFJ1wP` | `Solution` | Postgres -> Aitable | Manual |

**All syncs are one-way (Postgres -> Aitable). Aitable is read-only for dashboards. Never write from Aitable back to Postgres.**

---

## Prisma <-> Drizzle Shared Tables: Known Mismatches

| Table | Field | Prisma Type | Drizzle Type | DB Actual | Risk | Status |
|-------|-------|------------|-------------|-----------|------|--------|
| User | `emailVerified` | `Boolean?` | `timestamp("email_verified")` | Boolean | Type mismatch | **Needs fix** |
| User | `id` | `@db.Uuid` | `uuid("id")` | text (no UUID constraint) | Schema drift | **Needs fix** |
| User | `role` | `UserRole` enum | `text("role")` | text | Compatible (Prisma @map handles) | OK |
| User | `n8nInstance` | `Json?` | Missing | JSON | Worker never reads | OK |
| User | `defaultPaymentMethodId` | `String?` | Missing | text | Worker never reads | OK |
| User | `billingAddress` | `Json?` | Missing | JSON | Worker never reads | OK |
| UsageEvent | `type` | `@map("event_type")` | `text("type")` | `event_type` column | Column name differs but both work | OK |
| Entitlement | `creditsBalance` | `Int` | `numeric("credits_balance")` | numeric | Int vs numeric — could truncate decimals | **Review** |

---

## External System IDs (scattered across tables)

| External System | Where Referenced | ID Field |
|----------------|-----------------|----------|
| **PayPal** | `User.stripeCustomerId` (stores PayPal ID), `Payment.stripeSessionId` (stores PayPal payment ID), `Subscription.stripeSubscriptionId` (stores PayPal sub ID), `Template.stripeProductId` (stores PayPal product ID) | PayPal IDs (`I-*` subscriptions, `PROD-*` products, `P-*` plans). Note: DB columns retain `stripe*` names — this is intentional per DECISIONS.md #19. |
| **n8n** | `ServiceInstance.n8nWorkflowId`, `SecretaryConfig.n8nWebhookId`, `Template.n8nWorkflowId`, `WhatsAppInstance.n8nWorkflowId` | n8n workflow/webhook IDs |
| **WAHA** | `WhatsAppInstance.wahaInstanceId` | WAHA instance ID |
| **Kie.ai** | `clips.kieTaskId`, `jobs.musicTaskId` | Kie task IDs |
| **Calendar** | `AppointmentBooking.calendarEventId` | TidyCal/Calendly/Google event IDs |
| **Aitable** | `Lead.syncedToAITable` (boolean flag) | Boolean only (no Aitable record ID stored) |

---

## Data Retention (NEEDS POLICY)

| Data Type | Current Retention | Recommended |
|-----------|------------------|-------------|
| `ServiceHealth` | 30 days (cleanup exists) | 30 days OK |
| `AlertHistory` | Unbounded | 90 days |
| `ApiExpense` | Unbounded | 1 year |
| `UsageLog` | Unbounded | 1 year |
| `Audit` | Unbounded | 6 months |
| R2 Videos | 1 year cache header | Define explicit cleanup |
| Redis job state | BullMQ TTL (7 days complete, 30 days failed) | OK |
| `AdminConversation` | Unbounded | 6 months |

---

## Quick Lookup: "Where is X?"

| Question | Answer |
|----------|--------|
| Where is customer data? | `User` table (Prisma + Drizzle). Mirrored to Aitable `CLIENTS`. |
| Where are credits/balance? | `entitlements` table (Prisma `Entitlement` + Drizzle `entitlementsTable`). |
| Where are payments? | PayPal (SSOT) + `Payment` table (Postgres mirror) + Aitable `PAYMENTS` (dashboard). |
| Where are leads? | `Lead` table (Postgres SSOT). Mirrored to Aitable `LEADS` via sync script. |
| Where are videos? | R2 (media files). `jobs` + `clips` + `assets` tables (metadata, Drizzle only). |
| Where are subscriptions? | PayPal (lifecycle SSOT) + `Subscription` table (Postgres mirror). DB column `stripeSubscriptionId` stores PayPal subscription ID. |
| Where are templates? | `Template` table (Postgres). Mirrored to Aitable `MASTER_PRODUCTS`. |
| Where are API costs? | `api_expenses` table (Postgres). Mirrored to Aitable `EXPENSES`. |
| Where are LLM configs? | `llm_model_configs` table (Postgres). Mirrored to Aitable `LLM_REGISTRY`. |
| Where is agent memory? | `N8nAgentMemory` table (Postgres). |
| Where are secrets/keys? | `VaultItem` table (encrypted). Env vars in Vercel/RackNerd. |
| Where are embeddings? | `documents` table with pgvector column (Postgres). Computed by Ollama. |
