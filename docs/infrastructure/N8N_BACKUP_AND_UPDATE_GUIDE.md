# n8n Backup & Update Guide - 1.119.1

**Last Updated**: November 11, 2025  
**Current Version**: 1.115.0  
**Target Version**: 1.119.1 (Latest Stable)  
**Server**: RackNerd VPS (173.254.201.134)

---

## Overview

This guide covers how to:
1. **Backup** workflows, credentials, community nodes, and data volume
2. **Update** n8n from 1.115.0 to 1.119.1 (latest stable)
3. **Verify** the update was successful
4. **Rollback** if needed

---

## Quick Start

### Automated Backup & Update (Recommended)

```bash
# SSH into RackNerd VPS
ssh root@173.254.201.134

# Run the comprehensive backup and update script
cd /opt/n8n
bash /path/to/scripts/n8n-backup-and-update-1.119.1.sh
```

The script will:
1. ✅ Backup all workflows (via n8n CLI export)
2. ✅ Backup all credentials (decrypted, for restore purposes)
3. ✅ Backup community nodes (from `/home/node/custom`)
4. ✅ Backup data volume (complete n8n data directory)
5. ✅ Backup docker-compose.yml
6. ✅ Update n8n to 1.119.1 (latest stable)
7. ✅ Verify the update

---

## Manual Backup Steps

If you prefer to backup manually before updating:

### Step 1: Backup Workflows

```bash
ssh root@173.254.201.134

# Export all workflows
docker exec n8n_rensto n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json

# Copy to host
docker cp n8n_rensto:/home/node/.n8n/exports/workflows.all.json ~/n8n-backup-workflows.json
```

### Step 2: Backup Credentials

```bash
# Export all credentials (decrypted for backup)
docker exec n8n_rensto n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json

# Copy to host
docker cp n8n_rensto:/home/node/.n8n/exports/credentials.decrypted.json ~/n8n-backup-credentials.json

# ⚠️ SECURITY: This file contains decrypted credentials. Keep it secure!
```

### Step 3: Backup Community Nodes

```bash
# List installed community nodes
docker exec n8n_rensto ls -la /home/node/custom > ~/n8n-community-nodes-list.txt

# Backup community nodes directory
docker exec n8n_rensto tar czf /tmp/community-nodes-backup.tgz -C /home/node/custom .
docker cp n8n_rensto:/tmp/community-nodes-backup.tgz ~/n8n-community-nodes-backup.tgz

# Backup package.json if it exists
docker cp n8n_rensto:/home/node/custom/package.json ~/n8n-community-nodes-package.json 2>/dev/null || echo "No package.json found"
```

### Step 4: Backup Data Volume

```bash
# Backup the entire n8n data volume
docker run --rm -v n8n_n8n_data:/data -v $(pwd):/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-data-backup.tgz .'
```

### Step 5: Backup docker-compose.yml

```bash
cd /opt/n8n
cp docker-compose.yml docker-compose.yml.backup-$(date +%Y%m%d-%H%M%S)
```

---

## Manual Update Steps

### Step 1: Stop n8n

```bash
cd /opt/n8n
docker-compose stop n8n
```

### Step 2: Update docker-compose.yml

```bash
# Edit docker-compose.yml
nano docker-compose.yml

# Change this line:
#   image: n8nio/n8n:latest
# To:
#   image: n8nio/n8n:1.119.1
```

Or use sed:
```bash
sed -i 's|image: n8nio/n8n:latest|image: n8nio/n8n:1.119.1|g' docker-compose.yml
```

### Step 3: Pull New Image

```bash
docker-compose pull n8n
```

### Step 4: Start n8n

```bash
docker-compose up -d n8n
```

### Step 5: Verify Update

```bash
# Check version
docker exec n8n_rensto n8n --version

# Check health
docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz && echo "✅ Healthy" || echo "❌ Not healthy"

# Check logs
docker logs n8n_rensto --tail 50
```

---

## Restore from Backup

If something goes wrong, restore from backup:

### Restore Workflows

```bash
# Copy backup to container
docker cp ~/n8n-backup-workflows.json n8n_rensto:/tmp/workflows.json

# Import workflows
docker exec n8n_rensto n8n import:workflow --input=/tmp/workflows.json
```

### Restore Credentials

```bash
# Copy backup to container
docker cp ~/n8n-backup-credentials.json n8n_rensto:/tmp/credentials.json

# Import credentials
docker exec n8n_rensto n8n import:credentials --input=/tmp/credentials.json
```

### Restore Community Nodes

```bash
# Copy backup to container
docker cp ~/n8n-community-nodes-backup.tgz n8n_rensto:/tmp/

# Extract community nodes
docker exec n8n_rensto tar xzf /tmp/community-nodes-backup.tgz -C /home/node/custom

# Reinstall if needed
docker exec n8n_rensto sh -c 'cd /home/node/custom && npm install'
```

### Restore Data Volume

```bash
# Stop n8n
docker-compose stop n8n

# Restore from backup
docker run --rm -v n8n_n8n_data:/data -v $(pwd):/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Start n8n
docker-compose up -d n8n
```

---

## Verification Checklist

After update, verify:

- [ ] n8n version is 1.118.2: `docker exec n8n_rensto n8n --version`
- [ ] n8n is healthy: `docker exec n8n_rensto wget --spider -q http://localhost:5678/healthz`
- [ ] Can access UI: https://n8n.rensto.com
- [ ] All workflows are present (check workflow count)
- [ ] All credentials are present (check credentials count)
- [ ] Community nodes are still installed (check `/home/node/custom`)
- [ ] Test a few workflows to ensure they execute correctly
- [ ] Check logs for errors: `docker logs n8n_rensto --tail 100`

---

## Troubleshooting

### Issue: Container won't start after update

**Solution**:
```bash
# Check logs
docker logs n8n_rensto --tail 100

# Check if port is in use
netstat -tulpn | grep 5678

# Try restarting
docker-compose restart n8n
```

### Issue: Workflows missing after update

**Solution**:
```bash
# Restore workflows from backup
docker cp ~/n8n-backup-workflows.json n8n_rensto:/tmp/workflows.json
docker exec n8n_rensto n8n import:workflow --input=/tmp/workflows.json
```

### Issue: Credentials missing after update

**Solution**:
```bash
# Restore credentials from backup
docker cp ~/n8n-backup-credentials.json n8n_rensto:/tmp/credentials.json
docker exec n8n_rensto n8n import:credentials --input=/tmp/credentials.json
```

### Issue: Community nodes not working

**Solution**:
```bash
# Check if directory exists
docker exec n8n_rensto ls -la /home/node/custom

# Restore community nodes
docker cp ~/n8n-community-nodes-backup.tgz n8n_rensto:/tmp/
docker exec n8n_rensto tar xzf /tmp/community-nodes-backup.tgz -C /home/node/custom

# Reinstall dependencies
docker exec n8n_rensto sh -c 'cd /home/node/custom && npm install'
```

### Issue: Need to rollback to previous version

**Solution**:
```bash
# Stop n8n
docker-compose stop n8n

# Restore docker-compose.yml
cp docker-compose.yml.backup-YYYYMMDD-HHMMSS docker-compose.yml

# Restore data volume (if needed)
docker run --rm -v n8n_n8n_data:/data -v $(pwd):/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Start n8n
docker-compose up -d n8n
```

---

## Backup File Locations

Backups are stored in:
- **Location**: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`
- **Files**:
  - `n8n-data-backup.tgz` - Complete data volume backup
  - `workflows.all.json` - All workflows export
  - `credentials.decrypted.json` - All credentials (decrypted)
  - `community-nodes-backup.tgz` - Community nodes backup
  - `docker-compose.yml.backup` - Docker compose config backup
  - `backup-manifest.json` - Backup metadata

---

## Important Notes

1. **Credentials Backup**: The credentials backup contains **decrypted** credentials. Keep it secure and don't commit it to git.

2. **Community Nodes**: Community nodes are stored in `/home/node/custom`. If you have many installed, the backup may be large.

3. **Data Volume**: The data volume contains all n8n data including:
   - Workflows
   - Credentials (encrypted)
   - Execution history
   - Settings
   - Community nodes

4. **Version Compatibility**: Updating from 1.115.0 to 1.119.1 should be compatible, but always test workflows after update.

5. **Downtime**: The update process requires stopping n8n, so plan for a few minutes of downtime.

---

## Script Usage

The automated script (`n8n-backup-and-update-1.119.1.sh`) handles everything:

```bash
# Make executable
chmod +x scripts/n8n-backup-and-update-1.119.1.sh

# Run on VPS
ssh root@173.254.201.134
bash /path/to/scripts/n8n-backup-and-update-1.119.1.sh
```

The script will:
1. Create timestamped backup directory
2. Export workflows, credentials, community nodes
3. Backup data volume
4. Ask for confirmation before updating
5. Update n8n to 1.118.2
6. Verify the update

---

## Support

If you encounter issues:
1. Check the backup location: `/root/n8n-backups/`
2. Review logs: `docker logs n8n_rensto`
3. Verify version: `docker exec n8n_rensto n8n --version`
4. Restore from backup if needed (see Restore section above)

---

**Last Updated**: November 7, 2025  
**Script Version**: 1.0  
**Tested On**: n8n 1.115.0 → 1.118.2

