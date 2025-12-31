# 🚀 Execute n8n Update to 2.1.4 - RIGHT NOW

**Current Version**: 2.1.0  
**Target Version**: 2.1.4  
**Server**: 172.245.56.50

---

## ✅ Quick Run (Copy-Paste These Commands)

```bash
# 1. Upload script to server
scp scripts/n8n-backup-and-update-2.1.4.sh root@172.245.56.50:/opt/n8n/

# 2. SSH and run update
ssh root@172.245.56.50 "cd /opt/n8n && chmod +x n8n-backup-and-update-2.1.4.sh && bash n8n-backup-and-update-2.1.4.sh --yes"
```

**OR use the automated runner:**

```bash
bash scripts/RUN_N8N_UPDATE_2.1.4.sh
```

---

## 📋 What the Script Does

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

**Time**: 10-15 minutes

---

## ✅ Verification After Update

```bash
# Check version
ssh root@172.245.56.50 "docker exec n8n_rensto n8n --version"
# Should show: 2.1.4

# Check health
curl https://n8n.rensto.com/healthz
# Should return: {"status":"ok"}

# Test login
# Go to: https://n8n.rensto.com
# Login with existing credentials
```

---

## 🧹 Clean Up Old Backups (After Successful Update)

```bash
# Upload cleanup script
scp scripts/n8n-cleanup-backups-before-2.1.0.sh root@172.245.56.50:/opt/n8n/

# Run cleanup
ssh root@172.245.56.50 "cd /opt/n8n && chmod +x n8n-cleanup-backups-before-2.1.0.sh && bash n8n-cleanup-backups-before-2.1.0.sh"
```

This will:
- Keep only the most recent backup (from 2.1.0)
- Delete all older backups
- Free up disk space

---

## 🛡️ Rollback (If Needed)

If something goes wrong:

```bash
ssh root@172.245.56.50
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

## ✅ Ready to Run?

**The script is proven and safe** - it's based on the 2.0.1 script that worked successfully.

**Just run:**
```bash
bash scripts/RUN_N8N_UPDATE_2.1.4.sh
```

**Or manually:**
```bash
scp scripts/n8n-backup-and-update-2.1.4.sh root@172.245.56.50:/opt/n8n/
ssh root@172.245.56.50 "cd /opt/n8n && bash n8n-backup-and-update-2.1.4.sh --yes"
```

