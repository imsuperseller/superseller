---
phase: hair-approach-demo-package
plan: 02
title: Generate 2-3 Kling 3.0 subtle motion clips from best photos
wave: 1
depends_on: []
files_modified:
  - apps/worker/src/scripts/hair-approach-motion.ts
autonomous: true
must_haves:
  - 2-3 Kling motion clips uploaded to R2 at hair-approach/motion/*.mp4
  - Each clip is 5 seconds, std mode, 16:9 aspect ratio
  - Motion is SUBTLE — hair movement, light shifts, soft focus pulls — NOT dramatic camera movement
  - Total Kling cost tracked and under $0.10 (3 clips x $0.03)
  - Clips are JPG/PNG input only (no WebP — Kling rejects WebP with 422)
---

<tasks>
<task id="1">
<title>Create Kling motion clip generation script</title>
<instructions>
Create `apps/worker/src/scripts/hair-approach-motion.ts` — a standalone script that:

1. Select the 3 best photos for motion (these have the most visual impact for subtle hair/light animation):
   - `gallery_blonde-highlights.jpg` — highlights catch light beautifully
   - `gallery_blonde-transformation.jpg` — dramatic result, hair flow
   - `gallery_platinum-result.jpg` — platinum tones shimmer

   Use the ORIGINAL R2 URLs (not upscaled). Rationale: Kling generates video from the image composition, not pixel quality — originals are already public on R2 and JPG format (Kling rejects WebP). CONTEXT says "upscale first" but that applies to DISPLAY assets, not Kling input:
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_blonde-highlights.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_blonde-transformation.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_platinum-result.jpg`

2. For each photo, call `createKlingTask()` from `apps/worker/src/services/kie.ts`:
   ```typescript
   import { createKlingTask, waitForTask } from '../services/kie';

   const taskId = await createKlingTask({
     prompt: "Subtle gentle movement. Hair strands sway slightly in a soft breeze. Warm salon lighting shifts softly. Shallow depth of field with gentle bokeh. No camera movement. No dramatic changes. Elegant and serene.",
     image_url: photoUrl,
     // NOTE: createKlingTask() auto-applies KLING_PROPERTY_NEGATIVE internally.
     // Custom negative_prompt is silently ignored by the function.
     // The default blocks people/text/watermarks which is fine for hair-only photos.
     mode: "std",  // std = $0.03, pro = $0.10
     duration: 5,  // MUST be number 5, not "5" — the createKlingTask function handles conversion
     aspect_ratio: "16:9",
   });
   ```

   CRITICAL: Duration must be `5` (number). The `createKlingTask` function in kie.ts converts it to the string `"5"` that Kie.ai requires.

3. Poll each task with `waitForTask(taskId, "kling")` — timeout 15 min, poll every 10s.

4. Download each completed video to `/tmp/hair-approach-motion/`.

5. Upload to R2 at keys:
   - `hair-approach/motion/blonde-highlights-motion.mp4`
   - `hair-approach/motion/blonde-transformation-motion.mp4`
   - `hair-approach/motion/platinum-result-motion.mp4`

6. Log costs:
   ```
   [COST] Kling 3.0 Std (5s): $0.03 | blonde-highlights
   [COST] Kling 3.0 Std (5s): $0.03 | blonde-transformation
   [COST] Kling 3.0 Std (5s): $0.03 | platinum-result
   [COST] Total Kling: $0.09
   ```

7. Run clips SEQUENTIALLY (sentinel pattern — first clip alone to verify credits, then remaining).

PRE-DEPLOY TRACE:
- Data flow: R2 photo URL (JPG) → Kling 3.0 API (std mode, 5s, 16:9) → poll → download MP4 → upload R2
- External API input: JPG image URL (public R2), prompt string, duration "5", mode "std"
- Failure modes: 422 if WebP (our photos are JPG — safe), 402 if credits exhausted, timeout if Kie overloaded
</instructions>
<verify>
- Script runs: `cd apps/worker && npx tsx src/scripts/hair-approach-motion.ts`
- 3 MP4 files uploaded to R2 and accessible via curl
- Each video is ~5s duration: `ffprobe -v quiet -print_format json -show_format <file>` → format.duration ~5.0
- Videos show SUBTLE motion (hair sway, light shift) — not dramatic camera moves
- Total cost under $0.10
</verify>
<commit_message>feat: add Hair Approach Kling 3.0 motion clip generation script</commit_message>
</task>

<task id="2">
<title>Run motion clip generation on RackNerd</title>
<instructions>
1. Deploy script:
   ```bash
   rsync -avz apps/worker/src/scripts/hair-approach-motion.ts root@172.245.56.50:/opt/tourreel-worker/apps/worker/src/scripts/
   ```

2. Run on RackNerd (where Kie.ai API key is configured):
   ```bash
   ssh root@172.245.56.50
   cd /opt/tourreel-worker/apps/worker
   mkdir -p /tmp/hair-approach-motion
   npx tsx src/scripts/hair-approach-motion.ts
   ```

3. Wait for all 3 clips to complete (expect 5-10 min total for std mode).

4. Verify output URLs and download one clip to check quality.
</instructions>
<verify>
- 3 motion clips accessible on R2 at hair-approach/motion/*.mp4
- Each clip plays correctly and shows subtle hair/light motion
- Cost log shows $0.09 total
</verify>
<commit_message>chore: generate Hair Approach motion clips — 3 Kling 3.0 std clips</commit_message>
</task>
</tasks>
