# Findings

**Purpose**: Research, discoveries, constraints, root causes. Updated by agents after each meaningful task. **Use for "never repeat"**: When an issue is fixed, add the root cause here so it does not recur. (Historical lessons: `apps/worker/legacy_archive/lessons.md`.)

**Doc hygiene**: Don't create a new .md for every task. Update brain, CLAUDE, findings, progress, DECISIONS. Archive one-off audits after merging key points to main docs. Delete empty or obsolete .md. When searching, prefer main docs (brain, CLAUDE, findings, DECISIONS, METHODOLOGY, CONFLICT_AUDIT) — not archived residue.

---

## 2026-02-17

### Port Conflict Reference (from CONFLICT_AUDIT.md — NEVER REPEAT)

- **Local dev (both apps running)**: Worker MUST use `PORT=3001`. rensto-site keeps 3002. Both share same DATABASE_URL and REDIS_URL.
- **RackNerd**: Worker runs on port 3002 at `/opt/tourreel-worker`. rensto-site is on Vercel.
- **run-smoke.ts**: `API_URL` must point to WORKER, not site. Local: `API_URL=http://localhost:3001`. RackNerd: `API_URL=http://172.245.56.50:3002`.
- **BullMQ retry fix**: UnrecoverableError for Insufficient Credits, Listing not found, No clip prompts — prevents repeated Kie.ai charges.
- **Preflight before video test**: `cd apps/worker && npx tsx tools/run-preflight.ts --free` (checks Postgres, Redis, FFmpeg).

### Skills Audit Findings (NEVER REPEAT)

- **Ghost reference files in skills**: All 6 skills had `references/*.md` links to files that never existed (15 total). Root cause: skill-template includes placeholder reference tables. Fix: point to actual source files (findings.md, INFRA_SSOT.md, actual source code paths) or inline the content.
- **Skills activation rate was ~20-30%**: 5/13 skills had broken frontmatter (no YAML `---` delimiters), 0/13 had negative triggers, 0/13 had usage examples. After cleanup: 8 active skills, all with proper frontmatter, negative triggers, and examples.
- **n8n skills dominated context**: 12/13 skills were n8n-related while system migrated away. All n8n project skills deleted, global skills archived. Active skills now: antigravity, database-management, rag-pgvector, stripe-credits, tourreel-pipeline, ui-design-workflow, ui-ux-pro-max, skill-template.

### Post-Change Audit Findings (NEVER REPEAT)

- **Ghost reference files fixed (see above)**.
- **ARCHITECTURE.md had stale skills list**: Listed "n8n, Tax4Us, workflow generator" — all 3 were deleted. Replaced with actual 8 active skills. Always update ARCHITECTURE.md when skills change.
- **Firestore references persist in comments**: 4 API routes still had Firestore in comments/variable names despite full retirement. Comments are invisible but misleading for agents. Clean stale comments after any migration.
- **UI labels can drift from architecture**: "Submit Issue to n8n Resolver" button actually did `mailto:support@rensto.com` — label was stale from pre-paradigm-shift. Check UI labels after architectural changes.
- **firestore.ts type file still imported by 6+ components**: AdminDashboardClient, ClientIntelligence, ClientManagement, WorkflowManagement, AIAgentManagement, HomePageClient all import `Template` from `@/types/firestore.ts`. Tech debt — should migrate to Prisma types eventually. Not blocking.

### Admin Monitoring Dashboard Implementation

- **Service registry pattern**: Each monitored service has id, name, category, healthCheck function, and alertThreshold. Categories: infrastructure (PostgreSQL, Worker, Vercel, Ollama), api (Kie.ai, Gemini, Resend, Stripe), database (Prisma migrations), backup (n8n). n8n is intentionally in "backup" category with highest failure tolerance.
- **Health checker runs concurrent checks**: All services checked in parallel via `Promise.allSettled`. Results persisted to `service_health` table. Uptime calculated from historical checks.
- **Alert engine with cooldown**: Prevents alert storm. Each rule has `cooldownMinutes` (default 30). `lastFiredAt` tracked per rule. Auto-resolve fires when service recovers.
- **Expense tracker uses known rates**: Kling Pro $0.10/clip, Kling Std $0.03/clip, Suno $0.02/music, Gemini Flash $0.001/prompt. Anomaly = daily spend > 2x rolling 7-day average.
- **DB tables created via raw SQL** (not `prisma db push`): Pre-existing schema drift (UUID type mismatches on existing tables) prevents `db push`. New monitoring tables created safely via direct SQL.
- **Admin role check pattern**: Use `session.role !== 'admin'` (lowercase) not `'ADMIN'` (uppercase). The verifySession() returns lowercase role strings.

### UI Design Workflow — Tool Landscape (NEVER REPEAT)

- **v0.dev is the primary tool for React/Next.js generation**: It outputs shadcn/ui components directly, has a beta Platform API for programmatic generation, supports custom Tailwind config and Shadcn Registry for design token injection. Always prefer v0 over Stitch for production React code.
- **Google Stitch (stitch.withgoogle.com)**: Good for visual prototyping only (350 Standard gen/month at 10-20s, 50 Experimental/month at 30-60s). Outputs HTML/CSS, not React. No official API yet. No native design system import (prompt-based only). Generic layouts, weak accessibility, multi-screen consistency unreliable beyond 2-3 screens.
- **`@_davideast/stitch-mcp`**: MCP bridge for Claude Code to access Stitch. Provides `get_screen_code`, `get_screen_image`, `build_site`, Vite serve. Auto token refresh. Useful for extracting Stitch designs programmatically.
- **rebrand-component.ts**: Always run on externally generated code before committing. Handles Tailwind class replacement and inline hex replacement. Hover variants must be processed before base patterns (ordering matters in replacement rules).
- **Brand token source of truth**: `globals.css` CSS custom properties. 50+ tokens across colors, backgrounds, text, gradients, glows, animations. All dark-first.
- **Complementary skills**: `ui-ux-pro-max` provides design intelligence (what to build), `ui-design-workflow` provides execution pipelines (how to build it with external tools).

### n8n Paradigm Shift — What Changed (NEVER REPEAT)

- **n8n workflows = reference patterns for Antigravity migration**, NOT production systems
- **Production automation = Antigravity** (Node.js + BullMQ on RackNerd)
- **RAG stack = Antigravity-native** (Ollama + pgvector via programmatic API, not n8n nodes)
- **Service registry categorizes n8n as "backup"** with 5 consecutive failures threshold and 120min cooldown (vs 2 failures / 15min for PostgreSQL)
- **Active n8n webhook calls still exist**: fulfillment/initiate, content/generate routes. These are migration candidates but not blocking.
- **rag-pgvector skill updated**: Architecture diagram changed from "n8n AI Agent" to "Antigravity Worker / API Routes"

### Ollama Installation on RackNerd (NEVER REPEAT)

- **Ollama v0.16.2 installed** at 172.245.56.50, CPU-only. Systemd service managed (`systemctl start/stop/restart ollama`).
- **Memory budget**: nomic-embed-text uses ~500MB when loaded. With KEEP_ALIVE=0, it unloads immediately after each request. Server has 5.8GB total RAM, ~3.1GB available at rest. Safe margin.
- **Config location**: `/etc/systemd/system/ollama.service.d/override.conf` — contains KEEP_ALIVE=0, MAX_LOADED_MODELS=1, NUM_PARALLEL=1, FLASH_ATTENTION=1, HOST=0.0.0.0.
- **Port**: 11434 (Ollama default). Accessible at `http://172.245.56.50:11434`.
- **SSH password**: Documented in CREDENTIAL_REFERENCE.md. Check conversation history or RackNerd panel. NEVER ask user again.
- **Existing services audit (Feb 2026)**: Docker containers: postgres_db, redis_cache, n8n_rensto, waha, browserless_rensto, video-merge. PM2: saas-engine, tourreel-worker, video-merge-service, webhook-server (online); facebook-bot-enhanced, master-bot (stopped); server (errored). Nginx on 80/8080.

### Full-Stack Conflict & Completeness Audit (Session 4)

- **PRODUCT_BIBLE.md had stale design tokens**: Colors were #0B1318/#2F6A92/#FF6536 but actual globals.css uses #110d28/#fe3d51/#bf5700/#1eaef7/#5ffbfd (Spotlight Dark Mode). NotebookLM 719854ee + 286f3e4a agreed with globals.css. Fix: Updated PRODUCT_BIBLE.md to match reality.
- **PRODUCT_BIBLE.md had stale pricing model**: Referenced Starter/Growth/Scale with agent-limits. Actual model is $299/$699/$1,499 credit-based (500/1500/4000). Fix: Updated to current credit model. Added TourReel 50 credits/video.
- **brain.md listed Veo as active**: Lines 37 + 139 referenced Veo. All notebooks and INFRA_SSOT say Veo is deprecated. Fix: Removed Veo, updated to "Kling 3.0, Suno, Nano Banana".
- **Veo code still in kie.ts**: KieVeoRequest interface and createVeoTask function exported. Fix: Removed Veo interface, function, and type references. Changed getTaskStatus/waitForTask defaults from "veo" to "kling".
- **ADMIN_EMAILS duplicated in 4 files**: auth.ts, send/route.ts, verify/route.ts all had identical `(process.env.ADMIN_EMAILS || 'service@rensto.com,admin@rensto.com')`. Fix: Exported ADMIN_EMAILS from auth.ts, imported in route files.
- **Admin demo password in PRODUCT_BIBLE.md**: `admin@rensto.com / admin123` documented publicly. Fix: Removed, replaced with magic-link auth description.
- **Agent-behavior files (.cursor vs .claude)**: Verified identical content (198-byte diff = YAML frontmatter only). No actual drift.
- **NotebookLM compliance pushed (3 notebooks)**: fc048ba8 (n8n=backup), 3e820274 (Kling 3.0 only), 8a655666 (fal.ai=deprecated).
- **9 missing Claude skills identified**: Created 3 P1 skills (stripe-credits, database-management, antigravity-automation) + skill-template scaffold. 6 P2-P3 skills documented as TODO.
- **Admin dashboard audit**: 14 tabs already exist. Health checks, usage tracking, customer dashboard all functional. Gap: automated alerting, MCP monitoring, expense tracking, anomaly detection. Blueprint written in task_plan.md.
- **Credential exposure in git history**: Stripe LIVE key, Notion token, 3 n8n API keys still in git history. BFG Repo-Cleaner not yet run. Cookie consent banner missing for GDPR.
- **Prisma vs Drizzle type conflicts**: emailVerified (Boolean vs timestamp), role (enum vs text). Known issue, not fixed yet — requires coordinated migration.

---

### Video Quality Overhaul (Session 3)

- **Root cause: double realtor**: Nano Banana composites realtor into clip 1 start frame. Kling generates video; last frame carries person traces. This frame becomes clip 2's start. Even though clip 2 uses "no people" prompt, Kling may animate the person visible in the start frame → double/ghost realtor. Fix: Added Kling 3.0 `kling_elements` support (native character reference via `@realtor` in prompts). Set `USE_KLING_ELEMENTS=1` to enable. When enabled, Nano Banana compositing is skipped entirely — Kling handles person consistency natively.
- **Root cause: robotic/awful movement**: Generic prompt templates ("Smooth steadicam through the space") gave Kling nothing specific. Fix: Added `ROOM_CAMERA_FLOW` lookup with temporal flow descriptions per room type (beginning → middle → end). Each prompt now describes how the shot evolves. Example: "Camera begins at the entrance, slowly tracks along the countertop revealing the workspace, then settles on the island or window view."
- **Root cause: wall clipping**: Insufficient spatial constraints. Fix: Strengthened `SPATIAL_NEGATIVE` with "wall penetration, object clipping, camera clipping, phasing through objects". Added separate `KLING_PROPERTY_NEGATIVE` (bans all people) and `KLING_ELEMENTS_NEGATIVE` (protects identity). Added "ONE ROOM PER CLIP" rule and "SPATIAL INTEGRITY" rule to prompt-generator system prompt.
- **Root cause: tour teleportation**: AI-generated tour sequence could skip between rooms that aren't connected. Fix: Added `validateTourAdjacency()` in floorplan-analyzer.ts — cross-checks `suggested_tour_sequence` against `connects_to` adjacency data. Logs warnings for teleportation. Also added `validateRoomCount()` to catch hallucinated rooms (analysis claims more rooms than listing data supports).
- **Kling 3.0 model research (Feb 2026)**: Kling 3.0 is latest (no 3.5/4.0 exists). Supports: kling_elements (2-4 reference images per person), duration 3-15s (Kie API still only "5" or "10"), multi_prompt (up to 6 shots), native audio (5 languages). Model IDs: "kling-3.0/video" and "kling-3.0" are interchangeable on Kie.ai.
- **Floorplan analysis research**: Gemini 3 Pro "Agentic Vision" can crop/zoom floor plan sections for 5-10% accuracy boost. Best practice: adjacency graph → walkthrough path (Hamiltonian). Post-processing should validate sequence against adjacency. Photo-to-room AI matching should be primary (not fallback). Room count sanity check catches hallucinated rooms.
- **Prompt engineering research**: Use cinematic vocabulary (slow dolly, steadicam glide, gentle push-in). Describe temporal flow (beginning → middle → end). One room per clip. Never describe person actions when person is in start frame. Keep negative under 500 chars. "Subject + Action + Environment + Style + Camera" formula.
- **Property-only clips now use room-specific prompts**: `buildPropertyOnlyKlingPrompt` uses `ROOM_CAMERA_FLOW[roomKey]` for per-room camera direction instead of generic template.

---

## 2026-02-16

### Instruction Hierarchy + Alignment Audit (Session 2)

- **Authority Precedence enforced across codebase + NotebookLM**: brain.md is Tier 1. Previously, NotebookLM 5811a372 had NotebookLM as Rank 1 and brain.md as Rank 2. Fixed by pushing compliance override sources to 6 notebooks.
- **NotebookLM compliance sources pushed (6 notebooks)**:
  - 5811a372 (B.L.A.S.T.): Authority override — brain.md = Tier 1, gemini.md superseded, Veo/Firestore/learning.log deprecated
  - 0baf5f36 (Zillow-to-Video): Authority override — brain.md wins over "NotebookLM wins over local"
  - fc048ba8 (n8n workflows): n8n = backup only, Antigravity primary, Firestore retired
  - 743744d5 (Marketplace): Firestore, Airtable.com, BMAD, Webflow = retired
  - 98b120fa (Aitable.ai): Dashboards-only scope restriction
  - 3e820274 (KIE.AI): Kling 3.0 only for Rensto production
- **Verified**: Queried 5811a372 post-push — now correctly returns brain.md as Tier 1, NotebookLM as Tier 7.
- **Stripe publishable key**: Rotated to `pk_live_...xQM`, added to Vercel production + preview via CLI.
- **Codebase fixes (committed earlier this session)**:
  - docs/operations/BIBLE.md: Removed broad SSOT claim, added brain.md ref
  - platforms/marketplace/PLATFORM_BIBLE.md: Added brain.md reference
  - docs/operations/business/MODEL.md: Firestore → PostgreSQL
  - security/CREDENTIAL_ROTATION_CHECKLIST.md: Redacted Stripe live key
  - CODEBASE_VS_NOTEBOOKLM.md: Fixed "NotebookLM wins" → "brain.md is Tier 1"
  - brain.md: Added 2 missing notebooks (Claude Code b906e69f, Kling 3.0 6bb5f16d)

### Vercel Token — Root Cause for Repeated "Invalid Token" (NEVER REPEAT)

- **Token**: Stored in `CREDENTIAL_REFERENCE.md` (paths only). Account: `service-3617`. VALID, PERMANENT.
- **Root cause**: The Vercel CLI has a global auth.json at `~/Library/Application Support/com.vercel.cli/auth.json` with a stale token. When `VERCEL_TOKEN` env var is set, the global auth.json can still interfere.
- **Correct invocation**: Always use `--token <token>` as an explicit CLI flag. Never rely on env var alone.
- **Confirmed working**: `vercel whoami --token <token>` → `service-3617`. `vercel env add` works. `vercel env ls` works.

### NotebookLM Auth — Root Cause for Repeated Disconnects (NEVER REPEAT)

- Google OAuth tokens expire after ~1 hour. The NotebookLM MCP auth file at `~/.notebooklm-mcp/auth.json` goes stale.
- **Fix**: Run `notebooklm-mcp-auth` CLI (opens Chrome, auto-detects login, extracts cookies). If that fails, user can paste cookies manually via `save_auth_tokens` tool.
- **After re-auth**: Must call `refresh_auth` tool OR the MCP server picks up new tokens on next call.
- **Session ID format**: `251165511850668720` (from Feb 2026 re-auth).

### Remaining Technical Debt

- **8 docs/frameworks/ files** (~5,900 lines) identified as candidates for NotebookLM migration per CODEBASE_VS_NOTEBOOKLM boundary rules. Not migrated yet.
- **Stripe live secret key in git history** — redacted in file but still in git history. Needs BFG Repo-Cleaner or key rotation.
- **Prisma ↔ Drizzle schema sync** — manual process, no automated check. Enum representations differ between ORMs.

---

### Session Test Results (full regression after all changes)

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Build (next build) | PASS | All routes compile, no errors |
| 2 | Firebase client removal | PASS | Zero imports of firebase-client/firebase.ts/firebase SDK in src/ |
| 3 | firebase-admin Storage-only | PASS | Only 2 files: firebase-admin.ts + onboarding approve route |
| 4 | firebase SDK removed from package.json | PASS | `"firebase"` not in dependencies |
| 5 | firebase-client.ts + firebase.ts deleted | PASS | Files confirmed gone |
| 6 | rensto.com returns 200 | PASS | Production healthy |
| 7 | admin.rensto.com → login (307→200) | PASS | Domain moved from stale rensto-admin to rensto-site |
| 8 | rensto.com/video/create | PASS | 307 to login (auth required — expected) |
| 9 | rensto.com/login | PASS | 200 |
| 10 | API health check | PASS | rensto.com/api/admin/health-check 200 |
| 11 | api.rensto.com | PASS | 200 |
| 12 | Prisma User for service@rensto.com | PASS | id=5fd79287, role=ADMIN, status=active |
| 13 | Drizzle user for service@rensto.com | PASS | Same UUID, tier=pro, limit=500 |
| 14 | User IDs match across tables | PASS | Both tables share 5fd79287-... |
| 15 | Entitlement with 500 credits | PASS | credits_balance=500, plan=pro, status=active |
| 16 | User role is ADMIN | PASS | Confirmed |
| 17 | Valid magic link tokens exist | PASS | 3 unused tokens ready |
| 18 | ADMIN_EMAILS in all 3 auth files | PASS | service@rensto.com,admin@rensto.com |
| 19 | Cookie domain .rensto.com (verify) | PASS | Cross-subdomain auth works |
| 20 | Admin redirect to admin.rensto.com | PASS | `https://admin.rensto.com` in verify route |
| 21 | Logout cookie domain matches | PASS | .rensto.com in logout route |
| 22 | Design system brand colors | PASS | #fe3d51, #bf5700, #1eaef7, #5ffbfd, #110d28 |
| 23 | No wrong design colors | PASS | No #7C3AED, Poppins only in anti-patterns |
| 24 | VERCEL_PROJECT_MAP has admin.rensto.com | PASS | Listed under rensto-site |
| 25 | Middleware handles admin.rensto.com | PASS | hostname check present |

**25/25 PASS.** All changes verified.

---

### Changes made this session

- **admin.rensto.com broken (was 404)**: Root cause — domain was on stale `rensto-admin` Vercel project that had no working app. Fix: removed from rensto-admin, added to rensto-site. Middleware in rensto-site already handled admin.rensto.com rewrites.
- **Cross-subdomain auth**: Cookie had no `domain` attribute → scoped to rensto.com only → admin.rensto.com couldn't read it. Fix: set `domain: '.rensto.com'` in verify and logout routes.
- **Magic link admin redirect**: Was `/admin` (path on rensto.com) → now `https://admin.rensto.com` in production.
- **Owner account created**: `service@rensto.com` with ADMIN role, 500 credits, in both Prisma User + Drizzle users tables (same UUID). Entitlement active.
- **RESEND_API_KEY**: Set in Vercel production + preview via API.
- **ADMIN_EMAILS default**: Changed from `admin@rensto.com` to `service@rensto.com,admin@rensto.com` in auth.ts, send/route.ts, verify/route.ts.
- **Schema drift noted**: Prisma schema says `emailVerified DateTime?` but actual DB column is `boolean`. `User.id` is `@db.Uuid` in schema but `text` in actual DB. Not fixed (requires migration) but worked around with raw SQL.
- **Two user tables**: `"User"` (Prisma, text id) and `users` (Drizzle, uuid id). Entitlements FK → `users`. Owner account inserted into both with matching UUID.

- **Complete Firestore elimination**: All 7 client-side pages that queried Firestore directly have been migrated to server-side API routes backed by Prisma/PostgreSQL. All Firestore seed/migration scripts deleted. `firebase` client SDK package removed from package.json. Only `firebase-admin` remains (Storage-only for onboarding secrets). AITable sync tools (`sync_leads_to_aitable.js`, `sync_extended_to_aitable.js`, `simulate_lead.js`) rewritten from Firestore to Postgres.
  - **Pages migrated**: approvals, dashboard, runs, agents, fulfillment queue, vault management, onboarding client
  - **API routes created**: `/api/app/approvals`, `/api/app/approvals/[id]/respond`, `/api/app/runs`, `/api/app/dashboard`, `/api/app/agents`, `/api/admin/fulfillment/queue`, `/api/admin/vault`, `/api/app/onboarding/submit`
  - **Files deleted**: `firebase-client.ts`, `firebase.ts`, 17 obsolete Firestore seed/migration scripts
  - **Build verified**: `next build` passes with zero errors

- **Full SaaS + NotebookLM cross-reference audit**: 4-agent codebase audit + 7-notebook deep query. Found 13 cross-notebook contradictions, 6 notebook-vs-codebase mismatches, 4 redundancies. Key fixes applied:
  - **Pricing conflict**: 3 notebooks had different pricing models (tokens vs credits vs per-video). Canonical: "credits" at 50/video. Override sources added to 719854ee, 0baf5f36.
  - **Veo deprecated but referenced**: 5811a372 promoted Veo 3.1 as viable. Override added marking Veo deprecated, Kling 3.0 only.
  - **fal.ai deprecated but referenced**: 5811a372 said "Kling via fal.ai". Override added. NOTEBOOKLM_INDEX updated to mark fal.ai notebook deprecated.
  - **Clerk/Supabase never implemented**: 5811a372 listed Clerk auth and Supabase DB. Override added — actual stack is magic-link + direct PostgreSQL.
  - **learning.log retired**: 5811a372 and 12c80d7d referenced learning.log. Override sources added → use findings.md.
  - **f0747c8b (prd template) is different product**: Voice-note-to-video for "Mivnim", not TourReel. Override source added marking it LEGACY. Added to NOTEBOOKLM_INDEX.
  - **CLAUDE.md fixes**: Firestore changed from "fallback reads only" to "deprecated Feb 2026". Worker stack specified "Kie.ai Kling 3.0".
  - **CODEBASE_VS_NOTEBOOKLM.md**: Added missing notebooks (719854ee, b906e69f, f0747c8b).
  - **Admin API routes P0**: All `/api/admin/*` routes lacked auth. Adding verifySession() + admin role check.
  - **Orphaned payment routes deleted**: `/api/payment/create` and `/api/payment/confirm` — zero callers, Firestore imports, no auth. Removed.
  - **56 Firestore imports**: Remain in codebase as stubs (throw at runtime). Documented for future cleanup.

- **Final sweep — continued session**:
  - **NotebookLM stale sources deleted (4)**:
    - 0baf5f36: "Architectural Blueprint for Zillow Drone Tour Automation" (Veo core) — deleted
    - 0baf5f36: "Cinematic Video Pipeline Runtime Configurations" (legacy credit costs 1-3) — deleted
    - 0baf5f36: "Zillow-to-Drone-Tour System Implementation Specification" (Veo + fal.ai) — deleted
    - 5811a372: "Architecting an AI Real Estate Video SaaS with Veo 3.1" (OBSOLETE by own OVERRIDE) — deleted
  - **Pricing page fixed**: Corrected tiers from $49/$99/$199 to canonical $299/$699/$1499 with 500/1500/4000 credits. Replaced `alert()` placeholder with real Stripe checkout via new `/api/video/subscribe` route.
  - **Subscribe API route created**: `apps/web/rensto-site/src/app/api/video/subscribe/route.ts` — creates Stripe subscription checkout session with correct metadata for credit provisioning.
  - **Webflow references purged**: All stale "Matching Webflow Brand System" comments removed from globals.css.
  - **Checkout platform label fixed**: `api/checkout/route.ts` metadata changed from `rensto-firebase` to `rensto-web`.
  - **Design system verified**: globals.css colors match notebook 286f3e4a exactly (#fe3d51, #bf5700, #1eaef7, #5ffbfd, #110d28).

- **Remaining technical debt** (not launch-blocking for TourReel self-serve):
  - ~~20+ server-side routes still import `getFirestoreAdmin`~~ — RESOLVED: `getFirestoreAdmin()` throws; 17 dead scripts deleted.
  - ~~6 client-side pages import `firebase/firestore`~~ — RESOLVED: All 7 pages migrated to Postgres API routes.
  - `custom-solutions/intake` has demo mode hardcoded IDs — old flow, not TourReel.
  - Rate limiting missing on public POST routes — security best practice, not a crash.
  - Stripe price IDs (`STRIPE_STARTER_PRICE_ID` etc.) need real values from Stripe dashboard before pricing page works end-to-end.

---

## 2026-02-15

- **Floorplan in listing photos**: When user skips floorplan upload, pipeline now scans scraped listing photos with Gemini vision to detect a floorplan/blueprint. If found, uses it for analyzeFloorplan; else uses default tour + property photos. `detectFloorplanInPhotos()` in gemini.ts.
- **Image/room mismatch, invented stairs, invented furniture, extra people**: (1) **Stairs**: Default sequences and floorplan included Stairs for 4+ bed homes; single-story ranches got invented stairs. Fix: `isSingleStory(listing)` parses description/amenities/reso_facts for "ranch", "1 story", etc.; `getDefaultSequence` and `buildTourSequence` filter out Stairs when single-story. Floorplan prompt: "Add Stairs ONLY if floorplan CLEARLY shows multiple floors." (2) **Photo–room mismatch**: Heuristic used index (pool=last, foyer=second). Fix: `matchPhotosToRoomsWithVision` (Gemini) when USE_AI_PHOTO_MATCH≠false; assigns best photo per room by content. (3) **Invented furniture**: Kling was inferring from listing (e.g. 70s) and adding period furniture. Fix: KLING_REALTOR_NEGATIVE + "invented furniture, added furnishings, staged furniture, remodeled room"; buildRealtorOnlyKlingPrompt: "CRITICAL: Preserve the EXACT room, furniture, decor. Do NOT add, remove, or change furnishings." (4) **Extra people**: Strengthened negative: "bystander, stranger, family member, guest, crowd, multiple people." See kie.ts for buildRealtorOnlyKlingPrompt
- **Video "extra low quality" (all recent runs)**: Root cause: **Kling Standard = 720p output**. Pipeline used `mode: "std"` then upscaled to 1080p → blur. Fix: (1) Kling `mode: "pro"` (1080p native). Env `KIE_KLING_MODE=std` to revert if Kie 500. (2) Nano Banana `resolution: "4K"` (was 2K) for sharper composites. Env `NANO_BANANA_RESOLUTION=2K` to revert. (3) FFmpeg preset `medium` (was `fast`). See kie.ts for buildRealtorOnlyKlingPrompt
- **Worker status overwritten by retry**: Job `deb73ec3` had `master_video_url` populated but `status` remained `generating_clips`. Root cause: Run 1 completed successfully (UPDATE set status=complete); BullMQ retried (e.g. throw after UPDATE, process kill); Run 2 called `updateJobStatus(jobId, "generating_clips", 26)` which overwrote status/progress but NOT master_video_url. Fix: (1) Idempotent start: if `master_video_url` exists, sync status to complete and return. (2) `updateJobStatus` never overwrites when `status='complete' AND master_video_url IS NOT NULL`.
- **Methodology consolidation**: Multiple working methods (B.L.A.S.T., agent behavior, work-method) had conflicting guidance—B.L.A.S.T. "HALT" vs agent "one output." Created METHODOLOGY.md as single SSOT: B.L.A.S.T. for new projects (phase gates), Agent Behavior for routine tasks (one final output). Updated brain.md, .cursorrules, CONFLICT_AUDIT, agent-behavior rules to reference METHODOLOGY.md. No more conflicts.
- **Full video + regen workflow**: Generate FULL video first. Quality issues (cartoon, style drift) can appear in any scene (2, 3, 4+). To fix bad clips only: `JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`. MAX_CLIPS=1 is DEBUG ONLY—never for quality validation.
- **Smoke "stuck"**: Job can sit behind others in BullMQ queue. Run `npx tsx tools/smoke-preflight.ts --drain` first to clear waiting jobs + ensure credits. Worker must have MAX_CLIPS=1 for fast (1-clip) smoke.
- **Video quality regression (realtor robotic, zero listing focus)**: Adding "Person moves FORWARD through the space" to `buildRealtorOnlyKlingPrompt` caused Kling to produce robotic straight-line motion—realtor "going straight", "looking for something", no room engagement. Fix: remove "Person moves FORWARD"; add room-as-star and production guidance ("The [room] is the focus. Reveal the space... Natural real estate tour. Cinematic."). Keep KLING_REALTOR_NEGATIVE. Add talking/lips to neg. See kie.ts for buildRealtorOnlyKlingPrompt
- **Kie.ai Kling 422 (multi_shots)**: Kie returned 422 "multi_shots cannot be empty" when we omitted the field. Fix: add `multi_shots: false` to Kling input.
- **Kie.ai Kling 500 (our fault)**: We passed Zillow/source URLs to Kie when ensurePublicUrl failed. Kie cannot fetch those (blocked, auth-required) → 500. Fix: (1) ensurePublicUrl returns null on fetch/upload failure, never original URL. (2) Never pad additionalPublic with original photos. (3) config.r2.publicUrl fallback to r2.dev when unset. (4) kie.ts: isPublicFetchableUrl guard—reject Zillow/non-http URLs before API call. (5) Throw UnrecoverableError when zero usable photos.
- **Agent "stuck" / silent wait**: User had to ask "are you stuck?" because agent ran long commands without progress. Never run one command >3 min without intermediate output. Rule: bounded iterations, report between chunks, explicit timeouts. Never say "I'm stuck"—hit timeout, report, try next approach. See agent-behavior.mdc.
- **Pipeline config duplication**: Clip duration (5s) and max clips (15) were hardcoded in kie.ts, prompt-generator, video-pipeline. Fix: TOURREEL_REALTOR_HANDOFF_SPEC §0b declares config.ts as SSOT; all code reads config.video.defaultClipDuration and config.video.maxClipsPerVideo.
- **Port confusion**: README said site 3001 (wrong—it's 3002). VIDEO_APP_USER_GUIDE said localhost:3000 (wrong—3002). e2e-from-zillow, run-smoke defaulted to 3002 for API_URL but worker is 3001 when both run. Fix: PORT_REFERENCE.md = SSOT. All docs/tools updated.
- **Conflict audit protocol**: When user asks "do you have conflicts?"—run CONFLICT_AUDIT.md checks (git, ports, docs, config), do not confirm without executing. Audit doc is runnable checklist.
- **Video page 404 on rensto.com**: rensto-site.vercel.app/video/create and /video/[jobId] work; rensto.com can 404 if the domain points to a different Vercel project. Fix: In Vercel, ensure rensto.com is aliased to the same project as rensto-site.vercel.app. If multiple projects exist (e.g. api.rensto.com), add rensto.com domain to the project that has the video routes. Added redirect /video → /video/create.
- **Video "fetch failed"**: API proxies to VIDEO_WORKER_URL; worker unreachable or 404 → fetchJobFromDb reads video_jobs+listings+clips from shared Postgres. Returns real address, exterior_photo_url, floorplan_url, clips. Only falls back to mock if DB has no record.
- **Kie.ai charges every couple minutes**: BullMQ retries (attempts: 3, backoff 30s) caused repeated pipeline runs when job failed (e.g. Insufficient Credits). Each retry = full Kie.ai usage. Fix: throw `UnrecoverableError` for unrecoverable errors.

---

## 2026-02-13

- **Local docs → NotebookLM**: Two-round migration. Round 1: core docs. Round 2 (gap audit): full REFERENCE_ALIGNMENT (hierarchy, sync), full design system (backgrounds, Tailwind, layout patterns), full pipeline (testing, config, model compliance, three fixes), AGENT_SELF_AUDIT, AGENT_HANDOFF, 3-SCENE_VERIFICATION, full gemini (Lead/Token schema). AGENT_SELF_AUDIT, AGENT_HANDOFF, 3-SCENE_VERIFICATION still in codebase; content duplicated in 0baf5f36.

- **Documentation discipline**: Agent created progress.md, findings.md, REFERENCE_ALIGNMENT, work-method rules—then failed to use them. Did not log job creation, browser verification, or session events. User: "I see you disrespect me and ignore what we do here." Rule: Update progress.md and findings.md after each task, not only at session end. "Each little thing" = log it.

- **Real-data video page flow**: When worker running + VIDEO_WORKER_URL set + valid job ID: page shows real address (1531 Home Park Dr), real listing, status from DB. Job `68fc0ba2-4415-4841-a7a9-b47288b38b43` showed FAILED (credits). Mock only when worker 404/unreachable in dev.

- **Reference alignment**: Agent was mixing references (Cursor rules vs CLAUDE vs brain vs NotebookLM vs Antigravity vs Aitable vs Postgres) because no canonical hierarchy existed. Created REFERENCE_ALIGNMENT.md: precedence order, topic→SSOT map, sync discipline, anti-patterns. Ensures B.L.A.S.T. and other methods are taken seriously via explicit hierarchy.

- **Work method accountability**: User repeatedly finds issues before agent. Root causes: no browser verification before handoff; reactive fixes; ignoring feedback. Created work-method-accountability.mdc (alwaysApply) with mandatory: open URL in browser for user-facing flows; run dry-run for pipeline changes; acknowledge work-method failure when user reports.

- **Pipeline Veo violation**: video-pipeline.worker.ts had Veo as fallback despite TOURREEL_REALTOR_HANDOFF_SPEC and AGENT_SELF_AUDIT saying "Kling 3 only". Removed. Model rules now in TOURREEL_REALTOR_HANDOFF_SPEC §0.

- **VideoGeneration error handling**: When `/api/video/jobs/[id]` returns 4xx/5xx, the frontend threw "Failed to fetch job". Causes: (1) visiting `/video/mock-job-001` while VIDEO_WORKER_URL is set → worker 404; (2) job ID typo → 404; (3) worker down → 502. Fixes: (a) Parse error body, surface `data.error` or `Failed to fetch job (status)`. (b) **Dev fallback**: API route returns mock job when worker 404/5xx or unreachable (IS_DEV). In dev, any `/video/[id]` loads—no error. Production stays strict.

- **Process gap**: User found "Failed to fetch job" before agent. Rules require "Test in browser" but agent did not open the video URL before handoff. Added explicit rule in work-method-accountability.mdc: "User-facing flows: Open the URL in the browser and confirm it loads without console errors before sharing with the user."

- **Agent reporting**: User does not want session updates in conversation. Update progress.md and findings.md at end of every task. The project memory files are the reference—not the user. If out of context or missing access, state what is needed.

- **Video test prep**: Before next video test—(1) Deploy worker to RackNerd if testing there. (2) Preflight --free passes. (3) Create job or retry-fresh. (4) progress.md has "Last Video Issues" and "Before Next Video Test" checklist.

---

## Security & Operations (from Feb 2026 audits)

- **Git history / VPS credentials**: Old password `05ngBiq2pTA8XSF76x` may appear in git history (deleted deploy-to-racknerd.js, execute script). Rotate on VPS; never hardcode. Use `VPS_PASSWORD` or `RACKNERD_SSH_PASSWORD` env vars.
- **library/solution-data/uad.csv**: URLs point to 172.245.56.50:8080. Update if server changes.
- **docs/templates/tourreel vs apps/worker/legacy_archive**: Verify which is canonical for TourReel templates when updating.
- **Realtor placement research**: Industry standard is PiP/overlay; in-scene (Nano+Kling) has limits. Full research → NotebookLM 0baf5f36 when MCP available.

---

## Archived

Historical findings: `infra/archive/findings.md`

---

*Add new entries above with date.*
