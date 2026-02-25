# 📦 PRODUCT BIBLE

> **Single source of truth for Rensto products and services** (SaaS billing, agents, service offerings).
> For overall authority precedence, see [`brain.md`](../brain.md).
> **Rule**: Products are defined as **Agents** or **Applets**. Logic is programmatic; n8n is for prototypes only.

---

## 🎨 Design System & Visual Tokens

### Core Design Tokens — "Spotlight Dark Mode"
These tokens are the canonical source for all Rensto web applications (Next.js/React).
Verified against `apps/web/rensto-site/src/app/globals.css` and NotebookLM 286f3e4a + 719854ee.
```css
--rensto-bg-primary: #110d28
--rensto-bg-secondary: #1a1145
--rensto-text: #E5E7EB
--rensto-muted: #94A3B8
--rensto-red: #fe3d51          /* Primary brand red */
--rensto-orange: #bf5700       /* Secondary orange */
--rensto-blue: #1eaef7         /* Accent blue */
--rensto-cyan: #5ffbfd         /* Accent cyan */
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
*   **Architecture**: Kie.ai Kling 3.0 (Video, start+end frame continuity) + Suno (Music) + Kling Elements (Identity, replaces Nano Banana).
*   **Production optimizations (Feb 2026)**: Force 1920x1080 normalization, floorplan exclusion from photo pool, Kling `last_frame` for inter-clip continuity, seamless concat (no crossfade), actual-duration text overlays, sentinel clip credit probe, CTA min 4s.
*   **Source of Truth**: `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md` + NotebookLM 0baf5f36.

### 🤖 Facebook Marketplace Autoposter
*   **Target**: High-volume marketplace sellers (UAD Garage Doors, Miss Party Rentals).
*   **Logic**: `fb marketplace lister/deploy-package/` (canonical), server at `/opt/fb-marketplace-bot/`
*   **Stack**: GoLogin SDK + Puppeteer 19 + ImageMagick phone overlays + PostgreSQL (`fb_listings`).
*   **Features**: AI-generated city-specific copy (Kie.ai Gemini 2.5 Flash), image variation pool (Kie.ai Seedream 4.5 Edit), DFW location rotation (30/20 cities), Telnyx phone rotation, dynamic phone overlay, price jitter (±10%), schedule randomization (±15min), per-profile cookies, cookie health monitoring, PM2 automated scheduler (60-min cycles).
*   **Lead Pipeline**: Telnyx Voice AI → Claude Sonnet analysis → Workiz CRM (UAD), email (MissParty). **DORMANT** — n8n workflows active but 0 executions, Telnyx routing unverified.
*   **Usage**: Credits per listing activation.
*   **Status**: LIVE — both customers posting as of Feb 20, 2026.

### 🏆 Winner Video Studio (AI Avatar Videos)
*   **Target**: Local businesses (first customer: Mivnim/Yossi — construction).
*   **Logic**: `apps/studio/` (standalone Next.js app)
*   **Architecture**: Audio upload → Gemini Brain (5-in-1: script, prompt, model router, music, quality) → Kie.ai (`avatar-pro` primary, `kling-3.0/video` fallback) → R2 storage → WhatsApp delivery via WAHA.
*   **Credit Cost**: 50 credits/video (same as TourReel).
*   **Status**: LIVE — pipeline verified Feb 19, 2026. `studio.rensto.com`.
*   **Source of Truth**: `PRODUCT_STATUS.md` §1, `.claude/skills/winner-studio/SKILL.md`.

### 📄 Lead Landing Pages
*   **Target**: Any Rensto customer needing a branded lead capture page.
*   **Logic**: `apps/web/rensto-site/src/app/lp/[slug]/` (SSR + client component)
*   **Architecture**: Dynamic `/lp/[slug]` → Prisma lookup → branded page (colors, logo, font, RTL/LTR) → lead form → `POST /api/leads/landing-page` → Lead record + WhatsApp (WAHA) + email (Resend) notifications.
*   **Status**: Infrastructure COMPLETE. Customer implementations in separate repos.
*   **Source of Truth**: `PRODUCT_STATUS.md` §4, `.claude/skills/lead-pages/SKILL.md`.

### 📞 FrontDesk Voice AI (Telnyx)
*   **Target**: Businesses needing AI receptionist / phone answering.
*   **Logic**: `apps/worker/src/services/telnyx.ts`, `apps/worker/src/queue/workers/frontdesk-poller.worker.ts`
*   **Architecture**: Telnyx AI Assistant (`meta-llama/Llama-3.3-70B-Instruct`) → KokoroTTS voice → call transfer to owner → conversation polling (BullMQ) → VoiceCallLog DB.
*   **Status**: Partial — voice assistant working, eSignatures not started.
*   **Source of Truth**: `.claude/skills/frontdesk-voice/SKILL.md`.

### 🔬 AgentForge (Internal Research Tool)
*   **Target**: Internal use only — powers Rensto's own development workflow.
*   **Logic**: `agentforge/` (spec only, code not started)
*   **Architecture**: Multi-stage AI research pipeline (business discovery → design analysis → market research → deliverable packaging).
*   **Status**: Spec only. Decision: keep internal, not customer-facing.

### 📱 SocialHub (Multi-Platform Social Media Management)
*   **Target**: All existing customers + new market.
*   **Logic**: `social app/` (spec only — 7 detailed docs)
*   **Architecture**: AI content creation (Claude + Kie.ai) → WhatsApp approval → 6-platform publishing → analytics → competitive intelligence.
*   **Status**: Spec COMPLETE, code NOT STARTED. Phase 2 product.
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

*Self-serving top-ups allow users to buy additional Credits. Stripe checkout handles subscriptions via `/api/video/subscribe`.*

---

## 4. The "Wasted Time" Archive (Product Lessons)

1.  **Care Plan Model (Legacy)**: Attempting to sell "Care Plans" for generic maintenance was lower margin than high-value SaaS agents. We now prioritize **autonomous results**.
2.  **Marketplace One-Offs**: Selling static "templates" (JSON exports) was hard to support. We moved to **Hosted Autonomous Agents** where we control the runtime (Antigravity).
3.  **Third-Party Dependencies**: Relying on FAL.ai or Midjourney webhooks caused frequent breaking changes. We now use **Kie.ai Direct Integration** for stability.

---

## 5. Deployment & Health
*   **Uptime**: Monitored via `HealthCheckSchema` (app, database, worker, stripe).
*   **Tenant Isolation**: All runs strictly isolated by `tenantId` in Postgres.
*   **Self-Healing**: Workers auto-retry failed Kling tasks; n8n alerts for critical engine failures.

---

## 6. Service Offerings (Revenue Streams)

| Type | Price | Status |
|------|-------|--------|
| **Marketplace** | $29-$3,500+ | Stripe LIVE |
| **Ready Solutions** | $890-$2,990+ | Stripe LIVE |
| **Subscriptions** | $79-$299/mo | Stripe LIVE |
| **Custom Solutions** | $3,500-$8,000+ | Stripe LIVE |
| **Content AI** | $297-$1,997/mo | In development |

### Customer Journey (4 Stages)
1. Awareness → Purchase (SEO, Stripe) ✅ LIVE
2. Purchase → Onboarding (Webhook, partial automation) ⚠️ 40–60%
3. Onboarding → Active (Portal) ❌ Not built
4. Active → Retention (Lifecycle) ❌ Not built

### Admin Portal
admin.rensto.com. Next.js, Tailwind, shadcn/ui. Auth: magic-link for ADMIN_EMAILS (service@rensto.com, admin@rensto.com). 14 tabs including dashboard, CRM, treasury, analytics, AI agents, support queue, launch control.
