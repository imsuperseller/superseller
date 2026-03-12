/**
 * Hair Approach — Generate 3 Kling 3.0 subtle motion clips from best photos
 * Cost: ~$0.09 (3 × $0.03 std mode)
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-motion.ts
 */
import { createKlingTask, waitForTask } from '../services/kie';
import { uploadToR2 } from '../services/r2';
import * as fs from 'fs';
import * as path from 'path';

const R2_BASE = 'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev';

const CLIPS = [
    {
        name: 'blonde-highlights',
        sourceUrl: `${R2_BASE}/hair-approach/portfolio/gallery_blonde-highlights.jpg`,
        r2Key: 'hair-approach/motion/blonde-highlights-motion.mp4',
    },
    {
        name: 'blonde-transformation',
        sourceUrl: `${R2_BASE}/hair-approach/portfolio/gallery_blonde-transformation.jpg`,
        r2Key: 'hair-approach/motion/blonde-transformation-motion.mp4',
    },
    {
        name: 'platinum-result',
        sourceUrl: `${R2_BASE}/hair-approach/portfolio/gallery_platinum-result.jpg`,
        r2Key: 'hair-approach/motion/platinum-result-motion.mp4',
    },
];

const PROMPT = 'Subtle gentle movement. Hair strands sway slightly in a soft breeze. Warm salon lighting shifts softly. Shallow depth of field with gentle bokeh. No camera movement. No dramatic changes. Elegant and serene.';

const OUTPUT_DIR = '/tmp/hair-approach-motion';

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('=== Hair Approach Kling Motion Clips ===');
    console.log(`Clips: ${CLIPS.length}`);
    console.log(`Model: Kling 3.0 Std, 5s, 16:9`);
    console.log(`Prompt: ${PROMPT.slice(0, 80)}...\n`);

    const results: { name: string; url: string }[] = [];

    // Run SEQUENTIALLY (sentinel pattern — first clip verifies credits)
    for (let i = 0; i < CLIPS.length; i++) {
        const clip = CLIPS[i];
        console.log(`\n[${i + 1}/${CLIPS.length}] Generating motion: ${clip.name}`);
        console.log(`  Source: ${clip.sourceUrl}`);

        try {
            // createKlingTask auto-applies KLING_PROPERTY_NEGATIVE internally
            // Custom negative_prompt is ignored — the function selects based on flags
            const taskId = await createKlingTask({
                prompt: PROMPT,
                image_url: clip.sourceUrl,
                mode: 'std',       // std = $0.03, pro = $0.10
                duration: 5,       // Must be number — function converts to string "5"
                aspect_ratio: '16:9',
            });

            console.log(`  Task created: ${taskId}`);
            console.log(`  Polling (timeout 15min, interval 10s)...`);

            const status = await waitForTask(taskId, 'kling', 15 * 60 * 1000, 10_000);

            if (!status.result?.video_url) {
                throw new Error('Kling completed but no video URL in result');
            }

            console.log(`  Video URL: ${status.result.video_url}`);

            // Download video
            const localPath = path.join(OUTPUT_DIR, `${clip.name}-motion.mp4`);
            const response = await fetch(status.result.video_url);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const buffer = Buffer.from(await response.arrayBuffer());
            fs.writeFileSync(localPath, buffer);
            console.log(`  Downloaded: ${localPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);

            // Upload to R2
            const publicUrl = await uploadToR2(localPath, clip.r2Key, 'video/mp4');
            console.log(`  Uploaded: ${publicUrl}`);
            console.log(`  [COST] Kling 3.0 Std (5s): $0.03 | ${clip.name}`);

            results.push({ name: clip.name, url: publicUrl });

            if (i === 0) {
                console.log(`  ✓ Sentinel clip succeeded — continuing with remaining clips`);
            }
        } catch (err: any) {
            console.error(`  FAILED: ${err.message}`);
            if (i === 0) {
                console.error('  ✗ Sentinel clip failed — aborting remaining clips');
                break;
            }
        }
    }

    console.log('\n=== Results ===');
    for (const r of results) {
        console.log(`  ${r.name}: ${r.url}`);
    }
    console.log(`\n[COST] Total Kling: $${(results.length * 0.03).toFixed(2)} (${results.length}/${CLIPS.length} succeeded)`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
