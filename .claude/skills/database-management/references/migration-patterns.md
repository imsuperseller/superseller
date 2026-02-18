# Migration Patterns

## Prisma Migrations
```bash
# Create migration
cd apps/web/rensto-site
npx prisma migrate dev --name add_field_name

# Apply to production
npx prisma migrate deploy

# Generate client after schema change
npx prisma generate

# Reset (DESTRUCTIVE — dev only)
npx prisma migrate reset
```

## Drizzle Migrations
```bash
# Generate migration SQL
cd apps/worker-packages/db
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate

# Push schema directly (dev only, no migration file)
npx drizzle-kit push
```

## Adding a Shared Column
Example: Adding `phone` to users table.

### Step 1: Prisma
```prisma
model User {
  phone String?  // nullable first
}
```
```bash
npx prisma migrate dev --name add_user_phone
```

### Step 2: Drizzle
```typescript
export const users = pgTable('users', {
  phone: text('phone'),
});
```
```bash
npx drizzle-kit generate && npx drizzle-kit migrate
```

### Step 3: Verify
```bash
# Web
cd apps/web/rensto-site && npx next build
# Worker
cd apps/worker && npx tsx src/index.ts
```

## Dangerous Operations
| Operation | Risk | Mitigation |
|-----------|------|-----------|
| DROP COLUMN | Data loss | Backup first, ensure no app reads the column |
| ALTER TYPE | Lock table | Use concurrent index, schedule during low traffic |
| RENAME COLUMN | Both ORMs break | Update both schemas BEFORE migration |
| NOT NULL on existing column | Fails if NULLs exist | Backfill first, then alter |
