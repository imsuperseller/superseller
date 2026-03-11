/**
 * Unified Notification Log Service
 *
 * Replaces scattered WhatsApp sends with a single system that:
 * 1. Logs every notification to PostgreSQL (notification_log table)
 * 2. Optionally sends via WAHA (WhatsApp) with formatted messages
 * 3. Supports querying, filtering, correlation grouping, and status updates
 *
 * Usage:
 *   import { logNotification, getNotifications, markHandled } from "./notification-log";
 *   await logNotification({ source: "health_monitor", type: "alert", title: "Postgres down", body: "..." });
 */

import { randomUUID } from "crypto";
import { query, queryOne } from "../db/client";
import { sendText, phoneToChatId } from "./waha-client";
import { config } from "../config";
import { logger } from "../utils/logger";

// ─── Types ───

export type NotificationSource =
    | "health_monitor"
    | "cookie_monitor"
    | "claudeclaw"
    | "approval_service"
    | "scheduler"
    | "system";

export type NotificationType =
    | "alert"
    | "info"
    | "action_required"
    | "action_taken"
    | "error"
    | "success";

export type NotificationStatus =
    | "sent"
    | "delivered"
    | "read"
    | "handled"
    | "failed";

export interface LogNotificationParams {
    source: NotificationSource;
    type: NotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown>;
    correlationId?: string;
    relatedEntityType?: "service" | "customer" | "job" | "session";
    relatedEntityId?: string;
    // Sending options
    sendViaWhatsapp?: boolean;
    whatsappTarget?: string; // phone number or chatId; defaults to health monitor alert phone
    whatsappSession?: string; // WAHA session name; defaults to "personal"
}

export interface NotificationRecord {
    id: number;
    correlation_id: string;
    source: NotificationSource;
    type: NotificationType;
    title: string;
    body: string;
    metadata: Record<string, unknown>;
    status: NotificationStatus;
    sent_via: string | null;
    sent_to: string | null;
    related_entity_type: string | null;
    related_entity_id: string | null;
    created_at: string;
    handled_at: string | null;
    handled_by: string | null;
}

export interface NotificationFilters {
    source?: NotificationSource;
    type?: NotificationType;
    status?: NotificationStatus;
    since?: Date;
    until?: Date;
    relatedEntityType?: string;
    relatedEntityId?: string;
    limit?: number;
    offset?: number;
}

// ─── Source Labels for WhatsApp Formatting ───

const SOURCE_EMOJI: Record<NotificationSource, string> = {
    health_monitor: "\u{1F534}",  // red circle
    cookie_monitor: "\u{1F36A}",  // cookie
    claudeclaw: "\u{1F916}",      // robot
    approval_service: "\u2705",   // check mark
    scheduler: "\u{23F0}",        // alarm clock
    system: "\u2699\uFE0F",       // gear
};

const TYPE_PREFIX: Record<NotificationType, string> = {
    alert: "ALERT",
    info: "INFO",
    action_required: "ACTION REQUIRED",
    action_taken: "ACTION TAKEN",
    error: "ERROR",
    success: "SUCCESS",
};

// ─── Core Functions ───

export function generateCorrelationId(): string {
    return randomUUID();
}

/**
 * Log a notification to the database and optionally send via WhatsApp.
 * Returns the inserted notification ID.
 */
export async function logNotification(params: LogNotificationParams): Promise<number | null> {
    const correlationId = params.correlationId || generateCorrelationId();
    const sendVia = params.sendViaWhatsapp ? "whatsapp" : null;
    const alertPhone = params.whatsappTarget || config.healthMonitor?.alertPhone || "";
    const sentTo = params.sendViaWhatsapp ? alertPhone : null;

    let status: NotificationStatus = "sent";

    // Insert into DB first
    try {
        const row = await queryOne<{ id: number }>(
            `INSERT INTO notification_log
                (correlation_id, source, type, title, body, metadata, status, sent_via, sent_to,
                 related_entity_type, related_entity_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
                correlationId,
                params.source,
                params.type,
                params.title,
                params.body,
                JSON.stringify(params.metadata || {}),
                status,
                sendVia,
                sentTo,
                params.relatedEntityType || null,
                params.relatedEntityId || null,
            ]
        );

        const notifId = row?.id ?? null;

        // Send via WhatsApp if requested
        if (params.sendViaWhatsapp && alertPhone) {
            const waMessage = formatWhatsAppMessage(params, correlationId);
            const session = params.whatsappSession || "personal";
            const chatId = alertPhone.includes("@") ? alertPhone : phoneToChatId(alertPhone);

            try {
                const messageId = await sendText(chatId, waMessage, { session });
                if (messageId) {
                    status = "delivered";
                } else {
                    status = "failed";
                }
            } catch (err: any) {
                logger.error({ msg: "notification-log: WhatsApp send failed", error: err.message, notifId });
                status = "failed";
            }

            // Update status after send attempt
            if (notifId) {
                await query(
                    `UPDATE notification_log SET status = $1 WHERE id = $2`,
                    [status, notifId]
                );
            }
        }

        return notifId;
    } catch (err: any) {
        logger.error({ msg: "notification-log: failed to insert", error: err.message, source: params.source });
        return null;
    }
}

/**
 * Format a WhatsApp message with source prefix, title, body, and correlation reference.
 */
function formatWhatsAppMessage(params: LogNotificationParams, correlationId: string): string {
    const emoji = SOURCE_EMOJI[params.source] || "\u2699\uFE0F";
    const prefix = TYPE_PREFIX[params.type] || "NOTIFICATION";
    const shortCorrelation = correlationId.split("-")[0];

    let msg = `${emoji} *[${params.source.toUpperCase()}] ${prefix}*\n`;
    msg += `*${params.title}*\n`;
    msg += `${params.body}`;
    msg += `\n\n_ref: ${shortCorrelation}_`;

    return msg;
}

// ─── Query Functions ───

/**
 * Get notifications with optional filters, ordered by created_at DESC.
 */
export async function getNotifications(filters: NotificationFilters = {}): Promise<NotificationRecord[]> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.source) {
        conditions.push(`source = $${paramIdx++}`);
        params.push(filters.source);
    }
    if (filters.type) {
        conditions.push(`type = $${paramIdx++}`);
        params.push(filters.type);
    }
    if (filters.status) {
        conditions.push(`status = $${paramIdx++}`);
        params.push(filters.status);
    }
    if (filters.since) {
        conditions.push(`created_at >= $${paramIdx++}`);
        params.push(filters.since.toISOString());
    }
    if (filters.until) {
        conditions.push(`created_at <= $${paramIdx++}`);
        params.push(filters.until.toISOString());
    }
    if (filters.relatedEntityType) {
        conditions.push(`related_entity_type = $${paramIdx++}`);
        params.push(filters.relatedEntityType);
    }
    if (filters.relatedEntityId) {
        conditions.push(`related_entity_id = $${paramIdx++}`);
        params.push(filters.relatedEntityId);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    return query<NotificationRecord>(
        `SELECT * FROM notification_log ${where}
         ORDER BY created_at DESC
         LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
        [...params, limit, offset]
    );
}

/**
 * Get total count of notifications matching filters (for pagination).
 */
export async function getNotificationCount(filters: NotificationFilters = {}): Promise<number> {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters.source) {
        conditions.push(`source = $${paramIdx++}`);
        params.push(filters.source);
    }
    if (filters.type) {
        conditions.push(`type = $${paramIdx++}`);
        params.push(filters.type);
    }
    if (filters.status) {
        conditions.push(`status = $${paramIdx++}`);
        params.push(filters.status);
    }
    if (filters.since) {
        conditions.push(`created_at >= $${paramIdx++}`);
        params.push(filters.since.toISOString());
    }
    if (filters.until) {
        conditions.push(`created_at <= $${paramIdx++}`);
        params.push(filters.until.toISOString());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const row = await queryOne<{ count: string }>(
        `SELECT COUNT(*) as count FROM notification_log ${where}`,
        params
    );
    return parseInt(row?.count || "0", 10);
}

/**
 * Mark a notification as handled.
 */
export async function markHandled(
    id: number,
    handledBy: "auto" | "user" | "claudeclaw" = "user"
): Promise<boolean> {
    const rows = await query(
        `UPDATE notification_log
         SET status = 'handled', handled_at = NOW(), handled_by = $1
         WHERE id = $2
         RETURNING id`,
        [handledBy, id]
    );
    return rows.length > 0;
}

/**
 * Get all notifications in a correlation group.
 */
export async function getCorrelationGroup(correlationId: string): Promise<NotificationRecord[]> {
    return query<NotificationRecord>(
        `SELECT * FROM notification_log
         WHERE correlation_id = $1
         ORDER BY created_at ASC`,
        [correlationId]
    );
}

/**
 * Bulk mark multiple notifications as handled.
 */
export async function markMultipleHandled(
    ids: number[],
    handledBy: "auto" | "user" | "claudeclaw" = "user"
): Promise<number> {
    if (ids.length === 0) return 0;
    const rows = await query(
        `UPDATE notification_log
         SET status = 'handled', handled_at = NOW(), handled_by = $1
         WHERE id = ANY($2)
         RETURNING id`,
        [handledBy, ids]
    );
    return rows.length;
}
