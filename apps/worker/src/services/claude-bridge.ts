/**
 * ClaudeClaw Bridge — Claude Agent SDK wrapper for WhatsApp.
 *
 * Spawns the real Claude Code CLI as a subprocess via @anthropic-ai/claude-agent-sdk.
 * Sessions persist per chat (phone number) for conversation continuity.
 * Memory: last N turns stored in PostgreSQL, injected as context.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "../config";
import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";

// ─── Knowledge Base Loader ────────────────────────────────────

let _knowledgeCache: string | null = null;

function loadKnowledgeBase(): string {
    if (_knowledgeCache) return _knowledgeCache;

    const kbDir = join(config.claudeclaw.projectDir, "knowledge");
    try {
        const files = readdirSync(kbDir).filter((f) => f.endsWith(".md")).sort();
        const sections = files.map((f) => {
            const content = readFileSync(join(kbDir, f), "utf-8");
            return content;
        });
        _knowledgeCache = sections.join("\n\n---\n\n");
        logger.info({ msg: "Knowledge base loaded", files: files.length, chars: _knowledgeCache.length });
        return _knowledgeCache;
    } catch {
        logger.warn({ msg: "No knowledge base found at " + kbDir });
        return "";
    }
}

/** Call to reload knowledge after editing files on disk */
export function reloadKnowledge(): void {
    _knowledgeCache = null;
    loadKnowledgeBase();
}

// ─── Database Init ────────────────────────────────────────────

export async function initClaudeClawTables(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS claudeclaw_sessions (
            chat_id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS claudeclaw_turns (
            id SERIAL PRIMARY KEY,
            chat_id TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await query(`
        CREATE INDEX IF NOT EXISTS idx_claudeclaw_turns_chat
        ON claudeclaw_turns(chat_id, created_at DESC)
    `);

    logger.info({ msg: "ClaudeClaw tables initialized" });
}

// ─── Session Management ───────────────────────────────────────

export async function getSession(chatId: string): Promise<string | null> {
    const row = await queryOne<{ session_id: string }>(
        "SELECT session_id FROM claudeclaw_sessions WHERE chat_id = $1",
        [chatId]
    );
    return row?.session_id || null;
}

export async function setSession(chatId: string, sessionId: string): Promise<void> {
    await query(
        `INSERT INTO claudeclaw_sessions (chat_id, session_id, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (chat_id) DO UPDATE SET session_id = $2, updated_at = NOW()`,
        [chatId, sessionId]
    );
}

export async function clearSession(chatId: string): Promise<void> {
    await query("DELETE FROM claudeclaw_sessions WHERE chat_id = $1", [chatId]);
}

// ─── Simple Memory (Last N Turns) ─────────────────────────────

async function getRecentTurns(chatId: string, limit: number = 10): Promise<string> {
    const rows = await query<{ role: string; content: string }>(
        `SELECT role, content FROM claudeclaw_turns
         WHERE chat_id = $1
         ORDER BY created_at DESC LIMIT $2`,
        [chatId, limit]
    );

    if (!rows.length) return "";

    // Reverse to chronological order
    const turns = rows.reverse();
    return turns
        .map((t) => `${t.role === "user" ? "Human" : "Assistant"}: ${t.content}`)
        .join("\n");
}

export async function saveTurn(chatId: string, role: "user" | "assistant", content: string): Promise<void> {
    if (!content || content.length < 2) return;

    await query(
        "INSERT INTO claudeclaw_turns (chat_id, role, content) VALUES ($1, $2, $3)",
        [chatId, role, content]
    );

    // Prune old turns (keep last 50 per chat)
    await query(
        `DELETE FROM claudeclaw_turns
         WHERE chat_id = $1 AND id NOT IN (
             SELECT id FROM claudeclaw_turns WHERE chat_id = $1
             ORDER BY created_at DESC LIMIT 50
         )`,
        [chatId]
    );
}

// ─── Claude Agent SDK Call ────────────────────────────────────

export type ClaudeClawMode = "personal" | "business";

export async function runAgent(
    message: string,
    chatId: string,
    onTyping?: () => void,
    mode: ClaudeClawMode = "personal",
): Promise<{ text: string | null; newSessionId?: string }> {
    // Dynamically import the SDK (allows worker to start even if SDK not installed)
    let sdkQuery: any;
    try {
        const sdk = await import("@anthropic-ai/claude-agent-sdk");
        sdkQuery = sdk.query;
    } catch {
        logger.error({ msg: "claude-agent-sdk not installed — ClaudeClaw disabled" });
        return { text: "ClaudeClaw is not configured on this server. Install @anthropic-ai/claude-agent-sdk." };
    }

    // Build context from recent turns with channel mode tag and knowledge
    const modeTag = mode === "business" ? "[BUSINESS]" : "[PERSONAL]";
    const knowledge = loadKnowledgeBase();
    const memoryContext = await getRecentTurns(chatId);

    const parts: string[] = [modeTag];
    if (knowledge) {
        parts.push(`[Knowledge Base]\n${knowledge}`);
    }
    if (memoryContext) {
        parts.push(`[Recent conversation context]\n${memoryContext}`);
    }
    parts.push(`[Current message]\n${message}`);
    const fullMessage = parts.join("\n\n");

    // Get existing session for continuity
    const existingSession = await getSession(chatId);

    let text: string | null = null;
    let newSessionId: string | undefined;

    try {
        // Build mode-specific system prompt
        const modeInstructions = mode === "business"
            ? "You are SuperSeller AI's customer-facing WhatsApp assistant. Be warm, professional, and helpful. Answer questions about products, pricing, and features using the knowledge base provided. Never expose internal details (server IPs, code, architecture). For complex requests, say 'Let me connect you with Shai' and note the request."
            : "You are Shai's personal technical assistant on WhatsApp. Be direct, technical, efficient. Execute tasks, don't explain plans.";

        const events = sdkQuery({
            prompt: fullMessage,
            options: {
                cwd: config.claudeclaw.projectDir,
                ...(existingSession ? { resume: existingSession } : {}),
                permissionMode: "bypassPermissions",
                allowDangerouslySkipPermissions: true,
                systemPrompt: [
                    "You are a WhatsApp AI assistant with FULL unrestricted tool access.",
                    "All permissions are pre-granted. NEVER ask for permission or confirmation to run commands.",
                    "NEVER say 'I need approval', 'Can I run', or 'Do you want me to'. Just execute directly.",
                    "This is a headless bot -- there is no human to approve tool calls.",
                    "",
                    modeInstructions,
                    "",
                    "Rules: No em dashes. No AI cliches (Certainly, Great question, I'd be happy to). Keep responses concise for WhatsApp. Max ~4000 chars.",
                ].join("\n"),
            },
        });

        // Keep typing indicator alive
        const typingInterval = onTyping
            ? setInterval(() => onTyping(), 4000)
            : null;

        try {
            for await (const event of events) {
                if (event.type === "system" && event.subtype === "init") {
                    newSessionId = event.sessionId;
                }
                if (event.type === "result") {
                    text = event.result;
                }
            }
        } finally {
            if (typingInterval) clearInterval(typingInterval);
        }

        // Persist session
        if (newSessionId) {
            await setSession(chatId, newSessionId);
        }

        // Save conversation turns
        await saveTurn(chatId, "user", message);
        if (text) {
            await saveTurn(chatId, "assistant", text);
        }
    } catch (err: any) {
        logger.error({ msg: "Claude Agent SDK execution failed", error: err.message, chatId });
        text = `Error: ${err.message}`;
    }

    return { text, newSessionId };
}

// ─── WhatsApp Formatting ──────────────────────────────────────

/**
 * Convert Claude's markdown to WhatsApp-compatible formatting.
 * WhatsApp supports: *bold*, _italic_, ~strikethrough~, ```code```, > quote
 */
export function formatForWhatsApp(text: string): string {
    if (!text) return "";

    // Protect code blocks
    const codeBlocks: string[] = [];
    let result = text.replace(/```[\s\S]*?```/g, (match) => {
        codeBlocks.push(match);
        return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
    });

    // Protect inline code
    const inlineCode: string[] = [];
    result = result.replace(/`([^`]+)`/g, (_, code) => {
        inlineCode.push(code);
        return `__INLINE_CODE_${inlineCode.length - 1}__`;
    });

    // Headers → bold
    result = result.replace(/^#{1,6}\s+(.+)$/gm, "*$1*");

    // Bold: **text** or __text__ → *text*
    result = result.replace(/\*\*(.+?)\*\*/g, "*$1*");
    result = result.replace(/__(.+?)__/g, "*$1*");

    // Italic: single * or _ (but not already converted bold)
    // Skip — WhatsApp uses _ for italic and * for bold, conflicts with markdown

    // Strikethrough: ~~text~~ → ~text~
    result = result.replace(/~~(.+?)~~/g, "~$1~");

    // Links: [text](url) → text (url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

    // Checkboxes
    result = result.replace(/^- \[ \]/gm, "☐");
    result = result.replace(/^- \[x\]/gm, "☑");

    // Bullet lists: keep - as is (WhatsApp renders them fine)

    // Horizontal rules → empty line
    result = result.replace(/^[-*]{3,}$/gm, "");

    // Restore inline code
    inlineCode.forEach((code, i) => {
        result = result.replace(`__INLINE_CODE_${i}__`, `\`${code}\``);
    });

    // Restore code blocks
    codeBlocks.forEach((block, i) => {
        result = result.replace(`__CODE_BLOCK_${i}__`, block);
    });

    return result.trim();
}

/**
 * Split long messages for WhatsApp (max ~4096 chars per message).
 * Splits on newlines, never mid-word.
 */
export function splitMessage(text: string, limit: number = 4000): string[] {
    if (text.length <= limit) return [text];

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > limit) {
        let splitIdx = remaining.lastIndexOf("\n", limit);
        if (splitIdx < limit * 0.3) {
            // No good newline break — split on space
            splitIdx = remaining.lastIndexOf(" ", limit);
        }
        if (splitIdx < limit * 0.3) {
            // Desperate — hard split
            splitIdx = limit;
        }
        chunks.push(remaining.slice(0, splitIdx));
        remaining = remaining.slice(splitIdx).trimStart();
    }
    if (remaining) chunks.push(remaining);

    return chunks;
}

// ─── Command Handling ─────────────────────────────────────────

export function isCommand(text: string): boolean {
    return text.startsWith("/");
}

export async function handleCommand(chatId: string, text: string): Promise<string> {
    const cmd = text.split(" ")[0].toLowerCase();

    switch (cmd) {
        case "/newchat":
        case "/forget":
            await clearSession(chatId);
            return "Session cleared. Starting fresh.";

        case "/memory":
            const turns = await getRecentTurns(chatId, 5);
            return turns ? `Recent context:\n${turns}` : "No conversation history yet.";

        case "/status":
            const session = await getSession(chatId);
            return `Session: ${session ? "active" : "none"}\nProject: ${config.claudeclaw.projectDir}`;

        case "/help":
            return [
                "*ClaudeClaw Commands*",
                "/newchat — Clear session, start fresh",
                "/memory — Show recent context",
                "/status — Show session info",
                "/help — This message",
            ].join("\n");

        default:
            return `Unknown command: ${cmd}. Type /help for available commands.`;
    }
}
