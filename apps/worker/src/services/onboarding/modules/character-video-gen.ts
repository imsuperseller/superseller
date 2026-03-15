/**
 * character-video-gen.ts -- Onboarding module for generating brand character videos
 *
 * Triggered after character-questionnaire completes. Fetches the CharacterBible
 * from DB, builds 5 Sora 2 Pro scene prompts (2 auto + 3 from scenario_prompts),
 * submits all 5 to the model router, polls for completion, downloads to /tmp,
 * uploads to R2, and tracks all costs.
 *
 * After scene generation (Plan 01), this module also handles composition (Plan 03):
 *   - Renders the CharacterReveal Remotion composition into an MP4
 *   - Uploads the final video to R2 as a TenantAsset
 *   - Delivers via WAHA WhatsApp sendVideo with a scene-summary caption
 *   - Finalises PipelineRun with total cost, deliveredVia, deliveredAt
 *   - Cleans up /tmp after delivery
 *
 * State machine phases:
 *   intro -> generating -> awaiting-composition -> composing -> uploading -> delivering -> complete
 *
 * Used by: module-router.ts (loaded from MODULE_REGISTRY)
 */

import * as fs from "fs";
import * as path from "path";
import { queryOne, query } from "../../../db/client";
import { logger } from "../../../utils/logger";
import { upsertModuleState } from "../module-state";
import { createPipelineRun, updatePipelineRun } from "../../pipeline-run";
import { trackExpense, normalizeProvider } from "../../expense-tracker";
import { uploadToR2 } from "../../r2";
import { routeShot } from "../../model-router";
import { renderComposition } from "../../remotion-renderer";
import { sendVideo } from "../../waha-client";
import type { OnboardingModule, ModuleHandleResult, ModuleState } from "./types";
import type { ProductInfo } from "../prompt-assembler";
import type { CharacterRevealProps } from "../../../../remotion/src/types/character-reveal-props";

// ── Constants ─────────────────────────────────────────────────

const TRIGGER_PRODUCTS = ["videoforge", "winner studio", "character-in-a-box"];
const SORA_COST_PER_SCENE = 1.00; // 10s 1080p Sora 2 Pro = $1.00
const POLL_INTERVAL_MS = 15_000; // 15s
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 min
const MIN_SCENES_TO_PROCEED = 3;
const TOTAL_SCENES = 5;
const DEFAULT_ACCENT_COLOR = "#C9A96E";
const DEFAULT_BG_COLOR = "#0A0A0A";

// ── CharacterBible row shape ───────────────────────────────────

interface CharacterBibleRow {
    id: string;
    tenantId: string;
    name: string;
    personaDescription: string;
    visualStyle: string;
    soraHandle: string | null;
    metadata: Record<string, any> | null;
}

// ── Brand row shape ────────────────────────────────────────────

interface BrandRow {
    accentColor: string | null;
    logoUrl: string | null;
}

// ── Scene generation result ────────────────────────────────────

interface SceneResult {
    sceneIndex: number;
    r2Url: string;
    externalJobId: string;
    costDollars: number;
}

// ── Helpers ────────────────────────────────────────────────────

async function fetchCharacterBible(tenantId: string): Promise<CharacterBibleRow | null> {
    return queryOne<CharacterBibleRow>(
        `SELECT id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata
         FROM "CharacterBible"
         WHERE "tenantId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [tenantId],
    );
}

async function fetchBrand(tenantId: string): Promise<BrandRow | null> {
    return queryOne<BrandRow>(
        `SELECT "accentColor", "logoUrl"
         FROM "Brand"
         WHERE "tenantId" = $1
         LIMIT 1`,
        [tenantId],
    );
}

async function fetchTenantName(tenantId: string): Promise<string> {
    const row = await queryOne<{ name: string }>(
        `SELECT name FROM "Tenant" WHERE id = $1`,
        [tenantId],
    );
    return row?.name ?? "Your Business";
}

/**
 * Check if tenant has credit-based billing for their video product.
 * Returns true if billing_model = "credit", false otherwise.
 * Defaults to false (omit cost line) on failure.
 */
async function isCreditBillingModel(tenantId: string): Promise<boolean> {
    try {
        const row = await queryOne<{ billing_model: string | null }>(
            `SELECT configuration->>'billing_model' as billing_model
             FROM "ServiceInstance"
             WHERE "tenantId" = $1 AND "productType" ILIKE '%video%'
             LIMIT 1`,
            [tenantId],
        );
        return row?.billing_model === "credit";
    } catch {
        return false;
    }
}

function buildScenePrompts(bible: CharacterBibleRow): { prompt: string; shotType: "narrative" | "dialogue" }[] {
    const handle = bible.soraHandle ? `@${bible.soraHandle}` : bible.name;
    const style = bible.visualStyle || "cinematic";
    const scenarioPrompts: string[] = bible.metadata?.scenario_prompts ?? [];

    const scenes: { prompt: string; shotType: "narrative" | "dialogue" }[] = [
        // Scene 0 (auto): Intro portrait
        {
            prompt: `${handle} standing confidently in a professional studio setting, warm lighting, looking directly at camera, slight smile. ${style} aesthetic.`,
            shotType: "narrative",
        },
        // Scenes 1-3: from scenario_prompts
        ...scenarioPrompts.slice(0, 3).map((sp): { prompt: string; shotType: "dialogue" } => ({
            prompt: `${handle} ${sp}`,
            shotType: "dialogue",
        })),
        // Scene 4 (auto): Stylized closer
        {
            prompt: `${handle} in a stylized artistic shot, ${style} aesthetic, cinematic lighting, dramatic composition, looking toward camera with confidence.`,
            shotType: "narrative",
        },
    ];

    // Ensure exactly TOTAL_SCENES by padding with generic prompts if scenario_prompts was short
    while (scenes.length < TOTAL_SCENES) {
        scenes.splice(scenes.length - 1, 0, {
            prompt: `${handle} in a dynamic brand moment, ${style} aesthetic, professional setting.`,
            shotType: "dialogue",
        });
        if (scenes.length >= TOTAL_SCENES) break;
        logger.info({ msg: "character-video-gen: padded scene", tenantId: "unknown" });
    }

    return scenes.slice(0, TOTAL_SCENES);
}

async function downloadVideo(url: string, localPath: string): Promise<void> {
    const dir = path.dirname(localPath);
    fs.mkdirSync(dir, { recursive: true });

    const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!res.ok) {
        throw new Error(`Failed to download video (${res.status}): ${url}`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(localPath, buffer);
    logger.info({ msg: "character-video-gen: downloaded scene", localPath, bytes: buffer.length });
}

/**
 * Submit one scene to model-router + poll until complete.
 * Returns resultUrl or throws on unrecoverable failure.
 */
async function generateScene(params: {
    tenantId: string;
    sceneIndex: number;
    prompt: string;
    shotType: "narrative" | "dialogue";
}): Promise<{ resultUrl: string; provider: string }> {
    const { tenantId, sceneIndex, prompt, shotType } = params;

    const routerResult = await routeShot({
        shotType,
        budgetTier: "standard",
        prompt,
        durationSeconds: 10,
        tenantId,
    });

    const { adapter, selection } = routerResult;

    logger.info({
        msg: "character-video-gen: submitting scene",
        sceneIndex,
        shotType,
        modelId: selection.modelId,
        estimatedCost: routerResult.estimatedCost,
    });

    // Submit
    const jobResult = await adapter.submitJob(
        { shotType, budgetTier: "standard", prompt, durationSeconds: 10, tenantId },
        selection.modelId,
        selection.kieModelParam ?? undefined,
    );

    logger.info({
        msg: "character-video-gen: job submitted",
        sceneIndex,
        externalJobId: jobResult.externalJobId,
        provider: jobResult.provider,
    });

    // Poll
    const start = Date.now();
    let attempts = 0;

    while (Date.now() - start < POLL_TIMEOUT_MS) {
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        attempts++;

        let pollResult;
        try {
            pollResult = await adapter.pollStatus(jobResult.externalJobId);
        } catch (pollErr: any) {
            logger.warn({
                msg: "character-video-gen: poll error, retrying",
                sceneIndex,
                attempt: attempts,
                error: pollErr.message,
            });
            continue;
        }

        logger.info({
            msg: "character-video-gen: poll status",
            sceneIndex,
            status: pollResult.status,
            attempt: attempts,
        });

        if (pollResult.status === "completed" && pollResult.resultUrl) {
            return { resultUrl: pollResult.resultUrl, provider: jobResult.provider };
        }

        if (pollResult.status === "failed") {
            throw new Error(`Scene ${sceneIndex} failed: ${pollResult.error ?? "unknown"}`);
        }
    }

    throw new Error(`Scene ${sceneIndex} timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

/**
 * Run all 5 scene generations in parallel with individual retry (once).
 * Returns array of SceneResult for successful scenes.
 */
async function generateAllScenes(params: {
    tenantId: string;
    bible: CharacterBibleRow;
    pipelineRunId: string;
}): Promise<SceneResult[]> {
    const { tenantId, bible } = params;
    const scenePrompts = buildScenePrompts(bible);
    const results: SceneResult[] = [];

    const scenePromises = scenePrompts.map(async (scene, i) => {
        // Submit + poll with one retry on failure
        let sceneOutput: { resultUrl: string; provider: string } | null = null;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                sceneOutput = await generateScene({
                    tenantId,
                    sceneIndex: i,
                    prompt: scene.prompt,
                    shotType: scene.shotType,
                });
                break;
            } catch (err: any) {
                logger.warn({
                    msg: "character-video-gen: scene attempt failed",
                    sceneIndex: i,
                    attempt: attempt + 1,
                    error: err.message,
                });
                if (attempt === 1) {
                    logger.error({
                        msg: "character-video-gen: scene permanently failed after retry",
                        sceneIndex: i,
                        error: err.message,
                    });
                }
            }
        }

        if (!sceneOutput) return null;

        // Download to /tmp
        const localDir = `/tmp/character-video/${tenantId}`;
        const localPath = path.join(localDir, `scene-${i}.mp4`);

        try {
            await downloadVideo(sceneOutput.resultUrl, localPath);
        } catch (dlErr: any) {
            logger.error({ msg: "character-video-gen: download failed", sceneIndex: i, error: dlErr.message });
            return null;
        }

        // Upload to R2
        const r2Key = `character-videos/${tenantId}/scene-${i}.mp4`;
        let r2Url: string;

        try {
            r2Url = await uploadToR2(localPath, r2Key, "video/mp4", {
                tenantId,
                type: "character-video-scene",
                filename: `scene-${i}.mp4`,
                metadata: {
                    sceneIndex: i,
                    shotType: scene.shotType,
                    pipelineRunId: params.pipelineRunId,
                },
            });
        } catch (uploadErr: any) {
            logger.error({ msg: "character-video-gen: R2 upload failed", sceneIndex: i, error: uploadErr.message });
            return null;
        }

        // Track cost — use actual provider from model router (not hardcoded)
        await trackExpense({
            service: normalizeProvider(sceneOutput.provider),
            operation: "sora-2-pro",
            estimatedCost: SORA_COST_PER_SCENE,
            jobId: params.pipelineRunId,
            metadata: { tenantId, sceneIndex: i, r2Key, provider: sceneOutput.provider },
        });

        return {
            sceneIndex: i,
            r2Url,
            externalJobId: r2Key,
            costDollars: SORA_COST_PER_SCENE,
        } satisfies SceneResult;
    });

    const rawResults = await Promise.all(scenePromises);
    for (const r of rawResults) {
        if (r !== null) results.push(r);
    }

    return results;
}

// ── Composition + Delivery Pipeline ────────────────────────────

/**
 * Build the scene labels array for the reveal video.
 * Uses scenario_prompts metadata from CharacterBible if available.
 */
function buildSceneLabels(bible: CharacterBibleRow): string[] {
    const scenarioNames: string[] = bible.metadata?.scenario_names ?? [];
    const labels: string[] = [
        "Studio Portrait",
        scenarioNames[0] ?? "Brand in Action",
        scenarioNames[1] ?? "Client Moment",
        scenarioNames[2] ?? "Behind the Scenes",
        "Artistic Closer",
    ];
    return labels.slice(0, TOTAL_SCENES);
}

/**
 * Run the Remotion composition render, R2 upload, and WhatsApp delivery.
 * Called after scenes are generated and module is in awaiting-composition phase.
 */
async function runCompositionPipeline(params: {
    groupId: string;
    tenantId: string;
    data: Record<string, any>;
}): Promise<void> {
    const { groupId, tenantId, data } = params;
    const pipelineRunId: string = data.pipelineRunId;
    const sceneUrls: string[] = data.sceneUrls ?? [];
    const startMs = Date.now();
    const localDir = `/tmp/character-video/${tenantId}`;

    // ── Advance state to composing ────────────────────────────
    await upsertModuleState(groupId, tenantId, "character-video-gen", "composing", data);

    // ── Fetch required data ───────────────────────────────────
    const [bible, brand, businessName] = await Promise.all([
        fetchCharacterBible(tenantId),
        fetchBrand(tenantId),
        fetchTenantName(tenantId),
    ]);

    if (!bible) {
        logger.error({ msg: "character-video-gen: composing — no CharacterBible found", tenantId });
        await updatePipelineRun(pipelineRunId, {
            status: "failed",
            errorMessage: "CharacterBible not found during composition phase",
            durationMs: Date.now() - startMs,
        });
        await upsertModuleState(groupId, tenantId, "character-video-gen", "awaiting-composition", data);
        return;
    }

    // ── Ensure local scene files exist ────────────────────────
    // Scenes may have already been downloaded during generation; if missing, re-download from R2
    const localScenePaths: string[] = [];
    fs.mkdirSync(localDir, { recursive: true });

    for (let i = 0; i < sceneUrls.length; i++) {
        const localPath = path.join(localDir, `scene-${i}.mp4`);
        if (!fs.existsSync(localPath)) {
            logger.info({ msg: "character-video-gen: re-downloading scene for composition", sceneIndex: i, tenantId });
            try {
                await downloadVideo(sceneUrls[i], localPath);
            } catch (err: any) {
                logger.warn({ msg: "character-video-gen: scene re-download failed, skipping", sceneIndex: i, error: err.message });
                // Use R2 URL directly — Remotion can render from URLs as well
                localScenePaths.push(sceneUrls[i]);
                continue;
            }
        }
        localScenePaths.push(localPath);
    }

    // ── Build CharacterRevealProps ────────────────────────────
    const accentColor = brand?.accentColor ?? DEFAULT_ACCENT_COLOR;
    const taglineRaw = bible.personaDescription ?? "";
    const tagline = taglineRaw.length > 50 ? taglineRaw.substring(0, 50) + "..." : taglineRaw;
    const sceneLabels = buildSceneLabels(bible);

    const revealProps: CharacterRevealProps = {
        characterName: bible.name,
        businessName,
        tagline,
        accentColor,
        bgColor: DEFAULT_BG_COLOR,
        logoUrl: brand?.logoUrl ?? undefined,
        sceneClips: localScenePaths,
        sceneLabels,
    };

    // ── Render Remotion composition ───────────────────────────
    const outputPath = path.join(localDir, "reveal.mp4");
    logger.info({ msg: "character-video-gen: rendering CharacterReveal-16x9", tenantId, outputPath });

    let renderResult: { outputPath: string; durationSeconds: number; renderTimeSeconds: number };

    for (let renderAttempt = 0; renderAttempt < 2; renderAttempt++) {
        try {
            renderResult = await renderComposition({
                compositionId: "CharacterReveal-16x9",
                inputProps: revealProps as unknown as Record<string, unknown>,
                outputPath,
                concurrency: 2,
                crf: 20,
                onProgress: (percent) => {
                    if (percent % 20 === 0) {
                        logger.info({ msg: "character-video-gen: render progress", percent, tenantId });
                    }
                },
            });
            break;
        } catch (renderErr: any) {
            logger.error({
                msg: "character-video-gen: render failed",
                attempt: renderAttempt + 1,
                error: renderErr.message,
                tenantId,
            });

            if (renderAttempt === 1) {
                // Both attempts failed
                await updatePipelineRun(pipelineRunId, {
                    status: "failed",
                    errorMessage: `Remotion render failed: ${renderErr.message}`,
                    durationMs: Date.now() - startMs,
                });
                await upsertModuleState(groupId, tenantId, "character-video-gen", "awaiting-composition", data);

                // Notify the group of the issue
                try {
                    await sendVideo(groupId, "", undefined);
                } catch { /* ignore secondary failure */ }

                // Use a text message fallback since sendVideo needs a URL
                logger.error({ msg: "character-video-gen: composition failed — group will need manual follow-up", tenantId });
                return;
            }
        }
    }

    logger.info({
        msg: "character-video-gen: render complete",
        durationSeconds: renderResult!.durationSeconds,
        renderTimeSeconds: renderResult!.renderTimeSeconds,
        tenantId,
    });

    // ── Upload reveal.mp4 to R2 ───────────────────────────────
    await upsertModuleState(groupId, tenantId, "character-video-gen", "uploading", { ...data, revealPath: outputPath });

    const timestamp = Date.now();
    const r2Key = `character-videos/${tenantId}/reveal-${timestamp}.mp4`;
    let revealUrl: string;

    for (let uploadAttempt = 0; uploadAttempt < 2; uploadAttempt++) {
        try {
            revealUrl = await uploadToR2(outputPath, r2Key, "video/mp4", {
                tenantId,
                type: "video",
                filename: "character-reveal.mp4",
                metadata: { description: "AI Character Reveal Video" },
            });
            break;
        } catch (uploadErr: any) {
            logger.error({
                msg: "character-video-gen: R2 upload failed",
                attempt: uploadAttempt + 1,
                error: uploadErr.message,
                tenantId,
            });

            if (uploadAttempt === 1) {
                await updatePipelineRun(pipelineRunId, {
                    status: "failed",
                    errorMessage: `R2 upload failed: ${uploadErr.message}`,
                    durationMs: Date.now() - startMs,
                });
                await upsertModuleState(groupId, tenantId, "character-video-gen", "uploading", {
                    ...data,
                    revealPath: outputPath,
                    uploadError: uploadErr.message,
                });
                logger.error({ msg: "character-video-gen: R2 upload permanently failed", tenantId });
                return;
            }
        }
    }

    logger.info({ msg: "character-video-gen: reveal uploaded to R2", revealUrl: revealUrl!, tenantId });

    // ── Build WhatsApp caption ────────────────────────────────
    await upsertModuleState(groupId, tenantId, "character-video-gen", "delivering", {
        ...data,
        revealPath: outputPath,
        revealUrl: revealUrl!,
    });

    const sceneCostCents = sceneUrls.length * SORA_COST_PER_SCENE * 100;
    const totalCostCents = Math.round(sceneCostCents);

    const captionLines: string[] = [
        `${bible.name} - Your AI Character Reveal`,
        "",
        "5 scenes showcasing your brand character in action:",
        ...sceneLabels.map((label) => `- ${label}`),
        "",
    ];

    // Conditional cost line based on billing model
    try {
        const showCost = await isCreditBillingModel(tenantId);
        if (showCost) {
            const dollars = (totalCostCents / 100).toFixed(2);
            captionLines.push(`Credits used: $${dollars}`);
            captionLines.push("");
        }
    } catch {
        // Default: omit cost line
    }

    captionLines.push("Your character is ready! Reply here if you\u2019d like any changes.");
    const caption = captionLines.join("\n");

    // ── Deliver via WhatsApp ──────────────────────────────────
    logger.info({ msg: "character-video-gen: sending reveal video via WAHA", groupId, tenantId });

    let wahaDelivered = true;
    try {
        await sendVideo(groupId, revealUrl!, caption);
    } catch (wahaErr: any) {
        logger.error({ msg: "character-video-gen: WAHA sendVideo failed", error: wahaErr.message, tenantId });
        wahaDelivered = false;
    }

    // ── Update PipelineRun ────────────────────────────────────
    await updatePipelineRun(pipelineRunId, {
        status: "completed",
        deliveredVia: wahaDelivered ? "whatsapp" : "failed",
        deliveredAt: new Date(),
        costCents: totalCostCents,
        durationMs: Date.now() - startMs,
        outputJson: {
            revealUrl: revealUrl!,
            sceneCount: sceneUrls.length,
            sceneUrls,
            deliveredVia: wahaDelivered ? "whatsapp" : "failed",
        },
    });

    // Track composition cost (Remotion render is CPU — $0)
    // Only tracking Sora costs already done per-scene in generation phase

    // ── Advance to complete ───────────────────────────────────
    const completionData = {
        ...data,
        revealUrl: revealUrl!,
        deliveredAt: new Date().toISOString(),
        deliveredVia: wahaDelivered ? "whatsapp" : "failed",
    };
    await upsertModuleState(groupId, tenantId, "character-video-gen", "complete", completionData);

    logger.info({
        msg: "character-video-gen: composition pipeline complete",
        tenantId,
        revealUrl: revealUrl!,
        deliveredVia: wahaDelivered ? "whatsapp" : "failed",
    });

    // ── Cleanup /tmp ──────────────────────────────────────────
    try {
        fs.rmSync(localDir, { recursive: true, force: true });
        logger.info({ msg: "character-video-gen: cleaned up /tmp directory", localDir });
    } catch (cleanupErr: any) {
        logger.warn({ msg: "character-video-gen: /tmp cleanup failed (non-critical)", error: cleanupErr.message });
    }
}

// ── Module Implementation ─────────────────────────────────────

export const characterVideoGenModule: OnboardingModule = {
    moduleType: "character-video-gen",

    shouldActivate(products: ProductInfo[]): boolean {
        const names = products.map((p) => p.productName.toLowerCase());
        return TRIGGER_PRODUCTS.some((trigger) =>
            names.some((n) => n === trigger || n.includes(trigger)),
        );
    },

    getIntroMessage(_tenantName: string): string {
        return (
            "I'm now generating your AI character video! " +
            "This uses advanced AI to bring your brand character to life in 5 unique scenes. " +
            "This takes a few minutes..."
        );
    },

    async handleMessage(params: {
        groupId: string;
        tenantId: string;
        tenantSlug: string;
        messageBody: string;
        hasMedia: boolean;
        mediaUrl?: string;
        mediaType?: string;
        messageId?: string;
        senderChatId?: string;
        state: ModuleState;
    }): Promise<ModuleHandleResult> {
        const { groupId, tenantId, state } = params;
        const data = { ...state.collectedData };

        switch (state.phase) {
            // ── intro: transition immediately to generating ──
            case "intro": {
                await upsertModuleState(groupId, tenantId, "character-video-gen", "generating", data);

                // Kick off async generation (fire-and-forget from WhatsApp message handler)
                setImmediate(() => {
                    runGenerationPipeline({ groupId, tenantId, data }).catch((err) => {
                        logger.error({
                            msg: "character-video-gen: background pipeline error",
                            error: err.message,
                            tenantId,
                        });
                    });
                });

                return {
                    handled: true,
                    response:
                        "I'm generating your AI character video scenes now! " +
                        "This will take a few minutes. I'll let you know when it's ready.",
                    moduleType: "character-video-gen",
                };
            }

            // ── generating: user messages get a wait response ──
            case "generating": {
                return {
                    handled: true,
                    response:
                        "Your character video is being generated, please wait... " +
                        "I'll notify you as soon as all scenes are ready.",
                    moduleType: "character-video-gen",
                };
            }

            // ── awaiting-composition: scenes done, kick off Remotion render ──
            case "awaiting-composition": {
                // Kick off composition pipeline in background
                setImmediate(() => {
                    runCompositionPipeline({ groupId, tenantId, data }).catch((err) => {
                        logger.error({
                            msg: "character-video-gen: composition pipeline error",
                            error: err.message,
                            tenantId,
                        });
                    });
                });

                return {
                    handled: true,
                    response:
                        "Your reveal video is being composed! " +
                        "The final video will be delivered to you shortly.",
                    moduleType: "character-video-gen",
                };
            }

            // ── composing: user messages get a wait response ──
            case "composing": {
                return {
                    handled: true,
                    response:
                        "Still composing your character reveal video... " +
                        "I'll send it to you as soon as it's ready!",
                    moduleType: "character-video-gen",
                };
            }

            // ── uploading: intermediate state, user gets wait message ──
            case "uploading": {
                return {
                    handled: true,
                    response:
                        "Your reveal video is uploading... " +
                        "Almost there! I'll share it with you in just a moment.",
                    moduleType: "character-video-gen",
                };
            }

            // ── delivering: intermediate state ──
            case "delivering": {
                return {
                    handled: true,
                    response:
                        "Delivering your character reveal video right now!",
                    moduleType: "character-video-gen",
                };
            }

            // ── complete: module done ──
            case "complete": {
                return {
                    handled: true,
                    response: "Your character reveal video has been delivered! Let me know if you'd like anything adjusted.",
                    moduleType: "character-video-gen",
                    completed: true,
                };
            }

            default:
                return { handled: false };
        }
    },
};

// ── Background Generation Pipeline ────────────────────────────

/**
 * Runs the full 5-scene Sora 2 generation pipeline.
 * Called via setImmediate from the intro phase handler.
 * Updates module state and PipelineRun upon completion.
 * On success, transitions to awaiting-composition for the composition pipeline to pick up.
 */
async function runGenerationPipeline(params: {
    groupId: string;
    tenantId: string;
    data: Record<string, any>;
}): Promise<void> {
    const { groupId, tenantId, data } = params;
    const startMs = Date.now();

    // Create PipelineRun
    const pipelineRunId = await createPipelineRun({
        tenantId,
        pipelineType: "character-video-gen",
        status: "running",
        inputJson: { groupId, characterBibleId: data.characterBibleId ?? null },
        modelUsed: "sora-2-pro-text-to-video",
    });

    logger.info({ msg: "character-video-gen: pipeline started", tenantId, pipelineRunId });

    // Fetch CharacterBible
    const bible = await fetchCharacterBible(tenantId);
    if (!bible) {
        const errMsg = "No CharacterBible found for tenant — ensure character-questionnaire completed first";
        logger.error({ msg: "character-video-gen: " + errMsg, tenantId });
        await updatePipelineRun(pipelineRunId, {
            status: "failed",
            errorMessage: errMsg,
            durationMs: Date.now() - startMs,
        });
        // Reset to intro so it can be retried
        await upsertModuleState(groupId, tenantId, "character-video-gen", "intro", data);
        return;
    }

    logger.info({ msg: "character-video-gen: bible loaded", characterName: bible.name, tenantId });

    // Generate all scenes
    let sceneResults: SceneResult[] = [];
    try {
        sceneResults = await generateAllScenes({ tenantId, bible, pipelineRunId });
    } catch (err: any) {
        logger.error({ msg: "character-video-gen: generateAllScenes threw", error: err.message, tenantId });
    }

    const totalCostCents = Math.round(sceneResults.length * SORA_COST_PER_SCENE * 100);
    const sceneUrls = sceneResults.map((r) => r.r2Url);
    const durationMs = Date.now() - startMs;

    if (sceneResults.length < MIN_SCENES_TO_PROCEED) {
        // Not enough scenes — mark failed
        logger.error({
            msg: "character-video-gen: insufficient scenes generated",
            successCount: sceneResults.length,
            required: MIN_SCENES_TO_PROCEED,
            tenantId,
        });

        await updatePipelineRun(pipelineRunId, {
            status: "failed",
            outputJson: { sceneUrls, successCount: sceneResults.length },
            costCents: totalCostCents,
            errorMessage: `Only ${sceneResults.length}/${TOTAL_SCENES} scenes succeeded (minimum ${MIN_SCENES_TO_PROCEED} required)`,
            durationMs,
        });

        // Reset to intro to allow retry
        const retryData = { ...data, lastFailedAt: new Date().toISOString(), sceneUrls };
        await upsertModuleState(groupId, tenantId, "character-video-gen", "intro", retryData);
        return;
    }

    // Enough scenes — update PipelineRun with partial cost (scenes done; reveal not yet rendered)
    logger.info({
        msg: "character-video-gen: generation complete, advancing to awaiting-composition",
        successCount: sceneResults.length,
        totalCostCents,
        tenantId,
        pipelineRunId,
    });

    await updatePipelineRun(pipelineRunId, {
        status: "composing",
        outputJson: {
            sceneUrls,
            successCount: sceneResults.length,
            characterName: bible.name,
        },
        costCents: totalCostCents,
        durationMs,
    });

    // Store scene URLs in module state and advance to awaiting-composition
    // The composition pipeline will be triggered when the next message arrives in that phase,
    // OR can be triggered directly from here for a fully-automated flow.
    const completionData = {
        ...data,
        sceneUrls,
        pipelineRunId,
        characterName: bible.name,
        generatedAt: new Date().toISOString(),
    };

    await upsertModuleState(groupId, tenantId, "character-video-gen", "awaiting-composition", completionData);

    logger.info({
        msg: "character-video-gen: module advanced to awaiting-composition — triggering composition",
        sceneCount: sceneUrls.length,
        tenantId,
    });

    // Auto-trigger composition pipeline immediately (no need to wait for next WhatsApp message)
    await runCompositionPipeline({ groupId, tenantId, data: completionData });
}
