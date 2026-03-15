# Pitfalls Research

**Domain:** Multi-model AI video pipeline — adding fal.ai + quality feedback loops + self-learning routing to existing Kie.ai production system
**Researched:** 2026-03-14
**Confidence:** HIGH (grounded in this codebase's actual failure history + fal.ai docs + Remotion production notes)

---

## Critical Pitfalls

### Pitfall 1: Provider Adapter Gets Instantiated But Provider Field Never Switches

**What goes wrong:**
`router.ts` line 125 reads `const provider = defaultHint.provider` from `SHOT_DEFAULT_MODELS`. The Observatory can recommend a different `modelId` but the adapter instantiation is driven by `defaultHint.provider`, not the Observatory result. If `dialogue` defaults to `provider: 'kie'` for veo-3.1, and the Observatory recommends a fal.ai model for that use case, the code still instantiates `KieAdapter`. The fal model gets passed to Kie's API endpoint which returns a 422.

**Why it happens:**
The Observatory was built during v1.0 when only Kie.ai existed as a live provider. The provider field was never intended to be dynamic — it was hardcoded in `SHOT_DEFAULT_MODELS`. Now that fal.ai is being activated, this implicit assumption breaks.

**How to avoid:**
Store provider alongside model in the Observatory result. Add a `provider` column to `ai_models` table. `getRecommendedModel()` must return provider, not just modelId. `routeShot()` must instantiate adapter from `selection.provider`, not `defaultHint.provider`. This is a one-migration, one-function change — do it in Phase 1 before activating any fal route.

**Warning signs:**
- 422 errors on shots that should route to fal.ai
- Observatory logs show model selected as `fal-ai/kling-video/v2.1/pro/image-to-video` but KieAdapter is in the log
- `ai_model_decisions` rows show fal model IDs but Kie endpoint URLs

**Phase to address:** Phase 1 (fal.ai activation) — must be fixed before any fal route goes live.

---

### Pitfall 2: fal.ai Billing Behavior on Failure Is Undocumented — Assume You Pay

**What goes wrong:**
The Feb 28, 2026 incident burned $8.60 on 5 test jobs with Kie.ai because format errors (WebP→422) were retried. fal.ai's pricing docs do not specify whether charges apply when the API returns an error vs. when generation succeeds. Production polling loops will retry on transient errors. If fal.ai bills on submission (not completion), retries on format errors cost real money.

**Why it happens:**
fal.ai docs explicitly state: "billing on failure — documentation does not address this." The queue-based API (`POST queue.fal.run/{modelId}`) accepts the job and returns a `request_id` before any generation happens. The charge point is unknown from documentation alone.

**How to avoid:**
1. Before activating fal.ai for any production tenant, run ONE test job with fal.ai support and monitor the billing dashboard to determine charge point (on submission vs on completion).
2. Add format validation BEFORE the fal.ai `submitJob()` call — image URLs must be https, public, and in supported formats (jpg/png minimum, webp support unclear for all fal models). Mirror the `isPublicFetchableUrl` guard that Kie already has.
3. Wrap `FalAdapter.submitJob()` in `UnrecoverableError` for 4xx responses so BullMQ does not auto-retry and multiply charges.
4. Log every fal.ai `request_id` to a `fal_jobs` table immediately on submission — needed for deduplication if BullMQ retries.

**Warning signs:**
- fal.ai dashboard shows more charges than `ai_model_decisions` rows
- `submitJob()` succeeded but `pollStatus()` returns `FAILED` — check whether credit was consumed
- Multiple `request_id` values for the same BullMQ `jobId`

**Phase to address:** Phase 1 (fal.ai activation) — billing validation is a prerequisite for any production traffic.

---

### Pitfall 3: Veo 3.1 Re-Removal — The Same Reason Will Recur

**What goes wrong:**
Veo 3.1 was removed in Feb 2026 with this history in `findings.md`: "Veo deprecated but referenced — 1dc7ce26 promoted Veo 3.1 as viable. Override added marking Veo deprecated, Kling 3.0 only." And in `kie.ts`: "Veo is DEPRECATED (Feb 2026). Kling 3.0 is the only approved video model for SuperSeller AI. KieVeoRequest and createVeoTask removed."

The current `SHOT_DEFAULT_MODELS` already has `dialogue: { provider: 'kie', modelId: 'veo-3.1' }` — a direct violation of the documented decision. If Veo 3.1 is re-integrated without addressing why it was removed, it will be removed again.

**Why it happens:**
The removal reason is documented but the primary decision artifact (`decisions.md` or the code comments) says "see findings.md 2026-02-17" without stating the actual reason. The model router team added veo-3.1 back into `SHOT_DEFAULT_MODELS` for the dialogue shot type without checking the removal history. The `types/index.ts` still has `ModelPreference = "kling_3"` with the comment "No Veo — Kie Kling 3 only (rewired architecture)" — this is already contradicting `shot-types.ts`.

**How to avoid:**
Before re-integrating Veo 3.1, explicitly verify:
1. Was Veo removed because of Kie.ai's API instability for Veo (different endpoint, different task type, polling differs)?
2. Or was it a strategy decision (cost, quality, Kling supremacy)?
3. Or a codebase inconsistency (bot kept breaking, too many code paths)?

From `findings.md`: the removal was a **strategy decision** — Kling 3.0 was determined to be better for all use cases. Re-integration should be gated on a documented reversal of that decision in `DECISIONS.md`. Do not add it to `SHOT_DEFAULT_MODELS` until that gate is cleared. The `video_jobs.model_preference` column still has `veo_31_fast` and `veo_31_quality` as CHECK constraint values — this schema must be updated if Veo returns.

**Warning signs:**
- `shot-types.ts` references `veo-3.1` while `types/index.ts` says "No Veo"
- `kie.ts` has the function `createVeoTask` re-appearing after removal
- `video_jobs.model_preference` CHECK constraint is never updated when model list changes

**Phase to address:** Phase 2 (Veo 3.1 re-integration) — start with a DECISIONS.md entry, not with code.

---

### Pitfall 4: Quality Feedback Loop That Writes But Never Reads

**What goes wrong:**
`content_entries.performance_score` already exists in the Drizzle schema with an index on `(tenant_id, performance_score)`. It is never written to by any worker code (confirmed: no `performance_score` writes in worker grep). The Observatory quality scores are manually set (confirmed: `ai_models` rows are seeded, never updated by pipeline). Adding a quality feedback loop that writes scores but has no reader — no code that queries scores to adjust routing — creates the illusion of a feedback system while routing stays static.

**Why it happens:**
Schema-first development: the column was added in anticipation of a feedback loop that was never built. The temptation in v1.1 is to build the writing side (score generation) as "Phase 1" and defer the reading side (routing adjustment) to later — which then never ships because the system "seems to be working."

**How to avoid:**
Build the feedback loop read-side first or simultaneously, not after. The minimum viable feedback loop requires:
1. A writer: after generation, write a quality score to `ai_model_decisions` or a new `generation_outcomes` table.
2. A reader: the Observatory query in `getRecommendedModel()` must incorporate those scores — either by filtering for high-scoring models or by weighting cost vs. quality.
3. A verification: a SQL query that proves scores are influencing routing decisions (e.g., a model's routing frequency changed after score accumulation).

Without all three, this is logging, not a feedback loop.

**Warning signs:**
- `performance_score` column is always NULL or always the same default
- `ai_model_decisions` table grows but `ai_model_recommendations` never changes
- No query in the codebase joins `ai_model_decisions` back to `ai_model_recommendations`

**Phase to address:** Phase 3 (quality feedback loop) — define the reading mechanism before implementing the writing mechanism.

---

### Pitfall 5: Self-Learning Router Degrades During Cold Start and Data Sparsity

**What goes wrong:**
The Observatory is currently a static lookup: `WHERE use_case = $1` returns one hardcoded recommendation. When quality scores start influencing routing, the system has no data for new use cases, new tenants, or newly activated providers (fal.ai). During this cold start period, the router falls back to `SHOT_DEFAULT_MODELS` — which is correct behavior — but if the feedback loop starts adjusting recommendations based on insufficient data (e.g., 2 generations), it can lock in a bad model before enough signal exists.

**Why it happens:**
Small sample sizes produce statistically unreliable quality scores. A model that produces one great result and one terrible result has an average score identical to a consistently mediocre model. Routing adjustments based on these early scores harm quality rather than improve it.

**How to avoid:**
Implement a minimum sample threshold before routing can be adjusted by feedback:
- Minimum 20 generations per use_case before score-based adjustment is active
- Until threshold is met, route to the static default (current behavior)
- Store sample count alongside quality score in the routing table
- Make the threshold configurable in `config.ts` so it can be tuned without deployment

Also: never adjust routing based on a single tenant's feedback. Aggregate across all tenants for the same use case.

**Warning signs:**
- `ai_model_recommendations` table gets updated after fewer than 10 `ai_model_decisions` rows for that use case
- Routing changes happen within hours of first activation of a new provider
- Quality complaints increase after feedback loop activates (counter-intuitive signal that cold start is hurting routing)

**Phase to address:** Phase 3 (self-learning routing) — define the sample threshold as the first acceptance criterion.

---

### Pitfall 6: Remotion Bundle Bloat From Adding Compositions

**What goes wrong:**
`remotion-renderer.ts` bundles once at startup via `ensureBundle()` and reuses the bundle across renders. The bundle includes ALL compositions from `remotion/src/index.ts`. Adding parametric local-business templates (3-5 new compositions) to the existing `PropertyTour-16x9/9x16/1x1/4x5` set increases bundle size and first-render latency. In memory-constrained environments (RackNerd 5.8GB, ~3.1GB available), a larger Chromium-rendered bundle can cause OOM kills on the first render after restart.

**Why it happens:**
Remotion bundles are webpack bundles — they include every imported component even if only one composition is being rendered. Adding compositions is additive. The bundle size grows linearly with composition complexity and their asset imports.

**How to avoid:**
1. Before adding new compositions, measure the current bundle size: `ls -lh` on the bundle directory after `ensureBundle()` runs.
2. Use lazy imports inside compositions — don't import large video/image assets at the module level.
3. Add a new composition entry point file (`remotion/src/local-biz-index.ts`) if local-biz templates import heavy dependencies not needed for property tours. Register them separately.
4. After adding compositions, validate that `ensureBundle()` completes on RackNerd without OOM: deploy, restart PM2, curl the health endpoint, trigger one render, watch `htop`.

**Warning signs:**
- PM2 shows OOM kills immediately after restart
- `ensureBundle()` takes >60 seconds (was 10-30s before)
- `htop` shows worker memory climbing to >80% during bundle phase

**Phase to address:** Phase 4 (Remotion template library) — benchmark before and after each composition addition.

---

### Pitfall 7: Per-Clip Cost Attribution Breaks When Provider Changes Mid-Job

**What goes wrong:**
`trackExpense()` currently uses hardcoded `COST_RATES[service][operation]`. When a job uses multiple providers (e.g., clip 1 via Kie.ai, clips 2-4 via fal.ai, clip 5 via Kie.ai again due to budget fallback), the `service` field needs to be provider-specific. If all clips are tracked as `service: 'kie'`, fal.ai costs are mis-attributed. Total cost reconciliation against actual billing dashboards becomes impossible.

**Why it happens:**
`trackExpense()` was built when Kie.ai was the only provider. The `service` field was always `'kie'`. Multi-provider routing means the tracking call must be aware of which provider actually executed the generation, not which provider is the default.

**How to avoid:**
`routeShot()` returns a `RouterResult` that includes the `adapter` and `selection`. The calling code (clip generation logic) must pass the provider name to `trackExpense()`. Add a `provider` field to `RouterResult` and propagate it through the clip generation path. The `trackExpense()` call at clip completion must use `service: result.adapter.providerName` not a hardcoded string.

Also: fal.ai billing is per-second (video) or per-megapixel (image). `estimateCost()` in `FalAdapter` uses `costPerUnit * (duration / 5)` which assumes 5s is the base unit — this must match fal.ai's actual billing granularity for each model.

**Warning signs:**
- `api_expenses` rows show `service: 'kie'` for jobs that routed to fal.ai
- Total expenses in DB don't reconcile with fal.ai dashboard charges
- `estimated_cost` is always the same per clip regardless of provider

**Phase to address:** Phase 1 (fal.ai activation) — cost attribution must be correct from the first fal.ai production call.

---

### Pitfall 8: Prompt Index That Nobody Queries

**What goes wrong:**
`prompt_configs` table and `prompt-store.ts` already exist. Adding "prompt effectiveness tracking and indexing" as a v1.1 feature risks creating a second prompt storage system alongside the existing one, or adding effectiveness columns to `prompt_configs` that are never populated (mirroring the `performanceScore` problem). The 5-minute TTL cache means updates to prompt versions take up to 5 minutes to propagate — this is tolerable for stable prompts but problematic for A/B testing.

**Why it happens:**
Prompt effectiveness tracking sounds like a natural extension but requires a clear definition of "effectiveness." Without a metric (view-through rate? quality score? customer approval?), the tracking system stores data that no decision-making process reads.

**How to avoid:**
Define what "effective" means for a prompt before building any tracking:
- Is it quality score from the Observatory?
- Is it customer approval rate (APPROVE vs RETRY/SKIP admin commands)?
- Is it cost efficiency (quality/cost ratio)?

The admin command log already exists in the pipeline. APPROVE/RETRY/SKIP events per `pipelineRunId` can be joined to `prompt_configs.id` if the generation step stores which prompt version was used. This join is the effectiveness signal. Build the join query first (as a SQL view), then verify it produces meaningful signal before adding new storage.

**Warning signs:**
- A new `prompt_effectiveness` table is created without a corresponding reader query
- `prompt_configs.metadata` grows with effectiveness fields but no code reads them
- A/B test is set up in DB but the cache TTL means both variants serve the same prompt for 5 minutes

**Phase to address:** Phase 3 (prompt indexing) — write the analysis query before building the tracking writer.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Provider hardcoded in `SHOT_DEFAULT_MODELS` | No DB migration needed | Observatory can never recommend cross-provider model | Never — fix before fal.ai activation |
| Quality scores written but routing ignores them | Fast to ship | Creates false confidence in "working" feedback loop | Never — both sides must ship together |
| `trackExpense()` with hardcoded `service: 'kie'` | No refactor needed | Multi-provider cost reconciliation is impossible | Never — fix before first fal.ai production call |
| Remotion bundle includes all compositions | Simple registration | OOM on memory-constrained RackNerd | Acceptable until >6 compositions added |
| Observatory minimum sample threshold skipped | Faster to implement | Router degrades during cold start | Never — threshold must exist from day 1 of feedback loop |
| Prompt effectiveness metric undefined | Faster to ship | Tracking data that drives no decisions | Never — define metric before building |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| fal.ai queue API | Treating `IN_QUEUE` as a transient error and retrying submission | `IN_QUEUE` is a valid terminal state for the submission call — only retry polling, never resubmit |
| fal.ai queue API | Not storing `request_id` before BullMQ job can be retried | Store `request_id` in `ai_model_decisions` or job data immediately after `submitJob()` returns |
| fal.ai queue API | Using `::` as jobId separator without checking if modelId contains `::` | fal model IDs use `/` not `::` — the `lastIndexOf('::')` in `FalAdapter._parseJobId()` is correct but fragile if this ever changes |
| fal.ai billing | Assuming failed generations are free | Not documented — treat all submitted jobs as potentially billed |
| fal.ai webhooks | Webhook handler not idempotent | The same `request_id` can be delivered up to 10 times over 2 hours — handlers must deduplicate on `request_id` |
| Kie.ai + fal.ai dual-provider | Different auth header formats | Kie uses `Authorization: Bearer {key}`, fal uses `Authorization: Key {key}` — not `Bearer`. The `FalAdapter` correctly uses `Key` but verify no Kie header is accidentally reused |
| Remotion bundle | Adding compositions without checking entry point | All compositions must be registered in `remotion/src/index.ts` — forgetting to register means the composition doesn't exist at render time (silent failure: Remotion renders a blank composition) |
| Model Observatory | Cache not cleared after seeding new models | `clearModelCache()` exists but is never called automatically after DB updates — always call it after seeding new `ai_models` rows |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Observatory 5-min cache hides bad routing after model update | New model seeded, but old model still routes for 5 minutes, burning credits on deprecated model | Call `clearModelCache()` immediately after any `ai_models` or `ai_model_recommendations` update | Every time Observatory is updated |
| fal.ai polling without bounded iteration | Worker polls indefinitely on stuck `IN_PROGRESS` job — BullMQ job timeout not reached, cost accumulates | Add max poll count (e.g., 120 polls × 10s = 20min max) then fail gracefully | First time a fal.ai generation gets stuck server-side |
| Remotion `ensureBundle()` blocking concurrent renders | First render triggers bundle, second render queued behind it — both 30s+ wait | Bundle is already lazy-loaded correctly, but ensure only ONE bundle promise exists (current code is correct — verify no regression when adding compositions) | When first render is triggered under high concurrency |
| `ai_model_decisions` table unbounded growth | Slow queries as table grows to millions of rows | Add time-based partitioning or a cleanup cron; add `WHERE created_at > NOW() - INTERVAL '30 days'` to all Observatory queries | ~100K rows (depending on PostgreSQL config) |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| fal.ai webhook not signature-verified | Spoofed completions — pipeline advances on fake results | Implement ED25519 signature verification using JWKS from `api.fal.ai/v1/meta`; verify timestamp is within ±5 minutes |
| `FAL_API_KEY` not in `.env.example` | Deployed to RackNerd without key set — `FalAdapter` constructor warns but does not throw, requests fail at runtime with 401 | Add `FAL_API_KEY=` to `.env.example` and to `VERCEL_ENV_CHECKLIST.md`; add startup assertion in `config.ts` if fal routes are enabled |
| Per-clip cost logged with wrong tenant | Cost appears on wrong tenant's billing dashboard | `trackExpense()` must receive `tenantId` from `ShotRequest`, not a fallback — enforce at the type level |

---

## "Looks Done But Isn't" Checklist

- [ ] **fal.ai activation:** FalAdapter is written and tests pass — but `FAL_API_KEY` is not set in production `.env`. Verify: `curl http://172.245.56.50:3002/api/health` shows fal configured, or trigger one fal job and confirm it submits (not 401).
- [ ] **Quality feedback loop:** `performance_score` column exists in schema and a writer populates it — but no query reads it to adjust routing. Verify: run `SELECT use_case, COUNT(*) FROM ai_model_decisions GROUP BY use_case` and confirm routing frequency shifts after scores accumulate.
- [ ] **Veo 3.1 re-integration:** `shot-types.ts` has `dialogue: { modelId: 'veo-3.1' }` — but `types/index.ts` says "No Veo" and `kie.ts` says Veo is deprecated. Verify: these three files agree before any veo routing goes live.
- [ ] **Prompt effectiveness:** A `prompt_configs` version is being A/B tested — but the 5-minute cache means both arms may serve the same prompt. Verify: call `invalidateCache()` after any A/B test configuration change.
- [ ] **Per-clip cost attribution:** New fal.ai clips are generating — but `api_expenses.service` is still `'kie'` for fal jobs. Verify: `SELECT service, COUNT(*) FROM api_expenses WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY service` after a mixed-provider job.
- [ ] **Remotion compositions:** New local-biz composition is registered in `shot-types.ts` — but not in `remotion/src/index.ts`. Verify: `npx remotion compositions` lists the new composition ID before deploying.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| fal.ai charges on errored jobs | MEDIUM | Pull fal.ai billing dashboard, cross-reference with `ai_model_decisions` table, identify unbilled vs. billed failures; add `UnrecoverableError` wrapping for 4xx before next deploy |
| Observatory routes to wrong provider after model update | LOW | Call `clearModelCache()` via admin API or worker restart; verify routing in next `ai_model_decisions` row |
| Quality feedback loop adjusts routing on bad data | MEDIUM | Truncate or archive `ai_model_decisions` rows that drove the bad adjustment; manually reset `ai_model_recommendations` to static defaults; re-seed with `clearModelCache()` |
| Remotion OOM from bundle bloat | HIGH | Requires PM2 restart, potentially a rollback of new compositions; add `--max-old-space-size` to PM2 config as mitigation |
| Veo 3.1 re-added without reverting DECISIONS.md decision | LOW | Revert `shot-types.ts` to Kling 3.0 for dialogue; update `types/index.ts` and `kie.ts` comment to match; file formal DECISIONS.md entry |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Provider field never switches (adapter mismatch) | Phase 1: fal.ai activation | Run a shot that should route to fal; confirm `ai_model_decisions` shows fal model + fal adapter in logs |
| fal.ai billing on failure unknown | Phase 1: fal.ai activation | One test job, compare fal dashboard charge to `api_expenses` row |
| Veo 3.1 re-removal (same reason recurs) | Phase 2: Veo re-integration | DECISIONS.md has an explicit entry reversing the Feb 2026 deprecation before any code change |
| Feedback loop writes but never reads | Phase 3: quality feedback loop | SQL query confirms routing frequency changed after score accumulation |
| Cold start degrades routing | Phase 3: self-learning routing | `config.ts` has `minSamplesBeforeAdjustment` constant; unit test verifies fallback below threshold |
| Remotion bundle bloat | Phase 4: template library | Bundle size measured before and after; RackNerd render verified after deployment |
| Per-clip cost attribution broken | Phase 1: fal.ai activation | `api_expenses` shows `service: 'fal'` for fal-routed clips within first production job |
| Prompt index nobody queries | Phase 3: prompt indexing | SQL view joining approval events to prompt_config versions exists and returns non-null rows |

---

## Sources

- **This codebase history:** `findings.md` 2026-02-17 (Veo deprecation decision, Kling-only mandate), 2026-02-28 (Kling 422 multi_shots burn)
- **Code inspection:** `router.ts` (provider hardcoding pattern), `fal-adapter.ts` (auth header format, jobId encoding), `model-selector.ts` (Observatory cache TTL), `prompt-store.ts` (5-min cache), `expense-tracker.ts` (hardcoded service strings), `remotion-renderer.ts` (singleton bundle pattern)
- **fal.ai docs:** [Webhooks API](https://fal.ai/docs/model-apis/model-endpoints/webhooks) — 15s timeout, 10 retries over 2h, idempotency requirement, billing on failure undocumented
- **fal.ai pricing:** [fal.ai/pricing](https://fal.ai/pricing) — per-second billing for video, per-MP for images
- **Remotion GitHub:** [Memory leak issue #479](https://github.com/remotion-dev/remotion/issues/479) — angle renderer memory leak fixed in v2.6.6; v4.0 `<OffthreadVideo>` cache defaults to half system memory
- **Cold start research:** Milvus AI reference on data sparsity; ResearchGate hybrid feedback systems — minimum sample thresholds prevent early degradation

---

*Pitfalls research for: Intelligent Content Engine (v1.1) — multi-model routing, fal.ai activation, quality feedback loops*
*Researched: 2026-03-14*
