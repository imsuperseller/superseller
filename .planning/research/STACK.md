# Stack Research

**Domain:** Intelligent Content Engine — Multi-model AI video production with quality feedback loops
**Researched:** 2026-03-14
**Confidence:** HIGH (API endpoints and model IDs verified against official fal.ai and kie.ai docs)

---

## Context: What Already Exists (DO NOT Rebuild)

The worker already has these working — research only covers net-new additions:

| Existing | Location | Status |
|----------|----------|--------|
| `FalAdapter` (queue REST, native fetch) | `apps/worker/src/services/model-router/provider-adapters/fal-adapter.ts` | DORMANT — code written, never activated |
| `KieAdapter` + `kie.ts` | `apps/worker/src/services/kie.ts` | ACTIVE — Kling 3.0 production |
| `routeShot()` model router | `apps/worker/src/services/model-router/router.ts` | ACTIVE — Observatory + budget enforcement |
| `SHOT_DEFAULT_MODELS` | `apps/worker/src/services/model-router/shot-types.ts` | ACTIVE — model IDs need correction (see below) |
| BullMQ 7-queue orchestration | `apps/worker/src/` | ACTIVE |
| Remotion 4.0.429, 8 compositions | `apps/worker/` | ACTIVE |
| `trackExpense()`, `api_expenses` table | `apps/worker-packages/db` | ACTIVE |
| `content_entries` with `performanceScore`, `engagementRate` | `apps/worker-packages/db/src/schema.ts` | ACTIVE — columns exist, no writer yet |
| pgvector 0.8.1 HNSW, Ollama nomic-embed-text 768-dim | RackNerd | ACTIVE — used for RAG |

---

## Critical Model ID Corrections

The current `SHOT_DEFAULT_MODELS` has stale fal.ai model IDs. These must be updated before activation:

| Shot Type | Current (Wrong) | Correct (Verified) | Why |
|-----------|----------------|-------------------|-----|
| `environment` | `fal-ai/sora` | `fal-ai/sora-2/image-to-video/pro` | Sora 2 is current; `fal-ai/sora` is v1 |
| `social` | `fal-ai/wan-i2v` | `wan/v2.6/image-to-video` | `fal-ai/wan-i2v` = Wan 2.1; v2.6 is current and has Flash tier |
| `dialogue` | `veo-3.1` (kie) | Separate endpoint: `POST /api/v1/veo/generate` with `model: "veo3"` | Veo 3.1 is NOT via `/api/v1/jobs/createTask` — it has its own route |

**Source:** fal.ai model pages (verified), docs.kie.ai/veo3-api (verified)

---

## Recommended Stack Additions

### fal.ai Provider — Activate Existing Adapter

The `FalAdapter` is written correctly (native fetch, queue REST pattern). No new library needed for basic Sora 2 and Wan 2.6 activation. The adapter already handles the `queue.fal.run/{modelId}` pattern.

**What changes:** Model IDs in `shot-types.ts` + input body shape in `fal-adapter.ts` `submitJob()`.

**Input body differences by model:**

| Model | fal ID | Key Input Fields |
|-------|--------|-----------------|
| Sora 2 I2V | `fal-ai/sora-2/image-to-video/pro` | `prompt`, `image_url`, `duration` (4/8/12/16/20s), `resolution` (720p/1080p), `character_ids` (optional) |
| Wan 2.6 I2V | `wan/v2.6/image-to-video` | `prompt`, `image_url`, `resolution` (720p/1080p), `duration` (5/10/15s), `audio_url` (optional), `negative_prompt`, `multi_shots` |
| Wan 2.6 Flash | `wan/v2.6/image-to-video/flash` | Same as above — $0.05/s vs $0.10/s |

**Output response differences:**

| Model | Output path |
|-------|------------|
| Sora 2 | `data.output.video.url` (VideoFile object) |
| Wan 2.6 | `data.output.video.url` (VideoFile object with resolution/fps/frame_count metadata) |

The existing `pollStatus()` in `fal-adapter.ts` handles both — it already checks `data.output.video?.url ?? data.output.video_url`. Wan 2.6 adds useful `actual_prompt` field worth logging.

### Sora 2 References API (Character Consistency)

This is a separate fal.ai endpoint, not part of the standard queue flow. It requires a two-step pattern:

1. **Create character:** `POST https://queue.fal.run/fal-ai/sora-2/characters` with `{ video_url, name }` → returns `{ id: "char_...", name }`
2. **Use in generation:** Pass `character_ids: ["char_..."]` in the Sora 2 I2V submission body

**Implementation:** Add `createSoraCharacter(videoUrl: string, name: string): Promise<string>` to `FalAdapter`. The character_id is stored on `CharacterBible` or in a new `character_references` column (JSONB). No new library needed — same auth headers, same fetch pattern.

### Veo 3.1 Re-integration (Kie.ai — New Endpoint)

Veo was deprecated in Feb 2026 because it was accessed via the wrong endpoint. Veo 3.1 uses a **dedicated route**, not `createTask`:

| Property | Value |
|----------|-------|
| Generate endpoint | `POST https://api.kie.ai/api/v1/veo/generate` |
| Poll endpoint | `GET https://api.kie.ai/api/v1/veo/record-info?taskId=` |
| Auth | `Bearer YOUR_API_KEY` (same key as Kling) |
| model param | `veo3` (quality, ~$2.00/8s) or `veo3_fast` ($0.40/8s) |
| generationType | `TEXT_2_VIDEO`, `FIRST_AND_LAST_FRAMES_2_VIDEO`, or `REFERENCE_2_VIDEO` |
| aspect_ratio | `16:9` (default), `9:16`, `Auto` |

**Implementation:** Add `createVeoTask()` and `pollVeoTask()` functions to `apps/worker/src/services/kie.ts`. The `KieAdapter` routes `dialogue` shot type to these new functions. The comment in `kie.ts` line 15 (`// Veo is DEPRECATED...`) gets replaced with the new implementation.

**Cost routing in shot-types.ts:** `dialogue` stays on `provider: 'kie'` but needs `useCase: 'veo3_talking_head'` to distinguish from Kling in Observatory.

### Quality Feedback Loop — Heuristic Scorer

No external library needed. The `content_entries.performanceScore` column already exists. What's missing is a writer.

**Approach:** FFmpeg-based heuristic scoring via `child_process.spawn` (already used in the worker for video assembly). No new npm package required.

**Three heuristics via FFmpeg (no reference video needed):**

| Metric | FFmpeg Command | What it signals |
|--------|---------------|-----------------|
| Blur score | `ffmpeg -vf blurdetect=high=0.1 -f null /dev/null` — parse `blur_ratio` | Motion blur, out-of-focus |
| Entropy (detail richness) | `ffprobe -show_frames` → calculate spatial entropy from `pkt_size` variance | Low entropy = flat/boring frame |
| Motion score | `ffmpeg -vf mpdecimate -f null /dev/null` — parse dropped frame count | Static/frozen output |

**Output:** Composite 0–1 score written to `content_entries.performanceScore`. This score feeds back to `ai_model_decisions` via a new `generationScore` column — enabling the router to prefer models that score higher for specific shot types over time.

**What NOT to use:** VMAF/SSIM require a reference video (the "original" to compare against). AI-generated content has no reference. Netflix VMAF is Python-only and requires a C library build. These are not applicable here.

### Prompt Effectiveness Tracking and Indexing

**Approach:** Extend the existing pgvector RAG infrastructure already on RackNerd (Ollama nomic-embed-text, 768-dim HNSW index) with a `prompt_library` table.

**New table:** `prompt_library`
```sql
id            uuid primary key
shotType      text  -- ShotType enum
promptText    text
embedding     vector(768)  -- nomic-embed-text via existing Ollama
avgScore      float8        -- rolling average of content_entries.performanceScore
useCount      int4
tenantId      uuid (nullable — some prompts are global templates)
createdAt     timestamptz
```

**No new npm package needed.** The worker already uses `pg` directly. The existing pgvector HNSW index handles similarity search. Query: cosine distance on `embedding` to find highest-scoring similar prompts before generating.

**pgvector-node** (`npm install pgvector`) is the only addition if you want typed vector serialization. Version 0.2.1 (current). Optional — raw SQL `$1::vector` also works with the existing `pg` client.

### Per-Clip Cost Attribution

**Approach:** `trackExpense()` already exists. What's missing is a `clipId` dimension.

**Implementation:** Pass `clipId` (new ULID) to `trackExpense()` calls. Add `clip_id` column to `api_expenses` table (nullable — job-level costs stay as-is). No new library. Schema migration only.

### Remotion Parametric Template Library

**Approach:** Remotion 4.0.429 already installed and supports fully parametric compositions via `defaultProps` + `calculateMetadata`. No new version needed.

**Pattern:** Each local business template is a `<Composition>` with a typed `BusinessVideoProps` interface:

```typescript
interface BusinessVideoProps {
  businessName: string;
  tagline: string;
  primaryColor: string;
  logoUrl?: string;
  clips: Array<{ videoUrl: string; durationSeconds: number; caption?: string }>;
  ctaText: string;
  ctaPhone?: string;
}
```

`calculateMetadata` derives `durationInFrames` from the clips array length. Templates are registered in a new `template-registry.ts` — no library, just a typed map of composition IDs to prop validators (using the existing `zod@^4.3.6`).

---

## Core Technologies (Net New Only)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@fal-ai/client` | 1.9.4 | Optional typed SDK for Sora 2 character creation | Provides TypeScript types for `CreateCharacterOutput` response. The existing `FalAdapter` native fetch works for queue calls; SDK is useful only for the `/characters` endpoint which isn't in queue format. Install only if typed response is worth the dependency. |
| `pgvector` | 0.2.1 | Typed vector serialization for prompt_library queries | Only needed if you want `toSql()` / `fromSql()` type helpers. Raw SQL `$1::vector` also works. Optional but clean. |

**Assessment: Both are optional.** The existing native fetch + raw pg client can handle all new functionality without adding dependencies. Add them only if TypeScript type coverage is a priority.

---

## Supporting Libraries (No New Install Required)

| Existing Library | New Use for v1.1 |
|-----------------|-----------------|
| `pg` (^8.18.0) | `prompt_library` table queries, pgvector cosine search |
| `zod` (^4.3.6) | `BusinessVideoProps` schema validation in template registry |
| `bullmq` (^5.67.3) | New `quality-scoring` queue for async score computation post-generation |
| `remotion` (^4.0.429) | Parametric template compositions, `calculateMetadata` for dynamic duration |
| `child_process` (Node built-in) | FFmpeg heuristic scoring — blur, entropy, motion detection |

---

## Installation

If adding optional typed packages:

```bash
# In apps/worker/
npm install pgvector@0.2.1
npm install @fal-ai/client@1.9.4
```

Everything else is a code change, not a dependency addition.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| FFmpeg heuristic scoring (no-reference) | Netflix VMAF | VMAF requires a reference video — impossible for AI-generated content. Also Python-only, C library build, not viable in Node.js worker. |
| pgvector + Ollama nomic-embed-text (existing) | Dedicated vector DB (Pinecone, Weaviate) | Already have pgvector HNSW on RackNerd. Adding another service for prompt indexing is overengineering. |
| Native fetch in FalAdapter | @fal-ai/client SDK | SDK adds 200KB dependency for a pattern already working with 40 lines of fetch. Use SDK only for the Characters endpoint if typed response is needed. |
| Veo 3.1 via kie.ai (existing key) | Veo 3.1 direct via Google Vertex AI | kie.ai is 25% of Google pricing ($0.40/8s vs ~$1.60). Same API key already in use. Google direct adds OAuth complexity for no gain. |
| Wan 2.6 Flash for `social` budget tier | Wan 2.6 Standard | Flash = $0.05/s vs $0.10/s — matches `budget` tier ceiling of $0.05/unit. Indistinguishable quality for short social clips. |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `fluent-ffmpeg` | 1.2MB dependency for a wrapper over `child_process.spawn`. Already use spawn directly in worker. | `child_process.spawn('ffmpeg', [...])` directly |
| `@fal-ai/serverless-client` | Deprecated — replaced by `@fal-ai/client` 1.0+ | `@fal-ai/client` (if SDK needed at all) |
| Any Python quality-assessment library | Not executable from Node.js worker without shell escape complexity | FFmpeg built-in filters (`blurdetect`, `mpdecimate`) |
| Separate prompt database / vector store | Duplicates existing pgvector infrastructure | Extend existing `pgvector` index with `prompt_library` table |
| `@anthropic-ai/sdk` in worker | Already decided against in v1.0 (see PROJECT.md decisions) — direct fetch works | `fetch()` to Claude API directly |

---

## Stack Patterns by Variant

**If budget tier is `budget` for `social` shots:**
- Use `wan/v2.6/image-to-video/flash` (not standard)
- $0.05/s fits within `BUDGET_CEILINGS.budget = 0.05`
- Add `flash` variant to `SHOT_DEFAULT_MODELS.social` with fallback to standard

**If `dialogue` shot needs audio (talking head with voice):**
- Veo 3.1 quality (`veo3`) generates synchronized audio natively
- Veo 3.1 fast (`veo3_fast`) does not guarantee audio sync — use for muted scenes only
- Route: `budgetTier === 'premium'` → `veo3`, anything else → `veo3_fast`

**If Sora 2 character consistency is needed across multiple shots:**
- Create character once, store `char_...` ID in `CharacterBible.characterReferenceId` (new column)
- Pass stored ID in all subsequent Sora 2 submissions for that tenant
- Sora 2 accepts up to 2 character IDs per generation

**If quality score feedback needs real-time routing adjustment:**
- Write score to `content_entries.performanceScore` immediately post-generation
- Update `ai_models.avgQualityScore` (new column on existing table) via aggregation query
- `routeShot()` reads `avgQualityScore` from Observatory — existing `getRecommendedModel()` can weight by this

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `remotion@4.0.429` | Node.js 20+ | Already installed — no change needed |
| `pgvector@0.2.1` | `pg@^8.x`, PostgreSQL 13+ with pgvector 0.8.1 | Compatible with existing DB setup |
| `@fal-ai/client@1.9.4` | Node.js 18+ (fetch built-in) | Compatible with worker runtime |
| `bullmq@^5.67.3` | `ioredis@^5.9.2` | Already installed — add `quality-scoring` queue same as existing pattern |
| `zod@^4.3.6` | TypeScript 5.x | Already installed — use for `BusinessVideoProps` schema |

---

## Environment Variables Required

| Variable | Already Exists | Notes |
|----------|---------------|-------|
| `FAL_API_KEY` | NO — FalAdapter reads it but it's never been set | Must be provisioned before fal.ai activation. Format: `key_...` from fal.ai dashboard |
| `KIE_API_KEY` | YES — already used for Kling | Same key works for Veo 3.1 — no new credential needed |
| `OLLAMA_BASE_URL` | YES — RAG already uses it | Reuse for prompt embedding |

---

## Sources

- [fal.ai Sora 2 I2V API](https://fal.ai/models/fal-ai/sora-2/image-to-video/pro/api) — model ID `fal-ai/sora-2/image-to-video/pro`, character_ids parameter, response schema (HIGH confidence — official docs)
- [fal.ai Sora 2 Characters endpoint](https://fal.ai/models/fal-ai/sora-2/characters) — `POST /characters`, `CreateCharacterOutput` (HIGH confidence — official docs)
- [fal.ai Wan 2.6 I2V API](https://fal.ai/models/wan/v2.6/image-to-video/api) — model ID `wan/v2.6/image-to-video`, input schema, Flash variant (HIGH confidence — official docs)
- [docs.kie.ai Veo 3.1 Generate](https://docs.kie.ai/veo3-api/generate-veo-3-video) — endpoint `POST /api/v1/veo/generate`, model params `veo3`/`veo3_fast` (HIGH confidence — official docs)
- [docs.kie.ai Veo 3.1 Quickstart](https://docs.kie.ai/veo3-api/quickstart) — poll endpoint `/api/v1/veo/record-info?taskId=` (HIGH confidence — official docs)
- [@fal-ai/client npm](https://www.npmjs.com/package/@fal-ai/client) — version 1.9.4 current (HIGH confidence — npm registry)
- [pgvector npm](https://www.npmjs.com/package/pgvector) — version 0.2.1 current (HIGH confidence — verified via `npm view`)
- [pgvector-node Drizzle integration](https://github.com/pgvector/pgvector-node) — Drizzle ORM compatibility confirmed (MEDIUM confidence — GitHub)
- [fal.ai Wan 2.1 legacy](https://fal.ai/models/fal-ai/wan-i2v/api) — confirms `fal-ai/wan-i2v` = Wan 2.1, not 2.6 (HIGH confidence — official docs)
- [kie.ai Veo 3.1 pricing](https://kie.ai/v3-api-pricing) — $0.40/8s (fast), $2.00/8s (quality) (MEDIUM confidence — pricing pages can change)

---

*Stack research for: v1.1 Intelligent Content Engine — SuperSeller AI video pipeline*
*Researched: 2026-03-14*
