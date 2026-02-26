# Vercel Project Map — SSOT for Domain → Deploy

**Last Updated**: February 2026  
**Purpose**: Single source of truth for which Vercel project owns which domains, how deploys work, and where the code lives.

---

## Domain → Project

| Domain(s) | Vercel Project | Root Directory | Auto-deploy on push? |
|-----------|----------------|----------------|----------------------|
| superseller.agency, www.superseller.agency, admin.superseller.agency | **superseller-site** | `apps/web/superseller-site` | **No** — manual deploy |
| api.superseller.agency | **api-superseller-site** | `apps/web/superseller-site` | **Yes** — Git push → deploy |
| superseller.vercel.app | **superseller** | `apps/web/superseller-site` | No |
| studio.superseller.agency (pending DNS) | **studio** | `apps/studio` | **No** — manual `vercel --prod` |

**Note**: `admin.superseller.agency` is served by superseller-site. Middleware rewrites requests to `/admin/*`. The stale `superseller-admin` project was removed Feb 2026.

**Both superseller-site and api-superseller-site build the same app** from the same path. Different projects exist for domain separation (main vs API subdomain).

---

## Deploy Runbook

### After changes to superseller-site (main site, video, marketplace)

1. Push to `main` — this deploys **api.superseller.agency** only.
2. To update **superseller.agency**:
   - From repo root: `eval "$(grep -E '^VERCEL_TOKEN=' .env)" && vercel --prod`
   - Or: Vercel dashboard → superseller-site → Redeploy

### After changes to worker or other apps

- Worker: `./apps/worker/deploy-to-racknerd.sh`
- No Vercel involvement for worker.

---

## Critical Notes

- **superseller.agency 404 on /video** (fixed Feb 2026): Caused by middleware blocking `/video/*` on superseller.agency host. **Not** caused by root directory. See `findings.md` and `VIDEO_QUALITY_AUDIT.md`.
- **api.superseller.agency** = same Next.js app as superseller.agency; routes at `/api/*` work on both domains.
- **superseller** project: Currently only serves superseller.vercel.app. **Decision (Feb 2026)**: Treat as legacy/alternate. Do not use for production domains. If experiments needed, use superseller.vercel.app; main flows use superseller-site and api-superseller-site only.

### Deploy unification (Phase 3)

**Current**: Push to main deploys api.superseller.agency only. superseller.agency needs manual `vercel --prod` or Vercel API trigger.

**Options** (choose when ready):
- **A**: Add superseller.agency to api-superseller-site (one project, two domains) — single deploy on push
- **B**: Enable Git deploy for superseller-site so both projects deploy on push
- **C**: Keep manual; document in runbook (current)
