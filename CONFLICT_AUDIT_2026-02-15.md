# Conflict Audit — Feb 15, 2026

**Purpose**: Thorough verification of conflicts before work. Run this when asked "do you have conflicts?" — do not confirm without executing.

---

## 0. Methodology (Single System)

| Check | Result |
|-------|--------|
| METHODOLOGY.md exists | Single SSOT for B.L.A.S.T. vs Agent Behavior |
| brain.md HALT scoped to Protocol 0 | Routine tasks use Agent Behavior, no HALT |
| .cursorrules points to METHODOLOGY.md | ✓ |

**Rule**: B.L.A.S.T. = new projects. Agent Behavior = routine tasks. No conflict.

---

## 1. Git

| Check | Result |
|-------|--------|
| Merge/rebase in progress | None |
| Unresolved conflict markers | None |
| `git diff --check` | Clean |

---

## 2. Ports & Process

**SSOT**: [PORT_REFERENCE.md](PORT_REFERENCE.md)

| Service | Default Port | Conflict |
|---------|--------------|----------|
| rensto-site (Next.js) | 3002 | — |
| Worker | 3002 | **CONFLICT** when both run locally |

**Local dev (both running)**: Worker must use `PORT=3001`. rensto-site keeps 3002.

**run-smoke.ts**:
- Hits worker routes: `/api/dev/ensure-test-user`, `/api/jobs/from-zillow`, `/api/jobs/:id`
- rensto-site has `/api/video/jobs/*` (proxies to worker) — different path
- **API_URL must point to worker**, not rensto-site
- Local: `API_URL=http://localhost:3001` (worker on 3001)
- RackNerd: `API_URL=http://172.245.56.50:3002`

Default `API_URL=http://localhost:3002` fails when worker runs on 3001 (hits site which lacks `/api/dev/`, `/api/jobs/`).

---

## 3. Doc / Spec

| Doc | Status |
|-----|--------|
| PIPELINE_SPEC.md | Migrated → TOURREEL_REALTOR_HANDOFF_SPEC |
| TOURREEL_STATUS_AND_FIXES.md | Migrated |
| All refs | Point to TOURREEL_REALTOR_HANDOFF_SPEC or say "migrated" |
| PIPELINE_RESEARCH_OUTPUT §1.2 | Has "Veo 3.1 Parameters" — **add deprecation**: Veo retired |
| implementation specs.md (legacy) | Has "IGNORE FAL/Veo" notice ✅ |

---

## 4. Config & Env

| Item | Notes |
|------|-------|
| worker config.app.url | 3001 (worker) |
| worker config.app.apiUrl | 3002 (site/API) |
| VIDEO_WORKER_URL | Set in Vercel; rensto-site proxies to worker |
| DATABASE_URL | Shared Postgres (rensto-site Prisma, worker Drizzle) |
| REDIS_URL | Shared for BullMQ; worker+site must use same Redis when both run locally |

---

## 5. BullMQ Retries (Fixed)

- **Was**: Failed jobs retried 3× (30s, 60s, 120s) → repeated Kie.ai charges
- **Fix**: UnrecoverableError for Insufficient Credits, Listing not found, No clip prompts
- **Status**: Deployed to RackNerd

---

## 6. Preflight

```
cd apps/worker && npx tsx tools/run-preflight.ts --free
```

Must pass (Postgres, Redis, FFmpeg) before smoke or video test.

---

## 7. Before Next Video Test

1. Preflight --free ✅
2. Deploy worker if testing RackNerd: `./apps/worker/deploy-to-racknerd.sh`
3. Local: `PORT=3001 npx tsx src/index.ts` (worker), `pnpm dev` (site 3002)
4. Smoke: `API_URL=http://localhost:3001 npx tsx tools/run-smoke.ts` (local) or `API_URL=http://172.245.56.50:3002` (RackNerd)

**Full port matrix**: [PORT_REFERENCE.md](PORT_REFERENCE.md)
5. Ensure test user has credits: `npx tsx tools/set-test-user-credits.ts`

---

*Run this audit when asked "do you have conflicts?" — execute checks, do not guess.*
