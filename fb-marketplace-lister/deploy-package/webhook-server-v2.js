require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const { generateListingCopy } = require('./content-generator');
const { generateListingImages } = require('./image-generator');
const { generateUniqueUadConfig, generateMissPartyConfig, MISSPARTY_PRICE, MISSPARTY_DELIVERY } = require('./product-configs');
const { ConfigLoader } = require('./config-loader');

const app = express();

// Initialize ConfigLoader
const configLoader = new ConfigLoader('/opt/fb-marketplace-bot/customers');

// Rotation state per customer+product — phone, location, and MissParty scenario rotate independently
// Structure: { customerId: { productId: { phone: 0, location: 0, scenario: 0 } } }
const rotationState = {};

// Get rotation state for customer+product (lazy init)
const getRotationState = (customerId, productId) => {
    if (!rotationState[customerId]) {
        rotationState[customerId] = {};
    }
    if (!rotationState[customerId][productId]) {
        rotationState[customerId][productId] = { phone: 0, location: 0, scenario: 0 };
    }
    return rotationState[customerId][productId];
};

// Get next phone number in rotation
const getNextPhone = (customerId, productId, productConfig) => {
    const phoneNumbers = productConfig.phoneNumbers || [];
    if (phoneNumbers.length === 0) {
        return { phone: null, index: 0 };
    }
    const state = getRotationState(customerId, productId);
    const idx = state.phone % phoneNumbers.length;
    const phone = phoneNumbers[idx];
    state.phone++;
    console.log(`[${customerId}/${productId}] Phone rotation: ${phone} (${idx + 1}/${phoneNumbers.length})`);
    return { phone, index: idx };
};

// Get next DFW location in rotation
const getNextLocation = (customerId, productId, productConfig) => {
    const locations = productConfig.locations || [];
    if (locations.length === 0) {
        return 'Dallas, TX';
    }
    const state = getRotationState(customerId, productId);
    const idx = state.location % locations.length;
    const location = locations[idx];
    state.location++;
    console.log(`[${customerId}/${productId}] Location rotation: ${location} (${idx + 1}/${locations.length})`);
    return location;
};

// Get next MissParty scenario index
const getNextScenarioIndex = (customerId, productId) => {
    const state = getRotationState(customerId, productId);
    const idx = state.scenario || 0;
    state.scenario = idx + 1;
    return idx;
};

// PostgreSQL connection
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'app_db',
    password: '${POSTGRES_PASSWORD}',
    port: 5432,
});

app.use(express.json());

// ─── QUEUE REPLENISHMENT WITH UNIQUE CONFIGS ───

const MIN_QUEUED = 3;
const REPLENISH_BATCH = 5;

// Track active replenishment to prevent overlapping runs
// Structure: { customerId: { productId: boolean } }
const replenishLock = {};

/**
 * Replenish the queue for a customer+product with UNIQUE configs + Kie.ai generated images.
 */
async function replenishQueue(customerId, productId) {
    // Initialize lock structure
    if (!replenishLock[customerId]) {
        replenishLock[customerId] = {};
    }
    if (replenishLock[customerId][productId]) {
        console.log(`[REPLENISH] ${customerId}/${productId} already running — skip`);
        return 0;
    }

    // Load customer data
    const customerData = configLoader.loadFullCustomerData(customerId);
    const productConfig = customerData.config.products.find(p => p.productId === productId);
    if (!productConfig) {
        console.error(`[REPLENISH] Product ${productId} not found for customer ${customerId}`);
        return 0;
    }

    // Check queue depth
    const countResult = await pool.query(
        `SELECT COUNT(*) as cnt FROM fb_listings WHERE customer_id = $1 AND client_id = $2 AND status = 'queued'`,
        [customerId, productId]
    );
    const queued = parseInt(countResult.rows[0].cnt);

    if (queued >= MIN_QUEUED) return 0;

    replenishLock[customerId][productId] = true;
    const toCreate = REPLENISH_BATCH;
    let created = 0;

    console.log(`[REPLENISH] ${customerId}/${productId} has ${queued} queued — generating ${toCreate} unique listings...`);

    try {
        for (let i = 0; i < toCreate; i++) {
            try {
                let config, uniqueHash, configData;

                // Generate unique config based on product type
                if (productConfig.productType === 'DOORS') {
                    // UAD door config
                    const uadConfig = generateUniqueUadConfig(productConfig.config);
                    if (!uadConfig) {
                        console.warn(`[REPLENISH] ${customerId}/${productId} [${i + 1}/${toCreate}] Failed to generate unique UAD config after 50 attempts`);
                        continue;
                    }
                    config = uadConfig;
                    uniqueHash = uadConfig.uniqueHash;
                    configData = {
                        collection: uadConfig.collection,
                        size: uadConfig.size,
                        design: uadConfig.design,
                        color: uadConfig.color,
                        construction: uadConfig.construction,
                    };
                } else if (productConfig.productType === 'BOUNCE_HOUSES') {
                    // MissParty scenario config
                    const scenarioIndex = getNextScenarioIndex(customerId, productId);
                    const mpConfig = generateMissPartyConfig(scenarioIndex, productConfig.config);
                    config = mpConfig;
                    uniqueHash = mpConfig.uniqueHash;
                    configData = {
                        setting: mpConfig.setting,
                        kids: mpConfig.kids,
                        balls: mpConfig.balls,
                        scenarioDesc: mpConfig.scenarioDesc,
                    };
                } else {
                    console.error(`[REPLENISH] ${customerId}/${productId} Unknown product type: ${productConfig.productType}`);
                    continue;
                }

                // Check dedup
                const dupCheck = await pool.query(
                    `SELECT id FROM fb_listings WHERE customer_id = $1 AND unique_hash = $2 LIMIT 1`,
                    [customerId, uniqueHash]
                );
                if (dupCheck.rows.length > 0) {
                    console.warn(`[REPLENISH] ${customerId}/${productId} [${i + 1}/${toCreate}] Duplicate hash ${uniqueHash.substring(0, 40)} — skip`);
                    continue;
                }

                // Rotate phone and location
                const { phone } = getNextPhone(customerId, productId, productConfig);
                const rotatedLocation = getNextLocation(customerId, productId, productConfig);

                // Price calculation
                let price = config.price;
                const variationPercent = productConfig.pricing?.variationPercent || 0;
                if (variationPercent > 0) {
                    const variation = 1.0 + ((Math.random() * 2 - 1) * (variationPercent / 100));
                    price = Math.round(price * variation);
                }

                // Generate AI listing copy
                const listingCopy = await generateListingCopy(productId, {
                    ...config,
                    price,
                    location: rotatedLocation,
                    phone,
                    delivery: productConfig.delivery || null,
                    rentalPeriod: productConfig.rentalPeriod || null,
                    includes: productConfig.includes || null,
                });

                // Generate images via Kie.ai
                const { imageUrls, videoUrl } = await generateListingImages(productId, config, customerId);

                // Insert into database
                await pool.query(`
                    INSERT INTO fb_listings (
                        customer_id, unique_hash, client_id, status, product_name, size, color, price, listing_price,
                        phone_number, location, listing_title, listing_description,
                        image_url, image_url2, image_url3, video_url,
                        delivery, rental_period, includes,
                        config_data, created_at, updated_at
                    ) VALUES ($1, $2, $3, 'queued', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW())
                `, [
                    customerId,
                    uniqueHash,
                    productId,
                    config.productName || productConfig.name,
                    config.size || null,
                    config.color || null,
                    config.basePrice || price,
                    price,
                    phone,
                    rotatedLocation,
                    listingCopy.title,
                    listingCopy.description,
                    imageUrls[0] || null,
                    imageUrls[1] || null,
                    imageUrls[2] || null,
                    videoUrl,
                    productConfig.delivery || null,
                    productConfig.rentalPeriod || config.rental_period || '24 hours',
                    productConfig.includes || null,
                    JSON.stringify(configData),
                ]);

                created++;
                console.log(`[REPLENISH] ${customerId}/${productId} [${i + 1}/${toCreate}] ✓ ${uniqueHash.substring(0, 40)} — $${price} in ${rotatedLocation}`);

            } catch (itemErr) {
                console.error(`[REPLENISH] ${customerId}/${productId} [${i + 1}/${toCreate}] Failed: ${itemErr.message}`);
            }
        }
    } finally {
        replenishLock[customerId][productId] = false;
    }

    console.log(`[REPLENISH] ${customerId}/${productId} Created ${created}/${toCreate} unique listings`);
    return created;
}

// Background replenishment every 30 minutes
setInterval(async () => {
    const activeCustomers = configLoader.getAllActiveCustomers();
    for (const customerId of activeCustomers) {
        const products = configLoader.getActiveProducts(customerId);
        for (const product of products) {
            try {
                await replenishQueue(customerId, product.productId);
            } catch (e) {
                console.error(`[REPLENISH] Error for ${customerId}/${product.productId}: ${e.message}`);
            }
        }
    }
}, 30 * 60 * 1000);

// Replenish on startup (with small delay to let server start)
setTimeout(async () => {
    const activeCustomers = configLoader.getAllActiveCustomers();
    for (const customerId of activeCustomers) {
        const products = configLoader.getActiveProducts(customerId);
        for (const product of products) {
            try {
                await replenishQueue(customerId, product.productId);
            } catch (e) {
                console.error(`[REPLENISH] Startup error for ${customerId}/${product.productId}: ${e.message}`);
            }
        }
    }
}, 5000);

// ─── JOB SERVING ───

/**
 * Generic job handler — serves the next queued listing for a customer+product.
 */
app.get('/webhook/v2/:customerId/:productId/jobs', async (req, res) => {
    const { customerId, productId } = req.params;

    try {
        // Validate customer exists and is active
        if (!configLoader.isCustomerActive(customerId)) {
            return res.status(403).json({ error: 'Customer not active' });
        }

        // Get next queued job
        const result = await pool.query(`
            SELECT id, unique_hash, client_id, product_name, size, color, price, listing_price,
                   phone_number, location, listing_title, listing_description,
                   image_url, image_url2, image_url3, video_url,
                   delivery, rental_period, includes,
                   config_data
            FROM fb_listings
            WHERE customer_id = $1 AND client_id = $2 AND status = 'queued'
            ORDER BY created_at ASC
            LIMIT 1
        `, [customerId, productId]);

        if (result.rows.length > 0) {
            const job = result.rows[0];

            // Update status to 'pending'
            await pool.query(`
                UPDATE fb_listings
                SET status = 'pending', updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
            `, [job.id]);

            const response = {
                jobId: job.id,
                uniqueHash: job.unique_hash,
                productName: job.product_name,
                size: job.size,
                color: job.color,
                price: job.price,
                listingPrice: job.listing_price,
                phoneNumber: job.phone_number,
                location: job.location,
                title: job.listing_title,
                description: job.listing_description,
                images: [job.image_url, job.image_url2, job.image_url3].filter(Boolean),
                video: job.video_url,
                delivery: job.delivery,
                rentalPeriod: job.rental_period,
                includes: job.includes,
                configData: job.config_data,
            };

            console.log(`[${customerId}/${productId}] Serving job ${job.id}: "${job.listing_title?.substring(0, 50)}" — $${job.listing_price} in ${job.location} — phone: ${job.phone_number}`);

            // Trigger replenishment check in background (non-blocking)
            replenishQueue(customerId, productId).catch(e => console.error(`[REPLENISH] Background error: ${e.message}`));

            res.json(response);
        } else {
            console.log(`[${customerId}/${productId}] No queued jobs — triggering background replenishment`);
            // Trigger replenishment in background (non-blocking) — don't wait
            replenishQueue(customerId, productId).catch(e => console.error(`[REPLENISH] Background error: ${e.message}`));
            res.json({ message: 'No jobs available — replenishment in progress, retry in a few minutes' });
        }
    } catch (error) {
        console.error(`${customerId}/${productId} jobs error:`, error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Status update handler
app.post('/webhook/v2/:customerId/:productId/update', async (req, res) => {
    const { customerId, productId } = req.params;
    const { jobId, status, error, url } = req.body;

    try {
        console.log(`[${customerId}/${productId} UPDATE] Job ${jobId} -> ${status}`);

        await pool.query(`
            UPDATE fb_listings
            SET status = $1::varchar,
                error_message = $2::text,
                facebook_url = $3::text,
                updated_at = CURRENT_TIMESTAMP,
                posted_at = CASE WHEN $1::varchar = 'posted' THEN CURRENT_TIMESTAMP ELSE posted_at END
            WHERE id = $4::int AND customer_id = $5 AND client_id = $6
        `, [status, error || null, url || null, jobId, customerId, productId]);

        res.json({ success: true });
    } catch (error) {
        console.error(`${customerId}/${productId} update error:`, error);
        res.status(500).json({ error: 'Database error' });
    }
});

// ─── BACKWARD COMPATIBILITY ROUTES (v1) ───

// UAD endpoints (map to demo customer)
app.get('/webhook/v1-uad-jobs', async (req, res) => {
    req.params = { customerId: 'demo', productId: 'uad' };
    return app._router.handle(req, res, () => {});
});

app.post('/webhook/v1-uad-update', async (req, res) => {
    req.params = { customerId: 'demo', productId: 'uad' };
    return app._router.handle(req, res, () => {});
});

// Miss Party endpoints (map to demo customer)
app.get('/webhook/v1-miss-party-jobs', async (req, res) => {
    req.params = { customerId: 'demo', productId: 'missparty' };
    return app._router.handle(req, res, () => {});
});

app.post('/webhook/v1-miss-party-update', async (req, res) => {
    req.params = { customerId: 'demo', productId: 'missparty' };
    return app._router.handle(req, res, () => {});
});

// Health check
app.get('/health', async (req, res) => {
    const activeCustomers = configLoader.getAllActiveCustomers();
    const queueStats = {};
    let totalPosted = 0;

    try {
        const posted = await pool.query(`SELECT COUNT(*) as cnt FROM fb_listings WHERE status = 'posted'`);
        totalPosted = parseInt(posted.rows[0].cnt);

        for (const customerId of activeCustomers) {
            const products = configLoader.getActiveProducts(customerId);
            queueStats[customerId] = {};

            for (const product of products) {
                const qResult = await pool.query(
                    `SELECT COUNT(*) as cnt FROM fb_listings WHERE customer_id = $1 AND client_id = $2 AND status = 'queued'`,
                    [customerId, product.productId]
                );
                queueStats[customerId][product.productId] = parseInt(qResult.rows[0].cnt);
            }
        }
    } catch (e) {
        console.error('[HEALTH] Error fetching stats:', e);
    }

    res.json({
        status: 'ok',
        version: 'v2-multi-customer',
        uptime: process.uptime(),
        kieApiEnabled: !!process.env.KIE_API_KEY,
        customers: activeCustomers,
        queueStats,
        totalPosted,
        rotationState,
        replenishing: replenishLock,
    });
});

// ─── START ───

const PORT = 8082;
app.listen(PORT, () => {
    console.log(`Webhook server v2 (multi-customer) running on port ${PORT}`);
    console.log('Unique configs + Kie.ai images + customer isolation enabled');

    const activeCustomers = configLoader.getAllActiveCustomers();
    console.log(`Active customers: ${activeCustomers.length}`);

    activeCustomers.forEach(customerId => {
        const products = configLoader.getActiveProducts(customerId);
        console.log(`  ${customerId}: ${products.length} active products`);
        products.forEach(p => {
            console.log(`    - ${p.name} (${p.productId}): ${p.phoneNumbers.length} phones, ${p.locations.length} locations`);
        });
    });
});
