/**
 * Hair Approach — Render showreel video via Remotion
 * Cost: $0.00 (local compute only)
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-showreel.ts
 */
import { renderComposition } from '../services/remotion-renderer';
import { uploadToR2 } from '../services/r2';
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = '/tmp/hair-approach-showreel';

const PHOTOS = [
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-highlights.jpg", label: "Sun-Kissed Highlights" },
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_client-waves.jpg", label: "Beach Waves" },
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_brunette-result.jpg", label: "Rich Brunette" },
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_blonde-transformation.jpg", label: "Blonde Transformation" },
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_color-change.jpg", label: "Color Change" },
    { url: "https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/upscaled/gallery_platinum-result.jpg", label: "Platinum" },
];

const INPUT_PROPS = {
    photos: PHOTOS,
    businessName: "Hair Approach",
    tagline: "Dallas Premium Hair Salon",
    accentColor: "#C9A96E",
    bgColor: "#1a1a1a",
    ctaText: "Book Your Transformation",
};

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('=== Hair Approach Showreel Render ===\n');

    // Render 16:9
    const output16x9 = path.join(OUTPUT_DIR, 'master-16x9.mp4');
    console.log('Rendering HairShowreel-16x9...');
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
    console.log(`  Done: ${result16x9.outputPath} (${result16x9.durationSeconds.toFixed(1)}s, render: ${result16x9.renderTimeSeconds.toFixed(1)}s)`);

    // Upload 16:9
    const url16x9 = await uploadToR2(output16x9, 'hair-approach/showreel/master-16x9.mp4', 'video/mp4');
    console.log(`  Uploaded: ${url16x9}`);

    // Render 9:16
    const output9x16 = path.join(OUTPUT_DIR, 'master-9x16.mp4');
    console.log('\nRendering HairShowreel-9x16...');
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
    console.log(`  Done: ${result9x16.outputPath} (${result9x16.durationSeconds.toFixed(1)}s, render: ${result9x16.renderTimeSeconds.toFixed(1)}s)`);

    // Upload 9:16
    const url9x16 = await uploadToR2(output9x16, 'hair-approach/showreel/master-9x16.mp4', 'video/mp4');
    console.log(`  Uploaded: ${url9x16}`);

    console.log('\n=== Results ===');
    console.log(`  16:9: ${url16x9}`);
    console.log(`  9:16: ${url9x16}`);
    console.log('\n[COST] Showreel renders: $0.00 (local compute only)');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
