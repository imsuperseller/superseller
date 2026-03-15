/**
 * change-request-intake.ts -- Change request table init, CRUD, and cost estimation
 *
 * Provides the persistence layer for customer change requests (scene edits,
 * character updates). Consumed by Plan 02's change-request-handler.ts orchestrator.
 *
 * Table: change_requests
 * Also migrates: CharacterBible.changeDelta column (if not exists)
 */

import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import { COST_RATES } from "../expense-tracker";

// ── Cost Constants ─────────────────────────────────────────────

/**
 * Cost per scene regeneration in cents.
 * Derived from COST_RATES.fal.sora_2_scene_1080p (matches character-video-gen.ts SORA_COST_PER_SCENE).
 * NOT hardcoded — falls back to 1.00 if the key doesn't exist.
 */
export const SORA_COST_PER_SCENE_CENTS = Math.round(
    (COST_RATES.fal?.sora_2_scene_1080p ?? 1.00) * 100
);

// ── Row Shape ─────────────────────────────────────────────────

export interface ChangeRequestRow {
    id: string;
    group_id: string;
    tenant_id: string;
    message_body: string;
    intent: string;
    scope: string | null;
    scene_number: number | null;
    change_summary: string | null;
    status: string;
    estimated_cost_cents: number | null;
    poll_message_id: string | null;
    character_bible_version_id: string | null;
    created_at: Date;
    updated_at: Date;
}

// ── Table Init ─────────────────────────────────────────────────

/**
 * Create the change_requests table and indexes if they don't exist.
 * Also adds the changeDelta column to CharacterBible if missing.
 * Safe to call multiple times (idempotent).
 */
export async function initChangeRequestTable(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS change_requests (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            group_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            message_body TEXT NOT NULL,
            intent TEXT NOT NULL,
            scope TEXT,
            scene_number INTEGER,
            change_summary TEXT,
            status TEXT NOT NULL DEFAULT 'received',
            estimated_cost_cents INTEGER,
            poll_message_id TEXT,
            character_bible_version_id TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_cr_group_status ON change_requests(group_id, status)
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_cr_tenant_id ON change_requests(tenant_id)
    `);

    // Add changeDelta column to CharacterBible if not exists (idempotent migration)
    await query(`
        DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='CharacterBible' AND column_name='changeDelta') THEN
                ALTER TABLE "CharacterBible" ADD COLUMN "changeDelta" JSONB;
            END IF;
        END $$
    `);

    logger.info({ msg: "change_requests table initialized" });
}

// ── CRUD ───────────────────────────────────────────────────────

export interface CreateChangeRequestParams {
    groupId: string;
    tenantId: string;
    messageBody: string;
    intent: string;
    scope?: string | null;
    sceneNumber?: number | null;
    changeSummary?: string | null;
}

/**
 * Insert a new change request row and return its id.
 */
export async function createChangeRequest(params: CreateChangeRequestParams): Promise<string> {
    const rows = await query<{ id: string }>(
        `INSERT INTO change_requests
            (group_id, tenant_id, message_body, intent, scope, scene_number, change_summary)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
            params.groupId,
            params.tenantId,
            params.messageBody,
            params.intent,
            params.scope ?? null,
            params.sceneNumber ?? null,
            params.changeSummary ?? null,
        ],
    );

    const id = rows[0]?.id;
    if (!id) {
        throw new Error("createChangeRequest: INSERT did not return id");
    }
    return id;
}

export interface UpdateChangeRequestExtraFields {
    estimatedCostCents?: number;
    pollMessageId?: string;
    characterBibleVersionId?: string;
}

/**
 * Update status (and optionally extra fields) on a change request.
 * Always updates updated_at.
 */
export async function updateChangeRequestStatus(
    id: string,
    status: string,
    extraFields?: UpdateChangeRequestExtraFields,
): Promise<void> {
    const setClauses: string[] = ["status = $2", "updated_at = NOW()"];
    const values: any[] = [id, status];
    let paramIdx = 3;

    if (extraFields?.estimatedCostCents !== undefined) {
        setClauses.push(`estimated_cost_cents = $${paramIdx++}`);
        values.push(extraFields.estimatedCostCents);
    }
    if (extraFields?.pollMessageId !== undefined) {
        setClauses.push(`poll_message_id = $${paramIdx++}`);
        values.push(extraFields.pollMessageId);
    }
    if (extraFields?.characterBibleVersionId !== undefined) {
        setClauses.push(`character_bible_version_id = $${paramIdx++}`);
        values.push(extraFields.characterBibleVersionId);
    }

    await query(
        `UPDATE change_requests SET ${setClauses.join(", ")} WHERE id = $1`,
        values,
    );
}

/**
 * Get the most recent change request awaiting confirmation for a group.
 * Used by poll vote routing (fast indexed query on group_id + status).
 * Returns null if no pending request exists.
 */
export async function getPendingChangeRequest(groupId: string): Promise<ChangeRequestRow | null> {
    return queryOne<ChangeRequestRow>(
        `SELECT id, group_id, tenant_id, message_body, intent, scope, scene_number,
                change_summary, status, estimated_cost_cents, poll_message_id,
                character_bible_version_id, created_at, updated_at
         FROM change_requests
         WHERE group_id = $1 AND status = 'awaiting-confirmation'
         ORDER BY created_at DESC
         LIMIT 1`,
        [groupId],
    );
}

// ── Cost Estimation ────────────────────────────────────────────

/**
 * Estimate change cost in cents based on intent and affected scene count.
 * - scene-change: one scene regeneration = SORA_COST_PER_SCENE_CENTS
 * - character-change: all scenes regenerated = SORA_COST_PER_SCENE_CENTS * affectedSceneCount
 * - other intents: 0
 */
export function estimateChangeCost(intent: string, affectedSceneCount: number): number {
    switch (intent) {
        case "scene-change":
            return SORA_COST_PER_SCENE_CENTS;
        case "character-change":
            return SORA_COST_PER_SCENE_CENTS * affectedSceneCount;
        default:
            return 0;
    }
}
