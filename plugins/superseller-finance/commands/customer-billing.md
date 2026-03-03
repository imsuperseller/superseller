---
name: Customer Billing Review
description: Review customer billing — subscription tier, PayPal status, credit balance, usage history, renewal date
---

# Customer Billing Review

Comprehensive billing review for a specific customer.

## Input

The user will provide a customer identifier: name, email, phone, or tenant slug.

## Process

### Step 1: Customer Identification

```sql
SELECT u.id, u.name, u.email, u.phone,
       t.name AS tenant_name, t.slug
FROM "User" u
LEFT JOIN "TenantUser" tu ON tu."userId" = u.id
LEFT JOIN "Tenant" t ON tu."tenantId" = t.id
WHERE u.name ILIKE '%<identifier>%'
   OR u.email ILIKE '%<identifier>%'
   OR u.phone LIKE '%<identifier>%'
   OR t.slug = '<identifier>';
```

### Step 2: Subscription Details

```sql
SELECT
  s.id AS subscription_id,
  s."planId" AS plan,
  s.status,
  s."stripeCustomerId" AS paypal_customer_id,
  s."stripeSubscriptionId" AS paypal_subscription_id,
  s."currentPeriodStart",
  s."currentPeriodEnd",
  s."cancelAtPeriodEnd",
  s."createdAt" AS subscribed_since
FROM "Subscription" s
WHERE s."userId" = '<user_id>'
ORDER BY s."createdAt" DESC;
```

Note: Column names retain `stripe*` prefix but store PayPal IDs since Feb 2026 migration.

### Step 3: Payment History

```sql
SELECT
  p.id,
  p.amount,
  p.currency,
  p.status,
  p."paymentMethod",
  p."createdAt" AS payment_date
FROM "Payment" p
WHERE p."userId" = '<user_id>'
ORDER BY p."createdAt" DESC
LIMIT 12;
```

### Step 4: Credit Ledger

```sql
SELECT
  ct.type,
  ct.amount,
  ct.description,
  ct."createdAt"
FROM "credit_transactions" ct
WHERE ct."userId" = '<user_id>'
ORDER BY ct."createdAt" DESC
LIMIT 20;
```

Calculate running balance:
```sql
SELECT
  COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END), 0) AS current_balance
FROM "credit_transactions"
WHERE "userId" = '<user_id>';
```

### Step 5: Monthly Credit Allotment

| Plan | Monthly Credits | Monthly Price |
|------|----------------|---------------|
| Starter | 300 | $79 |
| Pro | 800 | $149 |
| Team | 2,000 | $299 |

### Step 6: Usage Trend (Last 3 Months)

```sql
SELECT
  DATE_TRUNC('month', ul."createdAt") AS month,
  SUM(ul."creditsUsed") AS credits_used,
  COUNT(*) AS operations
FROM "UsageLog" ul
WHERE ul."userId" = '<user_id>'
  AND ul."createdAt" > NOW() - INTERVAL '3 months'
GROUP BY DATE_TRUNC('month', ul."createdAt")
ORDER BY month DESC;
```

## Output Format

```
CUSTOMER BILLING REVIEW
═══════════════════════
Customer:        [Name]
Email:           [Email]
Tenant:          [Tenant Name]

SUBSCRIPTION
  Plan:          [Starter / Pro / Team]
  Price:         $[79/149/299]/month
  Status:        [active / past_due / cancelled / trialing]
  PayPal Sub ID: [ID]
  Current Period: [Start] to [End]
  Auto-Renew:    [Yes / No — cancels at period end]
  Member Since:  [Date]

CREDIT BALANCE
  Current:       [X] credits
  Monthly Allot: [300/800/2000] credits
  Usage Rate:    [X]% of allotment used
  Estimated Runway: [X] days until exhaustion at current rate

PAYMENT HISTORY (Last 12)
  [Date]  $[Amount]  [Status]  [Method]
  [Date]  $[Amount]  [Status]  [Method]
  ...

CREDIT TRANSACTIONS (Recent)
  [Date]  [+/-Amount]  [Description]
  [Date]  [+/-Amount]  [Description]
  ...

USAGE TREND
  [Month 1]:  [X] credits ([Y] operations)
  [Month 2]:  [X] credits ([Y] operations)
  [Month 3]:  [X] credits ([Y] operations)

RECOMMENDATIONS
  [Any billing actions: upgrade suggestion, at-risk flag, credit top-up needed]
```

## Billing Actions

After review, the user may request:
- **Adjust credits**: Add or deduct credits manually in credit_transactions
- **Cancel subscription**: Via PayPal API
- **Upgrade/downgrade**: Create new PayPal subscription at different tier
- **Refund**: Via PayPal API for specific payment
- **Extend period**: Manual adjustment to currentPeriodEnd

Always confirm with the user before executing any billing changes.
