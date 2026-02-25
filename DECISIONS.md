# Decisions — Canonical Truth

**Date**: February 2026  
**Source**: User answers (Feb 2026). Apply these as the only truth.

---

## 1. CODEBASE SPLIT

| Decision | Answer |
|----------|--------|
| **1.1 Split?** | **A** — Keep one repo. No split. |
| **1.2 Video structure** | Keep video as `rensto.com/video/*` in the main site. |
| **1.3 GitHubs (if split later)** | One org, multiple repos. |
| **1.4 Launch links** | `rensto.com/video/*` |
| **1.5 Order** | Agent decides. |

---

## 2. VERCEL DEPLOY

| Decision | Answer |
|----------|--------|
| **Unify deploy** | Aspirational: One project with rensto.com + api.rensto.com, single deploy on push. |

**Current reality (Feb 2026)**: NOT yet unified. Two separate Vercel projects remain. `git push` deploys api.rensto.com (auto). rensto.com requires manual `vercel --prod`. See `VERCEL_PROJECT_MAP.md` for current state.
**Action (deferred)**: Add rensto.com and www.rensto.com to api-rensto-site. Remove from rensto-site. Merge env vars.

---

## 3. VERCEL "rensto" PROJECT

| Decision | Answer |
|----------|--------|
| **rensto project** | Keep as legacy/experimental; ignore for production. |

---

## 4. INFRASTRUCTURE CLEANUP

| Decision | Answer |
|----------|--------|
| **Infra folders** | User asked: shouldn't these be in NotebookLM, not codebase? |

**Clarification**: Per CODEBASE_VS_NOTEBOOKLM:
- **Codebase** = Paths, env, routers, deploy runbooks — what builds and runs.
- **NotebookLM** = Specs, methodology, research, reference content.

**Infra folders** (saas-frontend, design-tools, waha, n8n-client-delivery, library/client-workflows):
- **waha/** — Active. Prisma, marketplace, n8n use it. Keep in codebase.
- **saas-frontend/, design-tools/, n8n-client-delivery/, library/client-workflows/** — Descriptions and usage notes belong in NotebookLM. The actual code/config stays in codebase if it's used; if unused, archive or delete. Add README-style docs to relevant notebooks (e.g. N8n, infra) and keep only deployable artifacts in repo.

**Others that belong in NotebookLM** (not codebase):
- Research docs (REALTOR_PLACEMENT_INDUSTRY_RESEARCH, etc.)
- Methodology deep-dives (beyond METHODOLOGY.md)
- Process descriptions (how to deliver workflows to customers)
- Design system reference (beyond minimal tokens in code)

**Action**: Create NOTEBOOKLM_SCOPE.md listing what goes where. Verify infra folder usage; move descriptions to notebooks; archive unused code.

---

## 5. QUICKBOOKS MCP

| Decision | Answer |
|----------|--------|
| **QuickBooks** | User gave access; agent to research and plan. |

**Action**: Audit quickbooks-online-mcp-server, quickbooks-mcp-server refs, MCP config. Create plan. See EXECUTION_PLAN Phase 5.

---

## 6. NOTEBOOKLM RESEARCH MIGRATION

| Decision | Answer |
|----------|--------|
| **REALTOR_PLACEMENT** | Determine if old or helpful. Add helpful parts to relevant notebooks. Merge/archive. |

**Action**: Assess REALTOR_PLACEMENT_INDUSTRY_RESEARCH.md. Add useful content to Zillow-to-Video (0baf5f36). Archive from codebase if fully migrated.

---

## 7. CREDENTIALS

| Decision | Answer |
|----------|--------|
| **Rotate?** | No. Don't rotate. |
| **Credential reference** | User: credentials are in Vercel env, conversation, env files — agent keeps "forgetting" and not using independently. Should agent maintain a credential reference? |

**Action**: Create CREDENTIAL_REFERENCE.md (or add to existing doc) — **paths only**, no secrets: "Vercel env vars: X, Y, Z. .env.local for local. ~/.cursor/mcp.json for MCP." Agent reads this to know where to look. Never store actual secrets in the doc.

---

## 8. VIDEO CREATION IN PRODUCTION

| Decision | Answer |
|----------|--------|
| **User reported** | Put Zillow URL + realtor image → "Video creation is not available in production yet." |

**Action**: Remove production gate from `/api/video/jobs/from-zillow`. Video create now works in production. Requires VIDEO_WORKER_URL in Vercel.

---

## 9. N8N PARADIGM (Feb 2026)

| Decision | Answer |
|----------|--------|
| **n8n role** | Backup for NEW automation. Antigravity is primary for new workflows. |
| **n8n workflows** | Existing production workflows (FB Bot lead pipeline: UAD + MissParty) still run on n8n. New automation goes to Antigravity. |
| **Service monitoring** | n8n categorized as "backup" with highest failure tolerance (5 consecutive, 120min cooldown). |

---

## 10. MONITORING STRATEGY (Feb 2026)

| Decision | Answer |
|----------|--------|
| **Dashboard** | Admin monitoring tab at `rensto.com/admin` → "System Monitor" |
| **Health checks** | 10 services: PostgreSQL, Worker, Vercel, Ollama, Kie.ai, Gemini, Resend, Stripe, Prisma, n8n |
| **Alerts** | Rule-based with cooldown. Channels: email (Resend) + audit_log (PostgreSQL). Auto-resolve on recovery. |
| **Expense tracking** | Per-call API cost tracking. Anomaly = daily > 2x 7-day rolling average. |

---

## 11. UI DESIGN WORKFLOW (Feb 2026)

| Decision | Answer |
|----------|--------|
| **Primary tool** | v0.dev — React/Next.js output, shadcn/ui, beta API, design system support |
| **Secondary tool** | Google Stitch — visual prototyping only (350 free gen/month). No API yet. HTML output, not React. |
| **Rebrand tool** | `tools/rebrand-component.ts` — auto-replaces generic Tailwind → Rensto tokens |
| **Brand tokens SSOT** | `globals.css` CSS custom properties (50+ tokens). See `.claude/skills/ui-design-workflow/references/brand-token-map.md` |

---

## 12. TOURREEL QUALITY-FIRST PIVOT (Feb 23, 2026)

| Decision | Answer |
|----------|--------|
| **Strategic priority** | Quality and consistency over creative effects |
| **Trade-off** | Drop furniture-from-sky (Nano Banana) to focus on realtor consistency + room accuracy |
| **Tolerance for hallucination** | ZERO. "We cannot lose quality. We cannot risk it to generate things." |
| **Speed vs quality** | "I don't mind losing time. I cannot afford losing quality." |

**Key Requirements:**
1. **Realtor consistency** - Same face across all 14 clips (top priority)
2. **Room accuracy** - Rooms look like actual photos (no invented features)
3. **Tour matches blueprint** - Follow actual floorplan data, not hardcoded assumptions
4. **No hallucination** - Only describe features that exist in property data + photos

**Implementation Changes:**
- ✅ Upgraded vision to gemini-3-flash (15% better accuracy)
- ✅ Room-specific negative prompts (prevent wrong furniture placement)
- ✅ Dynamic prompts (pool detection, conditional features)
- ⏳ Avatar quality validation (4-6 photos, face verification)
- ⏳ Pre-flight photo analysis (Gemini 3 Flash feature detection)
- ❌ Nano Banana furniture effects (PAUSED until realtor consistency solved)

---

## 13. MODEL TRACKING SYSTEM (Feb 23, 2026)

| Decision | Answer |
|----------|--------|
| **Mandate** | "I cannot afford u not being fully updated on kie.ai/market and all llm's and models without exception" |
| **Solution** | Build AI Model Observatory - automated tracking of all models across providers |
| **Scope** | Kie.ai, Google, OpenAI, Anthropic, others |
| **Storage** | Database tables: `ai_models`, `model_recommendations` |
| **Updates** | Daily automated scraping + alerts on new releases |
| **Integration** | Required check before every model selection decision |

**Deliverable:** See `tools/model-observatory/README.md`

**Research Requirement:** "always research latest techniques and features llm's and models has to offer"

---

## 14. DOCUMENTATION CONSOLIDATION AUDIT (Feb 23, 2026)

| Decision | Answer |
|----------|--------|
| **Mandate** | "go over where we store (notebookslm, aitable.ai etc.) things so all updated and no conflicts and no contradictions etc." |
| **Scope** | NotebookLM (36 notebooks), Aitable.ai, codebase docs |
| **Action** | Audit for conflicts, outdated data, contradictions |
| **Authority** | DECISIONS.md > Deployed code > Codebase docs > NotebookLM > Aitable.ai |

**Action Items:**
- [x] Audit TourReel notebook (0baf5f36) for furniture-from-sky references → update to quality-first approach (Feb 24: production quality overhaul source added)
- [ ] Update all model references (2.5-flash → 3-flash)
- [ ] Check Aitable.ai for outdated TourReel process data
- [x] Sync TOURREEL_GAP_ANALYSIS findings to NotebookLM (Feb 24: production overhaul source covers all gap fixes)
- [ ] Remove contradictions between sources

---

## 15. END-OF-SESSION SYNC PROTOCOL (Feb 24, 2026)

| Decision | Answer |
|----------|--------|
| **Mandate** | "After every time we talk... is there a thing that each and every time is updating things all across so everything is synced?" |
| **Problem** | No automated sync exists. Rules say to sync but agent fails to follow. User caught NotebookLM, pricing, and niche drift. |
| **Solution** | Mandatory end-of-session sync protocol in auto-memory (MEMORY.md) — checked at conversation start, executed at conversation end. |

**Protocol** (see `MEMORY.md` for full checklist):
1. progress.md — what was done
2. findings.md — root causes / discoveries
3. DECISIONS.md — user decisions
4. NotebookLM notebooks — push to every touched product's notebook
5. PRODUCT_STATUS.md — if status changed
6. MEMORY.md — if new patterns/preferences
7. Skills — if capabilities changed
8. brain.md / CLAUDE.md — if architecture changed

**Trigger map**: Code change → progress + notebook + status. Bug fix → progress + findings + notebook. User decision → DECISIONS + notebook. Brainstorm/insight → findings + notebook + memory. Pricing → PRODUCT_BIBLE + skills + B.L.A.S.T. notebook.

**Non-negotiable**: This runs EVERY session. Not "when I remember." EVERY time.

---

## 16. CANONICAL PRICING — NEVER DEVIATE (Feb 24, 2026)

| Decision | Answer |
|----------|--------|
| **Mandate** | "Every time you come up with a different pricing model when we work on something instead of knowing there is a center" |
| **Canonical Pricing** | Starter $79/mo (5 videos, 500 credits), Pro $149/mo (15 videos, 1500 credits), Team $299/mo (50 videos, 4000 credits), Pay-per-video $29-39 |
| **Source** | B.L.A.S.T. notebook (5811a372) |
| **Fixed in** | 20 files across codebase (Feb 24, 2026) — replaced all $299/$699/$1499 references |

---

## 17. DEFERRED

- Add anything affecting architecture, domains, or deployment as we go. Mark "deferred" in DECISIONS if needed.
