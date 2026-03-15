/**
 * proactive-digest.ts — Daily morning digest + event-driven alerts for ClaudeClaw
 *
 * Sends a WhatsApp summary every morning (7-8 AM server time) with:
 * - Video pipeline status (completed/failed/active jobs)
 * - FB Marketplace posting stats (last 24h)
 * - API spend (today + month)
 * - New leads (from landing pages)
 * - System health snapshot
 * - Pending approvals
 *
 * Also provides on-demand /digest command and event hooks for real-time alerts.
 */

import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";
import { sendText, phoneToChatId } from "./waha-client";
import { config } from "../config";

const SHAI_PHONE = "14695885133";
const WAHA_SESSION = "personal";

// ─── Data Collectors ──────────────────────────────────────────

async function getVideoStats(): Promise<string> {
    try {
        const stats = await queryOne<any>(`
            SELECT 
                count(*) FILTER (WHERE status = 'complete') as completed,
                count(*) FILTER (WHERE status = 'failed') as failed,
                count(*) FILTER (WHERE status IN ('pending','processing','generating_clips','assembling')) as active,
                count(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as last_24h
            FROM video_jobs
        `);
        if (!stats) return "📹 VideoForge: No data";
        return [
            "📹 *VideoForge Pipeline*",
            `  ✅ Completed: ${stats.completed}`,
            `  🔴 Failed: ${stats.failed}`,
            `  ⏳ Active: ${stats.active}`,
            `  📊 Last 24h: ${stats.last_24h} jobs`,
        ].join("\n");
    } catch {
        return "📹 VideoForge: Unable to query";
    }
}

async function getMarketplaceStats(): Promise<string> {
    try {
        const stats = await query<any>(`
            SELECT 
                product_id,
                count(*) as total,
                count(*) FILTER (WHERE posted_at > NOW() - INTERVAL '24 hours') as last_24h,
                count(*) FILTER (WHERE status = 'posted') as posted,
                count(*) FILTER (WHERE status = 'failed') as failed
            FROM marketplace_listings
            GROUP BY product_id
            ORDER BY product_id
        `);
        if (!stats.length) return "🏪 Marketplace: No listings data";
        const lines = ["🏪 *FB Marketplace*"];
        for (const s of stats) {
            lines.push(`  ${s.product_id}: ${s.posted} posted (${s.last_24h} today, ${s.failed} failed)`);
        }
        return lines.join("\n");
    } catch {
        return "🏪 Marketplace: Unable to query";
    }
}

async function getExpenseStats(): Promise<string> {
    try {
        const today = await queryOne<any>(`
            SELECT COALESCE(SUM(cost_usd), 0) as total 
            FROM api_expenses 
            WHERE created_at > CURRENT_DATE
        `);
        const month = await queryOne<any>(`
            SELECT COALESCE(SUM(cost_usd), 0) as total 
            FROM api_expenses 
            WHERE created_at > date_trunc('month', CURRENT_DATE)
        `);
        const todaySpend = Number(today?.total || 0).toFixed(2);
        const monthSpend = Number(month?.total || 0).toFixed(2);
        return `💰 *API Spend*: $${todaySpend} today | $${monthSpend} this month`;
    } catch {
        return "💰 API Spend: No expense tracking table";
    }
}

async function getLeadStats(): Promise<string> {
    try {
        const stats = await queryOne<any>(`
            SELECT 
                count(*) as total,
                count(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as new_24h,
                count(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_7d
            FROM leads
        `);
        if (!stats) return "📋 Leads: No data";
        return `📋 *Leads*: ${stats.total} total | ${stats.new_24h} new (24h) | ${stats.new_7d} new (7d)`;
    } catch {
        return "📋 Leads: No leads table";
    }
}

async function getSystemHealth(): Promise<string> {
    try {
        const { getHealthSnapshot, formatHealthSummary } = await import("./health-monitor");
        const snapshot = await getHealthSnapshot();
        const values = Object.values(snapshot) as any[];
        const allOk = values.every((s: any) => s.status === "ok");
        if (allOk) return "🟢 *System*: All services healthy";
        const issues = values.filter((s: any) => s.status !== "ok");
        return `⚠️ *System*: ${issues.length} issue(s)\n` +
            issues.map((i: any) => `  ${i.status === "down" ? "🔴" : "🟡"} ${i.service}: ${i.status}`).join("\n");
    } catch {
        return "⚠️ System: Health check failed";
    }
}

async function getPendingApprovals(): Promise<string> {
    try {
        const count = await queryOne<any>(`
            SELECT count(*) as c FROM approval_requests 
            WHERE status = 'pending' AND expires_at > NOW()
        `);
        const n = parseInt(count?.c || "0", 10);
        return n > 0 ? `📝 *Approvals*: ${n} pending` : "";
    } catch {
        return "";
    }
}

async function getClaudeClawStats(): Promise<string> {
    try {
        const sessions = await queryOne<any>(`SELECT count(*) as c FROM claudeclaw_sessions`);
        const turns24h = await queryOne<any>(`
            SELECT count(*) as c FROM claudeclaw_turns 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        const groupMsgs24h = await queryOne<any>(`
            SELECT count(*) as c FROM group_messages 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `);
        return `🤖 *ClaudeClaw*: ${sessions?.c || 0} sessions | ${turns24h?.c || 0} DM turns (24h) | ${groupMsgs24h?.c || 0} group msgs (24h)`;
    } catch {
        return "🤖 ClaudeClaw: Unable to query";
    }
}

async function getRAGStats(): Promise<string> {
    try {
        const docs = await queryOne<any>(`SELECT count(*) as c FROM documents`);
        const tenants = await query<any>(`SELECT tenant_id, count(*) as c FROM documents GROUP BY tenant_id ORDER BY c DESC LIMIT 5`);
        const tenantInfo = tenants.map(t => `${t.tenant_id}:${t.c}`).join(", ");
        return `🧠 *RAG*: ${docs?.c || 0} documents (${tenantInfo})`;
    } catch {
        return "🧠 RAG: Unable to query";
    }
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Build the full daily digest message.
 */
export async function buildDigest(): Promise<string> {
    const sections = await Promise.all([
        getVideoStats(),
        getMarketplaceStats(),
        getExpenseStats(),
        getLeadStats(),
        getClaudeClawStats(),
        getRAGStats(),
        getSystemHealth(),
        getPendingApprovals(),
    ]);

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "short", day: "numeric",
    });

    const filtered = sections.filter(s => s.trim().length > 0);
    return [
        `☀️ *Morning Digest — ${today}*`,
        "━".repeat(25),
        ...filtered,
        "━".repeat(25),
        "_Type /help for commands_",
    ].join("\n\n");
}

/**
 * Send the daily digest to Shai via WhatsApp.
 */
export async function sendDailyDigest(): Promise<void> {
    try {
        const digest = await buildDigest();
        const chatId = phoneToChatId(SHAI_PHONE);
        await sendText(chatId, digest, { session: WAHA_SESSION });
        logger.info({ msg: "Daily digest sent", phone: SHAI_PHONE });
    } catch (err: any) {
        logger.error({ msg: "Failed to send daily digest", error: err.message });
    }
}

/**
 * Send an event-driven alert (e.g., new lead, job completed).
 */
export async function sendEventAlert(event: string, details: string): Promise<void> {
    try {
        const chatId = phoneToChatId(SHAI_PHONE);
        const msg = `🔔 *${event}*\n${details}`;
        await sendText(chatId, msg, { session: WAHA_SESSION });
    } catch (err: any) {
        logger.error({ msg: "Failed to send event alert", error: err.message, event });
    }
}
