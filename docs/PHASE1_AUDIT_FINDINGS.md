# Phase 1 Documentation Audit - Findings
**Date:** 2026-02-24
**Scope:** Contradiction detection, duplicate content, stale references

---

## 🚨 Critical Issues

### 1. Stale System References (Deprecated Tech)
**Impact:** Misleading AI agents, wasted time searching deprecated systems

| System | Status | Files Mentioning | Action Required |
|--------|--------|------------------|-----------------|
| **Firestore** | RETIRED Feb 2026 | **90 files** | Purge or mark DEPRECATED |
| **Webflow** | RETIRED | **149 files** | Purge all references |
| **Airtable.com** | RETIRED | 0 files ✓ | None (clean) |

**Root Cause:** Archive folders contain stale docs that still mention old systems.

**Fix:**
- Delete `docs/archive/legacy_2025/` entirely (30+ files with Firestore)
- Add DEPRECATED banner to remaining Firestore references
- Purge Webflow from all skills and templates

---

### 2. Missing Source-of-Truth Files
**Impact:** No canonical reference for critical systems

| File | Purpose | Status |
|------|---------|--------|
| `docs/API_CONTRACTS.md` | Route inventory, types, auth | ❌ MISSING |
| `docs/DATA_DICTIONARY.md` | Schema truth, sync rules | ✓ EXISTS |
| `docs/INFRA_SSOT.md` | Infrastructure | ✓ EXISTS |
| `docs/PRODUCT_BIBLE.md` | Product specs | ✓ EXISTS |

**Fix:** Create `docs/API_CONTRACTS.md` from `/api-contracts` skill

---

### 3. Port Configuration Conflicts
**Impact:** Unclear which port to use (local vs RackNerd)

**Conflicting Sources:**
- `CLAUDE.md`: "site 3002, worker 3001 (local both) or 3002 (RackNerd)"
- `brain.md`: "3001=worker (local both), 3002=site, RackNerd worker :3002"
- `agent-behavior.md`: "port 3002 (RackNerd). Local: PORT=3001 when site on 3002"
- `docs/templates/tourreel/IMPLEMENTATION_SPEC.md`: "PORT=3001"

**Truth:** (From deployed reality)
- **Local**: Worker=3001, Site=3002
- **RackNerd**: Worker=3002, Site=N/A (site is on Vercel)

**Fix:** Update PORT_REFERENCE.md and consolidate references

---

## ⚠️ Duplicate Content (Violates DRY)

### FFmpeg Configuration
**12 files** mention FFmpeg setup (should be 1 location)

**Locations:**
- CLAUDE.md
- tourreel-pipeline/SKILL.md
- tourreel-pipeline/references/troubleshooting.md
- docs/templates/tourreel/IMPLEMENTATION_SPEC.md
- 8 other files

**Fix:** Consolidate to `INFRA_SSOT.md` §3 (FFmpeg), delete duplicates

---

### Kie.ai API
**11 files** mention Kie configuration (should be 1-2 locations)

**Fix:** Consolidate to:
1. `INFRA_SSOT.md` (operational config)
2. `tourreel-pipeline/references/api-deep-reference.md` (API patterns)

---

### Prisma/Drizzle Schema
**27 files** mention schema sync (massive duplication)

**Fix:** Consolidate to:
1. `DATA_DICTIONARY.md` (what lives where)
2. `database-management/references/schema-sync.md` (sync procedures)

---

## 📍 Critical Info Spread

### Infrastructure (RackNerd, servers, DBs)
- **SoT exists:** `docs/INFRA_SSOT.md` ✓
- **Problem:** 9 other files also mention RackNerd IP
- **Fix:** Delete duplicates, reference INFRA_SSOT only

### Product/Pricing
- **SoT exists:** `docs/PRODUCT_BIBLE.md` ✓
- **Problem:** 14 other files also mention pricing
- **Fix:** Delete duplicates, reference PRODUCT_BIBLE only

---

## 📋 Consolidation Roadmap

### Week 1: Purge
- [ ] Delete `docs/archive/legacy_2025/` (Firestore/old agent docs)
- [ ] Purge Webflow references from all files
- [ ] Delete duplicate FFmpeg/Kie/Schema content from skills

### Week 2: Consolidate
- [ ] Create `docs/API_CONTRACTS.md`
- [ ] Update `PORT_REFERENCE.md` with truth
- [ ] Move all infrastructure data to `INFRA_SSOT.md`
- [ ] Move all product data to `PRODUCT_BIBLE.md`

### Week 3: Enforcement
- [ ] Build `tools/doc-sentinel.ts` (drift detector)
- [ ] Update CLAUDE.md to ONLY route (no duplicate content)
- [ ] Update all skills to reference SoT docs (not inline duplication)

### Week 4: Validation
- [ ] Run doc-sentinel (should pass clean)
- [ ] Test AI agent with new doc (should ask <3 questions)
- [ ] Archive old audits (PHASE_2.5, etc.) to `docs/archive/audits-completed/`

---

## Success Metrics (Post-Consolidation)

| Metric | Current | Target |
|--------|---------|--------|
| Files mentioning Firestore | 90 | 0 (or <5 marked DEPRECATED) |
| Files mentioning Webflow | 149 | 0 |
| Files mentioning FFmpeg | 12 | 2 (INFRA_SSOT + troubleshooting) |
| Files mentioning Kie | 11 | 2 (INFRA_SSOT + api-deep-reference) |
| Files mentioning RackNerd IP | 9 | 1 (INFRA_SSOT) |
| Missing SoT files | 1 | 0 |
| Port conflicts | 4 sources | 1 (PORT_REFERENCE) |
| AI questions per task | 10+ | <3 |

---

## Next Action
Run Week 1 purge tasks, then re-audit to measure progress.
