/**
 * GP Homes and Repairs — Generate 6 portfolio images via Kie.ai + upload to R2
 * Model: flux-2/pro-text-to-image (photorealistic interiors/exteriors)
 * Cost: ~$0.20-0.40 total (6 images)
 * Run: cd apps/worker && npx tsx src/scripts/gp-homes-images.ts
 */
import { generateImageKie } from '../services/kie';
import { uploadBufferToR2 } from '../services/r2';

const IMAGES = [
    {
        name: 'hero-kitchen-remodel.jpg',
        prompt: 'Professional photography of a stunning modern kitchen remodel in a Texas home. White shaker cabinets, quartz countertops, stainless steel appliances, pendant lighting over island, hardwood floors. Bright natural light from large windows. Clean, magazine-quality interior photography. No people, no text, no watermarks.',
        aspect_ratio: '16:9' as const,
    },
    {
        name: 'bathroom-renovation.jpg',
        prompt: 'Professional photography of a luxury bathroom renovation. Walk-in glass shower with marble tile, floating double vanity with vessel sinks, modern fixtures, LED mirror. Warm ambient lighting. Clean contemporary design in a suburban Texas home. Magazine-quality interior photography. No people, no text, no watermarks.',
        aspect_ratio: '1:1' as const,
    },
    {
        name: 'room-addition.jpg',
        prompt: 'Professional photography of a beautiful room addition in a suburban home. Spacious sunroom or family room extension with large windows, vaulted ceiling, recessed lighting, new flooring seamlessly integrated with existing home. Bright and airy feel. Magazine-quality architecture photography. No people, no text, no watermarks.',
        aspect_ratio: '16:9' as const,
    },
    {
        name: 'exterior-renovation.jpg',
        prompt: 'Professional photography of a home exterior renovation in Plano Texas. Updated facade with new siding, modern front door, landscaping, stone accent wall, new garage door, clean driveway. Suburban neighborhood setting, golden hour lighting. Curb appeal transformation. No people, no text, no watermarks.',
        aspect_ratio: '16:9' as const,
    },
    {
        name: 'flooring-install.jpg',
        prompt: 'Professional photography of beautiful new hardwood flooring installation in a home. Rich warm-toned engineered hardwood, wide planks, seamless installation throughout open-concept living and dining area. Natural light, modern furniture staging. Magazine-quality interior photography. No people, no text, no watermarks.',
        aspect_ratio: '1:1' as const,
    },
    {
        name: 'garage-conversion.jpg',
        prompt: 'Professional photography of a completed garage conversion into a modern living space. Comfortable room with proper insulation, drywall, recessed lighting, luxury vinyl plank flooring, large window added. Cozy home office or guest suite setup. Magazine-quality interior photography. No people, no text, no watermarks.',
        aspect_ratio: '1:1' as const,
    },
];

async function main() {
    console.log('=== GP Homes — Image Generation ===');
    console.log(`Images: ${IMAGES.length}`);
    console.log(`Model: flux-2/pro-text-to-image\n`);

    const results: { name: string; url: string }[] = [];
    let totalCost = 0;

    for (const img of IMAGES) {
        console.log(`\nGenerating: ${img.name}`);
        console.log(`  Prompt: ${img.prompt.slice(0, 80)}...`);

        try {
            const result = await generateImageKie({
                prompt: img.prompt,
                model: 'flux-2/pro-text-to-image',
                aspect_ratio: img.aspect_ratio,
                resolution: '2K',
            });

            console.log(`  Kie result URL: ${result.url}`);

            // Download generated image
            const response = await fetch(result.url);
            if (!response.ok) throw new Error(`Download failed: ${response.status}`);
            const buffer = Buffer.from(await response.arrayBuffer());
            console.log(`  Downloaded: ${(buffer.length / 1024).toFixed(0)}KB`);

            // Upload to R2
            const r2Key = `gp-homes-repairs/portfolio/${img.name}`;
            const contentType = img.name.endsWith('.png') ? 'image/png' : 'image/jpeg';
            const publicUrl = await uploadBufferToR2(buffer, r2Key, contentType);
            console.log(`  Uploaded: ${publicUrl}`);

            const cost = 0.05; // flux-2/pro-text-to-image ~$0.05/image
            totalCost += cost;
            console.log(`  [COST] flux-2/pro-text-to-image: $${cost.toFixed(2)} | ${img.name}`);

            results.push({ name: img.name, url: publicUrl });
        } catch (err: any) {
            console.error(`  FAILED: ${err.message}`);
        }
    }

    console.log('\n=== Results ===');
    for (const r of results) {
        console.log(`  ${r.name}: ${r.url}`);
    }
    console.log(`\n[COST] Total imagen-4: $${totalCost.toFixed(2)} (${results.length}/${IMAGES.length} succeeded)`);
    console.log('\nPaste these URLs into GPHomesPage.tsx PHOTOS object.');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
