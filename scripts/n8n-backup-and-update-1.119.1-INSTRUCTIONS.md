# n8n Backup & Update to 1.119.1 - Instructions

## Why Update?

**Root Cause**: Validation tools failing with "no such column: node_type" error
**Solution**: Update n8n from 1.115.0 → 1.119.1 (latest stable)
**Benefit**: Fixes database schema issues, enables proper node validation

## Quick Execution

**On RackNerd VPS** (173.254.201.134):

```bash
# SSH into server
ssh root@173.254.201.134

# Navigate to n8n directory
cd /opt/n8n

# Copy script to server (or upload via SCP)
# Then run:
bash /path/to/n8n-backup-and-update-1.119.1.sh --yes
```

## What Gets Backed Up

1. ✅ **All workflows** (via n8n CLI export)
2. ✅ **All credentials** (decrypted, for restore)
3. ✅ **Community nodes** (from `/home/node/custom`)
4. ✅ **Complete data volume** (all n8n data)
5. ✅ **docker-compose.yml** (configuration)

## Backup Location

Backups stored in: `/root/n8n-backups/YYYY-MM-DD_HHMMSS/`

## After Update

1. Verify n8n is running: http://173.254.201.134:5678
2. Test validation tools work
3. Test a few workflows
4. If issues: Restore from backup

## Rollback (If Needed)

```bash
cd /opt/n8n
docker-compose stop n8n
# Restore docker-compose.yml from backup
cp docker-compose.yml.backup-YYYYMMDD-HHMMSS docker-compose.yml
docker-compose up -d n8n
```

