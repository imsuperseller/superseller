# Customer: GP Homes and Repairs — Local Business Digital Presence

> **Type**: Prospect — NEW LEAD (Mar 13, 2026)
> **Contact**: Nir Pariente + Ron Moyal (co-owners) | 469-444-7777 | gphomesandrepairs.com
> **Admin Project ID**: cmmozkiht0000jei9ozlm4nyt
> **Status**: PLANNING — research done, product to build

---

## Strategic Context

GP Homes' needs are NOT unique — they're the **universal local service business problem**. What we build here becomes a **reusable product template** for every contractor, HVAC company, salon, restaurant, etc. in DFW and beyond.

**Build it even if GP Homes doesn't buy.** The next 10 prospects need the same thing.

See also: memory file `project_local_biz_product_template.md` for the full product template rationale.

---

## What To Build (prioritized — REUSABLE for all local businesses)

### Phase 1: Report + Landing Page (can start NOW, no customer involvement needed)
1. **Business Intelligence Report** at `/report/gp-homes-repairs`
   - Same pattern as Hair Approach: `/report/hair-approach-dallas`
   - Pull from KNOWLEDGE.md — digital presence score (1.5/10), competitor gap, review analysis
   - Organic framing (never paid ads)
   - This becomes the sales tool: "Look what we found about your business"

2. **Landing Page** at `/lp/gp-homes-repairs`
   - Same pattern as `/lp/hair-approach`
   - Per-customer branding (their logo, colors from website)
   - Lead capture form → WhatsApp + email notification
   - Service overview pulled from KNOWLEDGE.md

3. **Competitor Research** via WhatsApp Group (NOT a /compete/ page)
   - Scrape competitor ads using Apify
   - AI sends ads as polls in WAHA WhatsApp group with customer
   - Customer reviews in-chat (like/dislike + feedback) — zero friction
   - AI agent processes responses → DB → triggers content strategy actions
   - Pattern: Elite Pro WhatsApp poll workflow (modern, not old-school webpage)

### Phase 2: Google Maps Automation Product (THE CORE PRODUCT — reusable)
4. **Competitor Review Monitor**
   - Apify scraper for Google Maps reviews of top 5 competitors
   - Claude AI sentiment analysis on new reviews
   - WAHA WhatsApp alerts when competitors get new reviews
   - Store in PostgreSQL (new tables: `local_biz_reviews`, `review_alerts`)

5. **Review Generation System**
   - QR code generator linking to Google review page
   - Automated follow-up sequence (WhatsApp or SMS via Telnyx)
   - Review request templates (post-service trigger)
   - Dashboard tracking: reviews requested vs received

6. **GBP Post Automation**
   - Scheduled posts to Google Business Profile via API
   - Content templates: before/after photos, tips, seasonal promotions
   - Approval flow via WhatsApp (same pattern as Elite Pro)

7. **Local SEO Dashboard**
   - Admin tab or standalone page showing:
     - Google Maps ranking position
     - Review count + sentiment trend
     - Competitor comparison
     - NAP consistency score
   - Can be Looker Studio initially, then custom admin tab

### Phase 3: Outreach Package (for selling to prospect)
8. **Pitch Deck / Proposal**
   - Auto-generated from KNOWLEDGE.md data
   - Show the gap: "You're top 7% in quality but invisible online"
   - Include competitor comparison, market opportunity, pricing tiers
   - WhatsApp-friendly format (PDF or link)

---

## Pricing Tiers (proposed — adjust per market)

| Tier | Price | Includes |
|---|---|---|
| Starter | $297/mo | Weekly competitor report, review monitoring, WhatsApp alerts |
| Growth | $497/mo | Daily monitoring, AI review responses, full dashboard |
| Premium | $797/mo | All above + GBP post automation, bi-weekly strategy calls |

**Operating cost**: $9-20/mo per client. Margin: 93-97%.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
projects/customers/gp-homes-repairs/**
```

### Will CREATE (when building phases)
```
apps/web/superseller-site/src/app/report/gp-homes-repairs/     → Report page
apps/web/superseller-site/prisma/ (migration)                   → local_biz_reviews, review_alerts tables
```

### CAN read (for context + patterns to reuse)
```
projects/customers/elite-pro-remodeling/CLAUDE.md    → WhatsApp approval pattern
apps/web/superseller-site/src/app/report/             → Existing report page pattern
apps/web/superseller-site/src/app/lp/                 → Existing landing page pattern
apps/web/superseller-site/src/app/compete/            → Existing compete page pattern
```

---

## Current Blockers

| Blocker | Who | Status |
|---------|-----|--------|
| None for Phase 1 | — | Can start immediately |
| Google Maps API key | Shai | Needed for Phase 2 (GBP automation) |
| Customer sign-up | Nir/Ron | Not yet pitched — build product first |

---

## What To Do In This Session

**If continuing from where we left off:**
1. Start Phase 1 — build the report page at `/report/gp-homes-repairs` (use Hair Approach as template)
2. Build landing page at `/lp/gp-homes-repairs`
3. Run competitor ad scrape via Apify for `/compete/gp-homes-repairs`

**For Phase 2 (Google Maps product):**
- Design the database schema for `local_biz_reviews` and `review_alerts`
- Build the Apify scraper for Google Maps competitor reviews
- Wire WAHA WhatsApp alerts for new competitor reviews
- Build the review generation QR code system

**Remember**: Everything built here is REUSABLE. Design for multi-tenant from day 1. Use `tenantSlug` pattern.

---

## Quick Reference

| Item | Value |
|------|-------|
| Phone | 469-444-7777 |
| Website | gphomesandrepairs.com |
| Address | 3624 Marwick Drive, Plano, TX 75075 |
| BuildZoom rank | Top 7% of 222,249 TX contractors |
| Digital presence score | 1.5/10 |
| Google reviews | Unknown (not on Google Maps local pack) |
| Facebook | 23 likes, 1 review, last post Oct 2024 |
| Instagram | None |
| Market | Plano TX, $146K avg household, $415K-$790K homes |
| Admin Project ID | cmmozkiht0000jei9ozlm4nyt |
