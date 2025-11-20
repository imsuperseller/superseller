# n8n Backup Cleanup Policy

**Last Updated**: November 12, 2025  
**Server**: RackNerd VPS (173.254.201.134)  
**Disk Usage**: 95% (26G/29G used)

---

## Current Status

- **Backup Location**: `/root/n8n-backups/`
- **Current Backups**: 1 (most recent: 2025-11-12_011306)
- **Backup Size**: ~994MB each
- **Cleanup Script**: `scripts/n8n-backup-cleanup.sh`

---

## Cleanup Policy

### Recommended Strategy

**Keep**: 2 most recent backups  
**Delete**: Older backups automatically

### Rationale

1. **Disk Space**: Server is at 95% usage (26G/29G)
2. **Backup Size**: Each backup is ~1GB
3. **Safety**: Keeping 2 backups provides redundancy
4. **Recovery**: Most issues are discovered within days, not weeks

---

## Manual Cleanup

### Delete Old Backup

```bash
# SSH into VPS
ssh root@173.254.201.134

# Check backups
ls -lh /root/n8n-backups/

# Delete specific backup (replace with actual date)
rm -rf /root/n8n-backups/2025-11-07_075255

# Verify disk space
df -h /root
```

### Automated Cleanup

```bash
# Run cleanup script (keeps 2 most recent)
ssh root@173.254.201.134
cd /opt/n8n
bash n8n-backup-cleanup.sh 2
```

---

## Cleanup Script Usage

```bash
# Keep 2 most recent backups (default)
bash n8n-backup-cleanup.sh 2

# Keep 3 most recent backups
bash n8n-backup-cleanup.sh 3

# Keep only 1 backup (most recent)
bash n8n-backup-cleanup.sh 1
```

---

## When to Clean Up

### Immediate Cleanup Needed When:
- ✅ Disk usage > 90%
- ✅ Multiple successful backups exist
- ✅ Recent backup verified successful

### Regular Cleanup:
- **Weekly**: Run cleanup script to keep only 2 backups
- **After Major Updates**: Keep backup from before update + most recent
- **Monthly**: Review and delete backups older than 30 days

---

## Backup Retention Schedule

| Age | Action | Reason |
|-----|--------|--------|
| **0-7 days** | Keep | Recent, may need for quick recovery |
| **7-30 days** | Keep 1-2 | Major issues usually discovered quickly |
| **30+ days** | Delete | Very unlikely to need old backups |

---

## What Gets Backed Up

Each backup includes:
- ✅ All workflows (86 workflows)
- ✅ All credentials (61 credentials, decrypted)
- ✅ Data volume (complete n8n data directory)
- ✅ Community nodes (if any)
- ✅ docker-compose.yml

---

## Recovery Process

If you need to restore from backup:

```bash
# List available backups
ls -lh /root/n8n-backups/

# Restore from specific backup
cd /opt/n8n
bash restore-from-backup.sh /root/n8n-backups/2025-11-12_011306
```

---

## Disk Space Monitoring

### Check Current Usage

```bash
# Check disk usage
df -h /root

# Check backup sizes
du -sh /root/n8n-backups/*

# Total backup size
du -sh /root/n8n-backups/
```

### Alert Thresholds

- **> 90%**: Run cleanup immediately
- **> 85%**: Schedule cleanup soon
- **< 80%**: Normal operation

---

## Automation

### Add to Cron (Optional)

```bash
# Run cleanup weekly (Sundays at 2 AM)
0 2 * * 0 /opt/n8n/n8n-backup-cleanup.sh 2 >> /var/log/n8n-cleanup.log 2>&1
```

---

## Files

- **Cleanup Script**: `scripts/n8n-backup-cleanup.sh`
- **Backup Script**: `scripts/n8n-backup-and-update-1.119.1.sh`
- **Backup Location**: `/root/n8n-backups/` on VPS

---

**Status**: ✅ Cleanup script ready, old backup deleted  
**Disk Space**: Freed ~1GB, now at ~94% usage

