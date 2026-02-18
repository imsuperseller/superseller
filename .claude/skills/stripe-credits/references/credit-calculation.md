# Credit Calculation Logic

## Balance Equation
```
current_balance = initial_grant + topups - debits + refunds
```

## Deduction Flow
1. Check `users.credits_balance >= cost`
2. If insufficient: throw UnrecoverableError (no BullMQ retry)
3. Deduct: `UPDATE users SET credits_balance = credits_balance - cost`
4. Log: INSERT into usage_events (type='debit', amount=cost, jobId)

## Monthly Reset
- UsageService handles monthly credit reset on subscription renewal
- Reset does NOT carry over unused credits (use-it-or-lose-it)
- Reset grants full tier amount (500/1500/4000)

## Refund Policy
- Failed video jobs: full 50-credit refund
- Failed regen: full 10-credit refund
- Refund logged as UsageEvent type='refund'

## Edge Cases
| Case | Behavior |
|------|----------|
| Balance exactly equals cost | Allow (balance becomes 0) |
| Concurrent deductions | PostgreSQL row-level lock prevents double-spend |
| Subscription lapses | credits_balance frozen, no new jobs allowed |
| Top-up while subscribed | Added to current balance (no reset) |
