// Robust session login — handles "Continue as", navigation races, and 2FA
// Usage: DISPLAY=:100 node session-login.js [0|1]   (0=UAD, 1=MissParty)
const { GoLogin } = require("gologin");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("/opt/fb-marketplace-bot/bot-config.json", "utf8"));
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

if (fs.existsSync("/tmp/gl_lock")) { console.log("Lock exists. Exiting."); process.exit(0); }
fs.writeFileSync("/tmp/gl_lock", String(process.pid));
const cleanup = () => { try { fs.unlinkSync("/tmp/gl_lock"); } catch (e) {} };
process.on("exit", cleanup);
process.on("SIGINT", () => { cleanup(); process.exit(1); });

const IDX = parseInt(process.argv[2] || "1");

(async () => {
    const product = config.products[IDX];
    const name = IDX === 0 ? "UAD" : "MissParty";
    console.log("\n" + "=".repeat(60));
    console.log("SESSION LOGIN: " + name + " (" + product.fbEmail + ")");
    console.log("noVNC: http://172.245.56.50:6080/vnc.html");
    console.log("=".repeat(60));

    const GL = new GoLogin({
        token: config.shared.gologinToken,
        profile_id: product.profileId,
        tmpdir: "/opt/fb-marketplace-bot/gologin-tmp",
        executablePath: "/root/.gologin/browser/orbita-browser/chrome",
        uploadCookiesToServer: false,
        writeCookiesFromServer: false,
        writeCookesToServer: false,
        extra_params: [
            "--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage",
            "--disable-gpu", "--no-first-run", "--password-store=basic",
        ],
    });

    console.log("Starting GoLogin browser...");
    const { status, wsUrl } = await GL.start();
    if (status !== "success") throw new Error("GoLogin start failed: " + status);
    console.log("GoLogin: " + status);

    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl, ignoreHTTPSErrors: true });
    const page = (await browser.pages())[0] || (await browser.newPage());
    await page.authenticate({ username: "${PROXY_USERNAME}", password: "${PROXY_PASSWORD}" });

    // Step 1: Check if already logged in
    console.log("\nStep 1: Checking current session...");
    try {
        await page.goto("https://www.facebook.com/", { waitUntil: "networkidle2", timeout: 30000 });
    } catch (e) {
        console.log("Navigation timeout, continuing...");
    }
    await delay(3000);

    let cookies = await page.cookies("https://www.facebook.com");
    let cu = cookies.find((c) => c.name === "c_user");
    let xs = cookies.find((c) => c.name === "xs");

    if (cu && xs) {
        console.log("ALREADY LOGGED IN! c_user=" + cu.value);
    } else {
        const url = page.url();
        console.log("Current URL: " + url);
        const hasLoginForm = await page.evaluate(() => !!document.querySelector('input[name="email"]')).catch(() => false);

        if (hasLoginForm || url.includes("login")) {
            console.log("\nStep 2: Filling login form...");
            try {
                const fillResult = await page.evaluate((email, pass) => {
                    const e = document.querySelector('input[name="email"]');
                    const p = document.querySelector('input[name="pass"]');
                    if (!e || !p) return "fields_missing";
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    setter.call(e, email);
                    e.dispatchEvent(new Event("input", { bubbles: true }));
                    setter.call(p, pass);
                    p.dispatchEvent(new Event("input", { bubbles: true }));
                    return "ok";
                }, product.fbEmail, product.fbPass);
                console.log("Fill result: " + fillResult);
                await delay(500);
                await page.focus('input[name="pass"]');
                await page.keyboard.press("Enter");
                console.log("Credentials submitted.");
            } catch (e) {
                console.log("Fill error (navigation race): " + e.message);
                console.log("Please complete login manually via noVNC");
            }

            try {
                await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });
            } catch (e) {}
            await delay(3000);
        } else {
            console.log("Not on login page — possibly 'Continue as' or redirect.");
            console.log("Check noVNC: http://172.245.56.50:6080/vnc.html");
            await page.screenshot({ path: "/opt/fb-marketplace-bot/screenshots/session_login_state.png" });
        }

        // Check for 2FA
        const afterUrl = page.url();
        if (afterUrl.includes("auth_platform") || afterUrl.includes("checkpoint") || afterUrl.includes("security")) {
            console.log("\n" + "!".repeat(60));
            console.log("2FA CHECKPOINT — Approve on phone or via noVNC!");
            console.log("http://172.245.56.50:6080/vnc.html");
            console.log("Waiting up to 10 minutes...");
            console.log("!".repeat(60));
        }
    }

    // Step 3: Poll for login success (10 minutes)
    console.log("\nPolling for session cookies (60 checks x 10s = 10 min)...");
    let success = false;
    for (let i = 0; i < 60; i++) {
        await delay(10000);
        cookies = await page.cookies("https://www.facebook.com");
        cu = cookies.find((c) => c.name === "c_user");
        xs = cookies.find((c) => c.name === "xs");

        if (cu && xs) {
            console.log("\nLOGIN SUCCESSFUL! c_user=" + cu.value);

            // Navigate to facebook.com to collect all cookies
            try {
                await page.goto("https://www.facebook.com/", { waitUntil: "domcontentloaded", timeout: 30000 });
                await delay(3000);
            } catch (e) {}

            // Collect final cookies
            const finalCookies = await page.cookies("https://www.facebook.com");
            const allFb = finalCookies.filter((c) => c.domain && c.domain.includes("facebook"));
            const formatted = allFb.map((c) => ({
                name: c.name,
                value: c.value,
                domain: c.domain,
                path: c.path || "/",
                httpOnly: c.httpOnly || false,
                secure: c.secure || true,
                sameSite: c.sameSite === "None" ? "no_restriction" : c.sameSite === "Lax" ? "lax" : "unspecified",
                expirationDate: c.expires > 0 ? c.expires : undefined,
            }));

            // Save to GoLogin API
            try {
                await GL.postCookies(product.profileId, formatted);
                console.log("Saved " + formatted.length + " cookies to GoLogin API");
            } catch (e) {
                console.log("postCookies error: " + e.message);
            }

            // Save to cookies.json
            fs.writeFileSync("/opt/fb-marketplace-bot/cookies.json", JSON.stringify(formatted, null, 2));
            console.log("Saved cookies to cookies.json");

            // Test marketplace
            console.log("\nTesting marketplace access...");
            try {
                await page.goto("https://www.facebook.com/marketplace/create/item", {
                    waitUntil: "networkidle2",
                    timeout: 60000,
                });
                await delay(5000);
            } catch (e) {}
            const hasForm = await page.evaluate(() => !!document.querySelector('input[type="file"]')).catch(() => false);
            const hasModal = await page
                .evaluate(() => {
                    const text = document.body.innerText;
                    return text.includes("Log into Facebook") || text.includes("See more on Facebook");
                })
                .catch(() => false);
            console.log("Marketplace: form=" + hasForm + ", loginModal=" + hasModal);
            await page.screenshot({
                path: "/opt/fb-marketplace-bot/screenshots/" + name + "_session_marketplace.png",
            });

            if (hasForm && !hasModal) {
                console.log("\nFULL MARKETPLACE ACCESS CONFIRMED!");
            }

            GL.uploadCookiesToServer = true;
            success = true;
            break;
        }

        if (i % 6 === 0) {
            console.log("  Waiting... (" + Math.floor(((i + 1) * 10) / 60) + " min)");
        }
    }

    if (success) {
        await GL.stop();
        console.log("\n" + name + " session saved (API + S3 + cookies.json). Done!");
    } else {
        console.log("\nTimed out. Closing without saving.");
        try {
            await browser.close();
        } catch (e) {}
        require("child_process").execSync("killall -9 chrome 2>/dev/null || true");
    }

    process.exit(success ? 0 : 1);
})().catch((e) => {
    console.error("FATAL: " + e.message);
    cleanup();
    process.exit(1);
});
