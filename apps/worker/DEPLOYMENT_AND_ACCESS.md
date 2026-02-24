# Zillow-to-Video: Where Things Are and How to Access

## 1. Architecture

| Component | Location in Repo | Where It Runs | URL (if applicable) |
|-----------|-----------------|---------------|----------------------|
| **rensto.com** (main site) | `apps/web/rensto-site/` | Vercel | https://rensto.com |
| **Video pipeline worker** | `apps/worker/` | Your server (RackNerd, Railway, etc.) | Backend process, no public URL |

## 2. rensto.com vs Video Pipeline

- **rensto.com** = Next.js marketing site + dashboard. Deployed by Vercel from `apps/web/rensto-site/`. Auto-deploys on push to `main` when Vercel is linked to `imsuperseller/rensto`.
- **Video pipeline** = Node.js worker in `apps/worker/`. Does NOT deploy to Vercel. Must be run on a server with Redis, Postgres, R2, Kie API, etc.

### What runs on Racknerd (The "Backstage")
When we deploy the video worker to RackNerd via the `deploy-to-racknerd.sh` script, it manages two critical system level configurations:

1. **PM2 (`tourreel-worker`)**: PM2 is a process manager for Node.js. It ensures your `video-pipeline.worker.ts` script runs endlessly in the background. If the server crashes and reboots, PM2 automatically restarts the worker. It guarantees 100% uptime for job processing on port `3002`.
2. **FFmpeg Auto-Updater Cron Job**: At exactly midnight every day, Linux runs `apps/worker/tools/update-ffmpeg.sh`. This pulls the newest `ffmpeg` and `ffprobe` static binaries from the internet. This ensures Kling 3.0's state-of-the-art compression codecs (like AV1) never panic your local server due to outdated binaries.

### Where to See the Pushed Work

#### GitHub (code)
- **Repo**: https://github.com/imsuperseller/rensto
- **Latest commit**: `4555169` — Zillow-to-video pipeline changes
- **Changed paths**: `apps/worker/*`, `brain.md`, `CLAUDE.md`, NotebookLM
- **Not changed**: `apps/web/rensto-site/*` — rensto.com is unchanged

### Vercel (rensto.com)
- **Dashboard**: https://vercel.com/dashboard
- **Project**: Select the project connected to `imsuperseller/rensto`
- **Deployments**: Each push to `main` triggers a new deployment
- **Build logs**: Deployment detail → "Building" → view logs

### Video pipeline (worker)
- Runs on your own infra, not Vercel.
- To run locally:
  ```bash
  cd apps/worker
  npm install
  npm run dev
  ```
- API base: Worker URL. Local (both run): `http://localhost:3001`. RackNerd: `http://172.245.56.50:3002`
- Test flow: `API_URL=http://localhost:3001 ADDRESS="<zillow_url>" npx tsx tools/e2e-from-zillow.ts` (see PORT_REFERENCE.md)

## 4. Email Issues — Likely Sources

| Source | What it sends | Where to fix |
|--------|----------------|--------------|
| **Vercel** | Build failed / deployment failed | Vercel Dashboard → Project → Deployments → failed deployment |
| **GitHub** | PR/branch notifications, workflow failures | GitHub repo → Actions (none present in this repo) |
| **Worker** | Logs/errors if you have alerting | Your server / monitoring setup |

## 5. Steps to Diagnose Email Issues

1. **Open the email** — check sender and subject (Vercel, GitHub, etc.).
2. **Vercel build failure**: Go to https://vercel.com → your rensto project → Deployments → click the failed one → open build logs.
3. **GitHub**: Repo → Actions — this repo has no workflows; GitHub emails would be for other events (PRs, issues, etc.).

---

**Commit `4555169`** did not touch `apps/web/rensto-site/`. So rensto.com deployments should behave the same as before. If the failing emails are from Vercel, they are likely from an earlier build or a different project.
