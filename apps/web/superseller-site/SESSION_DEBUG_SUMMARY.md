# Session Debug Summary — Video Tour & /video/create

**Date**: Feb 13, 2026  
**Goal**: Get a working video tour end-to-end. Run one test successfully.

---

## 1. Issues Fixed (In Order)

### 1.1 Hydration Error (ClientOnlySubtitle)
- **Symptom**: "Server rendered text didn't match client" — server `" "`, client `"Paste Zillow URL..."`
- **Cause**: `ClientOnlySubtitle` rendered different content on server vs client
- **Fix**: Removed `ClientOnlySubtitle`, use plain `<p>` with same text on both sides

### 1.2 Internal Server Error / White Page
- **Symptom**: White page "Internal Server Error"
- **Cause**: Root layout used `headers()` to get `x-pathname`; can fail in Next.js 16
- **Fix**: Removed `headers()` dependency; root layout renders `{children}` only

### 1.3 Page ↔ Error Page Flash
- **Symptom**: Flashing between page and error overlay
- **Cause**: `AppShell` used `usePathname()` — different server vs first client render → hydration mismatch
- **Fix**: Route groups — `(video)` and `(main)` so `/video/*` never hits `AppShell`
  - `app/(video)/layout.tsx` — minimal layout, server-rendered branch
  - `app/(main)/layout.tsx` — `AppShell` for all other routes
  - Root layout: `{children}` only

### 1.4 "Video worker not configured"
- **Symptom**: Form submit returns 503
- **Cause**: `VIDEO_WORKER_URL` not set
- **Fix**: Added to `.env.local`, added to Vercel (prod/preview/dev)

### 1.5 Vercel Token "Invalid"
- **Symptom**: `VERCEL_TOKEN` env var failed
- **Fix**: Use `--token "..."` flag instead: `vercel env ls --token "vcp_..."`

### 1.6 VIDEO_WORKER_URL Value
- **Symptom**: "e.g." placeholder — didn't know where worker runs
- **Fix**: RackNerd at `172.245.56.50`. Port 3001 taken by video-merge → worker on **3002**

### 1.7 Worker Not Deployed
- **Symptom**: User asked to run things, not get manual instructions
- **Fix**: SSH to RackNerd, deployed worker to `/opt/tourreel-worker`, pm2 on port 3002

### 1.8 `ssr: false` in Server Component (if seen)
- **Symptom**: "`ssr: false` is not allowed with `next/dynamic` in Server Components"
- **Cause**: Create page was a Server Component using `dynamic(..., { ssr: false })`
- **Fix**: Create page is now a Client Component (`"use client"`) importing `CreateVideoForm` directly

### 1.9 routes-manifest.json ENOENT
- **Symptom**: `ENOENT: .next/dev/routes-manifest.json` — corrupted `.next` after config change
- **Fix**: `rm -rf .next && pnpm dev`

### 1.10 EADDRINUSE :3002
- **Symptom**: "address already in use :::3002"
- **Fix**: `lsof -ti:3002 | xargs kill -9`

---

## 2. Current State

| Component | Status |
|-----------|--------|
| **Video worker** | ✅ Running on RackNerd 172.245.56.50:3002 (pm2) |
| **VIDEO_WORKER_URL** | ✅ `http://172.245.56.50:3002` in Vercel |
| **Route groups** | ✅ `(video)` and `(main)` committed |
| **Job created** | ✅ `920cea05-86f7-4983-b34f-a50b114aa5da` (1531 Home Park Dr) |
| **Production /video/[jobId]** | ⚠️ 404 — Vercel may not have latest deploy with route groups |
| **Local /video/[jobId]** | ✅ Works (real data from worker) |

### End-to-End Test Result (Feb 13, 2026)

- **Create page**: ✅ `/video/create` loads, form visible
- **Job page**: ✅ `/video/920cea05-86f7-4983-b34f-a50b114aa5da` loads real data (address, status, workflow)
- **Pipeline**: ⚠️ Job **FAILED** at Analysis with "Insufficient Credits" — worker and UI are wired correctly; credits/billing is the next blocker for full video output

---

## 3. Run One Full Test

### Option A: Local (recommended)

```bash
# Terminal 1 — ensure VIDEO_WORKER_URL points to RackNerd
cd apps/web/superseller-site
# In .env.local: VIDEO_WORKER_URL=http://172.245.56.50:3002
lsof -ti:3002 | xargs kill -9
rm -rf .next && pnpm dev

# Terminal 2 — job already created
# Job ID: 920cea05-86f7-4983-b34f-a50b114aa5da
# Open: http://localhost:3002/video/920cea05-86f7-4983-b34f-a50b114aa5da
```

### Option B: Create new job via form

1. Open http://localhost:3002/video/create
2. Paste: `https://www.zillow.com/homedetails/1531-Home-Park-Dr-Allen-TX-75002/26651378_zpid/`
3. Add realtor photo (optional): `apps/worker/assets/realtor-avatar.png`
4. Submit → redirects to `/video/[jobId]`

### Option C: Production (after Vercel redeploys)

- Trigger Vercel redeploy so route groups (`(video)/video/[jobId]`) are live
- Then: https://superseller.agency/video/920cea05-86f7-4983-b34f-a50b114aa5da

---

## 4. Files Touched

- `src/app/layout.tsx` — removed headers(), AppShell; `{children}` only
- `src/app/(main)/layout.tsx` — new, wraps in AppShell
- `src/app/(video)/layout.tsx` — new, minimal
- `src/app/(video)/video/` — moved from `src/app/video/`
- `src/app/(main)/` — moved all other routes
- `src/components/AppShell.tsx` — simplified (no pathname check)
- `src/app/video/create/page.tsx` → `(video)/video/create/page.tsx`

---

## 5. Worker Deployment (RackNerd)

- Path: `/opt/tourreel-worker/apps/worker`
- Port: 3002 (3001 used by video-merge)
- pm2: `tourreel-worker`
- Health: http://172.245.56.50:3002/api/health
