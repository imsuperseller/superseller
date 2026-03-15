# Phase 09: Quality Feedback Loop - Research

**Researched:** 2026-03-15
**Domain:** BullMQ repeatable jobs, Drizzle schema migration, per-clip metadata, Observatory score aggregation
**Confidence:** HIGH

## Summary

Phase 09 closes the Observatory feedback loop that has been manually seeded since v1.0. The implementation has four distinct concerns: (1) writing generation metadata to `content_entries` at clip completion, (2) logging per-clip cost attribution to `api_expenses`, (3) a nightly BullMQ aggregation job that updates `ai_model_recommendations.quality_score`, and (4) an admin API endpoint for prompt effectiveness rankings.

All architecture decisions were made during context gathering. The CONTEXT.md is highly specific — locked decisions cover every major choice. Research below confirms patterns, surfaces exact file locations, and flags integration risks the planner must handle. No design alternatives need to be explored.

**Primary recommendation:** Follow CONTEXT.md decisions verbatim. The only net-new work is a Drizzle migration (add `generation_meta` JSONB to `content_entries`), one new BullMQ job in `scheduler.ts`, writes in `video-pipeline.worker.ts`, and one Next.js admin route.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Quality signal source (performanceScore):**
- `content_entries.performanceScore` column already exists in Drizzle schema but nothing writes to it
- Composite score: success (1.0/0.0) + cost efficiency (actual vs expected ratio) + duration accuracy
- Score range 0.0–1.0. No admin rating or user engagement data required for v1.1.

**Generation metadata (generation_meta JSONB):**
- Add `generation_meta` JSONB column to `content_entries` (Drizzle migration required)
- Schema: `{ model_id, provider, prompt_key, prompt_version, generation_cost_usd, duration_sec, shot_type, external_job_id, image_url_used }`
- Written at generation completion in `video-pipeline.worker.ts`, alongside `trackExpense()`
- No Prisma schema change needed

**Nightly aggregation job:**
- BullMQ repeatable job (not cron), registered in `scheduler.ts`
- Schedule: daily at 03:00 UTC
- Only update `ai_model_recommendations.quality_score` when `sample_count >= 20`
- Models with <20 samples keep existing static seed scores
- 90-day rolling window in aggregation query

**Per-clip cost attribution (api_expenses):**
- Extend existing `trackExpense()` calls to include `model_id` and `provider`
- No schema change needed — use existing `service`/`operation` columns + metadata JSONB

**Admin prompt effectiveness endpoint:**
- `GET /api/admin/prompt-effectiveness` in Next.js admin routes
- Grouped by prompt_key, prompt_version, shot_type; sorted by avg_score desc
- Optional `?shot_type=` filter; no time-window filter in v1.1

**Router Observatory integration:**
- No router code change needed
- Once nightly job writes real quality_score values, `routeShot()` picks them up via existing 5-minute cache
- Graceful degradation: static seed scores remain if <20 samples for a shot type

### Claude's Discretion

All gray areas delegated to Claude. High-trust pattern consistent with Phases 07–08.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. v1.2 items (QUAL-07 score decay, QUAL-08 re-ranking) are explicitly deferred.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QUAL-01 | Every generated clip stores generation_meta JSONB on content_entries | Drizzle migration adds column; write happens in video-pipeline.worker.ts at completion |
| QUAL-02 | Nightly aggregation job computes avg quality_score per model from content_entries.performanceScore | BullMQ repeatable job registered in scheduler.ts with intervalMs = 24h |
| QUAL-03 | Aggregation job updates ai_model_recommendations.quality_score only when sample_count >= 20 | Hardcoded constant `minSamplesBeforeAdjustment = 20` in job logic |
| QUAL-04 | Admin can view prompt effectiveness rankings via API | New Next.js route GET /api/admin/prompt-effectiveness |
| QUAL-05 | Per-clip cost attribution logged to api_expenses with provider and model_id metadata | Extend existing trackExpense() call signature |
| QUAL-06 | Router uses Observatory quality_score (real feedback data) when selecting models | No router change — aggregation job writing to DB is sufficient; 5-min cache picks it up |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| BullMQ | Existing | Repeatable nightly job | Already used for 7 scheduled jobs in scheduler.ts |
| Drizzle ORM | Existing | Schema migration + DB writes | Worker DB layer — content_entries is Drizzle-only |
| Prisma | Existing | ai_model_recommendations writes | Web layer table; aggregation job must use Prisma client |

### Key Files (confirmed existing)
| File | Role in Phase 09 |
|------|-----------------|
| `apps/worker/src/services/scheduler.ts` | Register nightly aggregation job |
| `apps/worker/src/services/expense-tracker.ts` | Extend trackExpense() signature |
| `apps/worker-packages/db/src/schema.ts` | Add generation_meta column (Drizzle migration) |
| `apps/worker/src/video-pipeline.worker.ts` | Write generation_meta + performanceScore at completion |
| `apps/web/superseller-site/src/app/api/admin/` | New prompt-effectiveness route |
| `apps/web/superseller-site/prisma/schema.prisma` | ai_model_recommendations target table |

### Installation
No new packages required. All dependencies (BullMQ, Drizzle, Prisma, Next.js) are already installed.

---

## Architecture Patterns

### Existing BullMQ Repeatable Job Pattern (scheduler.ts)
```typescript
// Existing pattern — 7 jobs already registered this way
await queue.add('job-name', {}, {
  repeat: { every: intervalMs },
  jobId: 'job-name-singleton',
});
```
Nightly job uses `every: 24 * 60 * 60 * 1000` with a fixed UTC offset or cron string `'0 3 * * *'` for 03:00 UTC.

### Aggregation Query Pattern
```sql
SELECT model_id,
       AVG(performance_score) as avg_score,
       COUNT(*) as sample_count
FROM content_entries
WHERE performance_score IS NOT NULL
  AND created_at > NOW() - INTERVAL '90 days'
GROUP BY model_id
HAVING COUNT(*) >= 20
```
Only rows with `sample_count >= 20` trigger an UPDATE to `ai_model_recommendations`.

### performanceScore Composite Formula
```
score = (
  successWeight   * (status === 'completed' ? 1.0 : 0.0) +
  costWeight      * clamp(expectedCost / actualCost, 0, 1) +
  durationWeight  * clamp(requestedDuration / actualDuration, 0, 1)
) / (successWeight + costWeight + durationWeight)
```
Weights TBD by planner (suggest equal thirds: 0.33 each for v1.1).

### generation_meta JSONB Schema
```typescript
interface GenerationMeta {
  model_id: string;          // e.g. 'fal-ai/sora/image-to-video/pro'
  provider: string;          // 'fal' | 'kie'
  prompt_key: string;        // from prompt-store
  prompt_version: string;    // semver or hash
  generation_cost_usd: number;
  duration_sec: number;      // actual output duration
  shot_type: string;         // cinematic | drone | dialogue | etc.
  external_job_id?: string;  // fal requestId or kie jobId
  image_url_used?: string;   // input image for i2v
}
```

### Admin Route Pattern (Next.js)
```typescript
// apps/web/superseller-site/src/app/api/admin/prompt-effectiveness/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shotType = searchParams.get('shot_type'); // optional filter
  // Query content_entries grouped by generation_meta->>'prompt_key', etc.
  // Return { rankings: [...] }
}
```
Note: `generation_meta` is a JSONB column on a Drizzle-managed table but the admin endpoint runs on Next.js (Prisma). The endpoint must use **raw SQL** via `prisma.$queryRaw` since `content_entries` is not in the Prisma schema.

### Anti-Patterns to Avoid
- **Writing performanceScore before clip is confirmed complete:** Score must only be written when status transitions to `'completed'` — not at job submission or polling.
- **Updating Observatory for <20 sample models:** QUAL-03 explicitly requires the 20-sample gate. The HAVING clause in SQL or a post-query filter must enforce this.
- **Duplicate job registration:** BullMQ repeatable jobs with the same `jobId` are idempotent — safe to re-register on worker restart, but confirm scheduler.ts de-duplication pattern matches existing jobs.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Repeatable scheduling | Custom cron/setInterval | BullMQ `repeat: { every }` | Already pattern in scheduler.ts; survives worker restarts |
| Cost logging | New expense table | Extend `trackExpense()` | Existing non-blocking fire-and-forget; schema already has service/operation/metadata |
| DB migration | Manual SQL | Drizzle `npm run db:push` or migration file | Existing migration toolchain in worker-packages/db |

---

## Common Pitfalls

### Pitfall 1: Prisma vs Drizzle Boundary
**What goes wrong:** `content_entries` is a Drizzle-only table. The admin prompt-effectiveness endpoint runs in Next.js (Prisma). Direct Prisma model access won't work.
**How to avoid:** Use `prisma.$queryRaw` with tagged template literals for the admin endpoint query. Alternatively, expose the query via a worker API endpoint that Next.js calls.
**Warning signs:** TypeScript error "Property 'contentEntries' does not exist on typeof PrismaClient"

### Pitfall 2: BullMQ Repeatable Job Timing Drift
**What goes wrong:** Using `every: 86400000` starts relative to worker boot time, not at 03:00 UTC.
**How to avoid:** Use BullMQ cron string `repeat: { cron: '0 3 * * *' }` for wall-clock scheduling. Verify BullMQ version supports cron strings (it does in v5+).
**Warning signs:** Job runs at unpredictable times after worker restart.

### Pitfall 3: generation_meta Column Missing from Drizzle Push
**What goes wrong:** Adding the column to schema.ts without running the migration means production DB doesn't have the column — writes silently fail or throw.
**How to avoid:** Migration must be part of Wave 0 or the deploy script. Include `npm run db:push` in the deploy checklist.

### Pitfall 4: Double-Writing performanceScore
**What goes wrong:** video-pipeline.worker.ts may have multiple completion paths (success callback, webhook, poll result). Writing in all paths causes duplicate score calculations.
**How to avoid:** Gate the write with a check: only write if `performanceScore IS NULL` for that row (idempotent upsert pattern).

### Pitfall 5: JSONB Query in Raw SQL Injection Risk
**What goes wrong:** Interpolating `shot_type` filter from query params into raw SQL string.
**How to avoid:** Use `prisma.$queryRaw` with Prisma.sql tagged template literals — parameterized automatically.

---

## Code Examples

### Extending trackExpense() (QUAL-05)
```typescript
// Current signature (inferred from context)
trackExpense({ service, operation, amount, jobId });

// Extended signature
trackExpense({
  service: provider,          // 'fal' | 'kie'
  operation: model_id,        // 'fal-ai/sora/...'
  amount: generation_cost_usd,
  jobId,
  metadata: { model_id, provider, shot_type }
});
```

### Aggregation Job Registration (QUAL-02/03)
```typescript
// In scheduler.ts
await queue.add('nightly-quality-aggregation', {}, {
  repeat: { cron: '0 3 * * *' },
  jobId: 'nightly-quality-aggregation-singleton',
});
```

### Aggregation Job Worker Logic (QUAL-02/03)
```typescript
const MIN_SAMPLES = 20; // from STATE.md critical constraint

const rows = await db.execute(sql`
  SELECT model_id, AVG(performance_score) as avg_score, COUNT(*) as sample_count
  FROM content_entries
  WHERE performance_score IS NOT NULL
    AND created_at > NOW() - INTERVAL '90 days'
  GROUP BY model_id
  HAVING COUNT(*) >= ${MIN_SAMPLES}
`);

for (const row of rows) {
  await prisma.aiModelRecommendation.updateMany({
    where: { modelId: row.model_id },
    data: { qualityScore: row.avg_score },
  });
}
```

### Admin Endpoint Raw Query (QUAL-04)
```typescript
const rankings = await prisma.$queryRaw<RankingRow[]>(Prisma.sql`
  SELECT
    generation_meta->>'prompt_key' as prompt_key,
    generation_meta->>'prompt_version' as version,
    generation_meta->>'shot_type' as shot_type,
    AVG(performance_score) as avg_score,
    COUNT(*) as sample_count,
    AVG((generation_meta->>'generation_cost_usd')::float) as avg_cost
  FROM content_entries
  WHERE performance_score IS NOT NULL
    ${shotType ? Prisma.sql`AND generation_meta->>'shot_type' = ${shotType}` : Prisma.empty}
  GROUP BY 1, 2, 3
  ORDER BY avg_score DESC
`);
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest / Jest (check existing worker test setup) |
| Config file | See existing package.json scripts |
| Quick run command | `npm run test` from apps/worker |
| Full suite command | `npm run test` from repo root or per-package |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUAL-01 | generation_meta written at clip completion | unit | test video-pipeline completion handler | No — Wave 0 |
| QUAL-02 | Nightly job aggregates avg quality_score | unit | test aggregation job logic with mock DB | No — Wave 0 |
| QUAL-03 | No update when sample_count < 20 | unit | test aggregation job with <20 samples | No — Wave 0 |
| QUAL-04 | Admin endpoint returns ranked results | integration | `curl /api/admin/prompt-effectiveness` | No — Wave 0 |
| QUAL-05 | trackExpense called with model_id + provider | unit | spy on trackExpense in pipeline test | No — Wave 0 |
| QUAL-06 | Router reads real quality_score after aggregation | integration | seed DB + call routeShot() | No — Wave 0 |

### Sampling Rate
- **Per task commit:** Unit tests for changed module only
- **Per wave merge:** Full suite
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `apps/worker/src/jobs/__tests__/quality-aggregation.test.ts` — covers QUAL-02, QUAL-03
- [ ] `apps/worker/src/__tests__/video-pipeline-meta.test.ts` — covers QUAL-01, QUAL-05
- [ ] `apps/web/superseller-site/src/app/api/admin/prompt-effectiveness/__tests__/route.test.ts` — covers QUAL-04

---

## Open Questions

1. **Prisma vs raw SQL for admin endpoint**
   - What we know: content_entries is not in Prisma schema
   - What's unclear: Whether a shared DB client utility exists to avoid `prisma.$queryRaw` from Next.js
   - Recommendation: Use `prisma.$queryRaw` with Prisma.sql template — safe, parameterized, no new infrastructure

2. **BullMQ cron string vs intervalMs**
   - What we know: Existing scheduler.ts jobs use `intervalMs` pattern (7 jobs)
   - What's unclear: Exact BullMQ version installed — cron strings require v5+
   - Recommendation: Check BullMQ version in package.json; if <5, use `every: 86400000` with a startup-time offset workaround

3. **performanceScore write location in pipeline**
   - What we know: video-pipeline.worker.ts has multiple async paths (webhook + poll)
   - What's unclear: Whether there is a single "generation complete" handler or multiple
   - Recommendation: Planner must identify the canonical completion point and gate write with `WHERE performance_score IS NULL`

---

## Sources

### Primary (HIGH confidence)
- `09-CONTEXT.md` — all locked decisions, integration points, existing patterns
- `apps/worker-packages/db/src/schema.ts` lines 223–270 — confirmed `performanceScore` exists, `generation_meta` does NOT yet exist (migration needed), `meta` JSONB exists as extensible field
- `.planning/REQUIREMENTS.md` — QUAL-01 through QUAL-06 definitions
- `.planning/STATE.md` — `minSamplesBeforeAdjustment = 20` hardcoded constant confirmed

### Secondary (MEDIUM confidence)
- BullMQ repeatable job pattern inferred from CONTEXT.md reference to "7 existing scheduled jobs in scheduler.ts" — file path confirmed at `apps/worker/src/services/scheduler.ts`
- Prisma `$queryRaw` approach for cross-ORM query — standard Next.js pattern for raw SQL

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed, file paths confirmed
- Architecture: HIGH — CONTEXT.md decisions are specific and locked; existing patterns documented
- Pitfalls: HIGH — Prisma/Drizzle boundary is a known project pattern; others derived from CONTEXT.md decisions

**Research date:** 2026-03-15
**Valid until:** 2026-04-15 (stable stack, 30-day window)
