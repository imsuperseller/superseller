#!/usr/bin/env npx tsx
/**
 * Model Observatory — Daily Sync Script
 * Fetches model listings from Kie.ai and fal.ai, detects changes (new models,
 * price changes, deprecations), updates the ai_models table, and logs changes
 * to ai_model_decisions.
 *
 * Usage:
 *   Local:     npx tsx tools/model-observatory/daily-sync.ts
 *   RackNerd:  node dist/tools/model-observatory/daily-sync.js
 *   Cron:      0 6 * * * cd /opt/tourreel-worker && node dist/tools/model-observatory/daily-sync.js >> /var/log/model-observatory.log 2>&1
 *
 * Env vars (optional overrides):
 *   DATABASE_URL — Postgres connection string
 *   SYNC_DRY_RUN=1 — Log changes without writing to DB
 */

import pg from "pg";

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════

const DB_URL =
  process.env.DATABASE_URL ||
  "postgresql://admin:a1efbcd564b928d3ef1d7cae@172.245.56.50:5432/app_db";

const DRY_RUN = process.env.SYNC_DRY_RUN === "1";

const KIE_MARKET_URL = "https://kie.ai/market";
const FAL_MODELS_URL = "https://fal.ai/models";

const HTTP_TIMEOUT_MS = 30_000;
const USER_AGENT =
  "Rensto-ModelObservatory/1.0 (+https://rensto.com) Node.js";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

interface ScrapedModel {
  provider: string;
  modelName: string;
  modelId: string;
  category?: string;
  costPerCallUsd?: number;
  costPer5sUsd?: number;
  costPerImageUsd?: number;
  pricingNotes?: string;
  status?: string;
  rawData?: Record<string, unknown>;
}

interface ChangeRecord {
  modelId: string;
  provider: string;
  modelName: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: "new_model" | "price_change" | "status_change" | "deprecation" | "field_update";
}

// ═══════════════════════════════════════════════════════════
// HTTP FETCH HELPER
// ═══════════════════════════════════════════════════════════

async function fetchPage(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!response.ok) {
      console.warn(
        `[WARN] ${url} returned HTTP ${response.status} ${response.statusText}`
      );
      return null;
    }

    return await response.text();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("abort")) {
      console.warn(`[WARN] ${url} timed out after ${HTTP_TIMEOUT_MS}ms`);
    } else {
      console.warn(`[WARN] Failed to fetch ${url}: ${message}`);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ═══════════════════════════════════════════════════════════
// KIE.AI PARSER
// ═══════════════════════════════════════════════════════════

/**
 * Parse the Kie.ai market page HTML to extract model listings.
 *
 * Kie.ai renders a grid of model cards. We look for multiple patterns:
 *   - JSON-LD structured data (if present)
 *   - Next.js __NEXT_DATA__ hydration payload (SSR data)
 *   - HTML model card patterns (name, price, endpoint info)
 *
 * If the page structure changes, this logs a warning and returns partial results.
 */
function parseKieMarket(html: string): ScrapedModel[] {
  const models: ScrapedModel[] = [];

  // ── Strategy 1: Extract from __NEXT_DATA__ (Next.js hydration) ──
  const nextDataMatch = html.match(
    /<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/i
  );
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const extracted = extractModelsFromNextData(data, "kie.ai");
      if (extracted.length > 0) {
        console.log(
          `  [Kie.ai] Extracted ${extracted.length} models from __NEXT_DATA__`
        );
        models.push(...extracted);
        return models;
      }
    } catch (e) {
      console.warn(
        `  [Kie.ai] __NEXT_DATA__ parse failed: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  // ── Strategy 2: Look for inline JSON model data (React hydration, window.__data__, etc.) ──
  const jsonPatterns = [
    /window\.__(?:INITIAL_STATE|DATA|PRELOADED_STATE)__\s*=\s*({[\s\S]*?});?\s*<\/script>/gi,
    /window\["__(?:INITIAL_STATE|DATA)__"\]\s*=\s*({[\s\S]*?});?\s*<\/script>/gi,
    /"models"\s*:\s*(\[[\s\S]*?\])\s*[,}]/gi,
    /"products"\s*:\s*(\[[\s\S]*?\])\s*[,}]/gi,
  ];

  for (const pattern of jsonPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const arr = Array.isArray(parsed)
          ? parsed
          : parsed.models || parsed.products || [];
        if (Array.isArray(arr) && arr.length > 0) {
          const extracted = arr
            .filter(
              (item: Record<string, unknown>) =>
                item.name || item.model_name || item.title || item.id
            )
            .map((item: Record<string, unknown>) =>
              normalizeKieModel(item)
            )
            .filter((m): m is ScrapedModel => m !== null);
          if (extracted.length > 0) {
            console.log(
              `  [Kie.ai] Extracted ${extracted.length} models from inline JSON`
            );
            models.push(...extracted);
            return models;
          }
        }
      } catch {
        // JSON parse failed for this match, try next
      }
    }
  }

  // ── Strategy 3: Regex-based HTML card parsing ──
  // Look for model card patterns in the HTML
  const cardPatterns = [
    // Pattern: model cards with title/name and price
    /<(?:div|article|section|a)[^>]*class="[^"]*(?:model|card|product|item)[^"]*"[^>]*>([\s\S]*?)<\/(?:div|article|section|a)>/gi,
    // Pattern: heading + price in close proximity
    /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>[\s\S]{0,500}?\$[\d.]+/gi,
  ];

  // Collect all text blocks that look like model listings
  const modelBlocks = new Set<string>();
  for (const pattern of cardPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      modelBlocks.add(match[0]);
    }
  }

  // Known Kie.ai model name patterns for robust matching
  const knownModelPatterns = [
    /kling[\s-]*(\d[\d.]*)/gi,
    /veo[\s-]*(\d[\d.]*)/gi,
    /seedance[\s-]*(\d[\d.]*)/gi,
    /wan[\s-]*(\d[\d.]*)/gi,
    /sora[\s-]*(\d[\d.]*)/gi,
    /hailuo[\s-]*(\d[\d.]*)/gi,
    /runway[\s-]*(?:gen[\s-]*)(\d[\w]*)/gi,
    /suno[\s-]*(?:v)?(\d[\d.]*)/gi,
    /gemini[\s-]*(\d[\d.]*)/gi,
    /nano[\s-]*banana/gi,
    /recraft/gi,
    /topaz/gi,
    /infinitetalk/gi,
    /seedream[\s-]*(\d[\d.]*)/gi,
    /gpt[\s-]*image/gi,
  ];

  // Scan entire HTML for known model names + nearby prices
  for (const pattern of knownModelPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const start = Math.max(0, match.index - 200);
      const end = Math.min(html.length, match.index + match[0].length + 500);
      const context = html.slice(start, end);

      // Extract price from context
      const priceMatch = context.match(/\$\s*([\d.]+)/);
      const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;

      const name = stripHtml(match[0]).trim();
      if (name.length > 2) {
        const model: ScrapedModel = {
          provider: "kie.ai",
          modelName: name,
          modelId: name.toLowerCase().replace(/\s+/g, "-"),
          costPerCallUsd: price,
          pricingNotes: priceMatch ? `Scraped: ${priceMatch[0]}` : undefined,
          rawData: { context: stripHtml(context).substring(0, 300) },
        };
        // Deduplicate by normalized name
        if (
          !models.some(
            (m) =>
              m.modelId === model.modelId ||
              m.modelName.toLowerCase() === model.modelName.toLowerCase()
          )
        ) {
          models.push(model);
        }
      }
    }
  }

  if (models.length > 0) {
    console.log(
      `  [Kie.ai] Extracted ${models.length} models via HTML pattern matching`
    );
  } else {
    console.warn(
      `  [Kie.ai] WARNING: Could not extract any models from market page. Page structure may have changed.`
    );
    console.warn(
      `  [Kie.ai] HTML length: ${html.length} chars. First 200: ${html.substring(0, 200).replace(/\n/g, " ")}`
    );
  }

  return models;
}

/**
 * Recursively walk a Next.js __NEXT_DATA__ payload to find model arrays.
 */
function extractModelsFromNextData(
  data: unknown,
  provider: string,
  depth = 0
): ScrapedModel[] {
  if (depth > 10) return [];
  if (!data || typeof data !== "object") return [];

  // If it's an array of objects with model-like keys, treat as model list
  if (Array.isArray(data)) {
    const hasModelLikeItems = data.some(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.name || item.model_name || item.title || item.model || item.id) &&
        (item.price !== undefined ||
          item.pricing !== undefined ||
          item.cost !== undefined ||
          item.category !== undefined ||
          item.type !== undefined)
    );
    if (hasModelLikeItems && data.length >= 2) {
      return data
        .map((item) => normalizeKieModel(item))
        .filter((m): m is ScrapedModel => m !== null);
    }
  }

  // Recurse into object properties
  const results: ScrapedModel[] = [];
  const obj = data as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (
      [
        "models",
        "products",
        "items",
        "market",
        "listings",
        "tools",
        "data",
        "pageProps",
        "props",
        "dehydratedState",
        "queries",
      ].includes(key)
    ) {
      const sub = extractModelsFromNextData(obj[key], provider, depth + 1);
      results.push(...sub);
    }
  }
  return results;
}

function normalizeKieModel(
  item: Record<string, unknown>
): ScrapedModel | null {
  const name =
    (item.name as string) ||
    (item.model_name as string) ||
    (item.title as string) ||
    (item.label as string);
  if (!name) return null;

  const id =
    (item.model_id as string) ||
    (item.id as string) ||
    (item.slug as string) ||
    name.toLowerCase().replace(/\s+/g, "-");

  // Extract price — could be in various shapes
  let price: number | undefined;
  if (typeof item.price === "number") price = item.price;
  else if (typeof item.price === "string")
    price = parseFloat(item.price) || undefined;
  else if (item.pricing && typeof item.pricing === "object") {
    const p = item.pricing as Record<string, unknown>;
    price =
      (p.per_call as number) ||
      (p.per_second as number) ||
      (p.base as number) ||
      undefined;
  }

  const category =
    (item.category as string) || (item.type as string) || undefined;
  const status =
    (item.status as string) ||
    (item.deprecated === true ? "deprecated" : undefined);

  return {
    provider: "kie.ai",
    modelName: name,
    modelId: id,
    category,
    costPerCallUsd: price,
    status,
    rawData: item,
  };
}

// ═══════════════════════════════════════════════════════════
// FAL.AI PARSER
// ═══════════════════════════════════════════════════════════

/**
 * Parse the fal.ai models page to extract model listings.
 * fal.ai uses a React-rendered page; we look for hydration data or HTML patterns.
 */
function parseFalModels(html: string): ScrapedModel[] {
  const models: ScrapedModel[] = [];

  // ── Strategy 1: __NEXT_DATA__ or similar hydration ──
  const nextDataMatch = html.match(
    /<script\s+id="__NEXT_DATA__"\s+type="application\/json">([\s\S]*?)<\/script>/i
  );
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const extracted = extractModelsFromFalData(data);
      if (extracted.length > 0) {
        console.log(
          `  [fal.ai] Extracted ${extracted.length} models from __NEXT_DATA__`
        );
        models.push(...extracted);
        return models;
      }
    } catch (e) {
      console.warn(
        `  [fal.ai] __NEXT_DATA__ parse failed: ${e instanceof Error ? e.message : e}`
      );
    }
  }

  // ── Strategy 2: Inline JSON payloads ──
  const jsonPatterns = [
    /window\.__(?:INITIAL_STATE|DATA|PRELOADED_STATE)__\s*=\s*({[\s\S]*?});?\s*<\/script>/gi,
    /"models"\s*:\s*(\[[\s\S]*?\])\s*[,}]/gi,
    /"endpoints"\s*:\s*(\[[\s\S]*?\])\s*[,}]/gi,
  ];

  for (const pattern of jsonPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(match[1]);
        const arr = Array.isArray(parsed)
          ? parsed
          : parsed.models || parsed.endpoints || [];
        if (Array.isArray(arr) && arr.length > 0) {
          const extracted = arr
            .filter(
              (item: Record<string, unknown>) =>
                item.name || item.model_name || item.title || item.endpoint || item.id
            )
            .map((item: Record<string, unknown>) =>
              normalizeFalModel(item)
            )
            .filter((m): m is ScrapedModel => m !== null);
          if (extracted.length > 0) {
            console.log(
              `  [fal.ai] Extracted ${extracted.length} models from inline JSON`
            );
            models.push(...extracted);
            return models;
          }
        }
      } catch {
        // Parse failed for this match
      }
    }
  }

  // ── Strategy 3: HTML pattern matching ──
  // fal.ai model cards typically contain endpoint IDs like "fal-ai/kling-video/..."
  const falEndpointPattern =
    /(?:fal-ai|easel-ai|fashn|cartesia)\/[\w./-]+/gi;
  let endpointMatch;
  const seenEndpoints = new Set<string>();

  while ((endpointMatch = falEndpointPattern.exec(html)) !== null) {
    const endpoint = endpointMatch[0]
      .replace(/\/api\/?$/, "")   // Strip trailing /api (doc page URLs)
      .replace(/\/$/, "");        // Strip trailing slash
    if (seenEndpoints.has(endpoint)) continue;
    if (endpoint.length < 8) continue; // Too short to be a real endpoint
    seenEndpoints.add(endpoint);

    // Get surrounding context for name/price
    const start = Math.max(0, endpointMatch.index - 300);
    const end = Math.min(
      html.length,
      endpointMatch.index + endpoint.length + 300
    );
    const context = html.slice(start, end);

    // Try to extract a human-readable name
    const namePatterns = [
      /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i,
      /(?:title|name|label)["']\s*:\s*["']([^"']+)/i,
      /class="[^"]*(?:title|name|heading)[^"]*"[^>]*>([^<]+)/i,
    ];

    let name = endpoint; // Fallback to endpoint as name
    for (const np of namePatterns) {
      const nm = context.match(np);
      if (nm) {
        const cleaned = stripHtml(nm[1]).trim();
        if (cleaned.length > 2 && cleaned.length < 100) {
          name = cleaned;
          break;
        }
      }
    }

    // Extract price
    const priceMatch = context.match(/\$\s*([\d.]+)/);
    const price = priceMatch ? parseFloat(priceMatch[1]) : undefined;

    models.push({
      provider: "fal.ai",
      modelName: name,
      modelId: endpoint,
      costPerCallUsd: price,
      pricingNotes: priceMatch ? `Scraped: ${priceMatch[0]}` : undefined,
      rawData: { endpoint, context: stripHtml(context).substring(0, 300) },
    });
  }

  // Also try known fal.ai model name patterns
  const knownFalPatterns = [
    /kling[\s-]*(?:video|avatar)/gi,
    /wan[\s-]*(?:i2v|flf)/gi,
    /veo[\s-]*\d/gi,
    /seedance/gi,
    /hailuo/gi,
    /flux[\s-]*\d/gi,
    /esrgan/gi,
    /longcat/gi,
    /clarity[\s-]*upscal/gi,
    /minimax/gi,
  ];

  for (const pattern of knownFalPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const name = stripHtml(match[0]).trim();
      const normalized = name.toLowerCase().replace(/\s+/g, "-");
      if (!models.some((m) => m.modelId.includes(normalized))) {
        const start = Math.max(0, match.index - 200);
        const end = Math.min(html.length, match.index + match[0].length + 300);
        const context = html.slice(start, end);
        const priceMatch = context.match(/\$\s*([\d.]+)/);

        models.push({
          provider: "fal.ai",
          modelName: name,
          modelId: `fal-ai/${normalized}`,
          costPerCallUsd: priceMatch
            ? parseFloat(priceMatch[1])
            : undefined,
          pricingNotes: priceMatch ? `Scraped: ${priceMatch[0]}` : undefined,
          rawData: { context: stripHtml(context).substring(0, 300) },
        });
      }
    }
  }

  if (models.length > 0) {
    console.log(
      `  [fal.ai] Extracted ${models.length} models via HTML/endpoint matching`
    );
  } else {
    console.warn(
      `  [fal.ai] WARNING: Could not extract any models from models page. Page structure may have changed.`
    );
    console.warn(
      `  [fal.ai] HTML length: ${html.length} chars. First 200: ${html.substring(0, 200).replace(/\n/g, " ")}`
    );
  }

  return models;
}

function extractModelsFromFalData(data: unknown, depth = 0): ScrapedModel[] {
  if (depth > 10) return [];
  if (!data || typeof data !== "object") return [];

  if (Array.isArray(data)) {
    const hasModelLikeItems = data.some(
      (item) =>
        item &&
        typeof item === "object" &&
        (item.name || item.model_name || item.title || item.endpoint || item.id)
    );
    if (hasModelLikeItems && data.length >= 2) {
      return data
        .map((item) => normalizeFalModel(item))
        .filter((m): m is ScrapedModel => m !== null);
    }
  }

  const results: ScrapedModel[] = [];
  const obj = data as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (
      [
        "models",
        "endpoints",
        "items",
        "data",
        "pageProps",
        "props",
        "dehydratedState",
        "queries",
        "results",
      ].includes(key)
    ) {
      const sub = extractModelsFromFalData(obj[key], depth + 1);
      results.push(...sub);
    }
  }
  return results;
}

function normalizeFalModel(
  item: Record<string, unknown>
): ScrapedModel | null {
  const name =
    (item.name as string) ||
    (item.model_name as string) ||
    (item.title as string) ||
    (item.label as string);
  const endpoint =
    (item.endpoint as string) ||
    (item.id as string) ||
    (item.slug as string);

  if (!name && !endpoint) return null;

  const id = endpoint || name!.toLowerCase().replace(/\s+/g, "-");
  const displayName = name || endpoint || id;

  let price: number | undefined;
  if (typeof item.price === "number") price = item.price;
  else if (typeof item.price === "string")
    price = parseFloat(item.price) || undefined;
  else if (item.pricing && typeof item.pricing === "object") {
    const p = item.pricing as Record<string, unknown>;
    price =
      (p.per_call as number) ||
      (p.per_second as number) ||
      (p.base as number) ||
      undefined;
  }

  return {
    provider: "fal.ai",
    modelName: displayName,
    modelId: id,
    category: (item.category as string) || (item.type as string) || undefined,
    costPerCallUsd: price,
    status: item.deprecated === true ? "deprecated" : undefined,
    rawData: item,
  };
}

// ═══════════════════════════════════════════════════════════
// HTML UTILITIES
// ═══════════════════════════════════════════════════════════

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ═══════════════════════════════════════════════════════════
// DATABASE OPERATIONS
// ═══════════════════════════════════════════════════════════

async function getExistingModels(
  pool: pg.Pool,
  provider: string
): Promise<
  Map<
    string,
    {
      id: string;
      model_id: string;
      model_name: string;
      status: string;
      cost_per_call_usd: number | null;
      cost_per_5s_usd: number | null;
      cost_per_second_usd: number | null;
      cost_per_image_usd: number | null;
      cost_per_1m_input_usd: number | null;
      cost_per_1m_output_usd: number | null;
      pricing_notes: string | null;
      raw_pricing_data: unknown;
    }
  >
> {
  const result = await pool.query(
    `SELECT id, model_id, model_name, status,
            cost_per_call_usd, cost_per_5s_usd, cost_per_second_usd,
            cost_per_image_usd, cost_per_1m_input_usd, cost_per_1m_output_usd,
            pricing_notes, raw_pricing_data
     FROM ai_models
     WHERE provider = $1`,
    [provider]
  );

  const map = new Map<string, (typeof result.rows)[0]>();
  for (const row of result.rows) {
    // Index by model_id for direct lookup
    map.set(row.model_id, row);
    // Also index by normalized model_name for fuzzy matching
    map.set(`name:${row.model_name.toLowerCase()}`, row);
  }
  return map;
}

/**
 * Try to match a scraped model to an existing DB record.
 * Uses model_id first, then falls back to fuzzy name matching.
 */
function findExistingModel(
  scraped: ScrapedModel,
  existing: Map<string, { id: string; model_id: string; model_name: string; [key: string]: unknown }>
): { id: string; model_id: string; model_name: string; [key: string]: unknown } | null {
  // Direct model_id match
  const direct = existing.get(scraped.modelId);
  if (direct) return direct;

  // Fuzzy name match
  const byName = existing.get(`name:${scraped.modelName.toLowerCase()}`);
  if (byName) return byName;

  // Partial match: check if scraped name is contained in any existing model name
  for (const [key, val] of existing.entries()) {
    if (key.startsWith("name:")) continue;
    const existingName = val.model_name.toLowerCase();
    const scrapedName = scraped.modelName.toLowerCase();
    if (
      existingName.includes(scrapedName) ||
      scrapedName.includes(existingName)
    ) {
      return val;
    }
  }

  return null;
}

/**
 * Compare a scraped model against an existing DB record and detect changes.
 */
function detectChanges(
  scraped: ScrapedModel,
  existing: { id: string; model_id: string; model_name: string; [key: string]: unknown }
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];

  // Check price changes (only if scraped data has pricing)
  if (scraped.costPerCallUsd !== undefined) {
    const existingPrice = existing.cost_per_call_usd as number | null;
    if (
      existingPrice !== null &&
      existingPrice !== undefined &&
      Math.abs(existingPrice - scraped.costPerCallUsd) > 0.001
    ) {
      changes.push({
        modelId: existing.model_id,
        provider: scraped.provider,
        modelName: existing.model_name,
        field: "cost_per_call_usd",
        oldValue: String(existingPrice),
        newValue: String(scraped.costPerCallUsd),
        changeType: "price_change",
      });
    }
  }

  // Check status changes
  if (scraped.status && existing.status !== scraped.status) {
    const changeType =
      scraped.status === "deprecated" ? "deprecation" : "status_change";
    changes.push({
      modelId: existing.model_id,
      provider: scraped.provider,
      modelName: existing.model_name,
      field: "status",
      oldValue: existing.status as string,
      newValue: scraped.status,
      changeType,
    });
  }

  return changes;
}

/**
 * Apply a change to the database: update the ai_models row and log to ai_model_decisions.
 */
async function applyChange(
  pool: pg.Pool,
  change: ChangeRecord,
  existingId: string
): Promise<void> {
  if (DRY_RUN) {
    console.log(
      `  [DRY RUN] Would update ${change.provider}/${change.modelName}: ${change.field} ${change.oldValue} -> ${change.newValue}`
    );
    return;
  }

  // Update the ai_models row
  if (change.field === "status") {
    await pool.query(
      `UPDATE ai_models SET status = $1, updated_at = NOW() WHERE id = $2`,
      [change.newValue, existingId]
    );
  } else if (change.field === "cost_per_call_usd") {
    await pool.query(
      `UPDATE ai_models SET cost_per_call_usd = $1, updated_at = NOW(), last_price_change = NOW()
       WHERE id = $2`,
      [parseFloat(change.newValue!), existingId]
    );
  } else {
    // Generic field update
    await pool.query(
      `UPDATE ai_models SET ${change.field} = $1, updated_at = NOW() WHERE id = $2`,
      [change.newValue, existingId]
    );
  }

  // Log to ai_model_decisions
  const reasoning = `[auto_sync] ${change.changeType}: ${change.field} changed from ${change.oldValue ?? "NULL"} to ${change.newValue ?? "NULL"} for ${change.provider}/${change.modelName}`;
  await pool.query(
    `INSERT INTO ai_model_decisions (use_case, chosen_model_id, alternatives_considered, reasoning, created_by)
     VALUES ($1, $2, $3, $4, NULL)`,
    [
      "auto_sync",
      existingId,
      [
        `old:${change.oldValue ?? "NULL"}`,
        `new:${change.newValue ?? "NULL"}`,
        `field:${change.field}`,
        `type:${change.changeType}`,
      ],
      reasoning,
    ]
  );
}

/**
 * Handle a newly discovered model: insert a minimal record and log the discovery.
 */
async function handleNewModel(
  pool: pg.Pool,
  scraped: ScrapedModel
): Promise<void> {
  if (DRY_RUN) {
    console.log(
      `  [DRY RUN] Would insert new model: ${scraped.provider}/${scraped.modelName} (${scraped.modelId})`
    );
    return;
  }

  // Insert minimal record — manual review needed for full field population
  const result = await pool.query(
    `INSERT INTO ai_models (
       provider, model_name, model_id, category,
       cost_per_call_usd, pricing_notes, raw_pricing_data,
       status, last_checked
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
     ON CONFLICT (provider, model_id) DO UPDATE SET last_checked = NOW()
     RETURNING id`,
    [
      scraped.provider,
      scraped.modelName,
      scraped.modelId,
      scraped.category || "unknown",
      scraped.costPerCallUsd || null,
      scraped.pricingNotes
        ? `[auto_sync] ${scraped.pricingNotes}`
        : "[auto_sync] Discovered by daily sync — needs manual review",
      scraped.rawData ? JSON.stringify(scraped.rawData) : null,
      scraped.status || "active",
    ]
  );

  if (result.rows[0]) {
    // Log the discovery
    await pool.query(
      `INSERT INTO ai_model_decisions (use_case, chosen_model_id, alternatives_considered, reasoning)
       VALUES ($1, $2, $3, $4)`,
      [
        "auto_sync",
        result.rows[0].id,
        [`provider:${scraped.provider}`, `source:daily_sync`],
        `[auto_sync] new_model: Discovered ${scraped.provider}/${scraped.modelName} (${scraped.modelId}) on market page. Needs manual review for full field population.`,
      ]
    );
  }
}

/**
 * Detect models that were in the DB but NOT found on the scraped page.
 * These may have been removed/deprecated.
 */
function detectRemovedModels(
  existing: Map<string, { id: string; model_id: string; model_name: string; status: string; [key: string]: unknown }>,
  scraped: ScrapedModel[],
  provider: string
): ChangeRecord[] {
  const changes: ChangeRecord[] = [];

  // Build set of scraped model IDs and names for lookup
  const scrapedIds = new Set(scraped.map((s) => s.modelId));
  const scrapedNames = new Set(
    scraped.map((s) => s.modelName.toLowerCase())
  );

  for (const [key, model] of existing.entries()) {
    // Skip name-indexed entries
    if (key.startsWith("name:")) continue;

    // Skip already deprecated models
    if (model.status === "deprecated" || model.status === "removed") continue;

    // Check if this model was found in scraped data
    const foundById = scrapedIds.has(model.model_id);
    const foundByName = scrapedNames.has(model.model_name.toLowerCase());
    const foundByPartial = scraped.some(
      (s) =>
        s.modelName.toLowerCase().includes(model.model_name.toLowerCase()) ||
        model.model_name.toLowerCase().includes(s.modelName.toLowerCase())
    );

    if (!foundById && !foundByName && !foundByPartial) {
      // Model was not found on the page — flag for review, but don't auto-deprecate
      // (the scraper might have missed it due to page structure changes)
      changes.push({
        modelId: model.model_id,
        provider,
        modelName: model.model_name,
        field: "status",
        oldValue: model.status,
        newValue: "review_needed",
        changeType: "deprecation",
      });
    }
  }

  return changes;
}

/**
 * Update last_checked timestamp for all models of a given provider.
 */
async function updateLastChecked(
  pool: pg.Pool,
  provider: string
): Promise<number> {
  if (DRY_RUN) {
    console.log(
      `  [DRY RUN] Would update last_checked for all ${provider} models`
    );
    return 0;
  }
  const result = await pool.query(
    `UPDATE ai_models SET last_checked = NOW() WHERE provider = $1`,
    [provider]
  );
  return result.rowCount || 0;
}

// ═══════════════════════════════════════════════════════════
// MAIN SYNC LOGIC
// ═══════════════════════════════════════════════════════════

async function syncProvider(
  pool: pg.Pool,
  provider: string,
  url: string,
  parser: (html: string) => ScrapedModel[]
): Promise<{ changes: ChangeRecord[]; newModels: ScrapedModel[]; checked: number }> {
  const changes: ChangeRecord[] = [];
  const newModels: ScrapedModel[] = [];

  console.log(`\nSyncing ${provider} from ${url}...`);

  // Fetch page
  const html = await fetchPage(url);
  if (!html) {
    console.warn(`  [${provider}] Skipping — could not fetch page`);
    // Still update last_checked so we know we tried
    const checked = await updateLastChecked(pool, provider);
    return { changes, newModels, checked };
  }

  // Parse models from HTML
  const scraped = parser(html);
  console.log(`  [${provider}] Parsed ${scraped.length} models from page`);

  // Get existing models from DB
  const existing = await getExistingModels(pool, provider);
  const existingCount = [...existing.keys()].filter(
    (k) => !k.startsWith("name:")
  ).length;
  console.log(`  [${provider}] ${existingCount} models in database`);

  // Compare each scraped model against DB
  for (const scraped_model of scraped) {
    const match = findExistingModel(scraped_model, existing);

    if (match) {
      // Existing model — check for changes
      const modelChanges = detectChanges(scraped_model, match);
      for (const change of modelChanges) {
        console.log(
          `  CHANGE: ${change.modelName} — ${change.field}: ${change.oldValue} -> ${change.newValue}`
        );
        await applyChange(pool, change, match.id);
        changes.push(change);
      }
    } else {
      // New model not in DB
      console.log(
        `  NEW: ${scraped_model.modelName} (${scraped_model.modelId})`
      );
      await handleNewModel(pool, scraped_model);
      newModels.push(scraped_model);
    }
  }

  // Check for removed/deprecated models — only if we scraped a meaningful
  // proportion of the known catalog. If the scraper got < 50% of existing
  // models, it's more likely a scraping failure than mass-removal.
  const existingActiveCount = [...existing.entries()]
    .filter(([k, v]) => !k.startsWith("name:") && v.status === "active")
    .length;
  const coverageRatio =
    existingActiveCount > 0 ? scraped.length / existingActiveCount : 1;

  if (scraped.length >= 3 && coverageRatio >= 0.5) {
    const removed = detectRemovedModels(existing, scraped, provider);
    for (const change of removed) {
      console.log(
        `  POSSIBLY REMOVED: ${change.modelName} — not found on page (flagged for review)`
      );
      // Don't auto-deprecate — just log. Manual review needed.
      if (!DRY_RUN) {
        const model = existing.get(change.modelId);
        if (model) {
          await pool.query(
            `INSERT INTO ai_model_decisions (use_case, chosen_model_id, alternatives_considered, reasoning)
             VALUES ($1, $2, $3, $4)`,
            [
              "auto_sync",
              model.id,
              [`old_status:${change.oldValue}`, "detection:not_found_on_page"],
              `[auto_sync] review_needed: ${change.provider}/${change.modelName} was NOT found on the market page. May be removed, renamed, or hidden. Manual review recommended. NOT auto-deprecated.`,
            ]
          );
        }
      }
      changes.push(change);
    }
  } else if (scraped.length >= 1 && coverageRatio < 0.5) {
    console.log(
      `  [${provider}] Scraped ${scraped.length}/${existingActiveCount} known models (${(coverageRatio * 100).toFixed(0)}% coverage) — skipping removal detection (likely scraper limitation)`
    );
  }

  // Update last_checked for all models of this provider
  const checked = await updateLastChecked(pool, provider);
  console.log(`  [${provider}] Updated last_checked for ${checked} models`);

  return { changes, newModels, checked };
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Model Observatory — Daily Sync");
  console.log(`  ${new Date().toISOString()}`);
  if (DRY_RUN) console.log("  ** DRY RUN MODE — no DB writes **");
  console.log("═══════════════════════════════════════════════════════════");

  const pool = new pg.Pool({
    connectionString: DB_URL,
    max: 3,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });

  // Verify DB connection
  try {
    const test = await pool.query("SELECT COUNT(*) FROM ai_models");
    console.log(`\nDatabase connected. ${test.rows[0].count} models in registry.`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`FATAL: Cannot connect to database: ${message}`);
    console.error(`DB URL: ${DB_URL.replace(/:[^@]+@/, ":***@")}`);
    await pool.end();
    process.exit(1);
  }

  const allChanges: ChangeRecord[] = [];
  const allNewModels: ScrapedModel[] = [];
  let totalChecked = 0;
  const providerErrors: string[] = [];

  // ── Sync Kie.ai ──
  try {
    const kie = await syncProvider(pool, "kie.ai", KIE_MARKET_URL, parseKieMarket);
    allChanges.push(...kie.changes);
    allNewModels.push(...kie.newModels);
    totalChecked += kie.checked;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nERROR syncing kie.ai: ${message}`);
    providerErrors.push(`kie.ai: ${message}`);
  }

  // ── Sync fal.ai ──
  try {
    const fal = await syncProvider(pool, "fal.ai", FAL_MODELS_URL, parseFalModels);
    allChanges.push(...fal.changes);
    allNewModels.push(...fal.newModels);
    totalChecked += fal.checked;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nERROR syncing fal.ai: ${message}`);
    providerErrors.push(`fal.ai: ${message}`);
  }

  // ── Print Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  SYNC SUMMARY");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Duration:          ${elapsed}s`);
  console.log(`  Models checked:    ${totalChecked}`);
  console.log(`  New models found:  ${allNewModels.length}`);
  console.log(`  Changes detected:  ${allChanges.length}`);
  console.log(`  Provider errors:   ${providerErrors.length}`);

  if (allNewModels.length > 0) {
    console.log("\n  New Models:");
    for (const m of allNewModels) {
      console.log(
        `    + ${m.provider}/${m.modelName} (${m.modelId})${m.costPerCallUsd ? ` — $${m.costPerCallUsd}` : ""}`
      );
    }
  }

  if (allChanges.length > 0) {
    console.log("\n  Changes:");
    for (const c of allChanges) {
      const icon =
        c.changeType === "price_change"
          ? "$"
          : c.changeType === "deprecation"
            ? "X"
            : c.changeType === "status_change"
              ? "~"
              : "?";
      console.log(
        `    [${icon}] ${c.provider}/${c.modelName}: ${c.field} ${c.oldValue} -> ${c.newValue}`
      );
    }
  }

  if (providerErrors.length > 0) {
    console.log("\n  Errors:");
    for (const e of providerErrors) {
      console.log(`    ! ${e}`);
    }
  }

  if (
    allNewModels.length === 0 &&
    allChanges.length === 0 &&
    providerErrors.length === 0
  ) {
    console.log("\n  No changes detected. All models up to date.");
  }

  console.log("\n═══════════════════════════════════════════════════════════");

  await pool.end();

  // Exit with non-zero if there were errors (useful for cron monitoring)
  if (providerErrors.length > 0) {
    process.exit(2);
  }
}

// ═══════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════

main().catch((err) => {
  console.error("FATAL unhandled error:", err);
  process.exit(1);
});
