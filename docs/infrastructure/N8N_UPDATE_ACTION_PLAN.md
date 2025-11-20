# n8n Update Action Plan - 1.119.1

**Status**: Ready to execute ✅  
**Date**: November 11, 2025  
**Current Version**: 1.115.0  
**Target Version**: 1.119.1  

**✅ TERMINAL FIXED**: Terminal commands now work using `/bin/sh`  
**📋 See**: `docs/infrastructure/TERMINAL_FIX.md` for details

---

## ✅ Pre-Update Checklist

### Workflow Fixes Applied
- ✅ Fixed Parse CSV node (`binaryPropertyName` added)
- ✅ Fixed file path (changed to `/home/node/.n8n/data/products.csv`)
- ⚠️ **Action Required**: Upload CSV file to VPS before running workflow

### Script Ready
- ✅ Backup & update script created: `scripts/n8n-backup-and-update-1.119.1.sh`
- ✅ Script handles: workflows, credentials, community nodes, data volume
- ✅ Script includes rollback capability

---

## 🚀 Execution Steps

### Step 1: Upload CSV File to VPS

```bash
# From local machine
scp scripts/boost-space/exports/products.csv root@173.254.201.134:/tmp/products.csv

# SSH into VPS
ssh root@173.254.201.134

# Copy to n8n data directory
docker exec n8n_rensto mkdir -p /home/node/.n8n/data
docker cp /tmp/products.csv n8n_rensto:/home/node/.n8n/data/products.csv
```

### Step 2: Upload Update Script

```bash
# From local machine
scp scripts/n8n-backup-and-update-1.119.1.sh root@173.254.201.134:/opt/n8n/
```

### Step 3: Run Backup & Update

```bash
# SSH into VPS
ssh root@173.254.201.134

# Navigate to n8n directory
cd /opt/n8n

# Make script executable
chmod +x n8n-backup-and-update-1.119.1.sh

# Run with auto-confirm (non-interactive)
bash n8n-backup-and-update-1.119.1.sh --yes
```

**Expected Output**:
- Backup created in `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`
- n8n updated to 1.119.1
- Health check passed
- Version verified

### Step 4: Verify Update

```bash
# Check version
docker exec n8n_rensto n8n --version

# Check health
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy" || echo "❌ Not healthy"

# Check logs
docker logs n8n_rensto --tail 50
```

### Step 5: Validate Workflow (After Update)

1. Access n8n UI: http://173.254.201.134:5678
2. Import workflow: `workflows/INT-SYNC-002-BOOST-SPACE-MARKETPLACE-IMPORT.json`
3. Use validation tools to check nodes:
   - Read Binary File node
   - Parse CSV node
   - HTTP Request nodes
4. Test execution manually
5. Verify products imported to Boost.space

---

## 🔍 Post-Update Validation

### Validation Tools Should Now Work

After update to 1.119.1, validation tools should work because:
- Database schema updated (includes `node_type` column)
- API endpoints updated
- Node validation logic updated

### Test Validation

```bash
# Use n8n MCP tools to validate workflow
# Or use n8n UI validation feature
```

---

## 📋 Migration Next Steps (After Validation)

1. ✅ Validate INT-SYNC-002 workflow
2. ✅ Test import (products.csv → Boost.space)
3. ✅ Create import workflows for:
   - Affiliate Links (affiliates.csv)
   - Purchases (purchases.csv - when available)
4. ✅ Update API routes to use Boost.space
5. ✅ Test marketplace page functionality

---

## 🛡️ Rollback Plan

If update fails:

```bash
# Stop n8n
cd /opt/n8n
docker-compose stop n8n

# Restore docker-compose.yml
cp docker-compose.yml.backup-YYYYMMDD-HHMMSS docker-compose.yml

# Restore data volume (if needed)
docker run --rm -v n8n_n8n_data:/data -v /root/n8n-backups/YYYY-MM-DD_HHMMSS:/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Start n8n
docker-compose up -d n8n
```

---

## ⚠️ Known Issues Fixed

1. ✅ **Parse CSV node**: Added `binaryPropertyName: "data"` at top level
2. ✅ **File path**: Changed to VPS path `/home/node/.n8n/data/products.csv`
3. ⚠️ **CSV file location**: Needs to be uploaded to VPS before workflow runs

---

## 📝 Notes

- Backup location: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`
- Update downtime: ~2-5 minutes
- Validation tools will work after update (fixes "no such column: node_type" error)
- Workflow fixes applied but need validation after update

---

**Ready to execute**: All preparations complete. Run Step 1-3 to update n8n.

