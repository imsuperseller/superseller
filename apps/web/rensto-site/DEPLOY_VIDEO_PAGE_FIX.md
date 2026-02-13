# Fix 404 on /video/[jobId] — Deployment Fix

## Problem
`https://rensto.com/video/{jobId}` returns 404 because the **rensto-site** Vercel project has **Root Directory: null** in the dashboard, while the Next.js app (with the `/video` route) lives in `apps/web/rensto-site/`.

The **api-rensto-site** project correctly uses `apps/web/rensto-site` as root. rensto-site (rensto.com) does not.

## Fix (choose one)

### Option 1: Update Root Directory in Vercel (recommended)
1. Open https://vercel.com → **rensto-site** project
2. **Settings** → **General**
3. Set **Root Directory** to: `apps/web/rensto-site`
4. Save
5. Trigger a redeploy: **Deployments** → latest → **⋯** → **Redeploy**

### Option 2: Deploy via CLI from correct directory
```bash
cd apps/web/rensto-site
vercel login   # if token invalid
vercel deploy --prod
```

### Option 3: Ensure Git deploy uses correct root
If rensto.com deploys from Git: connect the repo, set Root Directory to `apps/web/rensto-site`, push to main.

## After Deploy
- Product page: `https://rensto.com/video/{jobId}`
- Set `VIDEO_WORKER_URL` in Vercel (rensto-site) to your worker's public URL so the page can fetch job data. Without it, the page loads but shows "Video worker not configured."
