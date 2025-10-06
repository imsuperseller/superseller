# 🔧 Scripts & Automation Tools

**Purpose:** Operational scripts, automation tools, BMAD workflows, deployment utilities, and system maintenance scripts for Rensto operations.

**Current Size:** ~89M (69M node_modules, 20M source code)

**Last Audit:** October 5, 2025

---

## ⚠️ CRITICAL ISSUES

**This folder has MAJOR organizational issues**:

1. ❌ **372 root-level scripts** - Needs organization into subdirectories
2. ⚠️ **69M node_modules/** - Git-ignored but taking up local space
3. ❌ **No clear structure** - Mix of active, legacy, and archived scripts
4. ❌ **Duplicates likely** - Multiple similar scripts with slight variations
5. ❌ **No categorization** - Operational, development, testing, deployment all mixed

**Recommendation**: **MAJOR REORGANIZATION NEEDED** (Phase 3 project)

---

## 📂 Directory Structure

```
scripts/
├── 📁 Subdirectories (22 total)
│   ├── agents/              48K - AI agent scripts
│   ├── airtable/           532K - Airtable automation scripts
│   ├── archive/              4K - Archived scripts
│   ├── automation/          16K - General automation scripts
│   ├── bmad/               752K - BMAD methodology scripts (41 files)
│   ├── bmad-testing-framework/ 48K - BMAD testing tools
│   ├── boost-space/         13M - Boost.space integration (LARGE)
│   ├── business/           108K - Business process scripts
│   ├── ci/                   4K - Continuous integration
│   ├── customer-success/    16K - Customer success tools
│   ├── deployment/         152K - Deployment automation
│   ├── maintenance/          8K - System maintenance
│   ├── monitoring/            0B - Monitoring tools (empty)
│   ├── n8n/                 48K - n8n workflow utilities
│   ├── node_modules/        69M - Dependencies (gitignored)
│   ├── optimization/        48K - Performance optimization
│   ├── root-cleanup/        80K - Root cleanup scripts (ironic)
│   ├── scripts/               0B - Nested scripts/ (empty)
│   ├── security/            12K - Security tools
│   ├── smart-sync-system/   44K - Smart sync utilities
│   ├── utilities/          308K - General utilities
│   └── webflow/              4K - Webflow automation
│
└── 📄 Root-level scripts (372 files) ⚠️ **NEEDS ORGANIZATION**
    ├── *.js (350+) - JavaScript scripts
    ├── *.cjs (10+) - CommonJS scripts
    └── *.md (12+) - Documentation files
```

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| **Total Size** | 89M |
| **Total Files** | 5,645 |
| **Total Directories** | 519 |
| **Root-level Scripts** | 372 |
| **Subdirectories** | 22 |
| **node_modules Size** | 69M (gitignored) |
| **Actual Source Code** | ~20M |

---

## 📁 Subdirectory Details

### **bmad/** (752K - 41 files)

**Purpose**: BMAD (Build, Measure, Analyze, Deploy) methodology implementation scripts

**Key Scripts**:
- BMAD workflow automation
- Testing frameworks
- Deployment pipelines
- Analysis tools

**Status**: ✅ Active - Core methodology scripts

---

### **airtable/** (532K)

**Purpose**: Airtable automation and integration scripts

**Key Scripts**:
- Airtable field management
- Base creation and migration
- Data sync automation
- Conflict resolution

**Status**: ✅ Active - Operational scripts

---

### **boost-space/** (13M) ⚠️ **LARGEST SUBDIRECTORY**

**Purpose**: Boost.space integration and automation

**Why So Large?**: Likely contains dependencies or generated files

**Status**: ⚠️ Needs investigation - May contain unnecessary files

**Action Required**: Audit boost-space/ folder for cleanup opportunities

---

### **utilities/** (308K)

**Purpose**: General utility scripts and helper functions

**Status**: ✅ Active - Shared utilities

---

### **deployment/** (152K)

**Purpose**: Deployment automation and infrastructure scripts

**Status**: ✅ Active - Deployment tools

---

### **business/** (108K)

**Purpose**: Business process automation scripts

**Status**: ✅ Active - Business operations

---

### **root-cleanup/** (80K)

**Purpose**: Scripts for cleaning up root directory

**Irony**: This folder exists to clean up the mess, but is part of the mess

**Status**: ⚠️ Should be archived after root cleanup complete

---

### **optimization/** (48K)

**Purpose**: Performance optimization scripts

**Status**: ✅ Active - System optimization

---

### **n8n/** (48K)

**Purpose**: n8n workflow utilities and automation

**Status**: ✅ Active - n8n operations

---

### **bmad-testing-framework/** (48K)

**Purpose**: Testing framework for BMAD workflows

**Status**: ✅ Active - Testing tools

---

### **agents/** (48K)

**Purpose**: AI agent scripts and automation

**Status**: ✅ Active - Agent management

---

### **smart-sync-system/** (44K)

**Purpose**: Smart synchronization between systems

**Status**: ✅ Active - Sync automation

---

### **customer-success/** (16K)

**Purpose**: Customer success and retention scripts

**Status**: ✅ Active - Customer ops

---

### **automation/** (16K)

**Purpose**: General automation scripts

**Status**: ✅ Active - Automation tools

---

### **security/** (12K)

**Purpose**: Security tools and utilities

**Status**: ✅ Active - Security operations

---

### **maintenance/** (8K)

**Purpose**: System maintenance scripts

**Status**: ✅ Active - Maintenance tools

---

### **webflow/** (4K)

**Purpose**: Webflow automation scripts

**Status**: ✅ Active - Webflow integration

---

### **ci/** (4K)

**Purpose**: Continuous integration scripts

**Status**: ✅ Active - CI/CD pipeline

---

### **archive/** (4K)

**Purpose**: Archived scripts no longer in use

**Status**: ⚠️ Should contain more - many root scripts should be moved here

---

### **monitoring/** (0B - EMPTY)

**Purpose**: Monitoring tools and dashboards

**Status**: ❌ Empty - Should be deleted or populated

---

### **scripts/** (0B - EMPTY)

**Purpose**: Unknown - Nested scripts/ directory

**Status**: ❌ Empty - Should be deleted (causes confusion)

---

### **node_modules/** (69M)

**Purpose**: NPM dependencies for scripts

**Status**: ✅ Gitignored - Local only, not tracked in git

**Action**: Can be deleted and reinstalled with `npm install`

---

## 🗂️ Root-Level Script Categories

### **Airtable Management** (~50 scripts)
- `add-fields-*.js` - Field management
- `airtable-*.js` - Base operations
- `audit-airtable-*.cjs` - Airtable audits
- `AIRTABLE_*.md` - Documentation

### **BMAD Workflows** (~30 scripts)
- `bmad-*.js` - BMAD methodology scripts
- `BMAD_*.md` - BMAD documentation

### **n8n Operations** (~20 scripts)
- `backup-n8n-workflows.js`
- `analyze-and-fix-workflows.js`
- `archive-remaining-workflows.cjs`
- n8n workflow management scripts

### **Customer Management** (~15 scripts)
- `add-new-customer.js`
- Customer onboarding scripts
- Customer-specific automation

### **Deployment & Infrastructure** (~15 scripts)
- Deployment automation
- Infrastructure setup
- Server configuration

### **Data Sync** (~20 scripts)
- `audit-notion-airtable-sync.cjs`
- Bidirectional sync scripts
- Data integration automation

### **QuickBooks Integration** (~10 scripts)
- `activate-quickbooks-integration.js`
- `add-tax4us-credentials.js`
- QuickBooks automation

### **Testing & Validation** (~15 scripts)
- `automated-mcp-testing.js`
- Testing frameworks
- Validation scripts

### **Security & SSH** (~5 scripts)
- `automated-ssh-recovery-system.js`
- Security tools

### **Miscellaneous** (~192 scripts)
- Various automation scripts
- One-off utilities
- Experimental scripts

---

## 📦 Key Operational Scripts (Active Use)

**Critical Scripts** (DO NOT DELETE):

1. **backup-n8n-workflows.js** - Backs up all n8n workflows
2. **audit-airtable-all-bases.cjs** - Audits Airtable bases
3. **audit-notion-airtable-sync.cjs** - Checks sync status
4. **archive-remaining-workflows.cjs** - Archives old workflows
5. **analyze-and-fix-workflows.js** - Workflow troubleshooting
6. **automated-ssh-recovery-system.js** - SSH recovery automation
7. **add-tax4us-credentials.js** - Tax4Us credential management
8. **activate-quickbooks-integration.js** - QuickBooks setup

**BMAD Scripts** (Core Methodology):
- All `bmad-*.js` scripts in root and /bmad/ subdirectory
- BMAD testing framework scripts

**Airtable Operations**:
- All `airtable-*.js` and `add-fields-*.js` scripts
- Airtable audit and sync scripts

---

## 🗑️ Cleanup Recommendations

### **Phase 3: Major Reorganization Project**

**Estimated Time**: 1-2 weeks

**Goals**:
1. Move 372 root-level scripts into appropriate subdirectories
2. Archive outdated scripts to archives/scripts-YYYY-MM/
3. Delete empty subdirectories (monitoring/, scripts/)
4. Audit boost-space/ (13M) for unnecessary files
5. Create category-based organization:
   - /scripts/airtable/
   - /scripts/n8n/
   - /scripts/bmad/
   - /scripts/deployment/
   - /scripts/customer-management/
   - /scripts/data-sync/
   - /scripts/quickbooks/
   - /scripts/testing/
   - /scripts/security/
   - /scripts/misc/ (for one-offs)

### **Immediate Actions** (This Audit):
1. ✅ Create this README.md
2. ✅ Document current structure
3. ❌ Delete 2 empty subdirectories (monitoring/, scripts/)
4. ⚠️ **DO NOT reorganize root scripts yet** - Too risky without careful review

### **Why Not Reorganize Now**:
- 372 scripts is too many to safely move in one audit
- Need to verify which scripts are active vs legacy
- Risk breaking dependencies and references
- Requires careful testing after reorganization

---

## 🔧 Usage Instructions

### **Finding a Script**

**By Function**:
```bash
# Search by keyword
cd scripts/
grep -l "quickbooks" *.js
grep -l "airtable" *.js
grep -l "workflow" *.js
```

**By Subdirectory**:
```bash
# Airtable scripts
ls airtable/

# BMAD scripts
ls bmad/

# Deployment scripts
ls deployment/
```

### **Running a Script**

**Node.js Script**:
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/scripts
node script-name.js
```

**CommonJS Script**:
```bash
node --input-type=commonjs script-name.cjs
```

### **Installing Dependencies**

**If node_modules/ deleted**:
```bash
cd scripts/
npm install
```

---

## ⚠️ Known Issues

### **Issue 1: 372 Root-Level Scripts**
**Impact**: Extremely difficult to find specific scripts
**Solution**: Phase 3 reorganization project
**Status**: ⚠️ **MAJOR ISSUE** - Requires dedicated project

### **Issue 2: boost-space/ (13M)**
**Impact**: Largest subdirectory, likely contains unnecessary files
**Solution**: Audit boost-space/ for cleanup
**Status**: ⚠️ **ACTION REQUIRED**

### **Issue 3: 2 Empty Subdirectories**
**Impact**: Clutter and confusion
**Solution**: Delete monitoring/ and scripts/
**Status**: ⚠️ **EASY FIX** - Can be done now

### **Issue 4: Duplicates Likely**
**Impact**: Multiple similar scripts doing same thing
**Solution**: Identify and consolidate duplicates
**Status**: ⚠️ **REQUIRES ANALYSIS**

### **Issue 5: No Version Control for Scripts**
**Impact**: Hard to know which scripts are outdated
**Solution**: Add last-used dates or archive old scripts
**Status**: ⚠️ **PROCESS IMPROVEMENT NEEDED**

---

## 📊 Scripts Audit Score

**Criteria Met**: 6/17 (35%) - ⚠️ **NEEDS MAJOR IMPROVEMENT**

**Strengths**:
- ✅ Some subdirectory organization exists (22 subdirectories)
- ✅ BMAD scripts well-organized in /bmad/ folder
- ✅ node_modules/ properly gitignored
- ✅ Key operational scripts identifiable

**Weaknesses**:
- ❌ No README.md (fixed Oct 5, 2025)
- ❌ 372 scripts in root directory (massive disorganization)
- ❌ Empty subdirectories (monitoring/, scripts/)
- ❌ boost-space/ (13M) - likely has unnecessary files
- ❌ No clear active vs legacy distinction
- ❌ Likely many duplicates
- ❌ No categorization system for root scripts

**Improvement Needed**: **MAJOR** - This is the worst-organized folder in the codebase

---

## 🎯 Action Plan

### **Phase 3 Project: scripts/ Reorganization**

**Timeline**: 1-2 weeks

**Step 1: Analysis** (2-3 days)
1. Inventory all 372 root scripts
2. Categorize by function (Airtable, n8n, BMAD, deployment, etc.)
3. Identify duplicates
4. Mark active vs legacy vs experimental
5. Check for dependencies and references

**Step 2: Organization** (3-4 days)
1. Create clear subdirectory structure
2. Move scripts to appropriate subdirectories
3. Archive legacy scripts to archives/scripts-YYYY-MM/
4. Delete or consolidate duplicates
5. Update any hardcoded paths in scripts

**Step 3: Testing** (2-3 days)
1. Test critical operational scripts
2. Verify no broken dependencies
3. Update documentation
4. Create script index/manifest

**Step 4: Documentation** (1 day)
1. Update this README with new structure
2. Create per-subdirectory READMEs
3. Document key scripts and their purpose
4. Add usage examples

---

## 📞 Questions?

**For finding a script**: Use grep or search by subdirectory
**For running scripts**: See usage instructions above
**For reorganization**: Wait for Phase 3 project
**For boost-space/ audit**: Needs separate investigation

---

**Last Updated:** October 5, 2025
**Next Review:** Phase 3 Project (scripts/ reorganization)
**Maintained By:** Rensto Team
**Total Scripts**: 372 in root + hundreds in subdirectories
**Reorganization Status**: **MAJOR PROJECT NEEDED**

---

## 🚨 WARNING

**DO NOT DELETE SCRIPTS WITHOUT CAREFUL REVIEW**

Many scripts may have dependencies or be referenced by:
- n8n workflows
- Cron jobs
- Other scripts
- CI/CD pipelines
- Manual operational procedures

**Always verify a script is not in use before archiving or deleting.**

---

**This folder is a PRIME CANDIDATE for Phase 3 reorganization.**
