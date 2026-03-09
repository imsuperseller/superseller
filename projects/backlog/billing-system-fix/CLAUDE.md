# Backlog: Billing System Fix

> **Status**: 7 issues identified (Mar 8, 2026 audit)
> **Owner**: Projects 1 (Web) + 4 (Infrastructure)
> **Priority**: P1 — affects revenue potential for new customers

---

## Issues Found (prioritized)

### P0 — Define ClaudeClaw pricing
ClaudeClaw is deployed and operational. Elite Pro pays $2,000/mo (custom deal). No standardized price exists for selling ClaudeClaw to a second customer. Need: define per-seat or per-group pricing, add to PRODUCT_BIBLE.

### P0 — Enterprise plan tier in DB
Elite Pro, Wonder.care, Yoram, UAD are all custom deals. The `Entitlement.plan` field only supports "starter", "pro", "team". Need an "enterprise" value + a way to record custom deal terms (price, services, notes).

### P1 — Three product catalogs → pick one
`/api/checkout` reads from Aitable. DB has `ServiceManifest` table AND `Template` table. Three sources of "what we sell." Need to pick one canonical source and deprecate the others.

### P1 — FrontDesk credit deduction
Config says 5 credits/call (`FRONTDESK_CREDITS_PER_CALL=5`). This deduction is never actually fired. The `telnyx.ts` service doesn't call `CreditService.deductCredits()`.

### P2 — SocialHub PayPal plans
Phase 1 is live (FB publishing works) but there's no PayPal plan for SocialHub. $49/$99/$199/mo pricing is defined in PRODUCT_BIBLE as "future" but it needs to be wired before we can sell it.

### P2 — Remove `stripe` field from ServiceManifest
`ServiceManifest` Prisma model has `stripe Json` field — stale from pre-PayPal era. Confusing. Remove the field or rename to `payment Json`.

### P3 — FB Bot credit deduction
PRODUCT_BIBLE says "credits per listing activation" but this is nowhere in the code. Either implement it or remove the claim.

---

## Files Involved

```
apps/web/superseller-site/prisma/schema.prisma         ← enterprise plan, ServiceManifest
apps/web/superseller-site/src/lib/credits.ts           ← credit deduction
apps/worker/src/services/telnyx.ts                     ← FrontDesk deduction
apps/web/superseller-site/src/app/api/video/subscribe/route.ts   ← SocialHub plans
docs/PRODUCT_BIBLE.md                                  ← pricing definitions
```

---

## Execution Order

1. Define ClaudeClaw pricing in PRODUCT_BIBLE (doc only, 30 min)
2. Add `enterprise` Entitlement.plan + DB migration (1 hr)
3. Wire FrontDesk credit deduction in telnyx.ts (2 hrs)
4. Remove/rename `stripe` in ServiceManifest (30 min + migration)
5. Create SocialHub PayPal plans + billing gate (3 hrs)
6. Decide on FB Bot credit deduction (implement or remove claim)
