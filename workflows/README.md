# 🔄 n8n Workflows & Automation Templates

**Purpose:** n8n workflow exports, templates, backups, and automation documentation for Rensto operations

**Current Size:** ~5.2M (103 files)

**Last Updated:** October 5, 2025

**Last Audit:** October 5, 2025

---

## 📖 What's in This Folder?

This folder contains **n8n workflow JSON files** that can be:
- Imported into n8n (http://173.254.201.134:5678)
- Used as templates for customer projects
- Referenced for workflow development
- Backed up for disaster recovery

**n8n Production**: http://173.254.201.134:5678

---

## 📂 Directory Structure

```
workflows/
├── 📄 Root-level workflows (18 JSON files)
├── backup/          - Workflow backups
├── legacy/          - Archived/deprecated workflows
├── make/            - Make.com integrations
├── n8n/             - n8n workflow exports
├── n8n-functions/   - Custom n8n functions
├── n8n-references/  - Reference implementations
├── nir-sheinbein/   - Customer workflows (Nir Sheinbein)
├── production/      - Production workflows
├── prototypes/      - Experimental workflows
├── rensto/          - Rensto internal workflows
├── templates/       - Reusable workflow templates
└── testing/         - Test workflows
```

**Total**: 103 files across 35 directories

---

## 📄 Root-Level Workflow Files (18 Files)

### **Operational Workflows** (5 files):
1. **leads-daily-followups.json** (4.8K) - Daily lead follow-up automation
2. **projects-digest.json** (6.2K) - Project status digest
3. **contact-intake.json** (10.6K) - Contact form processing
4. **finance-unpaid-invoices.json** (9.1K) - Invoice reminder automation
5. **assets-renewals.json** (9.6K) - Asset renewal tracking

### **Email Automation** (1 file):
6. **email-automation-system.json** (21K) - AI-powered email persona system (6 personas)

### **Tax4US Workflows** (5 files):
7. **Tax4US Content Specification to WordPress Draft Automation.json** (15K)
8. **Tax4US-Content-Automation-Airtable-Trigger.json** (24K)
9. **Tax4US-Content-Automation-Fixed-Update.json** (16K)
10. **WordPress SEO Content Research and Approval Automation for Tax4us.json** (24K)

### **AI Blog Writing** (2 files):
11. **SMART AI Blog Writing System_ Fully Automated Content.json** (111K) - Full blog automation
12. **SMART_AI_Blog_Writing_System_Updated.json** (32K) - Updated version

### **Infrastructure** (3 files):
13. **production-ready-webhook-security-workflow.json** (10K) - Webhook security
14. **import-workflows.json** (1.9K) - Workflow import utility
15. **workflow-importer.json** (2.1K) - Workflow importer

### **Documentation** (1 file):
16. **CLEANUP_INSTRUCTIONS.md** (879 bytes) - Cleanup instructions (not executed)

**Status**:
- ✅ **Active**: leads-daily-followups, projects-digest, email-automation-system
- ⚠️ **Customer-specific**: Tax4US workflows (5 files)
- ⚠️ **Reference**: AI blog writing (2 files)
- ⏳ **Utility**: import/importer workflows

---

## 📁 Subdirectory Details

### **backup/** (Workflow Backups)
**Purpose**: Backup copies of workflows for disaster recovery
**Status**: ✅ Active - Critical for recovery

---

### **legacy/** (Archived Workflows)
**Purpose**: Deprecated or outdated workflows no longer in use
**Status**: ✅ Archive - Keep for historical reference

---

### **make/** (Make.com Integrations)
**Purpose**: Make.com (formerly Integromat) workflow integrations
**Status**: ⏳ Unclear - May be legacy if switched to n8n

---

### **n8n/** (n8n Workflow Exports)
**Purpose**: Main n8n workflow exports from production
**Status**: ✅ Active - Primary workflow storage

---

### **n8n-functions/** (Custom n8n Functions)
**Purpose**: Custom JavaScript functions for use in n8n workflows
**Status**: ✅ Active - Reusable function library

---

### **n8n-references/** (Reference Implementations)
**Purpose**: Reference workflow implementations and examples
**Status**: ✅ Active - Learning and template resource

---

### **nir-sheinbein/** (Customer Workflows)
**Purpose**: Customer-specific workflows for Nir Sheinbein
**Action Required**: ⚠️ Move to `/Customers/nir-sheinbein/02-workflows/`
**Status**: ⚠️ **MISPLACED** - Should be in /Customers/

---

### **production/** (Production Workflows)
**Purpose**: Production-ready workflows currently deployed
**Status**: ✅ Active - Critical workflows

---

### **prototypes/** (Experimental Workflows)
**Purpose**: Experimental workflows being tested/developed
**Status**: ⚠️ Mixed - Some may be outdated, some in development

---

### **rensto/** (Rensto Internal Workflows)
**Purpose**: Internal Rensto workflows for operations
**Status**: ✅ Active - Core operational workflows

---

### **templates/** (Workflow Templates)
**Purpose**: Reusable workflow templates for customer projects
**Status**: ✅ Active - Product offerings

---

### **testing/** (Test Workflows)
**Purpose**: Test workflows for development and QA
**Status**: ✅ Active - Testing infrastructure

---

## 🔗 Relationship to Other Folders

### **workflows/ vs /live-systems/n8n-system/ vs /scripts/**

**workflows/** (This folder):
- **Purpose**: Workflow JSON files (exports, templates, backups)
- **Contents**: n8n workflow exports in JSON format
- **Use Case**: Import into n8n, templates for customers

**/live-systems/n8n-system/**:
- **Purpose**: n8n system workflows and integrations
- **Contents**: Production n8n workflow management
- **Use Case**: Operational n8n workflows

**/scripts/**:
- **Purpose**: Operational scripts (not workflows)
- **Contents**: Node.js scripts, automation scripts
- **Use Case**: Server-side automation, admin tasks

**Integration**: Workflows can call scripts, scripts can trigger workflows

---

## 📊 Workflow Audit Score

**Criteria Met**: 11/17 (65%) - ⚠️ **NEEDS IMPROVEMENT**

**Strengths**:
- ✅ Good subdirectory organization (12 subdirectories)
- ✅ Backup system exists (backup/)
- ✅ Templates available (templates/)
- ✅ Clear separation (production/, testing/, prototypes/)
- ✅ Customer workflows identified (nir-sheinbein/)

**Weaknesses**:
- ❌ No README.md (fixed Oct 5, 2025)
- ⚠️ Customer workflows in wrong location (nir-sheinbein/ should be in /Customers/)
- ⚠️ Tax4US workflows (5 files) in root - should be in /Customers/tax4us/
- ⚠️ CLEANUP_INSTRUCTIONS.md exists but cleanup not executed
- ⚠️ Unclear which workflows are active vs legacy
- ⚠️ Make.com folder status unclear (legacy or active?)

---

## ⚠️ Known Issues

### **Issue 1: Customer Workflows in Wrong Location**
**Impact**: nir-sheinbein/ and Tax4US workflows mixed with operational workflows
**Solution**: Move customer workflows to /Customers/{customer}/02-workflows/
**Files Affected**:
- nir-sheinbein/ → /Customers/nir-sheinbein/02-workflows/
- Tax4US workflows (5 files) → /Customers/tax4us/02-workflows/
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 2: Cleanup Not Executed**
**Impact**: CLEANUP_INSTRUCTIONS.md references workflows-organized/ which doesn't exist
**Analysis**: Cleanup was planned but never executed
**Solution**: Either execute cleanup or remove CLEANUP_INSTRUCTIONS.md
**Status**: ⏳ **DECISION NEEDED**

### **Issue 3: Make.com Folder Status Unknown**
**Impact**: Unknown if Make.com integrations are still in use
**Solution**: Audit make/ folder for active integrations
**Status**: ⏳ **VERIFICATION NEEDED**

### **Issue 4: No Active vs Legacy Distinction**
**Impact**: Hard to know which root-level workflows are currently used
**Solution**: Add status indicator to each workflow (✅ Active, ⏳ Legacy, ⚠️ Customer)
**Status**: ⚠️ **DOCUMENTATION NEEDED**

---

## 🔧 Usage Instructions

### **Importing a Workflow into n8n**

1. **Navigate to n8n**: http://173.254.201.134:5678
2. **Go to Workflows tab**
3. **Click "Import from File" or "Import from URL"**
4. **Select workflow JSON file** from this folder
5. **Configure credentials** (Airtable, OpenAI, etc.)
6. **Test workflow** with sample data
7. **Activate workflow** if tests pass

### **Exporting a Workflow from n8n**

1. **Open workflow** in n8n
2. **Click workflow menu** (3 dots in top right)
3. **Select "Download"**
4. **Save to appropriate folder**:
   - Operational: Save to `workflows/` root
   - Production: Save to `workflows/production/`
   - Customer: Save to `/Customers/{customer}/02-workflows/`
   - Template: Save to `workflows/templates/`

### **Creating a Workflow Template**

1. **Build workflow** in n8n
2. **Remove customer-specific data** (API keys, specific IDs)
3. **Add placeholder comments** for customization
4. **Export workflow**
5. **Save to** `workflows/templates/`
6. **Document usage** in template comments

---

## 📋 Workflow Inventory (Key Workflows)

### **Operational Workflows** (Production):
| Workflow | File Size | Purpose | Status |
|----------|-----------|---------|--------|
| Leads Daily Follow-ups | 4.8K | Active leads automation | ✅ Active |
| Projects Digest | 6.2K | Project status reporting | ✅ Active |
| Finance Unpaid Invoices | 9.1K | Invoice reminders | ✅ Active |
| Assets Renewals | 9.6K | Asset renewal tracking | ✅ Active |
| Contact Intake | 10.6K | Contact form processing | ⏳ May be stub |

### **Product Workflows** (Marketplace):
| Workflow | File Size | Purpose | Status |
|----------|-----------|---------|--------|
| Email Automation System | 21K | 6 AI personas | ✅ Active (Product) |
| AI Blog Writing System | 111K | Full blog automation | ✅ Active (Product) |

### **Customer Workflows** (Should be in /Customers/):
| Workflow | File Size | Customer | Status |
|----------|-----------|----------|--------|
| Tax4US Content Automation | 24K | Tax4US | ⚠️ Move to /Customers/ |
| Tax4US WordPress Automation | 24K | Tax4US | ⚠️ Move to /Customers/ |
| Tax4US Draft Automation | 15K | Tax4US | ⚠️ Move to /Customers/ |
| Nir Sheinbein Workflows | Multiple | Nir Sheinbein | ⚠️ Move to /Customers/ |

---

## 🎯 Recommended Actions

### **Priority 1: Move Customer Workflows**
**Action**: Relocate customer-specific workflows to /Customers/{customer}/02-workflows/
**Files**:
- Move nir-sheinbein/ → /Customers/nir-sheinbein/02-workflows/
- Move 5 Tax4US workflows → /Customers/tax4us/02-workflows/
**Estimated Time**: 30 minutes

---

### **Priority 2: Audit Make.com Folder**
**Action**: Determine if Make.com integrations are still in use
**Steps**:
1. Check make/ folder contents
2. Verify if any Make.com scenarios are active
3. If legacy, move to legacy/ or archives/
**Estimated Time**: 1 hour

---

### **Priority 3: Execute or Remove Cleanup**
**Decision**: Either execute cleanup per CLEANUP_INSTRUCTIONS.md OR remove file
**Options**:
- **Option A**: Execute cleanup (create workflows-organized/ structure)
- **Option B**: Remove CLEANUP_INSTRUCTIONS.md (cleanup not needed)
**Recommendation**: Option B - current structure is adequate
**Estimated Time**: 15 minutes (remove file) OR 2-3 hours (execute cleanup)

---

### **Priority 4: Document Workflow Status**
**Action**: Add status indicators to workflow inventory
**Format**: Update this README with ✅ Active, ⏳ Legacy, ⚠️ Customer tags
**Estimated Time**: 1-2 hours (audit all workflows)

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation with n8n workflows section
- **/live-systems/n8n-system/**: n8n system workflows and integrations
- **n8n Production**: http://173.254.201.134:5678
- **/Customers/{customer}/02-workflows/**: Customer-specific workflows
- **/products/**: Product catalog (includes workflow-based products)

---

## 📞 Questions?

**For workflow imports**: Follow "Importing a Workflow" instructions above
**For workflow exports**: Follow "Exporting a Workflow" instructions above
**For templates**: Check workflows/templates/ subdirectory
**For production workflows**: Check workflows/production/ subdirectory
**For n8n access**: http://173.254.201.134:5678

---

**Last Updated:** October 5, 2025 (Phase 2 Audit #18 - FINAL FOLDER!)
**Next Review:** After moving customer workflows to /Customers/
**Maintained By:** Rensto Team
**Total Workflows**: 103 files
**Active Operational Workflows**: 5+ (leads, projects, finance, assets, contact)
**Customer Workflows**: 10+ (need relocation)

---

## 🎉 This is the FINAL folder audit of Phase 2!

**Phase 2 Complete**: 18 of 18 folders audited!
