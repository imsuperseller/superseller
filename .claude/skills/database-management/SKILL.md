---
name: database-management
description: >
  Prisma + Drizzle dual-ORM database management for Rensto.
  Covers schema sync, migrations, shared tables (User, Job, Clip),
  and the single PostgreSQL database used by both web and worker apps.
autoTrigger:
  - "database"
  - "schema"
  - "migration"
  - "Prisma"
  - "Drizzle"
  - "PostgreSQL"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n"
---

# Database Management

## When to Use
Use when working on database schema, migrations, ORM queries, or data consistency between web app (Prisma) and worker (Drizzle). Not for video pipeline logic, UI design, or n8n workflows.

## Critical Rules
1. **Single PostgreSQL database.** Both apps share `DATABASE_URL`. Changes affect both.
2. **Prisma is primary for web, Drizzle is primary for worker.** Never mix ORMs in the same app.
3. **Manual sync required.** After changing one schema, check the other. There is NO automated sync tool.
4. **Known type mismatches exist.** emailVerified (Boolean vs timestamp), role (enum vs text), UsageEvent.type/event_type. See `findings.md` for details.
5. **Always test both apps** after schema changes.

## Architecture

### Key Files
| File | Purpose | App |
|------|---------|-----|
| `apps/web/rensto-site/prisma/schema.prisma` | Web app schema | Next.js (Prisma) |
| `apps/worker-packages/db/src/schema.ts` | Worker schema | Worker (Drizzle) |
| `apps/web/rensto-site/prisma/migrations/` | Prisma migration history | Web |

### Shared Tables (BOTH apps read/write)
| Table | Prisma Model | Drizzle Table | Known Conflicts |
|-------|-------------|---------------|-----------------|
| User/users | `model User` | `users` | emailVerified: Boolean vs timestamp; role: enum vs text |
| video_jobs | — | `videoJobs` | Worker-only but web reads via API proxy |
| usage_events | `model UsageEvent` | `usageEvents` | type column: Prisma uses `type`, DB column is `event_type` |

### Database Connection
```
DATABASE_URL=postgresql://user:pass@host:5432/rensto
```
Both apps use the same connection string. Shared via Vercel env vars (web) and RackNerd env (worker).

## Common Patterns

### Prisma Migration
```bash
cd apps/web/rensto-site
npx prisma migrate dev --name describe_change
npx prisma generate
```

### Drizzle Migration
```bash
cd apps/worker-packages/db
npx drizzle-kit generate
npx drizzle-kit migrate
```

### After ANY Schema Change
1. Update the schema file (Prisma or Drizzle)
2. Check the OTHER schema for conflicts
3. Run migration
4. Test both apps: `next build` (web) + `npx tsx src/index.ts` (worker)

## Troubleshooting
Known mismatches: emailVerified (Boolean vs timestamp), role (enum vs text), UsageEvent.type/event_type. See `findings.md` for root causes.

## References
- CLAUDE.md § Database Stack — Architecture overview
- findings.md § Schema drift — Historical issues
- `apps/web/rensto-site/prisma/schema.prisma` — Prisma schema (web)
- `apps/worker-packages/db/src/schema.ts` — Drizzle schema (worker)
