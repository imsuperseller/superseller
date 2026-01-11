# Deep Cleanup Recommendations

**Date**: November 12, 2025  
**Current Disk Usage**: 77% (23.14GB / 30GB, 6.86GB free)  
**Status**: ✅ Good, but optimization opportunities exist

---

## 🔍 Analysis Results

### Major Finding: n8n Database is 5.9GB! ⚠️

**Location**: `/var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite`  
**Size**: 5.9GB  
**Issue**: Execution history accumulating  
**Impact**: This is the largest single file on the server

### Other Opportunities

| Item | Size | Action | Priority |
|------|------|--------|----------|
| **n8n Database** | 5.9GB | Clean execution history | 🔴 **HIGH** |
| `/opt/rensto-old` | 566MB | Delete if not needed | 🟡 Medium |
| `/opt/backups` | 131MB | Delete old backups | 🟡 Medium |
| Docker overlay | 7GB | Prune unused layers | 🟢 Low |
| APT cache | 36MB | Already clean | ✅ Done |

---

## 🎯 Recommended Actions

### Priority 1: Clean n8n Execution History (Can free ~4-5GB)

**Current**: 5.9GB database  
**Target**: <1GB database  
**Method**: Via n8n UI

**Method 1: Via SQL Script (Recommended)**

n8n already has pruning configured via environment variables, but you can manually trigger cleanup:

```bash
ssh root@172.245.56.50
cd /opt/n8n
bash n8n-database-cleanup-sql.sh
```

This script will:
- Backup database first
- Delete executions older than 7 days
- Vacuum database to reclaim space
- Show space freed

**Method 2: Via n8n API (if available)**

The pruning is configured via environment variables:
- `EXECUTIONS_DATA_PRUNE=true`
- `EXECUTIONS_DATA_MAX_AGE=168` (7 days)
- `EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000`

Pruning should run automatically, but if it's not working, use Method 1.

**Expected Result**: Database reduces from 5.9GB to ~500MB-1GB

### Priority 2: Delete Old Directories (~700MB)

**Safe to delete** (if confirmed not needed):

```bash
# Delete old rensto version (from August)
rm -rf /opt/rensto-old  # Frees ~566MB

# Delete old backups (from September/October)
rm -rf /opt/backups  # Frees ~131MB
```

**Before deleting**: Verify these are not needed!

### Priority 3: Docker Prune (Optional, ~500MB-1GB)

**Warning**: Only if you're sure no containers need these layers

```bash
# Prune unused Docker resources
docker system prune -a --volumes
```

**Risk**: May remove layers needed for future container rebuilds

---

## 📊 Impact Analysis

### Current State
- **Disk Usage**: 77% (23.14GB / 30GB)
- **Free Space**: 6.86GB
- **Status**: ✅ Healthy

### After Priority 1 (n8n cleanup)
- **Disk Usage**: ~60% (18GB / 30GB)
- **Free Space**: ~12GB
- **Improvement**: +5GB freed

### After All Optimizations
- **Disk Usage**: ~55% (16.5GB / 30GB)
- **Free Space**: ~13.5GB
- **Total Improvement**: +6.7GB freed

---

## 🚀 Quick Win: Clean n8n Database

**This alone can free 4-5GB!**

1. **Access n8n UI**: http://172.245.56.50:5678
2. **Settings → Data Management**
3. **Execution Data Retention**: Set to **7 days**
4. **Save**

**Result**: Database will shrink from 5.9GB to ~500MB-1GB

---

## 📋 Cleanup Scripts

### Created Scripts

1. **`vps-deep-cleanup.sh`** - Analysis script
   - Identifies optimization opportunities
   - Shows what can be cleaned

2. **`n8n-database-cleanup.sh`** - Database cleanup guide
   - Instructions for cleaning n8n database
   - Shows current database size

### Usage

```bash
# Run analysis
ssh root@172.245.56.50
cd /opt/n8n
bash vps-deep-cleanup.sh

# Check database size
bash n8n-database-cleanup.sh
```

---

## ⚠️ Important Notes

### Before Deleting Anything

1. **Backup first**: Always backup before major deletions
2. **Verify**: Confirm directories/files are not needed
3. **Test**: Test that services still work after cleanup

### n8n Database Cleanup

- **Safe**: Cleaning execution history is safe
- **Reversible**: Can't recover deleted executions (but that's the point)
- **Automatic**: n8n handles cleanup automatically after setting retention

---

## 💡 Recommendation

**At 77% usage, you're in good shape**, but:

1. ✅ **Do Priority 1** (n8n database cleanup) - Easy win, frees 4-5GB
2. ⚠️ **Review Priority 2** (old directories) - Verify before deleting
3. ⏸️ **Skip Priority 3** (Docker prune) - Not urgent, some risk

**After Priority 1**: You'll have ~12GB free (60% usage) - excellent!

---

## 📊 Space Breakdown (Current)

| Category | Size | % of Total |
|----------|------|------------|
| **n8n Database** | 5.9GB | 20% |
| **Docker Overlay** | 7GB | 23% |
| **n8n Data Volume** | 6.3GB | 21% |
| **System Files** | ~4GB | 13% |
| **Other** | ~1GB | 3% |
| **Total Used** | 23.14GB | 77% |

---

**Status**: ✅ Good shape, but n8n database cleanup recommended  
**Next Action**: Clean n8n execution history (Priority 1)

