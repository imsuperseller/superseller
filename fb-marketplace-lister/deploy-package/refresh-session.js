// Refresh stale Facebook session via the "See more on Facebook" modal
// This modal appears when cookies are partially valid — email prefilled, needs password
const { GoLogin } = require("gologin");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const config = JSON.parse(fs.readFileSync("./bot-config.json", "utf8"));
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const IDX = parseInt(process.argv[2] || "1");
const product = config.products[IDX];
const name = IDX === 0 ? "UAD" : "MissParty";

(async () => {
    console.log("=== SESSION REFRESH: " + name + " (" + product.fbEmail + ") ===");
    console.log("noVNC: http://172.245.56.50:6080/vnc.html\n");

    // Pre-create fonts dir
    const fontsPath = path.join("/tmp", "gologin_profile_" + product.profileId, "fonts");
    try { if (!fs.existsSync(fontsPath)) fs.mkdirSync(fontsPath, { recursive: true }); } catch (e) { }

    const GL = new GoLogin({
        token: config.shared.gologinToken,
        profile_id: product.profileId,
        extra_params: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--display=:100", "--password-store=basic"],
        uploadCookiesToServer: false,
        writeCookesToServer: false,
    });

    console.log("Starting GoLogin...");
    const { status, wsUrl } = await GL.start();
    console.log("GoLogin: " + status);
    if (status !== "success") throw new Error("GoLogin failed: " + status);

    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, defaultViewport: null, protocolTimeout: 180000 });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

    // Navigate + inject stale cookies (to get the prefilled modal)
    console.log("Step 1: Navigate to facebook.com and inject cookies...");
    await page.goto("https://www.facebook.com", { waitUntil: "networkidle2", timeout: 60000 });

    const cookieFile = `./cookies_${product.id}.json`;
    if (fs.existsSync(cookieFile)) {
        const cookies = JSON.parse(fs.readFileSync(cookieFile, "utf8"));
        const pc = cookies.map(c => ({
            name: c.name, value: c.value, domain: c.domain, path: c.path,
            secure: c.secure, httpOnly: c.httpOnly, expires: c.expirationDate
        }));
        await page.setCookie(...pc);
        await page.setCookie({ name: "locale", value: "en_US", domain: ".facebook.com", path: "/", secure: true });
        console.log("   Injected " + pc.length + " cookies");
    }

    // Go to marketplace to trigger the "See more" modal
    console.log("\nStep 2: Navigate to marketplace...");
    await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "networkidle2", timeout: 60000 });
    await delay(3000);

    // Check for the "See more on Facebook" login modal
    console.log("\nStep 3: Looking for login modal...");
    const currentUrl = page.url();
    console.log("   Current URL: " + currentUrl);

    // Try to find the modal password field and fill it
    const hasModal = await page.evaluate((pass) => {
        // Look for password field in the modal
        const passFields = document.querySelectorAll('input[type="password"]');
        if (passFields.length === 0) return "no_password_field";

        // Also check if we're on a full login page
        const emailField = document.querySelector('#email') || document.querySelector('input[name="email"]');
        const passField = passFields[0];

        if (passField) {
            // Use React-compatible setter
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(passField, pass);
            passField.dispatchEvent(new Event('input', { bubbles: true }));
            return "password_filled";
        }
        return "no_field";
    }, product.fbPass);

    console.log("   Modal status: " + hasModal);

    if (hasModal === "password_filled") {
        console.log("\nStep 4: Submitting login...");
        await delay(1000);

        // Try clicking "Log In" button
        const clicked = await page.evaluate(() => {
            // Modal "Log In" button
            const buttons = document.querySelectorAll('div[role="button"], button, input[type="submit"]');
            for (const btn of buttons) {
                const text = (btn.textContent || btn.value || "").trim().toLowerCase();
                if (text === "log in" || text === "login" || text === "continue") {
                    btn.click();
                    return text;
                }
            }
            // Try button[name="login"]
            const loginBtn = document.querySelector('button[name="login"]');
            if (loginBtn) { loginBtn.click(); return "button[name=login]"; }
            return null;
        });

        if (clicked) {
            console.log("   Clicked: " + clicked);
        } else {
            // Fallback: press Enter on password field
            console.log("   No button found, pressing Enter...");
            await page.focus('input[type="password"]');
            await page.keyboard.press("Enter");
        }

        // Wait for navigation / response
        await Promise.race([
            page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => null),
            delay(15000)
        ]);
        await delay(3000);

        const afterUrl = page.url();
        console.log("   After submit URL: " + afterUrl);
        await page.screenshot({ path: "/opt/fb-marketplace-bot/screenshots/refresh_after_submit.png" });

        // Check for 2FA
        if (afterUrl.includes("auth_platform") || afterUrl.includes("checkpoint") || afterUrl.includes("security")) {
            console.log("\n!!! 2FA CHECKPOINT !!!");
            console.log("Approve on phone or via noVNC: http://172.245.56.50:6080/vnc.html");
            console.log("Waiting up to 5 minutes...\n");

            for (let i = 0; i < 30; i++) {
                await delay(10000);
                const nowUrl = page.url();
                if (!nowUrl.includes("auth_platform") && !nowUrl.includes("checkpoint") && !nowUrl.includes("security") && !nowUrl.includes("/login")) {
                    console.log("   2FA approved! URL: " + nowUrl);
                    break;
                }
                if (i % 3 === 0) console.log("   Waiting... (" + Math.floor((i + 1) * 10 / 60) + " min)");
            }
        }
    } else if (hasModal === "no_password_field") {
        // Maybe it's a regular login page
        console.log("\nNo modal found — trying regular login page...");
        const onLoginPage = currentUrl.includes("login") || !!(await page.$("#email").catch(() => null));
        if (onLoginPage) {
            console.log("   On login page — filling credentials...");
            const emailField = await page.$("#email") || await page.$('input[name="email"]');
            const passField = await page.$("#pass") || await page.$('input[name="pass"]');
            if (emailField && passField) {
                await page.type("#email", product.fbEmail).catch(() => page.type('input[name="email"]', product.fbEmail));
                await page.type("#pass", product.fbPass).catch(() => page.type('input[name="pass"]', product.fbPass));
                await page.click('button[name="login"]').catch(async () => {
                    await page.keyboard.press("Enter");
                });
                await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 }).catch(() => null);
                await delay(3000);

                const afterUrl = page.url();
                console.log("   After login URL: " + afterUrl);

                if (afterUrl.includes("auth_platform") || afterUrl.includes("checkpoint") || afterUrl.includes("security")) {
                    console.log("\n!!! 2FA CHECKPOINT !!!");
                    console.log("Approve via noVNC: http://172.245.56.50:6080/vnc.html");
                    console.log("Waiting up to 5 minutes...\n");
                    for (let i = 0; i < 30; i++) {
                        await delay(10000);
                        const nowUrl = page.url();
                        if (!nowUrl.includes("auth_platform") && !nowUrl.includes("checkpoint") && !nowUrl.includes("security") && !nowUrl.includes("/login")) {
                            console.log("   2FA approved!");
                            break;
                        }
                        if (i % 3 === 0) console.log("   Waiting... (" + Math.floor((i + 1) * 10 / 60) + " min)");
                    }
                }
            }
        } else {
            console.log("   Not on login page. Page may need VNC interaction.");
            console.log("   Check: http://172.245.56.50:6080/vnc.html");
        }
    }

    // Step 5: Check if we're now logged in
    console.log("\nStep 5: Verifying session...");
    await page.goto("https://www.facebook.com/me", { waitUntil: "networkidle2", timeout: 60000 });
    const meUrl = page.url();
    console.log("   /me URL: " + meUrl);
    const loggedIn = !meUrl.includes("login") && !(await page.$("#email").catch(() => null));

    if (loggedIn) {
        console.log("   SESSION ACTIVE!\n");

        // Save all FB cookies when logged in (even if c_user/xs missing — try anyway for posting)
        const allCookies = await page.cookies("https://www.facebook.com");
        const fbCookies = allCookies.filter(c => c.domain && c.domain.includes("facebook"));
        const cu = fbCookies.find(c => c.name === "c_user");
        const xs = fbCookies.find(c => c.name === "xs");
        if (!cu || !xs) {
            console.log("   Note: c_user/xs not in dump — saving " + fbCookies.length + " cookies anyway for retry.");
        }

        if (fbCookies.length > 0) {
            const formatted = fbCookies.map(c => ({
                name: c.name, value: c.value, domain: c.domain, path: c.path || "/",
                httpOnly: c.httpOnly || false, secure: c.secure || true,
                sameSite: c.sameSite === "None" ? "no_restriction" : c.sameSite === "Lax" ? "lax" : "unspecified",
                expirationDate: c.expires > 0 ? c.expires : undefined,
            }));

            fs.writeFileSync(cookieFile, JSON.stringify(formatted, null, 2));
            console.log("   Saved " + formatted.length + " cookies to " + cookieFile);
            if (cu) console.log("   c_user: " + cu.value);

            try {
                await GL.postCookies(product.profileId, formatted);
                console.log("   Saved cookies to GoLogin API");
            } catch (e) {
                console.log("   GoLogin API save failed: " + e.message);
            }

            console.log("\nStep 6: Testing marketplace...");
            await page.goto("https://www.facebook.com/marketplace/create/item", { waitUntil: "networkidle2", timeout: 90000 });
            await delay(5000);
            const mktUrl = page.url();
            console.log("   Marketplace URL: " + mktUrl);
            const hasForm = await page.$('input[type="file"]').then(el => !!el).catch(() => false);
            console.log("   File input: " + hasForm);
            await page.screenshot({ path: "/opt/fb-marketplace-bot/screenshots/refresh_marketplace_final.png" });

            if (hasForm) {
                console.log("\n=== FULL MARKETPLACE ACCESS RESTORED ===");
            } else {
                console.log("\n=== Session saved; marketplace form check: " + (hasForm ? "OK" : "not loaded") + " ===");
            }
        } else {
            console.log("   WARNING: No Facebook cookies to save.");
        }
    } else {
        console.log("   SESSION STILL INVALID");
        await page.screenshot({ path: "/opt/fb-marketplace-bot/screenshots/refresh_failed.png" });
    }

    await GL.stopLocal({ posting: false });
    console.log("\nDone.");
    process.exit(loggedIn ? 0 : 1);
})().catch(e => {
    console.error("FATAL: " + e.message);
    process.exit(1);
});
