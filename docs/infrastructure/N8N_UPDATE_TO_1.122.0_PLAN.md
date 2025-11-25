# n8n Update to 1.122.0 - Comprehensive Plan

**Date**: November 25, 2025  
**Current Version**: 1.119.1  
**Target Version**: 1.122.0  
**Server**: RackNerd VPS (173.254.201.134)

---

## 📚 Lessons Learned from Previous Updates

### ✅ **What Worked (1.119.1 Update)**

1. **Comprehensive Backup Strategy**:
   - ✅ Backup workflows via n8n CLI export
   - ✅ Backup credentials (decrypted for restore)
   - ✅ Backup community nodes from `/home/node/custom`
   - ✅ Backup complete data volume (includes database)
   - ✅ Backup docker-compose.yml
   - ✅ Create backup manifest with metadata

2. **Safe Update Process**:
   - ✅ Stop container before update
   - ✅ Update docker-compose.yml image tag
   - ✅ Pull new image
   - ✅ Start container
   - ✅ Verify health and version
   - ✅ Use `/bin/sh` for script compatibility

3. **Verification Steps**:
   - ✅ Check version after update
   - ✅ Health check endpoint
   - ✅ Log inspection
   - ✅ Workflow count verification

### ❌ **What Went Wrong (Previous Mistakes)**

1. **Database Cleanup During Update** (Nov 12, 2025):
   - ❌ **MISTAKE**: Database was reset to free disk space
   - ❌ **RESULT**: Lost execution history (5.9GB → 572KB)
   - ✅ **LESSON**: Never touch database during update - only backup it
   - ✅ **FIX**: Workflows/credentials were backed up first, so they were restorable

2. **Not Preserving Login Credentials**:
   - ❌ **MISTAKE**: Admin user was lost during database reset
   - ✅ **LESSON**: Login credentials are in database - backing up database preserves them
   - ✅ **FIX**: Complete data volume backup includes all user accounts

3. **Insufficient Verification**:
   - ❌ **MISTAKE**: Didn't verify all components after update
   - ✅ **LESSON**: Verify workflows, credentials, community nodes, AND user accounts

---

## 🛡️ **Update Plan for 1.122.0**

### **Phase 1: Pre-Update Verification** (5 minutes)

1. **Check Current State**:
   ```bash
   ssh root@173.254.201.134
   cd /opt/n8n
   
   # Check current version
   docker exec n8n_rensto n8n --version
   
   # Check container status
   docker ps | grep n8n_rensto
   
   # Check disk space
   df -h
   
   # Check database size
   docker exec n8n_rensto du -sh /home/node/.n8n/database.sqlite
   ```

2. **Verify Backup Location**:
   ```bash
   # Ensure backup directory exists
   mkdir -p /root/n8n-backups
   
   # Check available space (need at least 2GB)
   df -h /root
   ```

### **Phase 2: Comprehensive Backup** (10-15 minutes)

**What Gets Backed Up**:
1. ✅ **Workflows** - All workflows via n8n CLI export
2. ✅ **Credentials** - All credentials (decrypted for restore)
3. ✅ **Community Nodes** - Complete `/home/node/custom` directory
4. ✅ **Data Volume** - Complete n8n data (includes database, user accounts, settings)
5. ✅ **docker-compose.yml** - Current configuration
6. ✅ **Backup Manifest** - Metadata about the backup

**Backup Location**: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`

**Critical**: The data volume backup includes:
- ✅ Database (workflows, credentials, execution history)
- ✅ User accounts (login credentials preserved)
- ✅ Settings
- ✅ Community nodes
- ✅ All files in `/home/node/.n8n/`

### **Phase 3: Update Process** (5-10 minutes)

1. **Stop n8n**:
   ```bash
   cd /opt/n8n
   docker-compose stop n8n
   ```

2. **Update docker-compose.yml**:
   ```bash
   # Backup current docker-compose.yml
   cp docker-compose.yml docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)
   
   # Update image version
   sed -i 's|image: n8nio/n8n:.*|image: n8nio/n8n:1.122.0|g' docker-compose.yml
   ```

3. **Pull New Image**:
   ```bash
   docker-compose pull n8n
   ```

4. **Start n8n**:
   ```bash
   docker-compose up -d n8n
   ```

5. **Wait for Health**:
   ```bash
   # Wait up to 60 seconds for n8n to be healthy
   for i in {1..30}; do
     if docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz 2>/dev/null; then
       echo "✅ n8n is healthy!"
       break
     fi
     sleep 2
   done
   ```

### **Phase 4: Post-Update Verification** (5 minutes)

1. **Version Check**:
   ```bash
   docker exec n8n_rensto n8n --version
   # Should show: 1.122.0
   ```

2. **Health Check**:
   ```bash
   docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy" || echo "❌ Not healthy"
   ```

3. **Access UI**:
   - Open: http://173.254.201.134:5678
   - Verify you can login (credentials preserved)
   - Check workflow count matches pre-update
   - Check credentials count matches pre-update

4. **Verify Components**:
   ```bash
   # Check community nodes
   docker exec n8n_rensto ls -la /home/node/custom
   
   # Check logs for errors
   docker logs n8n_rensto --tail 50
   ```

5. **Test Workflow**:
   - Execute a simple workflow
   - Verify it runs successfully

---

## 🚨 **Rollback Plan** (If Update Fails)

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

## ⚠️ **Critical Do's and Don'ts**

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

## 📋 **Automated Script**

The script `scripts/n8n-backup-and-update-1.122.0.sh` will:
1. ✅ Create timestamped backup directory
2. ✅ Backup workflows, credentials, community nodes, data volume
3. ✅ Create backup manifest
4. ✅ Verify backup integrity
5. ✅ Update docker-compose.yml
6. ✅ Pull new image
7. ✅ Start n8n
8. ✅ Verify update success
9. ✅ Report final status

**Usage**:
```bash
# Upload script to VPS
scp scripts/n8n-backup-and-update-1.122.0.sh root@173.254.201.134:/opt/n8n/

# SSH into VPS
ssh root@173.254.201.134

# Run script
cd /opt/n8n
chmod +x n8n-backup-and-update-1.122.0.sh
bash n8n-backup-and-update-1.122.0.sh --yes
```

---

## 🔍 **Version Compatibility**

**Updating from**: 1.119.1 → 1.122.0

**Breaking Changes**: Check n8n release notes for 1.120.0, 1.121.0, 1.122.0

**Expected Compatibility**: Should be compatible (minor version updates)

**Test After Update**:
- ✅ All workflows execute
- ✅ All credentials work
- ✅ Community nodes function
- ✅ API endpoints respond
- ✅ Webhooks receive requests

---

## 📊 **Success Criteria**

Update is successful if:
- ✅ Version is 1.122.0
- ✅ Health check passes
- ✅ Can login (credentials preserved)
- ✅ All workflows present
- ✅ All credentials present
- ✅ Community nodes installed
- ✅ At least one workflow executes successfully
- ✅ No critical errors in logs

---

## 🛡️ **Data Preservation Guarantee**

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

**Last Updated**: November 25, 2025  
**Based On**: Successful 1.119.1 update process  
**Avoids**: Database cleanup mistakes from Nov 12, 2025

