#!/usr/bin/env npx tsx
/**
 * Test V3 generation pipeline — single agent (Forge) in std mode.
 * Generates 5 Flux images + 5 Kling clips → normalize → R2.
 * Then renders the final Remotion composition.
 *
 * Usage:
 *   npx tsx apps/worker/src/scripts/test-crew-v3-forge.ts
 *   npx tsx apps/worker/src/scripts/test-crew-v3-forge.ts --render-only   # skip clip gen, use existing R2 URLs
 */
import "dotenv/config";
import path from "path";
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { getAgentSceneData } from "../data/crew-v3-scene-data";
import { generateAgentClips, type GenerationProgress } from "../services/crew-demo-generator";

const WORKER_ROOT = path.resolve(__dirname, "../..");
const ENTRY_POINT = path.join(WORKER_ROOT, "remotion/src/index.ts");
const OUTPUT_DIR = path.resolve(WORKER_ROOT, "../web/superseller-site/public/videos");

async function main() {
    const args = process.argv.slice(2);
    const renderOnly = args.includes("--render-only");

    const agent = getAgentSceneData("forge");
    if (!agent) {
        console.error("Forge agent not found in scene data");
        process.exit(1);
    }

    console.log("═══════════════════════════════════════════════");
    console.log("  CrewDemoV3 — Forge Test (forceStdMode)");
    console.log("═══════════════════════════════════════════════\n");

    let sceneVideoUrls: string[];

    if (renderOnly) {
        // Use hardcoded R2 URLs from a previous run
        console.log("--render-only: Using existing R2 URLs...\n");
        sceneVideoUrls = [0, 1, 2, 3, 4].map(
            (i) => `${process.env.R2_PUBLIC_URL}/crew-videos/v3/forge/scene-${i}.mp4`
        );
    } else {
        // ─── Step 1: Generate AI clips ────────────────────
        console.log("Phase 1: Generating AI clips via Kie.ai...\n");
        console.log("  5 Flux 2 Pro images (start frames)");
        console.log("  5 Kling 3.0 Std clips (5s each)");
        console.log("  Estimated cost: ~$0.275");
        console.log("  Estimated time: ~8-10 min\n");

        const onProgress = (p: GenerationProgress) => {
            const timestamp = new Date().toISOString().slice(11, 19);
            console.log(`  [${timestamp}] ${p.phase} ${p.current}/${p.total} — ${p.message}`);
        };

        const result = await generateAgentClips(agent, {
            batchId: `test-forge-${Date.now()}`,
            forceStdMode: true,
            onProgress,
        });

        sceneVideoUrls = result.sceneVideoUrls;

        console.log("\n✅ Clip generation complete!");
        console.log(`   Cost: $${result.totalCost.toFixed(3)}`);
        console.log(`   Time: ${(result.durationMs / 1000 / 60).toFixed(1)} min`);
        console.log(`   Clips:`);
        sceneVideoUrls.forEach((url, i) => console.log(`     Scene ${i}: ${url}`));

        // Save URLs for --render-only reuse
        const urlsPath = path.join(OUTPUT_DIR, "forge-v3-urls.json");
        writeFileSync(urlsPath, JSON.stringify({ sceneVideoUrls, cost: result.totalCost, durationMs: result.durationMs }, null, 2));
        console.log(`\n   URLs saved to: ${urlsPath}`);
    }

    // ─── Step 2: Render Remotion composition ──────────
    console.log("\nPhase 2: Rendering Remotion composition...\n");

    if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

    const props = {
        crewName: agent.name,
        crewRole: agent.role,
        accentColor: agent.accentColor,
        accentColorRgb: agent.accentColorRgb,
        icon: agent.icon,
        creditsPerTask: agent.creditsPerTask,
        taskUnit: agent.taskUnit,
        status: agent.status,
        scenes: sceneVideoUrls,
        overlays: agent.scenes.map((s) => s.overlay),
    };

    const propsStr = JSON.stringify(props).replace(/'/g, "'\\''");
    const outPath = path.join(OUTPUT_DIR, "crew-demo-v3-forge.mp4");
    const cmd = `npx remotion render "${ENTRY_POINT}" "CrewDemoV3-16x9" "${outPath}" --props='${propsStr}' --concurrency=2 --gl=angle`;

    console.log(`   Composition: CrewDemoV3-16x9`);
    console.log(`   Output: ${outPath}`);

    try {
        execSync(cmd, { cwd: WORKER_ROOT, stdio: "inherit", timeout: 5 * 60 * 1000 });
        console.log(`\n✅ Render complete: ${outPath}`);
    } catch (err: any) {
        console.error(`\n❌ Render failed: ${err.message}`);
        process.exit(1);
    }

    console.log("\n═══════════════════════════════════════════════");
    console.log("  Done! Opening video...");
    console.log("═══════════════════════════════════════════════\n");

    try {
        execSync(`open "${outPath}"`);
    } catch {
        console.log(`Open manually: ${outPath}`);
    }
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
