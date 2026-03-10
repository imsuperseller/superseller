/**
 * prompt-store.ts — DB-driven prompt configuration with in-memory cache.
 *
 * Loads prompt templates from the `prompt_configs` table with a 5-minute TTL cache.
 * Falls back to hardcoded prompts if DB is unavailable.
 *
 * Usage:
 *   const template = await getPrompt("videoforge", "realtor_system_prompt");
 *   const rendered = await renderPrompt("marketplace", "uad_system", { city: "Dallas" });
 */

import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";

// ─── Types ───────────────────────────────────────────────────

interface CachedPrompt {
    template: string;
    version: number;
    metadata: Record<string, any> | null;
    fetchedAt: number;
}

interface PromptConfigRow {
    id: string;
    service: string;
    prompt_key: string;
    template: string;
    version: number;
    is_active: boolean;
    metadata: Record<string, any> | null;
    created_at: string;
    updated_at: string;
}

// ─── Cache ───────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CachedPrompt>();

function cacheKey(service: string, promptKey: string): string {
    return `${service}::${promptKey}`;
}

function getCached(service: string, promptKey: string): CachedPrompt | null {
    const key = cacheKey(service, promptKey);
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
        cache.delete(key);
        return null;
    }
    return entry;
}

function setCache(service: string, promptKey: string, row: PromptConfigRow): void {
    cache.set(cacheKey(service, promptKey), {
        template: row.template,
        version: row.version,
        metadata: row.metadata,
        fetchedAt: Date.now(),
    });
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get a prompt template from DB (cached). Returns null if not found.
 * The caller should fall back to its hardcoded prompt when null is returned.
 */
export async function getPrompt(
    service: string,
    promptKey: string
): Promise<string | null> {
    // Check cache first
    const cached = getCached(service, promptKey);
    if (cached) return cached.template;

    try {
        const row = await queryOne<PromptConfigRow>(
            `SELECT id, service, prompt_key, template, version, is_active, metadata, created_at, updated_at
             FROM prompt_configs
             WHERE service = $1 AND prompt_key = $2 AND is_active = true
             ORDER BY version DESC
             LIMIT 1`,
            [service, promptKey]
        );

        if (row) {
            setCache(service, promptKey, row);
            return row.template;
        }

        return null;
    } catch (err) {
        logger.warn({
            msg: "prompt-store: DB lookup failed, caller should use hardcoded fallback",
            service,
            promptKey,
            error: (err as Error).message,
        });
        return null;
    }
}

/**
 * Get prompt template + metadata. Returns null if not found.
 */
export async function getPromptWithMetadata(
    service: string,
    promptKey: string
): Promise<{ template: string; version: number; metadata: Record<string, any> | null } | null> {
    const cached = getCached(service, promptKey);
    if (cached) return { template: cached.template, version: cached.version, metadata: cached.metadata };

    try {
        const row = await queryOne<PromptConfigRow>(
            `SELECT id, service, prompt_key, template, version, is_active, metadata, created_at, updated_at
             FROM prompt_configs
             WHERE service = $1 AND prompt_key = $2 AND is_active = true
             ORDER BY version DESC
             LIMIT 1`,
            [service, promptKey]
        );

        if (row) {
            setCache(service, promptKey, row);
            return { template: row.template, version: row.version, metadata: row.metadata };
        }

        return null;
    } catch (err) {
        logger.warn({
            msg: "prompt-store: DB lookup failed for getPromptWithMetadata",
            service,
            promptKey,
            error: (err as Error).message,
        });
        return null;
    }
}

/**
 * Render a prompt template by replacing {{variable}} placeholders with provided values.
 * Returns null if the prompt is not found in DB (caller should use hardcoded fallback).
 */
export async function renderPrompt(
    service: string,
    promptKey: string,
    vars: Record<string, string>
): Promise<string | null> {
    const template = await getPrompt(service, promptKey);
    if (!template) return null;
    return interpolate(template, vars);
}

/**
 * Replace {{variable}} placeholders in a template string.
 * Unmatched placeholders are left as-is (not removed).
 */
export function interpolate(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return key in vars ? vars[key] : match;
    });
}

/**
 * List all prompt configs for a service (admin use).
 */
export async function listPrompts(service?: string): Promise<PromptConfigRow[]> {
    if (service) {
        return query<PromptConfigRow>(
            `SELECT id, service, prompt_key, template, version, is_active, metadata, created_at, updated_at
             FROM prompt_configs
             WHERE service = $1
             ORDER BY service, prompt_key, version DESC`,
            [service]
        );
    }
    return query<PromptConfigRow>(
        `SELECT id, service, prompt_key, template, version, is_active, metadata, created_at, updated_at
         FROM prompt_configs
         ORDER BY service, prompt_key, version DESC`
    );
}

/**
 * Invalidate cached prompt(s). Call after admin updates.
 */
export function invalidateCache(service?: string, promptKey?: string): void {
    if (service && promptKey) {
        cache.delete(cacheKey(service, promptKey));
    } else if (service) {
        for (const key of cache.keys()) {
            if (key.startsWith(`${service}::`)) cache.delete(key);
        }
    } else {
        cache.clear();
    }
}
