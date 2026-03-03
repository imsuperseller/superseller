---
name: Customer Status
description: Pull comprehensive customer health — subscription, credits, usage, products, contacts, and issues
---

# Customer Status

Pull a full customer health report including subscription tier, credit balance, recent usage, active products, last contact, and any open issues.

## Input

The user will provide a customer identifier: name, email, phone, or tenant slug.

## Process

### Step 1: Customer Profile

```sql
SELECT u.id, u.name, u.email, u.phone, u."createdAt",
       t.name AS tenant_name, t.slug AS tenant_slug, t.plan AS tenant_plan
FROM "User" u
LEFT JOIN "TenantUser" tu ON tu."userId" = u.id
LEFT JOIN "Tenant" t ON tu."tenantId" = t.id
WHERE u.name ILIKE '%<identifier>%'
   OR u.email ILIKE '%<identifier>%'
   OR u.phone LIKE '%<identifier>%'
   OR t.slug = '<identifier>';
```

### Step 2: Subscription & Billing

```sql
SELECT s.id, s."planId", s.status, s."stripeSubscriptionId" AS paypal_subscription_id,
       s."currentPeriodStart", s."currentPeriodEnd", s."cancelAtPeriodEnd",
       s."createdAt"
FROM "Subscription" s
WHERE s."userId" = '<user_id>'
ORDER BY s."createdAt" DESC
LIMIT 1;
```

Note: `stripeSubscriptionId` column stores PayPal IDs (migrated Feb 2026).

### Step 3: Credit Balance

```sql
SELECT
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) AS total_credits,
  COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) AS total_debits,
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS balance
FROM "credit_transactions"
WHERE "userId" = '<user_id>';
```

### Step 4: Active Products & Services

```sql
SELECT si.product, si.status, si.config, si."createdAt", si."updatedAt"
FROM "ServiceInstance" si
WHERE si."userId" = '<user_id>'
  AND si.status = 'active'
ORDER BY si.product;
```

### Step 5: Recent Usage (Last 30 Days)

```sql
SELECT ul.action, ul.product, ul."creditsUsed", ul."createdAt", ul.metadata
FROM "UsageLog" ul
WHERE ul."userId" = '<user_id>'
  AND ul."createdAt" > NOW() - INTERVAL '30 days'
ORDER BY ul."createdAt" DESC
LIMIT 20;
```

### Step 6: Last Contact

Check the most recent interaction across channels:

```sql
-- Last voice call
SELECT "createdAt", direction, duration, status
FROM "VoiceCallLog"
WHERE "userId" = '<user_id>'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Last content post (SocialHub activity)
SELECT "createdAt", platform, status
FROM "ContentPost"
WHERE "userId" = '<user_id>'
ORDER BY "createdAt" DESC
LIMIT 1;
```

### Step 7: Recent Leads (if applicable)

```sql
SELECT l.source, l.status, l."createdAt", l."customerName"
FROM "Lead" l
WHERE l."userId" = '<user_id>'
  AND l."createdAt" > NOW() - INTERVAL '30 days'
ORDER BY l."createdAt" DESC
LIMIT 10;
```

## Output Format

```
CUSTOMER HEALTH REPORT
──────────────────────
Name:           [Full Name]
Email:          [Email]
Phone:          [Phone]
Tenant:         [Tenant Name] ([slug])
Member Since:   [Date]

SUBSCRIPTION
  Plan:         [Starter $79 / Pro $149 / Team $299]
  Status:       [active / past_due / cancelled]
  PayPal ID:    [ID]
  Renews:       [Date] (or "Cancels at period end")

CREDITS
  Balance:      [X] credits remaining
  Used (30d):   [Y] credits
  Burn Rate:    [Z] credits/day avg

ACTIVE PRODUCTS
  - [Product 1] — [status] (since [date])
  - [Product 2] — [status] (since [date])

RECENT ACTIVITY (Last 30 Days)
  - [Date] [Action] ([credits used])
  - [Date] [Action] ([credits used])

LAST CONTACT
  Voice:    [Date] ([duration], [status])
  Social:   [Date] ([platform], [status])

HEALTH SCORE: [Green / Yellow / Red]
  [Reasoning: active usage, credit burn, subscription status, recency]
```

## Health Score Logic

- **Green**: Active subscription + used credits in last 7 days + no billing issues.
- **Yellow**: Active subscription but no usage in 14+ days, OR credit balance below 20% of monthly allotment.
- **Red**: Past due subscription, OR no usage in 30+ days, OR credits exhausted, OR cancellation pending.
