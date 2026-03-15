/**
 * character-bible-versioning.ts -- Append-only versioned CharacterBible insert pattern
 *
 * CharacterBible rows are never updated in place. Instead, a new row is inserted
 * with an incremented version number and a changeDelta describing what changed.
 * Reads always fetch ORDER BY createdAt DESC LIMIT 1 (latest version).
 *
 * Used by: change-request-handler.ts (Plan 02) when applying character-change requests
 */

import { query, queryOne } from "../../db/client";
import { logger } from "../../utils/logger";

// ── Types ─────────────────────────────────────────────────────

export interface CharacterBibleFields {
    name: string;
    personaDescription: string;
    visualStyle: string;
    soraHandle: string | null;
    metadata: Record<string, any>;
}

interface CharacterBibleRow extends CharacterBibleFields {
    id: string;
    tenantId: string;
    version: number | null;
    changeDelta: Record<string, any> | null;
    createdAt: Date;
}

// ── Helpers ────────────────────────────────────────────────────

function parseJsonField(value: any): Record<string, any> {
    if (!value) return {};
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return {};
        }
    }
    return value as Record<string, any>;
}

function rowToCharacterBibleRow(raw: any): CharacterBibleRow {
    return {
        id: raw.id,
        tenantId: raw.tenantId,
        name: raw.name,
        personaDescription: raw.personaDescription,
        visualStyle: raw.visualStyle,
        soraHandle: raw.soraHandle ?? null,
        metadata: parseJsonField(raw.metadata),
        version: raw.version ?? null,
        changeDelta: raw.changeDelta ? parseJsonField(raw.changeDelta) : null,
        createdAt: raw.createdAt,
    };
}

// ── Main Exports ───────────────────────────────────────────────

/**
 * Fetch the most recent CharacterBible row for a tenant.
 * Returns null if no CharacterBible exists for this tenant.
 */
export async function getLatestCharacterBible(tenantId: string): Promise<CharacterBibleRow | null> {
    const row = await queryOne<any>(
        `SELECT id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle",
                metadata, version, "changeDelta", "createdAt"
         FROM "CharacterBible"
         WHERE "tenantId" = $1
         ORDER BY "createdAt" DESC
         LIMIT 1`,
        [tenantId],
    );

    if (!row) return null;
    return rowToCharacterBibleRow(row);
}

/**
 * Insert a new versioned CharacterBible row, preserving the old row unchanged.
 *
 * - Fetches the current (latest) row to determine the current version
 * - If no existing row, returns null (cannot version without a base)
 * - Merges updatedFields onto the current row
 * - Inserts a brand-new row with version = current.version + 1
 * - Records changeDelta for audit trail
 * - Returns the new row's id, or null on failure
 *
 * NEVER updates the existing row.
 */
export async function createCharacterBibleVersion(
    tenantId: string,
    updatedFields: Partial<CharacterBibleFields>,
    changeDelta: Record<string, any>,
): Promise<string | null> {
    const current = await getLatestCharacterBible(tenantId);

    if (!current) {
        logger.warn({
            msg: "createCharacterBibleVersion: no existing CharacterBible found, cannot create version",
            tenantId,
        });
        return null;
    }

    const newVersion = (current.version ?? 1) + 1;

    // Merge fields — updatedFields override current values
    const merged: CharacterBibleFields = {
        name: updatedFields.name ?? current.name,
        personaDescription: updatedFields.personaDescription ?? current.personaDescription,
        visualStyle: updatedFields.visualStyle ?? current.visualStyle,
        soraHandle: updatedFields.soraHandle !== undefined ? updatedFields.soraHandle : current.soraHandle,
        metadata: updatedFields.metadata
            ? { ...current.metadata, ...updatedFields.metadata }
            : current.metadata,
    };

    try {
        const rows = await query<{ id: string }>(
            `INSERT INTO "CharacterBible"
                (id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata, version, "changeDelta", "createdAt", "updatedAt")
             VALUES
                (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, NOW(), NOW())
             RETURNING id`,
            [
                tenantId,
                merged.name,
                merged.personaDescription,
                merged.visualStyle,
                merged.soraHandle,
                JSON.stringify(merged.metadata),
                newVersion,
                JSON.stringify(changeDelta),
            ],
        );

        const newId = rows[0]?.id ?? null;
        if (newId) {
            logger.info({
                msg: "createCharacterBibleVersion: new version inserted",
                tenantId,
                newVersion,
                newId,
                previousId: current.id,
            });
        } else {
            logger.error({ msg: "createCharacterBibleVersion: INSERT did not return id", tenantId });
        }
        return newId;
    } catch (err: any) {
        logger.error({
            msg: "createCharacterBibleVersion: INSERT failed",
            error: err.message,
            tenantId,
        });
        return null;
    }
}
