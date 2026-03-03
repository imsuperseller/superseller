/**
 * CrewDemoV3 Generation Pipeline
 *
 * Orchestrates: Flux image gen → Kling video clips → FFmpeg normalize → R2 upload
 * Returns R2 URLs for 5 scene videos ready for Remotion composition.
 *
 * Cost per agent: ~$0.44 (5 images + 2 Pro clips + 3 Std clips)
 */
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { generateImageKie, createKlingTask, waitForTask } from "./kie";
import { normalizeClip } from "./ffmpeg";
import { uploadToR2 } from "./r2";
import { trackExpense } from "./expense-tracker";
import { logger } from "../utils/logger";
import type { AgentSceneData, ScenePrompts } from "../data/crew-v3-scene-data";

export interface GenerationProgress {
    agentId: string;
    phase: "images" | "sentinel" | "clips" | "normalize" | "upload" | "done";
    current: number;
    total: number;
    message: string;
}

export interface GenerationResult {
    agentId: string;
    /** 5 R2 public URLs for the normalized clips (one per scene) */
    sceneVideoUrls: string[];
    /** Total cost for this agent */
    totalCost: number;
    /** Time taken in ms */
    durationMs: number;
}

/**
 * Generate all 5 AI video clips for a single agent.
 * Uses sentinel pattern: generates first clip alone to verify credits,
 * then batches the remaining 4.
 */
export async function generateAgentClips(
    agent: AgentSceneData,
    options?: {
        batchId?: string;
        onProgress?: (progress: GenerationProgress) => void;
        /** Force all clips to std mode (cheaper for testing) */
        forceStdMode?: boolean;
    }
): Promise<GenerationResult> {
    const startTime = Date.now();
    const batchId = options?.batchId || `v3-${agent.id}-${Date.now()}`;
    const workDir = `/tmp/crew-v3-jobs/${batchId}`;
    const progress = options?.onProgress || (() => {});
    let totalCost = 0;

    if (!existsSync(workDir)) {
        await mkdir(workDir, { recursive: true });
    }

    const sceneVideoUrls: string[] = [];

    // ─── Step 1: Generate Start Frame Images (Flux 2 Pro) ────────
    progress({ agentId: agent.id, phase: "images", current: 0, total: 5, message: "Generating start frame images..." });
    const imageUrls: string[] = [];

    for (let i = 0; i < agent.scenes.length; i++) {
        const scene = agent.scenes[i];
        progress({ agentId: agent.id, phase: "images", current: i + 1, total: 5, message: `Image ${i + 1}/5: ${scene.overlay.layout}` });

        const imgResult = await generateImageKie({
            prompt: scene.imagePrompt,
            model: "flux-2/pro-text-to-image",
            aspect_ratio: "16:9",
            resolution: "1K",
        });

        imageUrls.push(imgResult.url);
        const imgCost = 0.025; // Flux 2 Pro rate
        totalCost += imgCost;
        await trackExpense({
            service: "kie",
            operation: "flux_image",
            estimatedCost: imgCost,
            jobId: batchId,
            metadata: { agent: agent.id, scene: i, layout: scene.overlay.layout },
        });

        logger.info({ msg: "V3 image generated", agent: agent.id, scene: i, url: imgResult.url });
    }

    // ─── Step 2: Sentinel — generate first clip alone ────────────
    progress({ agentId: agent.id, phase: "sentinel", current: 0, total: 1, message: "Sentinel: testing first clip..." });

    const sentinelScene = agent.scenes[0];
    const sentinelMode = options?.forceStdMode ? "std" : sentinelScene.klingMode;
    const sentinelTaskId = await createKlingTask({
        prompt: sentinelScene.klingPrompt,
        image_url: imageUrls[0],
        mode: sentinelMode,
        aspect_ratio: "16:9",
        duration: 5,
        negative_prompt: "text, watermark, logo, blurry, distorted, low quality",
    });

    logger.info({ msg: "V3 sentinel clip started", agent: agent.id, taskId: sentinelTaskId, mode: sentinelMode });

    const sentinelResult = await waitForTask(sentinelTaskId, "kling");
    if (!sentinelResult.result?.video_url) {
        throw new Error(`Sentinel clip failed for ${agent.id}: no video URL`);
    }

    const sentinelCost = sentinelMode === "pro" ? 0.10 : 0.03;
    totalCost += sentinelCost;
    await trackExpense({
        service: "kie",
        operation: sentinelMode === "pro" ? "kling_clip_pro" : "kling_clip_std",
        estimatedCost: sentinelCost,
        jobId: batchId,
        metadata: { agent: agent.id, scene: 0, sentinel: true },
    });

    progress({ agentId: agent.id, phase: "sentinel", current: 1, total: 1, message: "Sentinel passed — credits OK" });

    // Download and normalize sentinel clip
    const sentinelRawPath = path.join(workDir, `scene-0-raw.mp4`);
    const sentinelNormPath = path.join(workDir, `scene-0-norm.mp4`);
    await downloadFile(sentinelResult.result.video_url, sentinelRawPath);
    await normalizeClip(sentinelRawPath, sentinelNormPath);

    // Upload sentinel to R2
    const sentinelR2Key = `crew-videos/v3/${agent.id}/scene-0.mp4`;
    const sentinelR2Url = await uploadToR2(sentinelNormPath, sentinelR2Key, "video/mp4");
    sceneVideoUrls.push(sentinelR2Url);

    // ─── Step 3: Batch remaining 4 clips ─────────────────────────
    progress({ agentId: agent.id, phase: "clips", current: 0, total: 4, message: "Generating remaining clips..." });

    // Start all 4 Kling tasks
    const clipTasks: Array<{ sceneIdx: number; taskId: string; mode: string }> = [];
    for (let i = 1; i < agent.scenes.length; i++) {
        const scene = agent.scenes[i];
        const mode = options?.forceStdMode ? "std" : scene.klingMode;

        const taskId = await createKlingTask({
            prompt: scene.klingPrompt,
            image_url: imageUrls[i],
            mode,
            aspect_ratio: "16:9",
            duration: 5,
            negative_prompt: "text, watermark, logo, blurry, distorted, low quality",
        });

        clipTasks.push({ sceneIdx: i, taskId, mode });
        const clipCost = mode === "pro" ? 0.10 : 0.03;
        totalCost += clipCost;
        await trackExpense({
            service: "kie",
            operation: mode === "pro" ? "kling_clip_pro" : "kling_clip_std",
            estimatedCost: clipCost,
            jobId: batchId,
            metadata: { agent: agent.id, scene: i },
        });

        logger.info({ msg: "V3 clip started", agent: agent.id, scene: i, taskId, mode });
    }

    // Poll all 4 clips
    for (let j = 0; j < clipTasks.length; j++) {
        const task = clipTasks[j];
        progress({ agentId: agent.id, phase: "clips", current: j + 1, total: 4, message: `Clip ${task.sceneIdx + 1}/5 polling...` });

        const result = await waitForTask(task.taskId, "kling");
        if (!result.result?.video_url) {
            throw new Error(`Clip ${task.sceneIdx} failed for ${agent.id}: no video URL`);
        }

        // Download, normalize, upload
        const rawPath = path.join(workDir, `scene-${task.sceneIdx}-raw.mp4`);
        const normPath = path.join(workDir, `scene-${task.sceneIdx}-norm.mp4`);
        await downloadFile(result.result.video_url, rawPath);

        progress({ agentId: agent.id, phase: "normalize", current: j + 1, total: 4, message: `Normalizing clip ${task.sceneIdx + 1}/5` });
        await normalizeClip(rawPath, normPath);

        const r2Key = `crew-videos/v3/${agent.id}/scene-${task.sceneIdx}.mp4`;
        const r2Url = await uploadToR2(normPath, r2Key, "video/mp4");
        sceneVideoUrls.push(r2Url);

        logger.info({ msg: "V3 clip ready", agent: agent.id, scene: task.sceneIdx, url: r2Url });
    }

    // Sort by scene index (sentinel was first, rest were batched)
    // sceneVideoUrls is already in order: [0, 1, 2, 3, 4]

    const durationMs = Date.now() - startTime;
    progress({ agentId: agent.id, phase: "done", current: 5, total: 5, message: `Done! ${sceneVideoUrls.length} clips, $${totalCost.toFixed(2)}, ${(durationMs / 1000 / 60).toFixed(1)}min` });

    logger.info({
        msg: "V3 agent generation complete",
        agent: agent.id,
        clips: sceneVideoUrls.length,
        cost: totalCost.toFixed(2),
        durationMin: (durationMs / 1000 / 60).toFixed(1),
    });

    return {
        agentId: agent.id,
        sceneVideoUrls,
        totalCost,
        durationMs,
    };
}

/**
 * Generate clips for multiple agents (parallel batching).
 * Runs up to `concurrency` agents simultaneously.
 */
export async function generateBatch(
    agents: AgentSceneData[],
    options?: {
        batchId?: string;
        concurrency?: number;
        forceStdMode?: boolean;
        onProgress?: (progress: GenerationProgress) => void;
    }
): Promise<GenerationResult[]> {
    const concurrency = options?.concurrency || 2;
    const results: GenerationResult[] = [];
    const queue = [...agents];

    const runNext = async (): Promise<void> => {
        const agent = queue.shift();
        if (!agent) return;

        const result = await generateAgentClips(agent, {
            batchId: options?.batchId ? `${options.batchId}-${agent.id}` : undefined,
            forceStdMode: options?.forceStdMode,
            onProgress: options?.onProgress,
        });
        results.push(result);
        await runNext();
    };

    // Start `concurrency` parallel lanes
    const lanes = Array.from({ length: Math.min(concurrency, agents.length) }, () => runNext());
    await Promise.all(lanes);

    return results;
}

// ─── Helpers ────────────────────────────────────────────────────

async function downloadFile(url: string, destPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download ${url}: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(destPath, buffer);
    logger.debug({ msg: "Downloaded file", url: url.slice(0, 80), size: `${(buffer.length / 1024 / 1024).toFixed(1)}MB`, dest: destPath });
}
