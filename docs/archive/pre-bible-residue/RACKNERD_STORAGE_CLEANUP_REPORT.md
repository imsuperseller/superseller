# RackNerd Storage Cleanup Report

**Date**: November 7, 2025  
**Server**: 172.245.56.50  
**Action**: Post-update cleanup

---

## Initial Status

**Before Cleanup:**
- **Disk Usage**: 100% (28G/29G used, 0G available) ⚠️ **CRITICAL**
- **Status**: Disk full, system at risk

---

## Cleanup Actions Performed

### 1. Removed Old n8n Docker Image
- **Removed**: `n8nio/n8n:1.115.0` (980MB)
- **Kept**: `n8nio/n8n:1.118.2` (972MB)
- **Freed**: ~980MB

### 2. Docker System Prune
- **Removed**: 2 stopped containers
- **Removed**: Unused images and networks
- **Freed**: 1.077GB

### 3. Removed Old Backups
- **Removed**: `/root/n8n-backups/2025-09-24_*` (36MB)
- **Removed**: `/root/n8n-backups/2025-11-07_073531` (982MB - duplicate)
- **Kept**: `/root/n8n-backups/2025-11-07_075255` (982MB - most recent)
- **Freed**: ~1.018GB

### 4. Journal Logs Cleanup
- **Cleaned**: System journal logs older than 7 days
- **Freed**: Minimal (logs were already rotated)

### 5. Docker Container/Volume Prune
- **Result**: No unused containers or volumes found
- **Status**: System already clean

---

## Final Status

**After Cleanup:**
- **Disk Usage**: 88% (24G/29G used, 3.5G available) ✅ **HEALTHY**
- **Total Freed**: ~2.1GB
- **Status**: System healthy, adequate free space

---

## Current Storage Breakdown

### Top Directories
- `/var/lib/docker` - 13GB
  - `/var/lib/docker/volumes` - 6.0GB (n8n_n8n_data: 6.3GB)
  - `/var/lib/docker/overlay2` - 7.0GB (Docker image layers)
- `/var` - 18GB total
- `/root` - 2.3GB (includes 982MB backup)
- `/opt` - 2.9GB (n8n docker-compose setup)

### Docker Status
- **Images**: 4 total, 2 active (3.148GB, 168MB reclaimable)
- **Containers**: 2 active, 0 stopped
- **Volumes**: 1 active (n8n_n8n_data: 6.3GB)
- **Build Cache**: 0B

### Backups
- **Location**: `/root/n8n-backups/2025-11-07_075255/`
- **Size**: 982MB
- **Contents**:
  - `workflows.all.json` (1.2M) - 84 workflows
  - `credentials.decrypted.json` (24K) - 60 credentials
  - `n8n-data-backup.tgz` (981M) - Complete data volume
  - `docker-compose.yml.backup` - Config backup
  - `backup-manifest.json` - Metadata

---

## Recommendations

### ✅ Current Status: HEALTHY

**Disk Usage**: 88% (3.5GB free) - **Acceptable**

### Maintenance Schedule

**Weekly:**
- Run `docker system prune -f` to clean unused Docker resources
- Check `/var/log` for large log files

**Monthly:**
- Review old backups in `/root/n8n-backups/`
- Keep only the most recent backup (1 backup is sufficient)
- Clean journal logs: `journalctl --vacuum-time=30d`

**Note on Backup Retention:**
- **1 backup is usually sufficient** if backups are verified and tested
- **2 backups are optional** only if:
  - You want redundancy in case one backup is corrupted
  - You want to compare states (before/after major changes)
  - Storage space is not a concern
- **For this setup**: 1 backup (982MB) is recommended to save space

**Before Major Updates:**
- Always backup before updates (already automated)
- Remove old backups after verifying update success

### Storage Monitoring

**Alert Thresholds:**
- **Warning**: >90% disk usage
- **Critical**: >95% disk usage

**Quick Check Command:**
```bash
df -h / && docker system df
```

---

## Cleanup Script

For future cleanup, use:
```bash
# Quick cleanup
docker system prune -f
docker container prune -f
docker volume prune -f

# Remove old backups (keep only latest)
cd /root/n8n-backups
ls -t | tail -n +2 | xargs rm -rf  # Keep only 1 most recent backup

# Clean journal logs (keep last 7 days)
journalctl --vacuum-time=7d
```

---

## Summary

✅ **Cleanup Complete**
- Freed ~2.1GB of disk space
- Disk usage reduced from 100% → 88%
- System healthy with 3.5GB free space
- All critical data backed up
- No data loss

**Next Action**: Monitor disk usage weekly, clean up monthly.

---

**Last Updated**: November 7, 2025  
**Status**: ✅ Healthy

