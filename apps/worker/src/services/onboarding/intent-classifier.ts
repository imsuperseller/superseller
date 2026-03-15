/**
 * intent-classifier.ts -- Claude API-powered change request intent classification
 *
 * Classifies customer messages (e.g. "make her hair shorter in scene 3") into
 * structured intents: scene-change, character-change, positive-feedback, unrelated, ambiguous.
 *
 * Used by: change-request-handler.ts (Plan 02 orchestrator)
 */

import { logger } from "../../utils/logger";
import { trackExpense, COST_RATES } from "../expense-tracker";
import { sendAdminAlert } from "../admin-alerts";

// ── Constants ─────────────────────────────────────────────────

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

// ── Types ─────────────────────────────────────────────────────

export interface ChangeRequestClassification {
    intent: "scene-change" | "character-change" | "positive-feedback" | "unrelated" | "ambiguous";
    sceneNumber: number | null;
    changeSummary: string;
    clarifyingQuestion?: string;
}

// ── Prompt Builder ─────────────────────────────────────────────

/**
 * Build the system prompt for intent classification.
 * When scenarioNames is empty/null, Claude uses ordinal-only matching.
 */
function buildClassificationPrompt(
    messageBody: string,
    scenarioNames: string[] | null | undefined,
    sceneCount: number,
): string {
    const hasScenes = scenarioNames && scenarioNames.length > 0;

    const sceneList = hasScenes
        ? scenarioNames
              .map((name, i) => `  Scene ${i + 1}: ${name}`)
              .join("\n")
        : `  Total scenes: ${sceneCount} (names not available — use ordinal matching only)`;

    const sceneMatchingRules = hasScenes
        ? `- If the message references a scene by name (e.g. "Office scene", "the coffee shop one") match to the scene number from the list above.
- If the message references by ordinal (e.g. "first", "second", "third") use the ordinal map below.
- If the message references by number (e.g. "scene 3") extract the number directly.`
        : `- Scene names are not available. Match ONLY by ordinal or direct number.
- Ordinal references (first=1, second=2, etc.) are valid.
- Description-based references (e.g. "the coffee shop one") CANNOT be resolved — return intent: "ambiguous" with clarifyingQuestion.`;

    return `You are a change request classifier for an AI video production system.

A customer has submitted a message after reviewing their brand character video. Classify the message.

SCENE LIST:
${sceneList}

ORDINAL MAP: first=1, second=2, third=3, fourth=4, fifth=5

SCENE MATCHING RULES:
${sceneMatchingRules}

INTENT CATEGORIES:
1. scene-change — Customer wants to modify a specific scene (lighting, props, wardrobe, action, setting for one scene). Must resolve to a sceneNumber.
2. character-change — Customer wants to modify the character's appearance, personality, or attributes across ALL scenes (hair color, clothing style, makeup, demeanor). sceneNumber is null.
3. positive-feedback — Customer expresses satisfaction, approval, or general positive sentiment (e.g. "love it!", "looks great", "perfect").
4. unrelated — Message is not about the video or character at all (e.g. billing questions, scheduling).
5. ambiguous — Cannot confidently determine intent, or a scene reference cannot be resolved. MUST include clarifyingQuestion.

RESPONSE FORMAT (JSON only, no markdown):
{
  "intent": "scene-change" | "character-change" | "positive-feedback" | "unrelated" | "ambiguous",
  "sceneNumber": <number 1-${sceneCount} for scene-change> | null,
  "changeSummary": "<1-sentence summary of what the customer wants changed, or empty string for positive-feedback/unrelated>",
  "clarifyingQuestion": "<question to ask if ambiguous>"
}

Customer message: "${messageBody}"

Respond with ONLY the JSON object.`;
}

// ── Fallback ───────────────────────────────────────────────────

const AMBIGUOUS_FALLBACK: ChangeRequestClassification = {
    intent: "ambiguous",
    sceneNumber: null,
    changeSummary: "",
    clarifyingQuestion: "Could you describe what you'd like changed?",
};

// ── Main Export ────────────────────────────────────────────────

/**
 * Classify a customer change request message using Claude API.
 * Never throws — returns ambiguous fallback on API failure or parse error.
 */
export async function classifyChangeRequest(
    messageBody: string,
    scenarioNames: string[] | null | undefined,
    sceneCount: number,
): Promise<ChangeRequestClassification> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        logger.error({ msg: "classifyChangeRequest: ANTHROPIC_API_KEY not set" });
        return AMBIGUOUS_FALLBACK;
    }

    const systemPrompt = buildClassificationPrompt(messageBody, scenarioNames, sceneCount);

    let rawText: string | null = null;
    try {
        const res = await fetch(ANTHROPIC_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 400,
                messages: [{ role: "user", content: systemPrompt }],
            }),
        });

        if (!res.ok) {
            const body = await res.text().catch(() => "");
            const errMsg = `Claude API error ${res.status}: ${body.slice(0, 200)}`;
            logger.error({ msg: "classifyChangeRequest: API error", status: res.status });
            await sendAdminAlert({
                error: errMsg,
                module: "intent-classifier",
                groupId: "unknown",
            });
            return AMBIGUOUS_FALLBACK;
        }

        const json: any = await res.json();
        rawText = json?.content?.[0]?.text ?? null;
    } catch (err: any) {
        const errMsg = `classifyChangeRequest: fetch failed — ${err.message}`;
        logger.error({ msg: errMsg });
        await sendAdminAlert({
            error: errMsg,
            module: "intent-classifier",
            groupId: "unknown",
        });
        return AMBIGUOUS_FALLBACK;
    }

    if (!rawText) {
        logger.error({ msg: "classifyChangeRequest: Claude returned empty response" });
        return AMBIGUOUS_FALLBACK;
    }

    // Parse JSON from Claude's response
    let classification: ChangeRequestClassification;
    try {
        // Strip code fences if Claude adds them despite instructions
        const cleaned = rawText.replace(/```(?:json)?\n?/g, "").trim();
        classification = JSON.parse(cleaned) as ChangeRequestClassification;
    } catch (parseErr: any) {
        logger.warn({
            msg: "classifyChangeRequest: JSON parse failed, returning ambiguous",
            raw: rawText.slice(0, 200),
            error: parseErr.message,
        });
        return AMBIGUOUS_FALLBACK;
    }

    // Track expense (small classification call — use haiku rate)
    try {
        await trackExpense({
            service: "anthropic",
            operation: "intent-classification",
            estimatedCost: COST_RATES.anthropic?.haiku_message ?? 0.02,
        });
    } catch {
        // Non-blocking — never fail classification over tracking
    }

    logger.info({
        msg: "classifyChangeRequest: classified",
        intent: classification.intent,
        sceneNumber: classification.sceneNumber,
    });

    return classification;
}
