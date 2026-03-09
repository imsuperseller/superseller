# Vercel Project Map — SSOT for Domain → Deploy

**Last Updated**: March 2026
**Purpose**: Single source of truth for which Vercel project owns which domains, how deploys work, and where the code lives.

---

## Domain → Project

| Domain(s) | Vercel Project Name | Root Directory | Auto-deploy on push? | Linked to GitHub? |
|-----------|---------------------|----------------|----------------------|-------------------|
| superseller.agency, www.superseller.agency, admin.superseller.agency | **superseller-site** (Vercel name: rensto-site) | `apps/web/superseller-site` | **Yes** — `.github/workflows/deploy-main-site.yml` on push to main | Yes |
| api.superseller.agency | **api-superseller-site** (Vercel name: api-rensto-site) | `apps/web/superseller-site` | **Yes** — Git push → deploy | Yes |

**Note**: Vercel project slugs are `rensto-site` and `api-rensto-site` (Vercel doesn't allow renaming project slugs). Both serve SuperSeller domains exclusively.

**Note**: `admin.superseller.agency` is served by the main project. Middleware rewrites requests to `/admin/*`. The stale `superseller-admin` project was removed Feb 2026.

**Removed projects**: `superseller` (superseller.vercel.app) and `studio` (apps/studio) Vercel projects do not exist. Do not reference them.

**Both projects build the same app** from the same path. Different projects exist for domain separation (main vs API subdomain).

---

## Deploy Runbook

### After changes to superseller-site (main site, video, marketplace)

1. Push to `main` — deploys **api.superseller.agency** (deploy-api.yml) and **superseller.agency** (deploy-main-site.yml).
2. **Manual deploy**: From **repo root** (NOT from `apps/web/superseller-site/`): `vercel --prod`. The `.vercel/project.json` at repo root points to `rensto-site` (`prj_AKC4gUSm2EWNj3RR8Cou4cILHYxp`), which owns all custom domains.
3. **CRITICAL**: The `rensto-site` Vercel project has `rootDirectory: apps/web/superseller-site` configured. Running `vercel --prod` from inside `apps/web/superseller-site/` will cause a double-path error. Always deploy from repo root.

### After changes to worker or other apps

- Worker: `./apps/worker/deploy-to-racknerd.sh`
- No Vercel involvement for worker.

---

## Critical Notes

- **superseller.agency 404 on /video** (fixed Feb 2026): Caused by middleware blocking `/video/*` on superseller.agency host. **Not** caused by root directory. See `findings.md` and `VIDEO_QUALITY_AUDIT.md`.
- **api.superseller.agency** = same Next.js app as superseller.agency; routes at `/api/*` work on both domains.
- **Vercel project slugs**: `rensto-site` and `api-rensto-site` (legacy slugs, can't be renamed in Vercel). Both are linked to GitHub and auto-deploy.

### Deploy unification (Phase 3)

**Current**: Push to main deploys both api.superseller.agency (deploy-api.yml) and superseller.agency (deploy-main-site.yml). Option B in effect.

**Options** (choose when ready):
- **A**: Add superseller.agency to api-superseller-site (one project, two domains) — single deploy on push
- **B**: Enable Git deploy for superseller-site so both projects deploy on push
- **C**: Keep manual; document in runbook (current)
