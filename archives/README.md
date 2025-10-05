# 🗄️ Archives

**Purpose:** Historical storage for outdated, replaced, or deprecated code, documentation, and configurations.

**Total Size:** ~51M (cleaned Oct 5, 2025)

**Last Audit:** October 5, 2025

---

## 📂 Directory Structure

```
archives/ (51M total)
├── archived-old/                     1.0M - Old archived content (pre-organization)
├── backups-2025-10-05/               3.7M - System backups from Oct 5, 2025
├── conflicting-docs/                 2.5M - Documentation with conflicts (resolved)
├── designs/                          4.0K - Old workflow design examples
├── docs/                              33M - Archived documentation (413 → 71 reduction)
├── examples/                         4.0K - Code examples (curl scripts)
├── exports-2025-10-05/               3.9M - Data exports from Oct 5, 2025
├── logs-2025-10-05/                 604K - System logs from Oct 5, 2025
├── outdated-bmad-reports/           284K - Old BMAD phase reports
├── outdated-configs/                 1.7M - Old configuration files
├── outdated-docs/                    4.0K - Deprecated documentation
├── outdated-tests/                   4.0K - Old test files
├── outdated-webflow-ready-oct1-2025/ 1.4M - Old Webflow deployment files (Oct 1)
├── outdated-website/                 2.5M - Previous website iterations
├── outdated-website-docs/            8.0K - Old website documentation
└── system-misc/                     268K - Miscellaneous archived system files
```

---

## 📋 What's Archived Here

### **Documentation (docs/ - 33M)**
- **What**: 342+ markdown files from documentation consolidation (Oct 5, 2025)
- **Why Archived**: Consolidated from 413 files to 71 active files in `/docs/`
- **Contents**: BMAD reports, old analysis docs, redundant guides, conflicting documentation
- **Retention**: Keep for 6 months (until April 2026), then delete

### **Website Iterations (outdated-website/ - 2.5M)**
- **What**: Previous versions of the Rensto website
  - lead-machine-form.html
  - lead-machine-production.html
  - lead-machine-unified/ (project folder, node_modules deleted Oct 5)
  - rensto-landing/ (old landing page)
  - root-cleanup/ (cleanup artifacts)
- **Why Archived**: Replaced by current apps/web/rensto-site/
- **Note**: node_modules deleted (saved 307M) - can reinstall with `npm install` if needed
- **Retention**: Keep for 3 months (until January 2026), then delete

### **Configurations (outdated-configs/ - 1.7M)**
- **What**: 66 old configuration files
- **Why Archived**: Replaced by current `/configs/` structure
- **Retention**: Keep for 6 months (until April 2026)

### **BMAD Reports (outdated-bmad-reports/ - 284K)**
- **What**: 32 old BMAD phase analysis reports
- **Why Archived**: Work completed, reports superseded by newer versions
- **Retention**: Keep for 12 months (until October 2026) - historical value

### **Webflow Files (outdated-webflow-ready-oct1-2025/ - 1.4M)**
- **What**: 28 old Webflow deployment files from Oct 1, 2025
- **Why Archived**: Replaced by `/webflow/pages/` structure (Oct 5, 2025)
- **Retention**: Keep for 3 months (until January 2026)

### **Conflicting Documentation (conflicting-docs/ - 2.5M)**
- **What**: 264 markdown files with conflicting/duplicate information
- **Why Archived**: Resolved conflicts, consolidated into CLAUDE.md single source of truth
- **Retention**: Keep for 6 months (until April 2026)

### **Backups & Exports (7.6M total)**
- **backups-2025-10-05/** (3.7M) - System backups
- **exports-2025-10-05/** (3.9M) - Data exports
- **Why Archived**: Point-in-time snapshots from major reorganization
- **Retention**: Keep for 3 months (until January 2026)

### **Logs (logs-2025-10-05/ - 604K)**
- **What**: 29 system log files from Oct 5, 2025
- **Why Archived**: Historical logs from reorganization
- **Retention**: Keep for 1 month (until November 2025), then delete

### **Miscellaneous**
- **designs/** (4KB) - workflow-examples.json
- **examples/** (4KB) - curl/n8n-webhook-signed.sh
- **outdated-docs/** (4KB) - Small deprecated docs
- **outdated-tests/** (4KB) - Old test files
- **outdated-website-docs/** (8KB) - Old website documentation
- **system-misc/** (268K) - Misc archived system files
- **Retention**: Keep for 6 months

---

## 📅 Retention Policy

| Archive Type | Retention Period | Delete After |
|--------------|------------------|--------------|
| Logs | 1 month | November 2025 |
| Backups & Exports | 3 months | January 2026 |
| Website Files | 3 months | January 2026 |
| Webflow Files | 3 months | January 2026 |
| Configurations | 6 months | April 2026 |
| Documentation | 6 months | April 2026 |
| Conflicting Docs | 6 months | April 2026 |
| BMAD Reports | 12 months | October 2026 |

### **Retention Guidelines:**
1. **Keep for minimum period** based on type above
2. **After retention period expires**: Review, then delete or compress to `.tar.gz`
3. **Exception**: Keep indefinitely if historical value (rare)
4. **Audit frequency**: Every 3 months (next: January 2026)

---

## 🔄 How to Restore

### **Restoring Documentation**
```bash
# Copy specific file back to active docs
cp archives/docs/EXAMPLE_FILE.md docs/

# Or restore entire directory
cp -r archives/docs/specific-topic/ docs/
```

### **Restoring Website Files**
```bash
# Restore archived website project
cp -r archives/outdated-website/lead-machine-unified /path/to/restore/

# Reinstall dependencies (node_modules was deleted)
cd /path/to/restore/lead-machine-unified
npm install
```

### **Restoring Configurations**
```bash
# Copy specific config
cp archives/outdated-configs/example-config.json configs/

# Review before using (likely outdated)
```

### **Restoring from Backups**
```bash
# Extract backup
tar -xzf archives/backups-2025-10-05/backup-name.tar.gz

# Verify contents before restoring
```

---

## 🗑️ Cleanup Operations

### **October 5, 2025 Cleanup:**
- ❌ Deleted `archives/active/` (0B, completely empty)
- ❌ Deleted `archives/outdated-website/lead-machine-unified/node_modules/` (307M)
  - **Space saved**: 307M (can reinstall with `npm install` if needed)
- ✅ **Result**: Reduced from 358M → 51M (86% reduction)

### **Next Cleanup (November 2025):**
- [ ] Delete logs-2025-10-05/ (1 month retention expired)
- [ ] Audit other archives for expiration

### **Future Cleanup (January 2026):**
- [ ] Delete backups-2025-10-05/ (3 month retention expired)
- [ ] Delete exports-2025-10-05/ (3 month retention expired)
- [ ] Delete outdated-website/ (3 month retention expired)
- [ ] Delete outdated-webflow-ready-oct1-2025/ (3 month retention expired)

---

## ⚠️ Important Notes

### **DO NOT Archive:**
- Active code or documentation
- Current configurations
- Dependencies that can be regenerated (node_modules, .next, dist, build)
- Secrets or credentials (use secure vault instead)
- Large binary files (use cloud storage)

### **What TO Archive:**
- Code/docs being replaced (before deletion)
- Historical snapshots (before major refactors)
- Resolved conflicts (for reference)
- Completed project phases (BMAD reports)

### **Archive Naming Convention:**
```
outdated-{type}-{date}
  Example: outdated-webflow-ready-oct1-2025

backups-{date}
  Example: backups-2025-10-05

logs-{date}
  Example: logs-2025-10-05
```

---

## 📊 Archive Statistics

**Current Size**: 51M (down from 358M)

**Space Savings**: 307M (86% reduction)

**Largest Archives**:
1. docs/ - 33M (64% of total)
2. exports-2025-10-05/ - 3.9M (8%)
3. backups-2025-10-05/ - 3.7M (7%)
4. conflicting-docs/ - 2.5M (5%)
5. outdated-website/ - 2.5M (5%)

**Total Archives**: 17 directories

**Oldest Archive**: September 1, 2025 (examples/)

**Newest Archive**: October 5, 2025 (docs/, backups/, exports/)

---

## 🔐 Git Exclusion

**Status**: ✅ Excluded from git (via .gitignore)

```gitignore
# .gitignore
archives/
archived/
```

**Why**: Archives are large and change frequently. Keep locally but don't commit to repo.

**Exception**: This README.md is tracked in git for documentation purposes.

---

## 📞 Questions?

If you need to restore something from archives or have questions about retention policy, refer to CLAUDE.md or contact the Rensto development team.

---

**Last Updated:** October 5, 2025
**Next Audit:** January 2026 (3 months)
**Maintained By:** Rensto Team
