#!/usr/bin/env node
/**
 * Generate marketplace listing images with Telnyx phone number overlay.
 * Takes existing AI-generated product photos and adds a professional
 * phone number banner at the bottom of the MAIN image (image 0).
 * 
 * Per-product subtitle configuration:
 * - UAD: "Free Estimates • Licensed & Insured"
 * - MissParty: "24hr Rentals • Dallas TX"
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'bot-config.json'), 'utf8'));
const IMAGE_DIR = '/var/www/garage-door-images';
const ORIGINALS_DIR = path.join(IMAGE_DIR, 'originals');

// Per-product subtitle text
const PRODUCT_SUBTITLES = {
    uad: 'Free Estimates • Licensed & Insured',
    missparty: '24hr Rentals • Dallas TX'
};

function ensureOriginals() {
    if (!fs.existsSync(ORIGINALS_DIR)) {
        fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
    }
    for (const product of CONFIG.products) {
        for (let i = 0; i < 3; i++) {
            const src = path.join(IMAGE_DIR, `img_${product.id}_${i}.jpg`);
            const dst = path.join(ORIGINALS_DIR, `img_${product.id}_${i}.jpg`);
            if (fs.existsSync(src) && !fs.existsSync(dst)) {
                fs.copyFileSync(src, dst);
                console.log(`Saved original: ${path.basename(dst)}`);
            }
        }
    }
}

/**
 * Generate overlay image with phone number banner.
 * Can be called standalone or from webhook-server for dynamic phone rotation.
 * 
 * @param {string} productId - 'uad' or 'missparty'
 * @param {string} phoneNumber - Telnyx phone number to display
 * @param {number} imageIndex - Which image to overlay (0 = main)
 * @param {string} outputPath - Optional custom output path (for dynamic per-job images)
 * @param {string} sourcePath - Optional custom source image (for varied base from image pool)
 * @returns {boolean} success
 */
function generateOverlayImage(productId, phoneNumber, imageIndex = 0, outputPath = null, sourcePath = null) {
    const originalPath = sourcePath || path.join(ORIGINALS_DIR, `img_${productId}_${imageIndex}.jpg`);
    const outPath = outputPath || path.join(IMAGE_DIR, `img_${productId}_${imageIndex}.jpg`);
    
    if (!fs.existsSync(originalPath)) {
        console.log(`Original not found: ${originalPath}`);
        return false;
    }
    
    const subtitle = PRODUCT_SUBTITLES[productId] || '';
    
    // Simple composite approach (works on IM6 Ubuntu)
    const cmd = `convert "${originalPath}" \\
        \\( -size 1024x100 xc:"rgba(0,0,0,178)" \\
            -gravity Center \\
            -fill white \\
            -pointsize 48 \\
            -annotate +0-15 "CALL: ${phoneNumber}" \\
            -pointsize 20 \\
            -annotate +0+30 "${subtitle}" \\
        \\) -gravity South -composite \\
        -quality 92 \\
        "${outPath}"`;
    
    try {
        execSync(cmd, { timeout: 15000, stdio: 'pipe' });
        const size = fs.statSync(outPath).size;
        console.log(`Generated: ${path.basename(outPath)} (${(size/1024).toFixed(0)}KB) — Phone: ${phoneNumber} — Subtitle: ${subtitle}`);
        return true;
    } catch (e) {
        console.error(`Failed: ${path.basename(outPath)} — ${e.message}`);
        return false;
    }
}

// Export for use by webhook-server
module.exports = { generateOverlayImage, PRODUCT_SUBTITLES, ORIGINALS_DIR, IMAGE_DIR };

// Run standalone if called directly
if (require.main === module) {
    console.log('=== Generating Phone Overlay Images ===\n');
    ensureOriginals();
    
    for (const product of CONFIG.products) {
        const phone = product.phoneRotation[0];
        console.log(`\n--- ${product.name} ---`);
        console.log(`Phone: ${phone}`);
        console.log(`Subtitle: ${PRODUCT_SUBTITLES[product.id]}`);
        
        // Only overlay main image (index 0)
        generateOverlayImage(product.id, phone, 0);
    }
    
    console.log('\nDone!');
}
