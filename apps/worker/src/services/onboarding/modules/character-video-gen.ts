/**
 * character-video-gen.ts -- Onboarding module for generating brand character videos
 *
 * Triggered after character-questionnaire completes. Fetches the CharacterBible
 * from DB, builds 5 Sora 2 Pro scene prompts (2 auto + 3 from scenario_prompts),
 * submits all 5 to the model router, polls for completion, downloads to /tmp,
 * uploads to R2, and tracks all costs.
 *
 * State machine phases:
 *   intro -> generating -> awaiting-composition
 *
 * Used by: module-router.ts (loaded from MODULE_REGISTRY)
 */

import * as fs from "fs";
import * as path from "path";
import { queryOne } from "../../../db/client";
import { logger } from "../../../utils/logger";
import { upsertModuleState } from "../module-state";
import { createPipelineRun, updatePipelineRun } from "../../pipeline-run";
import { trackExpense } from "../../expense-tracker";
import { uploadToR2 } from "../../r2";
import { routeShot } from "../../model-router";
import type { OnboardingModule, ModuleHandleResult, ModuleState } from "./types";
import type { ProductInfo } from "../prompt-assembler";

// ── Constants ─────────────────────────────────────────────────

const TRIGGER_PRODUCTS = ["videoforge", "winner studio", "character-in-a-box"];
const SORA_COST_PER_SCENE = 1.00; // 10s 1080p Sora 2 Pro = $1.00
const POLL_INTERVAL_MS = 15_000; // 15s
const POLL_TIMEOUT_MS = 10 * 60 * 1000; // 10 min
const MIN_SCENES_TO_PROCEED = 3;
const TOTAL_SCENES = 5;

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
        const idx = scenes.length;
        scenes.splice(scenes.length - 1, 0, {
            prompt: `${handle} in a dynamic brand moment, ${style} aesthetic, professional setting.`,
            shotType: "dialogue",
        });
        // Move the auto closer to remain last — insert before last element
        if (scenes.length >= TOTAL_SCENES) break;
        logger.info({ msg: "character-video-gen: padded scene", idx, tenantId: "unknown" });
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
}): Promise<string> {
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
            return pollResult.resultUrl;
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
        let resultUrl: string | null = null;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                resultUrl = await generateScene({
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
                    // Both attempts failed — skip this scene
                    logger.error({
                        msg: "character-video-gen: scene permanently failed after retry",
                        sceneIndex: i,
                        error: err.message,
                    });
                }
            }
        }

        if (!resultUrl) return null;

        // Download to /tmp
        const localDir = `/tmp/character-video/${tenantId}`;
        const localPath = path.join(localDir, `scene-${i}.mp4`);

        try {
            await downloadVideo(resultUrl, localPath);
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

        // Track cost
        await trackExpense({
            service: "kie.ai",
            operation: "sora-2-pro",
            estimatedCost: SORA_COST_PER_SCENE,
            jobId: params.pipelineRunId,
            metadata: { tenantId, sceneIndex: i, r2Key },
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

            // ── awaiting-composition: scenes done, composition next ──
            case "awaiting-composition": {
                return {
                    handled: true,
                    response:
                        "Your reveal video is being composed! " +
                        "The final video will be delivered to you shortly.",
                    moduleType: "character-video-gen",
                    completed: true,
                };
            }

            // ── complete: module done ──
            case "complete": {
                return {
                    handled: true,
                    response: "Your character video generation is complete! Check your delivered video.",
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

    // Enough scenes — proceed to awaiting-composition
    logger.info({
        msg: "character-video-gen: generation complete",
        successCount: sceneResults.length,
        totalCostCents,
        tenantId,
        pipelineRunId,
    });

    await updatePipelineRun(pipelineRunId, {
        status: "completed",
        outputJson: {
            sceneUrls,
            successCount: sceneResults.length,
            characterName: bible.name,
        },
        costCents: totalCostCents,
        durationMs,
        modelUsed: "sora-2-pro-text-to-video",
    });

    // Store scene URLs in module state and advance
    const completionData = {
        ...data,
        sceneUrls,
        pipelineRunId,
        characterName: bible.name,
        generatedAt: new Date().toISOString(),
    };

    await upsertModuleState(groupId, tenantId, "character-video-gen", "awaiting-composition", completionData);

    logger.info({
        msg: "character-video-gen: module advanced to awaiting-composition",
        sceneCount: sceneUrls.length,
        tenantId,
    });
}
