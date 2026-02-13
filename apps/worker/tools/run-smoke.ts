const API = process.env.API_URL || "http://localhost:3002";
// Use full tour (default MAX_CLIPS=15). For quick smoke, set MAX_CLIPS=3 in worker env.
// FORCE_NO_REALTOR=1: no realtor (property-only) smoke test.

async function ensureUser(): Promise<string> {
  const r = await fetch(`${API}/api/dev/ensure-test-user`, { method: "POST" });
  const d = await r.json();
  return d.userId;
}

async function createJob(userId: string): Promise<string> {
  const r = await fetch(`${API}/api/jobs/from-zillow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      addressOrUrl: "https://www.zillow.com/homedetails/1531-Home-Park-Dr-Allen-TX-75002/26651378_zpid/",
      userId,
    }),
  });
  const d = await r.json();
  return d.job.id;
}

async function poll(jobId: string): Promise<void> {
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 30000));
    const r = await fetch(`${API}/api/jobs/${jobId}`);
    const d = await r.json();
    const job = d.job || {};
    const clips = d.clips || [];
    const done = clips.filter((c: any) => c.status === "done").length;
    const total = clips.length;
    console.log(`${new Date().toISOString().slice(11, 19)} status=${job.status} clips=${done}/${total}`);
    if (job.master_video_url) {
      console.log("\nVIDEO:", job.master_video_url);
      process.exit(0);
    }
    if (job.status === "failed") {
      console.log("FAILED:", job.error_message);
      process.exit(1);
    }
  }
  console.log("Timeout");
  process.exit(2);
}

async function main() {
  const userId = await ensureUser();
  // Ensure test user has R2-hosted avatar (run: npx tsx tools/set-test-user-avatar.ts)
  const jobId = await createJob(userId);
  console.log("JobId:", jobId, "(polling every 30s)");
  await poll(jobId);
}
main();
