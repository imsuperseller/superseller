# Migration Checklist — Step-by-Step

## Prisma-Only Change (Web Tables)

Tables NOT shared with Drizzle (e.g., Lead, Testimonial, ServiceInstance, SupportTicket):

1. Edit `apps/web/rensto-site/prisma/schema.prisma`
2. Run migration: `cd apps/web/rensto-site && npx prisma migrate dev --name describe_change`
3. Build web: `npm run build`
4. Deploy: `git push` (auto-deploy to Vercel)
5. If prod DB: `npx prisma migrate deploy` (runs pending migrations)

## Drizzle-Only Change (Worker Tables)

Tables NOT shared with Prisma (e.g., jobs, clips, assets, listings, documents):

1. Edit `apps/worker-packages/db/src/schema.ts`
2. Push to DB: `cd apps/worker-packages/db && npx drizzle-kit push`
3. Build worker: `cd apps/worker && npm run build`
4. Deploy: `./apps/worker/deploy-to-racknerd.sh`
5. Verify: `curl -s http://172.245.56.50:3002/api/health`

## Shared Table Change (CRITICAL)

Tables in BOTH ORMs: User, Tenant, TenantUser, Entitlement, UsageEvent

1. **Determine primary owner** (see table below)
2. **Edit primary schema first** (Prisma or Drizzle)
3. **Mirror change to secondary schema** — match types exactly:
   | Prisma Type | Drizzle Equivalent |
   |-------------|-------------------|
   | `String` | `text()` or `varchar()` |
   | `Int` | `integer()` |
   | `BigInt` | `bigint()` |
   | `Float` | `numeric()` or `doublePrecision()` |
   | `Boolean` | `boolean()` |
   | `DateTime` | `timestamp({ withTimezone: true })` |
   | `Json` | `jsonb()` |
   | `String @id @default(cuid())` | `text().primaryKey().$defaultFn(() => createId())` |
   | `String @id @default(uuid())` | `uuid().primaryKey().defaultRandom()` |
   | `String?` (optional) | `text()` (nullable by default in Drizzle) |
   | `@map("column_name")` | Use `"column_name"` as first arg |
4. **Run Schema Sentinel**: `npx tsx tools/schema-sentinel.ts --strict`
5. **Run Prisma migration**: `cd apps/web/rensto-site && npx prisma migrate dev --name describe_change`
6. **Build BOTH apps**:
   - `cd apps/web/rensto-site && npm run build`
   - `cd apps/worker && npm run build`
7. **Update docs**: Edit `docs/DATA_DICTIONARY.md` if new field/table
8. **Deploy both**:
   - Web: `git push`
   - Worker: `./apps/worker/deploy-to-racknerd.sh`
9. **Verify both**:
   - `curl -s https://rensto.com/api/health/check`
   - `curl -s http://172.245.56.50:3002/api/health`

## Adding a New Shared Table

1. Add model to `apps/web/rensto-site/prisma/schema.prisma`
2. Add table to `apps/worker-packages/db/src/schema.ts`
3. Add entry to `SHARED_TABLES` in `tools/schema-sentinel.ts`
4. Run Prisma migration: `npx prisma migrate dev --name add_table_name`
5. Run sentinel: `npx tsx tools/schema-sentinel.ts --strict`
6. Build both apps
7. Update `docs/DATA_DICTIONARY.md`
8. Update `.claude/skills/migration-validator/SKILL.md` shared tables table

## Renaming a Column

Renaming is the most dangerous migration — both ORMs must change atomically.

1. **Add new column** (don't remove old yet)
2. **Migrate data**: `UPDATE table SET new_col = old_col;`
3. **Update both schemas** to use new column name
4. **Build + test both apps**
5. **Remove old column** in a follow-up migration
6. Never rename and remove in the same migration

## Rolling Back a Migration

### Prisma
```bash
# Revert last migration (dev only)
cd apps/web/rensto-site
npx prisma migrate reset  # WARNING: drops all data

# For prod: create a new "undo" migration
npx prisma migrate dev --name undo_previous_change
```

### Drizzle
```bash
# Drizzle has no built-in rollback — reverse manually
# Edit schema.ts to remove the change
cd apps/worker-packages/db
npx drizzle-kit push
```

## Pre-Deploy Validation Script
```bash
#!/bin/bash
set -e
echo "--- Schema Sentinel ---"
npx tsx tools/schema-sentinel.ts --strict

echo "--- Web Build ---"
cd apps/web/rensto-site && npm run build
cd ../../..

echo "--- Worker Build ---"
cd apps/worker && npm run build
cd ../..

echo "--- All checks passed ---"
```

## Common Pitfalls

| Pitfall | Prevention |
|---------|-----------|
| Prisma `@map` not matching Drizzle column name | Always check `@map("x")` matches first arg in Drizzle |
| Drizzle `timestamp` vs Prisma `Boolean` | Use type mapping table above |
| Forgot to add to `SHARED_TABLES` in sentinel | Sentinel won't catch drift on unlisted tables |
| `prisma db push` in prod | Always use `prisma migrate deploy` for prod |
| Build passes locally, fails on Vercel | Check `--legacy-peer-deps` in `vercel.json` install command |
| Missing import in Drizzle | `boolean`, `jsonb`, `numeric` must be explicitly imported from `drizzle-orm/pg-core` |
