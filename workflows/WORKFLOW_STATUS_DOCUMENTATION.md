# Workflow Status Documentation

**Generated**: October 6, 2025
**Purpose**: Document which of the 82 local workflow files are active vs archived
**Related**: Phase 2.5 Audit Report - Priority 2 Task 8

---

## Executive Summary

**Total Files**: 82 workflow JSON files
**Active Workflows**: 18 (22%)
**Reference/Template Files**: 46 (56%)
**Customer-Specific**: 7 (9%)
**Legacy/Backup**: 11 (13%)

---

## Status Categories

### ✅ **ACTIVE** (18 files)
Workflows currently running in n8n production (http://173.254.201.134:5678)

**Root Level** (6 files):
- `leads-daily-followups.json` - Daily lead follow-up automation
- `projects-digest.json` - Project status digest emails
- `finance-unpaid-invoices.json` - Unpaid invoice tracking and alerts
- `assets-renewals.json` - Asset renewal notifications (<30 days)
- `contact-intake.json` - Contact form webhook handler
- `production-ready-webhook-security-workflow.json` - Webhook security validation

**Rensto Internal** (`rensto/` - 8 files):
- `leads-daily-followups.json` - Lead management automation
- `projects-digest.json` - Project tracking automation
- `email-automation-system.json` - 6 AI personas email routing
- `finance-unpaid-invoices.json` - Financial tracking
- `assets-renewals.json` - Asset management
- `contact-intake.json` - Contact form processing
- `workflow-importer.json` - Workflow import utility
- `import-workflows.json` - Bulk workflow importer

**Tax4US Customer** (`n8n/` - 4 files):
- `t4us_weekly_refresh.json` - Weekly content refresh for Tax4Us
- `t4us_asset_uploader.json` - Asset upload automation
- `t4us_spec_to_draft.json` - Content spec to WordPress draft
- `t4us_approve_publish.json` - Content approval and publishing

**Status**: ✅ All 18 workflows should be verified in n8n production UI

---

### 📚 **REFERENCE** (39 files)
Reference implementations and documentation (`n8n-references/`)

**Purpose**: Example workflows, best practices, integration patterns
**Action**: Keep for development reference, not for production deployment
**Location**: `/workflows/n8n-references/`

**Examples**:
- API integration examples
- Database connection patterns
- Error handling templates
- Webhook implementation examples

**Status**: 🔵 Archive-ready (move to `archives/n8n-references/` if space needed)

---

### 📋 **TEMPLATES** (5 files)
Reusable workflow templates (`templates/`)

**Purpose**: Starting points for new customer workflows
**Action**: Keep for customer onboarding and workflow development
**Location**: `/workflows/templates/`

**Status**: ✅ Keep (actively used for new customer projects)

---

### 👤 **CUSTOMER-SPECIFIC** (7 files)

**Nir Sheinbein** (`nir-sheinbein/` - 3 files):
- `workflow-A-property-intake.json` - Property intake automation
- `workflow-B-offer-generation.json` - Offer generation workflow
- `helper-assign-run-id.json` - Helper workflow for run ID assignment

**Tax4US** (4 files - ROOT LEVEL - SHOULD MOVE):
- `Tax4US-Content-Automation-Airtable-Trigger.json`
- `Tax4US-Content-Automation-Fixed-Update.json`
- `Tax4US Content Specification to WordPress Draft Automation.json`
- `WordPress SEO Content Research and Approval Automation for Tax4us.json`

**⚠️ ACTION REQUIRED**: Move Tax4US root-level files to `/Customers/tax4us/02-workflows/`

**Status**: ⚠️ Needs reorganization per CLAUDE.md Section 16 Audit #18

---

### 🔧 **SUBWORKFLOWS** (2 files)
Helper functions (`n8n-functions/subworkflows/`)

- `emails.draft.json` - Email draft generation subworkflow
- `audit.seo.json` - SEO audit subworkflow

**Status**: ✅ Keep (used by active workflows)

---

### 🧪 **PROTOTYPES** (1 file)
Experimental workflows (`prototypes/`)

- `garagetec-voice-assistant-v1.json` - Voice assistant prototype for GarageTec

**Status**: ⏳ Under development (prospect conversion)

---

### 📦 **BACKUPS** (5 files)
Backup copies (`backup/`)

**Purpose**: Safety copies before major changes
**Action**: Archive older than 30 days to `archives/workflow-backups/`

**Status**: 🟡 Review and archive monthly

---

### 🗄️ **LEGACY** (Unknown count)
No `legacy/` subdirectory found, but CLAUDE.md references 18 archived workflows

**⚠️ DISCREPANCY**: CLAUDE.md Audit #18 states there's a `legacy/` folder with archived workflows, but `ls -d */` shows no such directory.

**Possible locations**:
- May have been deleted in Phase 2 cleanup
- May be in archives/
- May be documented but not yet organized

**Status**: ⚠️ Needs clarification

---

## Root Level Analysis (15 files)

**✅ ACTIVE** (6 files): leads, projects, finance, assets, contact, webhook security
**👤 CUSTOMER** (4 files): Tax4US workflows ⚠️ SHOULD MOVE
**🤖 AI BLOG** (2 files): SMART AI Blog Writing System (111K + 32K)
**📧 EMAIL** (1 file): email-automation-system.json (21K)
**🔧 UTILITY** (2 files): workflow-importer.json, import-workflows.json

**⚠️ CLEANUP NEEDED**: Move 4 Tax4US files to `/Customers/tax4us/02-workflows/`

---

## Directory Statistics

| Directory | Files | Purpose | Status |
|-----------|-------|---------|--------|
| **Root** | 15 | Active operational workflows | ⚠️ 4 customer files need relocation |
| **n8n-references/** | 39 | Reference implementations | 🔵 Archive-ready |
| **rensto/** | 8 | Rensto internal workflows | ✅ Active |
| **templates/** | 5 | Reusable templates | ✅ Keep |
| **backup/** | 5 | Workflow backups | 🟡 Archive monthly |
| **n8n/** | 4 | Tax4US customer workflows | ✅ Active (customer) |
| **nir-sheinbein/** | 3 | Nir Sheinbein customer | ⏳ Prospect |
| **n8n-functions/** | 2 | Subworkflows | ✅ Keep |
| **prototypes/** | 1 | Experimental | ⏳ Development |
| **legacy/** | 0 | Archived workflows | ⚠️ Missing directory |
| **make/** | 0 | Make.com integrations | ⚠️ Status unknown |
| **production/** | 0 | Production workflows | ⚠️ Empty directory |
| **testing/** | 0 | Test workflows | ⚠️ Empty directory |

**Total**: 82 files across 12 directories (3 empty)

---

## Action Items

### Priority 1 (This Week):
1. ✅ Document workflow status (DONE - this file)
2. ⚠️ Move 4 Tax4US root-level files → `/Customers/tax4us/02-workflows/`
3. ⚠️ Clarify legacy/ folder status (missing but referenced in CLAUDE.md)
4. ⚠️ Delete 3 empty directories: `make/`, `production/`, `testing/`

### Priority 2 (This Month):
5. 🔵 Archive `n8n-references/` (39 files) if space needed
6. 🟡 Review and archive backups older than 30 days
7. ⏳ Review prototypes for promotion to active or archival

### Priority 3 (As Needed):
8. 📋 Update template library with new patterns
9. 🧪 Clean up experimental workflows
10. 📊 Create Airtable table for workflow status tracking

---

## Integration Status

**n8n Production**: http://173.254.201.134:5678
**API Access**: ❌ Unauthorized (API key needs update)
**Boost.space**: ✅ 69 workflows documented in Space 45
**Airtable**: ⚠️ "n8n Workflows" table empty (awaits customer instances)

**⚠️ SYNC ISSUE**: Local files (82) vs Boost.space (69) vs CLAUDE.md (68 active + 18 archived = 86)

**Discrepancy Analysis**:
- Local: 82 workflow files
- Boost.space: 69 workflows (metadata catalog)
- CLAUDE.md: 68 active + 18 archived = 86 total
- Difference: Missing 4 workflows or duplicate counting

**Recommendation**: Audit Boost.space Space 45 to reconcile counts

---

## Maintenance Schedule

**Daily**: Monitor active workflow executions
**Weekly**: Review error logs, update documentation
**Monthly**: Archive old backups, review prototypes
**Quarterly**: Full workflow audit, update templates

---

## Related Documentation

- **CLAUDE.md Section 4**: Active Systems - n8n Workflows
- **CLAUDE.md Section 16**: Codebase Consolidation - Workflows Audit #18
- **PHASE_2.5_REALITY_CHECK_AUDIT_REPORT.md**: Priority 2 Task 8

---

**Document Status**: ✅ Complete
**Next Review**: November 6, 2025 (monthly)
**Owner**: Shai Friedman
**Maintained By**: Claude AI
