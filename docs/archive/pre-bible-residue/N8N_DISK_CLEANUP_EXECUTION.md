# n8n Disk Cleanup - Execution Guide

**Date**: December 6, 2025  
**Server**: 172.245.56.50  
**Status**: Ready to execute

---

## 🛡️ **SAFETY GUARANTEES**

This cleanup script **PROTECTS**:
- ✅ **Workflows** (stored in database.sqlite)
- ✅ **Credentials** (stored in database.sqlite)
- ✅ **Community nodes** (stored in /opt/n8n/data/n8n)
- ✅ **Docker volumes** (NOT deleted)
- ✅ **n8n configuration** (NOT touched)

**What it cleans** (SAFE):
- Temp SQLite files in /tmp
- Old Docker images (>7 days old)
- System journal logs (keeps last 500MB)
- Auth/btmp logs (failed login attempts)
- npm cache (build artifacts)
- APT cache (package cache)

---

## ⚡ **QUICK EXECUTION**

### **Option 1: Automated Safe Cleanup (Recommended)**

```bash
# SSH into server
ssh root@172.245.56.50

# Download and run safe automated cleanup
cd /tmp
wget -q https://raw.githubusercontent.com/imsuperseller/rensto/main/scripts/n8n-safe-cleanup-auto.sh
chmod +x n8n-safe-cleanup-auto.sh
./n8n-safe-cleanup-auto.sh
```

### **Option 2: Manual Quick Cleanup**

```bash
# SSH into server
ssh root@172.245.56.50

# Run these commands (all safe - no data loss)
find /tmp -name "*.sqlite" -type f -delete 2>/dev/null
docker system prune -af --filter "until=168h" --volumes=false
journalctl --vacuum-size=500M
cat /dev/null > /var/log/btmp && cat /dev/null > /var/log/btmp.1
npm cache clean --force 2>/dev/null || true
apt-get clean && apt-get autoclean

# Check results
df -h /
```

---

## ✅ **VERIFICATION AFTER CLEANUP**

1. **Check disk space**:
   ```bash
   df -h /
   # Should show <80% usage
   ```

2. **Verify n8n database**:
   ```bash
   ls -lh /var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite
   # OR
   ls -lh /opt/n8n/data/n8n/database.sqlite
   # Should exist and show size
   ```

3. **Check n8n container**:
   ```bash
   docker ps | grep n8n
   # Should show container running
   ```

4. **Test data table creation**:
   - Go to: https://n8n.rensto.com
   - Try creating a new data table
   - Should work without SQLITE_FULL error

---

## 📊 **EXPECTED RESULTS**

Based on previous cleanup (October 24, 2025):

| Action | Space Freed | Risk Level |
|--------|------------|------------|
| Delete temp SQLite files | 0-3.4GB | ✅ SAFE |
| Remove old Docker images | 0-1.9GB | ✅ SAFE (volumes protected) |
| Vacuum journal logs | 0-2.3GB | ✅ SAFE |
| Clear btmp logs | 0-93MB | ✅ SAFE |
| Clear npm cache | 0-537MB | ✅ SAFE |
| **Total** | **~5-8GB** | **✅ ALL SAFE** |

**Target**: Reduce from 100% to <80% disk usage

---

## 🚨 **IF SOMETHING GOES WRONG**

**n8n container stops**:
```bash
cd /opt/n8n
docker-compose up -d
```

**Database missing** (shouldn't happen):
- Check: `/var/lib/docker/volumes/n8n_n8n_data/_data/`
- Check: `/opt/n8n/data/n8n/`
- Restore from backup if needed

**Workflows missing** (shouldn't happen):
- Check n8n UI: https://n8n.rensto.com
- Verify database file exists
- Check Docker volume: `docker volume inspect n8n_n8n_data`

---

**Last Updated**: December 6, 2025  
**Status**: Ready to execute
