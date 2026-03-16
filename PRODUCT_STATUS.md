# Product & Customer Status — Reference

> **⚠️ STATUS LIVES IN ADMIN DB — NOT HERE**
> Project/product status is tracked in **admin.superseller.agency → Projects tab** (the single pane of glass, R9.1).
> Query via API: `GET /api/admin/projects`. Update via: `PATCH /api/admin/projects { id, status, description }`.
> This file is a **static customer reference** (contacts, revenue models) — NOT a status tracker.

**Last Updated**: March 13, 2026

---

## CUSTOMERS — Who They Are & What They're Paying

| Customer | Contact | What We Do | Revenue Model | Status |
|----------|---------|-----------|--------------|--------|
| **Miss Party** | Michal Kacher Szender | FB Marketplace bot — inflatable bouncy castle rentals | FREE (proving value, no fee to us) | ✅ POSTING |
| **UAD** | David Szender | FB Marketplace bot — garage doors DFW | Revenue SPLIT on leads that convert | ✅ POSTING |
| **Elite Pro Remodeling** | Saar Bitton (owner), Mor Dayan (PM) | Daily IG content: 1 reel + 1 story + 1 carousel/day | $2,000/mo + $132 TX tax via Stripe | 🔴 BLOCKED (credentials + payment) |
| **Yoram** | Shai's father | Landing page / lead gen (family referral) | Lihi pays once Yoram recommends | ⚠️ LOW PRI |
| **Yossi (Mivnim)** | Yossi | AI avatar videos (Winner Studio) | TBD — one Trump video delivered | ⏸ PAUSED (war in Israel, no parties) |
| **Shai Personal Brand** | @shaifriedman | Instagram/FB automation — Iran viral persona | Internal — no billing | ✅ PORTAL + COMPETE |

**WhatsApp for customer comms**: Use Shai's personal session (14695885133) until confirmed safe to add customer numbers.

---

## PRIORITY ORDER — See admin.superseller.agency for live status

> Priority and status are maintained in the Admin Command Center Projects tab.
> Below is a frozen snapshot from March 8 for offline reference only.

---

## TECHNICAL BLOCKERS — See admin.superseller.agency for live tracking

> Blockers are tracked as Project records with `blocked` status in the Admin Command Center.

---

## 1. FB Marketplace Bot — Miss Party + UAD

**Status**: Both posting as of Mar 8 (verified live). UAD 5/5 posts, Miss Party 3/3 posts. All exit code 0. Cycle 8 complete, sleeping until 6am CST.

**Revenue model clarified (Mar 8)**:
- Miss Party: $49.99 = RENTAL PRICE in listings. She doesn't pay Shai. Free service.
- UAD: Revenue split — Shai earns % of actual sales from leads that convert.

**Miss Party config**: fbEmail `michalkacher2006@gmail.com`, category "Miscellaneous", 1 phone (`+1-469-814-6509`), 3 posts/30min cooldown, 5 DFW cities
**UAD config**: category "Miscellaneous", 4 Telnyx phones (972-954-2407, 214-256-3408, 469-814-6509, 972-646-6110), 5 posts/15min cooldown, 30 DFW cities

**Scores**: UAD 96% (50/52), Miss Party 94% (49/52)

**Remaining gaps**:
- B9: Video variation (static file, same every posting)
- E7: No PostgreSQL lead bridge (leads stay in n8n/Workiz/email)

**If posting stops** — SSH to RackNerd:
```bash
cd /opt/fb-marketplace-bot && node scripts/cleanup-fb-queue.js
pm2 restart webhook-server && pm2 restart fb-scheduler
pm2 logs webhook-server --lines 100
```

**Code**: `fb-marketplace-lister/deploy-package/` | Server: `/opt/fb-marketplace-bot/` | PM2: webhook-server, fb-scheduler, image-pool, cookie-monitor

---

## 2. Elite Pro Remodeling — $2,000/mo

**Contact**: Saar Bitton (owner), Mor Dayan (PM) | Phone: (800) 476-7608
**Meeting cadence**: Fridays with Saar
**Voice clones**: Saar `jlOXsp2JeEQ29fkljTTO`, Mor `1prnFNmpCkb2bx39pQSi` (ElevenLabs)

**Revenue**: $2,000/mo + $132/mo TX sales tax via Stripe subscription
**Contract**: SENT (ID: 3c2ce265-4d1a-41db-a8ef-179f44b78eb8, expires Mar 27)
**Stripe**: SENT (checkout URL live, TX §151.351 20% exemption applied)
**Post-payment flow**: WIRED (9/9 automations)
**ClaudeClaw group agent**: LIVE in WhatsApp group (`120363408376076110@g.us`, tenant `elite-pro-remodeling`)

**What they want**: Daily Instagram content
- 1 Reel (1-3 min) + 1 Story + 1 Carousel per day starting Day 7
- Before/after reveals, project walkthroughs, testimonials
- WhatsApp approval: Saar + Mor + AI bot
- Target: visible results in 2-4 weeks, meaningful growth by 3 months

**Demo delivered**: V12 video — `elite-pro-demo/elite-pro-v12-final.mp4` on R2 (25.7s, 1080x1920) ✅

**BLOCKERS**:
1. FB Page Content access — waiting on Eliran to add shai@superseller.agency
2. Contract signature from Saar (expires Mar 27)
3. Stripe payment from Saar

**Build plan once unblocked**:
- Phase 1 (Days 1-7): WhatsApp group setup, competitor research, asset collection
- Phase 2 (Day 7+): Daily: Gemini research → Claude script → Kie.ai generate → WhatsApp approval → auto-publish IG
- Phase 3: Learning loop — what content performs best, adapt

**Strategic note**: Saar's wife Ortal = Ortal Pilates. Keep as ready asset for expansion.

---

## 3. Shai Personal Brand — Iron Dome OS

**Status**: DASHBOARD BUILT, DATA PIPELINE BROKEN

**Repo**: https://github.com/imsuperseller/iron-dome-os | **Live**: https://iron-dome-os.vercel.app
**Audience**: 10K+ Instagram followers, 17.8K+ Facebook followers (Persian-Jewish / Iran freedom content)

**What's built**: Next.js analytics dashboard — content calendar, virality chart, stats, workflow controls, ideation terminal. All UI exists. **Follower outreach**: Admin tab Audiences (admin.superseller.agency) — audience_insights + follower_snapshots (44 prospects, segments, top products).

**What's broken**: 3 Aitable tables deleted in Mar 5 cleanup (`shai_fb_posts`, `shai_fb_insights`, `shai_fb_sync_states`). Dashboard shows zeros/mock. Personal n8n at port 5679 — status unknown.

**Plan doc inside repo**: `PLAN-connect-and-build.md` — 6 phases to reconnect real data.

**Next**: Rebuild pipeline — Phase 1: reconnect n8n → replace Aitable with PostgreSQL → real stats.

**Rule**: NEVER mix with SuperSeller brand. Share automation patterns only, never accounts/data.

**What needs to be automated**:
- Prompt writing → content generation (reels, carousels, stories)
- Caption writing per platform
- Hashtag research (platform-specific, trending vs. evergreen)
- Upload timing strategy (when to post what on which platform)
- KPI dashboard (reach, engagement rate, follower growth, saves, shares)
- Content type analysis (what's working, what's not)
- Cross-platform strategy: IG (primary), FB, TikTok, X, YT (research needed)

**Revenue angle**: Explore affiliate marketing integration.

**Infrastructure**: Share patterns from SocialHub (SuperSeller). NEVER share accounts, data, or branding. Cross-pollinate techniques only.

**Codebase**: `~/superseller/archives/shai-friedman-social` (2.2GB) → needs own directory `~/shai-friedman-social/`

---

## 4. VideoForge — AI Property Videos

**Status**: LIVE but quality unvalidated since fixes. Dual-path (Kling AI + Remotion).

**Quality fixes applied (7 phases, Feb-Mar 2026)** — NOT YET VALIDATED END-TO-END:
- Pool exclusion, double realtor DUPLICATE_FIGURE_NEGATIVE, realtor SPATIAL_ANCHOR
- Force 1920x1080, exclude floorplan from pool, Kling last_frame continuity
- Seamless concat (zero transitions), measured clip durations, 4-sec CTA minimum
- Credit sentinel before batch, per-property music style picker

**What's needed**: 1 full test job (~$1-2 Kling credits) to confirm all fixes work together.

**Live URL**: https://superseller.agency/video/create | Worker: pm2 `tourreel-worker` on 172.245.56.50:3002 (PM2 name pending rename to `videoforge-worker`)

---

## 5. SocialHub / Buzz

**Status**: Phase 1 LIVE (text+image → WhatsApp approval → Facebook publish)

**What works**: Claude content gen, Kie.ai image gen, FB publishing (page 294290977372290), WAHA approval workflow, Aitable sync. 7 posts live.

**Phase 2 (not built)**: Instagram activation (code exists, needs Meta config), LinkedIn, X, TikTok, YouTube, analytics, scheduling.

**IG for Elite Pro**: Code in `apps/web/superseller-site/src/app/api/social/`. NOT activated. Needs Meta App ID/Secret.

---

## 6. ClaudeClaw — WhatsApp AI Bridge

**Status**: ✅ FULLY OPERATIONAL — Audited & enhanced Mar 10, 2026

**What works**: Personal DM mode (Claude Agent SDK), group agent (3-tier memory + 4-layer guardrails), RAG context enrichment, health monitoring, approval system, 7 scheduled jobs, 14 slash commands, daily morning digest.

**Mar 10 Audit Fixes**: Killed stuck BullMQ job blocking queue, fixed health_checks CHECK constraint, fixed CLAUDECLAW_PROJECT_DIR in both .env files, added proactive daily digest, added 7 new commands (/digest, /videos, /spend, /leads, /fb, /marketplace, /groups), extended RAG with product knowledge + customer data + business context.

**Slash Commands**: /help, /health, /digest, /videos, /spend, /leads, /fb, /marketplace, /groups, /approvals, /rag, /memory, /status, /newchat

**Elite Pro group**: `120363408376076110@g.us`, tenant `elite-pro-remodeling`. Group agent confirmed working (4/6 test messages got Claude responses on Mar 8).

**Usage**: 4 conversation turns, 6 group messages, 5 RAG documents. Daily RAG ingestion runs automatically (product knowledge, customer summary, business context, health, queue stats, group configs, error summary).

**Next**: Seed RAG with more docs after daily ingestion runs. Add more customer groups as customers onboard. Add event-driven alerts (new leads, job completions).

---

## 7. Winner Video Studio — Yossi (Mivnim)

**Status**: BUILT, PAUSED. War in Israel = no parties = no demand for party promo videos.

**Next window**: Pesach (April 2026) — draft campaign angle for Yossi before then.

**What works**: Audio + photo → Gemini brain → Kling avatar-pro lip-sync → R2 → WhatsApp delivery. Full pipeline verified Feb 19.

**Live URL**: https://studio.superseller.agency

---

## 8. Lead Landing Pages + Yoram

**Status**: READY FOR SALE (design upgrade needed).

**What exists**: `/lp/[slug]` dynamic routing, per-customer branding, lead capture → WhatsApp + email. Technical infrastructure is 100% complete. Visual quality is 5.2/10 — needs dark theme + glassmorphism upgrade before selling to customers.

**Service Tiers** (pending design upgrade): Starter $500, Pro $1,000, Enterprise $2,000+.

**Yoram Friedman (Insurance)**: Site is LIVE. Two GitHub repos under `yoramnfridman1`:
- `yoram-landing` — modern Hebrew site, deployed: https://yoram-landing-q1pkkjsff-yoramnfridman1s-projects.vercel.app (= yoramfriedman.co.il)
- `yoram-friedman-insurance` — older full site with docs, strategy, admin

Yoram's Apify account: empty (0 actors/tasks — nothing set up yet)
Credentials: GitHub PAT + Vercel token + Apify key → in CREDENTIAL_REFERENCE.md §Yoram
Next: Set up Apify lead/competitor scraping for Israeli insurance market. Discuss with Shai.

---

## 9. FrontDesk Voice AI

**Status**: Partial. Voice works (+14699299314). Webhook migration n8n → worker PENDING.

---

## 10. Rensto.com — Separate Business

**Status**: LIVE on RackNerd port 3001. Contractor directory with pricing transparency.

**Needs**: Design audit + business model revisit + traffic strategy. Separate dedicated session.

**Cross-business**: Rensto contractors = SuperSeller AI prospects. Use contractor DB for outreach. Zero technical dependency.

**Code**: `~/rensto - online directory/` | GitHub: `renstollc/rensto-app` | Server: systemd `rensto`, port 3001

---

## Infrastructure Quick Reference

| Service | URL/Location | Status |
|---------|-------------|--------|
| Web | https://superseller.agency | ✅ LIVE |
| Admin | https://admin.superseller.agency | ✅ LIVE |
| Worker | http://172.245.56.50:3002/api/health | ✅ LIVE |
| Studio | https://studio.superseller.agency | ✅ LIVE |
| Rensto | https://rensto.com | ✅ LIVE |
| Ollama | http://172.245.56.50:11434/api/tags | ✅ LIVE |
| n8n | https://n8n.superseller.agency | BACKUP |
| WAHA | http://172.245.56.50:3000 | ✅ LIVE |
| PostgreSQL | 172.245.56.50:5432/app_db (admin/4b14f16c833eff714a7204ef3df53b01) | ✅ LIVE |
| Redis | 172.245.56.50:6379 (pw: 8a735bff3ad157a242d68be49172f648) | ✅ LIVE |

---

## Things That Wasted Time — Never Repeat

- Assuming Vercel team plan = paid. Always check billing via API first.
- Running cleanup without knowing what each folder is (deleted rensto, deleted 10 customer projects).
- Deploying video pipeline without tracing data formats (WebP → Kling 422 error burned $8.60+).
- Declaring quality fixes "done" without running 1 full validation job.
- Adding customer domains to wrong Vercel project.
- Creating nginx redirects without explicit user instruction.
- Documenting things as "complete" without verifying they run in production.

---

## What Was Lost / At Risk (Mar 5, 2026 Cleanup)

- rensto-online-directory: RESTORED Mar 8 to `~/rensto - online directory/`, GitHub updated
- shai-friedman-social: STILL IN `~/superseller/archives/shai-friedman-social/` — needs own directory
- 10 customer projects deleted from filesystem — most on GitHub, some may be gone
- rensto.com was redirecting to superseller.agency — FIXED Mar 8

---

---

## Smoke Test Results (Mar 8, 2026)

| Service | Result | Notes |
|---------|--------|-------|
| **Web (superseller.agency)** | FIXED | Was 503 — wrong Postgres password in Vercel env vars. Fixed and redeployed. |
| **Admin (admin.superseller.agency)** | 404 | Middleware skipping i18n for /admin paths — fix prepared, pending deploy |
| **Worker (172.245.56.50:3002)** | HEALTHY | 29 restarts = manual deploys, NOT crashes. Uptime stable. |
| **FB Bot (172.245.56.50:8082)** | PASS | Webhook-server + fb-scheduler healthy |
| **WAHA (172.245.56.50:3000)** | PASS | Both sessions authenticated |

## Roadmap Items

- **Poe bot**: Potential demo/lead-gen channel. Not urgent — roadmap item for future exploration.

---

*Updated: March 8, 2026 after full audit session. Update after every task.*
