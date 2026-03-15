/**
 * pipeline-state.ts -- Pipeline-level state persistence for customer onboarding
 *
 * Tracks overall onboarding pipeline progress for a tenant/group.
 * Separate from per-module state in module-state.ts.
 *
 * Table: onboarding_pipeline
 * Used by: onboarding.worker.ts, claudeclaw.worker.ts (via handlePipelineEvent)
 */

import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";
import type { ModuleType } from "./modules/types";

// ── Row shape from DB ────────────────────────────────────────

interface PipelineStateRow {
    id: string;
    group_id: string;
    tenant_id: string;
    status: string;
    available_modules: string[];
    completed_modules: string[];
    current_module: string | null;
    total_cost_cents: number;
    admin_phone: string;
    created_at: Date;
    updated_at: Date;
}

export interface PipelineState {
    id: string;
    groupId: string;
    tenantId: string;
    status: string;            // 'active' | 'paused' | 'awaiting-approval' | 'complete' | 'failed'
    availableModules: ModuleType[];
    completedModules: ModuleType[];
    currentModule: ModuleType | null;
    totalCostCents: number;
    adminPhone: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface PipelineStateUpdate {
    status?: string;
    availableModules?: ModuleType[];
    completedModules?: ModuleType[];
    currentModule?: ModuleType | null;
    totalCostCents?: number;
    adminPhone?: string;
}

function rowToPipelineState(row: PipelineStateRow): PipelineState {
    return {
        id: row.id,
        groupId: row.group_id,
        tenantId: row.tenant_id,
        status: row.status,
        availableModules: (row.available_modules || []) as ModuleType[],
        completedModules: (row.completed_modules || []) as ModuleType[],
        currentModule: (row.current_module || null) as ModuleType | null,
        totalCostCents: row.total_cost_cents || 0,
        adminPhone: row.admin_phone || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// ── Table Init ───────────────────────────────────────────────

/**
 * Create the onboarding_pipeline table if it doesn't exist.
 * Safe to call multiple times (idempotent).
 */
export async function initPipelineStateTable(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS onboarding_pipeline (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            group_id TEXT NOT NULL UNIQUE,
            tenant_id TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'active',
            available_modules TEXT[] NOT NULL DEFAULT '{}',
            completed_modules TEXT[] NOT NULL DEFAULT '{}',
            current_module TEXT,
            total_cost_cents INTEGER NOT NULL DEFAULT 0,
            admin_phone TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_op_group_id ON onboarding_pipeline(group_id)
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_op_tenant_id ON onboarding_pipeline(tenant_id)
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_op_status ON onboarding_pipeline(status)
    `);

    logger.info({ msg: "onboarding_pipeline table initialized" });
}

// ── CRUD ─────────────────────────────────────────────────────

/**
 * Get the pipeline state for a group.
 * Returns null if no pipeline has been started for this group.
 */
export async function getPipelineState(groupId: string): Promise<PipelineState | null> {
    const row = await queryOne<PipelineStateRow>(
        `SELECT id, group_id, tenant_id, status, available_modules, completed_modules,
                current_module, total_cost_cents, admin_phone, created_at, updated_at
         FROM onboarding_pipeline
         WHERE group_id = $1`,
        [groupId],
    );

    return row ? rowToPipelineState(row) : null;
}

/**
 * Insert or update pipeline state for a group.
 * On conflict (same group_id), merges updates.
 */
export async function upsertPipelineState(
    groupId: string,
    tenantId: string,
    updates: PipelineStateUpdate,
): Promise<PipelineState | null> {
    // Build SET clause dynamically for updates
    const setClauses: string[] = ["updated_at = NOW()"];
    const values: any[] = [groupId, tenantId];
    let paramIdx = 3;

    if (updates.status !== undefined) {
        setClauses.push(`status = $${paramIdx++}`);
        values.push(updates.status);
    }
    if (updates.availableModules !== undefined) {
        setClauses.push(`available_modules = $${paramIdx++}::text[]`);
        values.push(updates.availableModules);
    }
    if (updates.completedModules !== undefined) {
        setClauses.push(`completed_modules = $${paramIdx++}::text[]`);
        values.push(updates.completedModules);
    }
    if (updates.currentModule !== undefined) {
        setClauses.push(`current_module = $${paramIdx++}`);
        values.push(updates.currentModule);
    }
    if (updates.totalCostCents !== undefined) {
        setClauses.push(`total_cost_cents = $${paramIdx++}`);
        values.push(updates.totalCostCents);
    }
    if (updates.adminPhone !== undefined) {
        setClauses.push(`admin_phone = $${paramIdx++}`);
        values.push(updates.adminPhone);
    }

    const insertStatus = updates.status || "active";
    const insertAvailableModules = updates.availableModules || [];
    const insertCompletedModules = updates.completedModules || [];
    const insertCurrentModule = updates.currentModule ?? null;
    const insertAdminPhone = updates.adminPhone || "";

    const row = await queryOne<PipelineStateRow>(
        `INSERT INTO onboarding_pipeline
            (id, group_id, tenant_id, status, available_modules, completed_modules, current_module, admin_phone)
         VALUES
            (gen_random_uuid()::text, $1, $2, $${paramIdx}, $${paramIdx + 1}::text[], $${paramIdx + 2}::text[], $${paramIdx + 3}, $${paramIdx + 4})
         ON CONFLICT (group_id) DO UPDATE SET
            ${setClauses.join(",\n            ")}
         RETURNING id, group_id, tenant_id, status, available_modules, completed_modules,
                   current_module, total_cost_cents, admin_phone, created_at, updated_at`,
        [...values, insertStatus, insertAvailableModules, insertCompletedModules, insertCurrentModule, insertAdminPhone],
    );

    return row ? rowToPipelineState(row) : null;
}

/**
 * Get all pipelines with status 'active' (for stale detection / monitoring).
 */
export async function getAllActivePipelines(): Promise<PipelineState[]> {
    const rows = await query<PipelineStateRow>(
        `SELECT id, group_id, tenant_id, status, available_modules, completed_modules,
                current_module, total_cost_cents, admin_phone, created_at, updated_at
         FROM onboarding_pipeline
         WHERE status = 'active'
         ORDER BY created_at ASC`,
    );

    return rows.map(rowToPipelineState);
}
