# n8n Backup & Update Scripts Summary

**Last Updated**: January 2, 2025  
**Purpose**: Complete inventory of all n8n backup and update scripts and documentation

---

## 📚 Scripts & Documentation Found

### **✅ Active Scripts** (Current/Recommended)

| Script | Version | Status | Purpose |
|--------|---------|--------|---------|
| `scripts/n8n-backup-and-update-1.122.5.sh` | 1.122.5 | ✅ **NEW** | **Use this for 1.122.5 update** |
| `scripts/n8n-backup-and-update-1.122.0.sh` | 1.122.1 | ⚠️ Outdated | Previous script (targets 1.122.1, not 1.122.5) |

### **🗑️ Old Scripts** (Pre-1.122.0 - Can be deleted)

| Script | Version | Status | Action |
|--------|---------|--------|--------|
| `scripts/n8n-backup-and-update-1.119.1.sh` | 1.119.1 | ❌ Old | Delete or archive |
| `scripts/n8n-backup-and-update-1.118.2.sh` | 1.118.2 | ❌ Old | Delete or archive |
| `scripts/n8n-backup-and-update-1.119.1-EXECUTE.md` | N/A | ❌ Old | Delete or archive |
| `scripts/n8n-backup-and-update-1.119.1-INSTRUCTIONS.md` | N/A | ❌ Old | Delete or archive |

### **📖 Documentation**

| Document | Purpose | Status |
|---------|---------|--------|
| `docs/infrastructure/N8N_UPDATE_TO_1.122.5_PLAN.md` | ✅ **NEW** - Complete update plan for 1.122.5 | ✅ Current |
| `docs/infrastructure/N8N_UPDATE_TO_1.122.0_PLAN.md` | Previous update plan (1.122.0) | ⚠️ Reference |
| `docs/infrastructure/N8N_BACKUP_AND_UPDATE_GUIDE.md` | General backup guide (1.119.1) | ⚠️ Reference |
| `docs/infrastructure/N8N_1.122.0_FEATURES_SUMMARY.md` | Features in 1.122.0 | ✅ Reference |
| `docs/infrastructure/N8N_1.122.0_VERIFICATION.md` | Verification report for 1.122.0 | ✅ Reference |

### **🧹 Cleanup Script**

| Script | Purpose | Status |
|--------|---------|--------|
| `scripts/n8n-cleanup-old-backups.sh` | ✅ **NEW** - Removes old backup files | ✅ Ready |

---

## 🚀 Quick Start Guide

### **Step 1: Backup & Update to 1.122.5**

```bash
# Upload script to VPS
scp scripts/n8n-backup-and-update-1.122.5.sh root@173.254.201.134:/opt/n8n/

# SSH into VPS
ssh root@173.254.201.134

# Run backup and update
cd /opt/n8n
chmod +x n8n-backup-and-update-1.122.5.sh
bash n8n-backup-and-update-1.122.5.sh --yes
```

### **Step 2: Verify Update**

```bash
# Check version
docker exec n8n_rensto n8n --version
# Should show: 1.122.5

# Check health
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy"

# Access UI
# http://173.254.201.134:5678
```

### **Step 3: Cleanup Old Files** (Optional)

```bash
# From local machine
cd /Users/shaifriedman/New\ Rensto/rensto

# Run cleanup script
bash scripts/n8n-cleanup-old-backups.sh
```

---

## 📋 What Each Script Does

### **n8n-backup-and-update-1.122.5.sh**

**Purpose**: Complete backup and update to n8n 1.122.5

**Backs Up**:
1. ✅ Workflows (via n8n CLI export)
2. ✅ Credentials (decrypted for restore)
3. ✅ Community nodes (from `/home/node/custom`)
4. ✅ Data volume (complete n8n data directory - includes database, user accounts, settings)
5. ✅ docker-compose.yml

**Updates**:
1. ✅ Stops n8n container
2. ✅ Updates docker-compose.yml to 1.122.5
3. ✅ Pulls new Docker image
4. ✅ Starts n8n container
5. ✅ Verifies health and version

**Backup Location**: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`

**Usage**:
```bash
bash n8n-backup-and-update-1.122.5.sh          # Interactive
bash n8n-backup-and-update-1.122.5.sh --yes   # Auto-confirm
```

---

### **n8n-cleanup-old-backups.sh**

**Purpose**: Remove old backup scripts and documentation from before 1.122.0

**Files Removed**:
- `n8n-backup-and-update-1.118.2.sh`
- `n8n-backup-and-update-1.119.1.sh`
- `n8n-backup-and-update-1.119.1-EXECUTE.md`
- `n8n-backup-and-update-1.119.1-INSTRUCTIONS.md`

**Options**:
- Archive files (moves to `scripts/archive/pre-1.122.0/`)
- Delete files permanently

**Usage**:
```bash
bash scripts/n8n-cleanup-old-backups.sh
```

---

## 🔍 Script Comparison

### **n8n-backup-and-update-1.122.5.sh vs 1.122.0.sh**

| Feature | 1.122.5 | 1.122.0 |
|---------|---------|---------|
| Target Version | 1.122.5 | 1.122.1 |
| Backup Workflows | ✅ | ✅ |
| Backup Credentials | ✅ | ✅ |
| Backup Community Nodes | ✅ | ✅ |
| Backup Data Volume | ✅ | ✅ |
| Backup docker-compose.yml | ✅ | ✅ |
| Verify Backup Integrity | ✅ | ✅ |
| Update Process | ✅ | ✅ |
| Health Check | ✅ | ✅ |
| Version Verification | ✅ | ✅ |

**Recommendation**: Use `1.122.5.sh` for the latest update.

---

## 📊 Backup File Structure

Each backup creates a timestamped directory:

```
/root/n8n-backups/YYYY-MM-DD_HHMMSS/
├── n8n-data-backup.tgz          # Complete data volume (database, users, settings)
├── workflows.all.json            # All workflows export
├── credentials.decrypted.json    # All credentials (decrypted)
├── community-nodes-backup.tgz    # Community nodes directory
├── community-nodes-list.txt      # List of installed nodes
├── community-nodes-package.json  # package.json if exists
├── docker-compose.yml.backup     # docker-compose.yml backup
└── backup-manifest.json          # Backup metadata
```

---

## ⚠️ Important Notes

1. **Credentials Backup**: Contains **decrypted** credentials. Keep secure!
2. **Data Volume**: Includes database, user accounts, settings, execution history
3. **Login Credentials**: Preserved in database backup - no need to recreate admin account
4. **Backup Retention**: Keep backups for at least 7 days
5. **Old Scripts**: Can be safely deleted after confirming 1.122.5 update is successful

---

## 🚨 Rollback Instructions

If update fails, restore from backup:

```bash
cd /opt/n8n
BACKUP_DIR="/root/n8n-backups/YYYY-MM-DD_HHMMSS"

# Stop n8n
docker-compose stop n8n

# Restore data volume
docker run --rm -v n8n_n8n_data:/data -v "$BACKUP_DIR":/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Restore docker-compose.yml
cp "$BACKUP_DIR/docker-compose.yml.backup" docker-compose.yml

# Start n8n
docker-compose up -d n8n
```

---

## 📝 Execution Checklist

- [ ] Upload `n8n-backup-and-update-1.122.5.sh` to VPS
- [ ] Run backup and update script
- [ ] Verify version is 1.122.5
- [ ] Verify health check passes
- [ ] Verify login works
- [ ] Verify workflows are present
- [ ] Verify credentials are present
- [ ] Verify community nodes are installed
- [ ] Test a workflow execution
- [ ] Cleanup old backup files (optional)

---

**Last Updated**: January 2, 2025  
**Main Script**: `scripts/n8n-backup-and-update-1.122.5.sh`  
**Plan Document**: `docs/infrastructure/N8N_UPDATE_TO_1.122.5_PLAN.md`
