# Repo Map — Codebase Structure Index

**Last Updated**: February 2026
**Purpose**: Directed search index — find any key file in 1 lookup instead of 3+ Glob attempts.

---

## Live Apps

| App | Path | Framework | Entry Point | Deploy |
|-----|------|-----------|-------------|--------|
| **Web** (superseller.agency, admin, API) | `apps/web/superseller-site/` | Next.js 14+ (Vercel) | `src/app/layout.tsx` | `git push` or `vercel --prod` |
| **Worker** (TourReel, FrontDesk) | `apps/worker/` | Express + BullMQ (RackNerd) | `src/index.ts` (48 lines) | `./apps/worker/deploy-to-racknerd.sh` |

---

## Web — Key Modules (`apps/web/superseller-site/src/lib/`)

| File | Main Exports | Purpose |
|------|-------------|---------|
| `auth.ts` | `encryptSession()`, `decryptSession()`, `AUTH_COOKIE_NAME`, `ADMIN_EMAILS` | Session management |
| `credits.ts` | `CreditService` (class) | Credit balance, deduction, top-up |
| `email.ts` | `emails` (template object), `EmailTemplate` | Transactional email templates |
| `prisma.ts` | `prisma` (PrismaClient singleton) | DB client |
| `rate-limiter.ts` | `RateLimiter`, `withRateLimit()`, `apiRateLimiter`, `authRateLimiter` | IP-based rate limiting |
| `schemas.ts` | `PlanSchema`, `UserSchema`, `AgentDefinitionSchema` + 20 more Zod schemas | Shared validation |
| `stripe.ts` | `getStripeAdmin()`, `StripeApi` (class) | Stripe integration |
| `utils.ts` | `cn()`, `formatCurrency()` | Helpers |

### Monitoring (`src/lib/monitoring/`)

| File | Main Exports | Purpose |
|------|-------------|---------|
| `expense-tracker.ts` | `trackExpense()`, `getDailyExpenses()`, `detectAnomalies()` | API cost logging |
| `health-checker.ts` | `HealthCheckResult` | Service health checks |
| `service-registry.ts` | `SERVICE_REGISTRY`, `getServiceById()`, `getServicesByCategory()` | External service catalog |
| `alert-engine.ts` | `AlertEvent` | Alert routing |

### Services (`src/lib/services/`)

| File | Main Exports | Purpose |
|------|-------------|---------|
| `ProvisioningService.ts` | `ProvisioningService` (class) | Stripe subscription → credit grant |
| `UsageService.ts` | `UsageService` (class) | Usage event queries |
| `AITableService.ts` | `AITableService` (class), `AITABLE_DATASHEETS` | Aitable sync |

---

## Worker — Services (`apps/worker/src/services/`)

| File | Main Exports | Purpose |
|------|-------------|---------|
| `kie.ts` | `buildPropertyOnlyKlingPrompt()`, `buildRealtorOnlyKlingPrompt()`, `KieKlingRequest` | Kling 3.0 + Suno API |
| `ffmpeg.ts` | `TextOverlaySpec`, video processing functions | Video concat, overlays, variants |
| `gemini.ts` | Vision API functions | Floorplan analysis, prompt gen |
| `floorplan-analyzer.ts` | `buildTourSequence()`, `TourRoom`, `isSingleStory()` | Room detection from floorplans |
| `prompt-generator.ts` | `ROOM_DESCRIPTIONS`, `STYLE_MODIFIERS` | Cinematic clip prompt gen |
| `room-photo-mapper.ts` | `assignPhotosToClips()`, `resolveOpeningPhoto()` | Photo-to-room assignment |
| `nano-banana.ts` | `NanoBananaRequest`, `NanoBananaResult` | Realtor composite gen |
| `regen-clips.ts` | Clip regeneration logic | Re-generate individual clips |
| `credits.ts` | `CreditManager` (class) | Worker-side credit checks |
| `apify.ts` | `ZillowListingData` | Zillow scraping |
| `r2.ts` | `buildR2Key()` | R2 storage paths |
| `rag.ts` | `chunkText()`, `Document`, `SearchResult`, `HybridResult` | RAG ingestion + search |
| `telnyx.ts` | `TelnyxAssistantConfig`, `TelnyxConversation`, `isConfigured()` | Telnyx AI voice |

### Workers (`apps/worker/src/queue/workers/`)

| File | Lines | Export | Purpose |
|------|-------|--------|---------|
| `video-pipeline.worker.ts` | 783 | `videoPipelineWorker`, `initWorkers()` | TourReel 12-stage pipeline |
| `frontdesk-poller.worker.ts` | 233 | `frontdeskPollerWorker`, `initFrontDeskPoller()` | Telnyx conversation polling |

---

## Schemas

| Schema | Path | ORM | Purpose |
|--------|------|-----|---------|
| Prisma (web) | `apps/web/superseller-site/prisma/schema.prisma` | Prisma | User, Tenant, Subscription, Payment, UsageEvent, Lead, etc. |
| Drizzle (worker) | `apps/worker-packages/db/src/schema.ts` | Drizzle | users, videoJobs, clips, assets, usageEvents, documents |
| Drift validator | `tools/schema-sentinel.ts` | — | Compares Prisma vs Drizzle on 5 shared tables |

---

## Web Pages (`apps/web/superseller-site/src/app/(main)/`)

| Category | Routes |
|----------|--------|
| **Core** | `/` (home), `/pricing`, `/contact`, `/crew`, `/login`, `/dashboard` |
| **Verticals** | `/realtors`, `/contractors`, `/auto-repair`, `/home-services`, `/locksmiths`, `/dental`, `/restaurants`, `/insurance` |
| **Content** | `/blog`, `/docs`, `/case-studies`, `/process`, `/solutions` |
| **Flows** | `/auth`, `/subscriptions`, `/products`, `/success`, `/thank-you`, `/cancel` |

---

## API Routes (`apps/web/superseller-site/src/app/api/`)

| Category | Key Routes | Auth |
|----------|-----------|------|
| **admin/** | clients, dashboard, financials, health-check, monitoring, n8n, onboarding, products, seed, testimonials, vault, workflows | Admin session |
| **app/** | agents, approvals, dashboard, onboarding, runs | Session |
| **auth/** | magic-link (send/verify), logout | Public/Token |
| **billing/** | portal, status | Session |
| **video/** | credits, jobs, subscribe, usage | Session+Credits |
| **marketplace/** | templates, [id], customize, download | Public/Token |
| **webhooks/** | stripe, usage | Signature/Secret |
| **cron/** | sync-aitable | Cron secret |
| **Other** | contact, checkout, fulfillment, health/check, leads, secretary, support | Varies |

Worker routes in `apps/worker/src/api/routes.ts`: `/api/jobs/*`, `/api/rag/*`, `/api/health`

---

## Components (`apps/web/superseller-site/src/components/`)

| Dir | Purpose | Key Files |
|-----|---------|-----------|
| `admin/` | Admin dashboard tabs/views | |
| `dashboard/` | Client dashboard tabs | `OutreachTab.tsx`, `SecretaryTab.tsx`, `VoiceTab.tsx` |
| `ui/` | Shared UI primitives | `button.tsx`, `card.tsx`, `badge.tsx`, `button-enhanced.tsx` |
| `seo/` | SEO/Schema markup | `Schema.tsx` |
| `lp/` | Landing page components | |
| `niche/` | Vertical page components | |
| `pricing/` | Pricing page components | |
| `crew/` | Crew/team page | |
| (root) | Shared layout components | `Header.tsx`, `Footer.tsx`, `AppShell.tsx`, `Hero.tsx`, `CTA.tsx`, `ContactForm.tsx` |

---

## Skills (`.claude/skills/`)

| Skill | Trigger Domain | Level 2 References |
|-------|---------------|-------------------|
| tourreel-pipeline | video, Kling, FFmpeg, clips | 5 reference files (api-deep-reference, kling-api-patterns, prompting-rules, scene-management, troubleshooting) |
| frontdesk-voice | Telnyx, voice AI, call transfer | 1 reference file (telnyx-api-reference) |
| agentforge | research pipeline, proposals | 2 reference files (implementation-patterns, business-decisions) |
| ui-ux-pro-max | design, palettes, typography | scripts/ (BM25 search), brand-token-map |
| stripe-credits | billing, credits, payments | — |
| database-management | schema, migration, ORM | — |
| credential-guardian | API keys, auth, 401 | rotation-playbook |
| api-contracts | routes, endpoints, auth | route-inventory, response-shapes |
| migration-validator | schema change, deploy | migration-checklist |
| data-integrity | schema drift, sync | reconciliation-queries, sync-architecture |
| rag-pgvector | RAG, vector, embedding | — |
| ui-design-workflow | v0, Stitch, rebrand | brand-token-map |
| antigravity-automation | automation, n8n backup | migration-from-n8n |

---

## Tools

| File | Usage | Purpose |
|------|-------|---------|
| `tools/schema-sentinel.ts` | `npx tsx tools/schema-sentinel.ts [--strict]` | Prisma vs Drizzle drift detection |

---

## What's Gone

`apps/api`, `apps/gateway-worker`, `apps/marketplace`, `apps/web/admin-dashboard`, `firestore/`, `legal-pages/`, `directives/` — all deleted. Functionality merged into superseller-site or retired.
