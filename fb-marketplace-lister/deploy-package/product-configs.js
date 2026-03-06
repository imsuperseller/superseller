/**
 * Product Configuration Database
 * UAD: All garage door options (5 collections × 7 sizes × 2 designs × 9 colors × 4 constructions)
 * MissParty: 6 bounce house rental scenarios
 *
 * Source: Original n8n workflow (full-complex-marketplace.json) + uadgaragedoors.com configurator
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// ─── UAD GARAGE DOOR OPTIONS ───

const UAD_COLLECTIONS = [
    'Classic™ Steel',
    'Bridgeport™ Steel',
    'Coachman®',
    'Modern Steel™',
    'Canyon Ridge® Collection',
];

const UAD_SIZES = ['8x7', '9x7', '10x7', '16x7', '16x8', '18x7', '18x8'];

const UAD_DESIGNS = ['Short Panel', 'Long Panel'];

const UAD_COLORS = [
    'White', 'Almond', 'Desert Tan', 'Sandtone',
    'Bronze', 'Chocolate', 'Charcoal', 'Gray', 'Black',
];

const UAD_CONSTRUCTIONS = [
    '2" Intellicore® Insulated R-18',
    '1 3/8" Intellicore R-12',
    '2" Polystyrene R-9',
    '1 3/8" Polystyrene R-6',
];

// Force different image per listing — same prompt would yield same image and trigger Facebook duplicates
const UAD_PROMPT_VARIATIONS = [
    'bright morning light, soft shadows',
    'clear afternoon sun, high contrast',
    'golden hour, warm tones',
    'overcast daylight, even lighting',
    'early evening, long shadows',
    'midday sun, crisp detail',
];

// Size-based pricing from original n8n workflow (× 1.1 markup applied at generation time)
const UAD_SIZE_PRICES = {
    '8x7': 1800,
    '9x7': 2000,
    '10x7': 2200,
    '16x7': 3400,
    '16x8': 3800,
    '18x7': 4200,
    '18x8': 4600,
};

// ─── MISSPARTY SCENARIOS ───

const MISSPARTY_SCENARIOS = [
    { setting: 'indoors', kids: 'few', balls: true, desc: 'Toddlers playing with colorful balls inside white bounce house in living room' },
    { setting: 'indoors', kids: 'many', balls: true, desc: 'Birthday party with kids jumping in white bouncy castle, colorful balls flying' },
    { setting: 'outdoors', kids: 'few', balls: false, desc: 'Two kids jumping in white bounce house in sunny backyard' },
    { setting: 'outdoors', kids: 'many', balls: true, desc: 'Backyard birthday party, white inflatable bouncer full of happy kids and balls' },
    { setting: 'indoors', kids: 'few', balls: false, desc: 'Kids jumping in white bounce house in garage, joyful moment' },
    { setting: 'outdoors', kids: 'many', balls: false, desc: 'Group of children bouncing in white inflatable castle at outdoor party' },
];

const MISSPARTY_PRICE = 49.99; // Fixed — NO jitter (changed from $75 → $49.99, Mar 2026)
const MISSPARTY_DELIVERY = '$1/mile delivery available. Free pickup.';

// Force different image per listing — same scenario prompt would yield same image (Facebook duplicate)
const MISSPARTY_PROMPT_VARIATIONS = [
    'soft morning light, natural shadows',
    'bright midday sun, vibrant colors',
    'golden hour, warm atmosphere',
    'clear day, blue sky',
    'overcast, even soft light',
    'sunny afternoon, high clarity',
];

// ─── REFERENCE IMAGES ───

const REFERENCES_DIR = '/var/www/garage-door-images/references';
const UAD_REFERENCES_DIR = path.join(REFERENCES_DIR, 'uad');
const MISSPARTY_REFERENCES_DIR = path.join(REFERENCES_DIR, 'missparty');

// Base bounce house reference images — MUST use originals (no phone overlay!)
// The /img_missparty_*.jpg files have phone overlays baked in from V1.
// Seedream reproduces the phone text, then we add another overlay = double phone.
const MISSPARTY_BASE_IMAGES = [
    '/var/www/garage-door-images/originals/img_missparty_0.jpg',
    '/var/www/garage-door-images/originals/img_missparty_1.jpg',
    '/var/www/garage-door-images/originals/img_missparty_2.jpg',
];

// ─── HELPERS ───

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get UAD reference image path for a given collection + color.
 * Returns the scraped reference if available, null otherwise.
 */
function getUadReferenceImage(collection, color) {
    const safeName = `${collection}_${color}`.replace(/[™®©\s]+/g, '_').replace(/_+/g, '_');
    const imgPath = path.join(UAD_REFERENCES_DIR, `${safeName}.jpg`);
    if (fs.existsSync(imgPath)) return imgPath;
    return null;
}

/**
 * Get a random MissParty reference image.
 */
function getMissPartyReferenceImage() {
    // Return null to force Flux-2 text-to-image generation.
    // Using the same 3 base reference images resulted in Seedream outputs that
    // looked too similar, triggering Facebook duplicate listing errors.
    return null;
}

/**
 * Generate a unique UAD door configuration that hasn't been listed before.
 * Checks the fb_listings table for existing unique_hash patterns.
 *
 * @param {Pool} pool - PostgreSQL pool
 * @returns {Object|null} - { collection, size, design, color, construction, price, uniqueHash, referenceImage, prompts }
 */
async function generateUniqueUadConfig(pool) {
    // Get existing config hashes from DB
    const existing = await pool.query(
        `SELECT unique_hash FROM fb_listings WHERE client_id = 'uad' AND unique_hash LIKE '%|%'`
    );
    const existingSet = new Set(existing.rows.map(r => r.unique_hash));

    for (let attempt = 0; attempt < 50; attempt++) {
        const collection = pick(UAD_COLLECTIONS);
        const size = pick(UAD_SIZES);
        const design = pick(UAD_DESIGNS);
        const color = pick(UAD_COLORS);
        const construction = pick(UAD_CONSTRUCTIONS);

        const configKey = `${collection}|${size}|${design}|${color}`;

        // Check if this combo was already listed
        const alreadyListed = [...existingSet].some(h => h.startsWith(configKey));
        if (alreadyListed) continue;

        // Calculate price: base × 1.1 × random(0.95–1.05)
        const basePrice = UAD_SIZE_PRICES[size] || 2500;
        const price = Math.round(basePrice * 1.1 * (0.95 + Math.random() * 0.1));

        const uniqueHash = `${configKey}|${Date.now()}`;
        const referenceImage = getUadReferenceImage(collection, color);
        const variation = UAD_PROMPT_VARIATIONS[Math.floor(Math.random() * UAD_PROMPT_VARIATIONS.length)];

        const prompts = {
            prompt1: `${color} ${collection} garage door, ${design} design, professional installation on Texas suburban home, ${variation}, curb appeal, realistic photo`,
            prompt2: `Close up detail of ${color} ${collection} garage door, ${design} pattern, ${variation}, high resolution, suburban home exterior`,
            prompt3: `Wide shot: beautiful ${color} ${collection} garage door on Texas home, ${design} design, ${variation}, landscaped driveway, professional photography`,
        };

        return {
            collection,
            size,
            design,
            color,
            construction,
            price,
            uniqueHash,
            referenceImage,
            prompts,
            productName: `${size} ${collection} Garage Door`,
            configData: { collection, size, design, color, construction },
        };
    }

    // Fallback: allow repeat after exhausting attempts
    console.warn('[UAD] Could not find unique config after 50 attempts — allowing repeat');
    const collection = pick(UAD_COLLECTIONS);
    const size = pick(UAD_SIZES);
    const design = pick(UAD_DESIGNS);
    const color = pick(UAD_COLORS);
    const construction = pick(UAD_CONSTRUCTIONS);
    const basePrice = UAD_SIZE_PRICES[size] || 2500;
    const price = Math.round(basePrice * 1.1 * (0.95 + Math.random() * 0.1));

    const variation = UAD_PROMPT_VARIATIONS[Math.floor(Math.random() * UAD_PROMPT_VARIATIONS.length)];
    return {
        collection, size, design, color, construction, price,
        uniqueHash: `${collection}|${size}|${design}|${color}|${Date.now()}`,
        referenceImage: getUadReferenceImage(collection, color),
        prompts: {
            prompt1: `${color} ${collection} garage door, ${design} design, professional installation on Texas suburban home, ${variation}`,
            prompt2: `Close up of ${color} ${collection} garage door, ${design} pattern, ${variation}, high resolution suburban photo`,
            prompt3: `Wide shot: ${color} ${collection} garage door on Texas home, ${design} design, ${variation}, curb appeal`,
        },
        productName: `${size} ${collection} Garage Door`,
        configData: { collection, size, design, color, construction },
    };
}

/**
 * Generate a MissParty scenario configuration.
 * Rotates through scenarios sequentially, combined with city for uniqueness.
 *
 * @param {number} scenarioIndex - Current rotation index
 * @returns {Object} - { scenario, price, delivery, uniqueHash, referenceImage, prompts, videoPrompt, configData }
 */
function generateMissPartyConfig(scenarioIndex) {
    const scenario = MISSPARTY_SCENARIOS[scenarioIndex % MISSPARTY_SCENARIOS.length];
    const referenceImage = getMissPartyReferenceImage();
    const variation = MISSPARTY_PROMPT_VARIATIONS[Math.floor(Math.random() * MISSPARTY_PROMPT_VARIATIONS.length)];

    const ballsDesc = scenario.balls ? 'colorful plastic balls everywhere' : 'clean white aesthetic';
    const locationDesc = scenario.setting === 'indoors' ? 'in living room' : 'in backyard';
    const kidsDesc = scenario.kids === 'many' ? 'multiple excited kids jumping' : 'two happy kids jumping';

    const prompts = {
        prompt1: `White inflatable bounce house, ${scenario.desc}, ${variation}, realistic photo, happy children, professional photography`,
        prompt2: `White bouncy castle ${locationDesc}, ${kidsDesc}, ${ballsDesc}, ${variation}, lifestyle photography`,
        prompt3: `White inflatable bouncer rental setup, ${scenario.setting === 'outdoors' ? 'outdoor party setting' : 'indoor celebration'}, ${scenario.kids === 'many' ? 'birthday party atmosphere' : 'small family gathering'}, ${variation}, professional product photo`,
    };

    const videoPrompt = `${scenario.desc}, 5 second clip, smooth camera movement, natural lighting, joyful atmosphere`;

    return {
        scenario,
        price: MISSPARTY_PRICE,
        delivery: MISSPARTY_DELIVERY,
        uniqueHash: `missparty-${scenario.setting}-${scenario.kids}-${scenario.balls}-${Date.now()}`,
        referenceImage,
        prompts,
        videoPrompt,
        productName: 'White Bounce House Rental',
        configData: {
            setting: scenario.setting,
            kids: scenario.kids,
            balls: scenario.balls,
            scenarioDesc: scenario.desc,
        },
    };
}

module.exports = {
    // UAD
    UAD_COLLECTIONS,
    UAD_SIZES,
    UAD_DESIGNS,
    UAD_COLORS,
    UAD_CONSTRUCTIONS,
    UAD_SIZE_PRICES,
    generateUniqueUadConfig,
    getUadReferenceImage,
    // MissParty
    MISSPARTY_SCENARIOS,
    MISSPARTY_PRICE,
    MISSPARTY_DELIVERY,
    generateMissPartyConfig,
    getMissPartyReferenceImage,
    // Shared
    pick,
    REFERENCES_DIR,
};
