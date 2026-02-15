/**
 * Run BEFORE run-smoke.ts. Ensures: worker up, test user has credits, queue drained (optional).
 * Prevents: Insufficient Credits, smoke "stuck" behind old jobs.
 *
 * Usage: npx tsx tools/smoke-preflight.ts [--drain]
 *   --drain  Remove waiting jobs so smoke runs immediately (active job continues).
 *
 * WORKFLOW: Generate FULL video first. Quality issues may appear in ANY scene (2, 3, 4...).
 * To fix bad clips only: JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts
 * MAX_CLIPS=1 is DEBUG ONLY—never use for real quality validation.
 */
import "dotenv/config";
import { query } from "../src/db/client";
import { Queue } from "bullmq";
import { redisConnection } from "../src/queue/connection";

const API = process.env.API_URL || "http://localhost:3001";
const DRAIN = process.argv.includes("--drain");

async function checkWorker() {
  const r = await fetch(`${API}/api/health`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error("Worker not reachable. Start: PORT=3001 npx tsx src/index.ts (full tour). Debug: MAX_CLIPS=1");
}

async function ensureCredits() {
  const r = await fetch(`${API}/api/dev/ensure-test-user`, { method: "POST" });
  const d = await r.json();
  const userId = d.userId;
  const row = await query("SELECT credits_balance FROM entitlements WHERE user_id = $1", [userId]);
  const bal = row?.[0] ? Number(row[0].credits_balance) : 0;
  const needed = 250; // Full tour ~15 clips (Nano + Kling per clip) + buffer
  if (bal < needed) {
    await query(
      `INSERT INTO entitlements (user_id, credits_balance, updated_at) VALUES ($1, 500, NOW()) ON CONFLICT (user_id) DO UPDATE SET credits_balance = 500, updated_at = NOW()`,
      [userId]
    );
    console.log("✅ Credits set to 500 for test user", userId);
  } else {
    console.log("✅ Credits OK:", bal, "for", userId);
  }
}

async function drainQueue() {
  const q = new Queue("video-pipeline", { connection: redisConnection });
  const counts = await q.getJobCounts();
  if (counts.waiting > 0) {
    await q.drain();
    console.log("✅ Drained", counts.waiting, "waiting job(s)");
  } else {
    console.log("✅ Queue: 0 waiting");
  }
  await q.close();
}

async function main() {
  console.log("\n--- smoke preflight ---\n");
  await checkWorker();
  await ensureCredits();
  if (DRAIN) await drainQueue();
  else console.log("(Use --drain to clear waiting jobs so smoke runs first)\n");
  console.log("Ready. Run: API_URL=" + API + " npx tsx tools/run-smoke.ts\n");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
