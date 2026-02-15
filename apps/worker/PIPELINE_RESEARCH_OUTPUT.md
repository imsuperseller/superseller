# Pipeline Phase Research Output

**Date:** Feb 12, 2026  
**Plan:** pipeline_phase_research_plan_ba183408  
**Purpose:** Actionable findings from online research tied to specific code paths.

**Current pipeline (Feb 2026):** Kling 3.0 only. Veo retired. Nano Banana → composite; Kling → interpolate. See TOURREEL_REALTOR_HANDOFF_SPEC §0. Kie refs: kie.ai/kling-3-0, kie.ai/nano-banana-pro.

---

## 1. Kie.ai API–Level Details

### 1.1 Kling 3.0 Image/Video Parameters

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Kie.ai Kling 3.0](https://kie.ai/kling-3-0), [docs.kie.ai](https://docs.kie.ai) | `image_urls`: JPG/PNG max 10MB; aspect 1:1, 9:16, 16:16, 16:9; `mode`: std/pro; prompt up to 2500 chars | Ensure `kie.ts` uses `mode: "pro"` for Kling (already done). Validate image URLs are JPG/PNG and within size. | High |
| Kie.ai docs | Supports first+last frame for continuity | Add `last_frame`/equivalent param in Kling calls when we have end-frame from previous clip | Medium |
| Kie.ai docs | "Internal Error" common with bad image format or oversized inputs | Add image validation (dimensions, size) before Kling API call; retry with fallback resolution if needed | Medium |

### 1.2 Veo 3.1 Parameters — **DEPRECATED (Veo retired Feb 2026)**

> Do not implement. Kling 3.0 only per TOURREEL_REALTOR_HANDOFF_SPEC §0.

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Kie.ai Veo 3.1](https://docs.kie.ai/veo3-api) | `imageUrls` array (1–2 images); `generationType`: `FIRST_AND_LAST_FRAMES_2_VIDEO` for image-to-video | Our `kie.ts` already uses `imageUrls`. Add `FIRST_AND_LAST_FRAMES_2_VIDEO` when we have both start and end frames | High |
| Kie.ai docs | `veo3` (quality) vs `veo3_fast` | Use `veo3` for quality; document `veo3_fast` as optional speed fallback | High |

### 1.3 Nano Banana Pro

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Kie.ai Nano Banana Pro](https://kie.ai/nano-banana-pro) ([docs.kie.ai](https://docs.kie.ai) for API params) | `image_input`: array; JPEG/PNG/WEBP max 30MB; up to 8 images; `resolution`: 1K/2K/4K; no explicit identity-preservation params | Use `resolution: "4K"` (already done). Image order in `image_input` may affect composition—document order: [avatar, scene] and keep consistent | Medium |

---

## 2. Kling / Veo Prompt and Frame Patterns

### 2.1 Kling 3.0 Prompt Structure

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [BasedLabs Kling 3 Guide](https://www.basedlabs.ai/articles/kling-3-prompts-guide) | Kling 3 understands cinematic intent; structure: scene → characters → action → camera → audio/style | In `prompt-generator.ts`, use "Shot N: ..." for multi-shot; include camera angle + subject movement | High |
| BasedLabs | "Pro tip: 4–6 shots for 10–15 second video. Describe both subject movement and camera behavior together." | Keep prompts concise; always describe camera + motion explicitly | High |
| BasedLabs | Image-to-video: "Treat your input image as an anchor. Focus prompt on how the scene evolves from the image." | In clip prompts, describe motion from the frame, not restating frame content | Medium |
| Playbook / internal | 80–150 words optimal for Kling | Add prompt-length validation; truncate if >200 words | Medium |

### 2.2 First-and-Last Frame (Continuity)

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| Kie.ai docs, practitioner posts | Using both start and end frames gives smoother clip-to-clip transitions | In `video-pipeline.worker.ts`, pass last frame of clip N as Kling end-frame for clip N+1 (implemented: frame chaining) | High |
| Internal `blueprint.md` | Frame-chain continuity: end of clip N → start of clip N+1 | Implemented: start+end frames per clip; Nano composites chain to next clip | Medium |

### 2.3 Negative Prompts

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| Config | `negative_prompt` column exists in DB | Ensure `prompt-generator.ts` or Kie calls include negative prompt: "blurry, distorted, artifacts, bad motion" or similar | Low |
| Practitioner posts | Negative prompts help avoid artifacts | Add configurable `negative_prompt` in `config.ts`; pass to Kling if supported | Low |

### 2.4 Video Model (Kling Only)

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| TOURREEL_REALTOR_HANDOFF_SPEC | Kling 3.0 only; Veo retired (quality/plastic issues) | Kling 3.0 for all clips. No Veo fallback. | High |

---

## 3. Real Estate Video Pipeline Patterns

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Zillow 3D Home Guide](https://www.zillow.com/z/3d-home/guide/) | Start from outside front door or street view; progress through doorways; capture each room with panoramas | Validate `getDefaultSequence` and floorplan analyzer order: Exterior → Foyer → Kitchen → Bedrooms → Pool | High |
| Matterport / Zillow 3D | Exterior-first, then interior by logical flow | Ensure default sequences in `floorplan-analyzer.ts` follow exterior → interior; pool/backyard as finale | High |
| PIPELINE_RESEARCH_AUDIT | Pool as "big reveal" finale; 12–16 clips for houses | Use `house_4bed_3bath_pool`-style variants when pool detected; extend default sequences | High |
| Industry | 3–5 min length, 12+ scenes | Target 12+ clips for houses; consider 5–6s per clip to reach ~1 min+ | Medium |

---

## 4. Zillow / Apify Scrape Data

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Apify maxcopell/zillow-detail-scraper](https://apify.com/maxcopell/zillow-detail-scraper) | Returns `description`, `resoFacts` (incl. `hasPrivatePool`, amenities, `atAGlanceFacts`), `responsivePhotos`, `homeInsights` | Our `apify.ts` already maps these. Ensure `routes.ts` from-zillow persists `description`, `amenities`, `resoFacts` to listings table | High |
| Apify output example | `responsivePhotos` / `photos` array; typically exterior first, then interior by room | Use photo order as-is; validate first photo is exterior for tour sequencing | Medium |
| PIPELINE_RESEARCH_AUDIT | We don't save description/amenities/resoFacts | Migration `003_add_listing_description_amenities.sql` exists; wire from-zillow to save these | High |

---

## 5. Character Consistency (Realtor Across Rooms)

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [Kling Elements](https://www.theaivideocreator.ai/p/kling-elements-upgrade) | Kling Elements: 1–4 reference images for character consistency across scenes | **N/A for our pipeline**—we use Nano Banana for realtor-in-scene images, not Kling for character refs | N/A |
| [Kling image generator strength](https://ageofllms.com/ai-howto-prompts/ai-fun/kling-image-consistent-character) | Strength 70–100 for precise facial consistency | Nano Banana has no strength param; focus on input quality | N/A |
| Nano Banana Pro | `image_input` order: [avatar, scene] or [scene, avatar] may affect composition | In `nano-banana.ts`, document and standardize order: avatar first, then scene, for all room composites | Medium |
| Internal `IDENTITY_ANCHOR` | We prepend identity anchor to prompts | Keep `IDENTITY_ANCHOR` in `nano-banana-prompts.ts`; ensure same avatar URL used for every room | High |
| Avatar URL | Clerk CDN URLs can be "media unavailable" | Use `ensurePublicUrl` to fetch avatar, upload to R2, pass R2 URL to Nano Banana | High |

---

## 6. FFmpeg / Stitch and Post-Processing

| Source | Finding | Suggested Change | Confidence |
|--------|---------|------------------|------------|
| [FFmpeg concat vs xfade](https://video.stackexchange.com/questions/29257/how-to-merge-videos-with-ffmpeg-with-smooth-transitions) | Concat demuxer: fast, no transitions, requires matching codecs. xfade: smooth transitions but re-encode | **Already correct**: We use `stitchClipsConcat` (concat demuxer). Per blueprint, use concat when we have frame continuity—no xfade needed | High |
| `ffmpeg.ts` | `stitchClipsConcat` uses concat demuxer; `normalizeClip` ensures consistent resolution/fps | No change needed. If artifacts appear, consider `scale=...:force_original_aspect_ratio=decrease,pad=...` in normalize | Low |
| Legacy blueprint | "Remove xfade. Use concat demuxer for zero-loss." | Done. `stitchClips` (xfade) is deprecated | High |

---

## Summary of High-Priority Code Changes

1. **prompt-generator.ts**: Add "Shot N:" structure for Kling; describe camera + motion explicitly. (Last-frame: implemented in pipeline; Kling uses image_urls start+end.)
2. **kie.ts**: Kling uses image_urls with start+end frames. Validate image inputs (format, size). Veo code exists for legacy reference but is not used in pipeline.
3. **video-pipeline.worker.ts**: Frame chaining implemented—clip N end = clip N+1 start (Nano composites).
4. **floorplan-analyzer.ts**: Ensure `getDefaultSequence` follows exterior → interior; add pool variants.
5. **apify.ts** / **routes.ts**: Persist `description`, `amenities`, `resoFacts` (already mapped; ensure DB + routes store them).
6. **nano-banana.ts**: Standardize `image_input` order [avatar, scene]; use R2-hosted avatar URL.
7. **FFmpeg**: No change—concat demuxer is correct for frame-continuous clips.
