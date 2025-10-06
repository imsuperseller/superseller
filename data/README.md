# 📊 Data Files & Reports

**Purpose:** Centralized storage for data files, configuration JSONs, completion reports, and temporary files.

**Current Size:** ~2.6M (cleaned Oct 5, 2025)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
data/
├── json/           # Active configuration & data files (900K, 14 files)
├── reports/        # Completion reports & status files (808K, 28 files)
├── temp/           # Temporary files, exports, samples (868K)
└── [Root Files]    # Gitignored credentials & Airtable base list (16K)
```

---

## 📁 Subdirectories

### **json/** (900K - 14 active files)

**Purpose**: Active configuration files and structured data

**Contents**:
- `NICHE_DATA.json` - Niche page configuration for Webflow deployment
- `TYPEFORM_IDS.json` - Typeform IDs for each service type
- `DEEP_SYNC_ANALYSIS_RESULTS.json` - Airtable-Notion sync analysis
- `NOTION_AIRTABLE_SYNC_AUDIT.json` - Sync audit results
- `notion-*` files - Notion integration configs and status
- `cloudflare-tunnel-credentials.json` - ❌ Gitignored (contains secrets)
- `local-il-deployment-plan.json` - Local-il customer deployment plan
- `event_filter_config.json` - Event filtering configuration
- `openapi.json` - OpenAPI specification
- `update_request.json` - Update request templates

**Usage**: Reference these files when:
- Deploying niche pages to Webflow
- Setting up Typeforms for service types
- Configuring Notion-Airtable sync
- Deploying customer-specific workflows

### **reports/** (808K - 28 completion reports)

**Purpose**: Historical completion reports from system implementations

**Contents** (by category):
- **n8n Reports** (10 files):
  - n8n-cleanup-execution-report.json
  - n8n-complete-success-report.json
  - n8n-restoration-report.json
  - n8n-upgrade-to-latest-report.json
  - n8n-gateway-implementation-report.json
  - n8n-credentials-* reports
  - proper-n8n-management-results.json

- **Webflow Reports** (4 files):
  - webflow-cms-and-naming-fix-summary.json
  - webflow-legal-pages-final-status.json
  - rensto-legal-pages-* reports

- **System Reports** (8 files):
  - comprehensive-system-analysis-report.json
  - comprehensive-system-audit-report.json
  - system-alignment-status-report.json
  - hybrid-architecture-status-report.json
  - cloudflare-test-suite-results.json
  - rensto-architecture-setup-results.json

- **DNS & Infrastructure** (3 files):
  - final-dns-fix-status-report.json
  - rensto-dns-fix-* reports

- **Other** (3 files):
  - productization-deployment-report.json
  - airtable-cleanup-validation-report.json
  - final-brainstorming-summary-report.json

**Retention**: Keep for 6 months, then archive to archives/data-reports/

**Usage**: Reference when debugging past implementations or understanding what was completed

### **temp/** (868K - temporary/ephemeral files)

**Purpose**: Temporary files, exports, samples, and generated data

**Contents**:
- `nodes.db*` - SQLite database files (644K - generated/temporary)
- `LeadsExport_21-9-2025_21-56-03.xlsx` - Old leads export (31K)
- `5780d8fc-98b4-4e50-bded-0e85f4f93b48.pdf` - Unknown PDF (106K)
- `sample_csv_contacts-2.csv` - Sample contact CSV
- `professional-gemini-prompt.txt` - Prompt template
- Other temporary TXT/log files

**Retention**: Clean up files older than 30 days

**Git Status**: ⚠️ Some files tracked (should not be) - *.db files now gitignored

**Action**: Regularly clean this directory

---

## 📄 Root Files (Gitignored)

### **Credentials Files** (❌ NOT tracked in git)

- `real-credentials-to-import.json` (3.6K) - Contains real API keys for n8n import
- `credentials-to-import.json` (3.5K) - Template with empty credentials
- `n8n-credentials-restored-verification.json` (4.6K) - Credentials restoration log

**Security**:
- ✅ All credential files are gitignored via pattern: `*credentials*.json`
- ❌ Previously tracked (removed Oct 5, 2025)
- ⚠️ Contains real Airtable API keys - NEVER commit

### **Reference Files** (✅ Tracked in git)

- `airtable_bases.txt` (179B) - List of Airtable base IDs

---

## 🔐 Security & Git Tracking

### **✅ Safe to Commit (Tracked)**
- Active configuration files in `json/` (non-sensitive)
- Completion reports in `reports/`
- `airtable_bases.txt` (just base IDs, no secrets)
- This README.md

### **❌ NEVER Commit (Gitignored)**
- `*credentials*.json` - API keys and secrets
- `json/cloudflare-tunnel-credentials.json` - Tunnel credentials
- `*.db`, `*.db-*` - SQLite database files (temporary)
- Any file in `temp/` with sensitive data

### **⚠️ Previously Tracked (Fixed Oct 5, 2025)**
- Removed 4 credential files from git: `credentials-to-import.json`, `real-credentials-to-import.json`, `n8n-credentials-need-real-data-report.json`, `n8n-credentials-restored-verification.json`
- Removed SQLite WAL files: `nodes.db-shm`, `nodes.db-wal`
- Added patterns to .gitignore to prevent future commits

---

## 🗑️ Cleanup History

### **Phase 2 Audit #7 (October 5, 2025)**:

**Deleted**:
- ❌ 5 empty directories: `backups/`, `configs/`, `exports/`, `imports/`, `n8n-backups/`

**Organized**:
- ✅ Moved 28 completion reports to `data/reports/`
- ✅ Moved temporary files (XLSX, PDF, CSV, TXT) to `data/temp/`
- ✅ Moved active config (local-il-deployment-plan.json) to `data/json/`
- ✅ Moved SQLite database files to `data/temp/`

**Archived**:
- ✅ Moved `root-cleanup/` (300K) → `archives/data-root-cleanup-2025-09/`
- ✅ Moved `n8n-client-delivery/` (32K) → `archives/data-n8n-client-delivery-2025-09/`
  - Note: Active version exists in `infra/n8n-client-delivery/`

**Security**:
- ✅ Removed 4 credential files from git tracking (kept locally)
- ✅ Added `data/*.db*` to .gitignore
- ✅ Removed SQLite WAL files from git tracking

**Result**:
- Audit score: 29% → 76% (improved)
- Structure: 3 clear subdirectories (json/, reports/, temp/)
- Size: ~2.6M (well-organized)
- Security: All secrets properly gitignored

---

## 📋 Data File Management

### **Adding New Data Files**

**Decision Matrix**:

| File Type | Location | Git? | Retention |
|-----------|----------|------|-----------|
| Active config JSON | `data/json/` | ✅ Yes (if no secrets) | Permanent |
| Completion report | `data/reports/` | ✅ Yes | 6 months |
| Temporary export | `data/temp/` | ❌ No | 30 days |
| Database file | `data/temp/` | ❌ No (auto-generated) | Delete when obsolete |
| Credentials | Root (gitignored) | ❌ NEVER | Until replaced |

**Guidelines**:
1. **Config files**: Add to `json/` if they're system configs, not sensitive
2. **Reports**: Add to `reports/` if they're completion status from implementations
3. **Exports/Samples**: Add to `temp/` with clear naming (include date)
4. **Credentials**: Keep at root, ensure gitignored, document in this README

### **Cleaning Up Old Files**

**Schedule**:
- **Monthly**: Review and delete `temp/` files older than 30 days
- **Quarterly**: Review `reports/` and archive reports older than 6 months
- **Yearly**: Full audit of `json/` for obsolete configs

**Commands**:
```bash
# Find temp files older than 30 days
find data/temp -type f -mtime +30

# Find reports older than 6 months
find data/reports -type f -mtime +180

# Move old reports to archives
mv data/reports/*-2024-*.json archives/data-reports-2024/
```

---

## 🔗 Related Documentation

- **CLAUDE.md**: Master documentation mentioning data/ folder
- **Airtable**: Sync configs in `json/` reference base IDs
- **Notion**: Sync configs and execution guides in `json/`
- **n8n**: Credentials import files (gitignored at root)
- **Webflow**: Niche data and deployment configs in `json/`

---

## ⚠️ Known Issues

### **Issue 1: Some temp/ files still tracked in git**
**Impact**: PDF, XLSX tracked when they shouldn't be
**Solution**: Add specific patterns to .gitignore if needed
**Status**: ⚠️ Acceptable for now (not sensitive data)

### **Issue 2: Credential files previously committed to git history**
**Impact**: API keys exposed in git history
**Solution**: Rotate affected API keys (Airtable PAT)
**Status**: 🚨 **ACTION REQUIRED** - Rotate Airtable API key

### **Issue 3: No automated cleanup of temp/ directory**
**Impact**: temp/ grows over time
**Solution**: Create scheduled cleanup script
**Status**: ⚠️ Low priority - manual cleanup works for now

---

## 📊 Data Audit Score

**Criteria Met**: 13/17 (76%) - ✅ **GOOD** (improved from 29%)

**Improvements Made**:
- ✅ Organized structure (json/, reports/, temp/)
- ✅ Security fixed (credentials gitignored)
- ✅ Database files removed from git
- ✅ Old subdirectories archived
- ✅ Comprehensive documentation

**Remaining Issues**:
- [ ] Rotate Airtable API key (was in git history)
- [ ] Automate temp/ cleanup
- [ ] Integrate data files with admin dashboard

---

## 📞 Questions?

**For data file questions**: Check this README first
**For adding new configs**: Follow "Adding New Data Files" guidelines
**For security concerns**: NEVER commit credentials - verify gitignore patterns
**For cleanup**: Follow monthly/quarterly schedules above

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (quarterly)
**Next Cleanup:** November 2025 (monthly temp/ cleanup)
**Maintained By:** Rensto Team
