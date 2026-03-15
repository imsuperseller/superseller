---
phase: 15-tech-debt-fixes
plan: "01"
subsystem: onboarding-pipeline
tags: [admin-alerts, failure-handling, character-video-gen, whatsapp, tech-debt]
dependency_graph:
  requires: []
  provides: [admin-alerts-utility, character-video-gen-failure-alerts, admin-phone-fallback]
  affects: [apps/worker/src/services/admin-alerts.ts, apps/worker/src/services/onboarding/modules/character-video-gen.ts, apps/worker/src/services/onboarding/pipeline-state.ts, apps/worker/src/config.ts]
tech_stack:
  added: []
  patterns: [non-blocking-alert-utility, terminal-failure-wiring, env-var-fallback]
key_files:
  created:
    - apps/worker/src/services/admin-alerts.ts
  modified:
    - apps/worker/src/config.ts
    - apps/worker/src/services/onboarding/pipeline-state.ts
    - apps/worker/src/services/onboarding/modules/character-video-gen.ts
decisions:
  - "sendAdminAlert is non-blocking (catches all errors internally) to avoid masking primary failure path"
  - "admin.defaultPhone falls back to HEALTH_MONITOR_ALERT_PHONE so existing env vars work without changes"
  - "getPipelineState() called at each failure site to get current adminPhone override at time of failure"
metrics:
  duration_minutes: 10
  completed_date: "2026-03-15"
  tasks_completed: 2
  files_changed: 4
---

# Phase 15 Plan 01: Admin Alerts + Character Video Gen Failure Wiring Summary

**One-liner:** Non-blocking WhatsApp admin alert utility wired into all 5 terminal failure paths in character-video-gen, with ADMIN_PHONE env var fallback for pipeline state.

## What Was Built

### New: `apps/worker/src/services/admin-alerts.ts`

A reusable utility module providing two non-blocking functions:

- `sendAdminAlert(params)` — Sends a formatted WhatsApp message to the admin phone (from pipelineState or config.admin.defaultPhone fallback) on terminal pipeline failures. Never throws.
- `sendCustomerFailureMessage(groupId, module?)` — Sends a user-facing apology to the customer's WhatsApp group. Never throws.

### Modified: `apps/worker/src/config.ts`

Added `admin` section after `healthMonitor`:
```typescript
admin: {
    defaultPhone: process.env.ADMIN_PHONE || process.env.HEALTH_MONITOR_ALERT_PHONE || "",
},
```
Reuses existing `HEALTH_MONITOR_ALERT_PHONE` as fallback, so no new env var is required in production.

### Modified: `apps/worker/src/services/onboarding/pipeline-state.ts`

- Added `import { config } from "../../config"`
- `upsertPipelineState` now uses `config.admin.defaultPhone` as fallback when `updates.adminPhone` is not provided
- Logs a warning when the fallback is used

### Modified: `apps/worker/src/services/onboarding/modules/character-video-gen.ts`

Wired `sendAdminAlert` + `sendCustomerFailureMessage` into 5 terminal failure paths:

1. **CharacterBible not found (composition phase)** — was: silent return
2. **Remotion render failed (both attempts)** — was: broken `sendVideo(groupId, "", undefined)` call
3. **R2 upload failed (both attempts)** — was: silent logger.error + return
4. **CharacterBible not found (generation phase)** — was: silent return
5. **Insufficient scenes generated** — was: silent return

The broken `sendVideo(groupId, "", undefined)` call is fully removed.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Files created/modified:
- [x] apps/worker/src/services/admin-alerts.ts — exists
- [x] apps/worker/src/config.ts — contains `admin.defaultPhone`
- [x] apps/worker/src/services/onboarding/pipeline-state.ts — contains `config.admin.defaultPhone` fallback
- [x] apps/worker/src/services/onboarding/modules/character-video-gen.ts — 5 sendAdminAlert calls, 0 broken sendVideo calls

Commits:
- d76f627e feat(15-01): create admin-alerts utility and add ADMIN_PHONE config
- 0f0b9598 feat(15-01): wire failure alerts into character-video-gen terminal paths

TypeScript: `npx tsc --noEmit` — passed with 0 new errors.

## Self-Check: PASSED
