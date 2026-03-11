---
wave: 3
depends_on: [PLAN-B-projects-api, PLAN-C-ui-update]
files_modified: []
autonomous: true
requirements: [R1.4, R1.5, R1.6]
---

# Plan D: Smoke Test + Commit

## Objective
Validate the complete Phase 1 implementation end-to-end before committing. Runs a sequence of programmatic API checks (no browser required), confirms DB state, confirms TypeScript compiles, then creates the git commit.

This plan has no file modifications — it is purely verification + git hygiene.

## Tasks

<task id="1">
Run the TypeScript compiler check to confirm zero type errors across the changed files:

```bash
cd /Users/shaifriedman/superseller/apps/web/superseller-site && npx tsc --noEmit 2>&1 | tail -20
```

Expected output: no errors. If errors exist, fix them before continuing.
</task>

<task id="2">
Confirm all 8 new tables exist in the database:

```bash
cd /Users/shaifriedman/superseller/apps/web/superseller-site && \
  npx prisma db execute --stdin <<'SQL'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'Project', 'ProjectMilestone', 'ProjectTask',
    'AuditTemplate', 'AuditSection', 'AuditItem',
    'AuditInstance', 'AuditResponse'
  )
ORDER BY table_name;
SQL
```

Expected: 8 rows returned. If fewer, re-run `npx prisma db push` from `apps/web/superseller-site/`.
</task>

<task id="3">
Confirm `ServiceInstance` and `WhatsAppInstance` have the new nullable `projectId` column:

```bash
cd /Users/shaifriedman/superseller/apps/web/superseller-site && \
  npx prisma db execute --stdin <<'SQL'
SELECT table_name, column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('ServiceInstance', 'WhatsAppInstance')
  AND column_name = 'projectId';
SQL
```

Expected: 2 rows, both with `is_nullable = YES`.
</task>

<task id="4">
Smoke test the Projects API with a create → read → update → delete cycle. Start the dev server if not already running, OR run against the deployed Vercel preview if available.

Using `curl` against the local dev server (assumes it is running on port 3002):

```bash
# CREATE
curl -s -X POST http://localhost:3002/api/admin/projects \
  -H "Content-Type: application/json" \
  -b "session=<admin-session-token>" \
  -d '{"name":"Smoke Test Project","type":"internal","status":"planning"}' \
  | python3 -m json.tool
```

Capture the returned `id`. Then:

```bash
# READ — verify stats are present
curl -s http://localhost:3002/api/admin/projects \
  -b "session=<admin-session-token>" \
  | python3 -m json.tool
```

Verify `stats.upcoming` is at least 1.

```bash
# UPDATE
curl -s -X PATCH http://localhost:3002/api/admin/projects \
  -H "Content-Type: application/json" \
  -b "session=<admin-session-token>" \
  -d '{"id":"<captured-id>","status":"in_progress","progress":10}' \
  | python3 -m json.tool
```

```bash
# DELETE
curl -s -X DELETE "http://localhost:3002/api/admin/projects?id=<captured-id>" \
  -b "session=<admin-session-token>" \
  | python3 -m json.tool
```

All four should return `{ "success": true, ... }`.

Note: If the dev server is not running and cannot be started in this session, skip the curl tests and note that API smoke tests are deferred to manual verification after deploy. The TypeScript and DB checks in tasks 1-3 are the critical gate.
</task>

<task id="5">
Stage and commit all Phase 1 changes:

```bash
cd /Users/shaifriedman/superseller && \
  git add \
    apps/web/superseller-site/prisma/schema.prisma \
    apps/web/superseller-site/src/app/api/admin/projects/route.ts \
    apps/web/superseller-site/src/app/api/admin/audits/route.ts \
    apps/web/superseller-site/src/app/api/admin/audits/[instanceId]/responses/route.ts \
    apps/web/superseller-site/src/components/admin/ProjectManagement.tsx && \
  git commit -m "$(cat <<'EOF'
feat(admin): Phase 1 data foundation — real Project + Audit models

- Add 8 Prisma models: Project, ProjectMilestone, ProjectTask,
  AuditTemplate, AuditSection, AuditItem, AuditInstance, AuditResponse
- Add optional projectId FK to ServiceInstance + WhatsAppInstance
- Replace fake ServiceInstance/WhatsAppInstance synthesis in
  GET /api/admin/projects with real Project table queries
- Add POST/PATCH/DELETE to /api/admin/projects (full CRUD, R1.4)
- Stats (active/blocked/completed/upcoming) calculated from DB groupBy
  — no hardcoded numbers (R1.6)
- Add /api/admin/audits and /api/admin/audits/[instanceId]/responses
  routes for the audit template system (R2.1–R2.3)
- Update ProjectManagement.tsx: live stats from API, type badge,
  owner field, safe dueDate formatting (R1.5, R1.6)

Closes: R1.1, R1.2, R1.3, R1.4, R1.5, R1.6, R2.1, R2.2, R2.3

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```
</task>

<task id="6">
Push to origin:

```bash
cd /Users/shaifriedman/superseller && git push origin main
```

Auto-deploy via `deploy-main-site.yml` will trigger on push. Monitor at https://vercel.com/dashboard.
</task>

## Verification
- [ ] `npx tsc --noEmit` exits 0
- [ ] 8 new tables present in DB
- [ ] `ServiceInstance` and `WhatsAppInstance` have nullable `projectId`
- [ ] CRUD cycle on `/api/admin/projects` all return `success: true`
- [ ] `git log --oneline -1` shows the Phase 1 commit
- [ ] `git push` exits 0 and Vercel deploy triggers

## must_haves
- All Phase 1 requirements (R1.1–R1.6, R2.1–R2.3) are verified before the commit is created
- Commit message references all closed requirements
- No unstaged changes remain after commit (`git status` is clean for Phase 1 files)
- Push to origin so GitHub is updated — no untracked work left in working tree
