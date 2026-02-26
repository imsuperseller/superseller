---
name: data-integrity
description: >
  Data integrity enforcement for SuperSeller AI's multi-store architecture. Covers Prisma/Drizzle
  schema drift detection, Postgres-Aitable reconciliation, sync watchdog monitoring,
  and cross-store data consistency validation.
autoTrigger:
  - "schema drift"
  - "data integrity"
  - "data dictionary"
  - "sync aitable"
  - "data reconciliation"
  - "schema sentinel"
  - "unsynced"
  - "data mismatch"
  - "missing records"
negativeTrigger:
  - "video pipeline"
  - "UI design"
  - "n8n workflow"
  - "stripe billing"
---

# Data Integrity

## When to Use
Use when detecting, preventing, or fixing data inconsistencies across SuperSeller AI's storage systems (PostgreSQL, Aitable.ai, Redis, R2, Stripe). Covers schema drift between Prisma and Drizzle, unsynced records, orphaned data, and cross-store reconciliation. Not for video pipeline logic, UI design, n8n workflows, or Stripe billing code.

## Critical Rules
1. **PostgreSQL is ALWAYS the SSOT.** If data differs between Postgres and any external store (Aitable, Stripe, n8n), Postgres wins.
2. **All syncs are one-way: Postgres -> Aitable.** Never write from Aitable back to Postgres.
3. **Run Schema Sentinel before any schema change.** `npx tsx tools/schema-sentinel.ts --strict` must pass.
4. **Update DATA_DICTIONARY.md when adding tables/stores.** No table should exist without a dictionary entry.
5. **Five shared tables require manual sync**: User, Tenant, TenantUser, Entitlement, UsageEvent. Changes to one ORM must be mirrored in the other.

## Architecture

### Key Files
| File | Purpose |
|------|---------|
| `docs/DATA_DICTIONARY.md` | Master reference: where every entity lives, sync rules, mismatches |
| `tools/schema-sentinel.ts` | Build-time Prisma vs Drizzle comparator |
| `apps/web/superseller-site/src/app/api/cron/sync-aitable/route.ts` | Cron-triggered Aitable sync (every 15 min) |
| `apps/web/superseller-site/src/lib/monitoring/service-registry.ts` | Aitable health check (unsynced lead count) |
| `apps/web/superseller-site/src/lib/services/AITableService.ts` | Aitable API client + datasheet IDs |
| `apps/web/superseller-site/tools/sync_leads_to_aitable.js` | Manual lead sync script |
| `apps/web/superseller-site/tools/sync_products_to_aitable.js` | Manual product sync script |
| `apps/web/superseller-site/tools/sync_extended_to_aitable.js` | Manual extended data sync |

### Storage Systems
| Store | Role | Sync Direction |
|-------|------|---------------|
| PostgreSQL | Primary SSOT | N/A |
| Aitable.ai | Dashboard mirror | Postgres -> Aitable (one-way) |
| Redis | Ephemeral cache | Job metadata backed in Postgres |
| Cloudflare R2 | Media storage | URLs stored in Postgres |
| Stripe | Billing SSOT | Stripe -> Postgres (via webhook) |
| Firebase Storage | Legacy onboarding certs | Deprecated |

### Shared Tables (Prisma <-> Drizzle)
| Table | Known Issues |
|-------|-------------|
| User / users | Prisma has 40+ fields, Drizzle has 25. Column naming: camelCase vs snake_case. |
| Tenant / tenants | Field mapping OK. |
| TenantUser / tenantUsers | Field mapping OK. |
| Entitlement / entitlements | `creditsBalance`: Int (Prisma) vs numeric (Drizzle). |
| UsageEvent / usageEvents | `type` column: Prisma maps to `event_type` via @map. |

## Common Patterns

### Run Schema Sentinel
```bash
# Report mode (dev)
npx tsx tools/schema-sentinel.ts

# Strict mode (CI — fails on mismatch)
npx tsx tools/schema-sentinel.ts --strict
```

### Check Unsynced Records
```sql
-- Count leads not yet pushed to Aitable
SELECT COUNT(*) FROM "Lead" WHERE "syncedToAITable" = false;
```

### Manual Aitable Sync
```bash
cd apps/web/superseller-site
node tools/sync_leads_to_aitable.js
node tools/sync_products_to_aitable.js
```

### Add a New Table (Checklist)
1. Add model to Prisma schema (`schema.prisma`)
2. If worker needs it: add table to Drizzle schema (`schema.ts`)
3. Run `npx tsx tools/schema-sentinel.ts` to verify no drift
4. Update `docs/DATA_DICTIONARY.md` with entity-to-store mapping
5. If Aitable dashboard needed: add datasheet ID to `AITableService.ts`
6. Run migrations: `npx prisma migrate dev --name describe_change`

### Reconciliation Query (Cross-Store Audit)
```typescript
// Compare Postgres lead count vs Aitable record count
const pgCount = await prisma.lead.count();
const aitableRecords = await AITableService.fetchRecords(AITABLE_DATASHEETS.LEADS);
const drift = pgCount - aitableRecords.length;
console.log(`Postgres: ${pgCount}, Aitable: ${aitableRecords.length}, Drift: ${drift}`);
```

## Troubleshooting

### "Unsynced leads growing"
The Vercel Cron (`/api/cron/sync-aitable`) runs every 15 min. If leads pile up:
1. Check `AITABLE_API_TOKEN` is set in Vercel env
2. Check `CRON_SECRET` matches between vercel.json and env
3. Check Aitable API status: `curl -H "Authorization: Bearer $TOKEN" https://aitable.ai/fusion/v1/spaces`
4. Run manual sync: `cd apps/web/superseller-site && node tools/sync_leads_to_aitable.js`

### "Schema Sentinel reports mismatch"
1. Identify which field mismatches (Prisma type vs Drizzle type)
2. Determine which ORM is authoritative (Prisma for web fields, Drizzle for worker fields)
3. Fix the non-authoritative schema to match
4. Run `npx tsx tools/schema-sentinel.ts` to confirm
5. Update `docs/DATA_DICTIONARY.md` mismatch table

## References
- `docs/DATA_DICTIONARY.md` — Master entity-to-store mapping
- `tools/schema-sentinel.ts` — Schema drift detector
- `findings.md` — Historical schema drift issues and fixes
- `references/reconciliation-queries.md` — Cross-store audit SQL
- `references/sync-architecture.md` — Sync flow diagrams
