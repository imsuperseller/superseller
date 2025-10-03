# 🚀 N8N UPGRADE PLAN - VERSION 1.113.3

## 📊 Current Status Analysis

**Date**: January 8, 2025  
**n8n Instance**: RackNerd (173.254.201.134:5678)  
**Current Version**: 1.110.1  
**Target Version**: 1.113.3  
**Status**: ✅ **READY FOR UPGRADE**

---

## 🎯 Upgrade Overview

Based on the successful upgrade from 1.109.2 to 1.110.1, we have a proven process that preserves:
- ✅ **42 Workflows** - All preserved and accessible
- ✅ **36 Credentials** - All intact and working
- ✅ **Community Nodes** - 5 packages installed and functional
- ✅ **Data Volume** - `n8n_n8n_data` properly mounted
- ✅ **Configuration** - All settings maintained

---

## 🛡️ Safety Measures (Proven Process)

### ✅ Backup Strategy (From Previous Success):
```bash
# Backup location from previous upgrade
/root/n8n-backups/2025-09-24_1854/n8n-data-backup.tgz
```

### ✅ Data Preservation Method:
- **Volume Mount**: `/var/lib/docker/volumes/n8n_n8n_data/_data` → `/home/node/.n8n`
- **All Data**: Workflows, credentials, community nodes preserved
- **Rollback Ready**: Complete backup available

---

## 🚀 Upgrade Process (Proven Method)

### Step 1: Pre-Upgrade Backup
```bash
# SSH to RackNerd server
ssh root@173.254.201.134

# Create backup directory
mkdir -p /root/n8n-backups/$(date +%Y-%m-%d_%H%M)

# Backup current data volume
docker run --rm -v n8n_n8n_data:/data -v /root/n8n-backups/$(date +%Y-%m-%d_%H%M):/backup alpine \
  sh -c 'cd /data && tar czf /backup/n8n-data-backup.tgz .'

# Export workflows and credentials (belt and suspenders)
docker exec n8n_rensto n8n export:workflow --all --output=/home/node/.n8n/exports/workflows.all.json
docker exec n8n_rensto n8n export:credentials --all --decrypted --output=/home/node/.n8n/exports/credentials.decrypted.json
```

### Step 2: Docker Hub Authentication
```bash
# Login to Docker Hub (if not already authenticated)
docker login

# Pull latest version
docker pull n8nio/n8n:1.113.3
```

### Step 3: Container Upgrade (Proven Method)
```bash
# Stop current container
docker stop n8n_rensto

# Remove current container
docker rm n8n_rensto

# Start new container with latest version
docker run -d \
  --name n8n_rensto \
  -p 5678:5678 \
  -v n8n_n8n_data:/home/node/.n8n \
  -e N8N_COMMUNITY_NODES_ENABLED=true \
  n8nio/n8n:1.113.3
```

### Step 4: Verification (From Previous Success)
```bash
# Verify version
docker exec n8n_rensto n8n --version

# Check container status
docker ps | grep n8n_rensto

# Test API access
curl http://173.254.201.134:5678/api/v1/workflows
```

---

## 🔧 Community Nodes Restoration (Proven Method)

Based on previous success, the community nodes are preserved in the data volume, but if needed:

```bash
# Community nodes directory
/home/node/.n8n/nodes/node_modules/

# Previously installed packages:
# - @brave/n8n-nodes-brave-search@v1.0.18
# - @elevenlabs/n8n-nodes-elevenlabs@v0.2.2
# - @tavily/n8n-nodes-tavily@v0.2.4
# - n8n-nodes-mcp@v0.1.29
# - n8n-nodes-apify@v0.1.0
```

---

## 📋 Expected Results (Based on Previous Success)

### ✅ What Will Be Preserved:
- **42 Workflows**: All accessible and functional
- **36 Credentials**: Ready for import
- **Community Nodes**: 5 packages installed and working
- **API Access**: MCP tools working
- **Data Volume**: Properly mounted and preserved
- **Configuration**: All settings maintained

### ✅ Verification Checklist:
- [ ] Container running smoothly
- [ ] Version confirmed as 1.113.3
- [ ] All workflows accessible
- [ ] API endpoint responding
- [ ] Community nodes visible in UI
- [ ] No data loss

---

## 🚨 Rollback Plan (If Needed)

```bash
# Stop new container
docker stop n8n_rensto
docker rm n8n_rensto

# Restore from backup
docker run --rm -v n8n_n8n_data:/data -v /root/n8n-backups/2025-01-08_XXXX:/backup alpine \
  sh -c 'cd /data && rm -rf * && tar xzf /backup/n8n-data-backup.tgz'

# Start previous version
docker run -d \
  --name n8n_rensto \
  -p 5678:5678 \
  -v n8n_n8n_data:/home/node/.n8n \
  -e N8N_COMMUNITY_NODES_ENABLED=true \
  n8nio/n8n:1.110.1
```

---

## 🎯 Key Success Factors (From Previous Upgrade)

1. **Data Volume Preservation**: The `n8n_n8n_data` volume contains all critical data
2. **Community Nodes**: Preserved in `/home/node/.n8n/nodes/node_modules/`
3. **Environment Variables**: `N8N_COMMUNITY_NODES_ENABLED=true` maintained
4. **Backup Strategy**: Complete backup before upgrade
5. **Verification**: Thorough testing after upgrade

---

## 📊 Expected Timeline

- **Backup**: 2-3 minutes
- **Docker Pull**: 3-5 minutes
- **Container Upgrade**: 1-2 minutes
- **Verification**: 2-3 minutes
- **Total**: 8-13 minutes

---

## 🏆 Success Criteria

✅ **Upgrade Complete When**:
- Version shows 1.113.3
- All 42 workflows accessible
- All 36 credentials intact
- Community nodes functional
- API responding correctly
- No data loss

---

*Plan created: January 8, 2025*  
*Based on successful upgrade from 1.109.2 to 1.110.1*  
*Target: n8n v1.113.3*  
*Status: ✅ READY FOR EXECUTION*
