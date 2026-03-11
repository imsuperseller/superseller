---
name: database-management
description: >
  Prisma + Drizzle dual-ORM database management for SuperSeller AI.
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
| `apps/web/superseller-site/prisma/schema.prisma` | Web app schema | Next.js (Prisma) |
| `apps/worker-packages/db/src/schema.ts` | Worker schema | Worker (Drizzle) |
| `apps/web/superseller-site/prisma/migrations/` | Prisma migration history | Web |

### Shared Tables (BOTH apps read/write)
| Table | Prisma Model | Drizzle Table | Known Conflicts |
|-------|-------------|---------------|-----------------|
| User/users | `model User` | `users` | emailVerified: Boolean vs timestamp; role: enum vs text |
| video_jobs | — | `videoJobs` | Worker-only but web reads via API proxy |
| usage_events | `model UsageEvent` | `usageEvents` | type column: Prisma uses `type`, DB column is `event_type` |

### Web-Only Tables (Prisma only — worker does NOT touch)
These tables are managed exclusively by the web app via Prisma. The worker has no Drizzle schema for them. Safe to migrate with raw SQL or `prisma db push` without Drizzle impact.

| Table | Prisma Model | Purpose |
|-------|-------------|---------|
| Project | `model Project` | Admin project CRUD |
| ProjectMilestone | `model ProjectMilestone` | Project milestones |
| ProjectTask | `model ProjectTask` | Project tasks |
| AuditTemplate | `model AuditTemplate` | Business playbook templates |
| AuditSection | `model AuditSection` | Template sections |
| AuditItem | `model AuditItem` | Individual audit questions |
| AuditInstance | `model AuditInstance` | Per-customer audit instance |
| AuditResponse | `model AuditResponse` | Per-question answers + status |
| CiRun | `model CiRun` | CI pipeline runs |
| ServiceInstance | `model ServiceInstance` | Service activation records |
| Subscription | `model Subscription` | Revenue/billing |
| Payment | `model Payment` | Financial records |
| Lead | `model Lead` | CRM leads |
| alertRule | `model AlertRule` | Alert rule definitions |
| alertHistory | `model AlertHistory` | Fired alert history |
| service_health | raw SQL | Health check results |

### Database Connection
```
DATABASE_URL=postgresql://user:pass@host:5432/superseller
```
Both apps use the same connection string. Shared via Vercel env vars (web) and RackNerd env (worker).

## Common Patterns

### Prisma Migration
```bash
cd apps/web/superseller-site
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

## Error-Cause-Fix

| Error | Probable Cause | Remediation |
|-------|---------------|-------------|
| `Column "emailVerified" expected Boolean, got timestamp` | Prisma defines `Boolean`, Drizzle defines `timestamp`. Both map to same DB column. | Use `timestamp` in Drizzle (DB source of truth). Prisma coerces at runtime. Don't change the DB column type. |
| `Column "event_type" does not exist` (web) | Prisma model uses `type`, DB column is `event_type`. Missing `@map("event_type")`. | Add `@map("event_type")` to the `type` field in Prisma's `UsageEvent` model. |
| `Role 'ADMIN' is not a valid enum value` | Prisma uses `enum UserRole`, Drizzle uses `text()`. Value casing can differ. | Standardize on lowercase in DB. Use `@map` / `.default()` to normalize. |
| `relation "users" does not exist` after migration | Prisma migration ran but table name mapping differs from Drizzle expectations. | Check `@@map("users")` in Prisma. Run `npx tsx tools/schema-sentinel.ts --strict` to detect. |
| Build fails on worker after Prisma schema change | Drizzle schema wasn't updated for shared table changes. | Update `apps/worker-packages/db/src/schema.ts`, then `cd apps/worker && npm run build`. |
| `Unique constraint failed on (userId, type)` | UsageEvent dedup: same event type + userId in same second. | Add `jobId` to the unique constraint or use `upsert` instead of `create`. |

## References
- CLAUDE.md § Database Stack — Architecture overview
- findings.md § Schema drift — Historical issues
- `apps/web/superseller-site/prisma/schema.prisma` — Prisma schema (web)
- `apps/worker-packages/db/src/schema.ts` — Drizzle schema (worker)
