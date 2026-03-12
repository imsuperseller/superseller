/**
 * Hair Approach — Showreel V2: Motion clips + Suno music + Remotion render
 * Cost: ~$0.05 (Suno V5 music generation)
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-showreel-v2.ts
 */
import { renderComposition } from '../services/remotion-renderer';
import { uploadToR2 } from '../services/r2';
import { createSunoTask, waitForTask } from '../services/kie';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = '/tmp/hair-approach-showreel-v2';

const R2 = "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev";

const PHOTOS = [
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg`, label: "Sun-Kissed Highlights" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_client-waves.jpg`, label: "Beach Waves" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg`, label: "Rich Brunette" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg`, label: "Blonde Transformation" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_color-change.jpg`, label: "Color Change" },
    { url: `${R2}/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg`, label: "Platinum" },
];

const MOTION_CLIPS = [
    { url: `${R2}/hair-approach/motion/blonde-highlights-motion.mp4`, label: "Highlights Motion" },
    { url: `${R2}/hair-approach/motion/blonde-transformation-motion.mp4`, label: "Transformation Motion" },
    { url: `${R2}/hair-approach/motion/platinum-result-motion.mp4`, label: "Platinum Motion" },
];

async function generateMusic(): Promise<string> {
    console.log('Generating Suno V5 music...');
    const taskId = await createSunoTask({
        prompt: "Elegant luxury salon background music, warm piano and soft strings, sophisticated and calming, high-end beauty brand feel, no vocals, instrumental only",
        model: "V5",
        instrumental: true,
        style: "elegant ambient piano",
        title: "Hair Approach Showreel",
    });
    console.log(`  Suno task: ${taskId}`);

    const result = await waitForTask(taskId, "suno");
    const audioUrl = result?.result?.audio_url || result?.output?.audio_url;
    if (!audioUrl) {
        throw new Error(`Suno task completed but no audio_url in result: ${JSON.stringify(result)}`);
    }
    console.log(`  Music URL: ${audioUrl}`);
    return audioUrl;
}

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('=== Hair Approach Showreel V2 ===\n');

    // Step 1: Generate music
    const audioUrl = await generateMusic();

    // Step 2: Upload music to R2 for stable URL
    const fetch = (await import('node-fetch')).default;
    const musicResp = await fetch(audioUrl);
    const musicBuffer = Buffer.from(await musicResp.arrayBuffer());
    const musicLocalPath = path.join(OUTPUT_DIR, 'music.mp3');
    fs.writeFileSync(musicLocalPath, musicBuffer);
    const musicR2Url = await uploadToR2(musicLocalPath, 'hair-approach/showreel/music.mp3', 'audio/mpeg');
    console.log(`  Music on R2: ${musicR2Url}`);

    const INPUT_PROPS = {
        photos: PHOTOS,
        motionClips: MOTION_CLIPS,
        audioUrl: musicR2Url,
        businessName: "Hair Approach",
        tagline: "Dallas Premium Hair Salon",
        accentColor: "#C9A96E",
        bgColor: "#1a1a1a",
        ctaText: "Book Your Transformation",
    };

    // Step 3: Render 16:9
    const output16x9 = path.join(OUTPUT_DIR, 'master-16x9.mp4');
    console.log('\nRendering HairShowreel-16x9 (with motion clips + music)...');
    const result16x9 = await renderComposition({
        compositionId: 'HairShowreel-16x9',
        inputProps: INPUT_PROPS,
        outputPath: output16x9,
        crf: 18,
        onProgress: (p: number) => {
            if (Math.round(p * 100) % 20 === 0) {
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
    console.log('\nRendering HairShowreel-9x16 (with motion clips + music)...');
    const result9x16 = await renderComposition({
        compositionId: 'HairShowreel-9x16',
        inputProps: INPUT_PROPS,
        outputPath: output9x16,
        crf: 18,
        onProgress: (p: number) => {
            if (Math.round(p * 100) % 20 === 0) {
                process.stdout.write(`  Progress: ${Math.round(p * 100)}%\r`);
            }
        },
    });
    console.log(`  Done: ${result9x16.durationSeconds.toFixed(1)}s, render: ${result9x16.renderTimeSeconds.toFixed(1)}s`);

    // Upload 9:16
    const url9x16 = await uploadToR2(output9x16, 'hair-approach/showreel/master-9x16.mp4', 'video/mp4');
    console.log(`  Uploaded: ${url9x16}`);

    console.log('\n=== Results ===');
    console.log(`  Music: ${musicR2Url}`);
    console.log(`  16:9:  ${url16x9}`);
    console.log(`  9:16:  ${url9x16}`);
    console.log('\n[COST] Suno V5 music: ~$0.05 | Renders: $0.00');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
