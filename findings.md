# Findings

**Purpose**: Research, discoveries, constraints, root causes. Updated by agents after each meaningful task. **Use for "never repeat"**: When an issue is fixed, add the root cause here so it does not recur. (Historical lessons: `apps/worker/legacy_archive/lessons.md`.)

**Doc hygiene**: Don't create a new .md for every task. Update brain, CLAUDE, findings, progress, DECISIONS. Archive one-off audits after merging key points to main docs. Delete empty or obsolete .md. When searching, prefer main docs (brain, CLAUDE, findings, DECISIONS, METHODOLOGY, CONFLICT_AUDIT) — not archived residue.

---

## 2026-02-16

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
  - 20+ server-side routes still import `getFirestoreAdmin` — old agency/custom-solutions model, not TourReel. Will crash if visited, but these routes are not linked from TourReel UI.
  - 6 client-side pages import `firebase/firestore` — old app pages (approvals, dashboard, runs, agents, fulfillment, onboarding). Same: not linked from TourReel UI.
  - `custom-solutions/intake` has demo mode hardcoded IDs — old flow, not TourReel.
  - Rate limiting missing on public POST routes — security best practice, not a crash.
  - Stripe price IDs (`STRIPE_STARTER_PRICE_ID` etc.) need real values from Stripe dashboard before pricing page works end-to-end.

---

## 2026-02-15

- **Floorplan in listing photos**: When user skips floorplan upload, pipeline now scans scraped listing photos with Gemini vision to detect a floorplan/blueprint. If found, uses it for analyzeFloorplan; else uses default tour + property photos. `detectFloorplanInPhotos()` in gemini.ts.
- **Image/room mismatch, invented stairs, invented furniture, extra people**: (1) **Stairs**: Default sequences and floorplan included Stairs for 4+ bed homes; single-story ranches got invented stairs. Fix: `isSingleStory(listing)` parses description/amenities/reso_facts for "ranch", "1 story", etc.; `getDefaultSequence` and `buildTourSequence` filter out Stairs when single-story. Floorplan prompt: "Add Stairs ONLY if floorplan CLEARLY shows multiple floors." (2) **Photo–room mismatch**: Heuristic used index (pool=last, foyer=second). Fix: `matchPhotosToRoomsWithVision` (Gemini) when USE_AI_PHOTO_MATCH≠false; assigns best photo per room by content. (3) **Invented furniture**: Kling was inferring from listing (e.g. 70s) and adding period furniture. Fix: KLING_REALTOR_NEGATIVE + "invented furniture, added furnishings, staged furniture, remodeled room"; buildRealtorOnlyKlingPrompt: "CRITICAL: Preserve the EXACT room, furniture, decor. Do NOT add, remove, or change furnishings." (4) **Extra people**: Strengthened negative: "bystander, stranger, family member, guest, crowd, multiple people." @see apps/worker/VIDEO_QUALITY_AUDIT.md
- **Video "extra low quality" (all recent runs)**: Root cause: **Kling Standard = 720p output**. Pipeline used `mode: "std"` then upscaled to 1080p → blur. Fix: (1) Kling `mode: "pro"` (1080p native). Env `KIE_KLING_MODE=std` to revert if Kie 500. (2) Nano Banana `resolution: "4K"` (was 2K) for sharper composites. Env `NANO_BANANA_RESOLUTION=2K` to revert. (3) FFmpeg preset `medium` (was `fast`). @see apps/worker/VIDEO_QUALITY_AUDIT.md
- **Worker status overwritten by retry**: Job `deb73ec3` had `master_video_url` populated but `status` remained `generating_clips`. Root cause: Run 1 completed successfully (UPDATE set status=complete); BullMQ retried (e.g. throw after UPDATE, process kill); Run 2 called `updateJobStatus(jobId, "generating_clips", 26)` which overwrote status/progress but NOT master_video_url. Fix: (1) Idempotent start: if `master_video_url` exists, sync status to complete and return. (2) `updateJobStatus` never overwrites when `status='complete' AND master_video_url IS NOT NULL`.
- **Methodology consolidation**: Multiple working methods (B.L.A.S.T., agent behavior, work-method) had conflicting guidance—B.L.A.S.T. "HALT" vs agent "one output." Created METHODOLOGY.md as single SSOT: B.L.A.S.T. for new projects (phase gates), Agent Behavior for routine tasks (one final output). Updated brain.md, .cursorrules, CONFLICT_AUDIT, agent-behavior rules to reference METHODOLOGY.md. No more conflicts.
- **Full video + regen workflow**: Generate FULL video first. Quality issues (cartoon, style drift) can appear in any scene (2, 3, 4+). To fix bad clips only: `JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`. MAX_CLIPS=1 is DEBUG ONLY—never for quality validation.
- **Smoke "stuck"**: Job can sit behind others in BullMQ queue. Run `npx tsx tools/smoke-preflight.ts --drain` first to clear waiting jobs + ensure credits. Worker must have MAX_CLIPS=1 for fast (1-clip) smoke.
- **Video quality regression (realtor robotic, zero listing focus)**: Adding "Person moves FORWARD through the space" to `buildRealtorOnlyKlingPrompt` caused Kling to produce robotic straight-line motion—realtor "going straight", "looking for something", no room engagement. Fix: remove "Person moves FORWARD"; add room-as-star and production guidance ("The [room] is the focus. Reveal the space... Natural real estate tour. Cinematic."). Keep KLING_REALTOR_NEGATIVE. Add talking/lips to neg. @see apps/worker/VIDEO_QUALITY_AUDIT.md
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
