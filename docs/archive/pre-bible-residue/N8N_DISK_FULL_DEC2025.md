# n8n Disk Full Error - December 2025

**Date**: December 6, 2025  
**Issue**: `SQLITE_FULL: database or disk is full`  
**Server**: 172.245.56.50 (RackNerd VPS)  
**Status**: 🚨 **CRITICAL - IMMEDIATE ACTION REQUIRED**

---

## 🚨 **INCIDENT SUMMARY**

**Error**: `Error creating data table - SQLITE_FULL: database or disk is full`  
**Root Cause**: VPS disk at 100% capacity  
**Impact**: n8n cannot create new data tables, workflows may fail

---

## ⚡ **IMMEDIATE FIX (Run These Commands)**

### **Step 1: SSH into VPS**
```bash
ssh root@172.245.56.50
```

### **Step 2: Check Current Disk Usage**
```bash
df -h /
```

### **Step 3: Run Emergency Cleanup Script**
```bash
# Download and run cleanup script
cd /tmp
wget https://raw.githubusercontent.com/imsuperseller/rensto/main/scripts/n8n-emergency-disk-cleanup.sh
chmod +x n8n-emergency-disk-cleanup.sh
./n8n-emergency-disk-cleanup.sh
```

**OR run manual cleanup commands:**

### **Quick Manual Cleanup (Non-Interactive)**
```bash
# 1. Remove temp SQLite files
find /tmp -name "*.sqlite" -type f -delete 2>/dev/null

# 2. Clean old Docker images (keeps images < 7 days)
docker system prune -af --filter "until=168h"

# 3. Vacuum journal logs (limit to 500MB)
journalctl --vacuum-size=500M

# 4. Clear auth logs
cat /dev/null > /var/log/btmp
cat /dev/null > /var/log/btmp.1

# 5. Clear npm cache
npm cache clean --force

# 6. Clean APT cache
apt-get clean
apt-get autoclean

# 7. Check results
df -h /
```

---

## 📊 **EXPECTED RESULTS**

Based on previous recovery (October 24, 2025):

| Action | Space Freed | Time |
|--------|-------------|------|
| Delete temp SQLite files | 0-3.4GB | 2 min |
| Remove old Docker images | 0-1.9GB | 3 min |
| Vacuum journal logs | 0-2.3GB | 5 min |
| Clear btmp logs | 0-93MB | 1 min |
| Clear npm cache | 0-537MB | 2 min |
| **Total Potential** | **~7-8GB** | **15 min** |

**Target**: Reduce disk usage from 100% to <80%

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **Common Causes** (from previous incidents):

1. **Temp Database Files**: Large SQLite files left in `/tmp/`
2. **Old Docker Images**: Multiple n8n versions taking space
3. **System Journal Logs**: Unlimited log retention (can grow to 2-3GB)
4. **n8n Execution Data**: Large database (>5GB) with full execution history
5. **Failed Login Logs**: btmp files accumulating
6. **npm Cache**: Build artifacts not cleaned

### **n8n Database Size**

Check database size:
```bash
du -h /var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite
```

**Typical Size**: 5-8GB  
**Table Breakdown**:
- `execution_data`: 99% of database (full execution payloads)
- `execution_entity`: <1%
- Other tables: <1MB total

---

## 🛡️ **PREVENTIVE MEASURES**

### **1. Enable n8n Execution Pruning**

Edit `/opt/n8n/docker-compose.yml`:
```yaml
environment:
  # Automatic execution pruning
  - EXECUTIONS_DATA_PRUNE=true
  - EXECUTIONS_DATA_MAX_AGE=168  # 7 days
  - EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000
```

Restart n8n:
```bash
cd /opt/n8n
docker-compose down
docker-compose up -d
```

### **2. Configure Journal Log Limits**

Create `/etc/systemd/journald.conf.d/size-limit.conf`:
```ini
[Journal]
SystemMaxUse=500M
SystemKeepFree=1G
MaxFileSec=1week
```

Reload:
```bash
systemctl restart systemd-journald
```

### **3. Weekly Docker Cleanup**

Create `/etc/cron.weekly/docker-cleanup`:
```bash
#!/bin/bash
docker system prune -af --filter 'until=168h'
docker image prune -af --filter 'dangling=true'
```

Make executable:
```bash
chmod +x /etc/cron.weekly/docker-cleanup
```

### **4. Daily Disk Usage Monitoring**

Create `/usr/local/bin/disk-usage-alert.sh`:
```bash
#!/bin/bash
THRESHOLD=80
USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    logger -t disk-usage-alert "Disk usage at ${USAGE}%"
    echo "⚠️ VPS Disk Alert: ${USAGE}% full"
    df -h /
    du -h --max-depth=1 / 2>/dev/null | sort -hr | head -10
fi
```

Add to cron:
```bash
chmod +x /usr/local/bin/disk-usage-alert.sh
echo "0 2 * * * /usr/local/bin/disk-usage-alert.sh" | crontab -
```

---

## 📈 **VERIFICATION**

### **After Cleanup, Verify:**

1. **Disk Space**:
   ```bash
   df -h /
   # Should show <80% usage
   ```

2. **n8n Status**:
   ```bash
   docker ps | grep n8n
   # Should show container running
   ```

3. **Test Data Table Creation**:
   - Go to n8n UI: `https://n8n.rensto.com`
   - Try creating a new data table
   - Should work without SQLITE_FULL error

4. **Database Size**:
   ```bash
   du -h /var/lib/docker/volumes/n8n_n8n_data/_data/database.sqlite
   ```

---

## 🎯 **LONG-TERM SOLUTIONS**

### **Option A: Optimize Current VPS** (Recommended)
- **Cost**: $0 (no change)
- **Actions**:
  - Enable execution pruning (7 days)
  - Archive old execution data to external storage
  - Regular cleanup automation
- **Target**: Keep disk at 50-60% usage

### **Option B: Upgrade VPS Storage**
- **Current**: 29GB SSD
- **Upgrade to**: 60GB SSD
- **Cost**: +$5-10/month
- **Benefit**: Room for growth, less maintenance

### **Option C: External Storage Volume**
- **Add**: Block storage volume (50GB)
- **Cost**: $5-10/month
- **Move**: n8n database to external volume
- **Benefit**: Isolated storage, easy scaling

**Recommendation**: Start with Option A (optimization). Upgrade only if disk usage consistently exceeds 80% after implementing all optimizations.

---

## 📝 **RELATED DOCUMENTATION**

- [Previous Recovery (Oct 24, 2025)](/docs/infrastructure/VPS_DISK_SPACE_RECOVERY_OCT24_2025.md)
- [VPS Optimization Summary](/docs/infrastructure/VPS_OPTIMIZATION_SUMMARY.md)
- [Backup Cleanup Policy](/docs/infrastructure/BACKUP_CLEANUP_POLICY.md)
- [n8n Database Management](/docs/n8n/DATABASE_MANAGEMENT.md)

---

## 🔗 **QUICK REFERENCE**

**Server**: 172.245.56.50  
**n8n URL**: https://n8n.rensto.com  
**SSH**: `ssh root@172.245.56.50`  
**Cleanup Script**: `/scripts/n8n-emergency-disk-cleanup.sh`

---

**Last Updated**: December 6, 2025  
**Status**: 🚨 **ACTION REQUIRED**
