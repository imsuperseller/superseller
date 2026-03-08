# Product & Customer Status — Living Tracker

**Purpose**: Single source of truth for every product's status, customer, blockers, and next action. Read this FIRST when resuming work. Updated after every task.

**Rule**: Never ask "what's next?" — read this file. Never ask "where are we?" — read this file.

**Last Updated**: March 8, 2026

---

## CUSTOMERS — Who They Are & What They're Paying

| Customer | Contact | What We Do | Revenue Model | Status |
|----------|---------|-----------|--------------|--------|
| **Miss Party** | Michal Kacher Szender | FB Marketplace bot — inflatable bouncy castle rentals | FREE (proving value, no fee to us) | ✅ POSTING |
| **UAD** | David Szender | FB Marketplace bot — garage doors DFW | Revenue SPLIT on leads that convert | ✅ POSTING |
| **Elite Pro Remodeling** | Saar Bitton (owner), Mor Dayan (PM) | Daily IG content: 1 reel + 1 story + 1 carousel/day | $2,000/mo SIGNED — NOT started yet | 🔴 BLOCKED |
| **Yoram** | Shai's father | Landing page / lead gen (family referral) | Lihi pays once Yoram recommends | ⚠️ LOW PRI |
| **Yossi (Mivnim)** | Yossi | AI avatar videos (Winner Studio) | TBD — one Trump video delivered | ⏸ PAUSED (war in Israel, no parties) |
| **Shai Personal Brand** | @shaifriedman | Instagram/FB automation — Iran viral persona | Internal — future affiliate / brand | 🔴 NOT BUILT |

**WhatsApp for customer comms**: Use Shai's personal session (14695885133) until confirmed safe to add customer numbers.

---

## PRIORITY ORDER (Mar 8, 2026)

1. 🔴 **Elite Pro Remodeling** — $2,000/mo waiting. Blocked on IG credentials from Saar.
2. 🔴 **Shai Personal Brand** — Instagram/Facebook automation system to build.
3. 🟡 **Miss Party + UAD** — Verify still posting (last confirmed Feb 20). Fix video variation gap.
4. 🟡 **TourReel** — Quality regressions unvalidated. Run 1 test job to confirm fixes work.
5. 🟡 **ClaudeClaw** — 3 missing service files (group-agent.ts, approval-service.ts, rag-ingestor.ts) breaking group agent.
6. ⚪ **Yoram** — Landing page when ready.
7. ⏸ **Yossi (Mivnim)** — Revisit for Pesach campaign (April 2026). No action now.
8. ⏸ **Rensto.com** — Design audit + business model + traffic strategy. Separate session.

---

## CRITICAL TECHNICAL BLOCKERS (Fix Before Anything)

| # | Blocker | Impact | Fix |
|---|---------|--------|-----|
| 1 | `group-agent.ts` MISSING — imported in 3 places but file doesn't exist | ClaudeClaw group messages crash at runtime | Rebuild from MEMORY.md spec |
| 2 | `approval-service.ts` MISSING — imported in 4 places | Scheduler approval expiry job fails | Rebuild |
| 3 | `rag-ingestor.ts` MISSING — imported in scheduler | Daily RAG ingestion fails | Rebuild |
| 4 | Worker untracked files not committed | Changes lost on server restart | `git add + commit + push` |
| 5 | TourReel quality fixes NEVER validated end-to-end | Can't sell to realtors confidently | Run 1 test job (~$1-2) |
| 6 | `docs/AI_MODEL_REGISTRY.md` referenced but doesn't exist | Doc conflict, model tracking broken | Create file |

---

## 1. FB Marketplace Bot — Miss Party + UAD

**Status**: Both posting as of Feb 20. Needs live verification (last check was 16+ days ago).

**Revenue model clarified (Mar 8)**:
- Miss Party: $49.99 = RENTAL PRICE in listings. She doesn't pay Shai. Free service.
- UAD: Revenue split — Shai earns % of actual sales from leads that convert.

**Miss Party config**: fbEmail `michalkacher2006@gmail.com`, category "Inflatable Bouncers", 1 phone, 3 posts/30min cooldown
**UAD config**: category "garage doors", 4 Telnyx phones (972-954-2407, 972-628-3587, 469-625-0960, 469-535-7538), 5 posts/15min cooldown, 30 DFW cities

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

**What they want**: Daily Instagram content
- 1 Reel (1-3 min) + 1 Story + 1 Carousel per day starting Day 7
- Before/after reveals, project walkthroughs, testimonials
- WhatsApp approval: Saar + Mor + AI bot
- Target: visible results in 2-4 weeks, meaningful growth by 3 months

**Demo delivered**: V12 video — `elite-pro-demo/elite-pro-v12-final.mp4` on R2 (25.7s, 1080x1920) ✅

**BLOCKERS**:
1. IG Meta App ID/Secret from Saar (NOT a paying customer yet — can't request until they pay)
2. Saar + Mor WhatsApp numbers (use Shai's personal session 14695885133 for now)
3. Competitor research (Apify script ready, need to run)
4. Brand asset collection (photos, videos, logo, brand guidelines)

**Build plan once unblocked**:
- Phase 1 (Days 1-7): WhatsApp group setup, competitor research, asset collection
- Phase 2 (Day 7+): Daily: Gemini research → Claude script → Kie.ai generate → WhatsApp approval → auto-publish IG
- Phase 3: Learning loop — what content performs best, adapt

**Strategic note**: Saar's wife Ortal = Ortal Pilates. Keep as ready asset for expansion.

---

## 3. Shai Personal Brand — Instagram/Facebook Automation

**Status**: NOT BUILT — planning phase

**Background**: Started Jan 12, 2026 (Iran war). "Inside Iran" / David Starr persona. 15-sec reels, viral content, thousands of likes/shares/followers. Growth has leveled but spikes still happen.

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

## 4. TourReel — AI Property Videos

**Status**: LIVE but quality unvalidated since fixes. Dual-path (Kling AI + Remotion).

**Quality fixes applied (7 phases, Feb-Mar 2026)** — NOT YET VALIDATED END-TO-END:
- Pool exclusion, double realtor DUPLICATE_FIGURE_NEGATIVE, realtor SPATIAL_ANCHOR
- Force 1920x1080, exclude floorplan from pool, Kling last_frame continuity
- Seamless concat (zero transitions), measured clip durations, 4-sec CTA minimum
- Credit sentinel before batch, per-property music style picker

**What's needed**: 1 full test job (~$1-2 Kling credits) to confirm all fixes work together.

**Live URL**: https://superseller.agency/video/create | Worker: pm2 `tourreel-worker` on 172.245.56.50:3002

---

## 5. SocialHub / Buzz

**Status**: Phase 1 LIVE (text+image → WhatsApp approval → Facebook publish)

**What works**: Claude content gen, Kie.ai image gen, FB publishing (page 294290977372290), WAHA approval workflow, Aitable sync. 7 posts live.

**Phase 2 (not built)**: Instagram activation (code exists, needs Meta config), LinkedIn, X, TikTok, YouTube, analytics, scheduling.

**IG for Elite Pro**: Code in `apps/web/superseller-site/src/app/api/social/`. NOT activated. Needs Meta App ID/Secret.

---

## 6. ClaudeClaw — WhatsApp AI Bridge

**Status**: Deployed but GROUP AGENT BROKEN (3 missing service files)

**What works**: Personal mode (WhatsApp → Claude), RAG context, health monitoring, approval system, Elite Pro group registered.

**BROKEN**: `group-agent.ts`, `approval-service.ts`, `rag-ingestor.ts` — imported in code but files missing. Group messages will crash.

**Elite Pro group**: `120363408376076110@g.us`, tenant `elite-pro-remodeling`, 63 competitor ads loaded.

---

## 7. Winner Video Studio — Yossi (Mivnim)

**Status**: BUILT, PAUSED. War in Israel = no parties = no demand for party promo videos.

**Next window**: Pesach (April 2026) — draft campaign angle for Yossi before then.

**What works**: Audio + photo → Gemini brain → Kling avatar-pro lip-sync → R2 → WhatsApp delivery. Full pipeline verified Feb 19.

**Live URL**: https://studio.superseller.agency

---

## 8. Lead Landing Pages

**Status**: Infrastructure 100% complete. No active customer pages.

**What exists**: `/lp/[slug]` dynamic routing, per-customer branding (colors, logo, font, RTL/LTR), lead capture → WhatsApp + email notifications, analytics tracking.

**Yoram**: Family referral. Build landing page when he's ready.

---

## 9. FrontDesk Voice AI

**Status**: Partial. Voice works (+14699299314). Webhook migration n8n → worker PENDING.

---

## 10. Rensto.com — Separate Business

**Status**: LIVE on RackNerd port 3001. Contractor directory with pricing transparency.

**Needs**: Design audit + business model revisit + traffic strategy. Separate dedicated session.

**Cross-business**: Rensto contractors = SuperSeller AI prospects. Use contractor DB for outreach. Zero technical dependency.

**Code**: `~/rensto - online directory/` | GitHub: `imsuperseller/rensto-app` | Server: systemd `rensto`, port 3001

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

*Updated: March 8, 2026 after full audit session. Update after every task.*
