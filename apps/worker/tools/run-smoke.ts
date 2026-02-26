// API_URL must point to WORKER (not superseller-site). Worker has /api/dev/, /api/jobs/.
// Local (worker 3001, site 3002): API_URL=http://localhost:3001
// RackNerd: API_URL=http://172.245.56.50:3002
const API = process.env.API_URL || "http://localhost:3001";
// Full tour (MAX_CLIPS unset = 15). Quality issues appear in ANY scene—test full video. Bad clips only: JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts
// FORCE_NO_REALTOR=1: no realtor (property-only) smoke test.
// SMOKE_SKIP_PREFLIGHT=1: skip credits + queue checks (use when queue intentionally has other jobs).

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

const POLL_INTERVAL_MS = parseInt(process.env.SMOKE_POLL_INTERVAL || "15000", 10); // 15s default for quicker feedback
const MAX_POLLS = parseInt(process.env.SMOKE_MAX_POLLS || "240", 10); // 240×15s = 60min default. Full tour ~45min.

async function poll(jobId: string): Promise<void> {
  const start = Date.now();
  for (let i = 0; i < MAX_POLLS; i++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const r = await fetch(`${API}/api/jobs/${jobId}`);
    const d = await r.json();
    const job = d.job || {};
    const clips = d.clips || [];
    const done = clips.filter((c: any) => c.status === "done" || c.status === "complete").length;
    const total = clips.length;
    const elapsed = Math.round((Date.now() - start) / 60000);
    console.log(`${new Date().toISOString().slice(11, 19)} +${elapsed}m status=${job.status} clips=${done}/${total}`);
    if (job.master_video_url) {
      console.log("\nVIDEO:", job.master_video_url);
      process.exit(0);
    }
    if (job.status === "failed") {
      console.log("FAILED:", job.error_message);
      process.exit(1);
    }
  }
  console.log(`Timeout after ${MAX_POLLS} polls (${Math.round(MAX_POLLS * POLL_INTERVAL_MS / 60000)}m). Set SMOKE_MAX_POLLS for longer.`);
  process.exit(2);
}

async function main() {
  if (!process.env.SMOKE_SKIP_PREFLIGHT) {
    console.log("Tip: npx tsx tools/smoke-preflight.ts --drain first. Worker: full tour (no MAX_CLIPS) for real validation.\n");
  }
  const userId = await ensureUser();
  // Ensure test user has R2-hosted avatar (run: npx tsx tools/set-test-user-avatar.ts)
  const jobId = await createJob(userId);
  console.log("JobId:", jobId, `(polling every ${POLL_INTERVAL_MS/1000}s, max ${MAX_POLLS} polls = ${Math.round(MAX_POLLS * POLL_INTERVAL_MS / 60000)}min)`);
  await poll(jobId);
}
main();
