/**
 * approval-service.ts — Generic approval request system for ClaudeClaw
 *
 * Handles approval workflows triggered by any service (crew video, content, etc.)
 * Via WhatsApp: send request → user replies APPROVE/REJECT [token] → callback fires
 *
 * DB table: approval_requests
 */

import { query, queryOne } from "../db/client";
import { logger } from "../utils/logger";

// ─── Constants ────────────────────────────────────────────────

const APPROVAL_TTL_HOURS = 24;
const APPROVE_KEYWORDS = ["approve", "approved", "yes", "✅", "אישור", "כן"];
const REJECT_KEYWORDS = ["reject", "rejected", "no", "deny", "denied", "❌", "דחייה", "לא"];

// ─── Types ────────────────────────────────────────────────────

export interface ApprovalRequest {
    id: string;
    tenantId: string;
    chatId: string;
    token: string;
    type: string; // 'content', 'crew-video', 'social-post', etc.
    description: string;
    metadata: Record<string, unknown>;
    status: "pending" | "approved" | "rejected" | "expired";
    createdAt: Date;
    expiresAt: Date;
    respondedAt?: Date;
}

type ApprovalCallback = (approved: boolean, approvalId: string) => Promise<void>;
const pendingCallbacks = new Map<string, ApprovalCallback>();

// ─── Table Init ───────────────────────────────────────────────

async function ensureApprovalTable(): Promise<void> {
    await query(`
        CREATE TABLE IF NOT EXISTS approval_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id TEXT NOT NULL,
            chat_id TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}',
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '${APPROVAL_TTL_HOURS} hours',
            responded_at TIMESTAMPTZ
        )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_approval_requests_chat_id ON approval_requests(chat_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_approval_requests_token ON approval_requests(token)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status)`);
}

// ─── Create Approval ──────────────────────────────────────────

export async function createApproval(
    tenantId: string,
    chatId: string,
    type: string,
    description: string,
    metadata: Record<string, unknown> = {},
    onResponse?: ApprovalCallback,
): Promise<string> {
    await ensureApprovalTable();

    const token = generateToken();
    const row = await queryOne<{ id: string }>(
        `INSERT INTO approval_requests (tenant_id, chat_id, token, type, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [tenantId, chatId, token, type, description, JSON.stringify(metadata)],
    );

    if (!row) throw new Error("Failed to create approval request");

    if (onResponse) {
        pendingCallbacks.set(token, onResponse);
    }

    logger.info({ msg: "Approval created", id: row.id, type, chatId, token });
    return token;
}

// ─── Handle Response ──────────────────────────────────────────

/**
 * Process incoming WhatsApp message as potential approval response.
 * Returns true if the message was an approval/rejection, false if not.
 */
export async function handleApprovalResponse(chatId: string, messageBody: string): Promise<boolean> {
    try {
        await ensureApprovalTable();

        const text = messageBody.trim().toLowerCase();

        // Check if message contains an approval keyword
        const isApprove = APPROVE_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));
        const isReject = REJECT_KEYWORDS.some((kw) => text.includes(kw.toLowerCase()));

        if (!isApprove && !isReject) {
            return false;
        }

        // Find pending approval for this chatId (most recent)
        const approval = await queryOne<any>(
            `SELECT id, token, type, description, tenant_id FROM approval_requests
             WHERE chat_id = $1 AND status = 'pending' AND expires_at > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [chatId],
        );

        if (!approval) {
            return false; // No pending approval — not an approval response
        }

        const approved = isApprove;
        const newStatus = approved ? "approved" : "rejected";

        await query(
            `UPDATE approval_requests SET status = $1, responded_at = NOW() WHERE id = $2`,
            [newStatus, approval.id],
        );

        logger.info({ msg: "Approval response recorded", id: approval.id, type: approval.type, approved });

        // Fire callback if registered
        const callback = pendingCallbacks.get(approval.token);
        if (callback) {
            pendingCallbacks.delete(approval.token);
            try {
                await callback(approved, approval.id);
            } catch (err) {
                logger.error({ msg: "Approval callback error", error: (err as Error).message });
            }
        }

        return true;
    } catch (err) {
        logger.error({ msg: "handleApprovalResponse error", error: (err as Error).message });
        return false;
    }
}

// ─── Query Approvals ──────────────────────────────────────────

export async function getPendingApprovals(tenantId?: string): Promise<ApprovalRequest[]> {
    await ensureApprovalTable();

    const rows = tenantId
        ? await query<any>(
            `SELECT * FROM approval_requests WHERE status = 'pending' AND tenant_id = $1 AND expires_at > NOW() ORDER BY created_at DESC`,
            [tenantId],
          )
        : await query<any>(
            `SELECT * FROM approval_requests WHERE status = 'pending' AND expires_at > NOW() ORDER BY created_at DESC`,
          );

    return rows.map(mapRow);
}

export async function getApprovalByToken(token: string): Promise<ApprovalRequest | null> {
    await ensureApprovalTable();
    const row = await queryOne<any>(`SELECT * FROM approval_requests WHERE token = $1`, [token]);
    return row ? mapRow(row) : null;
}

/**
 * Human-readable summary for /approvals slash command in ClaudeClaw.
 */
export async function getPendingApprovalsSummary(): Promise<string> {
    const pending = await getPendingApprovals();
    if (pending.length === 0) {
        return "✅ No pending approvals.";
    }
    const lines = pending.map((a, i) => {
        const age = Math.round((Date.now() - a.createdAt.getTime()) / 60000);
        return `${i + 1}. *${a.type}* — ${a.description}\n   Token: \`${a.token}\` | ${age}m ago | expires ${formatExpiry(a.expiresAt)}`;
    });
    return `*Pending Approvals (${pending.length})*\n\n${lines.join("\n\n")}\n\nReply APPROVE or REJECT to respond.`;
}

// ─── Maintenance ──────────────────────────────────────────────

/**
 * Mark expired pending approvals as 'expired'. Called hourly by scheduler.
 */
export async function expireStaleApprovals(): Promise<void> {
    try {
        await ensureApprovalTable();
        const rows = await query(
            `UPDATE approval_requests SET status = 'expired'
             WHERE status = 'pending' AND expires_at <= NOW()
             RETURNING id, token`,
        );
        if (rows.length > 0) {
            logger.info({ msg: "Expired stale approvals", count: rows.length });
            // Clean up any callbacks for expired approvals
            for (const row of rows as any[]) {
                pendingCallbacks.delete(row.token);
            }
        }
    } catch (err) {
        logger.error({ msg: "expireStaleApprovals error", error: (err as Error).message });
    }
}

// ─── Utilities ────────────────────────────────────────────────

function generateToken(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatExpiry(date: Date): string {
    const diffMs = date.getTime() - Date.now();
    const hours = Math.round(diffMs / 3600000);
    return hours > 1 ? `in ${hours}h` : "soon";
}

function mapRow(row: any): ApprovalRequest {
    return {
        id: row.id,
        tenantId: row.tenant_id,
        chatId: row.chat_id,
        token: row.token,
        type: row.type,
        description: row.description,
        metadata: row.metadata || {},
        status: row.status,
        createdAt: new Date(row.created_at),
        expiresAt: new Date(row.expires_at),
        respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
    };
}
