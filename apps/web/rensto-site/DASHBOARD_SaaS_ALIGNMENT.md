# Admin & User Dashboard — SaaS Alignment Assessment

**Date**: February 2026  
**Context**: Business pivot to self-serving SaaS (credit-based apps, TourReel, subscriptions). Dashboards were built for Custom Solutions / agency model.

---

## 1. Admin Dashboard (admin.rensto.com)

### Current State
| Area | Reality | Gap for SaaS |
|------|---------|--------------|
| **Data source** | 100% Firestore: `CUSTOM_SOLUTIONS_CLIENTS`, `USERS`, `DOWNLOADS`, `AUDITS` | Postgres migration "complete" but admin still uses Firestore. No Postgres stats. |
| **Revenue** | `amountPaid` from Custom Solutions + legacy users | No Stripe revenue, no credit revenue, no subscription MRR. |
| **Metrics** | Projects (active/completed), clients (total/new), invoices | All Custom Solutions–centric. No SaaS funnel. |
| **Tabs** | Workflows, Agents, CRM, Projects, Support, Fulfillment, Treasury, Vault, Launch Control, Ecosystem, Terry, n8n | Heavy on agency/custom. No Video Jobs, Credits, Product analytics. |

### Needed Changes (Priority Order)

| Priority | Change | Effort |
|----------|--------|--------|
| P0 | **Migrate admin stats to Postgres** — Replace Firestore in `getDashboardStats()` with queries to `User`, `entitlements`, `video_jobs`, Stripe-related tables. | Medium |
| P0 | **Revenue: include Stripe + credits** — Aggregate from `payments` / webhook data and credit top-ups. Show MRR, one-time, credits sold. | Medium |
| P1 | **Video jobs overview** — New tab or section: list recent `video_jobs`, status, user, listing. Link to worker/fulfillment. | Small |
| P1 | **Credit metrics** — Total credits sold, consumed, balance distribution. Per-product (e.g. TourReel) if tracked. | Small |
| P2 | **Simplify or archive** — Tabs like Treasury, Vault, Ecosystem may be legacy. Decide which to keep vs. collapse. | Low |

---

## 2. User Dashboard (/dashboard/[clientId])

### Current State
| Area | Reality | Gap for SaaS |
|------|---------|--------------|
| **Auth / ID** | `clientId` = Firestore doc ID. Token-based or session. | Self-serve users have `userId` (Postgres). `clientId` may not map. |
| **Data** | Firestore: USERS, CUSTOM_SOLUTIONS_CLIENTS, USAGE_LOGS, leads, outreach, secretary, content, knowledge | Postgres has `User`, `entitlements` (credits), `video_jobs`. Dashboard doesn't read these. |
| **Tabs** | Overview, Leads, Outreach, Secretary, Content, Knowledge, Solutions, Earnings | Built for pillars/engines/custom projects. No Credit balance, no "My Videos." |
| **Entitlements** | `pillars`, `engines`, `marketplaceProducts`, `customSolution`, `freeLeadsTrial` | New model: `creditsBalance`, app subscriptions (TourReel, etc.). Entitlements type is legacy. |

### Needed Changes (Priority Order)

| Priority | Change | Effort |
|----------|--------|--------|
| P0 | **Credit balance** — Show `entitlements.creditsBalance` from Postgres. Add "Credits" or "Usage" section/tab. | Small |
| P0 | **Unify identity** — Ensure `clientId` ↔ `userId` mapping for Postgres users. Magic link / session should resolve to Postgres User when applicable. | Medium |
| P1 | **My Videos** — List `video_jobs` for user. Reuse or extend `/dashboard/[clientId]/video` to read from worker DB or an API that proxies it. | Medium |
| P1 | **Extend entitlements** — Add `creditsBalance`, `subscriptions` (TourReel, etc.) to `UserEntitlements`. Drive tab visibility from these. | Small |
| P2 | **Conditional tabs** — Hide or de-emphasize Secretary/Content/Knowledge for pure SaaS users (e.g. TourReel-only). Show Credits + Videos prominently. | Low |
| P2 | **Purchase history** — Link to Stripe customer portal or show recent purchases from webhook-provisioned data. | Medium |

---

## 3. Structural Decisions

| Question | Recommendation |
|----------|----------------|
| **One vs. two user dashboards?** | Consider merging `/dashboard/[clientId]` and `/app/dashboard` long-term. Short-term: ensure SaaS users (magic link, Postgres) can reach a dashboard that shows credits + videos. |
| **Video standalone vs. embedded** | `/video/[jobId]` exists for shareable link. `/dashboard/[clientId]/video` embeds it. Keep both; ensure both can resolve user/job from Postgres when needed. |
| **Admin: Firestore → Postgres** | Must migrate. Admin stats and client list should come from Postgres (and Stripe) as source of truth. Firestore only as fallback during transition. |

---

## 4. Quick Wins (No Design Change)

1. **Admin**: Add API route that queries Postgres for `video_jobs` count, recent jobs, user count. Surface in overview.
2. **Admin**: Add API route for revenue from Stripe (if stored) or `payments` table. Show alongside Firestore revenue during migration.
3. **User**: Add Credit balance to Overview (fetch from `entitlements` via existing or new API). No new tab if not needed.
4. **User**: Ensure `/dashboard/[clientId]/video` works when `clientId` = Postgres `userId` (if that mapping exists).

---

## 5. References

- `src/app/admin/page.tsx` — Admin stats (Firestore)
- `src/app/dashboard/[clientId]/page.tsx` — User dashboard data (Firestore)
- `src/types/entitlements.ts` — Tab visibility (legacy model)
- `src/lib/credits.ts` — Credit service (Postgres)
- `apps/worker-packages/db` — video_jobs, users (worker DB)
- `prisma/schema.prisma` — User, entitlements (web DB)
