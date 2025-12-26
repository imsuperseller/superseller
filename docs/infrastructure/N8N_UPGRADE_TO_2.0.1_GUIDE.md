# N8N Upgrade to 2.0.1 - Complete Guide

**Created**: December 10, 2025  
**Server**: 172.245.56.50 (n8n.rensto.com)  
**Current Version**: 1.122.5  
**Target Version**: 2.0.1

---

## 📋 Overview

This guide covers the complete process for upgrading n8n from version 1.122.5 to 2.0.1, including:
- Complete backup of all data
- Upgrade process
- Verification steps
- Rollback procedure if needed

---

## 🛡️ What Gets Backed Up

| Component | Backup Method | File |
|-----------|--------------|------|
| **Workflows** | n8n CLI export | `workflows.all.json` |
| **Credentials** | n8n CLI export (decrypted) | `credentials.decrypted.json` |
| **Community Nodes** | Directory archive + DB | `community-nodes-backup.tgz` |
| **User Accounts** | Database extract | `users.txt` |
| **API Keys** | Database extract | `api_keys.txt` |
| **Settings** | Database extract | `settings.txt` |
| **Complete Database** | SQLite file | `database.sqlite.backup` |
| **Complete Data Volume** | Full archive | `n8n-data-complete.tgz` |
| **Docker Config** | File copy | `docker-compose.yml.backup` |

---

## 📁 Scripts Location

All scripts are in `/Users/shaifriedman/New Rensto/rensto/scripts/`:

| Script | Purpose |
|--------|---------|
| `n8n-backup-and-update-2.0.1.sh` | Complete backup + upgrade |
| `n8n-verify-upgrade-2.0.1.sh` | Post-upgrade verification |
| `n8n-rollback-from-2.0.1.sh` | Rollback to previous version |

---

## 🚀 Quick Start (One Command)

### Option 1: Interactive Mode
```bash
# SSH into server
ssh root@172.245.56.50

# Run the backup and upgrade script
bash /root/n8n-backup-and-update-2.0.1.sh
```

### Option 2: Non-Interactive Mode
```bash
# Auto-confirm upgrade (for automation)
bash /root/n8n-backup-and-update-2.0.1.sh --yes
```

---

## 📝 Step-by-Step Manual Process

### Step 1: Copy Scripts to Server

```bash
# From your local machine
scp scripts/n8n-backup-and-update-2.0.1.sh root@172.245.56.50:/root/
scp scripts/n8n-verify-upgrade-2.0.1.sh root@172.245.56.50:/root/
scp scripts/n8n-rollback-from-2.0.1.sh root@172.245.56.50:/root/

# Make executable
ssh root@172.245.56.50 "chmod +x /root/n8n-*.sh"
```

### Step 2: Run Backup and Upgrade

```bash
ssh root@172.245.56.50
cd /root
./n8n-backup-and-update-2.0.1.sh
```

The script will:
1. ✅ Pre-flight checks (disk space, docker, etc.)
2. ✅ Export workflows to JSON
3. ✅ Export credentials (decrypted)
4. ✅ Backup community nodes
5. ✅ Backup user accounts & API keys
6. ✅ Backup complete data volume
7. ✅ Backup docker-compose.yml
8. ✅ Create backup manifest
9. ✅ Verify backup integrity
10. ⏸️ Prompt for confirmation
11. ✅ Stop n8n
12. ✅ Update docker-compose.yml
13. ✅ Pull new image
14. ✅ Start n8n
15. ✅ Verify upgrade

### Step 3: Verify Upgrade

```bash
./n8n-verify-upgrade-2.0.1.sh
```

This checks:
- Container status
- Version number
- Database integrity
- Workflow count
- Credential count
- Community nodes
- User accounts
- API keys
- Web UI accessibility

### Step 4: Test Manually

1. Go to https://n8n.rensto.com
2. Login with existing credentials
3. Check workflows are present
4. Test a few workflows
5. Verify community nodes work

---

## 🔄 Rollback Procedure

If something goes wrong:

```bash
./n8n-rollback-from-2.0.1.sh
```

Or manually:

```bash
# Stop n8n
docker stop n8n_rensto

# Restore docker-compose.yml
cp /root/n8n-backups/[BACKUP_DIR]/docker-compose.yml.backup /opt/n8n/docker-compose.yml

# Restore data
rm -rf /opt/n8n/data/n8n/*
tar xzf /root/n8n-backups/[BACKUP_DIR]/n8n-data-complete.tgz -C /opt/n8n/data/n8n/

# Start n8n
cd /opt/n8n
docker-compose up -d n8n
```

---

## 📂 Backup Location

Backups are stored in: `/root/n8n-backups/`

Example structure:
```
/root/n8n-backups/
└── 2025-12-10_185959-upgrade-to-2.0.1/
    ├── backup-manifest.json
    ├── n8n-data-complete.tgz      # Complete data (CRITICAL)
    ├── database.sqlite.backup      # Database only
    ├── workflows.all.json          # Workflows JSON
    ├── credentials.decrypted.json  # Credentials
    ├── community-nodes-backup.tgz  # Community nodes
    ├── community-nodes-package.json
    ├── users.txt                   # User accounts
    ├── api_keys.txt                # API keys
    ├── settings.txt                # Settings
    ├── docker-compose.yml.backup   # Docker config
    └── installed_*.txt             # DB tables
```

---

## ⚠️ Important Notes

### Before Upgrade
- Ensure you have SSH access to 172.245.56.50
- Verify disk space (need ~2GB free)
- Note current n8n version
- Test backup script first (cancel at prompt)

### During Upgrade
- Don't interrupt the script
- Wait for health checks
- Script handles rollback on failure

### After Upgrade
- Always run verification script
- Test login works
- Test a few workflows
- Check community nodes

### Security
- `credentials.decrypted.json` contains secrets - keep secure
- `api_keys.txt` contains API keys - keep secure
- Delete old backups after confirming upgrade success

---

## 🔐 Credentials Reference

### Current n8n Login
- Email: `service@rensto.com`
- Password: `vEdki7-vetwej-jotwuh`

### Server Access
- IP: `172.245.56.50`
- User: `root`
- Password: `y0JEu4uI0hAQ606Mfr`

### n8n API Key
Stored in database - will be preserved during upgrade.

---

## 📊 Version History

| Date | From Version | To Version | Status |
|------|-------------|------------|--------|
| Nov 12, 2025 | 1.119.1 | 1.122.5 | ✅ Success |
| Dec 10, 2025 | 1.122.5 | 2.0.1 | 🔄 Planned |

---

## 🆘 Troubleshooting

### Container won't start after upgrade
```bash
docker logs n8n_rensto
# Check for errors, then rollback if needed
./n8n-rollback-from-2.0.1.sh
```

### Database errors
```bash
sqlite3 /opt/n8n/data/n8n/database.sqlite "PRAGMA integrity_check;"
# If errors, restore from backup
```

### Community nodes not working
```bash
# Check installed packages
docker exec n8n_rensto ls -la /home/node/.n8n/nodes/node_modules/

# Reinstall if needed (from n8n UI: Settings > Community Nodes)
```

### API not responding
```bash
# Check container status
docker ps
docker logs n8n_rensto --tail 50

# Restart if needed
docker restart n8n_rensto
```

---

## 📞 Support

If issues persist:
1. Check Docker logs: `docker logs n8n_rensto`
2. Check backup manifest for version info
3. Rollback to previous version if needed
4. Contact n8n community forums for version-specific issues
