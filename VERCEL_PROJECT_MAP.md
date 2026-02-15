# Vercel Project Map — SSOT for Domain → Deploy

**Last Updated**: February 2026  
**Purpose**: Single source of truth for which Vercel project owns which domains, how deploys work, and where the code lives.

---

## Domain → Project

| Domain(s) | Vercel Project | Root Directory | Auto-deploy on push? |
|-----------|----------------|----------------|----------------------|
| rensto.com, www.rensto.com | **rensto-site** | `apps/web/rensto-site` | **No** — manual deploy |
| api.rensto.com | **api-rensto-site** | `apps/web/rensto-site` | **Yes** — Git push → deploy |
| rensto.vercel.app | **rensto** | `apps/web/rensto-site` | No |

**Both rensto-site and api-rensto-site build the same app** from the same path. Different projects exist for domain separation (main vs API subdomain).

---

## Deploy Runbook

### After changes to rensto-site (main site, video, marketplace)

1. Push to `main` — this deploys **api.rensto.com** only.
2. To update **rensto.com**:
   - From repo root: `eval "$(grep -E '^VERCEL_TOKEN=' .env)" && vercel --prod`
   - Or: Vercel dashboard → rensto-site → Redeploy

### After changes to worker or other apps

- Worker: `./apps/worker/deploy-to-racknerd.sh`
- No Vercel involvement for worker.

---

## Critical Notes

- **rensto.com 404 on /video** (fixed Feb 2026): Caused by middleware blocking `/video/*` on rensto.com host. **Not** caused by root directory. See `findings.md` and `VIDEO_QUALITY_AUDIT.md`.
- **api.rensto.com** = same Next.js app as rensto.com; routes at `/api/*` work on both domains.
- **rensto** project: Currently only serves rensto.vercel.app. **Decision (Feb 2026)**: Treat as legacy/alternate. Do not use for production domains. If experiments needed, use rensto.vercel.app; main flows use rensto-site and api-rensto-site only.

### Deploy unification (Phase 3)

**Current**: Push to main deploys api.rensto.com only. rensto.com needs manual `vercel --prod` or Vercel API trigger.

**Options** (choose when ready):
- **A**: Add rensto.com to api-rensto-site (one project, two domains) — single deploy on push
- **B**: Enable Git deploy for rensto-site so both projects deploy on push
- **C**: Keep manual; document in runbook (current)
