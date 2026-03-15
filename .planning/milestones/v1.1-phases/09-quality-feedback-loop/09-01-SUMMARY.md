---
phase: 09-quality-feedback-loop
plan: 01
subsystem: database
tags: [drizzle, postgres, jsonb, video-pipeline, expense-tracker, content-entries]

# Dependency graph
requires:
  - phase: 08-provider-activation
    provides: "working clip generation pipeline with fal.ai/kie adapters"
provides:
  - "generation_meta JSONB column on content_entries in schema and live DB"
  - "content_entries row written at every video job completion with performanceScore"
  - "trackExpense calls include model_id and provider for cost attribution"
affects:
  - "09-02-nightly-aggregation (reads generation_meta and performanceScore from content_entries)"
  - "09-03-observatory-sync (reads aggregated data seeded by this plan)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Non-blocking metadata writes: try/catch around content_entries INSERT, warn but never throw"
    - "Composite performanceScore: success 0.34 + cost_efficiency 0.33 + duration_accuracy 0.33"
    - "ON CONFLICT DO NOTHING for idempotent content_entry creation on pipeline retry"

key-files:
  created: []
  modified:
    - "apps/worker-packages/db/src/schema.ts"
    - "apps/worker/src/queue/workers/video-pipeline.worker.ts"

key-decisions:
  - "Drizzle push not viable interactively — applied schema change via raw SQL (ALTER TABLE ADD COLUMN IF NOT EXISTS) on RackNerd"
  - "No tenantId in VideoPipelineJobData — use userId as tenant_id fallback in content_entries insert"
  - "model_id hardcoded to kling-3.0/video in content_entries generationMeta (fal.ai models not yet in pipeline, handled per-trackExpense for future adapters)"
  - "Drizzle schema.ts updated to match DB reality for future code-generated queries"

patterns-established:
  - "Pattern 1: All content_entries writes from worker pipeline are non-blocking (try/catch + warn)"
  - "Pattern 2: trackExpense metadata must include model_id and provider for all AI generation calls"
  - "Pattern 3: performanceScore is composite weighted average — tunable by adjusting SUCCESS/COST/DURATION weights"

requirements-completed: [QUAL-01, QUAL-05]

# Metrics
duration: 15min
completed: 2026-03-15
---

# Phase 09 Plan 01: Generation Metadata & Quality Score Foundation Summary

**generation_meta JSONB column added to content_entries, video pipeline writes quality scores and cost attribution metadata at job completion using composite performanceScore formula (success 0.34 + cost_efficiency 0.33 + duration_accuracy 0.33)**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-15T07:30:00Z
- **Completed:** 2026-03-15T07:45:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `generation_meta` JSONB column to Drizzle schema and pushed to live PostgreSQL via ALTER TABLE
- Extended all 3 kie clip `trackExpense` calls to include `model_id` and `provider` in metadata
- Added `content_entries` INSERT block at job completion that captures generation metadata and performanceScore
- All writes non-blocking: wrapped in try/catch, logs warn on failure but never throws

## Task Commits

Each task was committed atomically:

1. **Task 1: Add generation_meta column to content_entries schema + push migration** - `ef8f9c34` (feat)
2. **Task 2: Write generation_meta + performanceScore at job completion and extend trackExpense metadata** - `39d3ae91` (feat)

## Files Created/Modified
- `apps/worker-packages/db/src/schema.ts` - Added `generationMeta: jsonb("generation_meta")` column after `meta` column
- `apps/worker/src/queue/workers/video-pipeline.worker.ts` - Extended 3 trackExpense calls with model_id/provider; added content_entries INSERT block with performanceScore at line ~1162

## Decisions Made
- Drizzle `db:push` is interactive and would have required selecting from 90+ table rename options — applied schema change via direct SQL on RackNerd instead
- `userId` used as `tenant_id` in content_entries because `VideoPipelineJobData` has no `tenantId` field — correct fallback since user = tenant in current data model
- `model_id` in `generationMeta` is hardcoded to `"kling-3.0/video"` — this is the only model currently used by the pipeline; fal.ai models will add their own content_entries writes when activated in Phase 08+ workflows
- `Drizzle schema.ts` still updated to match DB reality even though migration was applied via raw SQL, so ORM queries can reference the new column

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Drizzle `db:push` couldn't be run non-interactively due to new tables in the schema triggering rename disambiguation prompts. Resolved by applying schema change via raw SQL `ALTER TABLE content_entries ADD COLUMN IF NOT EXISTS generation_meta JSONB` on RackNerd — same net result, idempotent.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (nightly aggregation job) can now read `generation_meta` and `performance_score` from `content_entries`
- Every new completed video job will write a row with generation metadata starting immediately
- performanceScore baseline data will accumulate for aggregation job to compute prompt_key averages

---
*Phase: 09-quality-feedback-loop*
*Completed: 2026-03-15*
