/**
 * Health Monitor — periodic checks for all system services.
 *
 * Checks: worker, web, PostgreSQL, Redis, WAHA, Ollama, FB Bot, BullMQ queues, disk.
 * Alerts via WhatsApp to Shai's phone.
 * Results stored in PostgreSQL health_checks table + Redis (TTL 24h) for current state.
 */

import { config } from "../config";
import { query } from "../db/client";
import { redisConnection } from "../queue/connection";
import { logger } from "../utils/logger";
import { sendText, phoneToChatId } from "./waha-client";
import { logNotification } from "./notification-log";

// ─── Types ───

export interface HealthCheckResult {
    service: string;
    status: "ok" | "degraded" | "down";
    responseMs: number;
    details?: Record<string, unknown>;
}

interface AlertState {
    service: string;
    lastAlertAt: number;
    consecutiveFailures: number;
    lastStatus: string;
}

// ─── State ───

const alertStates = new Map<string, AlertState>();
let monitorIntervals: NodeJS.Timeout[] = [];

// ─── Individual Checks ───

async function checkPostgres(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        await query("SELECT 1");
        return { service: "postgres", status: "ok", responseMs: Date.now() - start };
    } catch (err: any) {
        return { service: "postgres", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkRedis(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        await redisConnection.ping();
        return { service: "redis", status: "ok", responseMs: Date.now() - start };
    } catch (err: any) {
        return { service: "redis", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkWaha(): Promise<HealthCheckResult> {
    const start = Date.now();
    if (!config.waha.url || !config.waha.apiKey) {
        return { service: "waha", status: "down", responseMs: 0, details: { error: "not configured" } };
    }
    try {
        const res = await fetch(`${config.waha.url}/api/sessions`, {
            headers: { "X-Api-Key": config.waha.apiKey },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { service: "waha", status: "down", responseMs: Date.now() - start, details: { status: res.status } };
        const sessions = await res.json() as any[];
        const working = sessions.filter((s: any) => s.status === "WORKING").length;
        return {
            service: "waha",
            status: working > 0 ? "ok" : "degraded",
            responseMs: Date.now() - start,
            details: { totalSessions: sessions.length, working },
        };
    } catch (err: any) {
        return { service: "waha", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkOllama(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        const res = await fetch(`${config.ollama.url}/api/tags`, {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { service: "ollama", status: "down", responseMs: Date.now() - start };
        const data = await res.json() as { models?: unknown[] };
        return {
            service: "ollama",
            status: "ok",
            responseMs: Date.now() - start,
            details: { models: (data.models || []).length },
        };
    } catch (err: any) {
        return { service: "ollama", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkWeb(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        const res = await fetch("https://superseller.agency/api/health", {
            signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) return { service: "web", status: "degraded", responseMs: Date.now() - start, details: { status: res.status } };
        return { service: "web", status: "ok", responseMs: Date.now() - start };
    } catch (err: any) {
        return { service: "web", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkFbBot(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        const res = await fetch("http://172.245.56.50:8082/health", {
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { service: "fb-bot", status: "down", responseMs: Date.now() - start };
        return { service: "fb-bot", status: "ok", responseMs: Date.now() - start };
    } catch (err: any) {
        return { service: "fb-bot", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkBullMQQueues(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        const { videoPipelineQueue, claudeclawQueue, crewVideoQueue } = await import("../queue/queues");
        const [vpWaiting, vpActive, ccWaiting, cvWaiting] = await Promise.all([
            videoPipelineQueue.getWaitingCount(),
            videoPipelineQueue.getActiveCount(),
            claudeclawQueue.getWaitingCount(),
            crewVideoQueue.getWaitingCount(),
        ]);
        return {
            service: "bullmq",
            status: "ok",
            responseMs: Date.now() - start,
            details: {
                videoPipeline: { waiting: vpWaiting, active: vpActive },
                claudeclaw: { waiting: ccWaiting },
                crewVideo: { waiting: cvWaiting },
            },
        };
    } catch (err: any) {
        return { service: "bullmq", status: "down", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

async function checkDisk(): Promise<HealthCheckResult> {
    const start = Date.now();
    try {
        const { execSync } = await import("child_process");
        const output = execSync("df -h / | tail -1", { timeout: 5000 }).toString().trim();
        const parts = output.split(/\s+/);
        const usedPercent = parseInt(parts[4]?.replace("%", "") || "0");
        return {
            service: "disk",
            status: usedPercent > 90 ? "down" : usedPercent > 80 ? "degraded" : "ok",
            responseMs: Date.now() - start,
            details: { usedPercent, raw: output },
        };
    } catch (err: any) {
        return { service: "disk", status: "ok", responseMs: Date.now() - start, details: { error: err.message } };
    }
}

// ─── Check Registry ───

interface CheckConfig {
    fn: () => Promise<HealthCheckResult>;
    intervalMs: number;
}

const CHECK_REGISTRY: CheckConfig[] = [
    { fn: checkRedis, intervalMs: 2 * 60 * 1000 },
    { fn: checkPostgres, intervalMs: 2 * 60 * 1000 },
    { fn: checkWaha, intervalMs: 5 * 60 * 1000 },
    { fn: checkOllama, intervalMs: 10 * 60 * 1000 },
    { fn: checkWeb, intervalMs: 5 * 60 * 1000 },
    { fn: checkFbBot, intervalMs: 10 * 60 * 1000 },
    { fn: checkBullMQQueues, intervalMs: 5 * 60 * 1000 },
    { fn: checkDisk, intervalMs: 30 * 60 * 1000 },
];

// ─── Alert Logic ───

const COOLDOWN_MS = (config.healthMonitor?.cooldownMinutes ?? 15) * 60 * 1000;
const ESCALATION_THRESHOLD = 3;

async function processResult(result: HealthCheckResult): Promise<void> {
    // Store in PostgreSQL
    try {
        await query(
            `INSERT INTO health_checks (service, status, response_ms, details, checked_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [result.service, result.status, result.responseMs, JSON.stringify(result.details || {})]
        );
    } catch {
        // DB might be down
    }

    // Store current state in Redis (TTL 24h)
    try {
        await redisConnection.set(
            `health:${result.service}`,
            JSON.stringify({ ...result, checkedAt: Date.now() }),
            "EX",
            86400
        );
    } catch {
        // Redis might be down
    }

    // Alert state machine
    const state = alertStates.get(result.service) || {
        service: result.service,
        lastAlertAt: 0,
        consecutiveFailures: 0,
        lastStatus: "ok",
    };

    if (result.status === "ok") {
        if (state.consecutiveFailures >= ESCALATION_THRESHOLD) {
            await sendAlert(`*${result.service}* recovered (was down for ${state.consecutiveFailures} checks)`, result.service);
        }
        state.consecutiveFailures = 0;
        state.lastStatus = "ok";
    } else {
        state.consecutiveFailures++;
        const now = Date.now();
        const cooldownExpired = (now - state.lastAlertAt) > COOLDOWN_MS;

        if (state.consecutiveFailures >= ESCALATION_THRESHOLD && cooldownExpired) {
            await sendAlert(
                `*${result.service}* is ${result.status}` +
                (result.details ? ` — ${JSON.stringify(result.details)}` : "") +
                ` (${state.consecutiveFailures} consecutive failures)`,
                result.service
            );
            state.lastAlertAt = now;
        }
        state.lastStatus = result.status;
    }

    alertStates.set(result.service, state);
}

async function sendAlert(message: string, service?: string): Promise<void> {
    // Log to unified notification system (handles WhatsApp send internally)
    const isRecovery = message.includes("recovered");
    await logNotification({
        source: "health_monitor",
        type: isRecovery ? "success" : "alert",
        title: service ? `${service} ${isRecovery ? "recovered" : "issue"}` : "Health Alert",
        body: message,
        metadata: { service },
        relatedEntityType: "service",
        relatedEntityId: service,
        sendViaWhatsapp: true,
        whatsappSession: "personal",
    });
    logger.warn({ msg: "Health alert sent via notification-log", message });
}

// ─── Public API ───

export async function runAllChecks(): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];
    for (const check of CHECK_REGISTRY) {
        try {
            const result = await check.fn();
            results.push(result);
        } catch (err: any) {
            results.push({ service: "unknown", status: "down", responseMs: 0, details: { error: err.message } });
        }
    }
    return results;
}

export async function getHealthSnapshot(): Promise<Record<string, HealthCheckResult>> {
    const snapshot: Record<string, HealthCheckResult> = {};
    const services = ["postgres", "redis", "waha", "ollama", "web", "fb-bot", "bullmq", "disk"];

    for (const service of services) {
        try {
            const raw = await redisConnection.get(`health:${service}`);
            if (raw) snapshot[service] = JSON.parse(raw);
        } catch {
            // Redis down
        }
    }
    return snapshot;
}

export function formatHealthSummary(snapshot: Record<string, HealthCheckResult>): string {
    if (Object.keys(snapshot).length === 0) return "No health data available. Run /health to check.";

    const lines = ["*System Health*", ""];
    for (const [, result] of Object.entries(snapshot)) {
        const icon = result.status === "ok" ? "✅" : result.status === "degraded" ? "⚠️" : "❌";
        lines.push(`${icon} *${result.service}*: ${result.status} (${result.responseMs}ms)`);
    }
    return lines.join("\n");
}

// ─── Lifecycle ───

export function startHealthMonitor(): void {
    if (!config.healthMonitor?.enabled) {
        logger.info({ msg: "Health monitor disabled" });
        return;
    }

    query(`
        CREATE TABLE IF NOT EXISTS health_checks (
            id SERIAL PRIMARY KEY,
            service TEXT NOT NULL,
            status TEXT NOT NULL,
            response_ms INTEGER,
            details JSONB,
            checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `).catch(() => {});

    query(`CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service, checked_at DESC)`).catch(() => {});

    for (const check of CHECK_REGISTRY) {
        check.fn().then(processResult).catch((err) =>
            logger.error({ msg: "Health check failed", error: err.message })
        );

        const interval = setInterval(async () => {
            try {
                const result = await check.fn();
                await processResult(result);
            } catch (err: any) {
                logger.error({ msg: "Health check failed", error: err.message });
            }
        }, check.intervalMs);

        monitorIntervals.push(interval);
    }

    logger.info({ msg: "Health monitor started", checks: CHECK_REGISTRY.length });
}

export function stopHealthMonitor(): void {
    for (const interval of monitorIntervals) {
        clearInterval(interval);
    }
    monitorIntervals = [];
    logger.info({ msg: "Health monitor stopped" });
}
