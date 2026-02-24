# Reconciliation Queries

## Cross-Store Count Comparison

### Leads: Postgres vs Aitable
```sql
-- Total leads in Postgres
SELECT COUNT(*) as total,
       COUNT(*) FILTER (WHERE "syncedToAITable" = true) as synced,
       COUNT(*) FILTER (WHERE "syncedToAITable" = false) as unsynced
FROM "Lead";
```

### Users: Prisma vs Drizzle Shared Fields
```sql
-- Check for type mismatches in shared User fields
-- Run this to verify both ORMs read the same data
SELECT id, email,
       pg_typeof("emailVerified") as email_verified_type,
       pg_typeof(role) as role_type,
       pg_typeof(status) as status_type
FROM "User" LIMIT 5;
```

### Entitlements: Balance Consistency
```sql
-- Check for users with negative credit balances (should never happen)
SELECT e.user_id, e.credits_balance, e.plan, e.status, u.email
FROM entitlements e
JOIN "User" u ON u.id = e.user_id::text
WHERE e.credits_balance < 0;
```

### Usage Events: Orphaned Records
```sql
-- Find usage events referencing non-existent jobs
SELECT ue.id, ue.user_id, ue.job_id, ue.event_type
FROM usage_events ue
LEFT JOIN jobs j ON j.id = ue.job_id
WHERE ue.job_id IS NOT NULL AND j.id IS NULL;
```

### Stripe: Payment Mirror Integrity
```sql
-- Find payments without matching Stripe session
SELECT id, amount, status, "stripeSessionId", "createdAt"
FROM "Payment"
WHERE "stripeSessionId" IS NULL AND status = 'completed'
ORDER BY "createdAt" DESC LIMIT 20;
```

## Orphan Detection

### Leads Without Users
```sql
SELECT l.id, l.email, l.source, l."userId"
FROM "Lead" l
LEFT JOIN "User" u ON u.id = l."userId"
WHERE u.id IS NULL;
```

### Subscriptions Without Active Users
```sql
SELECT s.id, s."userEmail", s.status, s."subscriptionType"
FROM "Subscription" s
LEFT JOIN "User" u ON u.id = s."userId"
WHERE u.id IS NULL AND s.status = 'active';
```

### Jobs Without Users (Worker DB)
```sql
SELECT j.id, j.user_id, j.status, j.created_at
FROM jobs j
LEFT JOIN users u ON u.id = j.user_id
WHERE u.id IS NULL;
```

## Freshness Checks

### Aitable Sync Lag
```sql
-- Oldest unsynced lead (shows max sync lag)
SELECT MIN("createdAt") as oldest_unsynced,
       NOW() - MIN("createdAt") as lag
FROM "Lead"
WHERE "syncedToAITable" = false;
```

### Health Check Freshness
```sql
-- Last health check per service
SELECT service_id, name, status, checked_at,
       NOW() - checked_at as age
FROM service_health
WHERE checked_at = (SELECT MAX(checked_at) FROM service_health sh WHERE sh.service_id = service_health.service_id)
ORDER BY checked_at DESC;
```
