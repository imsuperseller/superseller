# FB Marketplace Bot → Market (7th Crew Member) Integration Plan

**Date**: February 23, 2026
**Scope**: Systemic integration of FB Marketplace Bot into Rensto's credit-based SaaS as the 7th crew member
**Authority**: Supersedes standalone pricing ($99/$299/$999)

---

## Executive Summary

FB Marketplace Bot is currently a **custom agency product** serving UAD and MissParty. This plan converts it into **Market**, the 7th crew member in Rensto's unified credit-based SaaS.

**Key changes**:
- ❌ **Remove**: 3 Stripe products (prod_U2EFmrdU4xFlTK, prod_U2EFxjzvGOvDsy, prod_U2EFS8dpDfqjVB)
- ✅ **Add**: Market to crew roster (25 credits/listing)
- ✅ **Update**: All pricing, business model, niche, and technical docs
- ✅ **Sync**: NotebookLM source documents (Notebooks #6, #8)

---

## I. Codebase Changes

### A. Core Data Files (CRITICAL)

| File | Change | Status |
|------|--------|--------|
| `apps/web/rensto-site/src/data/crew.ts` | Add Market crew member (25 credits/listing) | ⏳ Pending |
| `apps/web/rensto-site/src/data/pricing.ts` | Add Market to creditExamples for all 3 tiers | ⏳ Pending |
| `apps/web/rensto-site/src/data/niches.ts` | Add Market to crewMapping for e-commerce niches | ⏳ Pending |

**Market crew member spec**:
```typescript
{
  id: 'market',
  slug: 'market',
  name: 'Market',
  role: 'Marketplace Automation',
  tagline: 'Auto-pilot for Facebook Marketplace',
  description: 'Automatically generates unique product listings with AI copy, stealth images, and location rotation. Handles GoLogin sessions, multi-product catalogs, and 24/7 posting while you sleep.',
  accentColor: '#3b82f6', // Blue
  accentColorRgb: '59, 130, 246',
  iconName: 'ShoppingBag', // or 'Store'
  creditsPerTask: 25,
  taskUnit: 'listing',
  features: [
    'AI-generated copy per listing',
    '3× unique images with phone overlay',
    'GoLogin session management',
    'DFW location rotation (30+ cities)',
    'Multi-product catalog support',
    'Automated 24/7 scheduling',
  ],
  status: 'live',
  href: '/crew/market',
  demoVideo: '/videos/marketplace-posting.mp4',
  demoCaption: 'Real output — AI-generated FB Marketplace listing',
}
```

**Niches to include Market**:
- ✅ **Contractors** (selling tools, materials, surplus)
- ✅ **Auto Repair** (selling parts, used tires, fluids)
- ✅ **Home Services** (selling appliances, HVAC units)
- ❌ Realtors (don't sell on FB Marketplace)
- ❌ Locksmiths (service-only)
- ❌ Restaurants (service-only)
- ❌ Insurance (service-only)
- ❌ Dental (service-only)

### B. Frontend Pages & Components

| File | Change | Status |
|------|--------|--------|
| `apps/web/rensto-site/src/app/HomePageClient.tsx` | Change "6 crew members" → "7 specialized agents" or "Your AI department" | ⏳ Pending |
| `apps/web/rensto-site/src/app/(main)/crew/page.tsx` | Change "6 AI Agents" badge → "7 AI Agents" | ⏳ Pending |
| `apps/web/rensto-site/src/app/(main)/crew/[slug]/page.tsx` | Auto-generates Market detail page from crew.ts | ✅ No change |
| `apps/web/rensto-site/src/app/(main)/pricing/page.tsx` | Metadata: "6 crew" → "7 specialized agents" | ⏳ Pending |
| `apps/web/rensto-site/src/components/crew/CrewGrid.tsx` | Auto-renders from crew.ts | ✅ No change |
| `apps/web/rensto-site/src/components/crew/CrewHero.tsx` | Check for hardcoded "6" | ⏳ Pending |
| `apps/web/rensto-site/src/components/pricing/PricingSection.tsx` | Verify credit examples render Market | ⏳ Pending |
| `apps/web/rensto-site/src/components/pricing/CreditSlider.tsx` | Verify Market included in calculations | ⏳ Pending |
| `apps/web/rensto-site/src/components/niche/NicheCrewMapping.tsx` | Auto-renders from niches.ts | ✅ No change |

### C. Marketplace Customer Portal (REWIRE)

| File | Change | Status |
|------|--------|--------|
| `apps/web/rensto-site/src/app/(main)/dashboard/marketplace/page.tsx` | Remove subscription tier display, show User.credits balance | ⏳ Pending |
| `apps/web/rensto-site/src/app/api/marketplace/customer/products/route.ts` | Add credit check (User.credits >= 25) before product creation | ⏳ Pending |
| `apps/web/rensto-site/src/app/api/marketplace/customer/stats/route.ts` | Change subscription field → credit balance | ⏳ Pending |
| `apps/web/rensto-site/prisma/schema.prisma` | Remove MarketplaceCustomer.subscription field (use User.credits) | ⏳ Pending |

### D. Backend Integration (Credit Deduction)

| File | Change | Status |
|------|--------|--------|
| `fb marketplace lister/deploy-package/webhook-server.js` | Add credit check + deduction on getJobsHandler | ⏳ Pending |
| `apps/web/rensto-site/src/lib/credits.ts` | Verify deductCredits() supports Market agent | ⏳ Pending |
| `apps/worker/src/services/credits.ts` | Verify expense tracking includes Market | ⏳ Pending |

**Credit deduction flow**:
1. Bot requests job from webhook-server
2. Webhook checks User.credits >= 25
3. If yes: Generate listing (AI copy + 3 images + overlay)
4. Deduct 25 credits from User.credits
5. Log to CreditTransaction table
6. Return job to bot

### E. SEO & Metadata

| File | Change | Status |
|------|--------|--------|
| `apps/web/rensto-site/src/app/layout.tsx` | Update default meta description if it mentions "6 agents" | ⏳ Pending |
| `apps/web/rensto-site/src/app/sitemap.ts` | Verify /crew/market included | ⏳ Pending |
| `apps/web/rensto-site/src/app/robots.ts` | No change needed | ✅ N/A |

---

## II. Documentation Updates

### A. Master Docs (CRITICAL)

| File | Section | Change | Status |
|------|---------|--------|--------|
| `CLAUDE.md` | Tech Stack, Quick Reference | Update crew count, credit costs | ⏳ Pending |
| `docs/PRODUCT_BIBLE.md` | §1 Products, §2 Business Model, §3 Revenue | Integrate Market as 7th agent, 25 credits/listing | ⏳ Pending |
| `docs/BUSINESS_COVERAGE_INDEX.md` | §IV Financials, §VI Products | Add Market to product catalog, Stripe cleanup | ⏳ Pending |
| `docs/INFRA_SSOT.md` | If mentions FB Bot or crew count | Update to 7 agents, Market credit cost | ⏳ Pending |
| `DECISIONS.md` | New entry | Document decision to integrate Market vs standalone pricing | ⏳ Pending |
| `findings.md` | New entry | Document why standalone pricing was wrong approach | ⏳ Pending |
| `progress.md` | New entry | Log this integration work | ⏳ Pending |

### B. Skills

| File | Change | Status |
|------|--------|--------|
| `.claude/skills/marketplace-saas/SKILL.md` | Rewrite to reflect credit-based model, remove standalone tiers | ⏳ Pending |
| `.claude/skills/marketplace-saas/references/stripe-products.md` | Mark 3 products as DEPRECATED, add note to use main SaaS tiers | ⏳ Pending |
| `.claude/skills/stripe-credits/SKILL.md` | Add Market to agent list, 25 credits/listing | ⏳ Pending |
| `.claude/skills/tourreel-pipeline/SKILL.md` | No change (Market not video) | ✅ N/A |

### C. Platform/Marketplace Docs

| File | Change | Status |
|------|--------|--------|
| `platforms/marketplace/PLATFORM_BIBLE.md` | Add section on SaaS integration, credit-based billing | ⏳ Pending |
| `platforms/marketplace/WEEK_2_COMPLETE.md` | Add note: "SUPERSEDED by credit integration plan" | ⏳ Pending |
| `platforms/marketplace/CLIENT_ONBOARDING.md` | Update with credit-based onboarding flow | ⏳ Pending |
| `PRODUCT_STATUS.md` | §2 FB Marketplace Bot | Add credit integration status | ⏳ Pending |

### D. Technical Docs

| File | Change | Status |
|------|--------|--------|
| `docs/DATA_DICTIONARY.md` | Update MarketplaceCustomer schema (remove subscription field) | ⏳ Pending |
| `docs/API_ROUTES.md` | Update marketplace API route descriptions | ⏳ Pending |
| `REPO_MAP.md` | If mentions FB Bot or crew count | Update references | ⏳ Pending |

---

## III. NotebookLM Source Document Updates

**Affected Notebooks**:
- **#6**: rensto website (14 sources) — business model, pricing, crew
- **#8**: Master: Social Media, Lead Gen & Marketing (49 sources) — FB Marketplace

**Process**:
1. Identify which source documents in these notebooks mention pricing, crew count, or FB Marketplace Bot
2. Update those source documents in the codebase
3. Use NotebookLM MCP to sync updated docs to notebooks
4. Verify notebook queries return updated info

**Key source docs to update** (likely in Notebook #6):
- `docs/PRODUCT_BIBLE.md`
- `apps/web/rensto-site/src/data/pricing.ts`
- `apps/web/rensto-site/src/data/crew.ts`
- Any business model markdown in `docs/operations/business/`

**Notebook sync command** (via notebooklm-mcp):
```bash
# Update source in Notebook #6
notebooklm-mcp update-source --notebook 719854ee-b94e-4555-9b2b-48ae136335b8 --source <sourceId> --file docs/PRODUCT_BIBLE.md
```

---

## IV. Stripe Changes

### A. Archive Products

| Product ID | Name | Price | Action | Status |
|------------|------|-------|--------|--------|
| `prod_U2EFmrdU4xFlTK` | FB Marketplace Bot - Starter | $99/mo | Archive via Stripe API | ⏳ Pending |
| `prod_U2EFxjzvGOvDsy` | FB Marketplace Bot - Pro | $299/mo | Archive via Stripe API | ⏳ Pending |
| `prod_U2EFS8dpDfqjVB` | FB Marketplace Bot - Enterprise | $999/mo | Archive via Stripe API | ⏳ Pending |

### B. No New Products Needed

Use existing main SaaS products:
- `price_1T49maDE8rt1dEs1yoVGzIfL` (Starter $299/mo, 500 credits)
- `price_1T49maDE8rt1dEs1ysQsHB9U` (Pro $699/mo, 1,500 credits)
- `price_1T49mbDE8rt1dEs1Z3eQ8aid` (Enterprise $1,499/mo, 4,000 credits)

---

## V. Database Schema Changes

### A. Prisma Schema Updates

| Model | Field | Change | Status |
|-------|-------|--------|--------|
| `MarketplaceCustomer` | `subscription` | Remove (use User.credits instead) | ⏳ Pending |
| `MarketplaceCustomer` | `credits` | Remove (use User.credits instead) | ⏳ Pending |
| `MarketplaceCustomer` | `userId` | Keep (FK to User) | ✅ No change |
| `User` | `credits` | Already exists | ✅ No change |
| `CreditTransaction` | - | Already exists for logging | ✅ No change |

**Migration SQL**:
```sql
-- Remove redundant fields from marketplace_customers
ALTER TABLE marketplace_customers DROP COLUMN IF EXISTS subscription;
ALTER TABLE marketplace_customers DROP COLUMN IF EXISTS credits;
```

---

## VI. Testing Checklist

### A. Frontend Tests

- [ ] Visit /crew page → verify 7 agents displayed
- [ ] Visit /crew/market page → verify Market detail page renders
- [ ] Visit /pricing page → verify Market in credit examples
- [ ] Visit niche pages (contractors, auto-repair, home-services) → verify Market in crewMapping
- [ ] Homepage FAQ → verify "7 specialized agents" or "your AI department" (no "6")

### B. Backend Tests

- [ ] Create marketplace product → verify credits deducted (25 per listing)
- [ ] Insufficient credits → verify error returned
- [ ] Credit transaction logged correctly
- [ ] Marketplace portal shows User.credits balance (not subscription tier)

### C. Stripe Tests

- [ ] 3 FB Marketplace Bot products archived
- [ ] New customer subscribes to Starter ($299) → gets 500 credits
- [ ] Can use credits for both video (50) and marketplace (25)

### D. Documentation Tests

- [ ] PRODUCT_BIBLE.md mentions Market as 7th agent
- [ ] NotebookLM #6 query "What are the crew members?" returns 7 agents
- [ ] BUSINESS_COVERAGE_INDEX.md updated
- [ ] All skill files reference credit-based model

---

## VII. Rollout Phases

### Phase 1: Codebase Updates (Day 1)
1. Add Market to crew.ts, pricing.ts, niches.ts
2. Update frontend copy ("6" → "7" or "your AI department")
3. Archive Stripe products
4. Deploy to production
5. **Verify**: /crew page, /pricing page, niche pages

### Phase 2: Backend Integration (Day 2)
1. Remove subscription/credits fields from MarketplaceCustomer
2. Wire webhook-server to User.credits
3. Add credit checks + deduction
4. Test with UAD/MissParty accounts
5. **Verify**: Credits deducted, transactions logged

### Phase 3: Documentation (Day 3)
1. Update all MD files (PRODUCT_BIBLE, BUSINESS_COVERAGE_INDEX, skills, etc.)
2. Update NotebookLM source docs
3. Sync to notebooks #6 and #8
4. **Verify**: Query notebooks for updated info

### Phase 4: Migration of Existing Customers (Day 4)
1. Migrate UAD and MissParty to main SaaS subscriptions
2. Grant appropriate credit balances
3. Test full flow (product creation → posting → credit deduction)
4. **Verify**: Both customers can post without issues

---

## VIII. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| NotebookLM out of sync | AI queries return old pricing | Update source docs first, sync immediately |
| Hardcoded "6 agents" in copy | Broken messaging | Global search for "6" and "six" in all frontend files |
| Existing customers on old pricing | Confusion | Clear migration email, credit balance setup |
| Credit costs too high/low | Usage issues | Monitor usage patterns first 2 weeks, adjust if needed |
| Stripe products not fully archived | Confusion in dashboard | Verify archive status via Stripe API |

---

## IX. Success Metrics

- ✅ All 7 crew members visible on /crew page
- ✅ Market included in all pricing tier examples
- ✅ 3 Stripe products archived
- ✅ MarketplaceCustomer wired to User.credits
- ✅ Credits deducted correctly (25 per listing)
- ✅ NotebookLM queries return "7 agents" or "specialized AI department"
- ✅ No references to "$99/$299/$999" standalone pricing anywhere in codebase or docs
- ✅ UAD and MissParty migrated to credit-based system
- ✅ Zero customer-facing errors during migration

---

## X. File Inventory

**Total files to update**: 47

**Breakdown**:
- Code (TS/TSX): 15 files
- Markdown (docs): 18 files
- Skills: 3 files
- Database: 1 schema file
- Stripe: 3 products (API)
- NotebookLM: 2 notebooks (source sync)
- Testing: 5 verification scripts

**Estimated effort**: 2-3 days (with thorough testing)

---

*Generated: 2026-02-23 | Authority: Tier 1 (execution plan) | Owner: Shai*
