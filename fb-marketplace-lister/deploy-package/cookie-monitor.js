#!/usr/bin/env node
/**
 * Cookie health monitor for FB Marketplace bot.
 * Runs via PM2 on interval — checks cookie validity, alerts via WhatsApp, auto-refreshes.
 *
 * Checks:
 * 1. Cookie files exist and contain c_user + xs (required for valid FB session)
 * 2. Time since last successful posting per client (stale if >48h with queued jobs)
 * 3. Cookie file age (warning if >7 days without update)
 *
 * Actions:
 * - WhatsApp alert on staleness
 * - Auto-trigger refresh-session.js (password-only, no 2FA)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { execSync } = require('child_process');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot-config.json'), 'utf8'));
const BOT_DIR = __dirname;

const WAHA_URL = CONFIG.shared.wahaUrl;
const WAHA_KEY = CONFIG.shared.wahaApiKey;
const NOTIFY_TARGET = CONFIG.shared.notificationTarget;

const STALE_POST_HOURS = 48;     // Alert if no successful post in 48h with queued jobs
const STALE_COOKIE_DAYS = 7;     // Warning if cookie file unchanged for 7 days
const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // Every 6 hours
const REQUIRED_COOKIES = ['c_user', 'xs'];

const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app_db',
    password: '${POSTGRES_PASSWORD}',
    port: 5432,
});

const log = (msg) => console.log(`[${new Date().toISOString()}] [COOKIE-MON] ${msg}`);

/**
 * Check if a cookie file has the required cookies.
 */
function checkCookieFile(clientId) {
    const cookiePath = path.join(BOT_DIR, `cookies_${clientId}.json`);
    const result = { clientId, exists: false, hasCritical: false, missing: [], fileAgeHours: null };

    if (!fs.existsSync(cookiePath)) {
        result.missing = [...REQUIRED_COOKIES];
        return result;
    }

    result.exists = true;

    // File age
    const stat = fs.statSync(cookiePath);
    result.fileAgeHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);

    try {
        const cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
        const names = cookies.map(c => c.name);
        result.missing = REQUIRED_COOKIES.filter(n => !names.includes(n));
        result.hasCritical = result.missing.length === 0;
    } catch (e) {
        log(`${clientId}: Failed to parse cookie file: ${e.message}`);
        result.missing = [...REQUIRED_COOKIES];
    }

    return result;
}

/**
 * Check last successful post time and whether there are queued jobs.
 */
async function checkPostingHealth(clientId) {
    const result = { clientId, lastPostHoursAgo: null, queuedJobs: 0, recentFailures: 0 };

    try {
        // Last successful post
        const lastPost = await pool.query(
            `SELECT posted_at FROM fb_listings WHERE client_id = $1 AND status = 'posted' ORDER BY posted_at DESC LIMIT 1`,
            [clientId]
        );
        if (lastPost.rows.length > 0 && lastPost.rows[0].posted_at) {
            result.lastPostHoursAgo = (Date.now() - new Date(lastPost.rows[0].posted_at).getTime()) / (1000 * 60 * 60);
        }

        // Queued jobs
        const queued = await pool.query(
            `SELECT COUNT(*) as cnt FROM fb_listings WHERE client_id = $1 AND status = 'queued'`,
            [clientId]
        );
        result.queuedJobs = parseInt(queued.rows[0].cnt);

        // Recent failures (last 24h)
        const failures = await pool.query(
            `SELECT COUNT(*) as cnt FROM fb_listings WHERE client_id = $1 AND status = 'failed' AND updated_at > NOW() - INTERVAL '24 hours'`,
            [clientId]
        );
        result.recentFailures = parseInt(failures.rows[0].cnt);

    } catch (e) {
        log(`${clientId}: DB query error: ${e.message}`);
    }

    return result;
}

/**
 * Send WhatsApp alert via WAHA.
 */
async function sendAlert(message) {
    try {
        const res = await fetch(`${WAHA_URL}/api/sendText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Api-Key': WAHA_KEY },
            body: JSON.stringify({
                session: 'default',
                chatId: NOTIFY_TARGET,
                text: message
            })
        });
        if (res.ok) {
            log(`WhatsApp alert sent`);
        } else {
            log(`WhatsApp alert failed: HTTP ${res.status}`);
        }
    } catch (e) {
        log(`WhatsApp alert error: ${e.message}`);
    }
}

/**
 * Attempt auto-refresh for a client (password-only, no 2FA).
 */
function attemptRefresh(clientId) {
    const idx = CONFIG.products.findIndex(p => p.id === clientId);
    if (idx === -1) return false;

    log(`${clientId}: Attempting auto-refresh (index ${idx})...`);
    try {
        execSync(`DISPLAY=:100 node ${path.join(BOT_DIR, 'refresh-session.js')} ${idx}`, {
            cwd: BOT_DIR,
            timeout: 3 * 60 * 1000, // 3 min max
            stdio: 'inherit'
        });
        log(`${clientId}: Auto-refresh completed`);
        return true;
    } catch (e) {
        log(`${clientId}: Auto-refresh failed: ${e.message}`);
        return false;
    }
}

/**
 * Run full health check for all clients.
 */
async function runHealthCheck() {
    log('Starting health check...');
    const alerts = [];

    for (const product of CONFIG.products) {
        const clientId = product.id;
        const clientName = product.name;

        // 1. Cookie file check
        const cookieHealth = checkCookieFile(clientId);

        if (!cookieHealth.exists) {
            alerts.push(`${clientName}: Cookie file MISSING`);
            continue;
        }

        if (!cookieHealth.hasCritical) {
            alerts.push(`${clientName}: Missing critical cookies: ${cookieHealth.missing.join(', ')}`);
        }

        if (cookieHealth.fileAgeHours > STALE_COOKIE_DAYS * 24) {
            alerts.push(`${clientName}: Cookie file not updated in ${(cookieHealth.fileAgeHours / 24).toFixed(1)} days`);
        }

        // 2. Posting health check
        const postHealth = await checkPostingHealth(clientId);

        if (postHealth.lastPostHoursAgo !== null &&
            postHealth.lastPostHoursAgo > STALE_POST_HOURS &&
            postHealth.queuedJobs > 0) {
            alerts.push(`${clientName}: No successful post in ${postHealth.lastPostHoursAgo.toFixed(0)}h with ${postHealth.queuedJobs} queued jobs`);
        }

        if (postHealth.recentFailures >= 3) {
            alerts.push(`${clientName}: ${postHealth.recentFailures} failed posts in last 24h`);
        }

        // Log status
        log(`${clientId}: cookies=${cookieHealth.hasCritical ? 'OK' : 'BAD'}, fileAge=${cookieHealth.fileAgeHours?.toFixed(1)}h, lastPost=${postHealth.lastPostHoursAgo?.toFixed(0) || 'never'}h ago, queued=${postHealth.queuedJobs}, failures24h=${postHealth.recentFailures}`);
    }

    // 3. Send alerts + attempt auto-refresh if needed
    if (alerts.length > 0) {
        const message = `🚨 FB Bot Cookie Alert\n\n${alerts.join('\n')}\n\nAuto-refresh will be attempted.`;
        await sendAlert(message);

        // Attempt refresh for clients with missing cookies
        for (const product of CONFIG.products) {
            const cookieHealth = checkCookieFile(product.id);
            if (!cookieHealth.hasCritical) {
                attemptRefresh(product.id);
            }
        }
    } else {
        log('All clients healthy');
    }
}

// Run immediately on start, then on interval
async function main() {
    log(`Cookie Monitor started — checking every ${CHECK_INTERVAL_MS / (60 * 60 * 1000)}h`);
    log(`Stale thresholds: post=${STALE_POST_HOURS}h, cookie file=${STALE_COOKIE_DAYS}d`);

    await runHealthCheck();

    setInterval(async () => {
        try {
            await runHealthCheck();
        } catch (e) {
            log(`Health check error: ${e.message}`);
        }
    }, CHECK_INTERVAL_MS);
}

main();
