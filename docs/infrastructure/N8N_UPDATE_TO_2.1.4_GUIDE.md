# n8n Update to 2.1.4 - Quick Guide

**Date**: December 2025  
**Current Version**: 2.1.0  
**Target Version**: 2.1.4  
**Server**: RackNerd VPS (172.245.56.50)

---

## 📋 Overview

This guide covers:
1. ✅ Backup current n8n instance (workflows, credentials, community nodes, database)
2. ✅ Update n8n from 2.1.0 to 2.1.4
3. ✅ Clean up old backups (keep only most recent from 2.1.0)

---

## 🛡️ Step 1: Backup & Update to 2.1.4

### **Upload Script to VPS**

```bash
scp scripts/n8n-backup-and-update-2.1.4.sh root@172.245.56.50:/opt/n8n/
```

### **SSH into VPS and Run**

```bash
ssh root@172.245.56.50
cd /opt/n8n
chmod +x n8n-backup-and-update-2.1.4.sh

# Run with auto-confirm (recommended)
bash n8n-backup-and-update-2.1.4.sh --yes

# OR run interactively (will prompt for confirmation)
bash n8n-backup-and-update-2.1.4.sh
```

### **What the Script Does**

1. ✅ **Pre-flight checks** (Docker, disk space, container status)
2. ✅ **Backup workflows** (JSON export via n8n CLI)
3. ✅ **Backup credentials** (decrypted export)
4. ✅ **Backup community nodes** (packages + config)
5. ✅ **Backup user accounts & API keys** (from database)
6. ✅ **Backup complete data volume** (includes database, settings)
7. ✅ **Backup docker-compose.yml** (configuration)
8. ✅ **Create backup manifest** (metadata)
9. ✅ **Verify backup integrity**
10. ✅ **Update n8n to 2.1.4** (stop → pull image → start)
11. ✅ **Verify update** (version, workflows, credentials, users, community nodes)

### **Backup Location**

Backups are saved to: `/root/n8n-backups/YYYY-MM-DD_HHMMSS-upgrade-to-2.1.4/`

---

## 🧹 Step 2: Clean Up Old Backups

After successful update, clean up backups older than 2.1.0:

### **Upload Cleanup Script**

```bash
scp scripts/n8n-cleanup-backups-before-2.1.0.sh root@172.245.56.50:/opt/n8n/
```

### **Run Cleanup**

```bash
ssh root@172.245.56.50
cd /opt/n8n
chmod +x n8n-cleanup-backups-before-2.1.0.sh
bash n8n-cleanup-backups-before-2.1.0.sh
```

### **What the Cleanup Script Does**

1. ✅ Scans all backups in `/root/n8n-backups/`
2. ✅ Identifies backups from before 2.1.0 (checks manifest or directory name)
3. ✅ **Keeps only the most recent backup** (should be from 2.1.0)
4. ✅ Deletes all older backups
5. ✅ Shows summary of space freed

### **Safety Features**

- ✅ Shows what will be deleted before asking for confirmation
- ✅ Keeps the most recent backup as safety net
- ✅ Only deletes backups with version < 2.1.0
- ✅ Requires explicit "yes" confirmation

---

## ✅ Post-Update Verification

After update, verify:

1. ✅ **Login** with existing credentials
2. ✅ **Check version**: `docker exec n8n_rensto n8n --version` (should show 2.1.4)
3. ✅ **Verify workflows** are present and working
4. ✅ **Verify credentials** are working
5. ✅ **Verify community nodes** are installed
6. ✅ **Test a few workflows** to ensure they run correctly

---

## 🛡️ Rollback (If Needed)

If something goes wrong, rollback using the backup:

```bash
cd /opt/n8n
docker-compose stop n8n

# Restore docker-compose.yml
cp /root/n8n-backups/YYYY-MM-DD_HHMMSS-upgrade-to-2.1.4/docker-compose.yml.backup docker-compose.yml

# Restore data volume
tar xzf /root/n8n-backups/YYYY-MM-DD_HHMMSS-upgrade-to-2.1.4/n8n-data-complete.tgz -C /opt/n8n/data/n8n

# Start n8n
docker-compose up -d n8n
```

---

## 📚 Related Scripts

- `scripts/n8n-backup-and-update-2.1.4.sh` - Main update script
- `scripts/n8n-cleanup-backups-before-2.1.0.sh` - Cleanup old backups
- `scripts/n8n-backup-and-update-2.0.1.sh` - Previous version (reference)

---

## 🎯 Quick Command Reference

```bash
# 1. Upload and run update
scp scripts/n8n-backup-and-update-2.1.4.sh root@172.245.56.50:/opt/n8n/
ssh root@172.245.56.50 "cd /opt/n8n && chmod +x n8n-backup-and-update-2.1.4.sh && bash n8n-backup-and-update-2.1.4.sh --yes"

# 2. Upload and run cleanup
scp scripts/n8n-cleanup-backups-before-2.1.0.sh root@172.245.56.50:/opt/n8n/
ssh root@172.245.56.50 "cd /opt/n8n && chmod +x n8n-cleanup-backups-before-2.1.0.sh && bash n8n-cleanup-backups-before-2.1.0.sh"

# 3. Verify version
ssh root@172.245.56.50 "docker exec n8n_rensto n8n --version"
```

---

**✅ Ready to update? Follow Step 1, then Step 2, then verify!**

