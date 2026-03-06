const axios = require('axios');
const puppeteer = require('puppeteer-core');
const { GoLogin } = require("gologin");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load configuration
const CONFIG = JSON.parse(fs.readFileSync('./bot-config.json', 'utf8'));

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const jitteryType = async (page, text, delayRange = [50, 150]) => {
    for (const char of text) {
        await page.keyboard.type(char);
        await delay(randomRange(...delayRange));
    }
};

// Screenshot helper — saves to /opt/fb-marketplace-bot/screenshots/
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const takeScreenshot = async (page, label) => {
    try {
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const filepath = path.join(screenshotDir, `${ts}_${label}.png`);
        await page.screenshot({ path: filepath, fullPage: true });
        console.log(`    Screenshot: ${filepath}`);
        return filepath;
    } catch (e) {
        console.warn(`    Screenshot failed: ${e.message}`);
        return null;
    }
};

// Enhanced form filling function from production server
const typeField = async (page, label, value, isTextArea = false) => {
    const type = isTextArea ? "textarea" : "input";
    console.log(`    [${label}] Filling ${type} field with: ${value}`);

    const clicked = await page.evaluate((label, type) => {
        const labels = Array.from(document.querySelectorAll("label"));
        for (const l of labels) {
            if (l.innerText?.includes(label)) {
                const f = l.querySelector(type);
                if (f) {
                    f.click();
                    f.focus();
                    f.value = "";
                    return true;
                }
            }
        }
        return false;
    }, label, type);

    if (clicked) {
        await page.keyboard.down("Control");
        await page.keyboard.press("A");
        await page.keyboard.up("Control");
        await page.keyboard.press("Backspace");
        await jitteryType(page, value);
        console.log(`    Filled: ${label}`);
        await delay(randomRange(1000, 2000));
        return true;
    } else {
        console.log(`    Failed to find field: ${label}`);
        return false;
    }
};

/**
 * Robust "Next" button clicker with multiple fallback selectors and verification.
 * Returns true if the button was found and clicked AND a DOM change was detected.
 */
const clickNextButton = async (page, stepName) => {
    console.log(`    [${stepName}] Attempting to click Next button...`);

    // Capture DOM state before click for change detection
    const beforeHTML = await page.evaluate(() => document.body.innerHTML.length).catch(() => 0);
    const beforeUrl = page.url();

    // Strategy 1: aria-label="Next" with role="button"
    let clicked = await page.evaluate(() => {
        const btn = document.querySelector('div[role="button"][aria-label="Next"]');
        if (btn) { btn.click(); return 'aria-label-div'; }
        return null;
    }).catch(() => null);

    // Strategy 2: aria-label="Next" on any element
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const btn = document.querySelector('[aria-label="Next"]');
            if (btn) { btn.click(); return 'aria-label-any'; }
            return null;
        }).catch(() => null);
    }

    // Strategy 3: Button/div containing "Next" text (exact match)
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const candidates = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
            for (const el of candidates) {
                const text = el.innerText?.trim();
                if (text === 'Next' || text === 'Seuraava' || text === 'הבא') {
                    el.click();
                    return 'text-exact';
                }
            }
            return null;
        }).catch(() => null);
    }

    // Strategy 4: Button containing "Next" text (partial match, case-insensitive)
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const candidates = Array.from(document.querySelectorAll('div[role="button"], button, span[role="button"]'));
            for (const el of candidates) {
                const text = el.innerText?.trim().toLowerCase();
                if (text && (text.includes('next') || text.includes('continue'))) {
                    el.click();
                    return 'text-partial';
                }
            }
            return null;
        }).catch(() => null);
    }

    // Strategy 5: XPath-based "Next" search
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const xr = document.evaluate(
                '//div[@role="button"][contains(., "Next")] | //span[@role="button"][contains(., "Next")]',
                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
            );
            const node = xr.singleNodeValue;
            if (node) { node.click(); return 'xpath'; }
            return null;
        }).catch(() => null);
    }

    if (!clicked) {
        console.log(`    [${stepName}] No "Next" button found with any strategy`);
        await takeScreenshot(page, `${stepName}_no_next_button`);
        return false;
    }

    console.log(`    [${stepName}] Clicked via: ${clicked}`);

    // Wait for DOM to settle
    await delay(3000);

    // Verify something changed
    const afterHTML = await page.evaluate(() => document.body.innerHTML.length).catch(() => 0);
    const afterUrl = page.url();
    const domChanged = Math.abs(afterHTML - beforeHTML) > 100;
    const urlChanged = afterUrl !== beforeUrl;

    if (domChanged || urlChanged) {
        console.log(`    [${stepName}] Transition confirmed (DOM delta: ${afterHTML - beforeHTML}, URL changed: ${urlChanged})`);
    } else {
        console.log(`    [${stepName}] Click registered but no DOM change detected`);
        await takeScreenshot(page, `${stepName}_no_change`);
    }

    return true;
};

/**
 * Robust "Publish" button clicker with multiple strategies.
 */
const clickPublishButton = async (page) => {
    console.log(`    Attempting to click Publish button...`);

    // Strategy 1: Exact text match (multi-language)
    let clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("div[role='button'], button, span[role='button'], span"));
        const publishTexts = ['publish', 'post', 'list item', 'julkaise', 'lähetä', 'פרסם', 'פרסום'];
        const pub = btns.find(b => {
            const t = b.innerText?.trim().toLowerCase();
            return publishTexts.includes(t);
        });
        if (pub) { pub.click(); return 'text-exact'; }
        return null;
    }).catch(() => null);

    // Strategy 2: Aria label
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const selectors = [
                '[aria-label="Publish"]', '[aria-label="Post"]', '[aria-label="List Item"]',
                '[aria-label="Julkaise"]', '[aria-label="פרסם"]'
            ];
            for (const sel of selectors) {
                const el = document.querySelector(sel);
                if (el) { el.click(); return 'aria-label'; }
            }
            return null;
        }).catch(() => null);
    }

    // Strategy 3: Partial text match (contains "publish" or "post" in a button)
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll("div[role='button'], button"));
            const pub = btns.find(b => {
                const t = b.innerText?.trim().toLowerCase();
                return t && (t.includes('publish') || t === 'post');
            });
            if (pub) { pub.click(); return 'text-partial'; }
            return null;
        }).catch(() => null);
    }

    // Strategy 4: XPath
    if (!clicked) {
        clicked = await page.evaluate(() => {
            const xr = document.evaluate(
                '//div[@role="button"][contains(., "Publish")] | //div[@role="button"][contains(., "Post")] | //div[@role="button"][contains(., "List")]',
                document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
            );
            const node = xr.singleNodeValue;
            if (node) { node.click(); return 'xpath'; }
            return null;
        }).catch(() => null);
    }

    // Strategy 5: Keyboard fallback (Tab + Enter)
    if (!clicked) {
        console.log(`    No Publish button found — trying keyboard fallback (Tab+Enter)`);
        await page.keyboard.press('Tab');
        await delay(500);
        await page.keyboard.press('Enter');
        clicked = 'keyboard-fallback';
    }

    console.log(`    Publish click via: ${clicked || 'NONE'}`);
    return !!clicked;
};

// WhatsApp notification function
async function sendWhatsApp(text, productName) {
    try {
        await axios.post(`${CONFIG.shared.wahaUrl}/api/sendText`, {
            session: 'default',
            chatId: CONFIG.shared.notificationTarget,
            text: `[${productName}] ${text}`
        }, {
            headers: { 'X-API-KEY': CONFIG.shared.wahaApiKey },
            timeout: 5000
        });

        console.log(`[${productName}] WhatsApp sent: ${text}`);
    } catch (error) {
        console.warn(`[${productName}] WhatsApp failed: ${error.message}`);
    }
}

class ManualFacebookBot {
    constructor(productConfig) {
        this.config = productConfig;
        this.persistentDataDir = path.join(__dirname, 'user-data', this.config.id);

        if (!fs.existsSync(this.persistentDataDir)) {
            fs.mkdirSync(this.persistentDataDir, { recursive: true });
        }
    }

    async launchBrowser() {
        console.log(`[${this.config.name}] Starting GoLogin session...`);

        if (!this.config.profileId) {
            throw new Error(`No profileId configured for ${this.config.name}`);
        }

        const profilePath = path.join("/tmp", `gologin_profile_${this.config.profileId}`);
        const fontsPath = path.join(profilePath, "fonts");
        try {
            if (!fs.existsSync(fontsPath)) {
                fs.mkdirSync(fontsPath, { recursive: true });
                console.log(`[${this.config.name}] Created fonts directory: ${fontsPath}`);
            }
        } catch (e) {
            console.log(`[${this.config.name}] Fonts dir note: ${e.message}`);
        }

        const maxAttempts = 3;
        const delayBetweenAttempts = 15000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                console.log(`[${this.config.name}] GoLogin attempt ${attempt}/${maxAttempts}...`);

                const GL = new GoLogin({
                    token: CONFIG.shared.gologinToken,
                    profile_id: this.config.profileId,
                    extra_params: [
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                        "--disable-gpu",
                        "--display=:100",
                        "--password-store=basic",
                    ],
                    uploadCookiesToServer: false,
                    writeCookesToServer: false,
                });

                const { status, wsUrl } = await GL.start();

                if (status !== 'success') {
                    throw new Error(`GoLogin start failed with status: ${status}`);
                }

                const browser = await puppeteer.connect({
                    browserWSEndpoint: wsUrl,
                    defaultViewport: null,
                    protocolTimeout: 180000,
                });

                console.log(`[${this.config.name}] Connected to GoLogin browser (attempt ${attempt})`);
                this.gologinInstance = GL;
                this.profileId = this.config.profileId;
                return browser;
            } catch (error) {
                console.error(`[${this.config.name}] GoLogin attempt ${attempt} failed: ${error.message}`);
                if (attempt < maxAttempts) {
                    console.log(`[${this.config.name}] Retrying in ${delayBetweenAttempts / 1000}s...`);
                    await delay(delayBetweenAttempts);
                } else {
                    throw new Error(`GoLogin SDK failed after ${maxAttempts} attempts: ${error.message}`);
                }
            }
        }

        throw new Error(`GoLogin SDK failed: max attempts reached`);
    }

    async cleanup() {
        // Working V13 ALWAYS used stopLocal — never uploaded to S3.
        // This prevents corrupting the cloud profile with stale/bad session data.
        if (this.gologinInstance) {
            try {
                console.log(`[${this.config.name}] Cleaning up GoLogin (stopLocal, no S3 upload)...`);
                await this.gologinInstance.stopLocal({ posting: false });
            } catch (error) {
                console.warn(`[${this.config.name}] Cleanup warning: ${error.message}`);
                try { await this.gologinInstance.stopLocal({ posting: false }); } catch (e2) { }
            }
        }
    }

    // Save browser cookies back to GoLogin API for persistence across sessions
    async saveCookiesToAPI(page) {
        if (!this.gologinInstance || !page) return false;
        try {
            const cookies = await page.cookies('https://www.facebook.com');
            const fbCookies = cookies.filter(c => c.domain && c.domain.includes('facebook'));
            const cUser = fbCookies.find(c => c.name === 'c_user');
            const xs = fbCookies.find(c => c.name === 'xs');

            if (!cUser || !xs) {
                console.log(`[${this.config.name}] Skip cookie save - no valid session`);
                return false;
            }

            const formatted = fbCookies.map(c => ({
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path || '/',
                httpOnly: c.httpOnly || false,
                secure: c.secure || true,
                sameSite: c.sameSite === 'None' ? 'no_restriction' : (c.sameSite === 'Lax' ? 'lax' : 'unspecified'),
                expirationDate: c.expires > 0 ? c.expires : undefined,
            }));

            await this.gologinInstance.postCookies(this.config.profileId, formatted);
            console.log(`[${this.config.name}] Saved ${formatted.length} FB cookies to GoLogin API`);
            return true;
        } catch (e) {
            console.log(`[${this.config.name}] Cookie save failed: ${e.message}`);
            return false;
        }
    }

    // Per-profile cookie file path
    get cookieFilePath() {
        return path.join(__dirname, `cookies_${this.config.id}.json`);
    }

    // Backup: save cookies to local file (survives GoLogin API outages). Saves any FB cookies when logged in.
    // UAD: Never overwrite an existing valid session (c_user) with cookies that lack c_user — preserve one-time manual login.
    async saveCookiesToFile(page) {
        try {
            const cookies = await page.cookies('https://www.facebook.com');
            const fbCookies = cookies.filter(c => c.domain && c.domain.includes('facebook'));
            const hasCUser = fbCookies.some(c => c.name === 'c_user');
            if (fbCookies.length === 0) return false;

            const cookiePath = this.cookieFilePath;
            if (this.config.id === 'uad' && fs.existsSync(cookiePath)) {
                try {
                    const existing = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
                    const existingHasCUser = Array.isArray(existing) && existing.some(c => c.name === 'c_user');
                    if (existingHasCUser && !hasCUser) {
                        console.log(`[${this.config.name}] Keeping existing UAD session (not overwriting with session-less cookies)`);
                        return true;
                    }
                } catch (_) {}
            }

            const formatted = fbCookies.map(c => ({
                name: c.name, value: c.value, domain: c.domain, path: c.path || '/',
                secure: c.secure, httpOnly: c.httpOnly,
                sameSite: c.sameSite === 'None' ? 'no_restriction' : (c.sameSite || 'unspecified'),
                expirationDate: c.expires > 0 ? c.expires : undefined,
            }));
            if (this.config.id === 'uad' && fs.existsSync(cookiePath)) {
                try {
                    const existing = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
                    if (Array.isArray(existing) && existing.some(c => c.name === 'c_user')) {
                        const bak = cookiePath.replace(/\.json$/, '.json.bak');
                        fs.writeFileSync(bak, fs.readFileSync(cookiePath));
                        console.log(`[${this.config.name}] Backed up existing session to ${path.basename(bak)}`);
                    }
                } catch (_) {}
            }
            fs.writeFileSync(cookiePath, JSON.stringify(formatted, null, 2));
            console.log(`[${this.config.name}] Saved ${formatted.length} cookies to ${path.basename(cookiePath)}`);
            return true;
        } catch (e) {
            console.log(`[${this.config.name}] Cookie file save failed: ${e.message}`);
            return false;
        }
    }

    async checkFacebookLogin(page) {
        try {
            // Verification via /me redirect — matches working V13 approach.
            // If logged in, /me redirects to profile. If not, redirects to /login.
            console.log(`[${this.config.name}] Verifying session via /me...`);
            await page.goto("https://www.facebook.com/me", { waitUntil: "networkidle2", timeout: 60000 });

            const url = page.url();
            // If we end up on the exact root homepage, it means /me redirected us, which happens when NOT logged in.
            // A logged in user would be redirected to their profile (e.g. /username or /profile.php).
            const isRootHome = url === "https://www.facebook.com/" || url === "https://www.facebook.com";
            const hasEmail = await page.$('input[name="email"], #email').catch(() => null);
            const needsLogin = url.includes("login") || isRootHome || !!hasEmail;

            if (needsLogin) {
                console.log(`[${this.config.name}] Not logged in (redirected to ${url})`);
                return false;
            }

            console.log(`[${this.config.name}] Session verified — logged in as ${url}`);
            return true;

        } catch (error) {
            console.error(`[${this.config.name}] Login check error:`, error.message);
            return false;
        }
    }

    async attemptDirectFacebookLogin(page) {
        if (!this.config.fbEmail || !this.config.fbPass) {
            console.log(`\n[${this.config.name}] No Facebook credentials configured`);
            throw new Error("Facebook credentials required for direct login");
        }

        const tryLoginAt = async (url, label) => {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
            await delay(10000);
            for (const sel of ['input[name="email"]', 'input[name="pass"]', '#email', '#pass', 'input[type="password"]', 'input[type="text"]']) {
                try {
                    await page.waitForSelector(sel, { timeout: 5000 });
                    break;
                } catch (_) {}
            }
            await delay(3000);

            // Strategy A: fill via page.evaluate (works when selectors are in shadow DOM or React)
            const filledByEval = await page.evaluate((email, pass) => {
                const e = document.querySelector('input[name="email"]') || document.querySelector('#email') || document.querySelector('input[type="email"]');
                const p = document.querySelector('input[name="pass"]') || document.querySelector('#pass') || document.querySelector('input[type="password"]');
                if (!e || !p) {
                    const inputs = Array.from(document.querySelectorAll('input'));
                    const passInput = inputs.find(i => i.type === 'password');
                    const textInput = inputs.find(i => i.type !== 'password' && i.type !== 'hidden');
                    if (!passInput || !textInput) return 'no_inputs';
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                    setter.call(textInput, email);
                    textInput.dispatchEvent(new Event('input', { bubbles: true }));
                    setter.call(passInput, pass);
                    passInput.dispatchEvent(new Event('input', { bubbles: true }));
                    const btn = document.querySelector('button[name="login"]') || document.querySelector('input[type="submit"]')
                        || Array.from(document.querySelectorAll('button, [role="button"]')).find(b => /log in|login/i.test((b.textContent || '').trim()));
                    if (btn) { btn.click(); return 'submitted'; }
                    passInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                    return 'submitted';
                }
                const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                setter.call(e, email);
                e.dispatchEvent(new Event('input', { bubbles: true }));
                setter.call(p, pass);
                p.dispatchEvent(new Event('input', { bubbles: true }));
                const btn = document.querySelector('button[name="login"]') || document.querySelector('input[type="submit"]');
                if (btn) { btn.click(); return 'submitted'; }
                p.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }));
                return 'submitted';
            }, this.config.fbEmail, this.config.fbPass).catch(() => null);

            if (filledByEval === 'submitted') {
                console.log(`[${this.config.name}] ${label}: form filled via evaluate, submitted`);
                await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 25000 }).catch(() => null);
                await delay(3000);
                return true;
            }
            // Strategy B: Puppeteer selectors when evaluate didn't find form
            const emailSelectors = ['#email', 'input[name="email"]', 'input[type="email"]', 'input[type="text"]'];
            const passSelectors = ['#pass', 'input[name="pass"]', 'input[type="password"]'];
            let emailSel = null;
            let passSel = null;
            for (const sel of emailSelectors) {
                const el = await page.$(sel).catch(() => null);
                if (el) { emailSel = sel; await el.dispose?.(); break; }
            }
            for (const sel of passSelectors) {
                const el = await page.$(sel).catch(() => null);
                if (el) { passSel = sel; await el.dispose?.(); break; }
            }
            if (!emailSel || !passSel) return false;
            console.log(`[${this.config.name}] ${label}: typing into selectors`);
            await page.type(emailSel, this.config.fbEmail, { delay: 50 });
            await page.type(passSel, this.config.fbPass, { delay: 50 });
            await page.keyboard.press('Enter');
            await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 20000 }).catch(() => null);
            await delay(3000);
            return true;
        };

        try {
            const loginUrls = [
                ['https://www.facebook.com/', 'www_root'],
                ['https://m.facebook.com/', 'm_root'],
                ['https://m.facebook.com/login', 'm.facebook'],
                ['https://www.facebook.com/login', 'www'],
                ['https://l.facebook.com/login', 'l.facebook'],
            ];
            let didSubmit = false;
            for (const [url, label] of loginUrls) {
                try {
                    console.log(`[${this.config.name}] Trying login at ${label}...`);
                    didSubmit = await tryLoginAt(url, label);
                    if (didSubmit) break;
                } catch (e) {
                    if (e.message && (e.message.includes('detached') || e.message.includes('Session closed'))) {
                        console.log(`[${this.config.name}] ${label}: page/frame changed, trying next URL`);
                    } else {
                        throw e;
                    }
                }
            }
            if (!didSubmit) {
                console.log(`[${this.config.name}] Login form not found on any Facebook URL`);
                return false;
            }

            await takeScreenshot(page, "login_after_submit");

            const currentUrl = page.url();
            console.log(`[${this.config.name}] Post-login URL: ${currentUrl}`);

            if (currentUrl.includes("auth_platform") || currentUrl.includes("checkpoint") || currentUrl.includes("security")) {
                console.log(`[${this.config.name}] 2FA detected — waiting for approval...`);
                await sendWhatsApp(`Approve the Facebook login on your phone NOW! Waiting 3 min...`, this.config.name);
                for (let i = 0; i < 12; i++) {
                    await delay(15000);
                    const nowUrl = page.url();
                    if (!nowUrl.includes("auth_platform") && !nowUrl.includes("checkpoint") && !nowUrl.includes("security") && !nowUrl.includes("/login")) {
                        console.log(`[${this.config.name}] 2FA approved!`);
                        break;
                    }
                }
            }

            const loginSuccess = await this.checkFacebookLogin(page);
            if (loginSuccess) {
                console.log(`[${this.config.name}] Direct Facebook login successful`);
                return true;
            }
            console.log(`[${this.config.name}] Direct Facebook login failed`);
            return false;
        } catch (error) {
            console.error(`[${this.config.name}] Direct login error:`, error.message);
            return false;
        }
    }

    async getJob() {
        try {
            const response = await axios.get(this.config.getJobsUrl);
            if (response.data && (response.data.jobId || response.data.id)) {
                console.log(`[${this.config.name}] Got job: ${response.data.title}`);
                console.log(`[${this.config.name}] Job data:`, JSON.stringify(response.data, null, 2));
                return response.data;
            }
            console.log(`[${this.config.name}] No jobs available`);
            return null;
        } catch (error) {
            console.log(`[${this.config.name}] Failed to get job:`, error.message);
            return null;
        }
    }

    async downloadFile(url, filename) {
        if (!url) return null;

        try {
            console.log(`[${this.config.name}] Downloading: ${url}`);

            const response = await axios({
                url: url,
                method: 'GET',
                responseType: 'stream',
                timeout: 30000
            });

            const tempPath = path.join(__dirname, 'temp', filename);
            const tempDir = path.dirname(tempPath);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`[${this.config.name}] Downloaded to: ${tempPath}`);
                    resolve(tempPath);
                });
                writer.on('error', (error) => {
                    console.error(`[${this.config.name}] Download error: ${error.message}`);
                    reject(error);
                });
            });
        } catch (error) {
            console.error(`[${this.config.name}] Download failed ${url}:`, error.message);
            return null;
        }
    }

    async postToMarketplace(page, job) {
        try {
            // Navigate to marketplace create; wait for form (Facebook can load slowly)
            const marketplaceUrl = "https://www.facebook.com/marketplace/create/item";
            for (let navAttempt = 1; navAttempt <= 2; navAttempt++) {
                console.log(`[${this.config.name}] Navigating to Marketplace create form (attempt ${navAttempt}/2)...`);
                await page.goto(marketplaceUrl, {
                    waitUntil: "domcontentloaded",
                    timeout: 60000,
                });
                await delay(3000);

                if (page.url().includes("login")) {
                    throw new Error("Redirected to login - session expired");
                }

                // Handle "Item for sale" picker if shown
                const fileInputFirst = await page.$('input[type="file"]');
                if (!fileInputFirst) {
                    await page.evaluate(() => {
                        const links = document.querySelectorAll('a, div[role="button"]');
                        for (const l of links) {
                            if (l.textContent?.includes('Item for sale') || l.textContent?.includes('Item for Sale')) {
                                l.click(); return true;
                            }
                        }
                        return false;
                    }).catch(() => false);
                    await delay(5000);
                }

                // Wait for file input (form ready) up to 30s
                try {
                    await page.waitForSelector('input[type="file"]', { timeout: 30000 });
                    console.log(`[${this.config.name}] Marketplace form loaded`);
                    break;
                } catch (e) {
                    if (navAttempt === 2) throw new Error("Marketplace form failed to load after 2 attempts");
                    console.log(`[${this.config.name}] Form not ready, retrying navigation...`);
                    await delay(5000);
                }
            }

            // ═══════════ STEP 1: Download & upload images ═══════════
            console.log(`[${this.config.name}] Processing media...`);
            let imgPaths = [];
            const imageUrls = [
                job.imageUrl || job.imageurl || job.image_url,
                job.imageUrl2 || job.imageurl2 || job.image_url2,
                job.imageUrl3 || job.imageurl3 || job.image_url3,
            ].filter(Boolean);

            for (let i = 0; i < imageUrls.length; i++) {
                const ext = imageUrls[i].split('.').pop().split('?')[0] || 'jpg';
                const imgPath = await this.downloadFile(imageUrls[i], `img_${job.id}_${i}.${ext}`);
                if (imgPath) imgPaths.push(imgPath);
            }
            if (imgPaths.length === 0) throw new Error("No images downloaded");

            // Optimize images (resize for proxy reliability)
            const optimizedPaths = [];
            for (const origPath of imgPaths) {
                const optPath = origPath.replace(/\.\w+$/, '_opt.jpg');
                try {
                    execSync(`convert "${origPath}" -resize 1200x1200\\> -quality 85 -strip "${optPath}"`, { timeout: 15000 });
                    optimizedPaths.push(optPath);
                } catch {
                    optimizedPaths.push(origPath);
                }
            }
            imgPaths = optimizedPaths;

            // Upload images (simple uploadFile — matches working V13)
            const imageInput = await page.$('input[type="file"][accept*="image"]');
            if (imageInput) {
                await imageInput.uploadFile(...imgPaths);
                console.log(`[${this.config.name}] Uploaded ${imgPaths.length} images, waiting for processing...`);
                await delay(15000); // longer wait for image processing
            }

            // Upload video if available
            const videoUrl = job.videoUrl || job.videourl || job.video_url;
            if (videoUrl) {
                const videoPath = await this.downloadFile(videoUrl, this.config.videoFilename || 'video.mp4');
                if (videoPath) {
                    const videoInput = await page.$('input[type="file"][accept*="video"]');
                    if (videoInput) {
                        await videoInput.uploadFile(videoPath);
                        console.log(`[${this.config.name}] Video uploaded`);
                        await delay(10000);
                    }
                }
            }

            await takeScreenshot(page, '02_media_uploaded');

            // ═══════════ STEP 2: Fill form fields (matches V13) ═══════════
            console.log(`[${this.config.name}] Filling form fields...`);
            await typeField(page, "Title", job.title || job.listing_title || "Item for Sale");
            await typeField(page, "Price", (job.price || job.listing_price || "100").toString());

            // Category — use exact category name from config (must match FB dropdown)
            const category = this.config.category || "Miscellaneous";
            const catInput = await page.$('input[aria-label="Category"]');
            if (catInput) {
                await catInput.click();
                await delay(300);
                await jitteryType(page, category);
                await delay(3000); // wait for dropdown to appear
                await page.keyboard.press("ArrowDown");
                await delay(500);
                await page.keyboard.press("Enter");
                await delay(1000);
                // Verify category was selected
                const catValue = await page.evaluate(() => {
                    const inp = document.querySelector('input[aria-label="Category"]');
                    return inp?.value;
                });
                console.log(`[${this.config.name}] Category: searched "${category}", selected "${catValue}"`);
            }

            // Condition
            await page.evaluate(() => {
                const labels = document.querySelectorAll("label");
                for (const l of labels) {
                    if (l.innerText?.includes("Condition")) {
                        const cb = l.querySelector('[role="combobox"]') || l;
                        cb.click(); return;
                    }
                }
                const cb = document.querySelector('label[role="combobox"]');
                if (cb?.innerText?.includes("Condition")) cb.click();
            }).catch(() => { });
            await delay(1500);
            await page.evaluate(() => {
                const opts = document.querySelectorAll('div[role="option"]');
                for (const o of opts) if (o.innerText?.includes("New")) { o.click(); return; }
            }).catch(() => { });
            await delay(1000);

            // Description with phone
            let desc = job.description || job.listing_description || "Contact for details!";
            const phoneNumber = job.phone || job.phoneNumber || job.phone_number;
            if (phoneNumber) {
                desc += `\n\nCall or text: ${phoneNumber}`;
            }
            await typeField(page, "Description", desc, true);

            await takeScreenshot(page, '03_form_filled');

            // ═══════════ STEP 3: Click Next (details → location) ═══════════
            // Matches working V13: simple aria-label="Next" selector
            console.log(`[${this.config.name}] Clicking Next (details → location)...`);
            await page.evaluate(() => {
                const btn = document.querySelector('div[role="button"][aria-label="Next"]');
                if (btn) btn.click();
            }).catch(() => { });
            await delay(5000);

            // Check for validation errors
            const validationError = await page.evaluate(() => {
                const alerts = document.querySelectorAll('[role="alert"]');
                for (const a of alerts) if (a.innerText?.trim()) return a.innerText.trim();
                return null;
            });
            if (validationError) {
                console.log(`[${this.config.name}] Validation error: ${validationError}`);
                await takeScreenshot(page, 'validation_error');
                throw new Error(`Form validation failed: ${validationError}`);
            }

            await takeScreenshot(page, '04_after_next1');

            // ═══════════ STEP 4: Location (matches V13) ═══════════
            console.log(`[${this.config.name}] Setting location...`);
            let loc = (job.location || "Dallas, Texas").replace(", TX", ", Texas");

            // Find location input via label or aria-label
            await page.evaluate(() => {
                const labels = document.querySelectorAll("label");
                for (const l of labels) {
                    if (l.innerText?.toLowerCase().includes("location")) {
                        const input = l.querySelector("input");
                        if (input) { input.click(); input.focus(); return true; }
                    }
                }
                return false;
            }).catch(() => { });
            await page.keyboard.down("Control");
            await page.keyboard.press("A");
            await page.keyboard.up("Control");
            await page.keyboard.press("Backspace");
            await page.keyboard.type(loc, { delay: 100 });
            await delay(2000);
            await page.keyboard.press("ArrowDown");
            await page.keyboard.press("Enter");
            console.log(`[${this.config.name}] Location: ${loc}`);

            // Local pickup
            await page.evaluate(() => {
                const labels = Array.from(document.querySelectorAll("label"));
                const pickup = labels.find(l => l.innerText?.toLowerCase().includes("local pickup"));
                if (pickup) pickup.click();
            }).catch(() => { });
            await delay(2000);

            await takeScreenshot(page, '05_after_location');

            // ═══════════ STEP 5: Click Next (location → publish) ═══════════
            console.log(`[${this.config.name}] Clicking Next (location → publish)...`);
            await page.evaluate(() => {
                const btn = document.querySelector('div[role="button"][aria-label="Next"]');
                if (btn) btn.click();
            }).catch(() => { });
            await delay(5000);

            await takeScreenshot(page, '06_after_next2');

            // ═══════════ STEP 6: Publish ═══════════
            console.log(`[${this.config.name}] Clicking Publish...`);
            const clickedPublish = await page.evaluate(() => {
                const btns = Array.from(document.querySelectorAll("div[role='button'], button, span"));
                // Try exact text match
                let pub = btns.find(b => {
                    const t = b.innerText?.trim().toLowerCase();
                    return t === 'publish' || t === 'post' || t === 'list item';
                });
                // Try aria-label
                if (!pub) {
                    pub = document.querySelector('[aria-label="Publish"], [aria-label="Post"], [aria-label="List Item"]');
                }
                if (pub) { pub.click(); return true; }
                return false;
            });

            if (!clickedPublish) {
                console.log(`[${this.config.name}] Publish button not found — trying Next as fallback`);
                await page.evaluate(() => {
                    const btn = document.querySelector('div[role="button"][aria-label="Next"]');
                    if (btn) btn.click();
                }).catch(() => { });
                await delay(3000);
                // Try publish again
                await page.evaluate(() => {
                    const btns = Array.from(document.querySelectorAll("div[role='button'], button, span"));
                    const pub = btns.find(b => {
                        const t = b.innerText?.trim().toLowerCase();
                        return t === 'publish' || t === 'post';
                    });
                    if (pub) pub.click();
                });
            }

            // Wait for posting to complete
            console.log(`[${this.config.name}] Waiting for posting completion (30s)...`);
            await delay(30000);
            await takeScreenshot(page, '10_final_state');

            const finalUrl = page.url();
            console.log(`[${this.config.name}] Final URL: ${finalUrl}`);

            // Success = URL moved away from /marketplace/create
            const success = !finalUrl.includes("/marketplace/create") && !finalUrl.includes("/login");

            if (success) {
                console.log(`[${this.config.name}] SUCCESS! Posted to Facebook`);
                await sendWhatsApp(`Posted: ${job.title}\n${finalUrl}`, this.config.name);
                return { success: true, url: finalUrl };
            } else {
                // Check page text for success indicators
                const pageText = await page.evaluate(() => document.body.textContent?.toLowerCase() || '');
                const hasSuccess = pageText.includes('your listing is now live') ||
                    pageText.includes('your listing has been published') ||
                    pageText.includes('successfully listed');
                if (hasSuccess) {
                    console.log(`[${this.config.name}] Success indicators found despite URL`);
                    await sendWhatsApp(`Posted: ${job.title}`, this.config.name);
                    return { success: true, url: finalUrl };
                }

                console.log(`[${this.config.name}] FAILED — still on create page`);
                await takeScreenshot(page, 'publish_failed');
                await sendWhatsApp(`FAILED: ${job.title} — still on create page`, this.config.name);
                return { success: false, url: finalUrl };
            }

        } catch (error) {
            console.error(`[${this.config.name}] Marketplace error:`, error.message);
            await takeScreenshot(page, 'error_state').catch(() => { });
            await sendWhatsApp(`Error: ${error.message}`, this.config.name);
            return { success: false, error: error.message };
        }
    }

    async updateJobStatus(jobId, status, url = null) {
        try {
            await axios.post(this.config.updateStatusUrl, {
                jobId: jobId,
                status: status,
                url: url,
                error: status === 'failed' ? 'Posting failed' : null
            });
            console.log(`[${this.config.name}] Job ${jobId} updated to ${status}`);
        } catch (error) {
            console.log(`[${this.config.name}] Status update failed:`, error.message);
        }
    }

    async run() {
        console.log(`[${this.config.name}] FACEBOOK BOT STARTED`);
        console.log(`[${this.config.name}] Screenshots: ${screenshotDir}`);

        let browser = null;
        let page = null;

        try {
            // Get job first
            const job = await this.getJob();
            if (!job) {
                console.log(`[${this.config.name}] No jobs available`);
                return;
            }

            // Launch browser
            browser = await this.launchBrowser();

            // CRITICAL: Use fresh page — matches working V13
            // pages[0] has stale restore-session state that causes "new device" detection
            page = await browser.newPage();

            await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

            // 1. Navigate to facebook.com FIRST to establish domain context (matches working V13)
            console.log(`[${this.config.name}] Navigating to Facebook to establish context...`);
            await page.goto("https://www.facebook.com", { waitUntil: "networkidle2", timeout: 60000 });

            // 2. Inject cookies from per-profile cookie file (NOT GoLogin API)
            try {
                const cookiesJsonPath = this.cookieFilePath;
                if (fs.existsSync(cookiesJsonPath)) {
                    console.log(`[${this.config.name}] Injecting cookies from ${path.basename(cookiesJsonPath)}...`);
                    const cookiesRaw = fs.readFileSync(cookiesJsonPath, 'utf8');
                    const manualCookies = JSON.parse(cookiesRaw);

                    const puppeteerCookies = manualCookies.map(c => ({
                        name: c.name,
                        value: c.value,
                        domain: c.domain,
                        path: c.path,
                        secure: c.secure,
                        httpOnly: c.httpOnly,
                        expires: c.expirationDate,
                    }));

                    await page.setCookie(...puppeteerCookies);

                    // Force English locale cookie (matches working V13)
                    await page.setCookie({
                        name: 'locale',
                        value: 'en_US',
                        domain: '.facebook.com',
                        path: '/',
                        secure: true,
                    });

                    console.log(`[${this.config.name}] Injected ${puppeteerCookies.length} cookies + locale from cookies.json`);
                } else {
                    console.log(`[${this.config.name}] No cookies.json found — will need login`);
                }
            } catch (e) {
                console.log(`[${this.config.name}] Cookie injection failed: ${e.message}`);
            }

            // 3. Verify session via /me (matches working V13)
            const isLoggedIn = await this.checkFacebookLogin(page);

            if (!isLoggedIn) {
                console.log(`[${this.config.name}] Session invalid — attempting credential login...`);

                const loginSuccess = await this.attemptDirectFacebookLogin(page);
                if (!loginSuccess) {
                    await sendWhatsApp(`Session expired! Need manual login via noVNC at http://172.245.56.50:6080/vnc.html`, this.config.name);
                    throw new Error(`Login failed. Manual GoLogin login required.`);
                }

                // Save successful login cookies
                await this.saveCookiesToFile(page);
                await this.saveCookiesToAPI(page);
            }

            console.log(`[${this.config.name}] Session verified. Going to marketplace.`);

            // Post to marketplace
            const result = await this.postToMarketplace(page, job);

            // Update job status
            if (result && result.success) {
                await this.updateJobStatus(job.id, 'posted', result.url);
                console.log(`\n[${this.config.name}] SUCCESS! Job posted to Facebook`);
            } else {
                await this.updateJobStatus(job.id, 'failed');
                console.log(`\n[${this.config.name}] FAILED to post job`);
            }

        } catch (error) {
            console.error(`[${this.config.name}] Bot error:`, error.message);
            if (!error.message.includes("Manual login required") && !error.message.includes("Login failed")) {
                await sendWhatsApp(`Bot error: ${error.message}`, this.config.name);
            }
        } finally {
            // Save cookies to GoLogin API + local file before cleanup (session persistence)
            if (page && !page.isClosed()) {
                await this.saveCookiesToAPI(page).catch(e => console.log('Cookie API save error:', e.message));
                await this.saveCookiesToFile(page).catch(e => console.log('Cookie file save error:', e.message));
            }

            // Clean up GoLogin session
            await this.cleanup();

            if (browser) {
                try {
                    await browser.close();
                } catch (e) {
                    console.warn(`[${this.config.name}] Browser close warning:`, e.message);
                }
            }

            // Clean up temp files
            try {
                const tempDir = path.join(__dirname, 'temp');
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
            } catch (e) {
                console.warn(`[${this.config.name}] Temp cleanup warning:`, e.message);
            }
        }
    }
}

// Main execution
const profileArg = process.argv[2];
if (profileArg) {
    const productConfig = CONFIG.products.find(p => p.id === profileArg);
    if (productConfig) {
        console.log(`Running: ${productConfig.name}`);
        const bot = new ManualFacebookBot(productConfig);
        bot.run().catch(console.error);
    } else {
        console.error(`Profile '${profileArg}' not found. Available: ${CONFIG.products.map(p => p.id).join(', ')}`);
    }
} else {
    console.log('Usage: node facebook-bot-final.js [uad|missparty]');
    console.log('Available profiles:', CONFIG.products.map(p => `${p.id} (${p.name})`).join(', '));
}
