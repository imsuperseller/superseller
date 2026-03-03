/**
 * BullMQ Worker: Crew video batch render with WAHA approval flow.
 *
 * Flow: Remotion render all crew compositions → R2 staging upload →
 *       WAHA WhatsApp notification → owner approves/rejects →
 *       on approve: copy to crew-videos/latest/ (production URLs)
 *
 * Zero API cost (Remotion only, no Kling/Suno charges — music is pre-baked).
 */
import { Worker, Job } from "bullmq";
import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync, statSync } from "fs";
import path from "path";
import { redisConnection } from "../connection";
import { CrewVideoJobData } from "../queues";
import { uploadToR2 } from "../../services/r2";
import { sendText, phoneToChatId, isWahaConfigured } from "../../services/waha-client";
import { logger } from "../../utils/logger";
import { config } from "../../config";

const WORKER_ROOT = path.resolve(__dirname, "../../..");
const ENTRY_POINT = path.join(WORKER_ROOT, "remotion/src/index.ts");

// ─── Crew data (canonical source: apps/web/superseller-site/src/data/crew.ts) ──
// V2: includes demoVideoUrl, deviceType, and annotations for real-video-embedded compositions
const CREW = [
    { id: "forge", name: "Forge", role: "Video Producer", tagline: "AI Cinematic Walkthrough", accentColor: "#f47920", accentColorRgb: "244, 121, 32", icon: "▶", features: ["Any business URL to video in minutes", "AI face compositing in every scene", "All formats: 16:9, 9:16, 1:1, 4:5", "Music overlay + text captions"], creditsPerTask: 50, taskUnit: "video", status: "live", demoVideoUrl: "videos/floor-plan-tour.mp4", deviceType: "laptop" as const, annotations: ["AI cinematic walkthrough", "Music + captions", "All aspect ratios"] },
    { id: "spoke", name: "Spoke", role: "AI Spokesperson", tagline: "Your AI Avatar, Speaking for You", accentColor: "#f59e0b", accentColorRgb: "245, 158, 11", icon: "🎤", features: ["AI lip-sync avatar video", "Your face composited in", "Celebrity-style selfie videos", "Share on any platform"], creditsPerTask: 50, taskUnit: "video", status: "live", demoVideoUrl: "videos/celebrity-selfie-generator.mp4", deviceType: "phone" as const, annotations: ["AI lip-sync avatar", "Your face composited", "Share anywhere"] },
    { id: "frontdesk", name: "FrontDesk", role: "AI Receptionist", tagline: "AI Handles Every Call, 24/7", accentColor: "#06b6d4", accentColorRgb: "6, 182, 212", icon: "📞", features: ["24/7 natural voice AI answering", "Lead capture and qualification", "Appointment booking", "Call recording + transcripts"], creditsPerTask: 5, taskUnit: "call", status: "coming-soon", demoVideoUrl: "videos/call-audio-analyzer.mp4", deviceType: "laptop" as const, annotations: ["AI call handling", "Instant transcription", "Lead capture"] },
    { id: "scout", name: "Scout", role: "Lead Hunter", tagline: "AI Lead Intelligence at Scale", accentColor: "#8b5cf6", accentColorRgb: "139, 92, 246", icon: "🎯", features: ["Niche-targeted lead sourcing", "AI qualification scoring", "Direct WhatsApp delivery", "CRM integration"], creditsPerTask: 15, taskUnit: "lead", status: "coming-soon", demoVideoUrl: "videos/meta-ad-analyzer.mp4", deviceType: "laptop" as const, annotations: ["Lead intelligence", "AI scoring", "ROI tracking"] },
    { id: "buzz", name: "Buzz", role: "Content Creator", tagline: "AI Content Creation on Autopilot", accentColor: "#ec4899", accentColorRgb: "236, 72, 153", icon: "📱", features: ["AI content creation (text + images)", "WhatsApp approval workflow", "Facebook + Instagram publishing", "Brand-consistent messaging"], creditsPerTask: 10, taskUnit: "post", status: "live", demoVideoUrl: "videos/youtube-clone.mp4", deviceType: "phone" as const, annotations: ["AI content creation", "Multi-platform", "Automated posting"] },
    { id: "cortex", name: "Cortex", role: "Analyst", tagline: "RAG-Powered Business Intelligence", accentColor: "#10b981", accentColorRgb: "16, 185, 129", icon: "🧠", features: ["Document ingestion (PDF, docs, web)", "RAG-powered Q&A", "Brand-aware responses", "API access for integrations"], creditsPerTask: 2, taskUnit: "query", status: "coming-soon", demoVideoUrl: "videos/cro-insights.mp4", deviceType: "laptop" as const, annotations: ["RAG-powered Q&A", "Sourced answers", "Data insights"] },
    { id: "market", name: "Market", role: "Marketplace Automation", tagline: "AI Marketplace Listings, 24/7", accentColor: "#3b82f6", accentColorRgb: "59, 130, 246", icon: "🛒", features: ["AI-generated copy per listing", "3x unique images with phone overlay", "Location rotation (30+ cities)", "Automated 24/7 scheduling"], creditsPerTask: 25, taskUnit: "listing", status: "live", demoVideoUrl: "videos/calendar-assistant.mp4", deviceType: "laptop" as const, annotations: ["FB Marketplace listings", "30+ cities", "24/7 automation"] },
];

// ─── Types ─────────────────────────────────────────────────────────
interface CompositionRender {
    compositionId: string;
    outputFile: string;
    props: Record<string, unknown>;
}

interface RenderResult {
    name: string;
    success: boolean;
    sizeMB?: number;
}

export interface CrewBatchState {
    batchId: string;
    videoUrls: Record<string, string>;  // filename → R2 public URL
    trigger: string;
    createdAt: number;
    status: "rendering" | "pending-approval" | "approved" | "rejected";
    renderedCount: number;
    failedCount: number;
}

// ─── Build composition list (V2 — real video embedded) ─────────────
function buildCompositionList(filterIds?: string[]): CompositionRender[] {
    const list: CompositionRender[] = [];

    // Crew reveal (always included unless filtering)
    if (!filterIds || filterIds.includes("reveal")) {
        list.push({
            compositionId: "CrewReveal-16x9",
            outputFile: "crew-reveal.mp4",
            props: { tagline: "Seven Agents. Zero Overhead." },
        });
    }

    // Individual crew demos — V2 with real video in device mockups
    const crewToRender = filterIds
        ? CREW.filter((c) => filterIds.includes(c.id))
        : CREW;

    for (const crew of crewToRender) {
        list.push({
            compositionId: "CrewDemoV2-16x9",
            outputFile: `crew-demo-${crew.id}.mp4`,
            props: {
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
            },
        });
    }

    return list;
}

// ─── Render a single composition via Remotion CLI ──────────────────
function renderComposition(
    compositionId: string,
    outputFile: string,
    props: Record<string, unknown>,
    outputDir: string
): RenderResult {
    const propsStr = JSON.stringify(props).replace(/'/g, "'\\''");
    const outPath = path.join(outputDir, outputFile);
    const cmd = `npx remotion render "${ENTRY_POINT}" "${compositionId}" "${outPath}" --props='${propsStr}' --concurrency=2 --gl=angle`;

    logger.info({ msg: "Crew video: rendering", compositionId, outputFile });

    try {
        execSync(cmd, {
            cwd: WORKER_ROOT,
            stdio: "pipe",
            timeout: 5 * 60 * 1000,
        });
        const sizeMB = statSync(outPath).size / 1024 / 1024;
        logger.info({ msg: "Crew video: render complete", outputFile, sizeMB: sizeMB.toFixed(1) });
        return { name: outputFile, success: true, sizeMB };
    } catch (err: any) {
        logger.error({ msg: "Crew video: render failed", outputFile, error: err.message });
        return { name: outputFile, success: false };
    }
}

// ─── Build WhatsApp approval message ───────────────────────────────
function buildApprovalMessage(
    batchId: string,
    videoUrls: Record<string, string>,
    results: RenderResult[]
): string {
    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    const lines = [
        `*SuperSeller AI — Crew Videos Ready*`,
        ``,
        `Batch: \`${batchId.slice(0, 8)}\``,
        `Rendered: ${succeeded.length}/${results.length} videos`,
        ``,
    ];

    if (succeeded.length > 0) {
        lines.push(`*Preview links:*`);
        for (const r of succeeded) {
            const url = videoUrls[r.name];
            const sizeTxt = r.sizeMB ? ` (${r.sizeMB.toFixed(1)}MB)` : "";
            lines.push(`  ${r.name}${sizeTxt}`);
            lines.push(`  ${url}`);
            lines.push(``);
        }
    }

    if (failed.length > 0) {
        lines.push(`*Failed:* ${failed.map((r) => r.name).join(", ")}`);
        lines.push(``);
    }

    lines.push(`Reply with:`);
    lines.push(`*approve* — publish to production`);
    lines.push(`*reject [reason]* — discard this batch`);

    return lines.join("\n");
}

// ─── Main job processor ────────────────────────────────────────────
async function processCrewVideoJob(job: Job<CrewVideoJobData>) {
    const { batchId, trigger, notifyPhone, compositions, v3, forceStdMode } = job.data;

    // V3 pipeline: AI-generated video per scene
    if (v3) {
        return processCrewVideoV3(job);
    }

    const outputDir = `/tmp/crew-video-jobs/${batchId}`;
    mkdirSync(outputDir, { recursive: true });

    logger.info({ msg: "Crew video batch started", batchId, trigger, compositions });

    // Store initial state in Redis
    const batchState: CrewBatchState = {
        batchId,
        videoUrls: {},
        trigger,
        createdAt: Date.now(),
        status: "rendering",
        renderedCount: 0,
        failedCount: 0,
    };
    await redisConnection.set(
        `crew-batch:${batchId}`,
        JSON.stringify(batchState),
        "EX",
        86400 * 7
    );

    // 1. Render all compositions
    const compositionList = buildCompositionList(compositions);
    const results: RenderResult[] = [];

    for (let i = 0; i < compositionList.length; i++) {
        const comp = compositionList[i];
        await job.updateProgress(Math.round(((i + 1) / compositionList.length) * 70));
        const result = renderComposition(comp.compositionId, comp.outputFile, comp.props, outputDir);
        results.push(result);
    }

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (succeeded.length === 0) {
        throw new Error(`All ${results.length} renders failed`);
    }

    // 2. Upload to R2 staging
    await job.updateProgress(75);
    const stagingPrefix = `crew-videos/staging-${batchId}`;
    const videoUrls: Record<string, string> = {};

    for (const r of succeeded) {
        const localPath = path.join(outputDir, r.name);
        const r2Key = `${stagingPrefix}/${r.name}`;
        const url = await uploadToR2(localPath, r2Key, "video/mp4");
        videoUrls[r.name] = url;
        logger.info({ msg: "Crew video: uploaded to R2 staging", file: r.name, url });
    }

    await job.updateProgress(90);

    // 3. Update Redis with staging URLs
    batchState.status = "pending-approval";
    batchState.videoUrls = videoUrls;
    batchState.renderedCount = succeeded.length;
    batchState.failedCount = failed.length;
    await redisConnection.set(
        `crew-batch:${batchId}`,
        JSON.stringify(batchState),
        "EX",
        86400 * 7
    );

    // Also store as "latest pending" for WhatsApp approval shortcut
    await redisConnection.set("crew-batch:latest-pending", batchId, "EX", 86400 * 7);

    // 4. Send WAHA notification
    const phone = notifyPhone || config.claudeclaw.allowedPhones[0];
    if (phone && isWahaConfigured()) {
        const chatId = phoneToChatId(phone);
        const message = buildApprovalMessage(batchId, videoUrls, results);
        const msgId = await sendText(chatId, message);
        logger.info({ msg: "Crew video: WAHA notification sent", chatId, msgId });
    } else {
        logger.warn({ msg: "Crew video: WAHA not configured or no phone, skipping notification" });
    }

    // 5. Cleanup temp files
    try {
        rmSync(outputDir, { recursive: true, force: true });
    } catch {
        // Non-critical
    }

    await job.updateProgress(100);

    logger.info({
        msg: "Crew video batch complete — awaiting approval",
        batchId,
        rendered: succeeded.length,
        failed: failed.length,
        stagingPrefix,
    });

    return { batchId, videoUrls, rendered: succeeded.length, failed: failed.length };
}

// ─── V3 Pipeline: AI-generated full-screen video per scene ─────────
async function processCrewVideoV3(job: Job<CrewVideoJobData>) {
    const { batchId, trigger, notifyPhone, compositions, forceStdMode } = job.data;
    const outputDir = `/tmp/crew-video-jobs/${batchId}`;
    mkdirSync(outputDir, { recursive: true });

    logger.info({ msg: "Crew video V3 batch started", batchId, trigger, compositions, forceStdMode });

    // Store initial state in Redis
    const batchState: CrewBatchState = {
        batchId,
        videoUrls: {},
        trigger,
        createdAt: Date.now(),
        status: "rendering",
        renderedCount: 0,
        failedCount: 0,
    };
    await redisConnection.set(`crew-batch:${batchId}`, JSON.stringify(batchState), "EX", 86400 * 7);

    // 1. Import V3 dependencies
    const { CREW_V3_SCENE_DATA } = await import("../../data/crew-v3-scene-data");
    const { generateAgentClips } = await import("../../services/crew-demo-generator");

    // Filter agents
    const agentsToRender = compositions
        ? CREW_V3_SCENE_DATA.filter((a) => compositions.includes(a.id))
        : CREW_V3_SCENE_DATA;

    if (agentsToRender.length === 0) {
        throw new Error("No matching agents for V3 render");
    }

    const results: RenderResult[] = [];
    const videoUrls: Record<string, string> = {};

    // 2. For each agent: generate clips → Remotion render → R2
    for (let i = 0; i < agentsToRender.length; i++) {
        const agent = agentsToRender[i];
        await job.updateProgress(Math.round(((i) / agentsToRender.length) * 80));

        try {
            logger.info({ msg: "V3: generating clips", agent: agent.id, index: i + 1, total: agentsToRender.length });

            // Generate AI clips
            const genResult = await generateAgentClips(agent, {
                batchId: `${batchId}-${agent.id}`,
                forceStdMode,
                onProgress: (p) => {
                    logger.info({ msg: `V3 progress: ${agent.id}`, phase: p.phase, current: p.current, total: p.total, message: p.message });
                },
            });

            // Build Remotion props with R2 video URLs
            const v3Props = {
                crewName: agent.name,
                crewRole: agent.role,
                accentColor: agent.accentColor,
                accentColorRgb: agent.accentColorRgb,
                icon: agent.icon,
                creditsPerTask: agent.creditsPerTask,
                taskUnit: agent.taskUnit,
                status: agent.status,
                scenes: genResult.sceneVideoUrls,
                overlays: agent.scenes.map((s) => s.overlay),
            };

            // Render via Remotion CLI
            const outputFile = `crew-demo-v3-${agent.id}.mp4`;
            const renderResult = renderComposition(
                "CrewDemoV3-16x9",
                outputFile,
                v3Props,
                outputDir
            );

            if (renderResult.success) {
                // Upload rendered video to R2 staging
                const localPath = path.join(outputDir, outputFile);
                const r2Key = `crew-videos/staging-${batchId}/${outputFile}`;
                const url = await uploadToR2(localPath, r2Key, "video/mp4");
                videoUrls[outputFile] = url;
                logger.info({ msg: "V3: uploaded to R2", agent: agent.id, url, cost: genResult.totalCost.toFixed(2) });
            }

            results.push(renderResult);
        } catch (err: any) {
            logger.error({ msg: "V3: agent failed", agent: agent.id, error: err.message });
            results.push({ name: `crew-demo-v3-${agent.id}.mp4`, success: false });
        }
    }

    const succeeded = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (succeeded.length === 0) {
        throw new Error(`All ${results.length} V3 renders failed`);
    }

    await job.updateProgress(90);

    // 3. Update Redis
    batchState.status = "pending-approval";
    batchState.videoUrls = videoUrls;
    batchState.renderedCount = succeeded.length;
    batchState.failedCount = failed.length;
    await redisConnection.set(`crew-batch:${batchId}`, JSON.stringify(batchState), "EX", 86400 * 7);
    await redisConnection.set("crew-batch:latest-pending", batchId, "EX", 86400 * 7);

    // 4. WAHA notification
    const phone = notifyPhone || config.claudeclaw.allowedPhones[0];
    if (phone && isWahaConfigured()) {
        const chatId = phoneToChatId(phone);
        const message = buildApprovalMessage(batchId, videoUrls, results);
        await sendText(chatId, `*[V3 AI-Generated]*\n${message}`);
    }

    // 5. Cleanup
    try {
        rmSync(outputDir, { recursive: true, force: true });
    } catch { /* non-critical */ }

    await job.updateProgress(100);

    logger.info({
        msg: "V3 crew video batch complete",
        batchId,
        rendered: succeeded.length,
        failed: failed.length,
    });

    return { batchId, videoUrls, rendered: succeeded.length, failed: failed.length, version: "v3" };
}

// ─── Approval / Rejection handlers (called from routes) ────────────
export async function approveCrewBatch(batchId: string): Promise<{ published: string[] }> {
    const raw = await redisConnection.get(`crew-batch:${batchId}`);
    if (!raw) throw new Error(`Batch ${batchId} not found or expired`);

    const batch: CrewBatchState = JSON.parse(raw);
    if (batch.status !== "pending-approval") {
        throw new Error(`Batch ${batchId} is ${batch.status}, not pending-approval`);
    }

    // Copy from staging to latest (production) paths
    const published: string[] = [];
    for (const [filename, stagingUrl] of Object.entries(batch.videoUrls)) {
        const latestKey = `crew-videos/latest/${filename}`;

        // Download from staging URL and re-upload to latest path
        const res = await fetch(stagingUrl);
        if (!res.ok) {
            logger.error({ msg: "Failed to fetch staging video", filename, status: res.status });
            continue;
        }
        const buffer = Buffer.from(await res.arrayBuffer());
        const { uploadBufferToR2 } = await import("../../services/r2");
        const latestUrl = await uploadBufferToR2(buffer, latestKey, "video/mp4");
        published.push(latestUrl);
        logger.info({ msg: "Crew video: published to latest", filename, url: latestUrl });
    }

    // Update batch state
    batch.status = "approved";
    await redisConnection.set(`crew-batch:${batchId}`, JSON.stringify(batch), "EX", 86400 * 30);
    await redisConnection.del("crew-batch:latest-pending");

    // Notify via WAHA
    const phone = config.claudeclaw.allowedPhones[0];
    if (phone && isWahaConfigured()) {
        const chatId = phoneToChatId(phone);
        await sendText(chatId, `*Crew videos published!* ${published.length} videos live at crew-videos/latest/`);
    }

    logger.info({ msg: "Crew batch approved", batchId, published: published.length });
    return { published };
}

export async function rejectCrewBatch(batchId: string, reason?: string): Promise<void> {
    const raw = await redisConnection.get(`crew-batch:${batchId}`);
    if (!raw) throw new Error(`Batch ${batchId} not found or expired`);

    const batch: CrewBatchState = JSON.parse(raw);
    if (batch.status !== "pending-approval") {
        throw new Error(`Batch ${batchId} is ${batch.status}, not pending-approval`);
    }

    // Optionally delete staging files from R2
    const { deleteFromR2 } = await import("../../services/r2");
    for (const [filename] of Object.entries(batch.videoUrls)) {
        const r2Key = `crew-videos/staging-${batchId}/${filename}`;
        try {
            await deleteFromR2(r2Key);
        } catch {
            // Non-critical
        }
    }

    batch.status = "rejected";
    await redisConnection.set(`crew-batch:${batchId}`, JSON.stringify(batch), "EX", 86400 * 7);
    await redisConnection.del("crew-batch:latest-pending");

    // Notify via WAHA
    const phone = config.claudeclaw.allowedPhones[0];
    if (phone && isWahaConfigured()) {
        const chatId = phoneToChatId(phone);
        const msg = reason
            ? `*Crew videos rejected.* Reason: ${reason}`
            : `*Crew videos rejected.* Batch ${batchId.slice(0, 8)} discarded.`;
        await sendText(chatId, msg);
    }

    logger.info({ msg: "Crew batch rejected", batchId, reason });
}

/**
 * Handle WhatsApp approval/rejection from the owner.
 * Called from ClaudeClaw webhook when owner sends "approve" / "reject".
 * Returns true if the message was handled as a crew approval action.
 */
export async function handleWhatsAppCrewApproval(messageBody: string): Promise<boolean> {
    const text = messageBody.trim().toLowerCase();

    // Check if there's a pending batch
    const pendingBatchId = await redisConnection.get("crew-batch:latest-pending");
    if (!pendingBatchId) return false;

    if (text === "approve" || text === "yes" || text === "ok") {
        await approveCrewBatch(pendingBatchId);
        return true;
    }

    if (text.startsWith("reject")) {
        const reason = messageBody.replace(/^reject\s*/i, "").trim() || undefined;
        await rejectCrewBatch(pendingBatchId, reason);
        return true;
    }

    return false;
}

// ─── Worker Instance ─────────────────────────────────────────────
export const crewVideoWorker = new Worker(
    "crew-video",
    processCrewVideoJob,
    {
        connection: redisConnection,
        concurrency: 1, // One batch at a time (CPU-bound rendering)
        limiter: { max: 1, duration: 5000 },
    }
);

crewVideoWorker.on("completed", (job) => {
    logger.info({ msg: "Crew video worker: batch completed", batchId: job.data.batchId });
});

crewVideoWorker.on("failed", (job, err) => {
    logger.error({ msg: "Crew video worker: batch failed", batchId: job?.data.batchId, error: err.message });
});

// ─── Init ────────────────────────────────────────────────────────
export async function initCrewVideoWorker() {
    logger.info("Crew video worker initialized");
}
