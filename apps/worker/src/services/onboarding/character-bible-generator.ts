/**
 * character-bible-generator.ts -- Claude-powered CharacterBible generation
 *
 * Accepts questionnaire answers, calls Claude API to synthesize a structured
 * character profile, then inserts a CharacterBible row into the database.
 *
 * Used by: modules/character-questionnaire.ts (called on confirming + "yes")
 */

import { query } from "../../db/client";
import { logger } from "../../utils/logger";

// ── Types ────────────────────────────────────────────────────

export interface CharacterData {
    name: string;
    personality: string;
    visualStyle: string;
    audience: string;
    scenarios: string[];
}

interface CharacterBibleJson {
    personaDescription: string;
    visualStyle: string;
    soraHandle: string;
    metadata: {
        personality_keywords: string[];
        target_demo: string;
        brand_tone: string;
        scenario_prompts: string[];
    };
}

// ── Claude API ────────────────────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(prompt: string): Promise<string | null> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        logger.error({ msg: "ANTHROPIC_API_KEY not set — cannot generate CharacterBible" });
        return null;
    }

    const res = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: MODEL,
            max_tokens: 1500,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        logger.error({ msg: "Claude API error", status: res.status, body: text });
        return null;
    }

    const json: any = await res.json();
    const content = json?.content?.[0]?.text ?? "";
    return content || null;
}

// ── Main Export ──────────────────────────────────────────────

/**
 * Generate and persist a CharacterBible from questionnaire data.
 * Returns the new CharacterBible ID on success, null on failure.
 */
export async function generateCharacterBible(
    tenantId: string,
    data: CharacterData,
): Promise<string | null> {
    logger.info({ msg: "Generating CharacterBible", tenantId, characterName: data.name });

    const prompt = buildPrompt(data);

    let rawResponse: string | null = null;
    try {
        rawResponse = await callClaude(prompt);
    } catch (err: any) {
        logger.error({ msg: "Claude API call failed", error: err.message, tenantId });
        return null;
    }

    if (!rawResponse) {
        logger.error({ msg: "Claude returned empty response", tenantId });
        return null;
    }

    // Parse JSON response (with fallback to raw text)
    let parsed: CharacterBibleJson | null = null;
    try {
        parsed = JSON.parse(rawResponse) as CharacterBibleJson;
    } catch {
        logger.warn({ msg: "Claude response is not valid JSON -- using raw text as personaDescription", tenantId });
        parsed = {
            personaDescription: rawResponse,
            visualStyle: data.visualStyle,
            soraHandle: data.name.toLowerCase().replace(/\s+/g, "_"),
            metadata: {
                personality_keywords: [],
                target_demo: data.audience,
                brand_tone: "professional",
                scenario_prompts: data.scenarios,
            },
        };
    }

    // Insert CharacterBible into DB
    try {
        const row = await query(
            `INSERT INTO "CharacterBible" (id, "tenantId", name, "personaDescription", "visualStyle", "soraHandle", metadata, "createdAt", "updatedAt")
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6::jsonb, NOW(), NOW())
             RETURNING id`,
            [
                tenantId,
                data.name,
                parsed.personaDescription,
                parsed.visualStyle,
                parsed.soraHandle,
                JSON.stringify(parsed.metadata),
            ],
        );

        const id = Array.isArray(row) ? row[0]?.id : (row as any)?.rows?.[0]?.id;
        logger.info({ msg: "CharacterBible created", id, tenantId, characterName: data.name });
        return id ?? null;
    } catch (err: any) {
        logger.error({ msg: "DB insert failed for CharacterBible", error: err.message, tenantId });
        return null;
    }
}

// ── Prompt Builder ────────────────────────────────────────────

function buildPrompt(data: CharacterData): string {
    return `You are creating an AI brand character bible for a business. Based on the following questionnaire answers, create a detailed character profile.

Character Name: ${data.name}
Personality: ${data.personality}
Visual Style: ${data.visualStyle}
Target Audience: ${data.audience}
Business Scenarios: ${data.scenarios.join(", ")}

Respond with ONLY a JSON object (no markdown, no code fences):
{
  "personaDescription": "Full persona description for AI video generation (2-3 paragraphs)",
  "visualStyle": "Detailed visual description for Sora 2 prompts",
  "soraHandle": "Suggested @handle for Sora 2 character reference (lowercase, no spaces)",
  "metadata": {
    "personality_keywords": ["keyword1", "keyword2"],
    "target_demo": "brief audience summary",
    "brand_tone": "professional/casual/energetic/etc",
    "scenario_prompts": ["prompt for scenario 1", "prompt for scenario 2", "prompt for scenario 3"]
  }
}`;
}
