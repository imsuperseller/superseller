#!/usr/bin/env node
/**
 * Background worker that keeps the image variation pool topped up.
 * Run via PM2: pm2 start image-pool-worker.js --name image-pool
 *
 * On startup: fills all pools to POOL_SIZE.
 * Then every 30 minutes: checks and refills any gaps.
 */

require('dotenv').config();
const { fillAllPools, POOL_SIZE } = require('./image-pool');

const INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

async function run() {
    console.log(`[IMG-POOL-WORKER] Starting — pool target: ${POOL_SIZE} variations per image`);
    console.log(`[IMG-POOL-WORKER] Generating for: uad (images 1,2), missparty (images 1,2)`);

    // Initial fill
    try {
        await fillAllPools();
    } catch (err) {
        console.error(`[IMG-POOL-WORKER] Initial fill error: ${err.message}`);
    }

    // Refill loop
    setInterval(async () => {
        console.log(`[IMG-POOL-WORKER] Refill check at ${new Date().toISOString()}`);
        try {
            await fillAllPools();
        } catch (err) {
            console.error(`[IMG-POOL-WORKER] Refill error: ${err.message}`);
        }
    }, INTERVAL_MS);
}

run();
