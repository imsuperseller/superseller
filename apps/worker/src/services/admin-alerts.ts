/**
 * admin-alerts.ts -- Reusable admin notification utilities for pipeline failures
 *
 * Provides non-blocking WhatsApp alerts to admin and customer-facing apology
 * messages for terminal pipeline failures.
 *
 * Used by: character-video-gen.ts (and any future module with terminal failure paths)
 */

import { sendText, phoneToChatId } from "./waha-client";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface AdminAlertParams {
    error: string;
    tenantName?: string;
    module: string;
    groupId: string;
    customerPhone?: string;
    adminPhone?: string; // Override — falls back to config.admin.defaultPhone
}

/**
 * Send a WhatsApp alert to admin on terminal module failure.
 * Non-blocking: logs errors but never throws.
 */
export async function sendAdminAlert(params: AdminAlertParams): Promise<void> {
    const phone = params.adminPhone || config.admin.defaultPhone;
    if (!phone) {
        logger.warn({ msg: "sendAdminAlert: no admin phone available", module: params.module, groupId: params.groupId });
        return;
    }

    const chatId = phoneToChatId(phone);
    const lines = [
        "--- Pipeline Failure Alert ---",
        "",
        `Module: ${params.module}`,
        params.tenantName ? `Tenant: ${params.tenantName}` : null,
        `Group: ${params.groupId}`,
        params.customerPhone ? `Customer: ${params.customerPhone}` : null,
        "",
        `Error: ${params.error}`,
        "",
        "Action needed: Check logs and retry or follow up manually.",
    ].filter(Boolean) as string[];

    try {
        await sendText(chatId, lines.join("\n"));
        logger.info({ msg: "sendAdminAlert: alert sent", module: params.module, adminPhone: phone });
    } catch (err: any) {
        logger.error({ msg: "sendAdminAlert: failed to send", error: err.message, module: params.module });
    }
}

/**
 * Send an apologetic failure message to the customer's WhatsApp group.
 * Non-blocking: logs errors but never throws.
 */
export async function sendCustomerFailureMessage(groupId: string, module?: string): Promise<void> {
    const msg = "We hit a snag creating your video. Our team has been notified and will follow up shortly.";
    try {
        await sendText(groupId, msg);
        logger.info({ msg: "sendCustomerFailureMessage: sent", groupId, module });
    } catch (err: any) {
        logger.error({ msg: "sendCustomerFailureMessage: failed", error: err.message, groupId });
    }
}
