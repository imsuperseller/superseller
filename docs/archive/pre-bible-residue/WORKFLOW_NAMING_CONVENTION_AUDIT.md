# 📋 N8N WORKFLOW NAMING CONVENTION AUDIT

**Date**: October 5, 2025
**Status**: ✅ Audit Complete - 68 workflows analyzed
**Compliance**: 30% perfect, 17% partial, 32% inconsistent, 19% archived

---

## 📊 AUDIT SUMMARY

| Category | Count | % | Status |
|----------|-------|---|--------|
| ✅ **Perfect** | 21 | 30% | Follows convention completely |
| ⚠️ **Partial** | 12 | 17% | Has PREFIX-CATEGORY, needs minor fixes |
| ❌ **Inconsistent** | 22 | 32% | Needs complete renaming |
| 🗄️ **Archived** | 13 | 19% | Old workflows (format varies) |
| **TOTAL** | **68** | **100%** | |

---

## ✅ PERFECT CONVENTION (21 workflows)

**Pattern**: `{PREFIX}-{CATEGORY}-{NUMBER}: {Description} v{VERSION}`

### **Examples**:
```
✅ INT-CUSTOMER-002: Customer-Project Data Sync v1
✅ INT-CUSTOMER-003: Project-Task Data Integration v1
✅ INT-EMAIL-001: Email Automation System v1
✅ INT-LEAD-001: Lead Machine Orchestrator v2
✅ INT-LEAD-002: Lead Machine Webhook Handler v1
✅ INT-MONITOR-001: Daily Summary Report v1
✅ INT-TECH-001: Invoice Fetcher & QuickBooks Sync v1
✅ INT-TECH-002: VPS Monitoring System v1
✅ INT-TECH-003: MCP Server Manager v1
✅ INT-TECH-004: n8n Workflow Documentation Generator v1
✅ INT-TECH-005: n8n-Airtable-Notion Integration v1
✅ MKT-CONTENT-001: AI Landing Page Generator v1
✅ MKT-LEAD-001: Lead Generation SaaS Template v1
✅ SUB-LEAD-001: Cold Outreach Lead Machine v2
✅ SUB-LEAD-002: Instantly Campaign Manager v1
✅ SUB-LEAD-003: Local Business Lead Finder v1
✅ SUB-LEAD-004: LinkedIn Connection Automation v1
✅ SUB-LEAD-005: Email Warmup & Health Monitor v1
✅ TEST-001: BMAD Airtable Test Workflow v1
```

**Additional**:
- INT-SYNC-001: n8n to Boost.space Workflow Sync v1
- INT-TECH-006: Webhook Security System v1

**Action**: ✅ **None needed - keep as is**

---

## ⚠️ PARTIAL CONVENTION (12 workflows)

**Issue**: Has PREFIX-CATEGORY but missing version number or description needs work

### **Renaming Required**:

| Current Name | Proposed Name |
|--------------|---------------|
| DEV-001: Business Intelligence & Analytics v1 | ✅ Keep (perfect) |
| DEV-003: Airtable Customer Scoring Automation v1 | ✅ Keep (perfect) |
| DEV-005: Medical Symptom Analysis Template v1 | ✅ Keep (perfect) |
| DEV-006: Stripe Revenue Sync to Airtable | ➡️ **DEV-FIN-006: Stripe Revenue Sync v1** |
| LEAD-001: Cold Outreach Lead Machine v2 | ➡️ **SUB-LEAD-001: Cold Outreach Lead Machine v2** (duplicate?) |
| STRIPE-001: Stripe Webhook Handler | ➡️ **STRIPE-WEBHOOK-001: Payment Event Handler v1** |
| STRIPE-002: Connect Stripe to Airtable/Notion | ➡️ **STRIPE-SYNC-001: Revenue Data Sync v1** |
| STRIPE-003: Connect Stripe to QuickBooks | ➡️ **STRIPE-FIN-001: QuickBooks Integration v1** |
| STRIPE-004: Payment Status Tracking | ➡️ **STRIPE-MONITOR-001: Payment Status Tracker v1** |
| STRIPE-005: Subscription Management | ➡️ **STRIPE-SUB-001: Subscription Manager v1** |
| STRIPE-006: Connect Stripe to Rensto | ➡️ **STRIPE-INT-001: Rensto Integration v1** (clarify purpose) |
| STRIPE-007: Connect Stripe to QuickBooks | ➡️ **STRIPE-FIN-002: QuickBooks Invoicing v1** (duplicate of 003?) |

**Note**: LEAD-001 might be duplicate of SUB-LEAD-001 (same description, same version)

**Action**: ⚠️ **Rename 9 workflows, investigate 2 duplicates**

---

## ❌ INCONSISTENT (22 workflows)

**Issue**: No clear PREFIX-CATEGORY pattern, needs complete renaming

### **High Priority Customer/Project Workflows**:

| Current Name | Proposed Name | Type |
|--------------|---------------|------|
| Best Amusement Games Lead Machine | **SUB-LEAD-006: Best Amusement Games Lead Gen v1** | Customer |
| Best Amusement Games - 2. Lead Gen Monitoring & Cost Tracking | **SUB-MONITOR-001: Best Amusement Games Tracking v1** | Customer |
| Best Amusement Games - 3. Enrichment & Scoring – Prospects | **SUB-ENRICH-001: Best Amusement Games Scoring v1** | Customer |
| Best Amusement Games - 4. Outreach & CRM Sync – Gmail | **SUB-EMAIL-002: Best Amusement Games Outreach v1** | Customer |
| Best Amusement Games (Bonus) - FB Groups Discovery – Nepalese/Pakistani | **SUB-LEAD-007: Best Amusement Games FB Discovery v1** | Customer |

### **Internal Infrastructure**:

| Current Name | Proposed Name | Type |
|--------------|---------------|------|
| Terry | **INT-INFRA-001: Server Monitoring Agent v1** | Infrastructure |
| SSH_Racknerd_Server | **INT-INFRA-002: RackNerd SSH Access v1** | Infrastructure |
| airtable home assistant | **INT-SYNC-002: Home Assistant Airtable Sync v1** | Integration |

### **Development/Testing**:

| Current Name | Proposed Name | Type |
|--------------|---------------|------|
| Family Insurance Analysis Workflow | **DEV-INSURE-001: Family Insurance Analysis v1** | Development |
| Family Insurance Workflow - SUMMARIZE GROUPING | **DEV-INSURE-002: Family Insurance Summary v1** | Development |
| Family Insurance Analysis Workflow - Fixed | **DEV-INSURE-003: Family Insurance Analysis Fixed v2** | Development |
| Family Insurance Analysis Workflow - Fixed | **DEV-INSURE-004: Family Insurance Analysis Fixed v3** | Development |
| Fixed Family Insurance Workflow v2 | **DEV-INSURE-005: Family Insurance Processing v2** | Development |
| ניתוח ביטוח משפחתי - PDF 🏠💼 | **DEV-INSURE-006: Family Insurance PDF Parser v1** | Development |
| Daf Yomi Daily Digest - Fixed | **INT-CONTENT-001: Daf Yomi Digest v2** | Content |
| Daf Yomi daily digest | **INT-CONTENT-002: Daf Yomi Digest v1** | Content |

### **Marketing/Templates**:

| Current Name | Proposed Name | Type |
|--------------|---------------|------|
| AI Solutions Framework v1 | **INT-AI-001: AI Solutions Framework v1** | AI/Internal |
| Landing Page Conversion Optimizer v1 | **MKT-OPTIMIZE-001: Landing Page Optimizer v1** | Marketing |
| Israeli LinkedIn Leads Micro-SaaS | **DEV-LEAD-001: Israeli LinkedIn Leads v1** | Development |
| Sora 2 Automation Skool Template | **MKT-TEMPLATE-001: Sora 2 Automation Template v1** | Template |
| Working Optimized Workflow - Complete | **DEV-TEST-001: Optimized Workflow Test v1** | Testing |
| Production Lead Generation & Enrichment - Comprehensive | **SUB-LEAD-008: Production Lead Gen Comprehensive v1** | Production |

**Action**: ❌ **Rename all 22 workflows**

---

## 🗄️ ARCHIVED (13 workflows)

**Current Formats**:
- `[ARCHIVED] Workflow Name` (preferred)
- `ARCHIVED - Workflow Name`
- Mixed formats

### **Standardization Required**:

| Current Name | Proposed Name |
|--------------|---------------|
| [ARCHIVED] AI Lead Generation SaaS Workflow | ✅ Keep format |
| [ARCHIVED] Cold Outreach 3.0 UPDATED_922 | ✅ Keep format |
| [ARCHIVED] Cold Outreach Complete System 922 | ✅ Keep format |
| [ARCHIVED] Lead Discovery – DFW Working | ✅ Keep format |
| [ARCHIVED] LinkedIn Cold Outreach w. AI | ✅ Keep format |
| [ARCHIVED] Production Lead Generation & Enrichment - Comprehensive | ✅ Keep format |
| [ARCHIVED] Smart Israeli Leads Generator - Customer vs Internal Storage | ✅ Keep format (appears 2x - dedup?) |
| [ARCHIVED] Updated Cold Outreach System 922 | ✅ Keep format |
| [ARCHIVED] Working LinkedIn -> Cold Outreach -> CRM | ✅ Keep format |
| [ARCHIVED] Working Optimized Workflow - Iteration 1 | ✅ Keep format |

**Additional**: 3 more archived workflows

**Action**: 🗄️ **Standardize format, check for duplicates**

---

## 📝 PROPOSED NAMING CONVENTION

### **Format**:
```
{PREFIX}-{CATEGORY}-{NUMBER}: {Description} v{VERSION}
```

### **PREFIX Options**:
- **INT** = Internal Operations (infrastructure, monitoring, sync)
- **SUB** = Subscription Services (customer-facing recurring services)
- **DEV** = Development/Testing (experiments, prototypes)
- **MKT** = Marketing (content, lead gen templates)
- **STRIPE** = Payment Processing (Stripe integrations)
- **[ARCHIVED]** = Archived workflows (prefix only)

### **CATEGORY Options** (3-5 letters):
- **SYNC** = Data Synchronization
- **LEAD** = Lead Generation
- **TECH** = Technical/Infrastructure
- **CUST** = Customer Management
- **MONITOR** = Monitoring
- **ALERT** = Alerting
- **FIN** = Financial
- **EMAIL** = Email Automation
- **INFRA** = Infrastructure (servers, SSH, etc.)
- **AI** = AI/LLM Workflows
- **CONTENT** = Content Generation
- **OPTIMIZE** = Optimization
- **WEBHOOK** = Webhook Handlers
- **ENRICH** = Data Enrichment
- **TEMPLATE** = Workflow Templates
- **TEST** = Testing Workflows

### **NUMBER**:
- 3 digits (001, 002, etc.)
- Sequential within PREFIX-CATEGORY combination

### **VERSION**:
- v1, v2, v3, etc.
- Increment when major changes made

### **Examples**:
```
✅ INT-SYNC-001: n8n to Boost.space Workflow Sync v1
✅ SUB-LEAD-001: Cold Outreach Lead Machine v2
✅ DEV-INSURE-001: Family Insurance Analysis v1
✅ STRIPE-FIN-001: QuickBooks Integration v1
✅ INT-INFRA-001: Server Monitoring Agent v1
```

---

## 🎯 IMPLEMENTATION PLAN

### **Phase 1: Planning & Verification** (Today)
1. ✅ Audit complete (this document)
2. Review and approve proposed renamings
3. Identify true duplicates
4. Determine which workflows to keep vs archive

### **Phase 2: Backup** (Before any changes)
1. Export all 68 workflows as JSON backup
2. Store in `/Users/shaifriedman/New Rensto/rensto/backups/workflows-pre-rename/`
3. Document current state in Boost.space (already done - Space 45)

### **Phase 3: Rename Execution** (Batch processing)
1. **Batch 1**: Fix PARTIAL (12 workflows) - minor changes only
2. **Batch 2**: Rename INCONSISTENT high-priority (10 workflows)
3. **Batch 3**: Rename INCONSISTENT remaining (12 workflows)
4. **Batch 4**: Standardize ARCHIVED format (13 workflows)

### **Phase 4: Sync & Verify**
1. Update Boost.space Space 45 with new names
2. Verify all 68 workflows still functional
3. Update any hardcoded references in other workflows
4. Test critical workflows (INT-LEAD-001, SUB-LEAD-*, etc.)

### **Phase 5: Documentation**
1. Update CLAUDE.md with new naming standard
2. Update any customer documentation
3. Create "Workflow Naming Guide" for future additions

---

## ⚠️ RISKS & CONSIDERATIONS

### **Workflow Dependencies**:
- Some workflows may reference others by name
- Webhooks may use workflow names in URLs
- Customer documentation may reference specific names

### **Downtime Risk**:
- Renaming could break active integrations
- Test each renamed workflow before deploying
- Have rollback plan (backup JSON files)

### **Customer Communication**:
- Best Amusement Games workflows are customer-facing
- Notify before renaming customer workflows
- Update any shared documentation

---

## 📊 EXECUTION ESTIMATE

**Total Workflows to Rename**: 43 (12 partial + 22 inconsistent + 13 archived format)
**Time Estimate**:
- Phase 1 (Planning): ✅ Complete
- Phase 2 (Backup): 15 minutes
- Phase 3 (Rename): 2-3 hours (careful, methodical)
- Phase 4 (Sync): 30 minutes
- Phase 5 (Documentation): 30 minutes

**Total Time**: ~4-5 hours

**Recommended Approach**: Execute in 2-3 sessions to avoid fatigue errors

---

## 🚀 NEXT STEPS

**Immediate**:
1. Review and approve this renaming plan
2. Identify any concerns or adjustments needed
3. Choose execution timing (all at once vs phased)

**Before Execution**:
1. Backup all workflows
2. Notify customers if their workflows will be renamed
3. Create rollback procedure

**After Execution**:
1. Verify all 68 workflows functional
2. Update Boost.space Space 45
3. Update CLAUDE.md documentation
4. Create naming guide for future workflows

---

**Audit Completed**: October 5, 2025
**Method**: Regex pattern matching + manual categorization
**Result**: 30% perfect, 47% need renaming (partial + inconsistent)
**Recommendation**: Execute renaming in phases over 2-3 sessions
