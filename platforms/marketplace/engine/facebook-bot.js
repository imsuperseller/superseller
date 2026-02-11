const GoLogin = require("gologin");
const puppeteer = require("puppeteer-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Load Configuration
const CONFIG_PATH = path.join(__dirname, "..", "config", "bot-config.json");
if (!fs.existsSync(CONFIG_PATH)) {
    // Fallback to local if running in legacy mode
    const FALLBACK_PATH = path.join(__dirname, "bot-config.json");
    if (fs.existsSync(FALLBACK_PATH)) {
        console.log("Using local fallback config.");
    } else {
        console.error("Critical Error: bot-config.json not found in config/ or local!");
        process.exit(1);
    }
}
const config = JSON.parse(fs.readFileSync(fs.existsSync(CONFIG_PATH) ? CONFIG_PATH : path.join(__dirname, "bot-config.json"), "utf8"));

// Shared Configuration
const GOLOGIN_TOKEN = config.shared.gologinToken;
const WAHA_API_KEY = config.shared.wahaApiKey;
const WAHA_URL = config.shared.wahaUrl;
const NOTIFICATION_TARGET = config.shared.notificationTarget;

const PRODUCTS = config.products;

// Stealth Helpers
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

async function jitteryType(page, text) {
    for (const char of text) {
        await page.keyboard.type(char, { delay: randomRange(50, 150) });
    }
}

async function downloadFile(url, filename) {
    if (!url) return null;

    // 1. Handle Local Files (VPS path)
    if (url.startsWith("/")) {
        if (fs.existsSync(url)) {
            console.log(`[Download] Using local file: ${url}`);
            return url;
        }
        console.warn(`[Download] Local file not found: ${url}`);
        return null;
    }

    // 2. Validate HTTP URL
    if (!url.startsWith("http")) {
        console.warn(`[Download] Skipping invalid URL: ${url}`);
        return null;
    }

    const filePath = path.join(__dirname, filename);
    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 30000
        });

        // Basic validation: Check if empty
        if (!response.data || response.data.length === 0) {
            console.error(`[Download] Empty response for ${url}`);
            return null;
        }

        fs.writeFileSync(filePath, response.data);

        // Verify file size on disk
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
            console.error(`[Download] File wrote 0 bytes for ${url}`);
            return null;
        }

        return filePath;
    } catch (e) {
        console.error(`Download error for ${url}:`, e.message);
        return null;
    }
}

async function sendWhatsApp(text, screenshotPath = null) {
    try {
        console.log(`[WA] Sending: ${text}`);
        if (screenshotPath && fs.existsSync(screenshotPath)) {
            const base64 = fs.readFileSync(screenshotPath, { encoding: "base64" });
            await axios.post(`${WAHA_URL}/api/sendImage`, {
                chatId: NOTIFICATION_TARGET,
                file: { mimetype: "image/png", data: base64, filename: path.basename(screenshotPath) },
                caption: text,
                session: "rensto-whatsapp"
            }, {
                headers: { "X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json" }
            });
        } else {
            await axios.post(`${WAHA_URL}/api/sendText`, {
                chatId: NOTIFICATION_TARGET,
                text: text,
                session: "rensto-whatsapp"
            }, {
                headers: { "X-Api-Key": WAHA_API_KEY, "Content-Type": "application/json" }
            });
        }
    } catch (error) {
        console.error("[WA] Error:", error.response?.data || error.message);
    }
}

async function postToFBMarketplace(product, listingData) {
    console.log(`[${product.name}] Starting Post: ${listingData.ListingTitle || listingData.title}`);

    // FIX: Pre-create profile fonts directory to prevent ENOENT
    const profilePath = path.join("/tmp", `gologin_profile_${product.profileId}`);
    const fontsPath = path.join(profilePath, "fonts");
    try {
        if (!fs.existsSync(fontsPath)) {
            fs.mkdirSync(fontsPath, { recursive: true });
            console.log(`[${product.name}] Created fonts directory: ${fontsPath}`);
        }
    } catch (e) {
        console.error(`[${product.name}] Failed to create fonts directory: ${e.message}`);
    }
    const GL = new GoLogin({
        token: GOLOGIN_TOKEN,
        profile_id: product.profileId,
        extra_params: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--display=:100"],
        uploadCookiesToServer: false,
        writeCookesToServer: false
    });

    let currentStep = "Initializing";

    try {
        currentStep = "Launching GoLogin";
        console.log(`[${product.name}] ${currentStep}...`);



        const { status, wsUrl } = await GL.start().catch(e => { throw new Error("GoLogin Start Failed: " + e.message); });
        if (status !== "success") throw new Error("GoLogin Failed to start profile");

        currentStep = "Connecting Puppeteer";
        console.log(`[${product.name}] ${currentStep}...`);
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: null,
            protocolTimeout: 180000
        });
        const page = await browser.newPage();



        // DEBUG: Check cookies
        const cookies = await page.cookies();
        console.log(`[${product.name}] Debug: Loaded ${cookies.length} cookies.`);
        const cUser = cookies.find(c => c.name === 'c_user');
        console.log(`[${product.name}] Debug: c_user cookie present: ${!!cUser}`);


        currentStep = "Navigating to Marketplace";
        console.log(`[${product.name}] ${currentStep} (Pre-flight)...`);

        // 1. Navigate to domain FIRST to establish context
        await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
        await page.goto("https://www.facebook.com", { waitUntil: "networkidle2", timeout: 60000 });

        // --- MANUAL COOKIE INJECTION (Added 2026-01-23) ---
        try {
            if (fs.existsSync('/opt/fb-marketplace-bot/cookies.json')) {
                console.log(`[${product.name}] Found manual cookies.json, injecting into active page...`);
                const cookiesRaw = fs.readFileSync('/opt/fb-marketplace-bot/cookies.json', 'utf8');
                const manualCookies = JSON.parse(cookiesRaw);

                const puppeteerCookies = manualCookies.map(c => {
                    return {
                        name: c.name,
                        value: c.value,
                        domain: c.domain,
                        path: c.path,
                        secure: c.secure,
                        httpOnly: c.httpOnly,
                        expires: c.expirationDate
                    };
                });

                await page.setCookie(...puppeteerCookies);

                // Force English locale cookie
                await page.setCookie({
                    name: 'locale',
                    value: 'en_US',
                    domain: '.facebook.com',
                    path: '/',
                    secure: true
                });

                console.log(`[${product.name}] Injected ${puppeteerCookies.length} manual cookies + locale.`);
            }
        } catch (e) {
            console.error(`[${product.name}] Failed to inject manual cookies:`, e);
        }
        // --------------------------------------------------

        // 2. Verification: Check if truly logged in
        console.log(`[${product.name}] Verifying session...`);
        await page.goto("https://www.facebook.com/me", { waitUntil: "networkidle2", timeout: 60000 });

        let needsLogin = false;
        if (page.url().includes("login") || await page.$("#email")) {
            needsLogin = true;
        }

        if (needsLogin) {
            console.log(`[${product.name}] Session verification failed. Attempting credential login...`);
            await page.goto("https://www.facebook.com/login", { waitUntil: "networkidle2" });
            const emailField = await page.waitForSelector("#email", { timeout: 10000 }).catch(() => null);
            if (!emailField) throw new Error("Could not find login fields even on login page.");

            if (!product.fbEmail) throw new Error("Facebook Login required but credentials missing");
            await page.type("#email", product.fbEmail);
            await page.type("#pass", product.fbPass);
            await page.click("button[name=\"login\"]");
            await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 10000 }).catch(() => null);
        } else {
            console.log(`[${product.name}] Session verified (Logged in as ${page.url()}).`);
        }

        // 3. Navigate to Marketplace
        console.log(`[${product.name}] Navigating to Marketplace create form...`);
        await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "networkidle2", timeout: 90000 });


        currentStep = "Downloading Media";
        console.log(`[${product.name}] ${currentStep}...`);
        const imgPaths = [];
        const mainImg = await downloadFile(listingData.Image_URL, `img_${product.id}_0.png`);
        if (mainImg) imgPaths.push(mainImg);
        if (listingData.Image_URL2) {
            const img2 = await downloadFile(listingData.Image_URL2, `img_${product.id}_1.png`);
            if (img2) imgPaths.push(img2);
        }
        if (listingData.Image_URL3) {
            const img3 = await downloadFile(listingData.Image_URL3, `img_${product.id}_2.png`);
            if (img3) imgPaths.push(img3);
        }

        if (imgPaths.length === 0) throw new Error("No images downloaded successfully (check URLs)");

        let videoPath = null;
        if (listingData.Video_URL) videoPath = await downloadFile(listingData.Video_URL, product.videoFilename || "video.mp4");

        currentStep = "Uploading Media";
        console.log(`[${product.name}] ${currentStep}...`);
        const imageInput = await page.$("input[type=\"file\"][accept*=\"image\"]");
        if (imageInput) {
            await imageInput.uploadFile(...imgPaths);
            await delay(10000);
        }

        if (videoPath) {
            const videoInput = await page.$("input[type=\"file\"][accept*=\"video\"]");
            if (videoInput) {
                await videoInput.uploadFile(videoPath);
                await delay(10000);
            }
        }

        currentStep = "Filling Form Labels";
        const typeField = async (labels, value, isTextArea = false) => {
            const labelArray = Array.isArray(labels) ? labels : [labels];
            const type = isTextArea ? "textarea" : "input";
            const clicked = await page.evaluate((labelArray, type) => {
                const domLabels = Array.from(document.querySelectorAll("label"));
                for (const l of domLabels) {
                    const text = l.innerText?.toLowerCase() || "";
                    if (labelArray.some(lab => text.includes(lab.toLowerCase()))) {
                        const f = l.querySelector(type);
                        if (f) { f.click(); f.focus(); f.value = ""; return true; }
                    }
                }
                return false;
            }, labelArray, type);

            if (clicked) {
                await page.keyboard.down("Control");
                await page.keyboard.press("A");
                await page.keyboard.up("Control");
                await page.keyboard.press("Backspace");
                await jitteryType(page, value);
                return true;
            }
            return false;
        };

        currentStep = "Filling Title";
        console.log(`[${product.name}] ${currentStep}...`);
        await typeField(["Title", "Otsikko"], listingData.ListingTitle || listingData.title);

        currentStep = "Filling Price";
        console.log(`[${product.name}] ${currentStep}...`);
        await typeField(["Price", "Hinta"], (listingData.Price || listingData.ListingPrice || "").toString());

        currentStep = "Selecting Category";
        console.log(`[${product.name}] ${currentStep}...`);
        const catInput = await page.$("input[aria-label=\"Category\"], input[aria-label=\"Luokka\"]");
        if (catInput) {
            await catInput.click();
            await jitteryType(page, product.category);
            await delay(randomRange(2000, 4000));
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
        } else {
            console.log(`[${product.name}] Warning: Could not find Category input.`);
        }

        currentStep = "Setting Condition";
        console.log(`[${product.name}] ${currentStep}...`);
        await page.evaluate(() => {
            const cb = document.querySelector("label[role=\"combobox\"]");
            if (cb?.innerText.includes("Condition") || cb?.innerText.includes("Kunto")) cb.click();
        }).catch(() => { });
        await delay(1000);
        await page.evaluate(() => {
            const opts = document.querySelectorAll("div[role=\"option\"]");
            for (const o of opts) {
                const t = o.innerText;
                if (t.includes("New") || t.includes("Uusi")) o.click();
            }
        }).catch(() => { });

        currentStep = "Filling Description";
        console.log(`[${product.name}] ${currentStep}...`);
        let desc = listingData.ListingDescription || "Contact for details!";
        await typeField(["Description", "Kuvaus"], desc, true);

        currentStep = "Setting Location";
        console.log(`[${product.name}] ${currentStep}...`);
        await page.evaluate(() => {
            const btn = document.querySelector("div[role=\"button\"][aria-label=\"Next\"], div[role=\"button\"][aria-label=\"Seuraava\"]");
            if (btn) btn.click();
        }).catch(() => { });
        await delay(3000);

        let loc = listingData.Location || "Dallas, Texas";
        loc = loc.replace(", TX", ", Texas");
        await page.evaluate(() => {
            const labels = document.querySelectorAll("label");
            for (const l of labels) {
                const t = l.innerText?.toLowerCase() || "";
                if (t.includes("location") || t.includes("sijainti")) {
                    const input = l.querySelector("input");
                    if (input) { input.click(); input.focus(); }
                }
            }
        }).catch(() => { });
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
        await page.keyboard.type(loc, { delay: 100 });
        await delay(3000);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await delay(2000);

        await page.evaluate(() => {
            const labels = Array.from(document.querySelectorAll("label"));
            const pickup = labels.find(l => l.innerText?.toLowerCase().includes("local pickup"));
            if (pickup) pickup.click();
        }).catch(() => { });
        await delay(2000);

        currentStep = "Publishing";
        // Click Next twice if category/condition required more steps
        await page.evaluate(() => {
            const btn = document.querySelector("div[role=\"button\"][aria-label=\"Next\"]");
            if (btn) btn.click();
        }).catch(() => { });
        await delay(3000);

        // ROBUST PUBLISH CLICKER START
        console.log(`[${product.name}] Attempting to click Publish/Post...`);
        const clickedPublish = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll("div[role='button'], button, span"));

            // Try 1: Exact Text Match (Multi-language)
            let pub = btns.find(b => {
                const t = b.innerText?.trim().toLowerCase();
                return t === 'publish' || t === 'post' || t === 'julkaise' || t === 'lähetä';
            });

            // Try 2: Aria Label
            if (!pub) {
                pub = document.querySelector('[aria-label="Publish"], [aria-label="Post"], [aria-label="Julkaise"], [aria-label="Lähetä"]');
            }

            if (pub) {
                pub.click();
                return true;
            }
            return false;
        });

        if (!clickedPublish) {
            console.log(`[${product.name}] Warning: Could not find 'Publish' button with standard selectors.`);
        } else {
            console.log(`[${product.name}] Clean click on Publish button.`);
        }
        // ROBUST PUBLISH CLICKER END

        await delay(30000); // Increased wait time to 30s

        const finalUrl = page.url();
        const success = !finalUrl.includes("/marketplace/create") && !finalUrl.includes("/login");

        if (!success) {
            // Take debug screenshot on failure even if no crash
            const debugPath = path.join(__dirname, `debug_fail_${Date.now()}.png`);
            await page.screenshot({ path: debugPath });
            console.error(`[${product.name}] Logic Failure: URL still at ${finalUrl}. Screenshot saved to ${debugPath}`);
            await GL.stop();
            return { success: false, error: `Publish click failed or timed out. Debug: ${path.basename(debugPath)}` };
        }

        await GL.stop();
        return { success, finalUrl };

    } catch (error) {
        const errorMsg = error.message || String(error);
        const detailedError = `Failed at [${currentStep}]: ${errorMsg}`;
        console.error(`[${product.name}] Error:`, detailedError);

        try {
            const errorPath = path.join(__dirname, `error_${Date.now()}.png`);
            if (page && !page.isClosed()) await page.screenshot({ path: errorPath });
            console.log(`[${product.name}] Error screenshot saved: ${errorPath}`);
        } catch (e) { }

        await GL.stop().catch(() => { });
        return { success: false, error: detailedError };
    }
}

const LOCK_FILE = "/tmp/master-bot.lock";

async function main() {
    if (fs.existsSync(LOCK_FILE)) {
        const pid = fs.readFileSync(LOCK_FILE, "utf8");
        try {
            process.kill(parseInt(pid), 0);
            console.error(`Bot already running with PID ${pid}. Exiting.`);
            process.exit(1);
        } catch (e) {
            console.log("Stale lock file found. Removing.");
            fs.unlinkSync(LOCK_FILE);
        }
    }
    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    process.on("exit", () => { try { fs.unlinkSync(LOCK_FILE); } catch (e) { } });
    process.on("SIGINT", () => process.exit());
    process.on("SIGTERM", () => process.exit());

    console.log("Master Bot Started - Multi-Product Mode (VPS) - v2026.1.22 Patch");
    while (true) {
        for (const product of PRODUCTS) {
            try {
                console.log(`[${product.name}] Checking for jobs...`);
                const response = await axios.get(product.getJobsUrl, {
                    timeout: 15000,
                    validateStatus: (status) => status < 600
                });

                let listing = null;
                if (Array.isArray(response.data) && response.data.length > 0) {
                    listing = response.data[0];
                } else if (response.data && (response.data.ListingTitle || response.data.Image_URL)) {
                    listing = response.data;
                } else if (response.status === 500 || response.data?.message?.includes('No item') || response.data?.message?.includes('found')) {
                    continue;
                } else if (response.data?.status === "nothing-found") {
                    continue;
                }

                if (listing) {
                    const result = await postToFBMarketplace(product, listing);
                    await axios.post(product.updateStatusUrl, {
                        imageUrl: listing.Image_URL,
                        status: result.success ? "Posted" : "Failed",
                        error: result.error || "Unknown Failure"
                    }).catch(e => console.error(`[${product.name}] Status update error:`, e.message));

                    if (result.success) {
                        console.log(`[${product.name}] Successfully posted!`);
                        await sendWhatsApp(`✅ [${product.name}] Successfully posted: ${listing.ListingTitle || listing.title}`);
                        const wait = randomRange(600000, 1200000); // 10-20 min break
                        console.log(`Cooling down for ${Math.round(wait / 60000)}m...`);
                        await delay(wait);
                    } else {
                        console.log(`[${product.name}] Post failed: ${result.error}.`);
                        await sendWhatsApp(`❌ [${product.name}] Post failed: ${result.error}`);
                        await delay(60000);
                    }
                }
            } catch (error) {
                console.error(`[${product.name}] Loop Error:`, error.message);
                await delay(30000);
            }
        }
        const cycleWait = randomRange(120000, 300000);
        console.log(`Cycle complete. Next check in ${Math.round(cycleWait / 1000)}s...`);
        await delay(cycleWait);
    }
}

main();
