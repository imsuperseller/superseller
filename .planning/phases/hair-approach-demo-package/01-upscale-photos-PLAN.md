---
phase: hair-approach-demo-package
plan: 01
title: Upscale 6 portfolio photos via Recraft Crisp
wave: 1
depends_on: []
files_modified:
  - apps/worker/src/scripts/hair-approach-upscale.ts
autonomous: true
must_haves:
  - All 6 upscaled images exist on R2 at hair-approach/portfolio/upscaled/*.jpg
  - Each upscaled image is 2K+ resolution (min 2048px on longest edge)
  - Total Recraft cost tracked via trackExpense() and logged
  - Total cost under $0.02 (6 images x $0.0025)
---

<tasks>
<task id="1">
<title>Create upscale script using Kie.ai generateImageKie with Recraft Crisp</title>
<instructions>
Create `apps/worker/src/scripts/hair-approach-upscale.ts` — a standalone script that:

1. Defines the 6 source photo URLs from R2:
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_blonde-highlights.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_client-waves.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_brunette-result.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_blonde-transformation.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_color-change.jpg`
   - `https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/gallery_platinum-result.jpg`

2. For each photo, call `generateImageKie()` from `apps/worker/src/services/kie.ts` with:
   ```typescript
   const result = await generateImageKie({
     prompt: "enhance, sharpen, upscale, high resolution professional hair salon photography",
     model: "recraft/crisp-upscale",  // Recraft Crisp upscaler
     image_urls: [sourceUrl],
     resolution: "2K",
   });
   ```
   Note: If `recraft/crisp-upscale` is not the exact model string, check Kie.ai docs. The `generateImageKie` function supports any model string. Alternative model strings to try: `"recraft-crisp"`, `"recraft/v3"` with image_urls for upscale mode.

3. Download each upscaled result URL to a temp file.

4. Upload to R2 at key `hair-approach/portfolio/upscaled/{original_filename}` using `uploadToR2()` from `apps/worker/src/services/r2.ts`.

5. After each successful upscale, call `trackExpense()`:
   ```typescript
   import { trackExpense } from '../services/expense-tracker';
   // If trackExpense import fails (standalone script), fall back to console:
   console.log(`[COST] Recraft Crisp upscale: $0.0025 | ${filename}`);
   ```

6. Log final cost summary table to stdout.

Run sequentially (not parallel) to avoid rate limits. Total expected cost: $0.015.
</instructions>
<verify>
- Script runs without errors: `cd apps/worker && npx tsx src/scripts/hair-approach-upscale.ts`
- All 6 upscaled URLs are printed and accessible via curl (HTTP 200)
- Verify at least one image dimensions: download and check with `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 <file>` — should be >= 2048 on longest edge
- R2 keys exist: `hair-approach/portfolio/upscaled/gallery_*.jpg`
</verify>
<commit_message>feat: add Hair Approach photo upscale script via Recraft Crisp</commit_message>
</task>

<task id="2">
<title>Run the upscale script on RackNerd worker</title>
<instructions>
1. Deploy the script to RackNerd:
   ```bash
   rsync -avz apps/worker/src/scripts/hair-approach-upscale.ts root@172.245.56.50:/opt/tourreel-worker/apps/worker/src/scripts/
   ```

2. SSH into RackNerd and run:
   ```bash
   ssh root@172.245.56.50
   cd /opt/tourreel-worker/apps/worker
   npx tsx src/scripts/hair-approach-upscale.ts
   ```

3. Capture the output — it should show 6 upscaled URLs and a cost summary.

4. Verify each URL returns HTTP 200:
   ```bash
   for url in $(cat /tmp/upscaled-urls.txt); do
     echo "$url: $(curl -s -o /dev/null -w '%{http_code}' $url)"
   done
   ```
</instructions>
<verify>
- All 6 upscaled images accessible on R2 public URL
- Cost summary shows total under $0.02
- At least one image verified as 2K+ resolution
</verify>
<commit_message>chore: run Hair Approach photo upscale — 6 images to 2K via Recraft Crisp</commit_message>
</task>
</tasks>
