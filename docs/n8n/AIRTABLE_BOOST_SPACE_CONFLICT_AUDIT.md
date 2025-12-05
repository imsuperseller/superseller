# Airtable vs Boost.space Conflict Audit

**Date**: November 25, 2025  
**Status**: 🚨 **CRITICAL - FIXING ALL CONFLICTS**  
**Issue**: 852 matches of "Airtable" across 135 files - many incorrectly reference Airtable as primary

---

## ✅ CORRECT ARCHITECTURE (From CLAUDE.md)

**Data Flow Philosophy**: **"Boost.space Primary, n8n Operational, Airtable Archive"**

1. **PRIMARY**: Boost.space (no rate limits, lifetime plan)
   - Infrastructure metadata
   - Marketplace products
   - Customer and project data
   - Financial data
   - Reference data

2. **OPERATIONAL**: n8n Data Tables
   - Workflow execution data
   - Lead generation data
   - Customer interaction tracking

3. **ARCHIVE ONLY**: Airtable (backup, rate limited)
   - Historical data (migrating to Boost.space)
   - Manual editing (when API available)
   - ⚠️ **NOT for operational use**

---

## 🚨 FILES WITH CONFLICTS (n8n docs)

### **Files to Fix** (15 files in docs/n8n/):

1. `COMPLETE_ANSWERS_SUMMARY.md` - 3 references
2. `SURPRISE_TRIAL_WORKFLOW_DESIGN.md` - 3 references (partially fixed)
3. `WORKFLOW_GENERATOR_WORKFLOW_DESIGN.md` - 5 references
4. `WORKFLOW_GENERATOR_APPROACH.md` - 1 reference
5. `PRODUCTIZED_WORKFLOW_CREATION_PLAN.md` - 2 references
6. `WORKFLOW_CREATION_GUIDE.md` - 3 references
7. `N8N_COMPREHENSIVE_AUDIT_PLAN.md` - 25 references
8. `AIRTABLE_NODE_UPDATE_PLAN.md` - 27 references (legacy doc, may archive)
9. `N8N_ACTION_ITEMS.md` - 13 references
10. `QUICKBOOKS_HTTP_TO_NATIVE_FIX.md` - 11 references
11. `WORKFLOW_NAMING_CONVENTION_AUDIT.md` - 6 references
12. `WORKFLOW_ISSUES_DETAILED.md` - 2 references
13. `WORKFLOW_ISSUES_REPORT.md` - 8 references
14. `N8N_WORKFLOW_CLEANUP_PLAN.md` - 6 references
15. `N8N_WORKFLOW_IMPLEMENTATION_SUMMARY.md` - 16 references

**Total**: ~130+ incorrect references in n8n docs alone

---

## 🔧 REPLACEMENT RULES

### **Replace These Patterns**:

1. **"Log to Airtable"** → **"Log to Boost.space"**
2. **"Store in Airtable"** → **"Store in Boost.space"**
3. **"Airtable table"** → **"Boost.space Space [X]"**
4. **"Airtable node"** → **"Boost.space HTTP Request node"** (for new workflows)
5. **"Airtable API"** → **"Boost.space API"**
6. **"Airtable base"** → **"Boost.space Space"**

### **Keep These (Historical/Legacy)**:

- References to existing Airtable nodes in old workflows (documentation only)
- Migration plans that mention Airtable as source
- Historical audit documents

### **Archive These Files**:

- `AIRTABLE_NODE_UPDATE_PLAN.md` - Legacy, about updating old Airtable nodes
- Any docs that are ONLY about Airtable (not relevant to current architecture)

---

## 📋 FIXING PRIORITY

**Phase 1: Active Workflow Design Docs** (Fix Now)
- `SURPRISE_TRIAL_WORKFLOW_DESIGN.md`
- `WORKFLOW_GENERATOR_WORKFLOW_DESIGN.md`
- `PRODUCTIZED_WORKFLOW_CREATION_PLAN.md`
- `COMPLETE_ANSWERS_SUMMARY.md`

**Phase 2: Implementation Guides** (Fix This Week)
- `WORKFLOW_CREATION_GUIDE.md`
- `WORKFLOW_GENERATOR_APPROACH.md`
- `N8N_ACTION_ITEMS.md`

**Phase 3: Audit/Historical Docs** (Mark as Historical)
- `N8N_COMPREHENSIVE_AUDIT_PLAN.md`
- `WORKFLOW_ISSUES_REPORT.md`
- `N8N_WORKFLOW_IMPLEMENTATION_SUMMARY.md`
- `AIRTABLE_NODE_UPDATE_PLAN.md` (archive)

---

**Status**: 🚨 **FIXING NOW**

