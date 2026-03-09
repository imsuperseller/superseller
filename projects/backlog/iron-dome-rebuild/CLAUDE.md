# Backlog: Iron Dome OS Pipeline Rebuild

> **Status**: BROKEN — 3 Aitable tables deleted Mar 5, 2026
> **Owner**: Project 4 (Infrastructure) + Project 5 (Social & Content)
> **Decision needed**: Shai to decide priority and approach

---

## What This Is

Iron Dome OS was Shai's personal brand intelligence dashboard. It lived at https://iron-dome-os.vercel.app and showed metrics from various data sources.

The pipeline that fed it was: n8n → Aitable (3 tables that were deleted during the Mar 5 cleanup).

---

## What's Broken

3 Aitable tables were deleted Mar 5, 2026 as part of the codebase cleanup. These tables fed the Iron Dome dashboard. The dashboard is now showing empty data.

---

## Rebuild Options

### Option A: Rebuild in Aitable (same structure)
- Re-create the 3 deleted tables in Aitable
- Point n8n workflows back to them
- Faster but keeps dependency on Aitable (which is "dashboard only" per CLAUDE.md)
- Estimate: 2-3 hours

### Option B: Migrate to PostgreSQL (correct architecture)
- Create tables in PostgreSQL
- Migrate n8n workflows to write to Postgres instead of Aitable
- Consistent with "PostgreSQL is the only transactional DB truth" rule
- Estimate: 1 day

### Option C: Replace n8n with Antigravity (proper approach)
- Build the pipeline in the worker (Antigravity)
- PostgreSQL for storage
- Proper scheduling via BullMQ
- Estimate: 2-3 days

---

## Decision Needed From Shai

1. Is Iron Dome OS still needed / important?
2. Which rebuild option? (Recommend Option B as minimum, Option C if time allows)
3. What data sources should feed it? (Same as before, or expanded?)
