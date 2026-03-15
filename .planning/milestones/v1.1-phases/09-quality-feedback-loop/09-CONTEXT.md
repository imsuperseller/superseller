# Phase 09: Quality Feedback Loop - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Per-clip generation metadata, nightly aggregation, and Observatory score updates that feed back into routing decisions. Every completed generation records metadata and a quality signal; a nightly job aggregates these signals and updates Observatory routing scores so the system self-improves over time.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

User delegated all gray areas to Claude. Decisions below reflect codebase analysis, prior context, and architectural consistency:

**Quality signal source (performanceScore):**
- `content_entries.performanceScore` column already exists in Drizzle schema but nothing writes to it
- For v1.1, populate with a composite score derived from: generation success (1.0 if completed, 0.0 if failed), cost efficiency (actual vs expected cost ratio), and duration accuracy (actual vs requested duration match)
- This is an automated signal — no admin rating or user engagement data required (ICP won't fill out rating forms per REQUIREMENTS.md out-of-scope)
- Score range: 0.0-1.0 where 1.0 = perfect generation at expected cost and duration
- Future: engagement data (views, shares, client approval) can supplement this in v1.2

**Generation metadata (generation_meta JSONB):**
- Add `generation_meta` JSONB column to `content_entries` table (Drizzle migration)
- Schema: `{ model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type, external_job_id, image_url_used }`
- Written at generation completion time in the video pipeline worker, alongside trackExpense()
- No Prisma schema change needed — content_entries is worker-only (Drizzle)

**Nightly aggregation job:**
- BullMQ repeatable job (not cron) — consistent with existing scheduler pattern in worker
- Schedule: daily at 03:00 UTC (off-peak, after any overnight generations)
- Query: `SELECT model_id, AVG(performance_score) as avg_score, COUNT(*) as sample_count FROM content_entries WHERE performance_score IS NOT NULL AND created_at > NOW() - INTERVAL '90 days' GROUP BY model_id`
- Only update `ai_model_recommendations.quality_score` when `sample_count >= 20` (hardcoded constant from STATE.md)
- Models with <20 samples keep their existing static seed scores
- Log aggregation results via logger for observability

**Per-clip cost attribution (api_expenses):**
- `trackExpense()` already runs on every generation — extend the call to include `model_id` and `provider` in metadata
- api_expenses table already has service/operation columns — use `service: provider` (e.g. 'fal', 'kie') and add model_id to the existing metadata JSONB if available
- No schema change needed — leverage existing trackExpense() infrastructure

**Admin prompt effectiveness endpoint:**
- `GET /api/admin/prompt-effectiveness` on the Next.js web app (admin routes pattern)
- Query content_entries grouped by prompt_key, prompt_version, shot_type
- Return: `{ rankings: [{ prompt_key, version, shot_type, avg_score, sample_count, avg_cost }] }`
- Sort by avg_score descending
- Filter by shot_type query param (optional)
- No time window filter for v1.1 — show all-time data (90-day window is in the aggregation query, not the admin endpoint)

**Router Observatory integration:**
- `routeShot()` already calls `getRecommendedModel()` which queries ai_model_recommendations
- Once nightly job writes real quality_score values, the router automatically picks them up via the existing 5-minute cache
- No router code change needed — the aggregation job writing to the DB is sufficient
- If all models for a shot type have <20 samples, static seed scores continue to work (graceful degradation)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `content_entries` table (Drizzle schema.ts:223): Has performanceScore column, indexes on tenant/type/status/perf
- `ai_model_recommendations` table (Prisma schema): Has quality_score Float? column
- `trackExpense()` (expense-tracker.ts): Non-blocking cost logging, already called on every generation
- `model-selector.ts`: `getRecommendedModel()` reads from Observatory with 5-min cache
- `scheduler.ts`: Existing repeatable job registration pattern (7 jobs already scheduled)
- `prompt-store.ts`: Has prompt_key tracking infrastructure
- `video-pipeline.worker.ts`: Where generation completion happens — integration point for metadata writing

### Established Patterns
- BullMQ repeatable jobs registered in scheduler.ts with `intervalMs`
- Admin API routes in `apps/web/superseller-site/src/app/api/admin/`
- Drizzle migrations in `apps/worker-packages/db/`
- Observatory query: ai_model_recommendations JOIN ai_models, cached 5 minutes

### Integration Points
- `video-pipeline.worker.ts`: Write generation_meta + performanceScore after clip completion
- `scheduler.ts`: Register nightly aggregation job
- `apps/web/superseller-site/src/app/api/admin/prompt-effectiveness/`: New admin endpoint
- `ai_model_recommendations` table: Target for aggregation job writes

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. User delegated all implementation decisions with high trust (consistent pattern from Phases 07-08).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-quality-feedback-loop*
*Context gathered: 2026-03-15*
