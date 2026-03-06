const { GoLogin } = require("gologin");
const puppeteer = require("puppeteer-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

/**
 * Atomic Facebook Marketplace Posting Engine
 * Designed for SaaS multi-tenancy.
 */

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

async function jitteryType(page, text) {
    for (const char of text) {
        await page.keyboard.type(char, { delay: randomRange(50, 150) });
    }
}

async function downloadFile(url, filename, baseDir) {
    if (!url) return null;

    // Check if it's already a valid local path on the VPS
    if (fs.existsSync(url)) return url;

    // Skip invalid URLs
    if (url.startsWith("/Users/") || url.startsWith("C:\\") || !url.startsWith("http")) {
        console.warn(`[Engine] Skipping invalid URL: ${url}`);
        return null;
    }

    const filePath = path.join(baseDir, filename);
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 30000
        });
        fs.writeFileSync(filePath, response.data);
        return filePath;
    } catch (e) {
        console.error(`[Engine] Download error for ${url}:`, e.message);
        return null;
    }
}

/**
 * Core Automation Logic
 * @param {Object} credentials - FB Email, FB Pass, GoLogin Token, Profile ID
 * @param {Object} listing - Title, Price, Description, Image_URL, etc.
 * @param {Object} options - Categories, Condition, etc.
 */
async function executePosting(credentials, listing, options = {}) {
    const GL = new GoLogin({
        token: credentials.gologinToken,
        profile_id: credentials.profileId,
        extra_params: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--display=:99"]
    });

    let currentStep = "Initializing";
    let browser = null;
    let page = null;
    let screenshotPath = null;

    try {
        currentStep = "Launching Profile";
        const { status, wsUrl } = await GL.start().catch(e => { throw new Error("GoLogin Start Failed: " + e.message); });
        if (status !== "success") throw new Error("GoLogin Failed to start profile");

        currentStep = "Connecting Puppeteer";
        browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: null,
            protocolTimeout: 180000
        });
        page = await browser.newPage();

        currentStep = "Navigating to FB Marketplace";
        await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "networkidle2", timeout: 90000 });

        // Handle Login if needed
        const needsLogin = await page.evaluate(() => {
            return window.location.href.includes("login") || !!document.querySelector('input[name="email"]') || !!document.querySelector('#email');
        });

        if (needsLogin) {
            currentStep = "Logging in";
            if (!credentials.fbEmail || !credentials.fbPass) throw new Error("FB Login required but credentials missing");
            const emailSelector = (await page.$("#email")) ? "#email" : 'input[name="email"]';
            const passSelector = (await page.$("#pass")) ? "#pass" : 'input[name="pass"]';
            const btnSelector = (await page.$('button[name="login"]')) ? 'button[name="login"]' : 'div[role="button"][aria-label*="Log In"], button[type="submit"]';

            await page.type(emailSelector, credentials.fbEmail);
            await page.type(passSelector, credentials.fbPass);
            await page.click(btnSelector);
            await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }).catch(() => { });
            await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "networkidle2" });
        }

        currentStep = "Downloading Media";
        const tempDir = path.join(__dirname, "../temp");
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const imgPaths = [];
        const mainImg = await downloadFile(listing.Image_URL, `temp_img_${Date.now()}_0.png`, tempDir);
        if (mainImg) imgPaths.push(mainImg);
        // ... handle more images if present ...

        if (imgPaths.length === 0) throw new Error("No images available");

        currentStep = "Uploading Images";
        const imageInput = await page.$("input[type=\"file\"][accept*=\"image\"]");
        if (imageInput) {
            await imageInput.uploadFile(...imgPaths);
            await delay(8000);
        }

        // Handle Video if present
        if (listing.Video_URL) {
            currentStep = "Uploading Video";
            const videoPath = await downloadFile(listing.Video_URL, `temp_vid_${Date.now()}.mp4`, tempDir);
            let videoInput = await page.$("input[type=\"file\"][accept*=\"video\"]");
            if (videoInput && videoPath) {
                await videoInput.uploadFile(videoPath);
                await delay(15000);
            }
        }

        currentStep = "Filling Fields";
        const typeLabel = async (label, value) => {
            const clicked = await page.evaluate((label) => {
                const labels = Array.from(document.querySelectorAll("label"));
                for (const l of labels) {
                    if (l.innerText?.includes(label)) {
                        const i = l.querySelector("input, textarea");
                        if (i) { i.click(); i.focus(); return true; }
                    }
                }
                return false;
            }, label);
            if (clicked) {
                await page.keyboard.down("Control");
                await page.keyboard.press("A");
                await page.keyboard.up("Control");
                await page.keyboard.press("Backspace");
                await jitteryType(page, value);
            }
        };

        await typeLabel("Title", listing.ListingTitle || listing.title);
        await typeLabel("Price", (listing.Price || 49.99).toString());
        await typeLabel("Description", listing.ListingDescription || "Contact for info!");

        currentStep = "Selecting Category";
        const catInput = await page.$("input[aria-label=\"Category\"]");
        if (catInput) {
            await catInput.click();
            await jitteryType(page, options.category || "Property for Rent");
            await delay(3000);
            const firstOption = await page.$("div[role=\"listbox\"] div[role=\"option\"]");
            if (firstOption) await firstOption.click();
        }

        currentStep = "Setting Location";
        await page.evaluate(() => {
            const btn = document.querySelector("div[role=\"button\"][aria-label=\"Next\"]");
            if (btn) btn.click();
        });
        await delay(3000);
        const loc = (listing.Location || "Dallas, Texas").replace(", TX", ", Texas");
        await typeLabel("Location", loc);
        await delay(2000);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");

        currentStep = "Publishing";
        // Click Next twice if category/condition required more steps
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll("div[role='button']"));
            const next = btns.find(b => b.innerText?.includes("Next"));
            if (next) next.click();
        });
        await delay(3000);

        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll("div[role='button']"));
            const pub = btns.find(b => b.innerText?.includes("Publish"));
            if (pub) pub.click();
        });
        await delay(15000);

        const finalUrl = page.url();
        const success = !finalUrl.includes("/marketplace/create");

        if (GL) await GL.stop();
        return { success, finalUrl };

    } catch (error) {
        console.error(`[Engine] Failure: ${error.message}`);
        screenshotPath = path.join(__dirname, `../../logs/error_${Date.now()}.png`);
        if (page) await page.screenshot({ path: screenshotPath });
        if (GL) await GL.stop().catch(() => { });
        return { success: false, error: `${currentStep}: ${error.message}`, screenshotPath };
    }
}

module.exports = { executePosting };
