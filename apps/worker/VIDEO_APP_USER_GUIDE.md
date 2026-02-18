# TourReel Video App — User Guide & Status

**Last updated**: Feb 15, 2026

---

## 0. Fix Only Bad Scenes (DEFAULT — Do Not Rerun Whole Pipeline)

**When a video has issues in only some scenes, fix ONLY those scenes. Do NOT retry the whole job.**

- **In-app**: Go to `https://rensto.com/video` (or `http://localhost:3002/video`) → click **View** on a completed job → scroll to "Fix only bad scenes" → select only the bad scenes (e.g. Scene 3: Living Room) → Regenerate selected.
- **CLI**: `cd apps/worker && JOB_ID={jobId} CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts` (replace 2,3 with actual scene numbers).
- **List clips**: `cd apps/worker && JOB_ID={jobId} npx tsx tools/list-clips-for-regen.ts` — shows Scene 1, 2, 3... with `to_room` so you know which to fix.

**Full retry** (`retry-fresh`) clears everything and re-runs the whole pipeline. Use only when the opening is wrong or most clips are bad. Saves credits and time to fix only what's broken.

---

## 1. Where to Go & What to Do

### Local development (recommended for testing)

1. **Start the Next.js app** from `apps/web/rensto-site/`:
   ```bash
   VIDEO_WORKER_URL=http://172.245.56.50:3002 pnpm dev
   ```
2. **Create a video**:
   - Open: **http://localhost:3002/video/create** (site runs on 3002)
   - Paste a Zillow URL
   - Upload realtor headshot (required)
   - Upload floorplan (optional)
   - Click **Generate Tour**
3. **Watch the job**:
   - You are redirected to `/video/{jobId}`
   - Polls every 3 seconds; shows progress, clips, and final video

### Production (rensto.com)

- **Video create is enabled.** Ensure `VIDEO_WORKER_URL` is set in Vercel (e.g. `http://172.245.56.50:3002` for RackNerd).
- Without VIDEO_WORKER_URL: "Video worker not configured."

---

## 2. What’s Deployed Now (Worker)

**Deployed Feb 13–15, 2026**:

- **hero-features.ts**: Stricter pool detection (no bare "pool"; exclusions for "pool table", "potential pool")
- **floorplan-analyzer.ts**: At most one pool room; deduplicated pool/backyard rooms
- **video-pipeline.worker.ts**: Opening scene front of house only; **pool-first fix (Feb 15)**: no longer force index 0 when `hasPool` (Zillow often uses pool as "exterior"); Gemini picks from 5 candidates; fallback skips index 0 when Gemini fails on pool properties. Double-realtor fix (Kling: "person ALREADY in frame, animate only"); **Nano Banana progress**: 20→35%.
- **Selective regeneration**: API `POST /api/jobs/:id/regenerate` + CLI `JOB_ID=xxx CLIP_NUMBERS=2,3 npx tsx tools/regen-clips.ts`
- **Full retry**: API `POST /api/jobs/:id/retry-fresh` clears clips and re-runs pipeline (fixes opening + all clips)

**Progress**: 5% (analyzing) → 15% (prompts) → 20–35% (Nano Banana) → 36–70% (Kling clips) → 75% (stitch) → 85% (music) → 90% (export) → 100%

---

## 3. Feedback / Regenerate Flow — PARTIAL (Selective Regen Done)

**Current state**: The app does **not** have:

- A review popup when the video is complete
- A way to give feedback on the video
- AI-assisted scene selection (“which scenes need fixing”)
- ~~Selective regeneration~~ **DONE** (API + CLI)
- ~~Re-stitching of fixed clips~~ **DONE** (part of regen)
- Iteration loop until approval

**What exists today**:

- Video completes → dashboard shows the final video and clips
- Selective regen via API, CLI, and **in-app regenerate button** (when job complete: select scenes → Regenerate selected)

**Planned flow** (to be implemented):

1. When status = `completed` → show a review modal
2. User can approve or give feedback
3. If feedback → AI determines which scene(s) to fix and how
4. Regenerate only those scenes
5. Re-stitch: [working clips] + [new clips] in order
6. Replace master video, show again
7. Repeat until user approves or gives no more feedback

---

## 4. Will It Work?

| Question | Answer |
|----------|--------|
| Will new jobs use the pool fixes? | **Yes** — worker deployed with fixes |
| Will the opening scene be the front? | **Yes** — Gemini picks from 5 candidates; no forced pool when property has pool |
| Will there be fewer pool scenes? | **Yes** (stricter detection) |
| Will it waste time? | No — the logic was reviewed and deployed |
| Is selective regen (API/CLI) live? | **Yes** |
| Is full feedback→AI flow live? | **No** — backlog |

---

## 5. Worker Ops & RackNerd

**RackNerd worker**: `172.245.56.50:3002` — may not be reachable from all networks (firewall/VPN).

| Scenario | What to do |
|----------|------------|
| Enqueue retry from local | `npx tsx tools/retry-job-fresh.ts <jobId>` — job goes to shared Redis; **local worker must be running** to process it (`npx tsx src/index.ts`). |
| Enqueue from RackNerd | `curl -X POST http://172.245.56.50:3002/api/jobs/<id>/retry-fresh` — adds job to RackNerd's Redis; RackNerd worker picks it up. (Use when RackNerd is reachable.) |
| Deploy fixes | `./apps/worker/deploy-to-racknerd.sh` — syncs code, runs `pm2 restart tourreel-worker`. |

**Redis**: Local `retry-job-fresh` and worker must use the **same** REDIS_URL. If RackNerd worker uses different Redis, jobs enqueued locally won't be processed until you run the worker locally.

---

## 6. References

- Worker API: `http://172.245.56.50:3002/api/jobs`
- Pipeline flow (Nano composite → Kling interpolate; §0): `apps/worker/TOURREEL_REALTOR_HANDOFF_SPEC.md`
- Feedback flow backlog: Section 3 above
- Worker ops / RackNerd: Section 5
