/**
 * Instagram Content Rules Service
 * Clean API for querying the IG content rules system (ig_content_rules, hashtag_sets, caption_templates).
 * Used by the content generation pipeline to enforce rules at generation time.
 */

import { query, queryOne, transaction } from "../db/client";
import { logger } from "../utils/logger";

// ─── Types ───

export interface ContentRule {
  id: string;
  tenantId: string;
  contentType: string;
  ruleCategory: string;
  ruleKey: string;
  value: any;
  priority: number;
  isActive: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HashtagSet {
  id: string;
  tenantId: string;
  setName: string;
  contentCategory: string;
  hashtags: string[];
  usageCount: number;
  lastUsedAt: Date | null;
  isActive: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptionTemplate {
  id: string;
  tenantId: string;
  contentType: string;
  scenario: string;
  language: string;
  hook: string;
  body: string;
  cta: string;
  hashtagSetName: string | null;
  isActive: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaptionWithHashtags extends CaptionTemplate {
  hashtags: string[] | null;
}

// ─── 1. getRule ───

/**
 * Get a specific rule's value by its composite key.
 */
export async function getRule(
  tenantId: string,
  contentType: string,
  ruleCategory: string,
  ruleKey: string
): Promise<any | null> {
  const row = await queryOne<ContentRule>(
    `SELECT * FROM ig_content_rules
     WHERE tenant_id = $1
       AND content_type = $2
       AND rule_category = $3
       AND rule_key = $4
       AND is_active = true`,
    [tenantId, contentType, ruleCategory, ruleKey]
  );

  if (!row) {
    logger.debug({ tenantId, contentType, ruleCategory, ruleKey }, "ig-content-rules: rule not found");
    return null;
  }

  // Raw SQL returns snake_case columns
  return (row as any).value;
}

// ─── 2. getRulesForContentType ───

/**
 * Get ALL rules for a content type. Merges "all" (global) rules with type-specific rules.
 * Type-specific rules win on conflicts (higher priority takes precedence).
 * Returns a flat map: { "category.key": value }
 */
export async function getRulesForContentType(
  tenantId: string,
  contentType: string
): Promise<Record<string, any>> {
  const rows = await query<any>(
    `SELECT rule_category, rule_key, value, priority, content_type
     FROM ig_content_rules
     WHERE tenant_id = $1
       AND content_type IN ('all', $2)
       AND is_active = true
     ORDER BY priority ASC`,
    [tenantId, contentType]
  );

  const merged: Record<string, { value: any; priority: number; isSpecific: boolean }> = {};

  for (const row of rows) {
    const key = `${row.rule_category}.${row.rule_key}`;
    const isSpecific = row.content_type === contentType;
    const existing = merged[key];

    // Type-specific always wins over "all"; within same specificity, higher priority wins
    if (
      !existing ||
      (isSpecific && !existing.isSpecific) ||
      (isSpecific === existing.isSpecific && row.priority > existing.priority)
    ) {
      merged[key] = { value: row.value, priority: row.priority, isSpecific };
    }
  }

  const result: Record<string, any> = {};
  for (const [key, entry] of Object.entries(merged)) {
    result[key] = entry.value;
  }

  logger.debug({ tenantId, contentType, ruleCount: Object.keys(result).length }, "ig-content-rules: merged rules");
  return result;
}

// ─── 3. getHashtagSet (rotation) ───

/**
 * Get the next hashtag set for a category using LRU rotation.
 * Increments usage_count and updates last_used_at atomically.
 */
export async function getHashtagSet(
  tenantId: string,
  contentCategory: string
): Promise<HashtagSet | null> {
  return transaction(async (client) => {
    // Select least-recently-used active set for this category
    const result = await client.query(
      `SELECT * FROM hashtag_sets
       WHERE tenant_id = $1
         AND content_category = $2
         AND is_active = true
       ORDER BY last_used_at ASC NULLS FIRST, usage_count ASC
       LIMIT 1
       FOR UPDATE`,
      [tenantId, contentCategory]
    );

    const row = result.rows[0];
    if (!row) {
      logger.warn({ tenantId, contentCategory }, "ig-content-rules: no hashtag set found for category");
      return null;
    }

    // Increment usage
    await client.query(
      `UPDATE hashtag_sets
       SET usage_count = usage_count + 1,
           last_used_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [row.id]
    );

    row.usage_count += 1;
    row.last_used_at = new Date();
    return row as HashtagSet;
  });
}

// ─── 4. getHashtagSetByName ───

/**
 * Get a specific named hashtag set.
 */
export async function getHashtagSetByName(
  tenantId: string,
  setName: string
): Promise<HashtagSet | null> {
  const row = await queryOne<HashtagSet>(
    `SELECT * FROM hashtag_sets
     WHERE tenant_id = $1
       AND set_name = $2
       AND is_active = true`,
    [tenantId, setName]
  );

  if (!row) {
    logger.debug({ tenantId, setName }, "ig-content-rules: hashtag set not found by name");
  }
  return row;
}

// ─── 5. getCaptionTemplate ───

/**
 * Get caption template with its linked hashtag set.
 * Language defaults to 'en' if not specified.
 */
export async function getCaptionTemplate(
  tenantId: string,
  contentType: string,
  scenario: string,
  language: string = "en"
): Promise<CaptionWithHashtags | null> {
  const row = await queryOne<any>(
    `SELECT ct.*,
            hs.hashtags AS linked_hashtags
     FROM caption_templates ct
     LEFT JOIN hashtag_sets hs
       ON hs.id = ct.hashtag_set_id
       AND hs.is_active = true
     WHERE ct.tenant_id = $1
       AND ct.content_type = $2
       AND ct.scenario = $3
       AND ct.language = $4
       AND ct.is_active = true`,
    [tenantId, contentType, scenario, language]
  );

  if (!row) {
    logger.debug({ tenantId, contentType, scenario, language }, "ig-content-rules: caption template not found");
    return null;
  }

  return {
    ...row,
    hashtags: row.linked_hashtags ?? null,
  } as CaptionWithHashtags;
}

// ─── 6. getComplianceChecklist ───

/**
 * Get all compliance rules for pre-publish validation.
 * Returns rules in the 'compliance' category for the given content type + "all".
 */
export async function getComplianceChecklist(
  tenantId: string,
  contentType: string
): Promise<Array<{ key: string; value: any; priority: number }>> {
  const rows = await query<any>(
    `SELECT rule_key, value, priority
     FROM ig_content_rules
     WHERE tenant_id = $1
       AND content_type IN ('all', $2)
       AND rule_category = 'compliance'
       AND is_active = true
     ORDER BY priority DESC`,
    [tenantId, contentType]
  );

  return rows.map((r) => ({
    key: r.rule_key,
    value: r.value,
    priority: r.priority,
  }));
}

// ─── 7. getSchedulingRules ───

/**
 * Get scheduling rules (frequency, best times, etc.) for a content type.
 */
export async function getSchedulingRules(
  tenantId: string,
  contentType: string
): Promise<Record<string, any>> {
  const rows = await query<any>(
    `SELECT rule_key, value
     FROM ig_content_rules
     WHERE tenant_id = $1
       AND content_type IN ('all', $2)
       AND rule_category = 'scheduling'
       AND is_active = true
     ORDER BY priority DESC`,
    [tenantId, contentType]
  );

  const rules: Record<string, any> = {};
  for (const row of rows) {
    // Don't overwrite type-specific with "all" (rows ordered by priority DESC)
    if (!(row.rule_key in rules)) {
      rules[row.rule_key] = row.value;
    }
  }

  return rules;
}

// ─── 8. getSuburbGeoSwap ───

/**
 * Get the suburb-specific hashtag to swap into a set.
 * Looks up the 'geo_swap' rule category for the given suburb key.
 */
export async function getSuburbGeoSwap(
  tenantId: string,
  suburb: string
): Promise<string | null> {
  const normalizedSuburb = suburb.toLowerCase().replace(/\s+/g, "_");

  const row = await queryOne<any>(
    `SELECT value
     FROM ig_content_rules
     WHERE tenant_id = $1
       AND rule_category = 'hashtags'
       AND rule_key = 'suburb_geo_swaps'
       AND is_active = true`,
    [tenantId]
  );

  if (!row || !row.value) {
    logger.debug({ tenantId, suburb: normalizedSuburb }, "ig-content-rules: no geo swap map found");
    return null;
  }

  const swapMap = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
  return swapMap[normalizedSuburb] ?? null;
}
