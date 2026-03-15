import { Worker, Job } from "bullmq";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { redisConnection } from "../connection";
import { CharacterRegenJobData } from "../queues";
import { logger } from "../../utils/logger";
import { generateScene, buildScenePrompts } from "../../services/onboarding/modules/character-video-gen";
import { getModuleState, upsertModuleState } from "../../services/onboarding/module-state";
import { updateChangeRequestStatus } from "../../services/onboarding/change-request-intake";
import { getLatestCharacterBible } from "../../services/onboarding/character-bible-versioning";
import { sendText, sendVideo } from "../../services/waha-client";
import { trackExpense, normalizeProvider, COST_RATES } from "../../services/expense-tracker";
import { createPipelineRun, updatePipelineRun } from "../../services/pipeline-run";
import { sendAdminAlert } from "../../services/admin-alerts";
import { uploadToR2 } from "../../services/r2";
import { renderComposition } from "../../services/remotion-renderer";

export let characterRegenWorker: Worker<CharacterRegenJobData>;

async function processCharacterRegen(job: Job<CharacterRegenJobData>): Promise<void> {
    const { changeRequestId, sceneIndex, tenantId, groupId } = job.data;

    logger.info({
        msg: "character-regen: job started",
        changeRequestId,
        sceneIndex,
        tenantId,
        groupId,
        jobId: job.id,
    });

    const startMs = Date.now();
    let pipelineRunId: string | null = null;
    let sceneStatuses: string[] = [];
    let tmpDir: string | null = null;

    try {
        // Step 1: Mark in-progress + send ack (REGEN-03 message 1 of 2)
        await updateChangeRequestStatus(changeRequestId, "in-progress");
        await sendText(groupId, `Regenerating scene ${sceneIndex + 1}... You'll receive the updated video shortly.`);

        // Step 2: Create PipelineRun
        pipelineRunId = await createPipelineRun({
            tenantId,
            pipelineType: "character-regen",
            status: "running",
            inputJson: { groupId, changeRequestId, sceneIndex, characterBibleId: job.data.characterBibleId },
            modelUsed: "sora-2-pro-text-to-video",
        });

        // Step 3: Load module state + sceneStatuses (with fallback for pre-Phase-17 tenants)
        const state = await getModuleState(groupId, "character-video-gen");
        if (!state || !state.collectedData?.sceneUrls) {
            throw new Error(`No module state found for group ${groupId}`);
        }
        const sceneUrls: string[] = [...state.collectedData.sceneUrls];
        sceneStatuses = state.collectedData.sceneStatuses
            ?? sceneUrls.map(() => "approved");  // Fallback for pre-Phase-17 tenants

        // Step 4: Validate sceneIndex bounds
        if (sceneIndex < 0 || sceneIndex >= sceneUrls.length) {
            await updateChangeRequestStatus(changeRequestId, "failed");
            await sendAdminAlert({
                error: `character-regen: invalid sceneIndex ${sceneIndex} for ${sceneUrls.length} scenes`,
                module: "character-regen",
                groupId,
            });
            await sendText(groupId, "Sorry, we encountered an error processing your change request. Our team has been notified.");
            await updatePipelineRun(pipelineRunId, { status: "failed", durationMs: Date.now() - startMs });
            return;
        }

        // Step 5: Mark scene as pending in module state
        sceneStatuses[sceneIndex] = "pending";
        await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
            ...state.collectedData,
            sceneStatuses,
        });

        // Step 6: Load CharacterBible + build scene prompt
        const bible = await getLatestCharacterBible(tenantId);
        if (!bible) {
            throw new Error(`No CharacterBible found for tenant ${tenantId}`);
        }
        // buildScenePrompts expects the same fields that CharacterBibleRow from character-bible-versioning provides
        const scenePrompts = buildScenePrompts(bible as any);
        const targetPrompt = scenePrompts[sceneIndex];
        if (!targetPrompt) {
            throw new Error(`No scene prompt at index ${sceneIndex}`);
        }

        // Step 7: Generate scene with retry (2 attempts, matching character-video-gen pattern)
        let sceneOutput: { resultUrl: string; provider: string } | null = null;

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                sceneOutput = await generateScene({
                    tenantId,
                    sceneIndex,
                    prompt: targetPrompt.prompt,
                    shotType: targetPrompt.shotType,
                });
                break;
            } catch (err: any) {
                logger.warn({
                    msg: "character-regen: scene generation attempt failed",
                    attempt: attempt + 1,
                    sceneIndex,
                    error: err.message,
                });
                if (attempt === 1) {
                    // Terminal failure — revert scene status
                    const durationMs = Date.now() - startMs;
                    sceneStatuses[sceneIndex] = "approved";  // Revert to previous approved state
                    await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
                        ...state.collectedData,
                        sceneStatuses,
                    });
                    await updateChangeRequestStatus(changeRequestId, "failed");
                    await updatePipelineRun(pipelineRunId, { status: "failed", durationMs });
                    await sendAdminAlert({
                        error: `character-regen: scene generation failed after 2 attempts: ${err.message}`,
                        module: "character-regen",
                        groupId,
                    });
                    await sendText(groupId, "Sorry, we encountered an issue regenerating your scene. Our team has been notified and will follow up.");
                    return;
                }
            }
        }

        // Step 8: Download generated video + upload to R2 (overwrite existing scene file)
        tmpDir = path.join(os.tmpdir(), `character-regen-${tenantId}-${Date.now()}`);
        fs.mkdirSync(tmpDir, { recursive: true });
        const localPath = path.join(tmpDir, `scene-${sceneIndex}.mp4`);

        // Download the generated video from the provider URL
        const response = await fetch(sceneOutput!.resultUrl);
        if (!response.ok) throw new Error(`Failed to download regen scene: ${response.status}`);
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(localPath, buffer);

        const r2Key = `character-videos/${tenantId}/scene-${sceneIndex}.mp4`;
        const newSceneUrl = await uploadToR2(localPath, r2Key, "video/mp4", {
            tenantId,
            type: "character-video-scene",
            filename: `scene-${sceneIndex}.mp4`,
            metadata: {
                sceneIndex,
                shotType: targetPrompt.shotType,
                pipelineRunId,
                isRegen: true,
                changeRequestId,
            },
        });

        // Step 9: Track generation cost
        const providerKey = normalizeProvider(sceneOutput!.provider);
        const costDollars = COST_RATES[providerKey]?.sora_2_scene_1080p ?? COST_RATES.fal?.sora_2_scene_1080p ?? 1.00;
        const costCents = Math.round(costDollars * 100);
        await trackExpense({
            service: providerKey,
            operation: "character-regen-scene",
            estimatedCost: costDollars,
            metadata: { changeRequestId, sceneIndex, pipelineRunId, tenantId },
        });

        // Step 10: Update sceneUrls + sceneStatuses
        sceneUrls[sceneIndex] = newSceneUrl;
        sceneStatuses[sceneIndex] = "approved";

        // Step 11: Re-render Remotion CharacterReveal with mixed scenes
        // Use R2 URLs directly for all scenes (Remotion OffthreadVideo fetches from URLs during render)
        const brand = bible.metadata?.brand ?? {};
        const sceneLabels = bible.metadata?.scenario_names ?? sceneUrls.map((_, i) => `Scene ${i + 1}`);

        const revealProps = {
            characterName: bible.name,
            businessName: brand.businessName ?? "",
            tagline: bible.personaDescription
                ? bible.personaDescription.length > 50
                    ? bible.personaDescription.substring(0, 50) + "..."
                    : bible.personaDescription
                : "",
            accentColor: brand.accentColor ?? "#C9A96E",
            bgColor: "#0A0A0A",
            logoUrl: brand.logoUrl ?? undefined,
            sceneClips: sceneUrls,   // Mixed: N-1 original R2 URLs + 1 new R2 URL
            sceneLabels,
        };

        const revealTimestamp = Date.now();
        const revealR2Key = `character-videos/${tenantId}/reveal-${revealTimestamp}.mp4`;
        const revealOutputPath = path.join(tmpDir, "reveal.mp4");

        const renderResult = await renderComposition({
            compositionId: "CharacterReveal-16x9",
            inputProps: revealProps as unknown as Record<string, unknown>,
            outputPath: revealOutputPath,
            concurrency: 2,
            crf: 20,
        });

        // Upload the rendered reveal video to R2
        const newRevealUrl = await uploadToR2(renderResult.outputPath, revealR2Key, "video/mp4", {
            tenantId,
            type: "video",
            filename: "character-reveal.mp4",
            metadata: { description: "AI Character Reveal Video (regen)", changeRequestId },
        });

        // Step 12: Deliver video via WhatsApp (REGEN-03 message 2 of 2)
        const caption = `Your updated character reveal video is ready! Scene ${sceneIndex + 1} has been regenerated.`;
        await sendVideo(groupId, newRevealUrl, caption);

        // Step 13: Update module state with new sceneUrls + revealUrl + sceneStatuses
        await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
            ...state.collectedData,
            sceneUrls,
            sceneStatuses,
            revealUrl: newRevealUrl,
        });

        // Step 14: Update change request status + PipelineRun
        const durationMs = Date.now() - startMs;
        await updateChangeRequestStatus(changeRequestId, "completed");
        await updatePipelineRun(pipelineRunId, {
            status: "completed",
            outputJson: { newSceneUrl, newRevealUrl, sceneIndex },
            costCents,
            durationMs,
        });

        logger.info({
            msg: "character-regen: job completed successfully",
            changeRequestId,
            sceneIndex,
            tenantId,
            groupId,
            durationMs,
        });

    } catch (err: any) {
        logger.error({
            msg: "character-regen: unhandled error",
            changeRequestId,
            sceneIndex,
            tenantId,
            groupId,
            error: err.message,
            stack: err.stack,
        });

        // Revert sceneStatuses on unhandled error
        if (sceneStatuses.length > sceneIndex && sceneStatuses[sceneIndex] === "pending") {
            sceneStatuses[sceneIndex] = "approved";
            try {
                const state = await getModuleState(groupId, "character-video-gen");
                if (state?.collectedData) {
                    await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
                        ...state.collectedData,
                        sceneStatuses,
                    });
                }
            } catch (revertErr: any) {
                logger.warn({ msg: "character-regen: failed to revert sceneStatuses", error: revertErr.message });
            }
        }

        await updateChangeRequestStatus(changeRequestId, "failed").catch(() => {});
        if (pipelineRunId) {
            await updatePipelineRun(pipelineRunId, {
                status: "failed",
                errorMessage: err.message,
                durationMs: Date.now() - startMs,
            }).catch(() => {});
        }
        await sendAdminAlert({
            error: `character-regen failed: ${err.message}`,
            module: "character-regen",
            groupId,
        }).catch(() => {});
        await sendText(groupId, "Sorry, we encountered an error processing your change request. Our team has been notified.").catch(() => {});

        throw err; // Re-throw so BullMQ marks the job as failed
    } finally {
        // Step 15: Cleanup /tmp
        if (tmpDir) {
            try {
                fs.rmSync(tmpDir, { recursive: true, force: true });
            } catch (e: any) {
                logger.warn({ msg: "character-regen: /tmp cleanup failed (non-critical)", error: e.message });
            }
        }
    }
}

export async function initCharacterRegenWorker(): Promise<void> {
    characterRegenWorker = new Worker<CharacterRegenJobData>(
        "character-regen",
        async (job) => processCharacterRegen(job),
        {
            connection: redisConnection,
            concurrency: 2,
        },
    );

    characterRegenWorker.on("failed", (job, err) => {
        logger.error({
            msg: "character-regen: job failed",
            jobId: job?.id,
            changeRequestId: job?.data?.changeRequestId,
            error: err.message,
        });
    });

    characterRegenWorker.on("completed", (job) => {
        logger.info({
            msg: "character-regen: job completed",
            jobId: job?.id,
            changeRequestId: job?.data?.changeRequestId,
        });
    });

    logger.info({ msg: "character-regen worker initialized" });
}
