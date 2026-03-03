#!/usr/bin/env npx tsx
/**
 * Generate V3 AI clips for all remaining crew agents (excluding Forge which is done).
 * Runs agents sequentially (Kie.ai rate limits parallel requests).
 * After each agent's clips are generated, renders the Remotion composition.
 *
 * Usage:
 *   npx tsx apps/worker/src/scripts/generate-crew-v3-batch.ts
 *   npx tsx apps/worker/src/scripts/generate-crew-v3-batch.ts --agent spoke   # single agent
 */
import "dotenv/config";
import path from "path";
import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { CREW_V3_SCENE_DATA, getAgentSceneData } from "../data/crew-v3-scene-data";
import { generateAgentClips, type GenerationProgress } from "../services/crew-demo-generator";

const WORKER_ROOT = path.resolve(__dirname, "../..");
const ENTRY_POINT = path.join(WORKER_ROOT, "remotion/src/index.ts");
const OUTPUT_DIR = path.resolve(WORKER_ROOT, "../web/superseller-site/public/videos");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// Agents to generate (skip Forge — already done)
const SKIP_AGENTS = ["forge"];

async function renderAgent(agentId: string, sceneVideoUrls: string[]) {
    const agent = getAgentSceneData(agentId)!;
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
    const outPath = path.join(OUTPUT_DIR, `crew-demo-v3-${agentId}.mp4`);
    const cmd = `npx remotion render "${ENTRY_POINT}" "CrewDemoV3-16x9" "${outPath}" --props='${propsStr}' --concurrency=2 --gl=angle`;

    console.log(`\n   Rendering Remotion composition...`);
    execSync(cmd, { cwd: WORKER_ROOT, stdio: "inherit", timeout: 5 * 60 * 1000 });
    console.log(`   Output: ${outPath}`);
    return outPath;
}

async function main() {
    const args = process.argv.slice(2);
    const agentFilter = args.includes("--agent") ? args[args.indexOf("--agent") + 1] : undefined;

    const agents = agentFilter
        ? CREW_V3_SCENE_DATA.filter((a) => a.id === agentFilter)
        : CREW_V3_SCENE_DATA.filter((a) => !SKIP_AGENTS.includes(a.id));

    if (agents.length === 0) {
        console.error(`No agents to generate. Filter: ${agentFilter || "all except forge"}`);
        process.exit(1);
    }

    console.log("═══════════════════════════════════════════════");
    console.log("  CrewDemoV3 — Batch Generation (forceStdMode)");
    console.log("═══════════════════════════════════════════════\n");
    console.log(`Agents: ${agents.map((a) => a.name).join(", ")}`);
    console.log(`Estimated cost: ~$${(agents.length * 0.275).toFixed(2)}`);
    console.log(`Estimated time: ~${agents.length * 7} min\n`);

    const results: Array<{ id: string; name: string; cost: number; time: number; success: boolean; error?: string }> = [];

    for (const agent of agents) {
        console.log(`\n${"─".repeat(50)}`);
        console.log(`  ${agent.name} (${agent.role})`);
        console.log(`${"─".repeat(50)}`);

        const onProgress = (p: GenerationProgress) => {
            const ts = new Date().toISOString().slice(11, 19);
            console.log(`  [${ts}] ${p.phase} ${p.current}/${p.total} — ${p.message}`);
        };

        try {
            const genResult = await generateAgentClips(agent, {
                batchId: `v3-batch-${agent.id}-${Date.now()}`,
                forceStdMode: true,
                onProgress,
            });

            console.log(`\n  ✅ Clips: $${genResult.totalCost.toFixed(3)} / ${(genResult.durationMs / 60000).toFixed(1)}min`);

            // Save URLs
            const urlsPath = path.join(OUTPUT_DIR, `${agent.id}-v3-urls.json`);
            writeFileSync(urlsPath, JSON.stringify(genResult, null, 2));

            // Render Remotion composition
            await renderAgent(agent.id, genResult.sceneVideoUrls);

            results.push({
                id: agent.id,
                name: agent.name,
                cost: genResult.totalCost,
                time: genResult.durationMs,
                success: true,
            });
        } catch (err: any) {
            console.error(`\n  ❌ ${agent.name} failed: ${err.message}`);
            results.push({
                id: agent.id,
                name: agent.name,
                cost: 0,
                time: 0,
                success: false,
                error: err.message,
            });
        }
    }

    // Summary
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Batch Summary");
    console.log("═══════════════════════════════════════════════\n");

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const totalCost = succeeded.reduce((sum, r) => sum + r.cost, 0);
    const totalTime = succeeded.reduce((sum, r) => sum + r.time, 0);

    console.log(`Success: ${succeeded.length}/${results.length}`);
    succeeded.forEach((r) => console.log(`  ✅ ${r.name} — $${r.cost.toFixed(3)} / ${(r.time / 60000).toFixed(1)}min`));
    if (failed.length > 0) {
        console.log(`Failed: ${failed.length}/${results.length}`);
        failed.forEach((r) => console.log(`  ❌ ${r.name} — ${r.error}`));
    }
    console.log(`\nTotal cost: $${totalCost.toFixed(3)}`);
    console.log(`Total time: ${(totalTime / 60000).toFixed(1)}min`);
    console.log(`\nVideos: ${OUTPUT_DIR}`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
