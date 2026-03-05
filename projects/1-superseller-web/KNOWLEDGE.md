# Project 1: SuperSeller Web — Knowledge Base

## Architecture Overview

SuperSeller Web is a Next.js 14+ application deployed on Vercel. It serves as the SaaS platform for SuperSeller AI, handling:
- **Public website**: Landing pages, pricing, blog at superseller.agency
- **Admin portal**: admin.superseller.agency — CRM, monitoring, treasury, workflow management
- **Customer portals**: *.superseller.agency subdomain routing via middleware
- **API layer**: 80+ endpoints consumed by the worker, external services, and the frontend
- **Studio app**: apps/studio/ — Winner Studio frontend

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Auth**: NextAuth.js with magic-link authentication
- **ORM**: Prisma (PostgreSQL + pgvector)
- **Payments**: PayPal (migrated from Stripe Feb 2026; DB columns keep `stripe*` names but store PayPal IDs)
- **i18n**: next-intl (7 locales: en, he, fa, cs, hu, hi, ko)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (auto-deploy on git push for api.superseller.agency)

## Key Patterns

### Multi-Tenant Routing
- Middleware extracts subdomain from `*.superseller.agency`
- Admin subdomain → admin routes
- Other subdomains → tenant portal routes (`/portal/[slug]/`)
- `Tenant` + `TenantUser` tables for tenant isolation

### i18n
- Path-based routing with `localePrefix: 'as-needed'` (English has no prefix)
- RTL support for Hebrew (he) and Farsi (fa)
- Message files in `messages/{locale}.json` (103 keys each)
- Config: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`

### Credit System
- Three tiers: Starter ($79/mo, 30 credits), Growth ($149/mo, 75 credits), Agency ($299/mo, 200 credits)
- Credit ledger in PostgreSQL with debit/credit transactions
- PayPal webhook triggers provisioning on subscription activation
- `src/lib/credits.ts` for web-side credit operations

### API Expense Tracking
- Every API generation MUST call `trackExpense()` in `src/lib/monitoring/expense-tracker.ts`
- Rates: Kling Pro $0.10, Std $0.03, Suno $0.06, Nano $0.09, Gemini $0.001
- Stored in `api_expenses` table with anomaly detection

### Admin Portal (8 tabs)
- CRM, System Monitor, Treasury, Workflows, AI Agents, Content, Settings, Progress Hub
- ~70 admin components, 98+ API routes
- Magic-link auth for admin access

## Database Tables Owned
All Prisma-managed tables, notably:
- User, Account, Session, VerificationToken (auth)
- Tenant, TenantUser (multi-tenancy)
- Subscription, UsageLog (billing)
- Lead, ServiceInstance (CRM)
- ContentPost, VoiceCallLog (features)
- ApiExpense (cost tracking)
- AiModel, AiModelRecommendation (model observatory — shared with worker reads)

**NOTE**: Job and Clip tables are Drizzle-only (worker). They do NOT exist in Prisma. The web app accesses job data via the worker's HTTP API, not direct DB queries.

## API Contracts

### Exposed (consumed by worker)
- `POST /api/credits/debit` — deduct credits for a generation
- `GET /api/health` — platform health status
- `POST /api/webhooks/paypal` — PayPal IPN handler
- `GET /api/admin/*` — admin data endpoints

### Consumed (from worker)
- `http://172.245.56.50:3002/api/health` — worker health
- Worker BullMQ job completion callbacks

## Content Rules
- NEVER invent content for customer-facing pages
- Extract verbatim from strategy docs
- If content doesn't exist in docs, leave it empty
- Cite source in seed scripts
