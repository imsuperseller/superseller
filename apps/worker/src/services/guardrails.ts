/**
 * guardrails.ts — 4-layer output/input safety filters for ClaudeClaw group agent
 *
 * Layer 1: Output regex filter — blocks cost/margin/vendor/infra leaks
 * Layer 2: Input jailbreak detection — rejects prompt injection attempts
 * Layer 3: System prompt anchoring — enforced in buildGroupSystemPrompt()
 * Layer 4: RAG tenant isolation — enforced in search() calls with tenantId
 */

import { logger } from "../utils/logger";

// ─── Layer 1: Output Filter Patterns ─────────────────────────

interface LeakPattern {
    name: string;
    pattern: RegExp;
    replacement: string;
}

const OUTPUT_LEAK_PATTERNS: LeakPattern[] = [
    // Cost / margin / profit data
    {
        name: "cost-amount",
        pattern: /\$\d+(\.\d+)?\s*(cost|margin|profit|markup|spend|expense|fee|rate|charge|invoice)/gi,
        replacement: "[REDACTED]",
    },
    {
        name: "margin-pct",
        pattern: /\d+(\.\d+)?%\s*(margin|profit|markup|commission|cut)/gi,
        replacement: "[REDACTED]",
    },
    // Vendor/API secrets
    {
        name: "api-key",
        pattern: /\b(sk-|pk_live_|rk_live_|Bearer\s+[A-Za-z0-9\-_]{20,})/g,
        replacement: "[API_KEY_REDACTED]",
    },
    {
        name: "password-reveal",
        pattern: /password\s*(is|=|:)\s*\S+/gi,
        replacement: "password: [REDACTED]",
    },
    // Internal vendor names + pricing
    {
        name: "vendor-pricing",
        pattern: /(kie\.ai|kling|suno|recraft|nano banana|elevenlabs|telnyx)\s+costs?\s+\$[\d.]+/gi,
        replacement: "[VENDOR_PRICING_REDACTED]",
    },
    // Infrastructure internals
    {
        name: "internal-ip",
        pattern: /172\.245\.\d+\.\d+/g,
        replacement: "[INTERNAL_IP]",
    },
    {
        name: "db-connection",
        pattern: /postgresql:\/\/[^@\s]+@[^\s]+/gi,
        replacement: "[DB_URL_REDACTED]",
    },
    // Monthly revenue / business financials
    {
        name: "revenue-data",
        pattern: /(\$\d[\d,]*(\.\d+)?)\s*(\/mo|per month|monthly|revenue|ARR|MRR)/gi,
        replacement: "[FINANCIAL_DATA_REDACTED]",
    },
];

// ─── Layer 2: Input Jailbreak Patterns ───────────────────────

const JAILBREAK_PATTERNS: RegExp[] = [
    /ignore\s+(all\s+)?previous\s+(instructions|prompts?)/gi,
    /you\s+are\s+(now\s+)?(a\s+)?(different|new|uncensored)\s+(ai|assistant|model|bot)/gi,
    /pretend\s+(you\s+are|to\s+be)\s+.{0,50}(without\s+(restrictions|limits|guardrails))/gi,
    /developer\s+mode/gi,
    /jailbreak/gi,
    /bypass\s+(your\s+)?(safety|guardrails?|restrictions?|filters?)/gi,
    /reveal\s+(your\s+)?(system\s+prompt|instructions|prompt|training)/gi,
    /print\s+(your\s+)?(system\s+prompt|instructions)/gi,
    /forget\s+(everything|all)\s+(you|that)\s+(know|were\s+told)/gi,
    /\[SYSTEM\]|\[ADMIN\]|\[OVERRIDE\]/gi,
    /act\s+as\s+if\s+(you\s+have\s+no|without)\s+(restrictions?|limits?|rules?)/gi,
];

// ─── Public API ───────────────────────────────────────────────

export interface FilterResult {
    text: string;
    blocked: boolean;
    reason?: string;
    patternsMatched?: string[];
}

/**
 * Layer 1: Filter output before sending to WhatsApp.
 * Redacts sensitive patterns rather than blocking entirely.
 */
export function filterOutput(text: string): FilterResult {
    let filtered = text;
    const matched: string[] = [];

    for (const lp of OUTPUT_LEAK_PATTERNS) {
        if (lp.pattern.test(filtered)) {
            matched.push(lp.name);
            filtered = filtered.replace(lp.pattern, lp.replacement);
        }
        // Reset lastIndex for global patterns
        lp.pattern.lastIndex = 0;
    }

    if (matched.length > 0) {
        logger.warn({ msg: "Output guardrails triggered", patterns: matched });
        return { text: filtered, blocked: false, patternsMatched: matched };
    }

    return { text: filtered, blocked: false };
}

/**
 * Layer 2: Detect jailbreak attempts in user input.
 * Returns true if the message should be rejected.
 */
export function detectJailbreak(input: string): { isJailbreak: boolean; reason?: string } {
    for (const pattern of JAILBREAK_PATTERNS) {
        if (pattern.test(input)) {
            pattern.lastIndex = 0;
            logger.warn({ msg: "Jailbreak attempt detected", pattern: pattern.toString().slice(0, 60) });
            return { isJailbreak: true, reason: "Message contains restricted patterns" };
        }
        pattern.lastIndex = 0;
    }
    return { isJailbreak: false };
}

/**
 * Combined: Apply all output guardrails.
 * Returns safe text + whether anything was blocked/redacted.
 */
export function applyOutputGuardrails(text: string): FilterResult {
    // Layer 1 output filter
    const result = filterOutput(text);

    // If too much was redacted (>30% of content), flag it
    if (result.patternsMatched && result.patternsMatched.length > 3) {
        logger.error({ msg: "Heavy redaction — possible data leak attempt", patterns: result.patternsMatched });
        return {
            text: "I can't share that information here. Please contact us directly for details.",
            blocked: true,
            reason: "excessive_redaction",
            patternsMatched: result.patternsMatched,
        };
    }

    return result;
}

/**
 * Apply input guardrails (Layer 2 — jailbreak detection).
 * Returns rejection response if jailbreak detected.
 */
export function applyInputGuardrails(input: string): { safe: boolean; rejectionMessage?: string } {
    const { isJailbreak } = detectJailbreak(input);
    if (isJailbreak) {
        return {
            safe: false,
            rejectionMessage: "I'm here to help with your project. Let's keep the conversation on track!",
        };
    }
    return { safe: true };
}
