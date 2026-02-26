# Spoke Discovery Decision

**Date**: February 23, 2026
**Context**: Agent Production Readiness Audit — Week 1
**Authority**: Blocks public launch until resolved

---

## The Problem

**Marketing claims Spoke is "live"**, but Spoke doesn't exist as a SuperSeller AI SaaS agent.

### What Exists
- ✅ **Winner Video Studio** (studio.superseller.agency)
  - Standalone product for single customer (Yossi/Mivnim)
  - Audio + photo → AI avatar video with lip-sync
  - Uses kie.ai `kling/ai-avatar-pro` model
  - Has own auth, credit system, database
  - Fully working (verified Feb 19, 2026)

### What Doesn't Exist
- ❌ **Spoke as SuperSeller AI SaaS agent**
  - No `/crew/spoke` page in superseller.agency
  - Not integrated with User.credits system
  - Not available in dashboard
  - No multi-tenant support

### Current Marketing
- ❌ `crew.ts` marked Spoke as `status: 'live'` (fraud risk)
- ❌ Pricing page shows "Spoke spokesperson video — 50 credits/video"
- ❌ Niche pages reference Spoke in crewMapping
- ⚠️ **Customers could try to order Spoke videos** → 404 or broken experience

---

## Fix Applied (Feb 23, 2026)

**Immediate action**: Changed Spoke status from `'live'` to `'coming-soon'` in crew.ts

This removes fraud risk — customers now see Spoke as "coming soon" instead of "live".

---

## Decision Needed

**Two paths forward:**

### Option A: Keep Spoke as Future Agent (Recommended)

**Action**: Leave as `'coming-soon'`, build later when capacity allows

**Pros**:
- No work required now
- Can focus on fixing existing agents (Forge, Market)
- Winner Studio already serves this use case for custom clients
- Can build when we have 3-5 customers requesting it

**Cons**:
- Marketing mentions Spoke in pricing/niches (minor cleanup needed)
- Can't offer spokesperson videos to general SaaS customers

**Timeline**: TBD (after Week 4 public launch)

---

### Option B: Build Spoke by Integrating Winner Studio

**Action**: Refactor Winner Studio to work as Spoke within SuperSeller AI SaaS

**Scope**:
1. **Multi-tenant support**:
   - Winner Studio is single-tenant (Yossi only)
   - Need to add `userId` to all tables, isolate data
   - Update auth to use SuperSeller AI's magic-link system

2. **Credit system integration**:
   - Wire to `User.credits` (deduct 50 credits per video)
   - Add refund logic on failure
   - Add credit pre-check before processing

3. **Dashboard integration**:
   - Add to superseller.agency/dashboard
   - Job history, video gallery, upload UI
   - WhatsApp/email notifications (already built for Forge)

4. **Database migration**:
   - Merge Winner Studio schema into SuperSeller AI Prisma schema
   - OR: Keep separate but add foreign key to User

**Pros**:
- Spoke becomes real (no longer vaporware)
- Can charge 50 credits/video to all customers
- Differentiates SuperSeller AI from competitors (avatar videos rare in SaaS)

**Cons**:
- 1-2 weeks of work (auth refactor, multi-tenant, credit wiring)
- Delays other critical work (Market credit wiring, quality benchmarks)
- Winner Studio is working for Yossi — refactor could break it

**Timeline**: 1-2 weeks (Week 2-3 if prioritized)

---

## Recommendation

**Choose Option A: Keep as "coming-soon"**

**Reasoning**:
1. **Higher priorities exist**:
   - Market needs credit system integration (broken billing)
   - Forge needs quality benchmarks + testing
   - Notification system just built, needs validation

2. **Winner Studio serves the use case**:
   - Already working for custom clients like Yossi
   - Can sell as custom integration ($1499/mo tier)
   - No urgency from general SaaS demand

3. **Sequential audit approach**:
   - Fix what's broken first (Market billing)
   - Build new agents later (after launch)

4. **Resource constraint**:
   - Building Spoke = 1-2 weeks
   - That delays Week 4 public launch
   - Better to launch with 2 solid agents (Forge, Market) than 3 half-built

**If customer demand emerges** (5+ requests for spokesperson videos), re-evaluate in Week 5.

---

## Next Actions

1. ✅ Spoke status changed to `'coming-soon'` in crew.ts (fraud risk removed)
2. [ ] Update PRODUCT_STATUS.md to reflect Spoke discovery
3. [ ] Update AGENT_PRODUCTION_READINESS_AUDIT.md (Spoke: not built, no audit needed)
4. [ ] Continue Week 1 audit (focus on Market credit wiring)

---

*Authority: Tier 2 (strategy-informing) | Owner: Shai | Updated: 2026-02-23*
