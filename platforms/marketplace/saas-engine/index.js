const { getPendingSchedule, getClientData, updateScheduleStatus, logPostRun } = require("./lib/db");
const { executePosting } = require("./lib/engine");
const fs = require("fs");
const path = require("path");

/**
 * SaaS Orchestrator - Central Bot
 * Polls Firestore and executes jobs for ALL clients.
 */

const LOCK_FILE = "/tmp/superseller-saas-bot.lock";
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

async function main() {
    // Check for running instance
    if (fs.existsSync(LOCK_FILE)) {
        const pid = fs.readFileSync(LOCK_FILE, "utf8");
        try {
            process.kill(parseInt(pid), 0);
            console.error(`Orchestrator already running with PID ${pid}. Exiting.`);
            process.exit(1);
        } catch (e) {
            fs.unlinkSync(LOCK_FILE);
        }
    }
    fs.writeFileSync(LOCK_FILE, process.pid.toString());
    process.on("exit", () => { try { fs.unlinkSync(LOCK_FILE); } catch (e) { } });

    console.log("SuperSeller AI SaaS Orchestrator Started — Monitoring Postgres Queue...");

    while (true) {
        try {
            // 1. Get pending tasks from Firestore
            const tasks = await getPendingSchedule();

            if (tasks.length === 0) {
                console.log("[Queue] Empty. Sleeping for 2 minutes...");
                await delay(120000);
                continue;
            }

            for (const task of tasks) {
                console.log(`[Task] Processing: ${task.id} (Client: ${task.clientId})`);

                try {
                    // Update task status to "running" immediately to prevent double-processing
                    await updateScheduleStatus(task.id, "running");

                    // 2. Fetch Client Secrets & Data
                    const client = await getClientData(task.clientId);

                    // 3. Prepare Credentials Object
                    const creds = {
                        gologinToken: client.secrets.gologinApiKey,
                        profileId: client.secrets.profileId,
                        fbEmail: client.secrets.facebookEmail,
                        fbPass: client.secrets.facebookPassword
                    };

                    // 4. Fetch Listing Data (Mocked here for now, would fetch from listings/ collection)
                    // In a production SaaS, the task object would contain the listingId
                    const listing = {
                        ListingTitle: task.title || "Standard Property",
                        Price: task.price || 500,
                        ListingDescription: task.description || "Automatic Post",
                        Image_URL: task.imageUrl,
                        Location: task.location || "Dallas, TX"
                    };

                    // 5. Execute via Engine
                    const result = await executePosting(creds, listing, {
                        category: client.category || "Property for Rent"
                    });

                    // 6. Log Result & Finalize
                    const runId = await logPostRun(task.clientId, {
                        status: result.success ? "success" : "error",
                        marketplaceUrl: result.finalUrl || null,
                        error: result.error ? { message: result.error } : null,
                        scheduleId: task.id
                    });

                    await updateScheduleStatus(task.id, result.success ? "done" : "failed", runId);
                    console.log(`[Task] ${task.id} Result: ${result.success ? "SUCCESS" : "FAILED"}`);

                    // Random break between tasks within the same client cycle
                    await delay(randomRange(30000, 60000));

                } catch (taskError) {
                    console.error(`[Task] ${task.id} Hard Crash:`, taskError.message);
                    await updateScheduleStatus(task.id, "failed");
                }
            }

        } catch (loopError) {
            console.error("[Orchestrator] Loop Error:", loopError.message);
            await delay(30000);
        }

        // Global check interval
        const wait = randomRange(60000, 180000);
        console.log(`Check complete. Next polling cycle in ${Math.round(wait / 1000)}s...`);
        await delay(wait);
    }
}

main();
