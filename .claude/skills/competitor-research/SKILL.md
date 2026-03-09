# Competitor Ad Research Pipeline

Multi-tenant competitor ad research system: scrape Meta Ads Library, filter by longevity, AI-analyze with two-pass pipeline, store in PostgreSQL, collect client feedback via interactive rating page, feed insights into content strategy.

---

## Architecture

```
Apify Scraper (Meta Ads Library)
  → Longevity Filter (14d+ = proven)
  → Pass 1: Haiku 4.5 (extraction)
  → Pass 2: Sonnet 4.6 (replication briefs, top ads only)
  → PostgreSQL `competitor_ads` (multi-tenant via tenant_id)
  → Rating Page `/compete/[tenantSlug]` (Hebrew UI, dark glassmorphism)
  → Client Feedback → RAG Update → Content Strategy
```

**Apify Actor**: `curious_coder/facebook-ads-library-scraper` — pay-per-result, $0.75/1K ads, 18K users, 4.7 rating. No monthly subscription.

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/worker/src/services/meta-ads-scraper.ts` | Apify client — scrapeMetaAdsLibrary(), normalizeAd(), formatAdsForWhatsApp() |
| `apps/worker/src/scripts/elite-pro-competitor-scrape.ts` | Template scraper script (clone for new customers) |
| `apps/web/superseller-site/src/app/compete/[tenantSlug]/page.tsx` | Interactive rating page (Hebrew, glassmorphism, progress tracking) |
| `apps/web/superseller-site/src/app/compete/[tenantSlug]/_components/CompetitorAdCard.tsx` | Individual ad card with like/dislike + feedback note |
| `apps/web/superseller-site/src/app/api/compete/ads/[tenantSlug]/route.ts` | REST API: GET (list ads) + PATCH (rate ad) |
| `apps/worker-packages/db/src/schema.ts` | Drizzle schema — `competitorAds` table definition |

---

## Database Schema (`competitor_ads`)

```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id     TEXT NOT NULL          -- multi-tenant key (e.g. "elite-pro-remodeling")
ad_id         TEXT                   -- Meta Ad Library archive ID
page_name     TEXT                   -- advertiser name
ad_url        TEXT                   -- link to ad in Meta Ad Library
ad_text       TEXT                   -- ad copy body
ad_title      TEXT                   -- headline
image_url     TEXT                   -- creative image URL
video_url     TEXT                   -- creative video URL
cta_text      TEXT                   -- call-to-action button text
start_date    TEXT                   -- when the ad started running
platforms     TEXT                   -- JSON array of platforms (facebook, instagram, etc.)
liked         BOOLEAN               -- client rating (null = pending, true = liked, false = disliked)
feedback_note TEXT                   -- free-text feedback from client
feedback_by   TEXT                   -- reviewer name
feedback_at   TIMESTAMPTZ           -- when feedback was given
meta          JSONB DEFAULT '{}'    -- stores daysRunning, longevityTier, aiAnalysis (pass 1 + pass 2)
created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**Indexes**: `idx_competitor_ads_tenant` (tenant_id), `idx_competitor_ads_liked` (tenant_id, liked).

---

## Adding a New Customer

1. **Create tenant slug** — lowercase, hyphenated (e.g. `acme-plumbing-dfw`).

2. **Clone the template scraper**:
   ```bash
   cp apps/worker/src/scripts/elite-pro-competitor-scrape.ts \
      apps/worker/src/scripts/<customer>-competitor-scrape.ts
   ```

3. **Customize the new script**:
   - Set `TENANT_ID` to the tenant slug.
   - Update `SEARCH_TERMS` for the customer's industry and market area.
   - Update `WHATSAPP_GROUP_ID` if sending results to a WhatsApp group.
   - Adjust `MAX_ADS_PER_TERM` and `MIN_DAYS_RUNNING` if needed.
   - Update the Pass 2 prompt context (company name, team members, USP, brand voice).

4. **Run the scraper**:
   ```bash
   cd apps/worker && npx tsx src/scripts/<customer>-competitor-scrape.ts
   ```

5. **Share the rating page**: `https://superseller.agency/compete/<tenant-slug>` — no auth required, reviewer identifies by name. Hebrew UI by default.

6. **Collect feedback** — client rates ads as liked/disliked with optional notes. Feedback stored in `competitor_ads` table and accessible via the API.

7. **Feed into content strategy** — use liked ads as templates for content creation. Disliked ads inform what to avoid.

---

## Longevity Tiers

Most Facebook ads are short-lived tests. Filtering by longevity isolates ads that actually work.

| Tier | Days Running | Meaning |
|------|-------------|---------|
| testing | <14 days | Still being tested — ignore |
| promising | 14-29 days | Past initial test phase, showing some signal |
| strong | 30-59 days | Proven performer — consistently spending |
| winner | 60-89 days | Top performer — high confidence |
| evergreen | 90+ days | Perennial winner — study and replicate |

**Key stat**: ~47% of ads die within 14 days. The longevity filter eliminates noise and surfaces only proven creative.

---

## AI Analysis Pipeline

### Pass 1: Haiku 4.5 — Fast Extraction

- **Model**: `claude-haiku-4-5-20251001`
- **Cost**: ~$0.003/ad (~$0.15 for 50 ads)
- **Max tokens**: 500
- **Applied to**: Top 50 ads sorted by days running
- **Extracts** (JSON):
  - `hookType`: curiosity, emotion, outcome, problem, testimonial, transformation, before-after, educational, social-proof, urgency
  - `angle`: pain-focused, benefit-focused, transformation, authority, comparison, lifestyle, value-proposition
  - `emotionalTone`: aspirational, urgent, trustworthy, friendly, professional, luxury, down-to-earth
  - `visualStyle`: before-after, project-showcase, team-photo, testimonial-video, text-overlay, lifestyle, raw-footage, stock-photo
  - `colorPalette`, `textOverlay`, `layoutType`, `copyThemes`
  - `overallScore` (1-10) + `scoringReason`

**Vision**: Supports image analysis via URL. **Limitation**: Facebook CDN (`fbcdn.net`, `facebook.com`) blocks Claude via robots.txt — these URLs are skipped. Non-Facebook-hosted images work fine.

### Pass 2: Sonnet 4.6 — Deep Replication Briefs

- **Model**: `claude-sonnet-4-6`
- **Cost**: ~$0.035/ad (~$0.35 for 10 briefs)
- **Max tokens**: 400
- **Applied to**: Top 10 ads by overallScore (minimum score 4)
- **Generates**: Actionable replication brief (3-5 sentences) covering:
  1. What specifically makes the ad work
  2. How the customer should adapt the approach (specific scenes, angles, team members)
  3. What to change/improve vs the competitor's version

**Rate limiting**: 200ms delay between Pass 1 calls, 300ms between Pass 2 calls.

---

## 3-3-3 Framework

For each high-scoring competitor ad concept, generate creative variations:

**3 Hooks** (how to open):
- Pattern interrupt / curiosity gap
- Direct benefit / outcome
- Pain point / problem agitation

**3 Angles** (perspective):
- Transformation (before/after)
- Authority (expertise, credentials)
- Social proof (testimonials, results)

**3 Formats** (creative type):
- Static image / carousel
- Short-form video (Reel/Story)
- Long-form video (walkthrough/testimonial)

= **27 creative variations per winning concept**. Prioritize based on client feedback from the rating page.

---

## Integration Points

### Content Calendar (`content_entries` table)
- Liked competitor ads with replication briefs feed into content planning
- Each brief maps to specific content types (Reel, Story, Carousel)
- The 3-3-3 framework generates the variations

### Model Observatory
- Static images: Nano Banana 2 / Recraft
- Short video: Kling Pro / Standard
- Voice-over: ElevenLabs via Kie.ai
- Text generation: Claude Haiku/Sonnet

### Approval Workflow
- Rating page feedback flows to WhatsApp group summary
- Client preferences (liked/disliked patterns) inform RAG context
- RAG-powered content suggestions respect client taste

---

## Cross-Reference: Instagram Content Rules

Competitor research feeds directly into Instagram content strategy via 3 PostgreSQL tables:
- **`ig_content_rules`** (44 rules) — platform constraints that replication briefs must respect (5 hashtag limit, no copyrighted music for business accounts, caption visible limits)
- **`hashtag_sets`** (10 sets) — niche-specific hashtag sets; select based on competitor ad industry/vertical
- **`caption_templates`** (8 templates) — format-specific templates (carousel, Reel, Story, feed) aligned with 3-3-3 framework outputs

When generating replication briefs (Pass 2), reference `ig_content_rules` to ensure briefs comply with current platform rules. Research doc: `docs/INSTAGRAM_RULES_2025_2026.md`. Seed script: `tools/seed-ig-content-rules.ts`.

---

## Costs

| Component | Unit Cost | Typical Volume | Cost |
|-----------|-----------|---------------|------|
| Apify scraping | $0.75/1K ads | ~1K ads (10 terms x 100) | ~$0.10 |
| Haiku Pass 1 | ~$0.003/ad | 50 ads | ~$0.15 |
| Sonnet Pass 2 | ~$0.035/ad | 10 briefs | ~$0.35 |
| **Total per customer research** | | | **~$0.60** |

Costs scale linearly. Running monthly refresh for 5 customers = ~$3/month.

---

## Credentials

| Key | Location |
|-----|----------|
| Apify API token | `apps/worker/.env` as `APIFY_API_TOKEN` |
| Apify user ID | `wjz2NfU1Y0MdMxeey` |
| Anthropic API key | `apps/worker/.env` as `ANTHROPIC_API_KEY` |
| PostgreSQL | `apps/worker/.env` as `DATABASE_URL` |

---

## Running the Pipeline

```bash
# Full research for a customer
cd apps/worker && npx tsx src/scripts/<customer>-competitor-scrape.ts

# The script handles all 4 phases:
# Phase 1: Apify scrape (Meta Ads Library)
# Phase 2a: Haiku extraction (text + vision)
# Phase 2b: Sonnet replication briefs (top 10)
# Phase 3: PostgreSQL storage
# Phase 4: WhatsApp summary + rating page link
```

**Rating page**: `https://superseller.agency/compete/<tenant-slug>` — no deploy needed, dynamic route serves any tenant.
