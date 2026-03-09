# Project 1: SuperSeller Web (SaaS Platform)

> **Role**: Next.js SaaS platform — admin portal, customer portal, billing, API routes, i18n, auth.
> **Authority**: SOLE owner of Prisma schema changes.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
apps/web/superseller-site/**
apps/studio/**
```

### CANNOT edit (owned by other projects)
```
apps/worker/**                    → Project 2 (Video Engine)
apps/worker-packages/**           → Project 2 (Video Engine)
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
tools/**                          → Project 4 (Infrastructure)
.github/**                        → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
.mcp.json                         → Project 4 (Infrastructure)
shai friedman social/**           → Project 5 (Social & Content)
elite pro remodeling/**           → Project 6 (Customer Projects)
rensto - online directory/**      → Project 6 (Customer Projects)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- `apps/worker/src/services/credits.ts` — worker credit logic (for API contract alignment)
- `apps/worker-packages/db/src/schema.ts` — Drizzle schema (for shared table awareness)
- `docs/**` — all documentation
- Root `.md` files — all strategy docs

---

## Assigned Skills
- admin-portal
- customer-journey
- billing-credits
- lead-pages
- ui-ux-pro-max
- ui-design-workflow
- rag-pgvector

---

## Key Files
| Resource | Path |
|----------|------|
| Prisma Schema | `apps/web/superseller-site/prisma/schema.prisma` |
| Credits Logic | `apps/web/superseller-site/src/lib/credits.ts` |
| Cost Tracking | `apps/web/superseller-site/src/lib/monitoring/expense-tracker.ts` |
| i18n Messages | `apps/web/superseller-site/messages/*.json` |
| Middleware | `apps/web/superseller-site/src/middleware.ts` |
| Admin Routes | `apps/web/superseller-site/src/app/admin/**` |
| API Routes | `apps/web/superseller-site/src/app/api/**` |
| Studio App | `apps/studio/**` |

---

## Build / Test / Deploy

```bash
# Development
cd apps/web/superseller-site
npm run dev              # Local dev on port 3002

# Build
npm run build            # prisma generate + next build
npm run lint             # Next.js lint

# Database
npm run db:generate      # Prisma generate only
npm run db:push          # Push schema to DB

# Tests
npm run test:credits     # Credit system test
npm run test:e2e         # Playwright E2E tests

# Deploy
vercel --prod            # superseller.agency
# OR git push            # auto-deploys api.superseller.agency
```

---

## Cross-Project Rules

1. **Schema authority**: This project is the SOLE authority for Prisma schema changes. If Project 2 needs a new shared table, they create a request in `docs/cross-project-requests/schema-request-*.md`.
2. **Shared table**: Only `User` is shared between Prisma and Drizzle. After modifying User in Prisma, notify Project 2 to sync Drizzle. Job and Clip are Drizzle-only — do NOT create these in Prisma.
3. **Root docs**: To update root `.md` files, create a request for Project 7.
4. **Env changes**: To add/modify env vars, create a request for Project 4.
5. **API contracts**: Web exposes APIs consumed by the worker. Document breaking changes in `docs/cross-project-requests/`.

---

## Database
- **ORM**: Prisma
- **Connection**: `DATABASE_URL` env var → PostgreSQL on RackNerd
- **Shared table**: User (exists in both Prisma and Drizzle — must stay in sync)
- **Drizzle-only tables**: Job, Clip — these do NOT exist in Prisma. Web accesses job/clip data via worker HTTP API.
- **Web-only tables**: Tenant, TenantUser, Subscription, Lead, ServiceInstance, ContentPost, VoiceCallLog, UsageLog, ApiExpense, AiModel, AiModelRecommendation

## URLs
| Service | URL |
|---------|-----|
| Production | https://superseller.agency |
| Admin | https://admin.superseller.agency |
| API | https://api.superseller.agency |
| Health | https://superseller.agency/api/health |
