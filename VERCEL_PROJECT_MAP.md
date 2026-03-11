# Vercel Project Map — SSOT for Domain → Deploy

**Last Updated**: March 11, 2026
**Purpose**: Single source of truth for which Vercel project owns which domains, how deploys work, and where the code lives.

---

## Domain → Project

| Domain(s) | Vercel Project Name | Root Directory | Auto-deploy on push? |
|-----------|---------------------|----------------|----------------------|
| superseller.agency, www.superseller.agency, admin.superseller.agency, api.superseller.agency | **rensto-site** (legacy slug, can't rename) | `apps/web/superseller-site` | **Yes** — `.github/workflows/deploy-main-site.yml` |

**Note**: Vercel project slug is `rensto-site` (legacy name, Vercel doesn't allow renaming). It serves SuperSeller domains exclusively. The `api-rensto-site` project was deleted March 11, 2026 — all domains consolidated into one project.

**Note**: `admin.superseller.agency` is served by middleware rewrites to `/admin/*`.

---

## Deploy Runbook

### After changes to superseller-site

1. Push to `main` — auto-deploys all SuperSeller domains via `deploy-main-site.yml`.
2. **Manual deploy**: From **repo root** (NOT from `apps/web/superseller-site/`): `vercel --prod`. The `.vercel/project.json` at repo root points to `rensto-site`.
3. **CRITICAL**: The `rensto-site` Vercel project has `rootDirectory: apps/web/superseller-site` configured. Running `vercel --prod` from inside `apps/web/superseller-site/` will cause a double-path error. Always deploy from repo root.

### After changes to worker or other apps

- Worker: `./apps/worker/deploy-to-racknerd.sh`
- No Vercel involvement for worker.

---

## GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `VERCEL_TOKEN` | Vercel API token for SuperSeller deploys |
| `VERCEL_ORG_ID` | Vercel team ID (`team_a1gxSHNFg8Pp7qxoUN69QkVl`) |
| `MAIN_PROJECT_ID` | rensto-site project ID (`prj_AKC4gUSm2EWNj3RR8Cou4cILHYxp`) |

**Removed**: `API_PROJECT_ID` — no longer needed (api-rensto-site project deleted).

---

## Separation: SuperSeller vs Rensto

SuperSeller and Rensto are **separate businesses** sharing the same Vercel account (for now).

| | SuperSeller | Rensto |
|---|---|---|
| **Vercel project** | `rensto-site` (legacy slug) | `rensto` |
| **Domains** | superseller.agency, api/admin/www subdomains | rensto.com |
| **GitHub repo** | `imsuperseller/superseller` | `imsuperseller/rensto-app` |
| **Codebase** | `apps/web/superseller-site/` | `~/rensto - online directory/` (separate repo) |

**No shared code, no shared DB tables, no shared API calls.** Only shared: GitHub org + Vercel account.
