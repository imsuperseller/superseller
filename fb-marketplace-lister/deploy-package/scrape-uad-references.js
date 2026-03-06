#!/usr/bin/env node
/**
 * One-Time UAD Reference Image Scraper
 *
 * Scrapes product images from uadgaragedoors.com for each collection × color combination.
 * Uses GoLogin's Orbita browser (already installed on RackNerd) via Puppeteer.
 *
 * Output: /var/www/garage-door-images/references/uad/{Collection}_{Color}.jpg
 * Manifest: /var/www/garage-door-images/references/uad/manifest.json
 *
 * Run once manually: node scrape-uad-references.js
 * If the dynamic configurator is too complex, falls back to Flux-2 text-to-image generation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = '/var/www/garage-door-images/references/uad';
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');

const COLLECTIONS = [
    'Classic™ Steel',
    'Bridgeport™ Steel',
    'Coachman®',
    'Modern Steel™',
    'Canyon Ridge® Collection',
];

const COLORS = [
    'White', 'Almond', 'Desert Tan', 'Sandtone',
    'Bronze', 'Chocolate', 'Charcoal', 'Gray', 'Black',
];

const KIE_API_KEY = process.env.KIE_API_KEY || '';
const KIE_CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask';
const KIE_STATUS_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function safeName(collection, color) {
    return `${collection}_${color}`.replace(/[™®©\s]+/g, '_').replace(/_+/g, '_');
}

/**
 * Try to scrape the UAD configurator using Puppeteer + GoLogin's Orbita browser.
 * Returns array of { collection, color, imagePath } for successful scrapes.
 */
async function scrapeWithBrowser() {
    const results = [];

    let puppeteer;
    try {
        puppeteer = require('puppeteer-core');
    } catch {
        console.log('[SCRAPER] puppeteer-core not available — skipping browser scrape');
        return results;
    }

    const browserPath = '/opt/gologin/orbita-browser/chrome';
    if (!fs.existsSync(browserPath)) {
        console.log('[SCRAPER] Orbita browser not found — skipping browser scrape');
        return results;
    }

    console.log('[SCRAPER] Launching Orbita browser...');
    const browser = await puppeteer.launch({
        executablePath: browserPath,
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--display=:100'],
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        // Navigate to configurator
        console.log('[SCRAPER] Loading UAD configurator...');
        await page.goto('https://uadgaragedoors.com/garage-door-cost-calculator/collections/', {
            waitUntil: 'networkidle2',
            timeout: 30000,
        });

        // Check if configurator page loaded
        const pageTitle = await page.title();
        console.log(`[SCRAPER] Page title: "${pageTitle}"`);

        // Try to find collection links/buttons
        const collectionLinks = await page.$$eval('a[href*="collection"], .collection-card, .door-collection', els =>
            els.map(el => ({ text: el.textContent?.trim(), href: el.href }))
        );
        console.log(`[SCRAPER] Found ${collectionLinks.length} collection elements`);

        if (collectionLinks.length === 0) {
            // Try screenshot for debugging
            const debugPath = path.join(OUTPUT_DIR, '_debug_page.png');
            await page.screenshot({ path: debugPath, fullPage: true });
            console.log(`[SCRAPER] Debug screenshot saved: ${debugPath}`);
            console.log('[SCRAPER] No collection elements found — configurator may be JS-heavy');
        }

        // For each collection, try to navigate and capture product images
        for (const collection of COLLECTIONS) {
            const cleanName = collection.replace(/[™®©]/g, '').trim();

            // Try clicking collection link
            const linkEl = await page.$(`a:has-text("${cleanName}"), [data-collection*="${cleanName}"]`);
            if (!linkEl) {
                console.log(`[SCRAPER] Collection "${collection}" — no clickable element found`);
                continue;
            }

            await linkEl.click();
            await sleep(3000);

            // Try to find color selectors
            for (const color of COLORS) {
                const colorEl = await page.$(`[data-color*="${color}"], .color-swatch[title*="${color}"], button:has-text("${color}")`);
                if (!colorEl) {
                    console.log(`[SCRAPER]   ${collection} / ${color} — no color selector`);
                    continue;
                }

                await colorEl.click();
                await sleep(2000);

                // Try to capture the product image
                const imgSrc = await page.$eval(
                    '.door-preview img, .configurator-image img, .product-image img, #door-image',
                    el => el.src
                ).catch(() => null);

                if (imgSrc) {
                    const fileName = `${safeName(collection, color)}.jpg`;
                    const filePath = path.join(OUTPUT_DIR, fileName);

                    // Download image
                    try {
                        const res = await fetch(imgSrc);
                        if (res.ok) {
                            const buffer = Buffer.from(await res.arrayBuffer());
                            fs.writeFileSync(filePath, buffer);
                            console.log(`[SCRAPER]   ✓ ${collection} / ${color} — saved (${Math.round(buffer.length / 1024)}KB)`);
                            results.push({ collection, color, imagePath: filePath });
                        }
                    } catch (dlErr) {
                        console.error(`[SCRAPER]   ✗ ${collection} / ${color} — download failed: ${dlErr.message}`);
                    }
                }
            }

            // Go back to collections page
            await page.goBack();
            await sleep(2000);
        }
    } finally {
        await browser.close();
    }

    return results;
}

/**
 * Generate reference images using Flux 2 text-to-image via Kie.ai.
 * Used as fallback when browser scraping doesn't work.
 */
async function generateWithFlux2(collection, color) {
    if (!KIE_API_KEY) {
        console.error('[SCRAPER] No KIE_API_KEY — cannot generate fallback images');
        return null;
    }

    const prompt = `Professional product photo of a ${color} ${collection} garage door, short panel design, installed on a suburban Texas home, bright daylight, clean professional photography, no text overlays`;

    try {
        const createRes = await fetch(KIE_CREATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIE_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'flux-2/pro-text-to-image',
                input: { prompt, aspect_ratio: '1:1', resolution: '1K' },
            }),
        });

        if (!createRes.ok) {
            console.error(`[SCRAPER] Flux-2 create failed: HTTP ${createRes.status}`);
            return null;
        }

        const createData = await createRes.json();
        const taskId = createData.data?.taskId;
        if (!taskId) return null;

        // Poll for completion (2 min max)
        for (let i = 0; i < 24; i++) {
            await sleep(5000);
            const statusRes = await fetch(`${KIE_STATUS_URL}?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
            });
            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();
            const state = statusData.data?.state;

            if (state === 'success') {
                const resultJson = JSON.parse(statusData.data.resultJson || '{}');
                return resultJson.resultUrls?.[0] || null;
            }
            if (state === 'failed') return null;
        }
        return null;
    } catch (err) {
        console.error(`[SCRAPER] Flux-2 error: ${err.message}`);
        return null;
    }
}

async function main() {
    console.log('=== UAD Reference Image Scraper ===\n');

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Check what we already have
    const existingManifest = fs.existsSync(MANIFEST_PATH)
        ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
        : {};
    const existingCount = Object.keys(existingManifest).length;
    console.log(`Existing references: ${existingCount}`);

    const manifest = { ...existingManifest };
    const totalCombos = COLLECTIONS.length * COLORS.length;
    let generated = 0;
    let skipped = 0;

    // Phase 1: Try browser scraping
    console.log('\n--- Phase 1: Browser Scraping ---');
    const scraped = await scrapeWithBrowser();
    for (const item of scraped) {
        const key = safeName(item.collection, item.color);
        manifest[key] = { collection: item.collection, color: item.color, path: item.imagePath, source: 'scrape' };
        generated++;
    }
    console.log(`Browser scraping got ${scraped.length} images\n`);

    // Phase 2: Flux-2 fallback for missing combos
    console.log('--- Phase 2: Flux-2 Fallback ---');
    for (const collection of COLLECTIONS) {
        for (const color of COLORS) {
            const key = safeName(collection, color);
            const filePath = path.join(OUTPUT_DIR, `${key}.jpg`);

            // Skip if already exists
            if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
                manifest[key] = manifest[key] || { collection, color, path: filePath, source: 'existing' };
                skipped++;
                continue;
            }

            console.log(`[FLUX-2] Generating: ${collection} / ${color}...`);
            const imageUrl = await generateWithFlux2(collection, color);

            if (imageUrl) {
                try {
                    const res = await fetch(imageUrl);
                    if (res.ok) {
                        const buffer = Buffer.from(await res.arrayBuffer());
                        fs.writeFileSync(filePath, buffer);
                        manifest[key] = { collection, color, path: filePath, source: 'flux-2' };
                        generated++;
                        console.log(`  ✓ ${key} — saved (${Math.round(buffer.length / 1024)}KB)`);
                    }
                } catch (dlErr) {
                    console.error(`  ✗ ${key} — download failed: ${dlErr.message}`);
                }
            } else {
                console.error(`  ✗ ${key} — generation failed`);
            }

            // Brief delay between API calls
            await sleep(2000);
        }
    }

    // Save manifest
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n=== Done ===`);
    console.log(`Total combos: ${totalCombos}`);
    console.log(`Generated: ${generated}`);
    console.log(`Skipped (already existed): ${skipped}`);
    console.log(`Missing: ${totalCombos - generated - skipped}`);
    console.log(`Manifest: ${MANIFEST_PATH}`);
}

main().catch(e => {
    console.error(`Fatal: ${e.message}`);
    process.exit(1);
});
