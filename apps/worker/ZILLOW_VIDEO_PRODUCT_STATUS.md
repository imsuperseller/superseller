# Zillow-to-Video Product Status — What Exists, What's Missing, What to Do

> **For pipeline fixes (pathway, realtor consistency, selective regen)**: See `TOURREEL_REALTOR_HANDOFF_SPEC.md`.

## 1. Links

### Product page (direct link, no clientId needed)
- **URL**: `https://superseller.agency/video/{jobId}`
- **Example**: https://superseller.agency/video/3e91b3e9-e6d1-4ce8-9417-f772fd4e0070
- **Requires**: `VIDEO_WORKER_URL` set in Vercel env → your worker's public URL. Without it, the page loads but shows "Video worker not configured."

### Dashboard video tab
- **URL**: `https://superseller.agency/dashboard/{clientId}/video?jobId={jobId}`

### Example video (raw R2 output from completed job)
- https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/c60b6d2f-856d-49fd-8737-7e1fee3fa848/3e91b3e9-e6d1-4ce8-9417-f772fd4e0070/master.mp4

---

## 2. Current State

| Component | Status | Where |
|-----------|--------|-------|
| **Pipeline (backend)** | Code complete, in repo | `apps/worker/` — runs on RackNerd (172.245.56.50) or locally |
| **Video dashboard (UI)** | Code exists | `apps/web/superseller-site/.../video/`, `/video/create` |
| **Create-job flow** | UI at `/video/create` + API | `POST /api/jobs/from-zillow` — worker must be running |
| **Worker deployment** | Deployed on RackNerd | Redis, Postgres, R2, Kie API required |

---

## 3. Architecture: Same or New Projects?

| Question | Answer |
|----------|--------|
| Same GitHub project? | **Yes.** Everything stays in `imsuperseller/superseller`. |
| New GitHub project? | **No.** Monorepo is correct. |
| Same Vercel project? | **Yes for the site.** superseller.agency = `apps/web/superseller-site/`. |
| Worker on Vercel? | **No.** The worker is Express + BullMQ + long jobs. Vercel serverless is not suitable. It needs a separate host (RackNerd, Railway, Render). |
| New Vercel project for worker? | **No.** The worker is not a Vercel app. |

---

## 4. What Needs to Happen (in order)

1. **Commit and push the video dashboard**  
   - `apps/web/superseller-site/src/app/dashboard/[clientId]/video/page.tsx`  
   - `apps/web/superseller-site/src/components/dashboard/VideoGeneration.tsx`  

2. **Add API proxy in superseller-site**  
   - Create `/api/video/jobs/[id]` (and optional `/api/video/jobs/from-zillow`) that forwards to the worker.  
   - Dashboard proxies to worker via VIDEO_WORKER_URL. Local: `http://localhost:3001`; RackNerd: `http://172.245.56.50:3002`. See PORT_REFERENCE.md.  

3. **Deploy the worker**  
   - Deploy `apps/worker` to RackNerd, Railway, or Render.  
   - Expose a public URL (e.g. `https://worker.superseller.agency` or `https://superseller-video.railway.app`).  

4. **Configure env vars**  
   - In superseller-site: `VIDEO_WORKER_URL` (or similar) for the proxy.  
   - In worker: Postgres, Redis, R2, Kie API.  

5. **Add create-job UI (optional)**  
   - Form: “Paste Zillow URL” → calls proxy → creates job → redirects to `/dashboard/{clientId}/video?jobId=...`  

---

## 5. Summary

- **Video link (example)**: Use the R2 URL above.  
- **Product page**: Not on superseller.agency yet. Must be committed and deployed.  
- **Same repo, same Vercel** for the site. Worker is separate infra.
