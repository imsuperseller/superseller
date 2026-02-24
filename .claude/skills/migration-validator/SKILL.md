---
name: migration-validator
description: >
  Cross-ORM migration validation for Rensto's dual-ORM (Prisma + Drizzle) architecture.
  Ensures schema changes compile in both apps, shared tables stay in sync,
  and deployments don't break due to schema drift.
autoTrigger:
  - "migration"
  - "schema change"
  - "deploy failed"
  - "build failed"
  - "prisma migrate"
  - "drizzle migrate"
  - "both apps"
  - "cross-orm"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "stripe"
  - "n8n"
---

# Migration Validator

## When to Use
Use when making schema changes to either Prisma or Drizzle, validating that both apps (web + worker) still compile, or debugging build failures caused by schema drift. Not for video pipeline work, UI design, Stripe billing, or n8n workflows.

## Critical Rules
1. **Every Prisma migration must be checked against Drizzle.** Shared tables exist in both ORMs.
2. **Run Schema Sentinel before every deploy**: `npx tsx tools/schema-sentinel.ts --strict`
3. **Build both apps after schema changes**: `cd apps/web/rensto-site && npm run build` AND `cd apps/worker && npm run build`
4. **Never `prisma db push` to production without testing locally first.** Use `prisma migrate dev` for local, `prisma migrate deploy` for prod.
5. **Update `docs/DATA_DICTIONARY.md`** after adding any table or changing shared fields.

## Architecture

### Schema Files
| App | ORM | Schema | Migration Dir |
|-----|-----|--------|--------------|
| Web (Next.js) | Prisma | `apps/web/rensto-site/prisma/schema.prisma` | `apps/web/rensto-site/prisma/migrations/` |
| Worker (Node.js) | Drizzle | `apps/worker-packages/db/src/schema.ts` | Drizzle Kit (no persistent dir) |

### Shared Tables (Must Stay Synced)
| DB Table | Prisma Model | Drizzle Table | Primary Owner |
|----------|-------------|--------------|--------------|
| `User` | `User` | `users` | Prisma (web) |
| `Tenant` | `Tenant` | `tenants` | Prisma (web) |
| `TenantUser` | `TenantUser` | `tenantUsers` | Prisma (web) |
| `entitlements` | `Entitlement` | `entitlementsTable` | Both (credits read/write) |
| `usage_events` | `UsageEvent` | `usageEvents` | Both (event logging) |

### Deploy Targets
| App | Platform | Deploy Method |
|-----|----------|--------------|
| Web | Vercel | `git push` (auto) or `vercel --prod` (manual) |
| Worker | RackNerd | `./apps/worker/deploy-to-racknerd.sh` |

## Common Patterns

### Full Migration Workflow
```bash
# 1. Make schema change in Prisma
vi apps/web/rensto-site/prisma/schema.prisma

# 2. Run Prisma migration locally
cd apps/web/rensto-site
npx prisma migrate dev --name describe_the_change

# 3. If shared table changed: update Drizzle schema
vi apps/worker-packages/db/src/schema.ts

# 4. Run Schema Sentinel to validate
cd ../..
npx tsx tools/schema-sentinel.ts --strict

# 5. Build both apps
cd apps/web/rensto-site && npm run build
cd ../../apps/worker && npm run build

# 6. Update docs
# Edit docs/DATA_DICTIONARY.md if new table or field added

# 7. Deploy
git push                                    # Web auto-deploys
./apps/worker/deploy-to-racknerd.sh         # Worker manual deploy
```

### Quick Validation (No Migration)
```bash
# Just check if schemas are compatible
npx tsx tools/schema-sentinel.ts

# Build web
cd apps/web/rensto-site && npm run build

# Build worker
cd apps/worker && npm run build
```

### Drizzle-Only Change (Worker Tables)
```bash
# For tables NOT shared with Prisma (jobs, clips, assets)
# No need to update Prisma schema
vi apps/worker-packages/db/src/schema.ts

# Apply to DB
cd apps/worker-packages/db
npx drizzle-kit push

# Build worker
cd ../../apps/worker && npm run build

# Deploy
./apps/worker/deploy-to-racknerd.sh
```

### Adding a New Shared Table
```bash
# 1. Add to Prisma schema
# 2. Add to Drizzle schema
# 3. Add to SHARED_TABLES array in tools/schema-sentinel.ts
# 4. Run migration: npx prisma migrate dev --name add_table_name
# 5. Run sentinel: npx tsx tools/schema-sentinel.ts --strict
# 6. Build both apps
# 7. Update DATA_DICTIONARY.md
```

## Pre-Deploy Checklist
- [ ] Schema Sentinel passes (`npx tsx tools/schema-sentinel.ts --strict`)
- [ ] Web app builds (`cd apps/web/rensto-site && npm run build`)
- [ ] Worker builds (`cd apps/worker && npm run build`)
- [ ] DATA_DICTIONARY.md updated (if table/field added)
- [ ] database-management skill refs updated (if shared table changed)

## Troubleshooting

### "Column does not exist" after deploy
1. Check if migration was applied: `SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;`
2. If not applied: `cd apps/web/rensto-site && npx prisma migrate deploy`
3. If column name mismatch: check `@map` in Prisma vs column name in Drizzle

### "Type mismatch" in Schema Sentinel
1. Identify the field and both types
2. Determine which ORM owns the field (Prisma for web fields, Drizzle for worker fields)
3. Fix the non-owning schema to match
4. Re-run sentinel

### "Build fails on worker after schema change"
1. Check if the Drizzle schema was updated for shared table changes
2. Check import: `boolean` must be imported from `drizzle-orm/pg-core` if using boolean fields
3. Build locally: `cd apps/worker && npx tsc --noEmit`

## References
- `tools/schema-sentinel.ts` — Schema drift validator
- `docs/DATA_DICTIONARY.md` — Entity-to-store mapping
- `apps/web/rensto-site/prisma/schema.prisma` — Web schema
- `apps/worker-packages/db/src/schema.ts` — Worker schema
- `findings.md` — Historical schema issues
- `references/migration-checklist.md` — Detailed step-by-step
