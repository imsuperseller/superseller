/**
 * Image variation pool for FB Marketplace stealth.
 * Pre-generates subtle variations of product images via Kie.ai Seedream 4.5 Edit.
 * Webhook serves a unique image set per posting instead of static images.
 *
 * Pool structure: /var/www/garage-door-images/variations/
 *   {clientId}_{imgIdx}_{varIdx}.jpg
 *   e.g. missparty_1_0.jpg, missparty_1_1.jpg, uad_2_3.jpg
 *
 * API docs: NotebookLM 3e820274 (KIE.AI)
 */

const fs = require('fs');
const path = require('path');

const KIE_API_KEY = process.env.KIE_API_KEY || '';
const CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask';
const STATUS_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo';
const POOL_DIR = '/var/www/garage-door-images/variations';
const BASE_DIR = '/var/www/garage-door-images';
const BASE_URL = 'http://172.245.56.50:8080';

// How many variations to keep per image
const POOL_SIZE = 6;

// Subtle variation prompts — keep the product recognizable, just shift the "vibe"
const VARIATION_PROMPTS = [
    'Slightly warmer golden lighting, same composition and product',
    'Slightly cooler blue-toned lighting, same scene and layout',
    'Soft morning sunlight with gentle shadows, same product and angle',
    'Bright and airy with slightly increased exposure, same composition',
    'Rich warm afternoon light with subtle contrast boost, same scene',
    'Gentle soft-focus background with crisp product detail, same composition',
    'Slightly desaturated vintage tone, same product and angle',
    'Vivid and punchy colors with enhanced saturation, same scene',
    'Subtle HDR enhancement with balanced highlights, same composition',
    'Cool evening ambient light, same product and layout'
];

/**
 * Submit a Seedream 4.5 Edit task and poll until complete.
 * Returns the output image URL or null on failure.
 */
async function generateVariation(baseImageUrl, prompt) {
    if (!KIE_API_KEY) return null;

    try {
        // Submit task
        const createRes = await fetch(CREATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIE_API_KEY}`
            },
            body: JSON.stringify({
                model: 'seedream/4.5-edit',
                input: {
                    prompt,
                    image_urls: [baseImageUrl],
                    aspect_ratio: '1:1',
                    quality: 'basic'
                }
            })
        });

        if (!createRes.ok) {
            console.error(`[IMG-POOL] Create task failed: HTTP ${createRes.status}`);
            return null;
        }

        const createData = await createRes.json();
        const taskId = createData.data?.taskId;
        if (!taskId) {
            console.error('[IMG-POOL] No taskId returned');
            return null;
        }

        // Poll for completion (max 90s, every 5s)
        for (let i = 0; i < 18; i++) {
            await sleep(5000);

            const statusRes = await fetch(`${STATUS_URL}?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
            });

            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();
            const state = statusData.data?.state;

            if (state === 'success') {
                const resultJson = JSON.parse(statusData.data.resultJson);
                const url = resultJson.resultUrls?.[0];
                if (url) return url;
                console.error('[IMG-POOL] Success but no resultUrls');
                return null;
            }

            if (state === 'failed') {
                console.error(`[IMG-POOL] Task failed: ${statusData.data.failMsg}`);
                return null;
            }
            // state === 'waiting' — continue polling
        }

        console.error(`[IMG-POOL] Task ${taskId} timed out after 90s`);
        return null;

    } catch (err) {
        console.error(`[IMG-POOL] Generation error: ${err.message}`);
        return null;
    }
}

/**
 * Download an image URL to a local path.
 */
async function downloadImage(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return destPath;
}

/**
 * List existing variations for a client+image index.
 * Returns array of filenames sorted by index.
 */
function listVariations(clientId, imgIdx) {
    if (!fs.existsSync(POOL_DIR)) return [];
    const prefix = `${clientId}_${imgIdx}_`;
    return fs.readdirSync(POOL_DIR)
        .filter(f => f.startsWith(prefix) && f.endsWith('.jpg'))
        .sort();
}

/**
 * Get a random variation URL for a client+image index.
 * Falls back to the base static image if no variations exist.
 */
function getVariationUrl(clientId, imgIdx) {
    const variations = listVariations(clientId, imgIdx);
    if (variations.length === 0) {
        return `${BASE_URL}/img_${clientId}_${imgIdx}.jpg`;
    }
    const pick = variations[Math.floor(Math.random() * variations.length)];
    return `${BASE_URL}/variations/${pick}`;
}

/**
 * Ensure the pool for a given client+image has POOL_SIZE variations.
 * Generates any missing ones. Returns count of newly generated images.
 */
async function fillPool(clientId, imgIdx) {
    const existing = listVariations(clientId, imgIdx);
    const needed = POOL_SIZE - existing.length;
    if (needed <= 0) {
        console.log(`[IMG-POOL] ${clientId}_${imgIdx}: pool full (${existing.length}/${POOL_SIZE})`);
        return 0;
    }

    console.log(`[IMG-POOL] ${clientId}_${imgIdx}: generating ${needed} variations (have ${existing.length}/${POOL_SIZE})`);

    const baseImageUrl = `${BASE_URL}/img_${clientId}_${imgIdx}.jpg`;
    let generated = 0;

    // Find next available index
    const existingIndices = existing.map(f => {
        const match = f.match(/_(\d+)\.jpg$/);
        return match ? parseInt(match[1]) : -1;
    });
    let nextIdx = existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;

    for (let i = 0; i < needed; i++) {
        const prompt = VARIATION_PROMPTS[(nextIdx + i) % VARIATION_PROMPTS.length];
        console.log(`[IMG-POOL] ${clientId}_${imgIdx}_${nextIdx + i}: "${prompt.substring(0, 50)}..."`);

        const resultUrl = await generateVariation(baseImageUrl, prompt);
        if (!resultUrl) {
            console.error(`[IMG-POOL] ${clientId}_${imgIdx}_${nextIdx + i}: generation failed, skipping`);
            continue;
        }

        const destPath = path.join(POOL_DIR, `${clientId}_${imgIdx}_${nextIdx + i}.jpg`);
        try {
            await downloadImage(resultUrl, destPath);
            const size = fs.statSync(destPath).size;
            console.log(`[IMG-POOL] ${clientId}_${imgIdx}_${nextIdx + i}: saved (${Math.round(size / 1024)}KB)`);
            generated++;
        } catch (err) {
            console.error(`[IMG-POOL] ${clientId}_${imgIdx}_${nextIdx + i}: download failed: ${err.message}`);
        }
    }

    return generated;
}

/**
 * Fill pools for ALL images of ALL clients.
 * Images 1 and 2 get variations (image 0 gets phone overlay separately).
 */
async function fillAllPools() {
    const clients = ['uad', 'missparty'];
    const imageIndices = [0, 1, 2]; // All images get variations (img 0 used as overlay base)
    let totalGenerated = 0;

    for (const clientId of clients) {
        for (const imgIdx of imageIndices) {
            const basePath = path.join(BASE_DIR, `img_${clientId}_${imgIdx}.jpg`);
            if (!fs.existsSync(basePath)) {
                console.log(`[IMG-POOL] ${clientId}_${imgIdx}: base image not found, skipping`);
                continue;
            }
            totalGenerated += await fillPool(clientId, imgIdx);
        }
    }

    console.log(`[IMG-POOL] Fill complete: ${totalGenerated} new variations generated`);
    return totalGenerated;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get a random variation LOCAL PATH for a client+image index.
 * Falls back to the base static image if no variations exist.
 * Used by overlay generator which needs a local file, not a URL.
 */
function getVariationPath(clientId, imgIdx) {
    const variations = listVariations(clientId, imgIdx);
    if (variations.length === 0) {
        return path.join(BASE_DIR, `img_${clientId}_${imgIdx}.jpg`);
    }
    const pick = variations[Math.floor(Math.random() * variations.length)];
    return path.join(POOL_DIR, pick);
}

module.exports = {
    generateVariation,
    downloadImage,
    listVariations,
    getVariationUrl,
    getVariationPath,
    fillPool,
    fillAllPools,
    POOL_SIZE
};
