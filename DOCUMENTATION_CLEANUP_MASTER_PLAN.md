# 📚 DOCUMENTATION CLEANUP MASTER PLAN

**Date**: October 5, 2025
**Problem**: Documentation chaos - 739 MD files, multiple sources of truth, outdated info, conflicts
**Goal**: Single source of truth, clear hierarchy, easy maintenance

---

## 🔍 CURRENT STATE ANALYSIS

### **Documentation Inventory**:

| Location | Count | Status | Action |
|----------|-------|--------|--------|
| **Root** | 3 | Mixed | Keep CLAUDE.md, archive others |
| **Archives** | 296 | Outdated | Already archived, verify no dependencies |
| **Docs/** | 425 | Mixed | Audit, consolidate, delete 80% |
| **/tmp Reports** | 7 | Today's work | Review, integrate to CLAUDE.md, delete |
| **Workflows** | 2 | Current | Keep |
| **Apps** | 4 | Current | Keep |
| **Customers** | 1 | Current | Keep |
| **Projects** | 1 | Unknown | Audit |
| **Live Systems** | 3 | Current | Keep |
| **TOTAL** | 739 | **CHAOS** | **CLEAN UP** |

---

## 🚨 CRITICAL ISSUES IDENTIFIED

### **Issue #1: Multiple "Master" Documents**
- `CLAUDE.md` - Claims to be "Single Source of Truth" (Last updated Oct 5 AM)
- `DOCUMENTATION_HIERARCHY.md` - I created today to establish hierarchy
- `README.md` - Project readme
- **Problem**: CLAUDE.md already outdated (says "payments not connected" but I fixed bug today)

### **Issue #2: 425 Files in /docs/**
- Too many to be useful
- Likely 80%+ outdated from past projects
- Examples: `BMAD_AIRTABLE_CLEANUP_MASTER_PLAN.md`, `BMAD_N8N_COMPLETE_VALIDATION_REPORT.md`
- **Problem**: Can't tell what's current without reading all 425

### **Issue #3: 7 Reports in /tmp**
- I created these today during audit
- Not integrated into CLAUDE.md
- Will be lost if /tmp clears
- **Problem**: Critical findings not persisted to source of truth

### **Issue #4: 296 Archived Files**
- Already in `/archives/conflicting-docs/` and `/archives/outdated-docs/`
- Good that they're archived, but still cluttering repo
- **Problem**: Could be deleted entirely or moved to separate repo

### **Issue #5: No Version Control on WEBFLOW_EMBED_*.html**
- 28 files at root, each ~985 lines
- No change log, no "last updated" header
- I created duplicate files in `/docs/webflow/` without realizing originals existed
- **Problem**: Can't tell what's deployed vs what's WIP

### **Issue #6: Multiple Documentation Sources**
- GitHub repo (739 MD files)
- Airtable (11 bases, some with documentation tables)
- Notion (3 databases, 80 records)
- My memory/context (not persistent)
- **Problem**: Information scattered, conflicting, hard to sync

---

## 🎯 CLEANUP STRATEGY

### **Phase 1: ESTABLISH SINGLE SOURCE OF TRUTH** ✅

**Decision**: `CLAUDE.md` is the master document

**Actions**:
1. ✅ Keep `CLAUDE.md` as master
2. ✅ Keep `DOCUMENTATION_HIERARCHY.md` to explain authority levels
3. ✅ Keep `README.md` for GitHub visitors
4. ⏳ Update `CLAUDE.md` with today's changes:
   - ✅ customerEmail bug fixed
   - ✅ Stripe integration ready
   - ⚠️ Webflow deployment pending
   - ⚠️ 28 WEBFLOW_EMBED files are deployed pages (not embeds)

---

### **Phase 2: CONSOLIDATE /TMP REPORTS** ⏳

**Current Reports**:
1. `COMPREHENSIVE_AUDIT_FULL_REPORT.md` - Today's full audit (500+ lines)
2. `COMPREHENSIVE_AUDIT_PHASE1_FINDINGS.md` - Critical bug findings
3. `STRIPE_INTEGRATION_COMPLETE.md` - Stripe implementation report
4. `STRIPE_INTEGRATION_CORRECT_PLAN.md` - Implementation plan
5. `N8N_WORKFLOW_AUDIT_REPORT.md` - n8n workflows status
6. `RENSTO_MASTER_STRATEGIC_ASSESSMENT.md` - Strategic assessment
7. `RENSTO_WEBSITE_AUDIT_REPORT.md` - Website audit

**Actions**:
1. ⏳ Extract key findings from all 7 reports
2. ⏳ Update CLAUDE.md sections:
   - Implementation Status (mark customerEmail bug as FIXED)
   - Critical Gaps (update with audit findings)
   - Service Offerings (mark Marketplace/Subscriptions as 80% ready)
3. ⏳ Move reports to `/docs/audits/2025-10-05/` for historical reference
4. ⏳ Delete from /tmp

---

### **Phase 3: AUDIT /DOCS/ FOLDER** ⏳

**Strategy**: Delete 80%, keep 20% current docs

**Categorization**:
- **KEEP** - Current, referenced, useful
- **ARCHIVE** - Historical value but outdated
- **DELETE** - Completely outdated, duplicated, irrelevant

**High-Priority Files to Review** (likely DELETE):
- `BMAD_AIRTABLE_CLEANUP_*` - Past cleanup attempts
- `BMAD_N8N_*` - Past n8n work
- `BMAD_BOOST_SPACE_*` - Boost.space experiments
- `BMAD_NOTION_*` - Past Notion sync work
- `HYPERISE_*` - Hyperise replacement work
- `VOICE_AI_*` - Voice AI planning (not implemented)
- `ESIGNATURES_*` - eSignatures planning (not implemented)

**Files to KEEP**:
- `BMAD_PROCESS_SPECIFIC.md` - Core methodology
- Architecture docs (if any)
- Active customer docs
- Current integration guides

**Action**:
1. ⏳ Create script to categorize by last modified date
2. ⏳ Auto-archive anything older than 30 days
3. ⏳ Manually review recent files (< 30 days)
4. ⏳ Target: Reduce 425 files → ~50 files

---

### **Phase 4: VERSION CONTROL WEBFLOW FILES** ⏳

**Problem**: 28 `WEBFLOW_EMBED_*.html` files with no version tracking

**Solution**: Add header to each file

**Template**:
```html
<!--
FILE: WEBFLOW_EMBED_SUBSCRIPTIONS.html
PURPOSE: Full Subscriptions landing page for Webflow
DEPLOYED: Yes - rensto.com/subscriptions
LAST UPDATED: 2025-10-05
VERSION: 2.1
CHANGES:
  - v2.1 (2025-10-05): Need to add Stripe checkout JavaScript
  - v2.0 (2025-09-15): Ryan Deiss CVJ optimization
  - v1.0 (2025-08-01): Initial creation
INTEGRATIONS: None yet (needs Stripe checkout)
DEPENDENCIES: None
RELATED FILES: None
-->
```

**Actions**:
1. ⏳ Create script to add version header to all 28 files
2. ⏳ Document which Webflow page each file maps to
3. ⏳ Add to `CLAUDE.md` → Section "WEBFLOW_EMBED Files Inventory"
4. ⏳ Delete duplicate files I created in `/docs/webflow/`

---

### **Phase 5: SYNC WITH AIRTABLE/NOTION** ⏳

**Current State**:
- Airtable: 11 bases, some with documentation
- Notion: 3 databases, 80 records (Business References, Customers, Projects)
- CLAUDE.md: References both as data sources

**Actions**:
1. ⏳ Verify CLAUDE.md accurately describes Airtable/Notion structure
2. ⏳ Check for doc references in Airtable (e.g., "Documentation" tables)
3. ⏳ If found, consolidate into CLAUDE.md
4. ⏳ Establish rule: **GitHub is source of truth for docs, Airtable/Notion for data**

---

### **Phase 6: DELETE ARCHIVES** 🗑️

**Current**: 296 files in `/archives/conflicting-docs/` and `/archives/outdated-docs/`

**Actions**:
1. ⏳ Verify no active code references these files
2. ⏳ Check if any contain critical info not in CLAUDE.md
3. ⏳ Move to separate `rensto-archives` repo OR delete entirely
4. ⏳ Keep only last 90 days of archives in main repo

---

### **Phase 7: ESTABLISH MAINTENANCE SYSTEM** 🔧

**Problem**: Without a system, chaos will return

**Solution**: Documentation Management Protocol

**Rules**:
1. **CLAUDE.md is master** - All significant changes must be reflected here
2. **No new root-level MD files** - Must go in appropriate subdirectory
3. **Weekly doc cleanup** - Every Monday, review files modified in past week
4. **Version headers required** - All HTML/significant files must have version header
5. **Before creating new doc** - Check if info belongs in CLAUDE.md instead
6. **Deprecation process** - Mark old docs with `[DEPRECATED - See CLAUDE.md]` header

**Enforcement**:
- Add pre-commit hook to check for new root-level MD files
- Add reminder in `.cursorrules` to update CLAUDE.md after major changes
- Create `/docs/README.md` explaining doc structure

---

## 📋 CLEANUP CHECKLIST

### **Immediate (Today)**:
- [x] Identify all documentation sources (THIS DOC)
- [ ] Update CLAUDE.md with today's bug fix
- [ ] Move /tmp reports to `/docs/audits/2025-10-05/`
- [ ] Add version headers to 3 critical WEBFLOW files (Marketplace, Subscriptions, Custom)
- [ ] Delete duplicate files I created in `/docs/webflow/`

### **This Week**:
- [ ] Run automated cleanup script on `/docs/` (archive files >30 days old)
- [ ] Manually review recent docs, consolidate into CLAUDE.md
- [ ] Add version headers to remaining 25 WEBFLOW files
- [ ] Verify no code dependencies on archived files
- [ ] Move 296 archived files to `rensto-archives` repo

### **This Month**:
- [ ] Implement pre-commit hooks for doc management
- [ ] Create `/docs/README.md` explaining structure
- [ ] Audit Airtable/Notion for doc duplication
- [ ] Establish weekly doc cleanup routine

---

## 🎯 SUCCESS METRICS

**Before Cleanup**:
- MD Files: 739
- Source of Truth: Unclear (multiple conflicting docs)
- Findability: Low (have to search 739 files)
- Maintenance: None (chaos grows over time)

**After Cleanup**:
- MD Files: <100 (85% reduction)
- Source of Truth: Clear (CLAUDE.md + hierarchy)
- Findability: High (everything in CLAUDE.md or linked from it)
- Maintenance: System in place (weekly cleanup, version control)

---

## 🚨 RISKS & MITIGATION

**Risk #1**: Delete something important
- **Mitigation**: Move to archive repo first, don't delete immediately
- **Mitigation**: Git history preserves everything anyway

**Risk #2**: CLAUDE.md becomes too large
- **Mitigation**: Use sections, table of contents, clear hierarchy
- **Mitigation**: Link to detailed docs when needed (don't inline everything)

**Risk #3**: System not followed
- **Mitigation**: Pre-commit hooks enforce rules
- **Mitigation**: `.cursorrules` reminds AI assistants
- **Mitigation**: Weekly routine makes it habit

---

## 📚 PROPOSED DOC STRUCTURE (AFTER CLEANUP)

```
/
├── CLAUDE.md                          # MASTER DOC - Single source of truth
├── DOCUMENTATION_HIERARCHY.md         # Explains authority levels
├── README.md                          # GitHub visitors
├── .cursorrules                       # AI assistant rules (includes doc rules)
│
├── /docs/
│   ├── README.md                      # Explains /docs/ structure
│   ├── /architecture/                 # System architecture docs
│   ├── /guides/                       # User guides, deployment guides
│   ├── /audits/                       # Historical audit reports
│   │   └── /2025-10-05/              # Today's reports
│   ├── /bmad/                         # BMAD methodology docs
│   └── /integrations/                 # Integration-specific docs
│
├── /apps/
│   └── [Each app can have README.md]
│
├── /Customers/
│   └── [Customer-specific docs]
│
├── /workflows/
│   └── CLEANUP_INSTRUCTIONS.md        # n8n workflow docs
│
├── /live-systems/
│   └── [Live system docs]
│
└── /archives/                         # Historical only, don't delete
    ├── /conflicting-docs/            # Past conflict resolutions
    └── /outdated-docs/               # Past documentation
```

**Total Target**: ~50-100 MD files (85%+ reduction)

---

## 🎬 NEXT STEPS

**For You (User)**:
1. **Approve this plan** - Should I proceed with cleanup?
2. **Clarify WEBFLOW files** - Are the 28 `WEBFLOW_EMBED_*.html` files the ACTUAL deployed pages on Webflow?
3. **Prioritize** - What's more important: cleanup or continuing Stripe deployment?

**For Me (Claude)**:
1. **Update CLAUDE.md** with today's changes (bug fix, audit findings)
2. **Execute Phase 1-2** immediately (update master doc, consolidate reports)
3. **Phase 3-7** require user approval and more time

---

**RECOMMENDATION**:
- **Quick win** (30 min): Update CLAUDE.md, move reports, delete duplicates
- **Full cleanup** (2-3 hours): Execute all 7 phases when you have time
- **Stripe deployment** (30 min): Can proceed in parallel - they're independent

What would you like me to do first?
