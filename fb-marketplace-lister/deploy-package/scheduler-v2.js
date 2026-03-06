#!/usr/bin/env node
/**
 * FB Marketplace Bot Scheduler v2 (Multi-Customer)
 * - Loops through all active customers and their products
 * - 20 minute cycles (configurable per customer)
 * - 6am–10pm CST operating hours (configurable per customer)
 * - Respects postLimit and cooldownMinutes per product
 * - Cleanup between each bot run
 */
const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ConfigLoader } = require('./config-loader');

const configLoader = new ConfigLoader('/opt/fb-marketplace-bot/customers');
const BOT_SCRIPT = path.join(__dirname, 'bot-adapter.js');
const LOCK_FILE = '/tmp/fb-bot-scheduler.lock';

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
    let hour = parseInt(cstString.split(',')[1].trim().split(':')[0]);
    if (hour === 24) hour = 0; // Standardize 24:00 to 00:00
    return hour;
}

/**
 * Parse time string like "6am" or "10pm" to 24-hour format
 */
function parseTimeToHour(timeStr) {
    const match = timeStr.match(/^(\d{1,2})(am|pm)$/i);
    if (!match) return null;

    let hour = parseInt(match[1]);
    const meridiem = match[2].toLowerCase();

    if (meridiem === 'pm' && hour !== 12) hour += 12;
    if (meridiem === 'am' && hour === 12) hour = 0;

    return hour;
}

/**
 * Get milliseconds until next operating start time.
 */
function msUntilNextOperatingStart(scheduleConfig) {
    const startHour = parseTimeToHour(scheduleConfig.operatingHours.start) || 6;
    const now = new Date();
    const cstNow = new Date(now.toLocaleString('en-US', { timeZone: scheduleConfig.operatingHours.timezone || 'America/Chicago' }));
    const nextStart = new Date(cstNow);

    // If current hour < start hour, use today's start time
    if (cstNow.getHours() < startHour) {
        nextStart.setHours(startHour, 0, 0, 0);
    } else {
        // Otherwise use tomorrow's start time
        nextStart.setDate(nextStart.getDate() + 1);
        nextStart.setHours(startHour, 0, 0, 0);
    }

    const diff = nextStart.getTime() - cstNow.getTime();
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
    process.on('exit', () => { try { fs.unlinkSync(LOCK_FILE); } catch { } });
    process.on('SIGINT', () => process.exit());
    process.on('SIGTERM', () => process.exit());
}

function runBot(customerId, productId) {
    return new Promise((resolve) => {
        log(`Running bot for: ${customerId}/${productId}`);
        const proc = spawn('node', [BOT_SCRIPT, customerId, productId], {
            cwd: __dirname,
            stdio: 'inherit',
            env: { ...process.env, DISPLAY: ':100' },
        });

        const timer = setTimeout(() => {
            log(`Bot timeout for ${customerId}/${productId} — killing`);
            proc.kill('SIGTERM');
        }, 5 * 60 * 1000); // 5 min max per post

        proc.on('close', (code) => {
            clearTimeout(timer);
            log(`Bot for ${customerId}/${productId} exited with code ${code}`);
            resolve(code);
        });

        proc.on('error', (err) => {
            clearTimeout(timer);
            log(`Bot error for ${customerId}/${productId}: ${err.message}`);
            resolve(1);
        });
    });
}

async function cleanupProcesses() {
    try { execSync('pkill -f "orbita|gologin|chrome" 2>/dev/null', { timeout: 5000 }); } catch { }
    await delay(5000);
}

/**
 * Check if within operating hours for a customer
 */
function isWithinOperatingHours(scheduleConfig) {
    const startHour = parseTimeToHour(scheduleConfig.operatingHours.start) || 6;
    const endHour = parseTimeToHour(scheduleConfig.operatingHours.end) || 22;
    const currentHour = getCurrentCSTHour();

    return currentHour >= startHour && currentHour < endHour;
}

/**
 * Run posting cycle for a single customer
 */
async function runCustomerCycle(customerId) {
    try {
        const customerData = configLoader.loadFullCustomerData(customerId);
        const schedule = customerData.schedule;

        // Check operating hours
        if (!isWithinOperatingHours(schedule)) {
            log(`[${customerId}] Outside operating hours — skipping`);
            return;
        }

        const products = configLoader.getActiveProducts(customerId);

        for (const product of products) {
            const scheduleConfig = schedule.products[product.productId];
            if (!scheduleConfig || !scheduleConfig.enabled) {
                log(`[${customerId}/${product.productId}] Product disabled — skipping`);
                continue;
            }

            const postLimit = scheduleConfig.postLimit || 1;
            const cooldownMin = scheduleConfig.cooldownMinutes || 15;

            log(`[${customerId}/${product.name}] Posting up to ${postLimit} listings (cooldown: ${cooldownMin}min)`);

            for (let i = 0; i < postLimit; i++) {
                // Re-check operating hours before each post
                if (!isWithinOperatingHours(schedule)) {
                    log(`[${customerId}/${product.name}] Operating hours ended. Stopping.`);
                    break;
                }

                await cleanupProcesses();
                const exitCode = await runBot(customerId, product.productId);

                log(`[${customerId}/${product.name}] Post ${i + 1}/${postLimit} — exit code: ${exitCode}`);

                // Cooldown between posts (skip after last post)
                if (i < postLimit - 1) {
                    log(`[${customerId}/${product.name}] Cooling down ${cooldownMin} min before next post...`);
                    await delay(cooldownMin * 60 * 1000);
                }
            }
        }
    } catch (error) {
        log(`[${customerId}] Error in customer cycle: ${error.message}`);
    }
}

async function main() {
    acquireLock();
    log('FB Marketplace Scheduler v2 (Multi-Customer) Started');

    const activeCustomers = configLoader.getAllActiveCustomers();
    log(`Active customers: ${activeCustomers.length}`);

    activeCustomers.forEach(customerId => {
        const products = configLoader.getActiveProducts(customerId);
        const schedule = configLoader.loadScheduleConfig(customerId);
        log(`  ${customerId}: ${products.length} products, cycle: ${schedule.cycleIntervalMinutes}min, hours: ${schedule.operatingHours.start}-${schedule.operatingHours.end}`);
    });

    let cycleCount = 0;

    while (true) {
        cycleCount++;
        log(`\n=== CYCLE ${cycleCount} (CST hour: ${getCurrentCSTHour()}) ===`);

        const activeCustomers = configLoader.getAllActiveCustomers();

        if (activeCustomers.length === 0) {
            log('No active customers found. Sleeping 30 minutes...');
            await delay(30 * 60 * 1000);
            continue;
        }

        // Run cycle for each customer
        for (const customerId of activeCustomers) {
            await runCustomerCycle(customerId);
        }

        // Use the first customer's cycle interval (or default to 20 min)
        let cycleIntervalMin = 20;
        try {
            const firstCustomer = activeCustomers[0];
            const schedule = configLoader.loadScheduleConfig(firstCustomer);
            cycleIntervalMin = schedule.cycleIntervalMinutes || 20;
        } catch (e) {
            log(`Warning: Could not load cycle interval, using default 20 min`);
        }

        log(`Cycle ${cycleCount} complete. Next cycle in ${cycleIntervalMin} min...`);
        await delay(cycleIntervalMin * 60 * 1000);
    }
}

main().catch(e => { log(`Fatal: ${e.message}`); process.exit(1); });
