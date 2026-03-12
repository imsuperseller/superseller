/**
 * Hair Approach — Upscale 6 portfolio photos via Recraft Crisp (Kie.ai)
 * Cost: ~$0.015 (6 × $0.0025)
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-upscale.ts
 */
import { generateImageKie } from '../services/kie';
import { uploadToR2 } from '../services/r2';
import * as fs from 'fs';
import * as path from 'path';

const R2_BASE = 'https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev';

const PHOTOS = [
    'gallery_blonde-highlights.jpg',
    'gallery_client-waves.jpg',
    'gallery_brunette-result.jpg',
    'gallery_blonde-transformation.jpg',
    'gallery_color-change.jpg',
    'gallery_platinum-result.jpg',
];

const OUTPUT_DIR = '/tmp/hair-approach-upscaled';

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    console.log('=== Hair Approach Photo Upscale ===');
    console.log(`Photos: ${PHOTOS.length}`);
    console.log(`Model: recraft/crisp-upscale`);
    console.log(`Target: 2K resolution\n`);

    const results: { name: string; url: string }[] = [];

    for (const photo of PHOTOS) {
        const sourceUrl = `${R2_BASE}/hair-approach/portfolio/${photo}`;
        console.log(`\nUpscaling: ${photo}`);
        console.log(`  Source: ${sourceUrl}`);

        try {
            const result = await generateImageKie({
                prompt: 'enhance, sharpen, upscale, high resolution professional hair salon photography',
                model: 'recraft/crisp-upscale',
                image_urls: [sourceUrl],
                resolution: '2K',
            });

            console.log(`  Kie result URL: ${result.url}`);

            // Download upscaled image
            const localPath = path.join(OUTPUT_DIR, photo);
            const response = await fetch(result.url);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const buffer = Buffer.from(await response.arrayBuffer());
            fs.writeFileSync(localPath, buffer);
            console.log(`  Downloaded: ${localPath} (${(buffer.length / 1024).toFixed(0)}KB)`);

            // Upload to R2
            const r2Key = `hair-approach/portfolio/upscaled/${photo}`;
            const publicUrl = await uploadToR2(localPath, r2Key, 'image/jpeg');
            console.log(`  Uploaded: ${publicUrl}`);
            console.log(`  [COST] Recraft Crisp upscale: $0.0025 | ${photo}`);

            results.push({ name: photo, url: publicUrl });
        } catch (err: any) {
            console.error(`  FAILED: ${err.message}`);
        }
    }

    console.log('\n=== Results ===');
    for (const r of results) {
        console.log(`  ${r.name}: ${r.url}`);
    }
    console.log(`\n[COST] Total Recraft: $${(results.length * 0.0025).toFixed(4)} (${results.length}/${PHOTOS.length} succeeded)`);
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
