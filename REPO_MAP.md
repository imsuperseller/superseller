# Repo Map — Codebase Structure Index

**Auto-generated**: 2026-03-10 by `npx tsx tools/map-codebase.ts`
**Purpose**: Directed search index — find any key file in 1 lookup instead of 3+ Glob attempts.

---

## Stats

| Metric | Count |
|--------|-------|
| Web .tsx files | 233 |
| Worker .ts files | 83 |
| API routes (web) | 102 |
| Worker endpoints | 28 |
| Pages | 58 |
| Admin components | 34 |
| UI components | 25 |
| Skills | 29 |
| BullMQ queues | 6 |
| Scheduler jobs | 7 |

---

## Live Apps

| App | Path | Framework | Deploy |
|-----|------|-----------|--------|
| **Web** (superseller.agency, admin, API) | `apps/web/superseller-site/` | Next.js 14+ (Vercel) | `git push` or `vercel --prod` |
| **Worker** (VideoForge, FrontDesk) | `apps/worker/` | Express + BullMQ (RackNerd) | `./apps/worker/deploy-to-racknerd.sh` |

---

## Web API Routes (102)

- `/api/admin/alerts`
- `/api/admin/clients`
- `/api/admin/dashboard/metrics`
- `/api/admin/financials`
- `/api/admin/frontdesk`
- `/api/admin/fulfillment/queue`
- `/api/admin/health-check`
- `/api/admin/impersonate`
- `/api/admin/intelligence`
- `/api/admin/launch-tasks`
- `/api/admin/launch-tasks/seed`
- `/api/admin/marketplace`
- `/api/admin/mission-control`
- `/api/admin/monitoring`
- `/api/admin/n8n`
- `/api/admin/n8n/agent`
- `/api/admin/onboarding/:id/approve`
- `/api/admin/ops`
- `/api/admin/products/create`
- `/api/admin/progress`
- `/api/admin/projects`
- `/api/admin/prompts`
- `/api/admin/seed`
- `/api/admin/terry/chat`
- `/api/admin/testimonials`
- `/api/admin/testimonials/approve`
- `/api/admin/vault`
- `/api/admin/workflows/status`
- `/api/app/agents`
- `/api/app/approvals`
- `/api/app/approvals/:id/respond`
- `/api/app/dashboard`
- `/api/app/onboarding/submit`
- `/api/app/runs`
- `/api/auth/callback/linkedin`
- `/api/auth/callback/x`
- `/api/auth/callback/youtube`
- `/api/auth/connect/linkedin`
- `/api/auth/connect/x`
- `/api/auth/connect/youtube`
- `/api/auth/logout`
- `/api/auth/magic-link/send`
- `/api/auth/magic-link/verify`
- `/api/billing/portal`
- `/api/billing/status`
- `/api/checkout`
- `/api/compete/ads/:tenantSlug`
- `/api/contact`
- `/api/content/generate`
- `/api/cron/sync-aitable`
- `/api/custom-solutions/checkout`
- `/api/custom-solutions/intake`
- `/api/dashboard/calls`
- `/api/dashboard/entitlements`
- `/api/dashboard/sync-usage`
- `/api/free-leads/request`
- `/api/fulfillment/finalize`
- `/api/fulfillment/initiate`
- `/api/health`
- `/api/health/check`
- `/api/knowledge/index`
- `/api/leads/landing-page`
- `/api/leads/sync`
- `/api/marketplace/:id`
- `/api/marketplace/customer/posts`
- `/api/marketplace/customer/products`
- `/api/marketplace/customer/products/:productId`
- `/api/marketplace/customer/session`
- `/api/marketplace/customer/stats`
- `/api/marketplace/customer/sync`
- `/api/marketplace/customize`
- `/api/marketplace/download/:token`
- `/api/marketplace/downloads`
- `/api/marketplace/templates`
- `/api/marketplace/webhook/refund`
- `/api/n8n/workflows`
- `/api/paypal/capture`
- `/api/proposals/generate`
- `/api/scorecard`
- `/api/secretary/config`
- `/api/secretary/lookup`
- `/api/setup/populate-data`
- `/api/social/accounts`
- `/api/social/generate`
- `/api/social/publish`
- `/api/social/webhook/approval`
- `/api/solutions/generate`
- `/api/support/create`
- `/api/support/list`
- `/api/support/update`
- `/api/testimonials`
- `/api/video/credits`
- `/api/video/jobs`
- `/api/video/jobs/:id`
- `/api/video/jobs/:id/regenerate`
- `/api/video/jobs/from-zillow`
- `/api/video/subscribe`
- `/api/video/test-user-status`
- `/api/video/usage`
- `/api/webhooks/paypal`
- `/api/webhooks/stripe`
- `/api/webhooks/usage`

---

## Web Pages (58)

- `/(main)`
- `/admin`
- `/admin/fulfillment`
- `/app/agents`
- `/app/approvals`
- `/app/billing`
- `/app/credentials`
- `/app/dashboard`
- `/app/reports`
- `/app/runs`
- `/app/settings`
- `/app/status`
- `/app/support`
- `/app/team`
- `/auth/error`
- `/auth/verify`
- `/auto-repair`
- `/blog`
- `/blog/:slug`
- `/cancel`
- `/case-studies/whatsapp-automation`
- `/contact`
- `/contractors`
- `/crew`
- `/crew/:slug`
- `/custom`
- `/dashboard/:clientId`
- `/dashboard/:clientId/video`
- `/dashboard/marketplace`
- `/dashboard/marketplace/posts`
- `/dashboard/marketplace/products/new`
- `/dental`
- `/docs`
- `/docs/getting-started`
- `/free-leads`
- `/home-services`
- `/insurance`
- `/legal/privacy`
- `/legal/terms`
- `/locksmiths`
- `/login`
- `/logout`
- `/niches`
- `/niches/:slug`
- `/niches/ecommerce`
- `/niches/healthcare`
- `/niches/legal`
- `/offers`
- `/pricing`
- `/process`
- `/products/:id`
- `/realtors`
- `/restaurants`
- `/solutions/:id/onboarding`
- `/subscriptions`
- `/success`
- `/thank-you`
- `/whatsapp`

---

## Worker Endpoints (28)

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs`
- `POST /api/jobs/from-zillow`
- `POST /api/jobs/remotion`
- `POST /api/jobs/remotion/from-zillow`
- `POST /api/jobs/remotion/crew`
- `POST /api/dev/ensure-test-user`
- `POST /api/jobs/:id/regenerate`
- `POST /api/jobs/:id/retry-fresh`
- `POST /api/jobs/:id/resume`
- `POST /api/rag/ingest`
- `POST /api/rag/search`
- `GET /api/rag/documents`
- `DELETE /api/rag/documents/:id`
- `DELETE /api/rag/documents`
- `POST /api/whatsapp/claude`
- `POST /api/whatsapp/claude/superseller`
- `POST /api/whatsapp/ops`
- `GET /api/approvals/pending`
- `POST /api/crew-videos`
- `POST /api/crew-videos/v3`
- `POST /api/crew-videos/:batchId/approve`
- `POST /api/crew-videos/:batchId/reject`
- `GET /api/crew-videos/status`
- `GET /api/diagnostics`
- `GET /api/ops`
- `GET /api/health`

---

## Web Key Modules (`src/lib/`) (18)

| Module | Path |
|--------|------|
| `agents/` | `apps/web/superseller-site/src/lib/agents/` |
| `auth` | `apps/web/superseller-site/src/lib/auth.ts` |
| `credits` | `apps/web/superseller-site/src/lib/credits.ts` |
| `db/` | `apps/web/superseller-site/src/lib/db/` |
| `design-tokens` | `apps/web/superseller-site/src/lib/design-tokens.ts` |
| `email` | `apps/web/superseller-site/src/lib/email.ts` |
| `env` | `apps/web/superseller-site/src/lib/env.ts` |
| `firebase-admin` | `apps/web/superseller-site/src/lib/firebase-admin.ts` |
| `logger` | `apps/web/superseller-site/src/lib/logger.ts` |
| `monitoring/` | `apps/web/superseller-site/src/lib/monitoring/` |
| `paypal` | `apps/web/superseller-site/src/lib/paypal.ts` |
| `prisma` | `apps/web/superseller-site/src/lib/prisma.ts` |
| `rate-limiter` | `apps/web/superseller-site/src/lib/rate-limiter.ts` |
| `schemas` | `apps/web/superseller-site/src/lib/schemas.ts` |
| `services/` | `apps/web/superseller-site/src/lib/services/` |
| `slack` | `apps/web/superseller-site/src/lib/slack.ts` |
| `stripe` | `apps/web/superseller-site/src/lib/stripe.ts` |
| `utils` | `apps/web/superseller-site/src/lib/utils.ts` |

---

## Worker Services (46)

| Service | Path |
|---------|------|
| `agents/` | `apps/worker/src/services/agents/` |
| `apify` | `apps/worker/src/services/apify.ts` |
| `approval-service` | `apps/worker/src/services/approval-service.ts` |
| `claude-bridge` | `apps/worker/src/services/claude-bridge.ts` |
| `claudeclaw-router` | `apps/worker/src/services/claudeclaw-router.ts` |
| `credits` | `apps/worker/src/services/credits.ts` |
| `crew-demo-generator` | `apps/worker/src/services/crew-demo-generator.ts` |
| `ep-asset-ingestion` | `apps/worker/src/services/ep-asset-ingestion.ts` |
| `esignatures` | `apps/worker/src/services/esignatures.ts` |
| `expense-tracker` | `apps/worker/src/services/expense-tracker.ts` |
| `ffmpeg` | `apps/worker/src/services/ffmpeg.ts` |
| `floorplan-analyzer` | `apps/worker/src/services/floorplan-analyzer.ts` |
| `gemini` | `apps/worker/src/services/gemini.ts` |
| `group-agent` | `apps/worker/src/services/group-agent.ts` |
| `group-memory` | `apps/worker/src/services/group-memory.ts` |
| `guardrails` | `apps/worker/src/services/guardrails.ts` |
| `health-monitor` | `apps/worker/src/services/health-monitor.ts` |
| `hero-features` | `apps/worker/src/services/hero-features.ts` |
| `ig-content-rules` | `apps/worker/src/services/ig-content-rules.ts` |
| `kie` | `apps/worker/src/services/kie.ts` |
| `lead-analysis` | `apps/worker/src/services/lead-analysis.ts` |
| `lead-notification` | `apps/worker/src/services/lead-notification.ts` |
| `marketplace` | `apps/worker/src/services/marketplace.ts` |
| `meta-ads-scraper` | `apps/worker/src/services/meta-ads-scraper.ts` |
| `model-selector` | `apps/worker/src/services/model-selector.ts` |
| `music-style-picker` | `apps/worker/src/services/music-style-picker.ts` |
| `nano-banana` | `apps/worker/src/services/nano-banana.ts` |
| `nano-banana-prompts` | `apps/worker/src/services/nano-banana-prompts.ts` |
| `notification` | `apps/worker/src/services/notification.ts` |
| `photo-classifier` | `apps/worker/src/services/photo-classifier.ts` |
| `proactive-digest` | `apps/worker/src/services/proactive-digest.ts` |
| `prompt-generator` | `apps/worker/src/services/prompt-generator.ts` |
| `prompt-store` | `apps/worker/src/services/prompt-store.ts` |
| `r2` | `apps/worker/src/services/r2.ts` |
| `rag` | `apps/worker/src/services/rag.ts` |
| `rag-ingestor` | `apps/worker/src/services/rag-ingestor.ts` |
| `regen-clips` | `apps/worker/src/services/regen-clips.ts` |
| `remotion-renderer` | `apps/worker/src/services/remotion-renderer.ts` |
| `room-photo-mapper` | `apps/worker/src/services/room-photo-mapper.ts` |
| `scheduler` | `apps/worker/src/services/scheduler.ts` |
| `telnyx` | `apps/worker/src/services/telnyx.ts` |
| `telnyx-call-control` | `apps/worker/src/services/telnyx-call-control.ts` |
| `transition-planner` | `apps/worker/src/services/transition-planner.ts` |
| `waha-client` | `apps/worker/src/services/waha-client.ts` |
| `waha-session-manager` | `apps/worker/src/services/waha-session-manager.ts` |
| `workiz` | `apps/worker/src/services/workiz.ts` |

---

## Admin Components (34)

| Component | Path |
|-----------|------|
| `AdminDashboard` | `apps/web/superseller-site/src/components/admin/AdminDashboard.tsx` |
| `AdminHeader` | `apps/web/superseller-site/src/components/admin/AdminHeader.tsx` |
| `AdminLayout` | `apps/web/superseller-site/src/components/admin/AdminLayout.tsx` |
| `AdminSidebar` | `apps/web/superseller-site/src/components/admin/AdminSidebar.tsx` |
| `AffiliateTracking` | `apps/web/superseller-site/src/components/admin/AffiliateTracking.tsx` |
| `AgentDashboard` | `apps/web/superseller-site/src/components/admin/AgentDashboard.tsx` |
| `AIAgentManagement` | `apps/web/superseller-site/src/components/admin/AIAgentManagement.tsx` |
| `ClientIntelligence` | `apps/web/superseller-site/src/components/admin/ClientIntelligence.tsx` |
| `ClientManagement` | `apps/web/superseller-site/src/components/admin/ClientManagement.tsx` |
| `CustomerManagement` | `apps/web/superseller-site/src/components/admin/CustomerManagement.tsx` |
| `CustomerMetrics` | `apps/web/superseller-site/src/components/admin/CustomerMetrics.tsx` |
| `DashboardOverview` | `apps/web/superseller-site/src/components/admin/DashboardOverview.tsx` |
| `DashboardWidget` | `apps/web/superseller-site/src/components/admin/DashboardWidget.tsx` |
| `DataPopulation` | `apps/web/superseller-site/src/components/admin/DataPopulation.tsx` |
| `EcosystemMap` | `apps/web/superseller-site/src/components/admin/EcosystemMap.tsx` |
| `LaunchControlCenter` | `apps/web/superseller-site/src/components/admin/LaunchControlCenter.tsx` |
| `MarketplaceManagement` | `apps/web/superseller-site/src/components/admin/MarketplaceManagement.tsx` |
| `MCPToolsManagement` | `apps/web/superseller-site/src/components/admin/MCPToolsManagement.tsx` |
| `MissionControl` | `apps/web/superseller-site/src/components/admin/MissionControl.tsx` |
| `N8nMaintenanceControl` | `apps/web/superseller-site/src/components/admin/N8nMaintenanceControl.tsx` |
| `NewProductWizard` | `apps/web/superseller-site/src/components/admin/NewProductWizard.tsx` |
| `ProgressHub` | `apps/web/superseller-site/src/components/admin/ProgressHub.tsx` |
| `ProjectManagement` | `apps/web/superseller-site/src/components/admin/ProjectManagement.tsx` |
| `RevenueMetrics` | `apps/web/superseller-site/src/components/admin/RevenueMetrics.tsx` |
| `SuperSellerOps` | `apps/web/superseller-site/src/components/admin/SuperSellerOps.tsx` |
| `SupportQueue` | `apps/web/superseller-site/src/components/admin/SupportQueue.tsx` |
| `SystemHealth` | `apps/web/superseller-site/src/components/admin/SystemHealth.tsx` |
| `SystemMonitor` | `apps/web/superseller-site/src/components/admin/SystemMonitor.tsx` |
| `SystemMonitoring` | `apps/web/superseller-site/src/components/admin/SystemMonitoring.tsx` |
| `TerryAssistant` | `apps/web/superseller-site/src/components/admin/TerryAssistant.tsx` |
| `TreasuryManagement` | `apps/web/superseller-site/src/components/admin/TreasuryManagement.tsx` |
| `VaultManagement` | `apps/web/superseller-site/src/components/admin/VaultManagement.tsx` |
| `WorkflowManagement` | `apps/web/superseller-site/src/components/admin/WorkflowManagement.tsx` |
| `WorkflowTemplatesManagement` | `apps/web/superseller-site/src/components/admin/WorkflowTemplatesManagement.tsx` |

---

## BullMQ Queues (6)

- `video-pipeline`
- `clip-generation`
- `claudeclaw`
- `marketplace-replenisher`
- `remotion-composition`
- `crew-video`

---

## Scheduler Jobs (7)

- `expire-approvals`
- `health-context-ingest`
- `rag-full-ingestion`
- `health-cleanup`
- `system-cleanup`
- `agent-orchestrator`
- `daily-digest`

---

## Skills (29)

| Skill | Path |
|-------|------|
| `admin-portal` | `.claude/skills/admin-portal/SKILL.md` |
| `agentforge` | `.claude/skills/agentforge/SKILL.md` |
| `antigravity-automation` | `.claude/skills/antigravity-automation/SKILL.md` |
| `api-contracts` | `.claude/skills/api-contracts/SKILL.md` |
| `autonomous-agents` | `.claude/skills/autonomous-agents/SKILL.md` |
| `competitor-research` | `.claude/skills/competitor-research/SKILL.md` |
| `cost-tracker` | `.claude/skills/cost-tracker/SKILL.md` |
| `credential-guardian` | `.claude/skills/credential-guardian/SKILL.md` |
| `customer-journey` | `.claude/skills/customer-journey/SKILL.md` |
| `data-integrity` | `.claude/skills/data-integrity/SKILL.md` |
| `database-management` | `.claude/skills/database-management/SKILL.md` |
| `deploy-ops` | `.claude/skills/deploy-ops/SKILL.md` |
| `frontdesk-voice` | `.claude/skills/frontdesk-voice/SKILL.md` |
| `lead-pages` | `.claude/skills/lead-pages/SKILL.md` |
| `marketplace-saas` | `.claude/skills/marketplace-saas/SKILL.md` |
| `migration-validator` | `.claude/skills/migration-validator/SKILL.md` |
| `model-observatory` | `.claude/skills/model-observatory/SKILL.md` |
| `monitoring-alerts` | `.claude/skills/monitoring-alerts/SKILL.md` |
| `notebooklm-hub` | `.claude/skills/notebooklm-hub/SKILL.md` |
| `rag-pgvector` | `.claude/skills/rag-pgvector/SKILL.md` |
| `resilience-patterns` | `.claude/skills/resilience-patterns/SKILL.md` |
| `skill-template` | `.claude/skills/skill-template/SKILL.md` |
| `socialhub` | `.claude/skills/socialhub/SKILL.md` |
| `spec-driven-dev` | `.claude/skills/spec-driven-dev/SKILL.md` |
| `ui-design-workflow` | `.claude/skills/ui-design-workflow/SKILL.md` |
| `ui-ux-pro-max` | `.claude/skills/ui-ux-pro-max/SKILL.md` |
| `videoforge-pipeline` | `.claude/skills/videoforge-pipeline/SKILL.md` |
| `whatsapp-waha` | `.claude/skills/whatsapp-waha/SKILL.md` |
| `winner-studio` | `.claude/skills/winner-studio/SKILL.md` |

---

## Key Config Files

| File | Purpose |
|------|---------|
| `brain.md` | Mission Control, authority precedence |
| `CLAUDE.md` | Technical router |
| `METHODOLOGY.md` | Process methodology |
| `.cursor/rules/agent-behavior.mdc` | Agent execution rules |
| `.claude/skills/SKILL_ROUTER.md` | Task → skill mapping |
| `apps/web/superseller-site/prisma/schema.prisma` | Web DB schema |
| `apps/worker-packages/db/src/schema.ts` | Worker DB schema (Drizzle) |
| `apps/worker/src/queue/queues.ts` | BullMQ queue definitions |
| `apps/worker/ecosystem.config.js` | PM2 config |
| `.env` | Environment variables |
