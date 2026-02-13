# Zillow-to-Video Product Status — What Exists, What's Missing, What to Do

> **For pipeline fixes (pathway, realtor consistency, transitions)**: See `TOURREEL_STATUS_AND_FIXES.md`.

## 1. Links

### Product page (direct link, no clientId needed)
- **URL**: `https://rensto.com/video/{jobId}`
- **Example**: https://rensto.com/video/3e91b3e9-e6d1-4ce8-9417-f772fd4e0070
- **Requires**: `VIDEO_WORKER_URL` set in Vercel env → your worker's public URL. Without it, the page loads but shows "Video worker not configured."

### Dashboard video tab
- **URL**: `https://rensto.com/dashboard/{clientId}/video?jobId={jobId}`

### Example video (raw R2 output from completed job)
- https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/c60b6d2f-856d-49fd-8737-7e1fee3fa848/3e91b3e9-e6d1-4ce8-9417-f772fd4e0070/master.mp4

---

## 2. Current State

| Component | Status | Where |
|-----------|--------|-------|
| **Pipeline (backend)** | Code complete, in repo | `apps/worker/` — runs on your server, NOT on rensto.com |
| **Video dashboard (UI)** | Code exists, **not committed** | `apps/web/rensto-site/.../video/`, `VideoGeneration.tsx` |
| **Create-job flow** | No UI. API exists in worker. | `POST /api/jobs/from-zillow` — callable only when worker is running |
| **Worker deployment** | Not deployed | Must run on RackNerd, Railway, or similar (Redis, Postgres, R2, Kie API) |

---

## 3. Architecture: Same or New Projects?

| Question | Answer |
|----------|--------|
| Same GitHub project? | **Yes.** Everything stays in `imsuperseller/rensto`. |
| New GitHub project? | **No.** Monorepo is correct. |
| Same Vercel project? | **Yes for the site.** rensto.com = `apps/web/rensto-site/`. |
| Worker on Vercel? | **No.** The worker is Express + BullMQ + long jobs. Vercel serverless is not suitable. It needs a separate host (RackNerd, Railway, Render). |
| New Vercel project for worker? | **No.** The worker is not a Vercel app. |

---

## 4. What Needs to Happen (in order)

1. **Commit and push the video dashboard**  
   - `apps/web/rensto-site/src/app/dashboard/[clientId]/video/page.tsx`  
   - `apps/web/rensto-site/src/components/dashboard/VideoGeneration.tsx`  

2. **Add API proxy in rensto-site**  
   - Create `/api/video/jobs/[id]` (and optional `/api/video/jobs/from-zillow`) that forwards to the worker.  
   - Today the dashboard calls `http://localhost:3002` directly; that only works locally.  

3. **Deploy the worker**  
   - Deploy `apps/worker` to RackNerd, Railway, or Render.  
   - Expose a public URL (e.g. `https://worker.rensto.com` or `https://rensto-video.railway.app`).  

4. **Configure env vars**  
   - In rensto-site: `VIDEO_WORKER_URL` (or similar) for the proxy.  
   - In worker: Postgres, Redis, R2, Kie API.  

5. **Add create-job UI (optional)**  
   - Form: “Paste Zillow URL” → calls proxy → creates job → redirects to `/dashboard/{clientId}/video?jobId=...`  

---

## 5. Summary

- **Video link (example)**: Use the R2 URL above.  
- **Product page**: Not on rensto.com yet. Must be committed and deployed.  
- **Same repo, same Vercel** for the site. Worker is separate infra.
