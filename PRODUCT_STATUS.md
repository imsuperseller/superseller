# Product & Customer Status — Living Tracker

**Purpose**: Single source of truth for every product's status, customer, blockers, and next action. Read this FIRST when resuming work. Updated after every task.

**Rule**: Never ask "what's next?" — read this file. Never ask "where are we?" — read this file.

---

## Priority Order (Deliver to customers FIRST, then self-serve SaaS)

1. Winner Video Studio → Yossi (Mivnim) — ✅ PIPELINE WORKING (avatar-pro verified, fallback ready)
2. FB Marketplace Bot → Miss Party + UAD — LIVE (posting + lead pipeline both operational)
3. TourReel → Realtors — LIVE (production quality overhaul complete Feb 24)
4. Lead Landing Pages → Generic infrastructure complete, customer implementations in separate repos — DONE (100%)
5. RAG Integration → All products — ENABLER (built but unused)
6. AgentForge → Internal only — LOW (spec only, powers our dev)
7. SocialHub → All customers — PHASE 2 (spec complete, distribution layer for all products)

---

## 1. Winner Video Studio

**Customer**: Yossi (Mivnim — construction/building company)
**Tenant**: `mivnim`
**User ID**: `4a2b0683-6d7a-4f55-a5e9-ac6e49a40a6a`
**What it does**: Business uploads audio + reference photo → AI generates short-form video with lip-synced avatar
**Brand voice**: "Poscas Winner" (hardcoded in Gemini brain)

**Status**: PIPELINE FULLY WORKING — End-to-end verified Feb 19, 2026

**What works**:
- Auth (WhatsApp OTP + magic link)
- Upload (R2 + file proxy)
- Gemini Brain (5-in-1: script, prompt, model router, music, quality)
- kie.ai task creation (clean proxy URLs)
- Callback handler + DB updates
- WhatsApp delivery (sendVideo) ✅ Verified working
- Credit system (atomic ledger, refund on failure)
- `kling/ai-avatar-pro` model — BACK ONLINE as of Feb 19 evening, lip-sync working
- `kling-3.0/video` model — working (text+image, no lip-sync)
- Automatic fallback: avatar model fails → falls back to kling-3.0/video (no lip-sync but produces video)
- Full pipeline verified: upload → Gemini brain → avatar-pro → R2 download → WhatsApp delivery → COMPLETE

**Bugs fixed (Feb 19)**:
- Removed invalid `mode` param from avatar-pro input
- Fixed CALLBACK_BASE_URL newline (printf not echo)
- Switched presigned URLs to file proxy (clean URLs for kie.ai)
- Added WAV MIME type inference in upload
- Replaced `after()` with `waitUntil` + separate process endpoint
- Added avatar→kling-3.0 automatic fallback in processCallbackFailure
- Fixed `model_fallback` event_type in DB CHECK constraint
- studio.superseller.agency alias live (SSL provisioning async)

**Known issues**:
- ~~R2 bucket not publicly accessible (401 on direct URLs)~~ — RESOLVED: R2 bucket public access enabled Feb 2026 (r2.dev domain working)
- Resend sender verification pending for magic-link emails

**Next actions**:
- [ ] R2 public access: Enable in Cloudflare dashboard for winner-video-studio bucket
- [ ] Resend: Verify studio@superseller.agency sender for magic-link emails
- [ ] Test with Yossi's real content (real audio recording, his photo)
- [ ] Gallery page: serve videos via file proxy since R2 isn't public

**Live URLs**: https://studio.superseller.agency | https://studio-teal-eight-38.vercel.app
**Deploy**: `cd apps/studio && npx vercel --prod --yes`

---

## 2. FB Marketplace Bot

**Customers**: Miss Party (Michal Kacher Szender), UAD Garage Doors (David Szender)
**What it does**: Auto-posts product listings to Facebook Marketplace using GoLogin browser profiles with AI-generated content, dynamic images, and DFW location rotation
**Status**: LIVE AND POSTING — Both customers verified Feb 20, 2026

---

### Feature Readiness Matrix

#### A. Posting Pipeline (Core)

| # | Feature | UAD | MissParty | Notes |
|---|---------|-----|-----------|-------|
| A1 | GoLogin browser profile | OK | OK | Profile IDs in bot-config.json |
| A2 | Per-profile cookie injection | OK | OK | `cookies_uad.json`, `cookies_missparty.json` — no cross-contamination |
| A3 | Facebook form fill (title, price, desc, phone) | OK | OK | Typed fields + React file chooser |
| A4 | Category validation (exact dropdown match) | OK "Miscellaneous" | OK "Inflatable Bouncers" | Must match FB dropdown exactly |
| A5 | Condition field | OK | OK | Hardcoded "New" |
| A6 | Location entry (city typed + dropdown select) | OK | OK | `, TX` → `, Texas` conversion, char-by-char typing |
| A7 | Image upload (3 images) | OK | OK | JPEG optimized, React file chooser |
| A8 | Video upload | OK `video.mp4` | OK `michal_video.mp4` | Static files on server |
| A9 | Form submission / publish | OK | OK | Verified: posts appear on FB Marketplace |
| A10 | Status tracking (queued → posted/failed) | OK | OK | PostgreSQL `fb_listings` table |
| A11 | WhatsApp notification on post | OK | OK | Via WAHA to `14695885133@c.us` |

#### B. Content Uniqueness (Stealth)

| # | Feature | UAD | MissParty | Notes |
|---|---------|-----|-----------|-------|
| B1 | AI-generated title per city | OK | OK | Kie.ai Gemini 2.5 Flash, unique per posting |
| B2 | AI-generated description per city | OK | OK | Professional tone (UAD), fun party tone (MissParty) |
| B3 | Phone number rotation | OK (4 Telnyx numbers) | N/A (1 fixed) | Sequential rotation |
| B4 | DFW city rotation | OK (30 cities) | OK (20 cities) | Sequential rotation |
| B5 | Main image phone overlay | OK | OK | ImageMagick banner with rotated phone + subtitle |
| B6 | Image 2 variation pool | OK (6 variations) | OK (6 variations) | Kie.ai Seedream 4.5 Edit, random per posting |
| B7 | Image 3 variation pool | OK (6 variations) | OK (6 variations) | 36 total variations across both clients (6 images × 6 variations) |
| B8 | Main image (img 0) variation | OK (6 variations) | OK (6 variations) | Overlay applied on random varied base from pool |
| B9 | Video variation | GAP | GAP | Static video file, same every posting |
| B10 | Price variation | OK (±10%, $25 rounding) | OK (±10%, $5 rounding) | Random ±10% of base price, rounded to nearest $25 (UAD) or $5 (MissParty) |
| B11 | AI prompt: no emojis | OK | OK | Both prompts explicitly say "No emojis" — verified clean output |
| B12 | Posting schedule randomization | OK | OK | ±15 min jitter on cycle interval, ±3 min on product cooldown |

#### C. Scheduling & Rate Limits

| # | Feature | UAD | MissParty | Notes |
|---|---------|-----|-----------|-------|
| C1 | PM2 automated scheduler | OK | OK | `fb-scheduler` — 60-min cycle |
| C2 | Per-product cooldown | OK (15 min) | OK (30 min) | Configured in bot-config.json |
| C3 | Post limit per cycle | OK (5 posts) | OK (3 posts) | Configured in bot-config.json |
| C4 | Stealth level config | OK "moderate" | OK "high" | Higher stealth = fewer posts, longer cooldowns |
| C5 | Random schedule jitter | OK (±15 min cycle, ±3 min cooldown) | OK | Prevents predictable posting patterns |

#### D. Session Management

| # | Feature | UAD | MissParty | Notes |
|---|---------|-----|-----------|-------|
| D1 | Cookie persistence after posting | OK | OK | Saved to per-profile file + GoLogin API |
| D2 | Session refresh (password-only) | OK | OK | `refresh-session.js` — no 2FA needed |
| D3 | First-time login (2FA) | OK | OK | `interactive_login.js` + noVNC approval |
| D4 | Cookie staleness detection | OK | OK | `cookie-monitor.js` — checks every 6h: c_user+xs present, file age, last post time, recent failures |
| D5 | Auto session refresh on stale | OK | OK | Auto-triggers `refresh-session.js` + WhatsApp alert when cookies missing/stale |
| D6 | GoLogin proxy | OK | OK | `geo.floppydata.com:10080` — part of fingerprint, NEVER change |

#### E. Lead Pipeline (Inbound) — LIVE (Feb 22, 2026)

| # | Feature | UAD | MissParty | Notes |
|---|---------|-----|-----------|-------|
| E1 | Telnyx AI Assistant call handling | OK | OK | Autonomous AI assistants ("Sarah") on Telnyx — NOT n8n webhooks. Qwen model, Deepgram STT, NaturalHD voice |
| E2 | Conversation polling (n8n) | OK | OK | Schedule trigger every 15 min polls Telnyx Conversation API |
| E3 | Claude AI lead analysis | OK | OK | Claude Sonnet 4.5 analyzes transcripts — urgency, category, caller info extraction |
| E4 | CRM integration | OK (Workiz) | N/A (email only) | Workiz is UAD-only (auth_secret in JSON body, PascalCase fields). MissParty uses email to shai@superseller.agency — no CRM |
| E5 | Email lead notification | OK | OK | Outlook email to shai@superseller.agency with full analysis |
| E8 | Conversation deduplication | OK | OK | "Filter New Conversations" Code node — tracks processed IDs in static data, skips re-processed conversations. No more spam emails. |
| E6 | Voice AI agent | N/A | N/A | "Hope" agent (MqMYMeA9U9PEX1cH) is for SuperSeller AI sales, NOT for customer calls |
| E7 | PostgreSQL lead storage | GAP | GAP | No bridge from n8n to PostgreSQL — leads stay in n8n/Workiz/email |

#### F. Infrastructure

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| F1 | PM2 `webhook-server` (port 8082) | OK | Job serving + AI content + overlay |
| F2 | PM2 `fb-scheduler` | OK | 60-min automated cycles |
| F3 | PM2 `image-pool` | OK | Variation pool — fills on startup, refills every 30 min |
| F3b | PM2 `cookie-monitor` | OK | Cookie health check every 6h + WhatsApp alert + auto-refresh |
| F4 | nginx image server (port 8080) | OK | Serves static + variations + overlays |
| F5 | PostgreSQL `fb_listings` | OK | Job queue + status tracking |
| F6 | Kie.ai API (`KIE_API_KEY`) | OK | Single key for Gemini Flash + Seedream 4.5 Edit |
| F7 | WAHA WhatsApp | OK | Notifications to owner |
| F8 | n8n lead analysis workflows | OK | UAD (U6EZ2iLQ4zCGg31H) + MissParty (9gfvZo9sB4b3pMWQ) — ACTIVE, 5 triggers each, executing successfully |
| F9 | PM2 dump saved | OK | Survives server restart |

#### G. Productization Gaps (to sell to new customers)

| # | Gap | Impact | Effort |
|---|-----|--------|--------|
| G1 | No admin UI — jobs inserted via raw SQL | Can't onboard non-technical customers | HIGH |
| G2 | No self-serve onboarding — requires SSH + GoLogin + manual config | Every new client needs manual setup | HIGH |
| G3 | No dashboard/analytics — no visibility into post success rate | Can't show ROI to customers | MEDIUM |
| G4 | No billing/credits integration | Can't charge customers | MEDIUM |
| G5 | ~~No automated cookie refresh~~ | ~~CLOSED~~ — `cookie-monitor.js` checks every 6h, auto-triggers `refresh-session.js` + WhatsApp alert | DONE |
| G6 | No duplicate detection — same listing can be queued multiple times | Wastes posts + risks FB ban | LOW |
| G7 | No error retry logic — failed posts stay failed | Lost posting opportunities | LOW |
| G8 | bot-config.json is manual JSON editing for new clients | Error-prone onboarding | LOW |
| G9 | No multi-account support beyond 2 — untested at scale | Unknown scaling issues | UNKNOWN |

---

### Summary Scores

| Area | UAD | MissParty |
|------|-----|-----------|
| **A. Posting Pipeline** | 11/11 | 11/11 |
| **B. Content Stealth** | 11/12 | 11/12 |
| **C. Scheduling** | 5/5 | 5/5 |
| **D. Session Mgmt** | 6/6 | 6/6 |
| **E. Lead Pipeline** | 7/8 (1 gap) | 6/8 (1 gap) |
| **F. Infrastructure** | 10/10 | 10/10 |
| **TOTAL** | **50/52 (96%)** | **49/52 (94%)** |

**Remaining gaps for current customers:**
1. B9 — Video variation (static file every posting — complex, would need Kie.ai video-to-video or multiple video files)
2. E7 — No PostgreSQL lead storage bridge — leads stay in n8n/Workiz/email

**Gaps for productization (G1-G4, G6-G9):** Separate effort — admin UI, billing, onboarding flow. G5 (cookie refresh) is now CLOSED.

---

**Location**: `fb marketplace lister/deploy-package/` (canonical code)
**Server**: `/opt/fb-marketplace-bot/` on 172.245.56.50
**Deploy**: `rsync` to RackNerd or `scp` individual files
**PM2 apps**: `webhook-server`, `fb-scheduler`, `image-pool`, `cookie-monitor`
**API docs**: NotebookLM 3e820274 (KIE.AI)

---

## 3. TourReel

**Customers**: Realtors (general market)
**What it does**: Zillow URL → AI generates cinematic property tour video with realtor compositing

**Status**: LIVE and WORKING (kling-3.0/video)

**What works**:
- Full pipeline: Zillow scrape → Gemini floorplan analysis → clip prompts → Kling Elements (identity) → Kling 3.0 video (with end-frame continuity) → force 1920x1080 normalize → seamless concat → R2 upload
- 25+ completed videos exist
- Auth + credits (50/video, 10/regen)
- Video player with 4 format downloads (16:9, 9:16, 1:1, 4:5)

**Quality fixes applied**:
- Pool-first → 5 opening candidates
- Double realtor → DUPLICATE_FIGURE_NEGATIVE
- Realtor spatial → SPATIAL_ANCHOR
- 720p blur → Kling Pro 1080p
- Robotic movement → room-as-star guidance
- Near-square resolution → force 1920x1080 explicit normalization (Feb 24)
- Floorplan in video → exclude from photo pool at detection + construction (Feb 24)
- No inter-clip continuity → Kling `last_frame` end-frame morphing (Feb 24)
- Crossfade → seamless concat with boundary frames, zero transitions (Feb 24)
- Overlay timing wrong → actual measured clip durations (Feb 24)
- CTA too short → minimum 4 seconds visible (Feb 24)
- Sentinel clip → probe Kie.ai credits before batch (Feb 24)

**Remaining work**:
- [x] Text overlays (FFmpeg drawtext implemented, dynamic marketing captions active)
- [ ] Email notifications on completion (Resend partial)
- [ ] User testing of full flow
- [x] PayPal checkout integration for pricing tiers (migrated from Stripe Feb 2026)

**Live URL**: https://superseller.agency/video/create
**Worker**: pm2 `tourreel-worker` on 172.245.56.50:3002
**Deploy**: `git push` (auto) or `deploy-to-racknerd.sh` (worker)

---

## 4. Lead Landing Pages

**Product**: Generic landing page infrastructure for customer lead capture
**What it does**: Dynamic `/lp/[slug]` landing pages with per-customer branding, lead capture, dual-channel notifications (WhatsApp + email)

**Status**: 100% Infrastructure Complete — Generic product code ready, customer implementations in separate repos

**What exists**:
- [x] `LandingPage` model in Prisma (`landing_pages` table) with full branding config
- [x] Dynamic `/lp/[slug]` page — reads branding from DB, renders customer-branded RTL/LTR page
- [x] `/api/leads/landing-page` POST endpoint — validates, creates Lead, sends notifications
- [x] Lead records use existing `Lead` model with `source: "landing_page"`, `sourceId: slug`
- [x] Admin LeadsTab shows landing page leads automatically
- [x] Per-customer customization: colors, logo, font, headlines, CTA, testimonials, steps, compliance footer, locale/direction (RTL/LTR)
- [x] Dual-channel notifications: WAHA WhatsApp (primary) + Resend email (fallback)
- [x] SEO meta tags (customizable title + description, robots: index/follow)
- [x] Analytics tracking: view counter + submission counter in DB
- [x] ui-ux-pro-max design system integration for palette + typography recommendations
- [x] Mobile-responsive with Framer Motion animations
- [x] WhatsApp floating action button (MicroExpanderFAB component)

**What's missing**:
- [ ] Content generation via RAG (niche-specific knowledge)
- [ ] PayPal billing per landing page
- [ ] Admin UI to create/edit landing pages (currently DB-seeded via scripts)

**Location**:
- Route: `apps/web/superseller-site/src/app/lp/[slug]/page.tsx`
- Component: `apps/web/superseller-site/src/app/lp/[slug]/LandingPageClient.tsx`
- API: `apps/web/superseller-site/src/app/api/leads/landing-page/route.ts`
- Schema: `apps/web/superseller-site/prisma/schema.prisma` (LandingPage + Lead models)

**Note**: Customer-specific landing page implementations (strategy docs, seed scripts, assets) live in their own private repositories — not in SuperSeller AI. The generic `/lp/[slug]` infrastructure is the SuperSeller AI product.

---

## 5. RAG (Ollama + pgvector)

**Status**: LIVE infrastructure, ZERO products connected

**What's built**:
- Ollama nomic-embed-text (768-dim) on RackNerd
- pgvector 0.8.1 with HNSW indexes
- 5 API endpoints: ingest, search, list, delete, delete-by-source
- Multi-tenant isolation via tenant_id
- Hybrid search (vector 0.7 + full-text 0.3)
- Chunking: recursive splitter, 400 tokens, 12% overlap

**How it should connect**:
- **Winner Studio**: Ingest Yossi's brand docs → Gemini brain uses them for script tone
- **Lead Pages**: Ingest niche knowledge → personalized landing page copy
- **FB Bot**: Ingest product catalogs → auto-generated marketplace listing descriptions
- **TourReel**: Ingest listing details beyond Zillow → richer video scripts

**Next actions**:
- [ ] Pick first integration: Winner Studio (Gemini brain context from RAG)
- [ ] Ingest Mivnim brand materials via /api/rag/ingest
- [ ] Update Gemini brain prompt to include RAG context

**Health**: `curl http://172.245.56.50:11434/api/tags` (Ollama) + `/api/rag/search` (API)

---

## 6. AgentForge

**Status**: Spec only (5 Word docs + Prisma schema + seed)
**Purpose**: Internal AI web development agent — should power SuperSeller AI's own dev workflow, NOT a separate product
**Location**: `agentforge/`

**Decision**: Keep internal. Don't build as customer-facing product.

---

## 7. SocialHub (Social Media Management Platform)

**Customer**: All existing customers + new market
**What it does**: AI content creation → WhatsApp approval → 6-platform publishing → analytics → competitive intelligence → social inbox
**Location**: `social app/` (spec only — 7 detailed docs: blueprint, API contracts, DB schema, frontend spec, integrations spec, worker spec, CLAUDE.md)

**Status**: Spec COMPLETE, code NOT STARTED

**What the spec covers**:
- AI content creation (Claude Sonnet/Haiku + kie.ai for media)
- 3 creation modes: AI, Manual, Hybrid
- WhatsApp approval loop (WAHA Pro, 2-level approval)
- Multi-platform publishing (Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube)
- Analytics engine (own metrics + competitor scraping via Apify)
- Competitive intelligence (Meta Ad Library winning ads)
- Social inbox (unified comments, AI-suggested replies)
- Smart scheduling (optimal posting times from engagement data)
- SEO optimization module
- 23 DB tables, 45+ API endpoints, 15+ BullMQ job queues

**Strategic role**: Content distribution layer for ALL products:
- Winner Studio videos → distribute across social channels
- TourReel videos → publish to realtor's social + YouTube
- Lead Pages → social content drives traffic to landing pages
- FB Bot handles Marketplace, SocialHub handles organic social

**Architecture decision**: Build as `apps/socialhub/` (like `apps/studio/`), NOT standalone
- Reuse existing auth (WhatsApp OTP + magic link, NOT Clerk)
- Same PostgreSQL instance (new tables)
- BullMQ worker on RackNerd alongside tourreel-worker
- New admin dashboard tab "Social"

**SaaS pricing** (future):
- Free: 1 org, 3 posts/mo, 1 platform
- Pro ($49/mo): 3 orgs, 50 posts, 4 platforms, smart scheduling
- Business ($199/mo): Unlimited, all platforms, competitive intelligence

**Priority**: Phase 2 — build AFTER existing customer products are delivered and validated

**Next actions**:
- [ ] Decision: first customer (Yossi/Mivnim? SuperSeller AI dogfooding?)
- [ ] Decision: auth system (reuse existing vs Clerk for org-switching)
- [ ] Create `apps/socialhub/` scaffold when ready
- [ ] Migrate DB schema from spec to Prisma/Drizzle
- [ ] Build core content creation pipeline first

---

## Infrastructure Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Web | https://superseller.agency | LIVE |
| Admin | https://admin.superseller.agency | LIVE |
| Studio | https://studio-teal-eight-38.vercel.app | LIVE |
| Worker | http://172.245.56.50:3002 | LIVE |
| Ollama | http://172.245.56.50:11434 | LIVE |
| n8n | https://n8n.superseller.agency | BACKUP |
| Redis | Docker on RackNerd (auth: 2ea94441a41477c9b8081659) | LIVE |
| PostgreSQL | Docker on RackNerd (admin/a1efbcd564b928d3ef1d7cae/app_db) | LIVE |

---

## Self-Serve SaaS Conversion Plan

**Phase 1 (NOW)**: Deliver working products to existing customers. Get them using and validating.
**Phase 2**: Once validated, add onboarding flows, PayPal billing, self-serve signup.
**Phase 3**: Marketing — each happy customer becomes a case study + referral source.

**Shared infrastructure to extract**:
- Auth (magic-link + WhatsApp OTP) → `packages/core/auth`
- Credits (atomic ledger) → `packages/core/credits`
- Kie.ai wrapper → `packages/core/kie`
- WAHA (WhatsApp) → `packages/core/waha`

---

*Updated: 2026-02-22. Update after every task.*
