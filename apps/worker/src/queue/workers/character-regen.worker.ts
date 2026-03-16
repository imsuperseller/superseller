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
import { sendText, sendVideo, sendPoll } from "../../services/waha-client";
import { trackExpense, normalizeProvider, COST_RATES } from "../../services/expense-tracker";
import { createPipelineRun, updatePipelineRun } from "../../services/pipeline-run";
import { sendAdminAlert } from "../../services/admin-alerts";
import { uploadToR2 } from "../../services/r2";
import { renderComposition } from "../../services/remotion-renderer";

export let characterRegenWorker: Worker<CharacterRegenJobData>;

async function processCharacterRegen(job: Job<CharacterRegenJobData>): Promise<void> {
    const { changeRequestId, sceneIndex, tenantId, groupId } = job.data;

    // Derive the list of scene indices to process (multi-scene Phase 18 vs single-scene Phase 17)
    const affectedIndices: number[] = job.data.affectedSceneIndices ?? [sceneIndex];
    const isMultiScene = affectedIndices.length > 1;

    logger.info({
        msg: "character-regen: job started",
        changeRequestId,
        sceneIndex,
        affectedIndices,
        isMultiScene,
        tenantId,
        groupId,
        jobId: job.id,
    });

    const startMs = Date.now();
    let pipelineRunId: string | null = null;
    let sceneStatuses: string[] = [];
    let tmpDir: string | null = null;
    let totalCostCents = 0;

    try {
        // Step 1: Mark in-progress + send ack (REGEN-03 message 1 of 2)
        await updateChangeRequestStatus(changeRequestId, "in-progress");
        const ackMsg = isMultiScene
            ? `Regenerating ${affectedIndices.length} scenes with your character updates... You'll receive the updated video shortly.`
            : `Regenerating scene ${sceneIndex + 1}... You'll receive the updated video shortly.`;
        await sendText(groupId, ackMsg);

        // Step 2: Create PipelineRun
        pipelineRunId = await createPipelineRun({
            tenantId,
            pipelineType: "character-regen",
            status: "running",
            inputJson: { groupId, changeRequestId, sceneIndex, affectedIndices, characterBibleId: job.data.characterBibleId },
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

        // Step 4: Validate all scene indices are in bounds
        for (const idx of affectedIndices) {
            if (idx < 0 || idx >= sceneUrls.length) {
                await updateChangeRequestStatus(changeRequestId, "failed");
                await sendAdminAlert({
                    error: `character-regen: invalid sceneIndex ${idx} for ${sceneUrls.length} scenes`,
                    module: "character-regen",
                    groupId,
                });
                await sendText(groupId, "Sorry, we encountered an error processing your change request. Our team has been notified.");
                await updatePipelineRun(pipelineRunId, { status: "failed", durationMs: Date.now() - startMs });
                return;
            }
        }

        // Step 5: Mark all affected scenes as pending in module state
        for (const idx of affectedIndices) {
            sceneStatuses[idx] = "pending";
        }
        await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
            ...state.collectedData,
            sceneStatuses,
        });

        // Step 6: Load CharacterBible + build ALL scene prompts once
        const bible = await getLatestCharacterBible(tenantId);
        if (!bible) {
            throw new Error(`No CharacterBible found for tenant ${tenantId}`);
        }
        // buildScenePrompts expects the same fields that CharacterBibleRow from character-bible-versioning provides
        const scenePrompts = buildScenePrompts(bible as any);

        // Create tmpDir before the loop — collects temp files for all scenes
        tmpDir = path.join(os.tmpdir(), `character-regen-${tenantId}-${Date.now()}`);
        fs.mkdirSync(tmpDir, { recursive: true });

        // Step 7: Loop over all affected scene indices, generate + upload each
        for (const idx of affectedIndices) {
            const targetPrompt = scenePrompts[idx];
            if (!targetPrompt) {
                throw new Error(`No scene prompt at index ${idx}`);
            }

            // Generate scene with retry (2 attempts, matching character-video-gen pattern)
            let sceneOutput: { resultUrl: string; provider: string } | null = null;

            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    sceneOutput = await generateScene({
                        tenantId,
                        sceneIndex: idx,
                        prompt: targetPrompt.prompt,
                        shotType: targetPrompt.shotType,
                    });
                    break;
                } catch (err: any) {
                    logger.warn({
                        msg: "character-regen: scene generation attempt failed",
                        attempt: attempt + 1,
                        sceneIndex: idx,
                        error: err.message,
                    });
                    if (attempt === 1) {
                        // Terminal failure — revert ALL affected scene statuses and fail the job
                        const durationMs = Date.now() - startMs;
                        for (const revertIdx of affectedIndices) {
                            sceneStatuses[revertIdx] = "approved";  // Revert to previous approved state
                        }
                        await upsertModuleState(groupId, tenantId, "character-video-gen", "delivered", {
                            ...state.collectedData,
                            sceneStatuses,
                        });
                        await updateChangeRequestStatus(changeRequestId, "failed");
                        if (pipelineRunId) {
                            await updatePipelineRun(pipelineRunId, { status: "failed", durationMs });
                        }
                        await sendAdminAlert({
                            error: `character-regen: scene ${idx} generation failed after 2 attempts: ${err.message}`,
                            module: "character-regen",
                            groupId,
                        });
                        await sendText(groupId, "Something went wrong regenerating your scenes. Our team will follow up.");
                        throw err; // Fail the job — no partial regen recovery
                    }
                }
            }

            // Download the generated video from the provider URL
            const localPath = path.join(tmpDir, `scene-${idx}.mp4`);
            const dlResponse = await fetch(sceneOutput!.resultUrl);
            if (!dlResponse.ok) throw new Error(`Failed to download regen scene ${idx}: ${dlResponse.status}`);
            const buffer = Buffer.from(await dlResponse.arrayBuffer());
            fs.writeFileSync(localPath, buffer);

            const r2Key = `character-videos/${tenantId}/scene-${idx}.mp4`;
            const newSceneUrl = await uploadToR2(localPath, r2Key, "video/mp4", {
                tenantId,
                type: "character-video-scene",
                filename: `scene-${idx}.mp4`,
                metadata: {
                    sceneIndex: idx,
                    shotType: targetPrompt.shotType,
                    pipelineRunId,
                    isRegen: true,
                    changeRequestId,
                },
            });

            // Track generation cost per scene
            const providerKey = normalizeProvider(sceneOutput!.provider);
            const costDollarsScene = COST_RATES[providerKey]?.sora_2_scene_1080p ?? COST_RATES.fal?.sora_2_scene_1080p ?? 1.00;
            const costCentsScene = Math.round(costDollarsScene * 100);
            totalCostCents += costCentsScene;
            await trackExpense({
                service: providerKey,
                operation: "character-regen-scene",
                estimatedCost: costDollarsScene,
                metadata: { changeRequestId, sceneIndex: idx, pipelineRunId, tenantId },
            });

            // Update sceneUrls + sceneStatuses for this index
            sceneUrls[idx] = newSceneUrl;
            sceneStatuses[idx] = "approved";
        }

        // Step 11: Re-render Remotion CharacterReveal with updated scenes
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
        const caption = isMultiScene
            ? `Your updated character reveal video is ready! ${affectedIndices.length} scenes have been regenerated.`
            : `Your updated character reveal video is ready! Scene ${sceneIndex + 1} has been regenerated.`;
        await sendVideo(groupId, newRevealUrl, caption);

        // Post-delivery approve/change poll (ASSEM-02)
        const approvalPollId = await sendPoll(
            groupId,
            "Happy with your updated character?",
            ["Yes, I love it!", "Request more changes"],
        );
        if (approvalPollId) {
            logger.info({
                msg: "character-regen: post-delivery approval poll sent",
                groupId,
                changeRequestId,
                pollId: approvalPollId,
            });
        }

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
            outputJson: { newRevealUrl, affectedIndices, sceneIndex },
            costCents: totalCostCents,
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

        // Revert sceneStatuses on unhandled error — revert ALL affected indices
        const indicesToRevert = affectedIndices.filter((idx) => sceneStatuses[idx] === "pending");
        if (indicesToRevert.length > 0) {
            for (const idx of indicesToRevert) {
                sceneStatuses[idx] = "approved";
            }
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
