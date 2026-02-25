/**
 * Quick single-job test - minimal Zillow URL, just verify end-to-end
 */

const API_URL = "http://172.245.56.50:3002";
const TEST_USER = "c60b6d2f-856d-49fd-8737-7e1fee3fa848";
const ZILLOW_URL = "https://www.zillow.com/homedetails/444-Alaska-Ave-Torrance-CA-90503/21023089_zpid/";

async function test() {
    console.log("Creating job...");
    const createResp = await fetch(`${API_URL}/api/jobs/from-zillow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: TEST_USER, addressOrUrl: ZILLOW_URL }),
    });
    const { job } = await createResp.json();
    console.log(`Job created: ${job.id}\n`);
    
    console.log("Polling every 30s for up to 20 minutes...");
    for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 30000));
        const statusResp = await fetch(`${API_URL}/api/jobs/${job.id}?userId=${TEST_USER}`);
        const { job: current } = await statusResp.json();
        const elapsed = (i + 1) * 30;
        console.log(`${elapsed}s: status=${current.status}, video=${current.master_video_url ? 'YES ✅' : 'NO'}`);
        if (current.status === "complete" && current.master_video_url) {
            console.log(`\n🎉 SUCCESS! Video URL:\n${current.master_video_url}\n`);
            process.exit(0);
        }
        if (current.status === "failed") {
            console.log(`\n❌ FAILED: ${current.error_message}\n`);
            process.exit(1);
        }
    }
    console.log("\n⏱️ Timeout after 20 minutes - job still pending\n");
    process.exit(1);
}

test().catch(err => {
    console.error("\n❌ Test error:", err.message);
    process.exit(1);
});
