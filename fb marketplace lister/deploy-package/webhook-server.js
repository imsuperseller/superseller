require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { generateListingCopy } = require('./content-generator');
const { generateListingImages } = require('./image-generator');
const { generateUniqueUadConfig, generateMissPartyConfig, MISSPARTY_PRICE, MISSPARTY_DELIVERY } = require('./product-configs');
const app = express();

// Load config
const CONFIG = JSON.parse(fs.readFileSync('./bot-config.json', 'utf8'));

// Rotation state — phone, location, and MissParty scenario rotate independently
const rotationState = {
    uad:       { phone: 0, location: 0 },
    missparty: { phone: 0, location: 0, scenario: 0 },
};

// Get next phone number in rotation
const getNextPhone = (clientId) => {
    const product = CONFIG.products.find(p => p.id === clientId);
    if (!product || !product.phoneRotation || product.phoneRotation.length === 0) {
        return { phone: null, index: 0 };
    }
    const state = rotationState[clientId] || { phone: 0, location: 0 };
    const idx = state.phone % product.phoneRotation.length;
    const phone = product.phoneRotation[idx];
    state.phone++;
    rotationState[clientId] = state;
    console.log(`[${clientId.toUpperCase()}] Phone rotation: ${phone} (${idx + 1}/${product.phoneRotation.length})`);
    return { phone, index: idx };
};

// Get next DFW location in rotation
const getNextLocation = (clientId) => {
    const product = CONFIG.products.find(p => p.id === clientId);
    if (!product || !product.locations || product.locations.length === 0) {
        return 'Dallas, TX';
    }
    const state = rotationState[clientId] || { phone: 0, location: 0 };
    const idx = state.location % product.locations.length;
    const location = product.locations[idx];
    state.location++;
    rotationState[clientId] = state;
    console.log(`[${clientId.toUpperCase()}] Location rotation: ${location} (${idx + 1}/${product.locations.length})`);
    return location;
};

// Get next MissParty scenario index
const getNextScenarioIndex = () => {
    const state = rotationState.missparty;
    const idx = state.scenario || 0;
    state.scenario = idx + 1;
    return idx;
};

// PostgreSQL connection
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app_db',
    password: 'a1efbcd564b928d3ef1d7cae',
    port: 5432,
});

app.use(express.json());

// ─── QUEUE REPLENISHMENT WITH UNIQUE CONFIGS ───

const MIN_QUEUED = 3;
const REPLENISH_BATCH = 5;

// Track active replenishment to prevent overlapping runs
let replenishLock = { uad: false, missparty: false };

/**
 * Replenish the queue for a client with UNIQUE configs + Kie.ai generated images.
 * Each listing gets a unique door config (UAD) or scenario (MissParty) with fresh images.
 */
async function replenishQueue(clientId) {
    if (replenishLock[clientId]) {
        console.log(`[REPLENISH] ${clientId.toUpperCase()} already running — skip`);
        return 0;
    }

    const countResult = await pool.query(
        `SELECT COUNT(*) as cnt FROM fb_listings WHERE client_id = $1 AND status = 'queued'`,
        [clientId]
    );
    const queued = parseInt(countResult.rows[0].cnt);

    if (queued >= MIN_QUEUED) return 0;

    replenishLock[clientId] = true;
    const toCreate = REPLENISH_BATCH;
    let created = 0;

    console.log(`[REPLENISH] ${clientId.toUpperCase()} has ${queued} queued — generating ${toCreate} unique listings...`);

    try {
        for (let i = 0; i < toCreate; i++) {
            try {
                const product = CONFIG.products.find(p => p.id === clientId);
                const { phone: activePhone } = getNextPhone(clientId);
                const rotatedLocation = getNextLocation(clientId);

                let config, productName, price, uniqueHash, configData;
                let generateVideo = false;

                if (clientId === 'uad') {
                    config = await generateUniqueUadConfig(pool);
                    productName = config.productName;
                    price = config.price;
                    uniqueHash = config.uniqueHash;
                    configData = config.configData;
                } else {
                    // MissParty
                    const scenarioIdx = getNextScenarioIndex();
                    config = generateMissPartyConfig(scenarioIdx);
                    productName = config.productName;
                    price = MISSPARTY_PRICE; // Fixed $75 — NO jitter
                    uniqueHash = config.uniqueHash;
                    configData = config.configData;
                    generateVideo = product.videoLogic === 'dynamic';
                }

                // Generate images via Kie.ai (3 images + optional video)
                console.log(`[REPLENISH] ${clientId.toUpperCase()} [${i + 1}/${toCreate}] Generating images for: ${uniqueHash.substring(0, 50)}...`);
                const images = await generateListingImages(clientId, config, activePhone || product.phoneRotation[0], {
                    generateVideo,
                });

                // Generate AI copy via Gemini
                const jobForCopy = {
                    title: productName,
                    price,
                    listingPrice: price,
                };

                // Enrich copy prompt with config details
                if (clientId === 'uad' && config.configData) {
                    jobForCopy.title = `${config.configData.size} ${config.configData.collection} Garage Door - ${config.configData.color} ${config.configData.design}`;
                    jobForCopy.construction = config.configData.construction;
                } else if (clientId === 'missparty') {
                    jobForCopy.delivery = MISSPARTY_DELIVERY;
                    jobForCopy.scenarioDesc = config.scenario?.desc || '';
                }

                let listingTitle = productName;
                let listingDescription = clientId === 'uad'
                    ? `Professional ${productName} installation. ${config.configData?.color || ''} ${config.configData?.design || ''} design. Call ${activePhone || product.phoneRotation[0]} for free estimate!`
                    : `White Bounce House Rental - 24hr party fun! ${MISSPARTY_DELIVERY} Call ${product.phoneRotation[0]} to book!`;

                try {
                    const aiCopy = await generateListingCopy(clientId, jobForCopy, rotatedLocation, activePhone || product.phoneRotation[0]);
                    if (aiCopy) {
                        listingTitle = aiCopy.title;
                        listingDescription = aiCopy.description;
                        console.log(`[REPLENISH] ${clientId.toUpperCase()} AI copy: "${listingTitle.substring(0, 50)}..."`);
                    }
                } catch (aiErr) {
                    console.error(`[REPLENISH] ${clientId.toUpperCase()} AI copy failed: ${aiErr.message}`);
                }

                // For MissParty, ensure description includes "$1/mile delivery"
                if (clientId === 'missparty' && !listingDescription.includes('$1/mile')) {
                    listingDescription += `\n\n${MISSPARTY_DELIVERY}`;
                }

                // Video URL: static for UAD, generated for MissParty
                const videoUrl = clientId === 'uad'
                    ? `http://172.245.56.50:8080/${product.videoFilename}`
                    : (images.videoUrl || `http://172.245.56.50:8080/${product.videoFilename}`);

                // Insert into db with full config
                await pool.query(`
                    INSERT INTO fb_listings (
                        unique_hash, client_id, status, product_name, size, color, price, listing_price,
                        phone_number, location, listing_title, listing_description,
                        image_url, image_url2, image_url3, video_url,
                        delivery, rental_period, includes,
                        config_data, created_at, updated_at
                    ) VALUES ($1, $2, 'queued', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
                `, [
                    uniqueHash,
                    clientId,
                    productName,
                    config.configData?.size || '15x15',
                    config.configData?.color || 'White',
                    price,
                    price,
                    activePhone || product.phoneRotation[0],
                    rotatedLocation,
                    listingTitle,
                    listingDescription,
                    images.imageUrl,
                    images.imageUrl2 || images.imageUrl,
                    images.imageUrl3 || images.imageUrl,
                    videoUrl,
                    config.delivery || null,
                    config.rentalPeriod || config.rental_period || '24 hours',
                    config.includes || null,
                    JSON.stringify(configData),
                ]);

                created++;
                console.log(`[REPLENISH] ${clientId.toUpperCase()} [${i + 1}/${toCreate}] ✓ ${uniqueHash.substring(0, 40)} — $${price} in ${rotatedLocation}`);

            } catch (itemErr) {
                console.error(`[REPLENISH] ${clientId.toUpperCase()} [${i + 1}/${toCreate}] Failed: ${itemErr.message}`);
            }
        }
    } finally {
        replenishLock[clientId] = false;
    }

    console.log(`[REPLENISH] ${clientId.toUpperCase()} Created ${created}/${toCreate} unique listings`);
    return created;
}

// Background replenishment every 30 minutes
setInterval(async () => {
    for (const product of CONFIG.products) {
        try {
            await replenishQueue(product.id);
        } catch (e) {
            console.error(`[REPLENISH] Error for ${product.id}: ${e.message}`);
        }
    }
}, 30 * 60 * 1000);

// Replenish on startup (with small delay to let server start)
setTimeout(async () => {
    for (const product of CONFIG.products) {
        try {
            await replenishQueue(product.id);
        } catch (e) {
            console.error(`[REPLENISH] Startup error for ${product.id}: ${e.message}`);
        }
    }
}, 5000);

// ─── JOB SERVING ───

/**
 * Generic job handler — serves the next queued listing for a client.
 * Each listing already has unique config, images, and AI copy from replenishment.
 */
const getJobsHandler = (clientId) => async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                unique_hash,
                listing_title as title,
                listing_description as description,
                price as "listingPrice",
                price,
                phone_number as "phoneNumber",
                location,
                image_url as "imageUrl",
                image_url2 as "imageUrl2",
                image_url3 as "imageUrl3",
                video_url as "videoUrl",
                delivery,
                rental_period as "rentalPeriod",
                includes,
                config_data as "configData",
                client_id
            FROM fb_listings
            WHERE client_id = $1 AND status = 'queued'
            ORDER BY created_at ASC
            LIMIT 1
        `, [clientId]);

        if (result.rows.length > 0) {
            const job = result.rows[0];

            const response = {
                ...job,
                // Ensure consistent field naming for the bot
                phone: job.phoneNumber,
                videoFilename: path.basename(job.videoUrl || ''),
            };

            console.log(`[${clientId.toUpperCase()}] Serving job ${job.id}: "${job.title?.substring(0, 50)}" — $${job.price} in ${job.location} — phone: ${job.phoneNumber}`);

            // Trigger replenishment check in background (non-blocking)
            replenishQueue(clientId).catch(e => console.error(`[REPLENISH] Background error: ${e.message}`));

            res.json(response);
        } else {
            console.log(`[${clientId.toUpperCase()}] No queued jobs — triggering background replenishment`);
            // Trigger replenishment in background (non-blocking) — don't wait
            replenishQueue(clientId).catch(e => console.error(`[REPLENISH] Background error: ${e.message}`));
            res.json({ message: 'No jobs available — replenishment in progress, retry in a few minutes' });
        }
    } catch (error) {
        console.error(`${clientId} jobs error:`, error);
        res.status(500).json({ error: 'Database error' });
    }
};

// Status update handler
const updateHandler = (clientId) => async (req, res) => {
    try {
        const { jobId, status, error, url } = req.body;
        console.log(`[${clientId.toUpperCase()} UPDATE] Job ${jobId} -> ${status}`);

        await pool.query(`
            UPDATE fb_listings
            SET status = $1::varchar,
                error_message = $2::text,
                facebook_url = $3::text,
                updated_at = CURRENT_TIMESTAMP,
                posted_at = CASE WHEN $1::varchar = 'posted' THEN CURRENT_TIMESTAMP ELSE posted_at END
            WHERE id = $4::int AND client_id = $5
        `, [status, error || null, url || null, jobId, clientId]);

        res.json({ success: true });
    } catch (error) {
        console.error(`${clientId} update error:`, error);
        res.status(500).json({ error: 'Database error' });
    }
};

// ─── ROUTES ───

// UAD endpoints
app.get('/webhook/v1-uad-jobs', getJobsHandler('uad'));
app.post('/webhook/v1-uad-update', updateHandler('uad'));

// Miss Party endpoints
app.get('/webhook/v1-miss-party-jobs', getJobsHandler('missparty'));
app.post('/webhook/v1-miss-party-update', updateHandler('missparty'));

// Health check
app.get('/health', async (req, res) => {
    let queuedUad = 0, queuedMissparty = 0, totalPosted = 0;
    try {
        const uadQ = await pool.query(`SELECT COUNT(*) as cnt FROM fb_listings WHERE client_id = 'uad' AND status = 'queued'`);
        const mpQ = await pool.query(`SELECT COUNT(*) as cnt FROM fb_listings WHERE client_id = 'missparty' AND status = 'queued'`);
        const posted = await pool.query(`SELECT COUNT(*) as cnt FROM fb_listings WHERE status = 'posted'`);
        queuedUad = parseInt(uadQ.rows[0].cnt);
        queuedMissparty = parseInt(mpQ.rows[0].cnt);
        totalPosted = parseInt(posted.rows[0].cnt);
    } catch (e) { /* ignore */ }

    res.json({
        status: 'ok',
        version: 'v2-unique-configs',
        uptime: process.uptime(),
        kieApiEnabled: !!process.env.KIE_API_KEY,
        queue: {
            uad: queuedUad,
            missparty: queuedMissparty,
            totalPosted,
        },
        rotation: rotationState,
        products: CONFIG.products.map(p => ({
            id: p.id,
            phones: p.phoneRotation.length,
            locations: p.locations.length,
            postLimit: p.postLimit,
            cooldownMinutes: p.cooldownMinutes,
            stealthLevel: p.stealthLevel,
            videoLogic: p.videoLogic,
            nextPhone: p.phoneRotation[rotationState[p.id]?.phone % p.phoneRotation.length],
            nextLocation: p.locations[rotationState[p.id]?.location % p.locations.length],
        })),
        replenishing: replenishLock,
    });
});

// ─── START ───

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Webhook server v2 running on port ${PORT}`);
    console.log('Unique configs + Kie.ai images + dedup enabled');
    CONFIG.products.forEach(p => {
        console.log(`  ${p.name}: ${p.phoneRotation.length} phones, ${p.locations.length} locations, postLimit=${p.postLimit}, cooldown=${p.cooldownMinutes}min`);
    });
});
