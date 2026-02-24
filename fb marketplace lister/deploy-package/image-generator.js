/**
 * Per-Listing Image & Video Generator
 * Generates unique images for each FB Marketplace listing using Kie.ai API.
 * Replaces the static image pool with fresh AI-generated images per listing.
 *
 * UAD: Uses reference images (scraped from uadgaragedoors.com) + Seedream 4.5 Edit
 *      Falls back to Flux 2 text-to-image if no reference available
 * MissParty: Uses bounce house reference + Seedream 4.5 Edit for images
 *            Uses Kling 3.0 for video generation
 *
 * All 3 images get phone overlay via ImageMagick for consistency.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { generateOverlayImage, IMAGE_DIR } = require('./generate-overlay-images');

const KIE_API_KEY = process.env.KIE_API_KEY || '';
const CREATE_URL = 'https://api.kie.ai/api/v1/jobs/createTask';
const STATUS_URL = 'https://api.kie.ai/api/v1/jobs/recordInfo';
const BASE_URL = 'http://172.245.56.50:8080';
const GENERATED_DIR = '/var/www/garage-door-images/generated';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── KIE.AI API CALLS ───

/**
 * Submit a Kie.ai task (image or video) and poll until complete.
 * @param {string} model - e.g. 'flux-2/pro-text-to-image', 'seedream/4.5-edit', 'kling-3.0/video'
 * @param {object} input - Model-specific input parameters
 * @param {number} maxWaitMs - Max wait time in ms (default 120s for images, 300s for video)
 * @returns {string|null} - Result URL or null on failure
 */
async function submitAndPoll(model, input, maxWaitMs = 120000) {
    if (!KIE_API_KEY) {
        console.error('[IMG-GEN] No KIE_API_KEY configured');
        return null;
    }

    try {
        const createRes = await fetch(CREATE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIE_API_KEY}`,
            },
            body: JSON.stringify({ model, input }),
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            console.error(`[IMG-GEN] Create task failed: HTTP ${createRes.status} — ${errText.substring(0, 200)}`);
            return null;
        }

        const createData = await createRes.json();
        const taskId = createData.data?.taskId;
        if (!taskId) {
            console.error(`[IMG-GEN] No taskId: ${JSON.stringify(createData).substring(0, 200)}`);
            return null;
        }

        // Poll for completion
        const pollInterval = 5000;
        const maxPolls = Math.ceil(maxWaitMs / pollInterval);

        for (let i = 0; i < maxPolls; i++) {
            await sleep(pollInterval);

            const statusRes = await fetch(`${STATUS_URL}?taskId=${taskId}`, {
                headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
            });

            if (!statusRes.ok) continue;

            const statusData = await statusRes.json();
            const state = statusData.data?.state;

            if (state === 'success') {
                const resultJson = JSON.parse(statusData.data.resultJson || '{}');
                const url = resultJson.resultUrls?.[0];
                if (url) return url;
                console.error(`[IMG-GEN] Success but no URL: ${JSON.stringify(resultJson).substring(0, 200)}`);
                return null;
            }

            if (state === 'failed') {
                console.error(`[IMG-GEN] Task ${taskId} failed: ${statusData.data.failMsg || 'unknown'}`);
                return null;
            }
        }

        console.error(`[IMG-GEN] Task ${taskId} timed out after ${maxWaitMs / 1000}s`);
        return null;

    } catch (err) {
        console.error(`[IMG-GEN] API error: ${err.message}`);
        return null;
    }
}

/**
 * Generate an image using reference photo + Seedream 4.5 Edit.
 */
async function generateImageWithReference(referenceUrl, prompt) {
    return submitAndPoll('seedream/4.5-edit', {
        prompt,
        image_urls: [referenceUrl],
        aspect_ratio: '1:1',
        quality: 'basic',
    });
}

/**
 * Generate an image from text prompt using Flux 2 Pro.
 */
async function generateImageFromText(prompt) {
    return submitAndPoll('flux-2/pro-text-to-image', {
        prompt,
        aspect_ratio: '1:1',
        resolution: '1K',
    });
}

/**
 * Generate a video using Kling 3.0 from a reference image.
 */
async function generateVideo(referenceUrl, prompt) {
    return submitAndPoll('kling-3.0/video', {
        prompt,
        image_urls: [referenceUrl],
        duration: '5',
        mode: 'pro',
        multi_shots: false,
        sound: false,
    }, 300000); // 5 min max for video
}

/**
 * Download a URL to a local file path.
 */
async function downloadFile(url, destPath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(destPath, buffer);
    return destPath;
}

/**
 * Apply phone number overlay to an image using ImageMagick.
 * @param {string} inputPath - Source image path
 * @param {string} outputPath - Destination path
 * @param {string} phoneNumber - Phone number to overlay
 * @param {string} subtitle - Subtitle text (e.g., "Free Estimates • Licensed & Insured")
 */
function applyPhoneOverlay(inputPath, outputPath, phoneNumber, subtitle) {
    try {
        const cmd = `convert "${inputPath}" \\
            \\( -clone 0 -crop 100%x18%+0+82% +repage -fill "rgba(0,0,0,178)" -colorize 100% \\) -gravity South -composite \\
            -gravity South -fill white -font Helvetica-Bold -pointsize 48 -annotate +0+45 "CALL: ${phoneNumber}" \\
            -gravity South -fill white -font Helvetica -pointsize 20 -annotate +0+15 "${subtitle}" \\
            -quality 92 "${outputPath}"`;
        execSync(cmd, { timeout: 15000 });
        return true;
    } catch (err) {
        console.error(`[IMG-GEN] Overlay failed: ${err.message}`);
        return false;
    }
}

// ─── PER-LISTING IMAGE SET GENERATION ───

const PRODUCT_SUBTITLES = {
    uad: 'Free Estimates • Licensed & Insured',
    missparty: '24hr Rentals • Dallas TX',
};

/**
 * Generate a complete image set (3 images + optional video) for a listing.
 * Downloads to a unique directory, applies phone overlay to ALL images.
 *
 * @param {string} clientId - 'uad' or 'missparty'
 * @param {object} config - From product-configs.js (has prompts, referenceImage, uniqueHash)
 * @param {string} phoneNumber - Active phone number for overlay
 * @param {object} opts - { generateVideo: boolean }
 * @returns {object} - { imageUrl, imageUrl2, imageUrl3, videoUrl } or null on total failure
 */
async function generateListingImages(clientId, config, phoneNumber, opts = {}) {
    const hashDir = config.uniqueHash.replace(/[|:]/g, '_').replace(/\s+/g, '_');
    const listingDir = path.join(GENERATED_DIR, hashDir);

    // Ensure directories exist
    if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
    if (!fs.existsSync(listingDir)) fs.mkdirSync(listingDir, { recursive: true });

    const subtitle = PRODUCT_SUBTITLES[clientId] || '';
    const referenceUrl = config.referenceImage
        ? `${BASE_URL}/${path.relative('/var/www/garage-door-images', config.referenceImage)}`
        : null;

    const results = { imageUrl: null, imageUrl2: null, imageUrl3: null, videoUrl: null };
    const prompts = [config.prompts.prompt1, config.prompts.prompt2, config.prompts.prompt3];

    // Track the first generated raw image URL — used as reference for images 2-3
    // This ensures all 3 images look like the same product (cohesive set)
    let firstRawUrl = null;

    // Generate 3 images
    for (let i = 0; i < 3; i++) {
        const prompt = prompts[i];
        let resultUrl = null;

        console.log(`[IMG-GEN] [${clientId.toUpperCase()}] Generating image ${i + 1}/3: "${prompt.substring(0, 60)}..."`);

        // For image 1: use product reference (if available) or text-to-image
        // For images 2-3: use image 1 as reference so they match the same product
        const activeRef = (i === 0) ? referenceUrl : (firstRawUrl || referenceUrl);

        if (activeRef) {
            resultUrl = await generateImageWithReference(activeRef, prompt);
        }
        if (!resultUrl) {
            resultUrl = await generateImageFromText(prompt);
        }

        if (!resultUrl) {
            console.error(`[IMG-GEN] [${clientId.toUpperCase()}] Image ${i + 1} failed — using fallback`);
            continue;
        }

        // Save the first generated image URL as reference for images 2-3
        if (i === 0) {
            firstRawUrl = resultUrl;
        }

        // Download raw image
        const rawPath = path.join(listingDir, `img_${i}_raw.jpg`);
        try {
            await downloadFile(resultUrl, rawPath);
        } catch (err) {
            console.error(`[IMG-GEN] [${clientId.toUpperCase()}] Image ${i + 1} download failed: ${err.message}`);
            continue;
        }

        // Apply phone overlay to ALL images
        const overlayPath = path.join(listingDir, `img_${i}.jpg`);
        const overlaySuccess = applyPhoneOverlay(rawPath, overlayPath, phoneNumber, subtitle);

        if (overlaySuccess && fs.existsSync(overlayPath)) {
            const size = Math.round(fs.statSync(overlayPath).size / 1024);
            console.log(`[IMG-GEN] [${clientId.toUpperCase()}] Image ${i + 1} ready (${size}KB) — phone: ${phoneNumber}`);
        } else {
            // Use raw image without overlay as fallback
            fs.copyFileSync(rawPath, overlayPath);
            console.log(`[IMG-GEN] [${clientId.toUpperCase()}] Image ${i + 1} saved without overlay`);
        }

        // Build URL — served via nginx on port 8080
        const relPath = path.relative('/var/www/garage-door-images', overlayPath);
        const url = `${BASE_URL}/${relPath}`;

        if (i === 0) results.imageUrl = url;
        else if (i === 1) results.imageUrl2 = url;
        else results.imageUrl3 = url;
    }

    // Generate video if requested (MissParty only)
    // Use the RAW first image (no overlay) or the clean product reference as video source
    if (opts.generateVideo && config.videoPrompt) {
        console.log(`[IMG-GEN] [${clientId.toUpperCase()}] Generating video: "${config.videoPrompt.substring(0, 60)}..."`);

        // Prefer clean reference for video, fall back to raw image 1
        const rawImg1Path = path.join(listingDir, 'img_0_raw.jpg');
        const rawImg1Url = fs.existsSync(rawImg1Path)
            ? `${BASE_URL}/${path.relative('/var/www/garage-door-images', rawImg1Path)}`
            : null;
        const videoRefUrl = referenceUrl || rawImg1Url;

        if (videoRefUrl) {
            const videoResultUrl = await generateVideo(videoRefUrl, config.videoPrompt);
            if (videoResultUrl) {
                const videoPath = path.join(listingDir, 'video.mp4');
                try {
                    await downloadFile(videoResultUrl, videoPath);
                    const size = Math.round(fs.statSync(videoPath).size / 1024);
                    console.log(`[IMG-GEN] [${clientId.toUpperCase()}] Video ready (${size}KB)`);
                    results.videoUrl = `${BASE_URL}/${path.relative('/var/www/garage-door-images', videoPath)}`;
                } catch (err) {
                    console.error(`[IMG-GEN] [${clientId.toUpperCase()}] Video download failed: ${err.message}`);
                }
            } else {
                console.error(`[IMG-GEN] [${clientId.toUpperCase()}] Video generation failed — using static fallback`);
            }
        }
    }

    // Ensure at least image 1 has a result (fallback to existing static images)
    if (!results.imageUrl) {
        console.warn(`[IMG-GEN] [${clientId.toUpperCase()}] All images failed — falling back to static`);
        results.imageUrl = `${BASE_URL}/img_${clientId}_0.jpg`;
        results.imageUrl2 = `${BASE_URL}/img_${clientId}_1.jpg`;
        results.imageUrl3 = `${BASE_URL}/img_${clientId}_2.jpg`;
    }
    if (!results.imageUrl2) results.imageUrl2 = results.imageUrl;
    if (!results.imageUrl3) results.imageUrl3 = results.imageUrl;

    return results;
}

module.exports = {
    generateListingImages,
    submitAndPoll,
    generateImageWithReference,
    generateImageFromText,
    generateVideo,
    downloadFile,
    applyPhoneOverlay,
    GENERATED_DIR,
};
