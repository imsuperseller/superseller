/**
 * Scheduler — periodic jobs for maintenance tasks.
 *
 * Jobs:
 * - Approval expiration: hourly
 * - Health context aggregation: hourly
 * - RAG full re-ingestion: daily
 * - Health check history cleanup: daily (7-day retention)
 * - System cleanup: weekly (PM2 flush, Docker prune, /tmp cleanup)
 */

import { logger } from "../utils/logger";

let schedulerIntervals: NodeJS.Timeout[] = [];

interface JobMeta {
    name: string;
    intervalMs: number;
    lastRun: string | null;
    lastError: string | null;
    runCount: number;
    registeredAt: string;
}

const jobRegistry = new Map<string, JobMeta>();

function scheduleJob(name: string, fn: () => Promise<void>, intervalMs: number, initialDelayMs: number = 0): void {
    jobRegistry.set(name, {
        name,
        intervalMs,
        lastRun: null,
        lastError: null,
        runCount: 0,
        registeredAt: new Date().toISOString(),
    });

    const wrappedFn = async () => {
        const meta = jobRegistry.get(name)!;
        try {
            await fn();
            meta.lastRun = new Date().toISOString();
            meta.lastError = null;
            meta.runCount++;
        } catch (err: any) {
            meta.lastRun = new Date().toISOString();
            meta.lastError = err.message;
            meta.runCount++;
            logger.error({ msg: `Scheduler: ${name} failed`, error: err.message });
        }
    };

    if (initialDelayMs > 0) {
        setTimeout(wrappedFn, initialDelayMs);
    }

    const interval = setInterval(wrappedFn, intervalMs);

    schedulerIntervals.push(interval);
    logger.info({ msg: `Scheduler: ${name} scheduled`, intervalMs });
}

export function getSchedulerStatus(): { name: string; intervalMs: number; lastRun: string | null; lastError: string | null; runCount: number; registeredAt: string }[] {
    return Array.from(jobRegistry.values());
}

export function startScheduler(): void {
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;

    scheduleJob("expire-approvals", async () => {
        const { expireStaleApprovals } = await import("./approval-service");
        await expireStaleApprovals();
    }, HOUR, 5 * 60 * 1000);

    scheduleJob("health-context-ingest", async () => {
        const { ingestHealthContext } = await import("./rag-ingestor");
        await ingestHealthContext();
    }, HOUR, 10 * 60 * 1000);

    scheduleJob("rag-full-ingestion", async () => {
        const { runFullIngestion } = await import("./rag-ingestor");
        const result = await runFullIngestion();
        logger.info({ msg: "Scheduler: RAG re-ingestion complete", ...result });
    }, DAY, HOUR);

    scheduleJob("health-cleanup", async () => {
        const { query } = await import("../db/client");
        try {
            const rows = await query(
                "DELETE FROM health_checks WHERE checked_at < NOW() - INTERVAL '7 days' RETURNING id"
            );
            if (rows.length > 0) {
                logger.info({ msg: "Scheduler: cleaned old health checks", deleted: rows.length });
            }
        } catch {
            // Table might not exist yet
        }
    }, DAY, 2 * HOUR);

    // Weekly system cleanup — every 7 days (first run after 3 hours)
    scheduleJob("system-cleanup", async () => {
        const { execSync } = await import("child_process");
        const results: string[] = [];
        try {
            // Flush PM2 logs (they grow fast with spammy webhooks)
            execSync("pm2 flush", { timeout: 10000 });
            results.push("PM2 logs flushed");
        } catch { /* non-critical */ }
        try {
            // Prune Docker build cache and dangling images
            const out = execSync("docker system prune -f 2>&1", { timeout: 30000 }).toString().trim();
            results.push(`Docker: ${out.split("\n").pop()}`);
        } catch { /* non-critical */ }
        try {
            // Clear /tmp files older than 7 days
            execSync("find /tmp -type f -mtime +7 -delete 2>/dev/null", { timeout: 10000 });
            results.push("/tmp cleaned (7d+)");
        } catch { /* non-critical */ }
        logger.info({ msg: "Scheduler: system cleanup complete", results });
    }, 7 * DAY, 3 * HOUR);

    // Autonomous agents — every 6 hours (first run after 15 min to let services stabilize)
    scheduleJob("agent-orchestrator", async () => {
        const { runOrchestrator } = await import("./agents/orchestrator");
        await runOrchestrator();
    }, 6 * HOUR, 15 * 60 * 1000);

    // Daily digest — every hour, but only sends between 7-8 AM server time
    scheduleJob("daily-digest", async () => {
        const hour = new Date().getHours();
        if (hour === 7) {
            const { sendDailyDigest } = await import("./proactive-digest");
            await sendDailyDigest();
        }
    }, HOUR, 20 * 60 * 1000);

    // Nightly quality aggregation — daily (first run after 4 hours to let services stabilize)
    scheduleJob("quality-aggregation", async () => {
        const { runQualityAggregation } = await import("../jobs/quality-aggregation");
        await runQualityAggregation();
    }, DAY, 4 * HOUR);

    logger.info({ msg: "Scheduler started", jobs: 8 });
}

export function stopScheduler(): void {
    for (const interval of schedulerIntervals) {
        clearInterval(interval);
    }
    schedulerIntervals = [];
    logger.info({ msg: "Scheduler stopped" });
}
