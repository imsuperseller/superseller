#!/usr/bin/env npx tsx
/**
 * Render all crew member demo videos + the crew reveal animation.
 * Outputs MP4s to apps/web/superseller-site/public/videos/
 *
 * Usage:
 *   npx tsx apps/worker/src/scripts/render-crew-videos.ts          # V2 (default)
 *   npx tsx apps/worker/src/scripts/render-crew-videos.ts --v3     # V3 (requires pre-generated clips in R2)
 *   npx tsx apps/worker/src/scripts/render-crew-videos.ts --v3 --agent forge   # V3 single agent
 */
import path from "path";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";

const WORKER_ROOT = path.resolve(__dirname, "../..");
const ENTRY_POINT = path.join(WORKER_ROOT, "remotion/src/index.ts");
const OUTPUT_DIR = path.resolve(WORKER_ROOT, "../web/superseller-site/public/videos");

// Ensure output dir exists
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Crew data V2 (matches apps/web/superseller-site/src/data/crew.ts) ──
// Includes demoVideoUrl, deviceType, and annotations for real-video-embedded compositions
const CREW = [
    { id: "forge", name: "Forge", role: "Video Producer", tagline: "AI Cinematic Walkthrough", accentColor: "#f47920", accentColorRgb: "244, 121, 32", icon: "▶", features: ["Any business URL to video in minutes", "AI face compositing in every scene", "All formats: 16:9, 9:16, 1:1, 4:5", "Music overlay + text captions"], creditsPerTask: 50, taskUnit: "video", status: "live", demoVideoUrl: "videos/floor-plan-tour.mp4", deviceType: "laptop", annotations: ["AI cinematic walkthrough", "Music + captions", "All aspect ratios"] },
    { id: "spoke", name: "Spoke", role: "AI Spokesperson", tagline: "Your AI Avatar, Speaking for You", accentColor: "#f59e0b", accentColorRgb: "245, 158, 11", icon: "🎤", features: ["AI lip-sync avatar video", "Your face composited in", "Celebrity-style selfie videos", "Share on any platform"], creditsPerTask: 50, taskUnit: "video", status: "live", demoVideoUrl: "videos/celebrity-selfie-generator.mp4", deviceType: "phone", annotations: ["AI lip-sync avatar", "Your face composited", "Share anywhere"] },
    { id: "frontdesk", name: "FrontDesk", role: "AI Receptionist", tagline: "AI Handles Every Call, 24/7", accentColor: "#06b6d4", accentColorRgb: "6, 182, 212", icon: "📞", features: ["24/7 natural voice AI answering", "Lead capture and qualification", "Appointment booking", "Call recording + transcripts"], creditsPerTask: 5, taskUnit: "call", status: "coming-soon", demoVideoUrl: "videos/call-audio-analyzer.mp4", deviceType: "laptop", annotations: ["AI call handling", "Instant transcription", "Lead capture"] },
    { id: "scout", name: "Scout", role: "Lead Hunter", tagline: "AI Lead Intelligence at Scale", accentColor: "#8b5cf6", accentColorRgb: "139, 92, 246", icon: "🎯", features: ["Niche-targeted lead sourcing", "AI qualification scoring", "Direct WhatsApp delivery", "CRM integration"], creditsPerTask: 15, taskUnit: "lead", status: "coming-soon", demoVideoUrl: "videos/meta-ad-analyzer.mp4", deviceType: "laptop", annotations: ["Lead intelligence", "AI scoring", "ROI tracking"] },
    { id: "buzz", name: "Buzz", role: "Content Creator", tagline: "AI Content Creation on Autopilot", accentColor: "#ec4899", accentColorRgb: "236, 72, 153", icon: "📱", features: ["AI content creation (text + images)", "WhatsApp approval workflow", "Facebook + Instagram publishing", "Brand-consistent messaging"], creditsPerTask: 10, taskUnit: "post", status: "live", demoVideoUrl: "videos/youtube-clone.mp4", deviceType: "phone", annotations: ["AI content creation", "Multi-platform", "Automated posting"] },
    { id: "cortex", name: "Cortex", role: "Analyst", tagline: "RAG-Powered Business Intelligence", accentColor: "#10b981", accentColorRgb: "16, 185, 129", icon: "🧠", features: ["Document ingestion (PDF, docs, web)", "RAG-powered Q&A", "Brand-aware responses", "API access for integrations"], creditsPerTask: 2, taskUnit: "query", status: "coming-soon", demoVideoUrl: "videos/cro-insights.mp4", deviceType: "laptop", annotations: ["RAG-powered Q&A", "Sourced answers", "Data insights"] },
    { id: "market", name: "Market", role: "Marketplace Automation", tagline: "AI Marketplace Listings, 24/7", accentColor: "#3b82f6", accentColorRgb: "59, 130, 246", icon: "🛒", features: ["AI-generated copy per listing", "3x unique images with phone overlay", "Location rotation (30+ cities)", "Automated 24/7 scheduling"], creditsPerTask: 25, taskUnit: "listing", status: "live", demoVideoUrl: "videos/calendar-assistant.mp4", deviceType: "laptop", annotations: ["FB Marketplace listings", "30+ cities", "24/7 automation"] },
];

function renderComposition(compositionId: string, outputFile: string, props: Record<string, unknown>) {
    const propsStr = JSON.stringify(props).replace(/'/g, "'\\''");
    const outPath = path.join(OUTPUT_DIR, outputFile);
    const cmd = `npx remotion render "${ENTRY_POINT}" "${compositionId}" "${outPath}" --props='${propsStr}' --concurrency=2 --gl=angle`;

    console.log(`\n🎬 Rendering: ${compositionId} → ${outputFile}`);
    console.log(`   Output: ${outPath}`);

    try {
        execSync(cmd, { cwd: WORKER_ROOT, stdio: "inherit", timeout: 5 * 60 * 1000 });
        console.log(`✅ Done: ${outputFile}`);
        return true;
    } catch (err: any) {
        console.error(`❌ Failed: ${outputFile} — ${err.message}`);
        return false;
    }
}

// ─── V3 Scene Data (imported for --v3 mode) ──
import { CREW_V3_SCENE_DATA } from "../data/crew-v3-scene-data";

async function main() {
    const args = process.argv.slice(2);
    const isV3 = args.includes("--v3");
    const agentFilter = args.includes("--agent") ? args[args.indexOf("--agent") + 1] : undefined;

    console.log("═══════════════════════════════════════════════");
    console.log(`  SuperSeller AI — Crew Video Batch Render ${isV3 ? "(V3)" : "(V2)"}`);
    console.log("═══════════════════════════════════════════════\n");
    console.log(`Output dir: ${OUTPUT_DIR}`);

    const results: { name: string; success: boolean }[] = [];

    if (isV3) {
        // V3: Render with pre-generated AI clips from R2
        // Note: Clips must already exist in R2 at crew-videos/v3/{agentId}/scene-{0-4}.mp4
        // Use the API endpoint POST /api/crew-videos/v3 to generate clips first
        const agents = agentFilter
            ? CREW_V3_SCENE_DATA.filter((a) => a.id === agentFilter)
            : CREW_V3_SCENE_DATA;

        if (agents.length === 0) {
            console.error(`No agent found with id: ${agentFilter}`);
            process.exit(1);
        }

        for (const agent of agents) {
            const fileName = `crew-demo-v3-${agent.id}.mp4`;
            // Use placeholder URLs — in production, these come from the generation pipeline
            const placeholderVideo = "videos/floor-plan-tour.mp4";
            results.push({
                name: fileName,
                success: renderComposition("CrewDemoV3-16x9", fileName, {
                    crewName: agent.name,
                    crewRole: agent.role,
                    accentColor: agent.accentColor,
                    accentColorRgb: agent.accentColorRgb,
                    icon: agent.icon,
                    creditsPerTask: agent.creditsPerTask,
                    taskUnit: agent.taskUnit,
                    status: agent.status,
                    scenes: agent.scenes.map(() => placeholderVideo),
                    overlays: agent.scenes.map((s) => s.overlay),
                }),
            });
        }
    } else {
        // V2: Original render path
        // 1. Crew Reveal (scroll animation source)
        results.push({
            name: "crew-reveal.mp4",
            success: renderComposition("CrewReveal-16x9", "crew-reveal.mp4", {
                tagline: "Seven Agents. Zero Overhead.",
            }),
        });

        // 2. Individual crew demo videos (V2 — real video in device mockups)
        for (const crew of CREW) {
            const fileName = `crew-demo-${crew.id}.mp4`;
            results.push({
                name: fileName,
                success: renderComposition("CrewDemoV2-16x9", fileName, {
                    crewName: crew.name,
                    crewRole: crew.role,
                    crewTagline: crew.tagline,
                    accentColor: crew.accentColor,
                    accentColorRgb: crew.accentColorRgb,
                    icon: crew.icon,
                    features: crew.features,
                    creditsPerTask: crew.creditsPerTask,
                    taskUnit: crew.taskUnit,
                    status: crew.status,
                    demoVideoUrl: crew.demoVideoUrl,
                    deviceType: crew.deviceType,
                    annotations: crew.annotations,
                }),
            });
        }
    }

    // Summary
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Render Summary");
    console.log("═══════════════════════════════════════════════");
    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    console.log(`Success: ${succeeded.length}/${results.length}`);
    succeeded.forEach((r) => console.log(`   ${r.name}`));
    if (failed.length > 0) {
        console.log(`Failed: ${failed.length}/${results.length}`);
        failed.forEach((r) => console.log(`   ${r.name}`));
    }
    console.log(`\nVideos saved to: ${OUTPUT_DIR}`);
}

main().catch(console.error);
