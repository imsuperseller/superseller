# n8n Update to 1.122.5 - Execution Plan

**Date**: January 2, 2025  
**Current Version**: 1.122.0 (or 1.122.1)  
**Target Version**: 1.122.5  
**Server**: RackNerd VPS (173.254.201.134)

---

## 📋 Overview

This document outlines the complete process to:
1. ✅ Backup current n8n instance (version, workflows, credentials, community nodes)
2. ✅ Update n8n to version 1.122.5
3. ✅ Verify update success and confirm nothing lost
4. ✅ Clean up old backup files from before 1.122.0

---

## 📚 Related Documentation

### **Backup & Update Scripts**:
- `scripts/n8n-backup-and-update-1.122.5.sh` - **NEW** - Main update script for 1.122.5
- `scripts/n8n-backup-and-update-1.122.0.sh` - Previous script (targets 1.122.1)
- `scripts/n8n-backup-and-update-1.119.1.sh` - Old script (pre-1.122.0)
- `scripts/n8n-backup-and-update-1.118.2.sh` - Old script (pre-1.122.0)

### **Documentation**:
- `docs/infrastructure/N8N_BACKUP_AND_UPDATE_GUIDE.md` - General backup guide
- `docs/infrastructure/N8N_UPDATE_TO_1.122.0_PLAN.md` - Previous update plan
- `docs/infrastructure/N8N_1.122.0_FEATURES_SUMMARY.md` - Features in 1.122.0

---

## 🛡️ Phase 1: Pre-Update Verification (5 minutes)

### **1.1 Check Current State**

```bash
ssh root@173.254.201.134
cd /opt/n8n

# Check current version
docker exec n8n_rensto n8n --version

# Check container status
docker ps | grep n8n_rensto

# Check disk space (need at least 2GB for backup)
df -h

# Check database size
docker exec n8n_rensto du -sh /home/node/.n8n/database.sqlite
```

### **1.2 Verify Backup Location**

```bash
# Ensure backup directory exists
mkdir -p /root/n8n-backups

# Check available space
df -h /root
```

---

## 💾 Phase 2: Comprehensive Backup (10-15 minutes)

### **What Gets Backed Up**:

1. ✅ **Workflows** - All workflows via n8n CLI export
2. ✅ **Credentials** - All credentials (decrypted for restore)
3. ✅ **Community Nodes** - Complete `/home/node/custom` directory
4. ✅ **Data Volume** - Complete n8n data (includes database, user accounts, settings)
5. ✅ **docker-compose.yml** - Current configuration
6. ✅ **Backup Manifest** - Metadata about the backup

### **Backup Location**: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`

### **Critical**: The data volume backup includes:
- ✅ Database (workflows, credentials, execution history)
- ✅ User accounts (login credentials preserved)
- ✅ Settings
- ✅ Community nodes
- ✅ All files in `/home/node/.n8n/`

### **Execute Backup**:

```bash
# Upload script to VPS
scp scripts/n8n-backup-and-update-1.122.5.sh root@173.254.201.134:/opt/n8n/

# SSH into VPS
ssh root@173.254.201.134

# Make script executable
cd /opt/n8n
chmod +x n8n-backup-and-update-1.122.5.sh

# Run backup (will prompt for update confirmation)
bash n8n-backup-and-update-1.122.5.sh

# OR run with auto-confirm
bash n8n-backup-and-update-1.122.5.sh --yes
```

The script will:
1. ✅ Create timestamped backup directory
2. ✅ Export workflows, credentials, community nodes
3. ✅ Backup data volume
4. ✅ Create backup manifest
5. ✅ Verify backup integrity
6. ✅ Ask for confirmation before updating

---

## 🚀 Phase 3: Update Process (5-10 minutes)

The script automatically handles:
1. ✅ Stop n8n container
2. ✅ Update docker-compose.yml to 1.122.5
3. ✅ Pull new Docker image
4. ✅ Start n8n container
5. ✅ Wait for health check
6. ✅ Verify new version

**Manual Steps** (if needed):

```bash
cd /opt/n8n

# Stop n8n
docker-compose stop n8n

# Update docker-compose.yml
sed -i 's|image: n8nio/n8n:.*|image: n8nio/n8n:1.122.5|g' docker-compose.yml

# Pull new image
docker-compose pull n8n

# Start n8n
docker-compose up -d n8n
```

---

## ✅ Phase 4: Post-Update Verification (5 minutes)

### **4.1 Version Check**

```bash
docker exec n8n_rensto n8n --version
# Should show: 1.122.5
```

### **4.2 Health Check**

```bash
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy" || echo "❌ Not healthy"
```

### **4.3 Access UI**

- Open: http://173.254.201.134:5678
- Verify you can login (credentials preserved)
- Check workflow count matches pre-update
- Check credentials count matches pre-update

### **4.4 Verify Components**

```bash
# Check community nodes
docker exec n8n_rensto ls -la /home/node/custom

# Check logs for errors
docker logs n8n_rensto --tail 50

# Count workflows (should match pre-update)
docker exec n8n_rensto n8n export:workflow --all --output=/tmp/workflows.json
docker exec n8n_rensto cat /tmp/workflows.json | grep -c '"id"'
```

### **4.5 Test Workflow**

- Execute a simple workflow
- Verify it runs successfully
- Check execution history is preserved

---

## 🧹 Phase 5: Cleanup Old Backup Files

### **5.1 Identify Old Backup Files**

Old backup files to delete (from before 1.122.0):
- `scripts/n8n-backup-and-update-1.118.2.sh`
- `scripts/n8n-backup-and-update-1.119.1.sh`
- `scripts/n8n-backup-and-update-1.119.1-EXECUTE.md`
- `scripts/n8n-backup-and-update-1.119.1-INSTRUCTIONS.md`

**Note**: Keep `scripts/n8n-backup-and-update-1.122.0.sh` for reference (may be useful)

### **5.2 Cleanup Script**

```bash
# From local machine
cd /Users/shaifriedman/New\ Rensto/rensto

# Delete old backup scripts (pre-1.122.0)
rm scripts/n8n-backup-and-update-1.118.2.sh
rm scripts/n8n-backup-and-update-1.119.1.sh
rm scripts/n8n-backup-and-update-1.119.1-EXECUTE.md
rm scripts/n8n-backup-and-update-1.119.1-INSTRUCTIONS.md

# Optional: Archive instead of delete
mkdir -p scripts/archive/pre-1.122.0
mv scripts/n8n-backup-and-update-1.118.2.sh scripts/archive/pre-1.122.0/
mv scripts/n8n-backup-and-update-1.119.1.sh scripts/archive/pre-1.122.0/
mv scripts/n8n-backup-and-update-1.119.1-EXECUTE.md scripts/archive/pre-1.122.0/
mv scripts/n8n-backup-and-update-1.119.1-INSTRUCTIONS.md scripts/archive/pre-1.122.0/
```

### **5.3 Cleanup VPS Backup Directories** (Optional)

```bash
# SSH into VPS
ssh root@173.254.201.134

# List all backups
ls -lah /root/n8n-backups/

# Identify backups from before 1.122.0 (check backup-manifest.json)
# Only delete if you're confident they're no longer needed
# Keep at least the most recent backup from 1.122.0+

# Example: Delete backups older than 30 days (be careful!)
find /root/n8n-backups -type d -mtime +30 -exec rm -rf {} \;
```

---

## 🚨 Rollback Plan (If Update Fails)

### **Quick Rollback** (5 minutes)

```bash
cd /opt/n8n

# Stop n8n
docker-compose stop n8n

# Restore docker-compose.yml
cp docker-compose.yml.backup-YYYYMMDD-HHMMSS docker-compose.yml

# Restore data volume (if needed)
BACKUP_DIR="/root/n8n-backups/YYYY-MM-DD_HHMMSS"
docker run --rm -v n8n_n8n_data:/data -v "$BACKUP_DIR":/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Start n8n
docker-compose up -d n8n
```

### **Full Restore** (10 minutes)

If quick rollback doesn't work:

1. **Restore Workflows**:
   ```bash
   docker cp "$BACKUP_DIR/workflows.all.json" n8n_rensto:/tmp/workflows.json
   docker exec n8n_rensto n8n import:workflow --input=/tmp/workflows.json
   ```

2. **Restore Credentials**:
   ```bash
   docker cp "$BACKUP_DIR/credentials.decrypted.json" n8n_rensto:/tmp/credentials.json
   docker exec n8n_rensto n8n import:credentials --input=/tmp/credentials.json
   ```

3. **Restore Community Nodes**:
   ```bash
   docker cp "$BACKUP_DIR/community-nodes-backup.tgz" n8n_rensto:/tmp/
   docker exec n8n_rensto tar xzf /tmp/community-nodes-backup.tgz -C /home/node/custom
   docker exec n8n_rensto sh -c 'cd /home/node/custom && npm install'
   ```

---

## ⚠️ Critical Do's and Don'ts

### ✅ **DO**:
- ✅ Backup everything before update
- ✅ Verify backups are complete
- ✅ Stop container before update
- ✅ Update docker-compose.yml image tag
- ✅ Verify version after update
- ✅ Test workflows after update
- ✅ Keep backup for at least 7 days

### ❌ **DON'T**:
- ❌ **DON'T** touch the database during update
- ❌ **DON'T** run database cleanup during update
- ❌ **DON'T** delete volumes (`docker-compose down -v`)
- ❌ **DON'T** skip backup verification
- ❌ **DON'T** update without backup
- ❌ **DON'T** delete old backups immediately

---

## 📊 Success Criteria

Update is successful if:
- ✅ Version is 1.122.5
- ✅ Health check passes
- ✅ Can login (credentials preserved)
- ✅ All workflows present
- ✅ All credentials present
- ✅ Community nodes installed
- ✅ At least one workflow executes successfully
- ✅ No critical errors in logs

---

## 🛡️ Data Preservation Guarantee

**What is Preserved**:
- ✅ All workflows (in database + JSON backup)
- ✅ All credentials (in database + JSON backup)
- ✅ All user accounts (in database backup)
- ✅ All settings (in database backup)
- ✅ All community nodes (in directory backup)
- ✅ Execution history (in database backup)

**What Might Be Lost** (if rollback needed):
- ⚠️ New executions after update (if rollback happens)
- ⚠️ Settings changes after update (if rollback happens)

**Backup Retention**: Keep backups for 7 days minimum

---

## 📝 Execution Checklist

- [ ] Pre-update verification completed
- [ ] Backup script uploaded to VPS
- [ ] Backup completed successfully
- [ ] Backup integrity verified
- [ ] Update executed
- [ ] Version verified (1.122.5)
- [ ] Health check passed
- [ ] Login successful
- [ ] Workflows verified
- [ ] Credentials verified
- [ ] Community nodes verified
- [ ] Test workflow executed successfully
- [ ] Old backup files cleaned up (optional)
- [ ] Documentation updated

---

**Last Updated**: January 2, 2025  
**Based On**: Successful 1.122.0 update process  
**Script**: `scripts/n8n-backup-and-update-1.122.5.sh`
