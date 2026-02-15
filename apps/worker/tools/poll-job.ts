#!/usr/bin/env npx tsx
/** Poll a job until complete, failed, or timeout. Usage: npx tsx tools/poll-job.ts <jobId> */
const JOB = process.argv[2] || process.env.JOB_ID;
const API = process.env.API_URL || "http://localhost:3001";
const POLL_MS = 30_000;
const MAX = parseInt(process.env.SMOKE_MAX_POLLS || "60", 10);

if (!JOB) {
  console.error("Usage: JOB_ID=xxx npx tsx tools/poll-job.ts");
  process.exit(1);
}

async function poll() {
  for (let i = 1; i <= MAX; i++) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const r = await fetch(`${API}/api/jobs/${JOB}`);
    const d = await r.json();
    const job = (d as any).job || {};
    const elapsed = Math.round((i * POLL_MS) / 60000);
    console.log(`${new Date().toISOString().slice(11, 19)} +${elapsed}m status=${job.status} progress=${job.progress_percent}%`);
    if (job.master_video_url) {
      console.log("\nVIDEO:", job.master_video_url);
      process.exit(0);
    }
    if (job.status === "failed") {
      console.log("FAILED:", job.error_message);
      process.exit(1);
    }
  }
  console.log(`Timeout after ${MAX} polls.`);
  process.exit(2);
}
poll();
