# TourReel — Local Dev & Testing

**Purpose**: Run frontend on localhost, test the video UI, share outputs with agents for debugging. Align with B.L.A.S.T., wireframes, and NotebookLM (Stitch + AntiGravity).

---

## 1. Start Frontend

```bash
cd apps/web/rensto-site && pnpm dev
```

- **URL**: http://localhost:3002
- **Port**: 3002 (configured in package.json). Ports 3000–3003 checked free.

---

## 2. Video Pages

| Route | Purpose |
|-------|---------|
| `/video/create` | **Create job** — Paste Zillow URL → creates job → redirects to viewer |
| `/video/[jobId]` | Standalone shareable view — e.g. `/video/abc-123-def` |
| `/dashboard/[clientId]/video?jobId=[jobId]` | Embedded in dashboard |

### Local Dev (No Worker)

When `VIDEO_WORKER_URL` is **not set** and `NODE_ENV=development`, the API returns **mock job data** so you can:

- See the full video generation UI
- Test layout, progress bar, clip queue, player area
- Align with wireframes (`legacy_archive/claude ref/ui wireframe.md`)

**Example**: http://localhost:3002/video/mock-job-001

⚠️ **If `VIDEO_WORKER_URL` is set**, `/video/mock-job-001` will 404. Use the real job ID from the create script output.

### Real Data (1531 Home Park Dr, Allen TX)

Use real realtor image, floorplan, and Zillow listing:

1. **Assets**: `apps/worker/assets/realtor-avatar.png`, `apps/worker/assets/1531-home-park-floorplan.png`
2. **Start worker**: `cd apps/worker && PORT=3001 npx tsx src/index.ts`
3. **Start rensto-site**: `VIDEO_WORKER_URL=http://localhost:3001 pnpm dev`
4. **Create job**: `cd apps/worker && WORKER_URL=http://localhost:3001 npx tsx tools/create-1531-home-park-job.ts`
5. **View**: `http://localhost:3002/video/<JOB_ID>` — use the **exact** ID printed by the create script (copy-paste, no typos).
6. **Verify in browser** — agent must open the URL in browser before handoff; user should see real data (1531 Home Park Dr, Allen TX), not mock.

**Example run (2026-02-13)**: Job `68fc0ba2-4415-4841-a7a9-b47288b38b43` → `http://localhost:3002/video/68fc0ba2-4415-4841-a7a9-b47288b38b43`. Real address displayed. Status FAILED = pipeline/credits issue, not frontend.

### With Real Worker (Deployed)

Set `VIDEO_WORKER_URL` in `.env.local` (or Vercel) to your worker’s public URL. The API will proxy job requests to the worker.

---

## 3. B.L.A.S.T. Alignment

| Phase | Action |
|-------|--------|
| **B**lueprint | NotebookLM 0baf5f36, REFERENCE_VS_REALITY, Product Bible |
| **L**ink | VIDEO_WORKER_URL, DB, R2, Kie |
| **A**rchitect | `VideoGeneration.tsx`, `/api/video/jobs/[id]` |
| **S**tylize | Wireframes design system; Rensto brand (#fe3d51, #1eaef7); Stitch/21dev elements as needed |
| **T**rigger | Deploy to Vercel; verify VIDEO_WORKER_URL in prod |

---

## 4. Design Sources

- **Wireframes**: `apps/worker/legacy_archive/claude ref/ui wireframe.md` — TourReel screens, tokens, components
- **Rensto brand**: `docs/reference/brand/`, .cursorrules — primary #fe3d51, accent #1eaef7
- **Stitch + AntiGravity**: [NotebookLM 286f3e4a](https://notebooklm.google.com/notebook/286f3e4a-a3a2-40ab-9c45-d198e91b27f4) — design-first, MCP, prompt-to-code

**Don’t redesign from scratch.** Use Rensto design; optimize and adjust. For new elements (e.g. 21dev), get components and integrate.

---

## 5. Agent Checklist (Pre-Handoff)

Before sharing the video URL with a user:

- [ ] Worker running (if using real data)
- [ ] rensto-site running with correct `VIDEO_WORKER_URL`
- [ ] Job created (if real data); copy exact ID from script output
- [ ] **Open the page in the browser** — no console "Failed to fetch job"
- [ ] If error appears, fix and re-verify

## 6. What to Share When Debugging

When you see issues:

- URL you opened
- Screenshot or browser snapshot
- Console errors (F12 → Console)
- Job ID (if applicable)
- Any `VIDEO_WORKER_URL` / env notes
