/**
 * Hair Approach — Render 3 social mockup stills via Remotion renderStill
 * Cost: $0.00 (local compute only)
 * Run: cd apps/worker && npx tsx src/scripts/hair-approach-mockups.ts
 */
import * as path from 'path';
import * as fs from 'fs';

const OUTPUT_DIR = '/tmp/hair-approach-mockups';

const MOCKUPS = [
    { id: "SocialMockup-Result", output: "mockup-1.png" },
    { id: "SocialMockup-Tip", output: "mockup-2.png" },
    { id: "SocialMockup-Transform", output: "mockup-3.png" },
];

async function main() {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const { bundle } = await import("@remotion/bundler");
    const { renderStill, selectComposition } = await import("@remotion/renderer");

    console.log('=== Hair Approach Social Mockups ===\n');

    const entryPoint = path.resolve(process.cwd(), "remotion/src/index.ts");
    console.log('Bundling Remotion project...');
    const serveUrl = await bundle({ entryPoint, webpackOverride: (config: any) => config });
    console.log('Bundle ready.\n');

    const results: { name: string; url: string }[] = [];

    for (const mockup of MOCKUPS) {
        console.log(`Rendering ${mockup.id}...`);
        const composition = await selectComposition({
            serveUrl,
            id: mockup.id,
        });
        const outputPath = path.join(OUTPUT_DIR, mockup.output);
        await renderStill({
            composition,
            serveUrl,
            output: outputPath,
            frame: 25, // After PhoneMockup spring animation settles
        });
        console.log(`  Done: ${outputPath}`);

        // Upload to R2
        const { uploadToR2 } = await import('../services/r2');
        const r2Key = `hair-approach/mockups/${mockup.output}`;
        const url = await uploadToR2(outputPath, r2Key, 'image/png');
        console.log(`  Uploaded: ${url}`);
        results.push({ name: mockup.id, url });
    }

    console.log('\n=== Results ===');
    for (const r of results) {
        console.log(`  ${r.name}: ${r.url}`);
    }
    console.log('\n[COST] Social mockup renders: $0.00 (local compute only)');
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
