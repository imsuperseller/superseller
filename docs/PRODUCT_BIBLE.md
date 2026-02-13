# 📦 PRODUCT BIBLE (SaaS SSOT)

> **Canonical reference for all Rensto Self-Serving SaaS products.**  
> **Rule**: Products are defined as **Agents** or **Applets**. Logic is programmatic; n8n is for prototypes only.

---

## 🎨 Design System & Visual Tokens

### Core Design Tokens
These tokens are the canonical source for all Rensto web applications (Next.js/React).
```css
--background: #0B1318
--card: #111827
--text: #E5E7EB
--muted: #94A3B8
--accent1: #2F6A92
--accent2: #FF6536
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
*   **Architecture**: Kie.ai Kling 3.0 (Video) + Suno (Music) + Nano Banana (Identity).
*   **Source of Truth**: `apps/worker/PIPELINE_SPEC.md`.

### 🤖 Facebook Marketplace Autoposter
*   **Target**: High-volume marketplace sellers.
*   **Logic**: `platforms/marketplace/saas-engine/`
*   **Stack**: Puppeteer + GoLogin + Anti-detection stealth logic.
*   **Usage**: Credits per listing activation.

---

## 3. SaaS Billing & Credit Logic (Postgres-Driven)

Products operate on a **Usage-Based Credit** system or **Tiered Subscriptions**.

| Plan | Agent Limit | Run Limit | Storage | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** | 2 | 100/mo | 5GB | SMB / Solo |
| **Growth** | 10 | 1,000/mo | 50GB | Established Business |
| **Scale** | Unlimited | 5,000/mo | 500GB| Enterprise / High-Volume |

*Self-serving top-ups allow users to buy additional Credits for specific agent runs.*

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
| **Subscriptions** | $299-$1,499/mo | Stripe LIVE |
| **Custom Solutions** | $3,500-$8,000+ | Stripe LIVE |
| **Content AI** | $297-$1,997/mo | In development |

### Customer Journey (4 Stages)
1. Awareness → Purchase (SEO, Stripe) ✅ LIVE
2. Purchase → Onboarding (Webhook, partial automation) ⚠️ 40–60%
3. Onboarding → Active (Portal) ❌ Not built
4. Active → Retention (Lifecycle) ❌ Not built

### Admin Portal
admin.rensto.com. Next.js, Tailwind. Demo: admin@rensto.com / admin123. Needs redesign for 4 service types.
