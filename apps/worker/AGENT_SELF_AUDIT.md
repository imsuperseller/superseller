# Agent Self-Audit: What to Follow, What Was Wrong, What Blocks Progress

**Date**: February 11, 2026  
**Purpose**: Honest assessment for any agent (or human) working on TourReel / property video pipeline.

---

## 1. WHAT IS LATEST (Source of Truth)

| Topic | Reality | Outdated References |
|-------|---------|--------------------|
| **Video generation** | **Kie.ai Kling 3.0** only. No FAL. No Veo. | Fixed Feb 2026. Blueprint, playbook, implementation specs, ui wireframe updated. |
| **Realtor placement** | **Nano Banana Pro** (Kie.ai) — places realtor into room photos | Specs mention it but blueprint diagram doesn't |
| **Pipeline** | Nano Banana Pro → scene images → Kling 3.0 → FFmpeg concat → Suno → text overlay stub → R2 | Opening: approach walk. Hero features: every property (pool, kitchen, fireplace, view, master suite). |
| **Config** | `config.ts` has `KIE_API_KEY`, `defaultModel: "kling_3"`, **no FAL_KEY** | Implementation specs show `FAL_KEY`, `fal.ts` |
| **Codebase** | `apps/worker/src/services/kie.ts` — `createKlingTask` with model `kling-3.0/video` | No `fal.ts` exists in src/ |

**Canonical order when starting**:  
1. **`apps/worker/PIPELINE_SPEC.md`** — **Single source of truth** for pipeline architecture and flow.  
2. **NotebookLM Zillow-to-Video** — [0baf5f36-7ff0-4550-a878-923dbf59de5c](https://notebooklm.google.com/notebook/0baf5f36-7ff0-4550-a878-923dbf59de5c) — Production instructions. Query via `notebooklm_notebook_query` for high-level alignment.  
3. `brain.md` (Mission Control)  
4. `CLAUDE.md` (technical context)  
5. `.cursor/AGENT_CONTEXT.md` (priorities)  
6. `apps/worker/legacy_archive/PROJECT_SOURCE_OF_TRUTH.md` (retrospective; PIPELINE_SPEC supersedes)  
7. `apps/worker/AGENT_SELF_AUDIT.md` (this file — past mistakes, R2 config)

**Conflict rule:** When NotebookLM (Zillow-to-Video) and local `claude ref/` disagree, NotebookLM wins.

---

## 2. WHAT I DID WRONG (Past Mistakes)

1. **Kept FAL as primary** in fallback logic — you specified Kie.ai Kling 3 as primary. FAL should never have been used.
2. **Used Kie Veo as fallback** — when something failed, I fell back to Veo instead of Kling 3.
3. **Partial doc updates** — First pass only changed summaries; left FAL/Veo in deep sections. Full purge done Feb 2026.
4. **Too many fix–run cycles** — iterated on failures instead of aligning architecture first, then fixing bugs.
5. **R2 relative URLs** — when `R2_PUBLIC_URL` is empty, `uploadToR2` returns `/${r2Key}`. Kie.ai cannot fetch that; it needs a full public URL. This causes "media file unavailable" errors.

---

## 3. WHAT I USED THAT I SHOULDN'T HAVE

- **FAL** — Not in use. Do not add `fal.ts`, `FAL_KEY`, or `@fal-ai/client`. Video gen is Kie Kling 3 only.
- **Legacy implementation specs** — Treat as historical. Do not copy fal.ai config, fal webhooks, or fal-based pipeline logic into new code.
- **`best_for` music logic** — Removed; `music_tracks` uses `is_active` only.

---

## 4. WHAT I SHOULD DO BUT AM STILL NOT

1. ~~**Update blueprint + implementation specs**~~ — **Consolidated**: See `PIPELINE_SPEC.md`. Legacy docs archived in `legacy_archive/claude ref/`.
2. **Fix R2 URL handling** — Ensure `R2_PUBLIC_URL` is set in production and that `uploadToR2` always returns a full public URL when images are passed to Kie (so Kie can fetch them).
3. **Query NotebookLM before changes** — Production instructions (rewired plan, Nano Banana Pro, Kling 3, pipeline specs) are in NotebookLM. Run `notebooklm-mcp-auth` if auth expired, then `notebooklm_notebook_query` to validate architecture.
4. **Document Kie Kling 3 API quirks** — e.g. `sound` param behavior, `image_urls` format, so future failures don’t require re-discovery.

---

## 5. WHAT KEEPS ME FROM PROGRESSING CORRECTLY

1. **Implementation specs deep sections** — Sections 8A (fal), 8B (Veo) still contain legacy code. Top notice says IGNORE. Consider removing or archiving those sections.
2. **R2 public URL** — When unset, Kie gets relative paths and returns "media file unavailable." Must be set in production.
3. **Unclear rewiring specs** — If "rewiring" or "pipeline overhaul" exists, it isn’t linked from the main references.
4. **Kie Kling 3 API uncertainty** — `sound`, `image_urls` vs `image_url`, and other params may need validation against Kie docs.

---

## 6. WHAT I AM NOT UPDATED ABOUT

- **zillow-to-video** — The conversation mentioned `zillow-to-video/`; it does not exist in the repo. TourReel lives in `apps/worker`. Possibly same project, different path.
- **Exact Kie Kling 3 API** — Latest Kie docs for `kling-3.0/video`: required params, `sound` values, supported image formats.
- **Your preferred fallback** — If Kie Kling 3 fails, should we use Veo, retry Kling, or fail hard?

---

## 7. WHAT NEEDS ATTENTION

| Priority | Item | Action |
|----------|------|--------|
| P0 | Update blueprint + implementation specs | Replace FAL references with Kie Kling 3 only |
| P0 | R2 public URLs | ✅ RESOLVED. Use `R2_PUBLIC_URL=https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev` (see §8). |
| P1 | Nano Banana Pro verification | Confirm it’s wired correctly per `kie-api-nano-banana-pro.md` |
| P1 | Kie Kling 3 API docs | Document required/optional params in `services/kie.ts` or a small reference |
| P2 | Rewiring / pipeline overhaul | Locate and integrate into canonical docs |

---

## 8. R2 CONFIG (Resolved Feb 2026)

**Bucket**: `zillow-to-video-finals`  
**Working public URL**: `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev`

Set in `apps/worker/.env`:
```
R2_PUBLIC_URL=https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev
R2_BUCKET_NAME=zillow-to-video-finals
R2_ACCOUNT_ID=46a5b8a6516f86865992dbdfdb3cd77b
R2_ENDPOINT=https://46a5b8a6516f86865992dbdfdb3cd77b.r2.cloudflarestorage.com
```

Public access was enabled via Cloudflare API (PUT bucket managed domain). `videos.rensto.com` was never configured — use the r2.dev URL or add a custom domain in R2 settings.

---

## 9. QUESTIONS I STILL HAVE FOR YOU

1. **Rewiring / pipeline overhaul** — Is there a doc or spec for this? Where is it?
2. **Fallback behavior** — If Kie Kling 3 fails for a clip, should we retry, fall back to Veo, or fail the job?
3. **zillow-to-video** — Same as TourReel / `apps/worker`, or a different project?

---

## 10. CORRECT ARCHITECTURE (Copy This)

```
Video clip generation:
  PRIMARY: Kie.ai Kling 3.0 (kling-3.0/video) — createKlingTask in kie.ts
  NO FAL. NO fal.ts. NO FAL_KEY.

Realtor placement:
  Nano Banana Pro (Kie.ai) — createNanoBananaTask in nano-banana.ts

Music:
  Kie Suno — createSunoTask in kie.ts

Frame images for Kie:
  MUST be full public URLs. R2_PUBLIC_URL must be set.
  If R2_PUBLIC_URL is empty, uploadToR2 returns "/key" which Kie cannot fetch.
```

---

*Update this file when architecture or priorities change.*
