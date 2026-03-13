/**
 * module-state.ts -- DB CRUD for onboarding_module_state table
 *
 * Persists module conversation state across worker restarts.
 * Each (groupId, moduleType) pair has one state row.
 *
 * Used by: module-router.ts, individual module implementations
 */

import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import type { ModuleState, ModuleType } from "./modules/types";

// ── Row shape from DB ────────────────────────────────────────

interface ModuleStateRow {
    id: string;
    group_id: string;
    tenant_id: string;
    module_type: string;
    phase: string;
    collected_data: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}

function rowToModuleState(row: ModuleStateRow): ModuleState {
    return {
        id: row.id,
        groupId: row.group_id,
        tenantId: row.tenant_id,
        moduleType: row.module_type as ModuleType,
        phase: row.phase,
        collectedData: row.collected_data ?? {},
        updatedAt: row.updated_at,
    };
}

// ── Table Init ───────────────────────────────────────────────

/**
 * Create the onboarding_module_state table if it doesn't exist.
 * Safe to call multiple times (idempotent).
 */
export async function initModuleStateTable(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS onboarding_module_state (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            group_id TEXT NOT NULL,
            tenant_id TEXT NOT NULL,
            module_type TEXT NOT NULL,
            phase TEXT NOT NULL DEFAULT 'pending',
            collected_data JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(group_id, module_type)
        )
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_oms_group_id ON onboarding_module_state(group_id)
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_oms_tenant_id ON onboarding_module_state(tenant_id)
    `);

    logger.info({ msg: "onboarding_module_state table initialized" });
}

// ── CRUD ─────────────────────────────────────────────────────

/**
 * Get the module state for a specific group + module type combo.
 * Returns null if no state exists yet.
 */
export async function getModuleState(
    groupId: string,
    moduleType: ModuleType,
): Promise<ModuleState | null> {
    const row = await queryOne<ModuleStateRow>(
        `SELECT id, group_id, tenant_id, module_type, phase, collected_data, created_at, updated_at
         FROM onboarding_module_state
         WHERE group_id = $1 AND module_type = $2`,
        [groupId, moduleType],
    );

    return row ? rowToModuleState(row) : null;
}

/**
 * Get the currently active (non-complete) module for a group.
 * Returns the oldest non-complete module, or null if all are complete / none started.
 */
export async function getActiveModule(
    groupId: string,
): Promise<ModuleState | null> {
    const row = await queryOne<ModuleStateRow>(
        `SELECT id, group_id, tenant_id, module_type, phase, collected_data, created_at, updated_at
         FROM onboarding_module_state
         WHERE group_id = $1 AND phase != 'complete'
         ORDER BY created_at ASC
         LIMIT 1`,
        [groupId],
    );

    return row ? rowToModuleState(row) : null;
}

/**
 * Insert or update module state for a group + module type.
 * On conflict (same group_id + module_type), updates phase and collected_data.
 */
export async function upsertModuleState(
    groupId: string,
    tenantId: string,
    moduleType: ModuleType,
    phase: string,
    collectedData: Record<string, any>,
): Promise<ModuleState | null> {
    const row = await queryOne<ModuleStateRow>(
        `INSERT INTO onboarding_module_state (id, group_id, tenant_id, module_type, phase, collected_data)
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::jsonb)
         ON CONFLICT (group_id, module_type) DO UPDATE SET
            phase = EXCLUDED.phase,
            collected_data = EXCLUDED.collected_data,
            updated_at = NOW()
         RETURNING id, group_id, tenant_id, module_type, phase, collected_data, created_at, updated_at`,
        [groupId, tenantId, moduleType, phase, JSON.stringify(collectedData)],
    );

    return row ? rowToModuleState(row) : null;
}
