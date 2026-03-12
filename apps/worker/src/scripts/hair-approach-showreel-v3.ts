/**
 * Hair Approach — Showreel V3: All 6 motion clips + TransitionSeries + film effects
 *
 * What's new in V3:
 * - Generate Kling 3.0 motion clips for ALL 6 photos (3 missing: waves, brunette, color-change)
 * - Cinematic camera prompts (slow push-in, gentle orbit, hair reveal)
 * - Composition upgraded: TransitionSeries (slide/wipe/fade), FilmGrain, Vignette, warm color grading
 * - Duration: 30s (up from 24s)
 *
 * Cost: ~$0.09 (3 × Kling std $0.03) + $0.00 renders = $0.09
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-showreel-v3.ts
 */
import { createKlingTask, waitForTask } from '../services/kie';
import { renderComposition } from '../services/remotion-renderer';
import { uploadToR2 } from '../services/r2';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = '/tmp/hair-approach-showreel-v3';
const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";

// ─── Photos (all 6) ──────────────────────────────────────────────
const PHOTOS = [
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg`, label: "Sun-Kissed Highlights" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_client-waves.jpg`, label: "Beach Waves" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg`, label: "Rich Brunette" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg`, label: "Blonde Transformation" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_color-change.jpg`, label: "Color Change" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg`, label: "Platinum" },
];

// ─── Existing motion clips (already on R2) ───────────────────────
const EXISTING_CLIPS = [
    { url: `${R2}/hair-approach/motion/blonde-highlights-motion.mp4`, label: "Highlights Motion", r2Key: "hair-approach/motion/blonde-highlights-motion.mp4" },
    { url: `${R2}/hair-approach/motion/blonde-transformation-motion.mp4`, label: "Transformation Motion", r2Key: "hair-approach/motion/blonde-transformation-motion.mp4" },
    { url: `${R2}/hair-approach/motion/platinum-result-motion.mp4`, label: "Platinum Motion", r2Key: "hair-approach/motion/platinum-result-motion.mp4" },
];

// ─── Missing clips to generate ───────────────────────────────────
const CLIPS_TO_GENERATE = [
    {
        photoUrl: PHOTOS[1].url, // client-waves
        r2Key: "hair-approach/motion/client-waves-motion.mp4",
        label: "Beach Waves Motion",
        prompt: "Cinematic slow push-in revealing beautiful beach wave hairstyle. Camera gently moves forward, the hair catches warm salon lighting with natural movement. Soft bokeh background. Luxury salon atmosphere. Professional hair photography in motion. No people visible except the hair.",
    },
    {
        photoUrl: PHOTOS[2].url, // brunette-result
        r2Key: "hair-approach/motion/brunette-result-motion.mp4",
        label: "Brunette Result Motion",
        prompt: "Gentle orbit around rich brunette hair color. Camera slowly arcs to the right revealing depth, dimension, and shine in the brunette tones. Warm golden lighting catches highlights. Salon environment with soft background blur. Professional hairstyling showcase. No face, focus on the hair.",
    },
    {
        photoUrl: PHOTOS[4].url, // color-change
        r2Key: "hair-approach/motion/color-change-motion.mp4",
        label: "Color Change Motion",
        prompt: "Slow dolly forward revealing stunning hair color transformation. Camera glides smoothly revealing the color gradient and dimension. Warm, flattering salon lighting. The hair has natural subtle movement. Professional before/after hair coloring showcase. Luxury feel.",
    },
];

const HAIR_NEGATIVE = "cartoon, anime, CGI, low quality, blurry, distorted, morphing, ugly, deformed, extra limbs, extra fingers, bad anatomy, watermark, text, logo";

async function generateMissingClips(): Promise<Array<{ url: string; label: string; r2Key: string }>> {
    console.log(`\nGenerating ${CLIPS_TO_GENERATE.length} missing motion clips via Kling 3.0...\n`);

    const results: Array<{ url: string; label: string; r2Key: string }> = [];

    // Generate all 3 in parallel
    const tasks = await Promise.all(
        CLIPS_TO_GENERATE.map(async (clip) => {
            console.log(`  Creating task: ${clip.label}`);
            const taskId = await createKlingTask({
                prompt: clip.prompt,
                image_url: clip.photoUrl,
                negative_prompt: HAIR_NEGATIVE,
                mode: "std",
                duration: 5,
                aspect_ratio: "16:9",
                model: "kling-3.0/video",
            });
            console.log(`  Task ID: ${taskId} — ${clip.label}`);
            return { taskId, clip };
        })
    );

    // Wait for all to complete
    for (const { taskId, clip } of tasks) {
        console.log(`  Waiting for ${clip.label}...`);
        const result = await waitForTask(taskId, "kling");
        const videoUrl = result?.result?.video_url;
        if (!videoUrl) {
            throw new Error(`Kling task ${taskId} completed but no video_url: ${JSON.stringify(result)}`);
        }
        console.log(`  ✓ ${clip.label}: ${videoUrl}`);

        // Download and upload to R2 for stable URL
        const fetch = (await import('node-fetch')).default;
        const resp = await fetch(videoUrl);
        const buffer = Buffer.from(await resp.arrayBuffer());
        const localPath = path.join(OUTPUT_DIR, path.basename(clip.r2Key));
        fs.writeFileSync(localPath, buffer);
        const r2Url = await uploadToR2(localPath, clip.r2Key, 'video/mp4');
        console.log(`  ✓ Uploaded to R2: ${r2Url}`);

        results.push({ url: r2Url, label: clip.label, r2Key: clip.r2Key });
    }

    return results;
}

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('=== Hair Approach Showreel V3 ===');
    console.log('Upgrades: All 6 motion clips, TransitionSeries, film grain, vignette, color grading\n');

    // Step 1: Generate the 3 missing motion clips
    const newClips = await generateMissingClips();

    // Step 2: Build the full 6-clip motion array (ordered to match photos)
    const ALL_CLIPS = [
        { url: EXISTING_CLIPS[0].url, label: "Highlights Motion" },       // 0: blonde-highlights
        { url: newClips[0].url, label: newClips[0].label },               // 1: client-waves
        { url: newClips[1].url, label: newClips[1].label },               // 2: brunette-result
        { url: EXISTING_CLIPS[1].url, label: "Transformation Motion" },   // 3: blonde-transformation
        { url: newClips[2].url, label: newClips[2].label },               // 4: color-change
        { url: EXISTING_CLIPS[2].url, label: "Platinum Motion" },         // 5: platinum-result
    ];

    console.log(`\nAll 6 motion clips ready:`);
    ALL_CLIPS.forEach((c, i) => console.log(`  ${i}: ${c.label}`));

    // Reuse existing music from V2
    const musicR2Url = `${R2}/hair-approach/showreel/music.mp3`;

    const INPUT_PROPS = {
        photos: PHOTOS,
        motionClips: ALL_CLIPS,
        audioUrl: musicR2Url,
        businessName: "Hair Approach",
        tagline: "Dallas Premium Hair Salon",
        accentColor: "#C9A96E",
        bgColor: "#1a1a1a",
        ctaText: "Book Your Transformation",
    };

    // Step 3: Render 16:9
    const output16x9 = path.join(OUTPUT_DIR, 'master-16x9.mp4');
    console.log('\nRendering HairShowreel-16x9 (V3 — transitions + effects)...');
    const result16x9 = await renderComposition({
        compositionId: 'HairShowreel-16x9',
        inputProps: INPUT_PROPS,
        outputPath: output16x9,
        crf: 18,
        onProgress: (p: number) => {
            if (Math.round(p * 100) % 10 === 0) {
                process.stdout.write(`  Progress: ${Math.round(p * 100)}%\r`);
            }
        },
    });
    console.log(`  Done: ${result16x9.durationSeconds.toFixed(1)}s, render: ${result16x9.renderTimeSeconds.toFixed(1)}s`);

    // Upload 16:9
    const url16x9 = await uploadToR2(output16x9, 'hair-approach/showreel/master-16x9.mp4', 'video/mp4');
    console.log(`  Uploaded: ${url16x9}`);

    // Step 4: Render 9:16
    const output9x16 = path.join(OUTPUT_DIR, 'master-9x16.mp4');
    console.log('\nRendering HairShowreel-9x16 (V3)...');
    const result9x16 = await renderComposition({
        compositionId: 'HairShowreel-9x16',
        inputProps: INPUT_PROPS,
        outputPath: output9x16,
        crf: 18,
        onProgress: (p: number) => {
            if (Math.round(p * 100) % 10 === 0) {
                process.stdout.write(`  Progress: ${Math.round(p * 100)}%\r`);
            }
        },
    });
    console.log(`  Done: ${result9x16.durationSeconds.toFixed(1)}s, render: ${result9x16.renderTimeSeconds.toFixed(1)}s`);

    // Upload 9:16
    const url9x16 = await uploadToR2(output9x16, 'hair-approach/showreel/master-9x16.mp4', 'video/mp4');
    console.log(`  Uploaded: ${url9x16}`);

    console.log('\n=== V3 Results ===');
    console.log(`  Music: ${musicR2Url}`);
    console.log(`  16:9:  ${url16x9}`);
    console.log(`  9:16:  ${url9x16}`);
    console.log('\n[COST] Kling 3.0 std × 3: $0.09 | Renders: $0.00 | Total: $0.09');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
