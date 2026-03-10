/**
 * ClaudeClaw Bridge — Claude Agent SDK wrapper for WhatsApp.
 *
 * Spawns the real Claude Code CLI as a subprocess via @anthropic-ai/claude-agent-sdk.
 * Sessions persist per chat (phone number) for conversation continuity.
 * Memory: last N turns stored in PostgreSQL, injected as context.
 */

import { config } from "../config";
import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";

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

    // Build context using RAG-based enrichment (ClaudeClaw 2.0)
    const { buildEnhancedPrompt } = await import("./claudeclaw-router");
    const memoryContext = await getRecentTurns(chatId);

    const { enrichedMessage, systemPrompt } = await buildEnhancedPrompt(message, mode);

    // Prepend conversation memory to enriched message
    const fullMessage = memoryContext
        ? `[Recent conversation context]\n${memoryContext}\n\n${enrichedMessage}`
        : enrichedMessage;

    // Get existing session for continuity
    const existingSession = await getSession(chatId);

    let text: string | null = null;
    let newSessionId: string | undefined;

    try {
        const events = sdkQuery({
            prompt: fullMessage,
            options: {
                cwd: config.claudeclaw.projectDir,
                ...(existingSession ? { resume: existingSession } : {}),
                systemPrompt,
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
    const args = text.slice(cmd.length).trim();

    switch (cmd) {
        case "/newchat":
        case "/forget":
            await clearSession(chatId);
            return "Session cleared. Starting fresh.";

        case "/memory": {
            const recentTurns = await getRecentTurns(chatId, 5);
            return recentTurns ? `Recent context:\n${recentTurns}` : "No conversation history yet.";
        }

        case "/status": {
            const currentSession = await getSession(chatId);
            return `Session: ${currentSession ? "active" : "none"}\nProject: ${config.claudeclaw.projectDir}`;
        }

        case "/health": {
            const { getHealthSnapshot, formatHealthSummary } = await import("./health-monitor");
            const snapshot = await getHealthSnapshot();
            return formatHealthSummary(snapshot);
        }

        case "/approvals": {
            const { getPendingApprovalsSummary } = await import("./approval-service");
            return getPendingApprovalsSummary();
        }

        case "/rag": {
            if (!args) return "Usage: /rag <query>\nExample: /rag video pipeline";
            const { searchForContext } = await import("./rag");
            const results = await searchForContext(args, config.rag.systemTenant, 5);
            return results || "No matching documents found.";
        }

        case "/digest": {
            const { buildDigest } = await import("./proactive-digest");
            return buildDigest();
        }

        case "/videos": {
            const { query: dbQuery } = await import("../db/client");
            try {
                const rows = await dbQuery<any>(
                    `SELECT id, status, address, created_at, updated_at
                     FROM video_jobs ORDER BY created_at DESC LIMIT 5`
                );
                if (!rows.length) return "No video jobs found.";
                const lines = rows.map((r: any) => {
                    const icon = r.status === "complete" ? "✅" : r.status === "failed" ? "🔴" : "⏳";
                    const addr = r.address ? ` — ${r.address.slice(0, 40)}` : "";
                    return `${icon} ${r.id.slice(0, 8)}${addr} (${r.status})`;
                });
                return `*Recent Video Jobs*\n${lines.join("\n")}`;
            } catch {
                return "Unable to query video jobs.";
            }
        }

        case "/spend": {
            const { query: dbQuery } = await import("../db/client");
            try {
                const today = await dbQuery<any>(`
                    SELECT service, COALESCE(SUM(cost_usd), 0) as total 
                    FROM api_expenses WHERE created_at > CURRENT_DATE
                    GROUP BY service ORDER BY total DESC
                `);
                const month = await dbQuery<any>(`
                    SELECT COALESCE(SUM(cost_usd), 0) as total 
                    FROM api_expenses WHERE created_at > date_trunc('month', CURRENT_DATE)
                `);
                if (!today.length) return "💰 No API expenses tracked today.";
                const todayTotal = today.reduce((s: number, r: any) => s + Number(r.total), 0).toFixed(2);
                const monthTotal = Number(month[0]?.total || 0).toFixed(2);
                const breakdown = today.map((r: any) => `  ${r.service}: $${Number(r.total).toFixed(2)}`).join("\n");
                return `💰 *API Spend*\nToday: $${todayTotal}\nMonth: $${monthTotal}\n\n${breakdown}`;
            } catch {
                return "💰 No api_expenses table. Cost tracking not set up.";
            }
        }

        case "/leads": {
            const { query: dbQuery } = await import("../db/client");
            try {
                const rows = await dbQuery<any>(
                    `SELECT id, name, phone, source, created_at
                     FROM leads ORDER BY created_at DESC LIMIT 5`
                );
                if (!rows.length) return "📋 No leads yet.";
                const lines = rows.map((r: any) => {
                    const age = Math.round((Date.now() - new Date(r.created_at).getTime()) / 3600000);
                    return `📋 ${r.name || "Unknown"} — ${r.phone || "no phone"} (${r.source || "?"}, ${age}h ago)`;
                });
                return `*Recent Leads*\n${lines.join("\n")}`;
            } catch {
                return "📋 No leads table found.";
            }
        }

        case "/marketplace":
        case "/fb": {
            const { query: dbQuery } = await import("../db/client");
            try {
                const rows = await dbQuery<any>(`
                    SELECT product_id, 
                           count(*) as total,
                           count(*) FILTER (WHERE posted_at > NOW() - INTERVAL '24 hours') as today,
                           count(*) FILTER (WHERE status = 'failed') as failed
                    FROM marketplace_listings GROUP BY product_id
                `);
                if (!rows.length) return "🏪 No marketplace listings.";
                const lines = rows.map((r: any) =>
                    `  ${r.product_id}: ${r.total} total, ${r.today} today, ${r.failed} failed`
                );
                return `🏪 *Marketplace Stats*\n${lines.join("\n")}`;
            } catch {
                return "🏪 Unable to query marketplace listings.";
            }
        }

        case "/groups": {
            const { query: dbQuery } = await import("../db/client");
            try {
                const rows = await dbQuery<any>(
                    `SELECT group_id, tenant_id, agent_name, language FROM group_agent_config ORDER BY registered_at`
                );
                if (!rows.length) return "No registered groups.";
                const lines = rows.map((r: any) =>
                    `• ${r.agent_name} (${r.tenant_id}) — ${r.language || "auto"}`
                );
                return `*Registered Groups (${rows.length})*\n${lines.join("\n")}`;
            } catch {
                return "Unable to query groups.";
            }
        }

        case "/help":
            return [
                "*ClaudeClaw Commands*",
                "",
                "📊 *Dashboards*",
                "/digest — Full business digest",
                "/health — System health summary",
                "/videos — Recent video jobs",
                "/spend — API cost breakdown",
                "/leads — Recent leads",
                "/fb — Marketplace posting stats",
                "/groups — Registered WhatsApp groups",
                "/approvals — Pending approval requests",
                "",
                "🔍 *Tools*",
                "/rag [query] — Search system knowledge",
                "/memory — Show recent context",
                "/status — Session info",
                "/newchat — Clear session",
            ].join("\n");

        default:
            return `Unknown command: ${cmd}. Type /help for available commands.`;
    }
}
