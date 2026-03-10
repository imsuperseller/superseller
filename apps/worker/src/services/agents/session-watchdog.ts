/**
 * Session Watchdog — monitors Facebook session health for the FB Marketplace Bot.
 *
 * Checks every 4 hours:
 * 1. Cookie file health (c_user, xs, expiry, staleness)
 * 2. PM2 process health (webhook-server, fb-scheduler)
 * 3. Posting activity (fb_posts table — graceful if missing)
 * 4. GoLogin profile accessibility
 *
 * Results stored in health_checks table. Alerts via WhatsApp.
 */

import { config } from "../../config";
import { query } from "../../db/client";
import { logger } from "../../utils/logger";
import { sendText, phoneToChatId } from "../waha-client";
import * as fs from "fs";
import { execSync } from "child_process";

// ─── Types ───

export interface WatchdogCheck {
    name: string;
    status: "healthy" | "warning" | "critical";
    message: string;
    details?: Record<string, unknown>;
}

export interface WatchdogResult {
    status: "healthy" | "warning" | "critical";
    checks: WatchdogCheck[];
    checkedAt: Date;
}

// ─── Constants ───

const COOKIE_DIR = "/opt/fb-marketplace-bot";
const BOT_CONFIG_PATH = `${COOKIE_DIR}/bot-config.json`;

const COOKIE_FILES: { file: string; label: string; productId: string }[] = [
    { file: `${COOKIE_DIR}/cookies_uad.json`, label: "UAD", productId: "uad" },
    { file: `${COOKIE_DIR}/cookies_missparty.json`, label: "Miss Party", productId: "missparty" },
];

const PM2_PROCESSES = ["webhook-server", "fb-scheduler"];

const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
const FORTY_EIGHT_HOURS_S = 48 * 60 * 60;
const THIRTY_DAYS_S = 30 * 24 * 60 * 60;
const SEVEN_DAYS_S = 7 * 24 * 60 * 60;
const ONE_HOUR_MS = 60 * 60 * 1000;

let watchdogInterval: NodeJS.Timeout | null = null;
let lastCriticalAlertAt = 0;
let lastWarningDigestAt = 0;

const CRITICAL_COOLDOWN_MS = 30 * 60 * 1000; // 30 min between critical alerts
const WARNING_DIGEST_INTERVAL_MS = 24 * 60 * 60 * 1000; // daily warning digest

// ─── Cookie Checks ───

interface CookieEntry {
    name: string;
    value: string;
    expirationDate?: number;
    [key: string]: unknown;
}

function checkCookieFile(filePath: string, label: string): WatchdogCheck {
    const name = `cookie-${label.toLowerCase().replace(/\s+/g, "-")}`;

    try {
        if (!fs.existsSync(filePath)) {
            return {
                name,
                status: "critical",
                message: `Cookie file missing: ${filePath}`,
            };
        }

        const stat = fs.statSync(filePath);
        const fileAgeSeconds = (Date.now() - stat.mtimeMs) / 1000;

        let cookies: CookieEntry[];
        try {
            const raw = fs.readFileSync(filePath, "utf-8");
            cookies = JSON.parse(raw);
        } catch {
            return {
                name,
                status: "critical",
                message: `Cookie file is not valid JSON: ${filePath}`,
            };
        }

        if (!Array.isArray(cookies)) {
            return {
                name,
                status: "critical",
                message: `Cookie file is not an array: ${filePath}`,
            };
        }

        const cUser = cookies.find((c) => c.name === "c_user");
        const xs = cookies.find((c) => c.name === "xs");

        if (!cUser || !xs) {
            const missing = [!cUser && "c_user", !xs && "xs"].filter(Boolean).join(", ");
            return {
                name,
                status: "critical",
                message: `${label}: Missing critical cookies: ${missing}`,
                details: { file: filePath, cookieCount: cookies.length },
            };
        }

        // Check expiry on both cookies
        const now = Date.now() / 1000;
        const issues: string[] = [];
        let worstStatus: WatchdogCheck["status"] = "healthy";

        for (const cookie of [cUser, xs]) {
            if (cookie.expirationDate) {
                const remaining = cookie.expirationDate - now;
                if (remaining <= 0) {
                    issues.push(`${cookie.name} EXPIRED`);
                    worstStatus = "critical";
                } else if (remaining < SEVEN_DAYS_S) {
                    issues.push(`${cookie.name} expires in ${Math.round(remaining / 86400)}d`);
                    worstStatus = worstStatus === "critical" ? "critical" : "critical";
                } else if (remaining < THIRTY_DAYS_S) {
                    issues.push(`${cookie.name} expires in ${Math.round(remaining / 86400)}d`);
                    if (worstStatus === "healthy") worstStatus = "warning";
                }
            }
        }

        // Check file staleness
        if (fileAgeSeconds > FORTY_EIGHT_HOURS_S) {
            issues.push(`file untouched for ${Math.round(fileAgeSeconds / 3600)}h`);
            if (worstStatus === "healthy") worstStatus = "warning";
        }

        if (issues.length === 0) {
            const cUserExpiry = cUser.expirationDate
                ? `${Math.round((cUser.expirationDate - now) / 86400)}d`
                : "unknown";
            return {
                name,
                status: "healthy",
                message: `${label}: cookies valid, c_user expires in ${cUserExpiry}`,
                details: {
                    file: filePath,
                    cookieCount: cookies.length,
                    fileAgeHours: Math.round(fileAgeSeconds / 3600),
                },
            };
        }

        return {
            name,
            status: worstStatus,
            message: `${label}: ${issues.join("; ")}`,
            details: {
                file: filePath,
                cookieCount: cookies.length,
                fileAgeHours: Math.round(fileAgeSeconds / 3600),
            },
        };
    } catch (err: any) {
        return {
            name,
            status: "critical",
            message: `${label}: cookie check error — ${err.message}`,
        };
    }
}

// ─── PM2 Process Checks ───

function checkPm2Processes(): WatchdogCheck[] {
    const checks: WatchdogCheck[] = [];

    let pm2Data: any[];
    try {
        const raw = execSync("pm2 jlist 2>/dev/null", { timeout: 10000 }).toString().trim();
        pm2Data = JSON.parse(raw);
    } catch (err: any) {
        return [
            {
                name: "pm2",
                status: "critical",
                message: `Cannot read PM2 process list: ${err.message}`,
            },
        ];
    }

    for (const procName of PM2_PROCESSES) {
        const proc = pm2Data.find((p: any) => p.name === procName);
        const name = `pm2-${procName}`;

        if (!proc) {
            checks.push({
                name,
                status: "critical",
                message: `PM2 process '${procName}' not found`,
            });
            continue;
        }

        const status = proc.pm2_env?.status;
        const uptime = proc.pm2_env?.pm_uptime;
        const restarts = proc.pm2_env?.restart_time ?? 0;

        if (status !== "online") {
            checks.push({
                name,
                status: "critical",
                message: `${procName}: status is '${status}' (expected 'online')`,
                details: { pid: proc.pid, restarts },
            });
            continue;
        }

        // Check if restarted recently (crash loop indicator)
        const uptimeMs = uptime ? Date.now() - uptime : Infinity;
        if (uptimeMs < ONE_HOUR_MS) {
            checks.push({
                name,
                status: "warning",
                message: `${procName}: restarted ${Math.round(uptimeMs / 60000)}m ago (possible crash loop)`,
                details: { pid: proc.pid, restarts, uptimeMinutes: Math.round(uptimeMs / 60000) },
            });
            continue;
        }

        checks.push({
            name,
            status: "healthy",
            message: `${procName}: online, uptime ${Math.round(uptimeMs / 3600000)}h, ${restarts} restarts`,
            details: { pid: proc.pid, restarts, uptimeHours: Math.round(uptimeMs / 3600000) },
        });
    }

    return checks;
}

// ─── Posting Activity Checks ───

async function checkPostingActivity(): Promise<WatchdogCheck[]> {
    const checks: WatchdogCheck[] = [];

    for (const { label, productId } of COOKIE_FILES) {
        const name = `posting-${productId}`;

        try {
            // Count posts in last 24 hours
            const countResult = await query(
                `SELECT COUNT(*)::int AS cnt FROM fb_posts WHERE created_at > NOW() - INTERVAL '24 hours' AND product_id = $1`,
                [productId]
            );
            const recentCount = countResult?.[0]?.cnt ?? 0;

            // Last successful post time
            const lastResult = await query(
                `SELECT MAX(created_at) AS last_post FROM fb_posts WHERE product_id = $1`,
                [productId]
            );
            const lastPost = lastResult?.[0]?.last_post;
            const lastPostStr = lastPost
                ? `${Math.round((Date.now() - new Date(lastPost).getTime()) / 3600000)}h ago`
                : "never";

            if (recentCount === 0) {
                checks.push({
                    name,
                    status: "critical",
                    message: `${label}: 0 posts in last 24h (last post: ${lastPostStr})`,
                    details: { productId, recentCount, lastPost: lastPost || null },
                });
            } else {
                checks.push({
                    name,
                    status: "healthy",
                    message: `${label}: ${recentCount} posts in last 24h (last: ${lastPostStr})`,
                    details: { productId, recentCount, lastPost: lastPost || null },
                });
            }
        } catch (err: any) {
            // Table might not exist — not a critical failure for the watchdog itself
            const isTableMissing =
                err.message?.includes("does not exist") ||
                err.message?.includes("relation") ||
                err.code === "42P01";

            checks.push({
                name,
                status: isTableMissing ? "warning" : "critical",
                message: isTableMissing
                    ? `${label}: fb_posts table does not exist — cannot track posting activity`
                    : `${label}: posting check failed — ${err.message}`,
                details: { productId, error: err.message },
            });
        }
    }

    return checks;
}

// ─── GoLogin Profile Checks ───

async function checkGoLoginProfiles(): Promise<WatchdogCheck[]> {
    const checks: WatchdogCheck[] = [];

    let botConfig: any;
    try {
        if (!fs.existsSync(BOT_CONFIG_PATH)) {
            return [
                {
                    name: "gologin",
                    status: "warning",
                    message: `bot-config.json not found at ${BOT_CONFIG_PATH}`,
                },
            ];
        }

        const raw = fs.readFileSync(BOT_CONFIG_PATH, "utf-8");
        botConfig = JSON.parse(raw);
    } catch (err: any) {
        return [
            {
                name: "gologin",
                status: "warning",
                message: `Cannot parse bot-config.json: ${err.message}`,
            },
        ];
    }

    // Extract GoLogin token from bot-config.json
    // Actual structure: { shared: { gologinToken: "..." }, products: [{ profileId: "...", name: "..." }] }
    const token = botConfig?.shared?.gologinToken || botConfig?.gologin?.token || botConfig?.goLoginToken;
    if (!token) {
        return [
            {
                name: "gologin",
                status: "warning",
                message: "No GoLogin token found in bot-config.json (checked shared.gologinToken)",
            },
        ];
    }

    // Collect profile IDs from products array
    const profileIds: { id: string; label: string }[] = [];
    const products = botConfig?.products || [];

    if (Array.isArray(products)) {
        for (const product of products) {
            const profileId = product.profileId;
            const label = product.name || product.id || profileId;
            if (profileId) {
                profileIds.push({ id: profileId, label: String(label) });
            }
        }
    }

    if (profileIds.length === 0) {
        return [
            {
                name: "gologin",
                status: "warning",
                message: "No GoLogin profile IDs found in bot-config.json",
            },
        ];
    }

    for (const { id, label } of profileIds) {
        const name = `gologin-${label.toLowerCase().replace(/\s+/g, "-")}`;

        try {
            const res = await fetch(`https://api.gologin.com/browser/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(15000),
            });

            if (res.ok) {
                checks.push({
                    name,
                    status: "healthy",
                    message: `GoLogin profile '${label}' (${id}): accessible`,
                    details: { profileId: id },
                });
            } else {
                checks.push({
                    name,
                    status: "critical",
                    message: `GoLogin profile '${label}' (${id}): HTTP ${res.status}`,
                    details: { profileId: id, httpStatus: res.status },
                });
            }
        } catch (err: any) {
            checks.push({
                name,
                status: "warning",
                message: `GoLogin profile '${label}' (${id}): ${err.message}`,
                details: { profileId: id, error: err.message },
            });
        }
    }

    return checks;
}

// ─── Aggregate ───

function aggregateStatus(checks: WatchdogCheck[]): WatchdogResult["status"] {
    if (checks.some((c) => c.status === "critical")) return "critical";
    if (checks.some((c) => c.status === "warning")) return "warning";
    return "healthy";
}

// ─── Storage ───

async function storeResult(result: WatchdogResult): Promise<void> {
    try {
        await query(
            `INSERT INTO health_checks (service, status, response_ms, details, checked_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                "session-watchdog",
                result.status,
                0,
                JSON.stringify({
                    checks: result.checks.map((c) => ({
                        name: c.name,
                        status: c.status,
                        message: c.message,
                    })),
                }),
                result.checkedAt.toISOString(),
            ]
        );
    } catch (err: any) {
        logger.warn({ msg: "session-watchdog: failed to store result", error: err.message });
    }
}

// ─── Alerting ───

function formatChecksForAlert(checks: WatchdogCheck[], filter: WatchdogCheck["status"][]): string {
    return checks
        .filter((c) => filter.includes(c.status))
        .map((c) => {
            const icon = c.status === "critical" ? "\u274c" : "\u26a0\ufe0f";
            return `${icon} ${c.message}`;
        })
        .join("\n");
}

async function sendWatchdogAlert(result: WatchdogResult): Promise<void> {
    const phone = config.healthMonitor?.alertPhone;
    if (!phone) return;

    const chatId = phoneToChatId(phone);
    const now = Date.now();

    // Critical: send immediately (with cooldown)
    if (result.status === "critical" && now - lastCriticalAlertAt > CRITICAL_COOLDOWN_MS) {
        const criticalLines = formatChecksForAlert(result.checks, ["critical"]);
        const message = `\ud83d\udea8 *FB Session Watchdog — CRITICAL*\n\n${criticalLines}`;

        try {
            await sendText(chatId, message, { session: "personal" });
            lastCriticalAlertAt = now;
            logger.warn({ msg: "session-watchdog: critical alert sent" });
        } catch (err: any) {
            logger.error({ msg: "session-watchdog: failed to send critical alert", error: err.message });
        }
    }

    // Warning: daily digest
    if (result.status === "warning" && now - lastWarningDigestAt > WARNING_DIGEST_INTERVAL_MS) {
        const warningLines = formatChecksForAlert(result.checks, ["warning"]);
        if (warningLines) {
            const message = `\u26a0\ufe0f *FB Session Watchdog — Warnings*\n\n${warningLines}`;

            try {
                await sendText(chatId, message, { session: "personal" });
                lastWarningDigestAt = now;
                logger.info({ msg: "session-watchdog: warning digest sent" });
            } catch (err: any) {
                logger.error({ msg: "session-watchdog: failed to send warning digest", error: err.message });
            }
        }
    }
}

// ─── Public API ───

export async function runSessionWatchdog(): Promise<WatchdogResult> {
    logger.info({ msg: "session-watchdog: starting checks" });

    const checks: WatchdogCheck[] = [];

    // 1. Cookie health (sync — file reads)
    for (const { file, label } of COOKIE_FILES) {
        try {
            checks.push(checkCookieFile(file, label));
        } catch (err: any) {
            checks.push({
                name: `cookie-${label.toLowerCase()}`,
                status: "critical",
                message: `${label}: unexpected cookie check error — ${err.message}`,
            });
        }
    }

    // 2. PM2 process health (sync — execSync)
    try {
        checks.push(...checkPm2Processes());
    } catch (err: any) {
        checks.push({
            name: "pm2",
            status: "critical",
            message: `PM2 check failed: ${err.message}`,
        });
    }

    // 3. Posting activity (async — DB)
    try {
        const postingChecks = await checkPostingActivity();
        checks.push(...postingChecks);
    } catch (err: any) {
        checks.push({
            name: "posting",
            status: "warning",
            message: `Posting activity check failed: ${err.message}`,
        });
    }

    // 4. GoLogin profiles (async — HTTP)
    try {
        const goLoginChecks = await checkGoLoginProfiles();
        checks.push(...goLoginChecks);
    } catch (err: any) {
        checks.push({
            name: "gologin",
            status: "warning",
            message: `GoLogin check failed: ${err.message}`,
        });
    }

    const result: WatchdogResult = {
        status: aggregateStatus(checks),
        checks,
        checkedAt: new Date(),
    };

    // Store and alert
    await storeResult(result);
    await sendWatchdogAlert(result);

    logger.info({
        msg: "session-watchdog: complete",
        status: result.status,
        healthy: checks.filter((c) => c.status === "healthy").length,
        warning: checks.filter((c) => c.status === "warning").length,
        critical: checks.filter((c) => c.status === "critical").length,
    });

    return result;
}

// ─── Lifecycle ───

export function startSessionWatchdog(): void {
    if (watchdogInterval) {
        logger.warn({ msg: "session-watchdog: already running" });
        return;
    }

    // Run immediately on startup
    runSessionWatchdog().catch((err) =>
        logger.error({ msg: "session-watchdog: initial run failed", error: err.message })
    );

    // Then every 4 hours
    watchdogInterval = setInterval(() => {
        runSessionWatchdog().catch((err) =>
            logger.error({ msg: "session-watchdog: scheduled run failed", error: err.message })
        );
    }, FOUR_HOURS_MS);

    logger.info({ msg: "session-watchdog: started (interval: 4h)" });
}

export function stopSessionWatchdog(): void {
    if (watchdogInterval) {
        clearInterval(watchdogInterval);
        watchdogInterval = null;
        logger.info({ msg: "session-watchdog: stopped" });
    }
}
