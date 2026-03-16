/**
 * character-level-changes.ts -- Character-level change business logic
 *
 * Provides field classification, admin review/approval handlers, and name-only shortcut
 * for character change requests (Phase 18 — Character Iteration).
 *
 * Exports:
 *   classifyChangeDelta         — classify visual vs non-visual changed fields
 *   sendAdminCharacterChangeReview — send diff + 3-option poll to admin for approval
 *   handleAdminCharacterApprovalPollVote — dispatch regen / deny / request scene selection
 *   handleAdminSceneSelectionText — parse admin's scene number reply for partial regen
 *   handleNameOnlyChange        — re-deliver existing video at $0 cost for name-only changes
 */

import { config } from "../../config";
import { logger } from "../../utils/logger";
import { phoneToChatId, sendText, sendPoll, sendVideo } from "../waha-client";
import {
    updateChangeRequestStatus,
    getPendingAdminApprovalRequest,
} from "./change-request-intake";
import { characterRegenQueue } from "../../queue/queues";

// ── Constants ─────────────────────────────────────────────────────

/**
 * Fields whose change triggers full multi-scene video regeneration.
 * Any unknown field is treated as visual (safe default — see Pitfall 5).
 */
const VISUAL_FIELDS = new Set(["visualStyle", "soraHandle"]);

/**
 * Fields that only affect text/metadata — no video regeneration needed.
 */
const NON_VISUAL_FIELDS = new Set(["name", "personaDescription"]);

/** Total number of scenes per character video (fixed at 5 per product spec). */
const TOTAL_SCENE_COUNT = 5;

/** All 5 scene indices (0-based) for full multi-scene regen. */
const ALL_SCENE_INDICES: number[] = [0, 1, 2, 3, 4];

// ── Types ──────────────────────────────────────────────────────────

export interface ClassifyChangeDeltaResult {
    hasVisualChanges: boolean;
    affectedSceneCount: number;
    changedFields: string[];
}

export interface SendAdminCharacterChangeReviewParams {
    groupId: string;
    tenantId: string;
    changeRequestId: string;
    changeDelta: Record<string, any>;
    customerName: string;
    affectedSceneCount: number;
    costDollars: number;
}

export interface HandleAdminCharacterApprovalPollVoteParams {
    pollOption: string;
    adminChatId: string;
}

export interface HandleAdminSceneSelectionTextParams {
    messageBody: string;
    adminChatId: string;
}

export interface HandleNameOnlyChangeParams {
    groupId: string;
    changeRequestId: string;
    revealUrl: string;
    newName: string;
}

// ── classifyChangeDelta ────────────────────────────────────────────

/**
 * Classify a changeDelta record to determine whether visual field changes are present.
 *
 * Rules:
 * - If any key is in VISUAL_FIELDS → hasVisualChanges = true
 * - If any key is NOT in NON_VISUAL_FIELDS (i.e., unknown field) → hasVisualChanges = true (safe default)
 * - If ALL keys are in NON_VISUAL_FIELDS → hasVisualChanges = false
 * - Empty delta → hasVisualChanges = false
 */
export function classifyChangeDelta(changeDelta: Record<string, any>): ClassifyChangeDeltaResult {
    const changedFields = Object.keys(changeDelta);

    if (changedFields.length === 0) {
        return { hasVisualChanges: false, affectedSceneCount: 0, changedFields: [] };
    }

    // Determine if any field is visual or unknown (safe default: treat as visual)
    const hasVisualChanges = changedFields.some(
        (field) => !NON_VISUAL_FIELDS.has(field),
    );

    return {
        hasVisualChanges,
        affectedSceneCount: hasVisualChanges ? TOTAL_SCENE_COUNT : 0,
        changedFields,
    };
}

// ── sendAdminCharacterChangeReview ─────────────────────────────────

/**
 * Send a text diff + 3-option approval poll to admin for a character change request.
 * Updates the change_request status to 'pending-admin-approval' with the poll message ID.
 *
 * Returns the poll message ID on success, null on failure.
 */
export async function sendAdminCharacterChangeReview(
    params: SendAdminCharacterChangeReviewParams,
): Promise<string | null> {
    const { groupId, tenantId, changeRequestId, changeDelta, customerName, affectedSceneCount, costDollars } = params;

    const adminPhone = config.admin.defaultPhone;
    if (!adminPhone) {
        logger.warn({
            msg: "sendAdminCharacterChangeReview: no admin phone configured",
            changeRequestId,
            tenantId,
        });
        return null;
    }

    const adminChatId = phoneToChatId(adminPhone);

    // Build text diff
    const fieldLines = Object.entries(changeDelta).map(([field, change]) => {
        const from = change?.from ?? "(unknown)";
        const to = change?.to ?? "(unknown)";
        return `  * ${field}: "${from}" -> "${to}"`;
    });

    const diffText = [
        "--- Character Change Request ---",
        "",
        `Customer: ${customerName}`,
        `Change request ID: ${changeRequestId}`,
        "",
        "Changed fields:",
        ...fieldLines,
        "",
        `Affected scenes: ${affectedSceneCount}`,
        `Estimated cost: $${costDollars}`,
        "",
        "Please review and respond with your decision:",
    ].join("\n");

    await sendText(adminChatId, diffText);

    // Send approval poll with 3 options
    const pollQuestion = `Approve character change for ${customerName}?`;
    const pollOptions = [
        `Approve all ${affectedSceneCount} scenes`,
        "Deny",
        "Select specific scenes",
    ];

    const pollMessageId = await sendPoll(adminChatId, pollQuestion, pollOptions);

    if (!pollMessageId) {
        logger.error({
            msg: "sendAdminCharacterChangeReview: sendPoll failed",
            changeRequestId,
            adminChatId,
        });
        return null;
    }

    // Update CR to pending-admin-approval
    await updateChangeRequestStatus(changeRequestId, "pending-admin-approval", {
        adminApprovalPollId: pollMessageId,
    });

    logger.info({
        msg: "sendAdminCharacterChangeReview: admin review sent",
        changeRequestId,
        pollMessageId,
        customerName,
    });

    return pollMessageId;
}

// ── handleAdminCharacterApprovalPollVote ───────────────────────────

/**
 * Handle admin's poll vote on a pending character change approval.
 *
 * Options:
 *   "Approve all N scenes" → dispatch characterRegenQueue with all 5 scene indices
 *   "Deny"                  → update status to admin-denied, notify customer
 *   "Select specific scenes" → transition to pending-scene-selection, ask admin for numbers
 *
 * Returns true if handled, false if no pending request or unrecognized option.
 */
export async function handleAdminCharacterApprovalPollVote(
    params: HandleAdminCharacterApprovalPollVoteParams,
): Promise<boolean> {
    const { pollOption, adminChatId } = params;

    const cr = await getPendingAdminApprovalRequest();
    if (!cr) {
        logger.warn({ msg: "handleAdminCharacterApprovalPollVote: no pending-admin-approval request found" });
        return false;
    }

    const { id: changeRequestId, group_id: groupId, tenant_id: tenantId, character_bible_version_id: characterBibleId } = cr;

    if (pollOption.startsWith("Approve all")) {
        // Full multi-scene regen
        await updateChangeRequestStatus(changeRequestId, "admin-approved", {
            estimatedCostCents: cr.estimated_cost_cents ?? undefined,
        });

        await characterRegenQueue.add("regen-character", {
            changeRequestId,
            sceneIndex: 0,
            tenantId,
            groupId,
            characterBibleId: characterBibleId ?? undefined,
            affectedSceneIndices: ALL_SCENE_INDICES,
        });

        await sendText(
            groupId,
            `Admin approved your character change! Regenerating ${TOTAL_SCENE_COUNT} scenes...`,
        );

        logger.info({
            msg: "handleAdminCharacterApprovalPollVote: approved all scenes",
            changeRequestId,
            groupId,
        });

        return true;
    }

    if (pollOption === "Deny") {
        await updateChangeRequestStatus(changeRequestId, "admin-denied", {});

        await sendText(
            groupId,
            "Admin reviewed and declined this change. You can describe a different change if you'd like.",
        );

        logger.info({
            msg: "handleAdminCharacterApprovalPollVote: denied",
            changeRequestId,
            groupId,
        });

        return true;
    }

    if (pollOption === "Select specific scenes") {
        await updateChangeRequestStatus(changeRequestId, "pending-scene-selection", {});

        await sendText(
            adminChatId,
            "Which scenes should be regenerated? Reply with scene numbers (1-5), separated by commas. Example: 1, 3, 5",
        );

        logger.info({
            msg: "handleAdminCharacterApprovalPollVote: pending scene selection",
            changeRequestId,
        });

        return true;
    }

    // Unrecognized option
    logger.warn({
        msg: "handleAdminCharacterApprovalPollVote: unrecognized poll option",
        pollOption,
        changeRequestId,
    });
    return false;
}

// ── handleAdminSceneSelectionText ──────────────────────────────────

/**
 * Handle admin's text reply specifying which scenes to regenerate (after "Select specific scenes").
 *
 * Parses 1-based scene numbers (1-5) from messageBody, converts to 0-based indices,
 * and dispatches characterRegenQueue with the selected indices.
 *
 * Returns true if handled (even if parse failed and retry was requested), false if no pending request.
 */
export async function handleAdminSceneSelectionText(
    params: HandleAdminSceneSelectionTextParams,
): Promise<boolean> {
    const { messageBody, adminChatId } = params;

    const cr = await getPendingAdminApprovalRequest();
    if (!cr || cr.status !== "pending-scene-selection") {
        return false;
    }

    const { id: changeRequestId, group_id: groupId, tenant_id: tenantId, character_bible_version_id: characterBibleId } = cr;

    // Parse scene numbers: extract digits, filter 1-5, convert to 0-based
    const rawNumbers = (messageBody.match(/\d+/g) ?? []).map(Number);
    const validIndices = rawNumbers
        .filter((n) => n >= 1 && n <= 5)
        .map((n) => n - 1); // Convert 1-based to 0-based

    // Deduplicate
    const uniqueIndices = [...new Set(validIndices)].sort((a, b) => a - b);

    if (uniqueIndices.length === 0) {
        await sendText(
            adminChatId,
            "Could not parse scene numbers. Please reply with numbers 1-5 separated by commas.",
        );
        logger.warn({
            msg: "handleAdminSceneSelectionText: no valid scene numbers parsed",
            messageBody,
            changeRequestId,
        });
        return true; // Handled — admin can retry
    }

    await updateChangeRequestStatus(changeRequestId, "admin-approved", {
        estimatedCostCents: cr.estimated_cost_cents ?? undefined,
    });

    await characterRegenQueue.add("regen-character", {
        changeRequestId,
        sceneIndex: uniqueIndices[0],
        tenantId,
        groupId,
        characterBibleId: characterBibleId ?? undefined,
        affectedSceneIndices: uniqueIndices,
    });

    await sendText(
        groupId,
        `Admin approved your character change! Regenerating ${uniqueIndices.length} scene(s)...`,
    );

    logger.info({
        msg: "handleAdminSceneSelectionText: dispatched partial regen",
        changeRequestId,
        sceneIndices: uniqueIndices,
    });

    return true;
}

// ── handleNameOnlyChange ───────────────────────────────────────────

/**
 * Handle a name-only character change request.
 *
 * Name changes don't require video regeneration — the existing revealUrl video
 * is re-delivered with an updated caption at $0 cost.
 */
export async function handleNameOnlyChange(params: HandleNameOnlyChangeParams): Promise<void> {
    const { groupId, changeRequestId, revealUrl, newName } = params;

    await sendVideo(groupId, revealUrl, `Meet ${newName} -- your updated AI character!`);

    await updateChangeRequestStatus(changeRequestId, "completed", {
        estimatedCostCents: 0,
    });

    logger.info({
        msg: "handleNameOnlyChange: completed",
        changeRequestId,
        newName,
        groupId,
    });
}
