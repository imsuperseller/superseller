# 3-Scene Test Verification Matrix

**Purpose:** Before running the 3-scene smoke test, verify each success criterion maps to implementation and passes validation. Run 1-clip first, then 2-clip, then 3-clip.

---

## Success Criteria → Code Mapping

| Criterion | Where It's Implemented | What Can Go Wrong | Validation |
|-----------|------------------------|-------------------|------------|
| **Realtor starts at pathway, walking toward front door** | `nano-banana-prompts.ts` NANO_BANANA_OPENING_PROMPT; `prompt-generator.ts` REALTOR_SYSTEM_PROMPT clip 1; `gemini.ts` pickBestApproachPhotoForOpening | Nano prompt said "at door" not "on pathway walking toward door"; Gemini picks pool/backyard | Dry-run: opening prompt contains "pathway/walkway" + "walking toward"; vision rejects pool |
| **Realtor not talking** | `kie.ts` SILENT_NEGATIVE; `prompt-generator.ts` REALTOR_NEGATIVE; klingPrompt suffix "Lips closed, no speaking"; NANO_BANANA_* "lips closed, silent" | Kling ignores negative prompt; Nano places realtor with open mouth | Manual: watch output for mouth movement |
| **No visible transitions** | `video-pipeline.worker.ts` extractLastFrame → next clip start; `ffmpeg.ts` stitchClipsConcat (no xfade) | Kling output doesn't match last_frame; extractLastFrame not used for clip 2+ | 2-clip test: frame at cut 1→2 should be identical |
| **Always same realtor** | `nano-banana-prompts.ts` IDENTITY_ANCHOR; same avatar_url for all Nano composites; no Kling Elements (removed) | Nano drift across rooms; Kling Elements caused collage | 1-clip: single realtor; 3-clip: same face throughout |
| **2+ scenes look like one shot** | extractLastFrame for clip 2+ start; Kling first+last frame for clip 1; concat demuxer | Mismatch at cuts; Kling interpolates differently from last_frame | 2-clip then 3-clip; visual inspection of cuts |

---

## Failure vs Success Analysis

### Past Failures (Conversation History)

| Failure | Cause | Fix Applied |
|---------|-------|-------------|
| Collage opening | Kling Elements combines multiple images | Removed kling_elements from kie.ts |
| Visible transitions | Kling alters first frame; concat had frame mismatch | stitchClipsConcat with boundaryFramePaths: insert extracted last-frame as 1-frame segment at each cut |
| Pool visible in opening | Wrong photo selected; pool property used additional photos | heroResult.hasPool → force index 0 (exterior); stronger Gemini reject prompt |
| Pool/backyard as "front door" | Room photo mapping used index, not room type | getPhotoForRoom(): Front Door→usePhotos[0] (avoids same exterior as opening), Pool→last photo |
| Invented realtor in smoke | Test user had avatar | FORCE_NO_REALTOR=1 for no-realtor smoke tests |
| Realtor at pool first | pickBestApproachPhotoForOpening didn't reject pool | Gemini vision: REJECT pool, backyard, interior |
| Realtor speaking | No negative prompt | SILENT_NEGATIVE + "lips closed" in prompts |
| Different realtors | Identity drift across clips | Nano Banana for all frames; IDENTITY_ANCHOR |
| Opening "at door" not "on pathway" | NANO_BANANA_OPENING_PROMPT said "at front door" | Update to "on pathway/walkway, walking toward front door" |

### Single Success Instances

- **No transitions:** When extractLastFrame was used for next clip start (actual frame continuity)
- **No collage:** When Kling Elements was not used

---

## Validation Order (Mandatory)

1. **Preflight (zero cost):** `JOB_ID=xxx npx tsx tools/run-preflight.ts --free`
2. **Dry-run:** `npx tsx tools/dry-run-pipeline.ts JOB_ID` — validates prompts, tour, opening photo
3. **1-clip (cheapest):** MAX_CLIPS=1 → opening only. Verify: single shot, pathway to door, no collage, no talking
4. **2-clip (continuity):** MAX_CLIPS=2 → verify cut between clips 1 and 2 is invisible
5. **3-clip (full):** MAX_CLIPS=3 → full smoke

---

## Dry-Run Checks (What to Add)

- [ ] Tour starts with Exterior Front → Front Door
- [ ] Opening photo index is from front-of-house (not pool/interior)
- [ ] Clip 1 prompt mentions "pathway"/"walkway"/"approach" and "walking toward"
- [ ] All prompts include "lips closed" / "silent" / "no speaking"
- [ ] REALTOR_NEGATIVE includes "talking, speaking, lips moving"

---

## Debugging Stuck Jobs

When a job stays in `generating_clips`:
1. Query `SELECT clip_number, status, external_task_id FROM clips WHERE video_job_id = $1` — `external_task_id` is the Kie task ID for the current clip.
2. Poll Kie: `GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=<taskId>` — see if task is processing/completed/failed.
3. Kie Kling typically takes 5–15 min per clip. Timeout is 15 min per clip.

## Technical References

- `PIPELINE_SPEC.md` — Frame-chain: clip N end = clip N+1 start
- `PIPELINE_RESEARCH_OUTPUT.md` — Kie Kling params, first+last frame
- `AGENT_SELF_AUDIT.md` — R2 URLs, Kie-only, no FAL
