# Follower Outreach Pipeline — Full Specification

**Purpose**: One-time full scrape of Shai's IG/FB followers → individual + aggregate research → prospect identification → outreach-ready DB. Sell SuperSeller products/services to Shai's personal-brand audience (Iran freedom, Persian-Jewish).

**Current state**: `follower_snapshots` has raw scraped data only. Baseline script was limited to 96 IG + 1 FB (wrong FB param + sample limits). Fixed: use `resultsLimit` for FB, `FULL_SCRAPE=1` for full baseline.

---

## Research Findings (Best Practices)

*Last updated: Mar 2026 — from 2026 sources (InfluenceFlow, Phantom Blog, Inro, Hootsuite, Apify, SociaVault)*

### Scraping & Technical Limits
- **Instagram**: Often stops returning after 10K–20K followers for large accounts (platform limit). Don't assume 25K+ is possible. Plan for 10K max for reliability.
- **Pagination**: 50–100 per request typical. Processing 10K+ can take 15–30 min due to rate limits.
- **Facebook**: No-login scrapers often return limited data; public follower lists may be restricted.

### Audience Segmentation
- **Base segments on what they say**, not just follower status. Follower lists alone tell you little—need profile bio, interests, conversation themes.
- **Psychographics > demographics**: How they think, feel, buy—values, beliefs, lifestyles—matter more than age/gender.
- **Avoid over-specific segments** that people don't self-describe (e.g. "wants to be overachiever at work").
- **Multi-channel**: People present differently on IG vs FB. Analyze both; don't over-index one platform.

### Prospect Scoring (CRM Best Practice)
- **Three dimensions**: (1) Fit — who they are, ICP match; (2) Behavior — engagement signals; (3) Timing — readiness to buy.
- Our data is thin (profile_url, name, follower_count). Enrichment (LLM research, profile bio) significantly improves scoring accuracy.
- Lead scoring with enriched data: 38–75% conversion improvement reported.

### Outreach (2026 benchmarks)
- **Semi-warm beats cold**: Engage-then-DM: 30–50% reply vs 10–25% for pure cold (Phantom 2026).
- **Engagement over reach**: 73% of marketers prioritize engagement/conversions over follower count (HubSpot 2026).
- **Cold DM automation risks**: Messages to non-followers land in Requests; low visibility (Inro 2026). Safer: comment-to-DM, story replies.
- **Personalization**: Hyper-personalized (video/Loom) 8–12% vs generic 1–2% (Phantom 2026).
- **DM structure**: Genuine opener → value prop (tip, resource) → soft ask.

### Compliance
- **ToS**: Meta prohibits unauthorized scraping. No-login tools reduce account risk but don't eliminate ToS concerns.
- **Data**: Public data only. GDPR applies if EU-targeted—lawful basis needed for personal data.
- **Recommendation**: Consult legal before commercial outreach from scraped data.

### Enrichment Batch Processing
- Typical batch: 50–500 per request. Rate limits common (e.g. 20/2s).
- Use conditional updates: only research `research_status = 'pending'`.
- Exponential backoff on 429. Async processing for large batches.

### Sources (Mar 2026)
- InfluenceFlow (2026 audience research, DM templates), Hootsuite (2026 target audience), Phantom Blog (cold outreach stats 2026), Inro (DM automation limits 2026), Apify/SociaVault (IG/FB scrapers 2026), DMTracker (outreach metrics).

---

## 1. Full One-Time Scrape (DONE / FIXED)

- **IG**: `iron-crawler/instagram-followers-scraper-no-login-needed` — 1 page ≈ 50. **Apify limit**: maxPages ≤ 100 (= ~5K). IG platform may stop at 10K–20K.
- **FB**: `apify/facebook-followers-following-scraper` — use `resultsLimit` (omit = unlimited). We were passing `maxItems` (wrong param) → got 1 result.
- **Run**: `FULL_SCRAPE=1 npx tsx src/scripts/follower-baseline-scrape.ts`
- **Cost**: IG $1.50/1K, FB $4.50/1K. 10K IG + 2K FB ≈ $15 + $9 = ~$24

---

## 1.5. Profile Enrichment (optional, before research)

- **Goal**: Get profile bio/description so research is based on **what they say**, not just name/handle.
- **Options**: (a) Apify IG profile scraper to fetch bio per user; (b) include bio in follower scrape if actor supports it; (c) skip and infer from handle/name only (weaker).
- **Batch**: 50–100 per batch, rate limit between calls.

## 1.6. Pre-filter (rule-based) — COST CUTTING

**Goal**: Skip LLM research for followers who are obviously not potential customers. Uses only scraped profile data (username, name, follower_count)—no API calls.

**We have from scrape**: `follower_username`, `follower_name`, `profile_url`. iron-crawler IG actor does NOT return `follower_count` in follower list (raw has username, full_name, is_private—no count). No bio.

### Exclude (set `research_status = 'skipped'`, `skip_reason` = reason)

| Rule | Reason |
|------|--------|
| `follower_count = 0` (when known) | Inactive/bot. **Don't skip on null**—IG scraper often omits count. |
| `follower_count < 50` (IG) | Unlikely creator/business |
| Username matches bot pattern | e.g. `^user\d+$`, `.*official.*fan.*`, `.*fan.*page.*` |
| Username + name both empty | No signal to research |
| Username is generic spam | e.g. `spam`, `test`, `unknown` |
| FB only: `title`/`subtitle` suggest fan page | "Fan of X", "Official fan" |

### Include (worth LLM research)

| Signal | Why |
|--------|-----|
| `follower_count >= 100` (IG) | More likely creator/business |
| Username contains biz keywords | `realtor`, `agency`, `media`, `co`, `realty`, `property`, `homes` |
| Name contains biz keywords | Same as above |
| Verified (if in `raw`) | Higher likelihood real business |

### Implementation

- Run pre-filter **after** scrape, **before** research worker.
- One SQL update or script: loop rows where `research_status = 'pending'`, apply rules, set `skipped` + `skip_reason`.
- **Cost saved**: If 60% are filtered → research only 4K of 10K → ~\$120 saved (4K × \$0.02).

### Tuning

- Start conservative (exclude only obvious bots/empty). Track false negatives (skipped but would have been good) via spot-checks.
- Relax `follower_count` threshold if Shai's audience skews nano (many legit creators with &lt;100 followers).

## 2. Individual Research (per follower)

For each follower in `follower_snapshots` **where** `research_status = 'pending'` (i.e. passed pre-filter):

- **Input**: profile_url, follower_username, follower_name, profile_pic_url, follower_count, **profile_bio** (if enriched)
- **Research**: LLM (Claude) analyzes to infer **psychographics** (values, interests, how they present)—not just demographics:
  - Who they are (creator, business owner, activist, consumer, etc.)
  - What they care about (from bio, handle patterns, name)
  - Likely fit for SuperSeller products (VideoForge, FB Bot, Lead Pages, AgentForge, etc.)
  - Relevance to Shai's niche (Iran freedom, Persian-Jewish, real estate, etc.)
- **Output**: Store in DB (see schema below). Batch 50–100, conditional on `research_status = 'pending'`.
- **Cost**: ~$0.01–0.03 per follower (Haiku). 10K followers ≈ $100–300

---

## 3. Aggregate Research (audience insights)

- **Input**: All individual research + follower stats
- **Output**: One summary per account/platform:
  - Demographics/segments (creators, business owners, activists, consumers)
  - Top interests, pain points, what they respond to
  - Best products to offer to each segment
  - Messaging angles (Iran freedom angle vs. Jewish content creator vs. real estate, etc.)
- **Store**: `audience_insights` table or JSON in Brand/meta

---

## 4. Prospect Identification

- **Criteria**: Follower is a good fit for at least one SuperSeller product (VideoForge, FB Bot, Lead Pages, AgentForge, FrontDesk, etc.)
- **Scoring (3-dim, CRM best practice)**:
  - **fit_score** (0–40): Who they are, ICP match (creator/business = higher)
  - **behavior_score** (0–30): Engagement signals—*future*: likes/comments on Shai's posts. Today: infer from follower_count, public presence
  - **timing_score** (0–30): Readiness signals. Today: limited; use recency of activity if available
  - **prospect_score** (1–10): Rollup for prioritization
- **warmth_tier** (optional): `cold` | `semi_warm` | `warm` — for outreach ordering. Semi-warm (engaged) gets 2–3x higher reply rates. Populate when we have engagement data.
- **Store**: Add columns to `follower_snapshots` or new `follower_prospects` table
- **Output**: Ordered list (warm first, then by prospect_score) ready for outreach

---

## 5. Outreach Phase (future)

- **Prioritize semi-warm**: If we scrape engagement (likes/comments on Shai's posts), outreach those first—30–50% reply vs 10–25% cold.
- **Personalization**: Reference specific content, name, mutual connection. Generic templates fail.
- **Message structure**: Genuine opener → value prop (tip, resource) → soft ask.
- **Avoid**: Bulk automation—risks message requests, shadowbans.
- Draft personalized DMs (IG/FB) or emails
- WAHA approval flow (Shai approves before send)
- Track: sent, replied, converted
- Link to Lead or OutreachCampaign when appropriate

---

## Schema Additions (proposed)

### Option A: Extend `follower_snapshots`

```sql
ALTER TABLE follower_snapshots ADD COLUMN profile_bio text;           -- from enrichment (optional)
ALTER TABLE follower_snapshots ADD COLUMN research_status text DEFAULT 'pending';  -- pending | done | skipped
ALTER TABLE follower_snapshots ADD COLUMN skip_reason text;           -- why skipped (pre-filter): bot, low_followers, etc.
ALTER TABLE follower_snapshots ADD COLUMN individual_research jsonb;  -- psychographics, who they are, fit
ALTER TABLE follower_snapshots ADD COLUMN fit_score integer;          -- 0-40 (3-dim scoring)
ALTER TABLE follower_snapshots ADD COLUMN behavior_score integer;     -- 0-30
ALTER TABLE follower_snapshots ADD COLUMN timing_score integer;       -- 0-30
ALTER TABLE follower_snapshots ADD COLUMN prospect_score integer;     -- 1-10 rollup
ALTER TABLE follower_snapshots ADD COLUMN prospect_reasons jsonb;      -- reasons, best_product
ALTER TABLE follower_snapshots ADD COLUMN warmth_tier text;            -- cold | semi_warm | warm (when engagement data)
ALTER TABLE follower_snapshots ADD COLUMN researched_at timestamptz;
```

### Option B: New `follower_research` table (normalized)

```sql
CREATE TABLE follower_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id uuid REFERENCES follower_snapshots(id),
  research_status text DEFAULT 'pending',
  individual_summary text,       -- psychographic summary
  fit_score integer,
  behavior_score integer,
  timing_score integer,
  prospect_score integer,
  prospect_reasons jsonb,
  best_product text,
  warmth_tier text,
  researched_at timestamptz
);
```

### Aggregate insights

```sql
CREATE TABLE audience_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text NOT NULL,
  platform text NOT NULL,
  scraped_at timestamptz NOT NULL,
  segments jsonb,           -- demographics, interests
  top_products jsonb,       -- which products fit each segment
  messaging_angles jsonb,
  created_at timestamptz DEFAULT now()
);
```

---

## Implementation Order

1. **Schema first** — Add research columns (Option A) or `follower_research` + `audience_insights`. Includes: fit/behavior/timing scores, warmth_tier, profile_bio, **skip_reason**.
2. **Full scrape** — Run `FULL_SCRAPE=1` baseline. IG maxPages: 200 (~10K). Verify returns.
3. **Pre-filter** — Rule-based: mark `skipped` + `skip_reason` for bots, empty, low_followers, etc. **Cuts research cost 50–70%**.
4. **Profile enrichment (optional)** — Scrape bios if available. Improves research quality.
5. **Individual research worker** — BullMQ: batch 50–100, **only rows with `research_status = 'pending'`**, rate limit, Claude → store.
6. **Aggregate research** — One-off: summarize psychographics → `audience_insights`.
7. **Prospect scoring** — Compute fit/behavior/timing → prospect_score, order by warmth_tier + score.
8. **Outreach** — Draft + approve + send (future). Prioritize semi-warm when engagement data exists.

---

## Cost Summary (estimate)

| Phase            | Unit cost        | Volume | Total    |
|------------------|------------------|--------|----------|
| Full scrape      | IG $1.50/1K, FB $4.50/1K | ~12K   | ~$24     |
| Pre-filter       | Free (rule-based) | 12K   | $0       |
| Profile enrichment | TBD (if added)   | 12K    | TBD      |
| Individual research | ~$0.02/follower  | ~4K (after pre-filter) | ~$80   |
| Aggregate research | ~$0.50/account   | 2      | ~$1      |
| **Total**        |                  |        | **~$105** (vs ~$265 without pre-filter) |

---

## Cross-Reference

- Competitor research: `.claude/skills/competitor-research/SKILL.md` — similar pattern (scrape → AI analysis → store)
- AgentForge: multi-stage research pipeline
- progress.md: Follower baseline section
