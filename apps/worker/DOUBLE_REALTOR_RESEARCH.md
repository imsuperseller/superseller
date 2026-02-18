# Double Realtor Bug — Research & Fix

**Symptom**: In the first scene, two identical realtors appear—one static, one (or both) stick before the scene ends. Same character duplicated.

## Root Cause Hypothesis

1. **Nano Banana** produces a composite: realtor (from avatar) + room/exterior photo → single image with realtor already placed.
2. **Kling** receives this image as `image_url` (start frame) plus a prompt like: *"The person from the reference photo walks toward the front door..."*
3. **Kling behavior**: Image-to-video models often treat the prompt as describing what to **generate**, not just what to **animate**. Describing "the person walking" can lead Kling to generate a new person performing that motion, instead of only animating the person already in the frame.
4. **Result**: Static realtor (from Nano composite) + generated realtor = double realtor.

## Research Findings

- **Kie.ai Kling 3.0**: Supports image-to-video with `image_urls`. Prompt describes the scene; the model can add or animate content.
- **Fal.ai Kling Motion Control**: When the person is already in the image, the prompt should focus on **environment and style**, not the action—otherwise the model may invent motion by adding elements.
- **Kling "Subject Reference"**: Can lock onto protagonists in the frame; duplication may occur when the prompt also describes a person, causing the model to render an additional figure.

## Fix Strategy

### 1. Prompt Rewrite (realtor mode)

**Current**: `"${clip.prompt} Seamless motion from start to end frame. IDENTICAL person from reference image—same face, hair, skin. Do NOT generate a different person. Lips closed, no speaking, silent walkthrough."`

**Problem**: The base `clip.prompt` heavily describes "the person from the reference photo" doing actions. That can trigger Kling to generate a second person.

**New approach**: Emphasize that the person is **already in the frame** and we only want animation:
- "The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only."
- Reduce person description; focus on camera movement and environment.

### 2. Negative Prompt Addition

Add to realtor clips:
- `duplicate person, two people, double figure, two identical figures, ghost figure, extra person, clone, second copy`

### 3. Clip 1 (Opening) Special Case

Opening often shows the worst duplication. Use a shorter, environment-focused prompt:
- "Smooth forward dolly. Person in frame walks naturally toward the door. Ground level. Single figure. No additional people."

## Implemented Fix (Feb 2026)

1. **kie.ts**: Added `DUPLICATE_FIGURE_NEGATIVE` and `realtor_in_frame` param. When `realtor_in_frame: true`, negative prompt includes "duplicate person, two people, double figure, two identical figures, ghost figure, extra person, clone, second copy".
2. **video-pipeline.worker.ts**: Kling prompt for realtor mode now starts with "The person is ALREADY in the frame. Animate their natural movement only. Do NOT add any new people or figures. Single person only."
3. **Fix v2 (Feb 2026)**: `clip.prompt` was STILL included—it describes realtor actions and triggers Kling to add a second figure. **Removed clip.prompt entirely** when realtor in frame. New `buildRealtorOnlyKlingPrompt(clip)` in kie.ts uses minimal camera+room-only text: "Smooth dolly... [toRoom] in view. Single person only." No person action description. Used in video-pipeline.worker and regen-clips.

## Balance (Feb 2026)

**Do not over-minimize.** The fix removed clip.prompt to prevent double figure—correct. But a subsequent change added "Person moves FORWARD through the space" to reduce circular motion; that caused worse behavior: robotic straight-line walking, zero listing focus. Rule: focus on camera + room + production; never describe person actions; never add motion directives that produce robotic output. See VIDEO_QUALITY_AUDIT.md.

---

## References

- `apps/worker/src/services/kie.ts` — `createKlingTask`, `IDENTITY_NEGATIVE`, `DUPLICATE_FIGURE_NEGATIVE`
- `apps/worker/src/queue/workers/video-pipeline.worker.ts` — Kling prompt construction
- `apps/worker/src/services/prompt-generator.ts` — Base clip prompts
- Kie.ai Kling 3.0: https://kie.ai/kling-3-0
- Fal Kling Motion Control: https://fal.ai/learn/devs/kling-video-2-6-motion-control-prompt-guide
