# TourReel Property Video Pipeline — Canonical Spec

**Purpose**: Single source of truth for the property tour video pipeline. Use this for implementation decisions; treat Blueprint, Implementation Spec, and Playbook as reference-only.

**Last Updated**: February 2026

---

## 1. Architecture (Current Reality)

### Video Generation
- **Primary**: Kie.ai Kling 3.0 (`kling-3.0/video`) — `createKlingTask` in `kie.ts`
- **No FAL.** No `fal.ts`, no `FAL_KEY`, no `@fal-ai/client`.
- **No Veo fallback** for clips. Kling 3 only.

### Realtor Placement
- **Nano Banana Pro** (Kie.ai) — `createNanoBananaTask` in `nano-banana.ts`
- Places realtor into room photos: avatar + scene image → composite
- Image order: `[avatar, scene]` for all room composites
- **Frame-chain**: Clip 1 = Nano Banana opening. Clips 2+ = previous clip's last frame (extractLastFrame → Kling input). One continuous walk—no visible cuts. Realtor silent: lips closed, no speaking.

### Music
- **Kie Suno** — `createSunoTask` in `kie.ts`

### Frame Images for Kie
- **MUST** be full public URLs. Kie.ai cannot fetch relative paths.
- Set `R2_PUBLIC_URL` (e.g. `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev`).

---

## 2. Pipeline Flow (As Implemented)

```
1. Job starts → Update status "analyzing"
2. Load listing from PostgreSQL
3. Floorplan analysis (if exists) or default sequence from hero features
4. Cap rooms to maxClipsPerVideo (MAX_CLIPS env, default 15; use 3 for smoke)
5. Generate prompts (realtor-centric when avatar available)
6. Opening shot: pickBestApproachPhotoForOpening() → Nano Banana (approach walk, realtor close, ground-level)
7. Room clips: Nano Banana Pro per room → Kling 3 → FFmpeg normalize
8. FFmpeg concat (no xfade — hard cuts, one-shot feel; `stitchClipsConcat`)
9. Music overlay (Suno)
10. Text overlays (stub)
11. Upload to R2 → Update job complete
12. Cleanup work dir (rmSync) — no residue
```

### Testing (Before Full Smoke)

| Script | Purpose | Kie credits |
|--------|---------|-------------|
| `tools/run-preflight.ts --free [JOB_ID]` | Infra + FFmpeg + dry-run (no API) | None |
| `tools/dry-run-pipeline.ts [JOB_ID]` | Validate hero, tour, prompts, opening photo | `--free` = none; else Gemini |
| `tools/recover-video-from-clips.ts` | Re-stitch existing clips (no new Kie calls) | None |
| `tools/run-smoke.ts` | Full pipeline (Nano Banana + Kling) | Full |

### Key Files
- `src/queue/workers/video-pipeline.worker.ts` — main pipeline
- `src/services/kie.ts` — Kling, Suno
- `src/services/nano-banana.ts` — realtor composites
- `src/services/nano-banana-prompts.ts` — opening + room prompts
- `src/services/prompt-generator.ts` — clip prompts
- `src/services/gemini.ts` — `pickBestApproachPhotoForOpening()`
- `src/services/hero-features.ts` — pool, kitchen, fireplace, view, master suite

---

## 3. Realtor POV & Opening (Feb 2026)

- **Camera = prospective buyer** — The realtor is showing the property TO this person. Personalization is the goal; show the realtor's face.
- **Opening**: Realtor at door welcoming the guest who just arrived. Realtor FACES the camera (the guest), warm "Come on in" energy, then they walk through together.
- **Throughout**: Realtor walks WITH the guest—side by side or slightly leading but turning frequently to engage, gesture, point out features. Natural as if the person just arrived and the realtor is welcoming them.
- **Never**: Aerial, drone, wide shot from above. Ground-level, eye height, personal.
- Uses `pickBestApproachPhotoForOpening()` for best exterior composition

---

## 4. Hero Features

Every property gets top-3 hero focus derived from description/amenities:
- Pool, kitchen island, fireplace, view, master suite
- Injected into prompts for emphasis

---

## 5. Config & Environment

| Variable | Purpose |
|----------|---------|
| `KIE_API_KEY` | Required. Kie.ai API access |
| `R2_PUBLIC_URL` | Required for Kie to fetch images. Use r2.dev URL |
| `R2_BUCKET_NAME` | e.g. `zillow-to-video-finals` |
| `MAX_CLIPS` | Default 15 (full tour). Set to 3 only for quick smoke tests |
| `OUTPUT_RESOLUTION` | `4k` → 3840×2160, `1080p` (default) → 1920×1080 |
| `DATABASE_URL` | PostgreSQL |
| `REDIS_URL` | BullMQ job queue |

See `src/config.ts` for full config.

---

## 6. What to Avoid

- **FAL** — Not in use. Do not add.
- **Veo for clips** — Not in use.
- **xfade** — Deprecated. Use concat demuxer.
- **Relative R2 URLs** — Must be full public URLs for Kie.

---

## 7. Related Docs

- `AGENT_SELF_AUDIT.md` — Past mistakes, R2 config, conflict rules
- `PIPELINE_RESEARCH_OUTPUT.md` — API-level findings (Kling params, Nano Banana order)
- `legacy_archive/claude ref/` — Blueprint, Implementation Spec, Playbook (reference only)

---

*Update this file when the pipeline changes.*
