#!/usr/bin/env node
/**
 * FB Marketplace Bot Scheduler v2
 * - 20 minute cycles (not 60)
 * - 6am–10pm CST operating hours only
 * - Respects postLimit per product (5 for UAD, 3 for MissParty)
 * - Respects cooldownMinutes per product (15 for UAD, 30 for MissParty)
 * - Cleanup between each bot run
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot-config.json'), 'utf8'));
const PRODUCTS = CONFIG.products;
const BOT_SCRIPT = path.join(__dirname, 'facebook-bot-final.js');
const LOCK_FILE = '/tmp/fb-bot-scheduler.lock';

// Schedule config
const CYCLE_INTERVAL_MIN = 20;  // 20 minutes between cycles
const OPERATING_HOUR_START = 6; // 6am CST
const OPERATING_HOUR_END = 22;  // 10pm CST

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

/**
 * Get current CST hour (Central Standard Time = UTC-6).
 * Note: CDT (summer) = UTC-5, CST (winter) = UTC-6.
 * Using America/Chicago timezone for automatic DST handling.
 */
function getCurrentCSTHour() {
    const now = new Date();
    const cstString = now.toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: false });
    const hour = parseInt(cstString.split(',')[1].trim().split(':')[0]);
    return hour;
}

/**
 * Get milliseconds until next 6am CST.
 */
function msUntilNext6amCST() {
    const now = new Date();
    // Get current CST time
    const cstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
    const tomorrow6am = new Date(cstNow);
    tomorrow6am.setDate(tomorrow6am.getDate() + 1);
    tomorrow6am.setHours(6, 0, 0, 0);
    // Approximate — close enough for sleep purposes
    const diff = tomorrow6am.getTime() - cstNow.getTime();
    return Math.max(diff, 60000); // At least 1 minute
}

// Lock file management
function acquireLock() {
    if (fs.existsSync(LOCK_FILE)) {
        const pid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8'));
        try { process.kill(pid, 0); log(`Already running (PID ${pid}). Exiting.`); process.exit(0); }
        catch { log('Stale lock file. Removing.'); fs.unlinkSync(LOCK_FILE); }
    }
    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    process.on('exit', () => { try { fs.unlinkSync(LOCK_FILE); } catch {} });
    process.on('SIGINT', () => process.exit());
    process.on('SIGTERM', () => process.exit());
}

function runBot(productId) {
    return new Promise((resolve) => {
        log(`Running bot for: ${productId}`);
        const proc = spawn('node', [BOT_SCRIPT, productId], {
            cwd: __dirname,
            stdio: 'inherit',
            env: { ...process.env, DISPLAY: ':100' },
        });

        const timer = setTimeout(() => {
            log(`Bot timeout for ${productId} — killing`);
            proc.kill('SIGTERM');
        }, 5 * 60 * 1000); // 5 min max per post

        proc.on('close', (code) => {
            clearTimeout(timer);
            log(`Bot for ${productId} exited with code ${code}`);
            resolve(code);
        });

        proc.on('error', (err) => {
            clearTimeout(timer);
            log(`Bot error for ${productId}: ${err.message}`);
            resolve(1);
        });
    });
}

async function cleanupProcesses() {
    try { execSync('pkill -f "orbita|gologin|chrome" 2>/dev/null', { timeout: 5000 }); } catch {}
    await delay(5000);
}

async function main() {
    acquireLock();
    log('FB Marketplace Scheduler v2 Started');
    log(`Products: ${PRODUCTS.map(p => `${p.name} (limit=${p.postLimit}, cooldown=${p.cooldownMinutes}min)`).join(' | ')}`);
    log(`Schedule: every ${CYCLE_INTERVAL_MIN}min, ${OPERATING_HOUR_START}am-${OPERATING_HOUR_END > 12 ? OPERATING_HOUR_END - 12 : OPERATING_HOUR_END}pm CST`);

    let cycleCount = 0;

    while (true) {
        // Check operating hours
        const cstHour = getCurrentCSTHour();
        if (cstHour < OPERATING_HOUR_START || cstHour >= OPERATING_HOUR_END) {
            const sleepMs = msUntilNext6amCST();
            log(`Outside operating hours (CST hour: ${cstHour}). Sleeping ${(sleepMs / 3600000).toFixed(1)} hours until 6am CST...`);
            await delay(sleepMs);
            continue;
        }

        cycleCount++;
        log(`\n=== CYCLE ${cycleCount} (CST hour: ${cstHour}) ===`);

        for (const product of PRODUCTS) {
            const postLimit = product.postLimit || 1;
            const cooldownMin = product.cooldownMinutes || 15;

            log(`[${product.name}] Posting up to ${postLimit} listings (cooldown: ${cooldownMin}min)`);

            for (let i = 0; i < postLimit; i++) {
                // Re-check operating hours before each post
                const currentHour = getCurrentCSTHour();
                if (currentHour >= OPERATING_HOUR_END) {
                    log(`[${product.name}] Operating hours ended (CST: ${currentHour}). Stopping.`);
                    break;
                }

                await cleanupProcesses();
                const exitCode = await runBot(product.id);

                log(`[${product.name}] Post ${i + 1}/${postLimit} — exit code: ${exitCode}`);

                // Cooldown between posts (skip after last post)
                if (i < postLimit - 1) {
                    log(`[${product.name}] Cooling down ${cooldownMin} min before next post...`);
                    await delay(cooldownMin * 60 * 1000);
                }
            }
        }

        // Wait for next cycle
        log(`Cycle ${cycleCount} complete. Next cycle in ${CYCLE_INTERVAL_MIN} min...`);
        await delay(CYCLE_INTERVAL_MIN * 60 * 1000);
    }
}

main().catch(e => { log(`Fatal: ${e.message}`); process.exit(1); });
