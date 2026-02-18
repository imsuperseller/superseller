# Schema Sync — Prisma vs Drizzle

## Known Type Mismatches (Feb 2026)

| Field | Prisma (schema.prisma) | Drizzle (schema.ts) | Actual DB | Risk |
|-------|----------------------|---------------------|-----------|------|
| `emailVerified` | `Boolean?` | `timestamp("email_verified")` | Boolean in DB | Drizzle expects timestamp, gets boolean |
| `role` | `UserRole` enum (SUPER_ADMIN, ADMIN, MANAGER, USER) | `text("role").default("USER")` | text | Prisma enum vs Drizzle string — compatible at DB level |
| `n8nInstance` | `Json?` | NOT PRESENT | JSON | Worker never reads this field |
| `User.id` | `@db.Uuid` | `uuid("id")` | text (not uuid constraint) | Schema says UUID but column is text |
| `UsageEvent.type` | `type` field | `event_type` column | `event_type` | Column name mismatch — mapped in Prisma with `@map` |

## Sync Checklist (After Schema Change)

### If Prisma schema changed:
- [ ] Check Drizzle schema.ts for matching tables
- [ ] Verify column names match (Prisma may use `@map`)
- [ ] Verify types match (especially enums vs text)
- [ ] Run `npx prisma migrate dev`
- [ ] Test worker: `cd apps/worker && npx tsx src/index.ts`

### If Drizzle schema changed:
- [ ] Check Prisma schema.prisma for matching models
- [ ] Verify column names match
- [ ] Run `npx drizzle-kit generate && npx drizzle-kit migrate`
- [ ] Test web: `cd apps/web/rensto-site && npx next build`

## Safe Migration Strategy
1. Add nullable columns first (no breaking change)
2. Deploy app that writes new column
3. Backfill data
4. Make column NOT NULL if needed
5. Update the other ORM schema
