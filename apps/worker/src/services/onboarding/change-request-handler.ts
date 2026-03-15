/**
 * change-request-handler.ts -- Orchestrator for post-delivery change request intake
 *
 * Classifies incoming customer messages after video delivery, routes by intent:
 *   - scene-change / character-change: send cost-estimate poll
 *   - positive-feedback: send thank-you text, keep change window open
 *   - unrelated: return handled:false (ClaudeClaw handles it)
 *   - ambiguous: send clarifying question
 *
 * On confirmed poll vote:
 *   - Yes + character-change: create new CharacterBible version, set status=confirmed
 *   - Yes + scene-change: set status=confirmed (no bible version needed)
 *   - No: set status=rejected, send acknowledgment
 *
 * Phase 17 picks up from status=confirmed to dispatch generation.
 *
 * Used by: character-video-gen.ts (delivered phase case)
 *          claudeclaw.worker.ts (poll vote disambiguation)
 */

import { logger } from "../../utils/logger";
import { classifyChangeRequest } from "./intent-classifier";
import { getLatestCharacterBible, createCharacterBibleVersion } from "./character-bible-versioning";
import {
    createChangeRequest,
    updateChangeRequestStatus,
    getPendingChangeRequest,
    estimateChangeCost,
} from "./change-request-intake";
import { sendText, sendPoll } from "../waha-client";
import { sendAdminAlert } from "../admin-alerts";
import type { ModuleHandleResult, ModuleState } from "./modules/types";

// ── Types ─────────────────────────────────────────────────────

export interface HandleChangeRequestParams {
    groupId: string;
    tenantId: string;
    messageBody: string;
    state: ModuleState;
}

export interface HandleChangeRequestPollVoteParams {
    groupId: string;
    tenantId: string;
    selectedOption: string;
    changeRequestId: string;
}

// ── Main Entry: handleChangeRequest ───────────────────────────

/**
 * Called from character-video-gen.ts "delivered" phase case.
 * Classifies the incoming message and routes by intent.
 */
export async function handleChangeRequest(
    params: HandleChangeRequestParams,
): Promise<ModuleHandleResult> {
    const { groupId, tenantId, messageBody } = params;

    try {
        // Fetch latest CharacterBible for scene context
        const bible = await getLatestCharacterBible(tenantId);
        const scenarioNames: string[] = bible?.metadata?.scenario_names ?? [];
        const sceneCount: number = bible?.metadata?.scene_count ?? 5;

        // Classify the intent
        const classification = await classifyChangeRequest(messageBody, scenarioNames, sceneCount);

        logger.info({
            msg: "change-request-handler: classified",
            groupId,
            tenantId,
            intent: classification.intent,
            sceneNumber: classification.sceneNumber,
        });

        // Persist the change request row (for all intents — provides audit trail)
        const crId = await createChangeRequest({
            groupId,
            tenantId,
            messageBody,
            intent: classification.intent,
            scope:
                classification.intent === "scene-change"
                    ? "scene"
                    : classification.intent === "character-change"
                      ? "character"
                      : null,
            sceneNumber: classification.sceneNumber,
            changeSummary: classification.changeSummary,
        });

        // Route by intent
        switch (classification.intent) {
            case "scene-change": {
                // If no sceneNumber resolved, treat as ambiguous
                if (classification.sceneNumber === null) {
                    const question =
                        classification.clarifyingQuestion ??
                        "Which scene would you like changed? (e.g. scene 1, scene 3)";
                    await sendText(groupId, question);
                    return { handled: true };
                }

                const sceneNumber = classification.sceneNumber;
                const costCents = estimateChangeCost("scene-change", 1);
                const costDollars = (costCents / 100).toFixed(2);

                // Update row with cost estimate
                await updateChangeRequestStatus(crId, "awaiting-confirmation", {
                    estimatedCostCents: costCents,
                });

                // Send cost-estimate poll
                const pollMessageId = await sendPoll(
                    groupId,
                    `Regenerating scene ${sceneNumber} will cost $${costDollars}. Proceed?`,
                    ["Yes", "No"],
                );

                // Store poll message ID
                if (pollMessageId) {
                    await updateChangeRequestStatus(crId, "awaiting-confirmation", {
                        estimatedCostCents: costCents,
                        pollMessageId,
                    });
                }

                logger.info({
                    msg: "change-request-handler: scene-change poll sent",
                    groupId,
                    crId,
                    sceneNumber,
                    costCents,
                });

                return { handled: true };
            }

            case "character-change": {
                const costCents = estimateChangeCost("character-change", sceneCount);
                const costDollars = (costCents / 100).toFixed(2);

                // Update row with cost estimate
                await updateChangeRequestStatus(crId, "awaiting-confirmation", {
                    estimatedCostCents: costCents,
                });

                // Send cost-estimate poll
                const pollMessageId = await sendPoll(
                    groupId,
                    `Updating the character appearance requires regenerating all ${sceneCount} scenes ($${costDollars} total). Proceed?`,
                    ["Yes", "No"],
                );

                // Store poll message ID
                if (pollMessageId) {
                    await updateChangeRequestStatus(crId, "awaiting-confirmation", {
                        estimatedCostCents: costCents,
                        pollMessageId,
                    });
                }

                logger.info({
                    msg: "change-request-handler: character-change poll sent",
                    groupId,
                    crId,
                    sceneCount,
                    costCents,
                });

                return { handled: true };
            }

            case "positive-feedback": {
                await sendText(
                    groupId,
                    "Thank you! Glad you like it. If you'd like any changes, just describe what you'd like different.",
                );
                // Keep change window open — do NOT transition phase
                return { handled: true };
            }

            case "unrelated": {
                // Fall through to ClaudeClaw for normal chat handling
                return { handled: false };
            }

            case "ambiguous": {
                const question =
                    classification.clarifyingQuestion ??
                    "Could you describe what you'd like changed?";
                await sendText(groupId, question);
                return { handled: true };
            }

            default: {
                // Defensive: treat unknown intent as unrelated
                return { handled: false };
            }
        }
    } catch (err: any) {
        logger.error({
            msg: "change-request-handler: handleChangeRequest error",
            groupId,
            tenantId,
            error: err.message,
        });

        await sendAdminAlert({
            error: `handleChangeRequest failed: ${err.message}`,
            module: "change-request-handler",
            groupId,
        });

        return {
            handled: true,
            response:
                "Something went wrong processing your request. Our team will follow up.",
        };
    }
}

// ── Poll Vote Handler: handleChangeRequestPollVote ─────────────

/**
 * Called from claudeclaw.worker.ts when a poll vote is for a change request.
 * Confirmed Yes: sets status=confirmed, creates CharacterBible version for character-changes.
 * No: sets status=rejected, sends acknowledgment.
 * Does NOT dispatch to any BullMQ queue — Phase 17 handles generation.
 */
export async function handleChangeRequestPollVote(
    params: HandleChangeRequestPollVoteParams,
): Promise<void> {
    const { groupId, tenantId, selectedOption, changeRequestId } = params;

    try {
        // Load the pending change request to check intent
        const cr = await getPendingChangeRequest(groupId);

        if (!cr) {
            logger.warn({
                msg: "change-request-handler: handleChangeRequestPollVote — no pending request found",
                groupId,
                changeRequestId,
            });
            return;
        }

        const isYes = selectedOption.trim().toLowerCase() === "yes";
        const isNo = selectedOption.trim().toLowerCase() === "no";

        if (isYes) {
            // Confirm the change request
            await updateChangeRequestStatus(changeRequestId, "confirmed");

            // For character-change: create a new CharacterBible version
            if (cr.intent === "character-change") {
                const versionId = await createCharacterBibleVersion(
                    tenantId,
                    {},
                    {
                        requestedChange: {
                            from: "current",
                            to: cr.change_summary ?? "customer-requested change",
                        },
                    },
                );

                if (versionId) {
                    await updateChangeRequestStatus(changeRequestId, "confirmed", {
                        characterBibleVersionId: versionId,
                    });

                    logger.info({
                        msg: "change-request-handler: character-change confirmed, bible version created",
                        groupId,
                        changeRequestId,
                        versionId,
                    });
                } else {
                    logger.warn({
                        msg: "change-request-handler: createCharacterBibleVersion returned null",
                        groupId,
                        changeRequestId,
                    });
                }
            }

            // For scene-change: no CharacterBible version needed
            if (cr.intent === "scene-change") {
                logger.info({
                    msg: "change-request-handler: scene-change confirmed",
                    groupId,
                    changeRequestId,
                    sceneNumber: cr.scene_number,
                });
            }

            // NOTE: Do NOT dispatch to any BullMQ queue here — Phase 17 will add character-regen queue dispatch
            await sendText(
                groupId,
                "Change request confirmed! We'll start working on it shortly.",
            );

            logger.info({
                msg: "change-request-handler: change request confirmed",
                groupId,
                changeRequestId,
                intent: cr.intent,
            });
        } else if (isNo) {
            await updateChangeRequestStatus(changeRequestId, "rejected");
            await sendText(
                groupId,
                "No problem! Your current video stays as-is. Send another message anytime if you'd like changes.",
            );

            logger.info({
                msg: "change-request-handler: change request rejected",
                groupId,
                changeRequestId,
            });
        } else {
            // Unknown poll option — log and ignore
            logger.warn({
                msg: "change-request-handler: unrecognized poll option, ignoring",
                groupId,
                changeRequestId,
                selectedOption,
            });
        }
    } catch (err: any) {
        logger.error({
            msg: "change-request-handler: handleChangeRequestPollVote error",
            groupId,
            changeRequestId,
            error: err.message,
        });

        await sendAdminAlert({
            error: `handleChangeRequestPollVote failed: ${err.message}`,
            module: "change-request-handler",
            groupId,
        });
    }
}
