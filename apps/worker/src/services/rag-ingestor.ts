/**
 * rag-ingestor.ts — Scheduled RAG ingestion jobs
 *
 * Jobs (called by scheduler.ts):
 * - ingestHealthContext(): Hourly — captures current system health snapshot into RAG
 * - runFullIngestion(): Daily — re-ingests all system docs, config, and status data
 *
 * All documents go into tenant_id = config.rag.systemTenant (default: "system")
 * to power ClaudeClaw's /rag search + context assembly.
 */

import { logger } from "../utils/logger";
import { config } from "../config";
import { ingestDocument, deleteBySource } from "./rag";
import { query } from "../db/client";

const SYSTEM_TENANT = (config as any).rag?.systemTenant || "system";

// ─── Health Context Ingest ────────────────────────────────────

/**
 * Capture current health snapshot and store in RAG for context-aware responses.
 * Called hourly. Replaces previous health snapshot (source key: "health-snapshot").
 */
export async function ingestHealthContext(): Promise<void> {
    try {
        const { getHealthSnapshot, formatHealthSummary } = await import("./health-monitor");
        const snapshot = await getHealthSnapshot();
        const summary = formatHealthSummary(snapshot);

        // Replace previous health context
        await deleteBySource(SYSTEM_TENANT, "health-snapshot");

        await ingestDocument(
            SYSTEM_TENANT,
            "health-snapshot",
            `System Health — ${new Date().toISOString()}`,
            summary,
            { capturedAt: new Date().toISOString(), type: "health" },
        );

        logger.info({ msg: "RAG: health context ingested", tenant: SYSTEM_TENANT });
    } catch (err) {
        logger.warn({ msg: "RAG: health context ingest failed", error: (err as Error).message });
    }
}

// ─── Full Ingestion ───────────────────────────────────────────

interface IngestionResult {
    sources: number;
    documents: number;
    errors: number;
}

/**
 * Daily full re-ingestion.
 * Sources: pending jobs summary, recent error log, group configs, system state.
 */
export async function runFullIngestion(): Promise<IngestionResult> {
    let sources = 0;
    let documents = 0;
    let errors = 0;

    const jobs: Array<{ source: string; fn: () => Promise<number> }> = [
        {
            source: "job-queue-summary",
            fn: async () => {
                const content = await buildJobQueueSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "job-queue-summary");
                const result = await ingestDocument(SYSTEM_TENANT, "job-queue-summary", "BullMQ Job Queue State", content, { type: "queue" });
                return result.documentCount;
            },
        },
        {
            source: "group-config-summary",
            fn: async () => {
                const content = await buildGroupConfigSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "group-config-summary");
                const result = await ingestDocument(SYSTEM_TENANT, "group-config-summary", "Registered Groups & Tenants", content, { type: "config" });
                return result.documentCount;
            },
        },
        {
            source: "recent-errors",
            fn: async () => {
                const content = await buildRecentErrorSummary();
                if (!content) return 0;
                await deleteBySource(SYSTEM_TENANT, "recent-errors");
                const result = await ingestDocument(SYSTEM_TENANT, "recent-errors", "Recent System Errors (24h)", content, { type: "errors" });
                return result.documentCount;
            },
        },
        {
            source: "health-snapshot",
            fn: async () => {
                await ingestHealthContext();
                return 1;
            },
        },
    ];

    for (const job of jobs) {
        try {
            const count = await job.fn();
            documents += count;
            sources++;
        } catch (err) {
            errors++;
            logger.warn({ msg: `RAG: ${job.source} ingestion failed`, error: (err as Error).message });
        }
    }

    logger.info({ msg: "RAG full ingestion complete", sources, documents, errors });
    return { sources, documents, errors };
}

// ─── Data Builders ────────────────────────────────────────────

async function buildJobQueueSummary(): Promise<string | null> {
    try {
        const rows = await query<any>(
            `SELECT status, COUNT(*) as count
             FROM jobs
             GROUP BY status
             ORDER BY count DESC`,
        );
        if (!rows.length) return null;

        const lines = rows.map((r: any) => `• ${r.status}: ${r.count} jobs`);
        const total = rows.reduce((sum: number, r: any) => sum + parseInt(r.count, 10), 0);

        const recentFailed = await query<any>(
            `SELECT id, product, status, error_message, created_at
             FROM jobs
             WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'
             ORDER BY created_at DESC LIMIT 10`,
        );

        const parts = [
            `Job Queue Summary — ${new Date().toISOString()}`,
            `Total jobs: ${total}`,
            lines.join("\n"),
        ];

        if (recentFailed.length > 0) {
            parts.push(
                "",
                "Recent failures (24h):",
                ...recentFailed.map((j: any) => `• [${j.id}] ${j.product || "unknown"}: ${j.error_message || "no error"}`),
            );
        }

        return parts.join("\n");
    } catch {
        return null;
    }
}

async function buildGroupConfigSummary(): Promise<string | null> {
    try {
        const rows = await query<any>(
            `SELECT group_id, tenant_id, agent_name, agent_role, registered_at
             FROM group_agent_config ORDER BY registered_at`,
        );
        if (!rows.length) return "No groups registered.";

        const lines = rows.map((r: any) =>
            `• Group ${r.group_id}\n  Tenant: ${r.tenant_id}\n  Agent: ${r.agent_name} (${r.agent_role})`,
        );

        return `Registered WhatsApp Groups — ${new Date().toISOString()}\n\n${lines.join("\n\n")}`;
    } catch {
        return null;
    }
}

async function buildRecentErrorSummary(): Promise<string | null> {
    try {
        // Try to get error data from health_checks table if it exists
        const rows = await query<any>(
            `SELECT service_name, status, message, checked_at
             FROM health_checks
             WHERE status IN ('degraded', 'unhealthy') AND checked_at > NOW() - INTERVAL '24 hours'
             ORDER BY checked_at DESC LIMIT 20`,
        );

        if (!rows.length) return null;

        const lines = rows.map((r: any) =>
            `• [${r.service_name}] ${r.status.toUpperCase()} at ${r.checked_at}: ${r.message || "no detail"}`,
        );

        return `System Errors / Degradations — Last 24h — ${new Date().toISOString()}\n\n${lines.join("\n")}`;
    } catch {
        return null; // Table might not exist — non-fatal
    }
}
