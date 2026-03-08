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

function scheduleJob(name: string, fn: () => Promise<void>, intervalMs: number, initialDelayMs: number = 0): void {
    if (initialDelayMs > 0) {
        setTimeout(async () => {
            try {
                await fn();
            } catch (err: any) {
                logger.error({ msg: `Scheduler: ${name} failed`, error: err.message });
            }
        }, initialDelayMs);
    }

    const interval = setInterval(async () => {
        try {
            await fn();
        } catch (err: any) {
            logger.error({ msg: `Scheduler: ${name} failed`, error: err.message });
        }
    }, intervalMs);

    schedulerIntervals.push(interval);
    logger.info({ msg: `Scheduler: ${name} scheduled`, intervalMs });
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

    logger.info({ msg: "Scheduler started", jobs: 5 });
}

export function stopScheduler(): void {
    for (const interval of schedulerIntervals) {
        clearInterval(interval);
    }
    schedulerIntervals = [];
    logger.info({ msg: "Scheduler stopped" });
}
