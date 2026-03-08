/**
 * claudeclaw-router.ts — Context enrichment and prompt routing for ClaudeClaw personal mode
 *
 * Enriches incoming messages with:
 * 1. RAG context (semantic search on system docs)
 * 2. Mode-specific system prompts (personal vs business)
 */

import { config } from "../config";
import { logger } from "../utils/logger";
import { searchForContext } from "./rag";

export interface EnhancedPrompt {
    enrichedMessage: string;
    systemPrompt: string;
}

const SYSTEM_TENANT = (config as any).rag?.systemTenant || "system";

// ─── System Prompts by Mode ───────────────────────────────────

const PERSONAL_SYSTEM_PROMPT = `You are Claude, Shai's personal AI assistant integrated via WhatsApp.
You have full access to SuperSeller AI's project context via tools and memory.
You are proactive, direct, and concise — this is WhatsApp, not email.
Use *bold*, _italic_, and bullet points for clarity.
You know about: TourReel, FB Marketplace Bot, SocialHub, ClaudeClaw, Winner Studio, Elite Pro Remodeling, UAD, Miss Party, and all SuperSeller AI infrastructure.
When asked about system health, jobs, or status — use the /health and /status tools.
Never reveal API keys, database passwords, or internal pricing.`;

const BUSINESS_SYSTEM_PROMPT = `You are the SuperSeller AI assistant, helping customers via WhatsApp.
You are professional, helpful, and concise.
You answer questions about our services, video creation, lead generation, and marketing automation.
Refer complex technical questions to our team.
Use *bold*, _italic_, and emojis sparingly for readability.`;

// ─── Main Export ──────────────────────────────────────────────

/**
 * Build an enriched prompt for ClaudeClaw personal/business mode.
 * Injects relevant RAG context and mode-specific system prompt.
 */
export async function buildEnhancedPrompt(
    message: string,
    mode: string,
): Promise<EnhancedPrompt> {
    const systemPrompt = mode === "personal" ? PERSONAL_SYSTEM_PROMPT : BUSINESS_SYSTEM_PROMPT;

    let ragContext = "";
    try {
        ragContext = await searchForContext(message, SYSTEM_TENANT, 4);
    } catch (err) {
        logger.warn({ msg: "RAG context search failed", error: (err as Error).message });
    }

    const enrichedMessage = ragContext
        ? `[Relevant system context]\n${ragContext}\n\n---\n\n${message}`
        : message;

    return { enrichedMessage, systemPrompt };
}
