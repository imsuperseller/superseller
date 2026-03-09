# 📦 PRODUCT BIBLE

> **Single source of truth for SuperSeller AI products and services** (SaaS billing, agents, service offerings).
> For overall authority precedence, see [`brain.md`](../brain.md).
> **Rule**: Products are defined as **Agents** or **Applets**. Logic is programmatic; n8n is for prototypes only.

---

## 🎨 Design System & Visual Tokens

### Core Design Tokens — "Spotlight Dark Mode"
These tokens are the canonical source for all SuperSeller AI web applications (Next.js/React).
Verified against `apps/web/superseller-site/src/app/globals.css` and NotebookLM 286f3e4a + 719854ee.
```css
--superseller-bg-primary: #110d28
--superseller-bg-secondary: #1a1145
--superseller-text: #E5E7EB
--superseller-muted: #94A3B8
--superseller-red: #fe3d51          /* Primary brand red */
--superseller-orange: #bf5700       /* Secondary orange */
--superseller-blue: #1eaef7         /* Accent blue */
--superseller-cyan: #5ffbfd         /* Accent cyan */
--border: rgba(255,255,255,0.08)
--radius: 1rem
--shadow: 0 10px 30px rgba(0,0,0,0.25)
```

### Motion & Interaction
- **Animations (GSAP)**: Fade-up (power3.out, 0.9s, stagger 0.08s).
- **Parallax**: Subtle on scroll for hero/benefit sections.
- **Micro-animations**: Logo glow (CSS keyframes).

---

## 🏗️ Product Mission Pillars
All products must align with one of these tactical pillars:
1.  **Lead Machine**: Sourcing and analyzing purchase intent (e.g., Lead Machine, FB Autoposter).
2.  **Voice AI**: Autonomous consultations and sales routing (e.g., Telnyx secretarial agents).
3.  **Knowledge Engine**: Deep RAG and intelligence retrieval (e.g., YouTube/Document Cloner).
4.  **Content Engine**: High-engagement video/social production (e.g., TourReel, Celebrity Selfie).

---

## 2. Core SaaS Products (Verified Specs)

### 🎥 TourReel (Property Video Walkthrough)
*   **Target**: Real Estate agents / Zillow listings.
*   **Logic**: `apps/worker/src/queue/workers/video-pipeline.worker.ts`
*   **Architecture (dual-path)**:
    *   **AI Clip Path**: Kie.ai Kling 3.0 (Video, start+end frame continuity) + Suno (Music) + Kling Elements (Identity). Kling Elements (USE_KLING_ELEMENTS=1) is the active approach for realtor identity in video clips. Nano Banana is PAUSED (per DECISIONS.md) -- kept in codebase as fallback.
    *   **Remotion Composition Path (NEW Feb 2026)**: React-based programmatic video engine. Photos → Ken Burns animation → branded intro/outro → TransitionSeries → 4 native aspect ratios → H.264 MP4. Zero API cost, deterministic, ~60s render for 55s video. See `docs/REMOTION_BIBLE.md`.
*   **Production optimizations (Feb 2026)**: Force 1920x1080 normalization, floorplan exclusion from photo pool, Kling `last_frame` for inter-clip continuity, seamless concat (no crossfade), actual-duration text overlays, sentinel clip credit probe, CTA min 4s.
*   **Source of Truth**: `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md` + NotebookLM 0baf5f36.

### 🤖 Facebook Marketplace Autoposter
*   **Target**: High-volume marketplace sellers (UAD Garage Doors, Miss Party Rentals).
*   **Logic**: `fb-marketplace-lister/deploy-package/` (canonical), server at `/opt/fb-marketplace-bot/`
*   **Stack**: GoLogin SDK + Puppeteer 19 + ImageMagick phone overlays + PostgreSQL (`fb_listings`).
*   **Features**: AI-generated city-specific copy (Kie.ai Gemini 2.5 Flash), image variation pool (Kie.ai Seedream 4.5 Edit), DFW location rotation (30/20 cities), Telnyx phone rotation, dynamic phone overlay, price jitter (±10%), schedule randomization (±15min), per-profile cookies, cookie health monitoring, PM2 automated scheduler (60-min cycles).
*   **Lead Pipeline**: Telnyx Voice AI → Claude Sonnet analysis → Workiz CRM (UAD), email (MissParty). **LIVE AND ACTIVE** — n8n workflows executing successfully, Telnyx AI Assistants handling inbound calls autonomously. Updated Feb 2026: Pipeline active for UAD + MissParty via n8n workflows.
*   **Usage**: Credits per listing activation.
*   **Status**: LIVE — both customers posting as of Feb 20, 2026.

### 🏆 Winner Video Studio (AI Avatar Videos)
*   **Target**: Local businesses (first customer: Mivnim/Yossi — construction).
*   **Logic**: `apps/studio/` (standalone Next.js app)
*   **Architecture**: Audio upload → Gemini Brain (5-in-1: script, prompt, model router, music, quality) → Kie.ai (`avatar-pro` primary, `kling-3.0/video` fallback) → R2 storage → WhatsApp delivery via WAHA.
*   **Credit Cost**: 50 credits/video (same as TourReel).
*   **Status**: BUILT, NOT ACTIVELY USED — pipeline verified Feb 19, 2026. Yossi (Mivnim) not actively using. `studio.superseller.agency`.
*   **Source of Truth**: `PRODUCT_STATUS.md` §1, `.claude/skills/winner-studio/SKILL.md`.

### 📄 Lead Landing Pages
*   **Target**: Any SuperSeller AI customer needing a branded lead capture page.
*   **Logic**: `apps/web/superseller-site/src/app/lp/[slug]/` (SSR + client component)
*   **Architecture**: Dynamic `/lp/[slug]` → Prisma lookup → branded page (colors, logo, font, RTL/LTR) → lead form → `POST /api/leads/landing-page` → Lead record + WhatsApp (WAHA) + email (Resend) notifications.
*   **Status**: Infrastructure COMPLETE. Customer implementations in separate repos.
*   **Source of Truth**: `PRODUCT_STATUS.md` §4, `.claude/skills/lead-pages/SKILL.md`.

### 🌐 Landing Page Creation (Service Offering)
*   **Target**: Any small business needing a professional landing page (not just SuperSeller customers).
*   **Pricing Tiers**:
    | Tier | Price | Includes |
    | :--- | :--- | :--- |
    | **Starter** | $500/mo | Basic 1-section landing page, custom colors/logo, WhatsApp lead capture, 1 revision |
    | **Professional** | $1,000/mo | 3-5 sections, testimonials, video embed, RTL/LTR support, email capture, 2 revisions |
    | **Enterprise** | $2,000+/mo | Unlimited sections, custom design, A/B testing, analytics dashboard |
*   **Margin**: ~85-90% (near-zero COGS — programmatic generation).
*   **Status**: READY FOR SALE — infrastructure complete, **design upgrade needed before launch** (current visual quality 5.2/10).
*   **Blocker**: Design quality must reach 7+/10 before actively selling to customers.

### 📞 FrontDesk Voice AI (Telnyx)
*   **Target**: Businesses needing AI receptionist / phone answering.
*   **Logic**: `apps/worker/src/services/telnyx.ts`, `apps/worker/src/queue/workers/frontdesk-poller.worker.ts`
*   **Architecture**: Telnyx AI Assistant (`meta-llama/Llama-3.3-70B-Instruct`) → KokoroTTS voice → call transfer to owner → conversation polling (BullMQ) → VoiceCallLog DB.
*   **Status**: Partial — voice assistant working, eSignatures not started.
*   **Source of Truth**: `.claude/skills/frontdesk-voice/SKILL.md`.

### 🔬 AgentForge (Internal Research Tool)
*   **Target**: Internal use only — powers SuperSeller AI's own development workflow.
*   **Logic**: `agentforge/` (spec only, code not started)
*   **Architecture**: Multi-stage AI research pipeline (business discovery → design analysis → market research → deliverable packaging).
*   **Status**: Spec only. Decision: keep internal, not customer-facing.

### 📱 SocialHub / Buzz (Social Media Management)
*   **Target**: All existing customers + new market.
*   **Logic**: `apps/web/superseller-site/src/app/api/social/` (generate, publish, webhook/approval routes)
*   **Architecture**: AI content creation (Claude text + Kie.ai images) → WhatsApp approval (WAHA) → Facebook + Instagram publishing (Graph API) → Aitable analytics sync.
*   **Status**: LIVE — Phase 1 operational (text+image generation, WhatsApp approval, FB publish). Instagram code written but not active. Phase 2 (LinkedIn, X, TikTok, YouTube, competitive intelligence, smart scheduling) not started.
*   **Source of Truth**: `PRODUCT_STATUS.md` §7, `.claude/skills/socialhub/SKILL.md`.

---

## 3. SaaS Billing & Credit Logic (Postgres-Driven)

Products operate on a **Credit-Based Subscription** system. Credits are the universal currency.

| Plan | Price | Credits | Tier Name | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | $79/mo | 500 | 5 videos | SMB / Solo |
| **Pro** | $149/mo | 1,500 | 15 videos | Established Business |
| **Team** | $299/mo | 4,000 | 50 videos | High-Volume / Agency |

### Per-Product Credit Costs
| Product | Credits per Unit |
| :--- | :--- |
| **TourReel** (video) | 50 credits/video |
| **TourReel** (regen clip) | 10 credits/scene |
| **FB Autoposter** | Credits per listing activation |

*Self-serving top-ups allow users to buy additional Credits. PayPal checkout handles subscriptions via `/api/video/subscribe` (migrated from Stripe Feb 2026).*

---

## 4. The "Wasted Time" Archive (Product Lessons)

1.  **Care Plan Model (Legacy)**: Attempting to sell "Care Plans" for generic maintenance was lower margin than high-value SaaS agents. We now prioritize **autonomous results**.
2.  **Marketplace One-Offs**: Selling static "templates" (JSON exports) was hard to support. We moved to **Hosted Autonomous Agents** where we control the runtime (Antigravity).
3.  **Third-Party Dependencies**: Relying on FAL.ai or Midjourney webhooks caused frequent breaking changes. We now use **Kie.ai Direct Integration** for stability.

---

## 5. Deployment & Health
*   **Uptime**: Monitored via `HealthCheckSchema` (app, database, worker, paypal).
*   **Tenant Isolation**: All runs strictly isolated by `tenantId` in Postgres.
*   **Self-Healing**: Workers auto-retry failed Kling tasks; n8n alerts for critical engine failures.

---

## 6. Service Offerings (Revenue Streams)

| Type | Price | Status |
|------|-------|--------|
| **Marketplace** | $29-$3,500+ | PayPal LIVE |
| **Ready Solutions** | $890-$2,990+ | PayPal LIVE |
| **Subscriptions** | $79-$299/mo | PayPal LIVE |
| **Custom Solutions** | $3,500-$8,000+ | PayPal LIVE |
| **Landing Page Creation** | $500-$2,000+/mo | READY (design upgrade needed) |
| **SocialHub/Buzz** | $49-$199/mo (future) | Phase 1 LIVE (FB publish) |

### Customer Journey (4 Stages)
1. Awareness → Purchase (SEO, PayPal) ✅ LIVE
2. Purchase → Onboarding (Webhook, partial automation) ⚠️ 40–60%
3. Onboarding → Active (Portal) ⚠️ Multi-tenant portal scaffolded (Feb 26), middleware + routes live
4. Active → Retention (Lifecycle) ❌ Not built

### Admin Portal
admin.superseller.agency. Next.js, Tailwind, shadcn/ui. Auth: magic-link for ADMIN_EMAILS (shai@superseller.agency, shai@superseller.agency). 14 tabs including dashboard, CRM, treasury, analytics, AI agents, support queue, launch control.

---

## 7. Financial Tools

- **QuickBooks**: CANCELLED (saves $600/yr). Not needed at current scale.
- **Primary**: PayPal reports + built-in `expense-tracker.ts` for cost tracking.
- **Backup**: Wave (free accounting software) if more reporting needed.

---

## 8. Distribution Roadmap

- **Poe (poe.com)**: Potential demo/lead-gen channel for SuperSeller AI agents. Roadmap item — not urgent. Could expose TourReel or AgentForge as Poe bots for discovery.
