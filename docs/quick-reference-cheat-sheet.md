# 🚀 **RENSTO QUICK REFERENCE CHEAT SHEET**

## 🚨 **EMERGENCY COMMANDS**

### **n8n Recovery:**
```bash
# Restore from backup
node scripts/restore-from-backup.js data/n8n-backups/n8n-backup-<timestamp>.json

# Create backup
node scripts/n8n-automated-backup-system.js

# Restart n8n
sshpass -p '05ngBiq2pTA8XSF76x' ssh -o StrictHostKeyChecking=no root@173.254.201.134 "docker restart n8n"
```

### **Credential Management:**
```bash
# Restore credentials
node scripts/restore-n8n-credentials-cli.js

# Install community nodes
node scripts/restore-n8n-community-nodes.js
```

---

## 🔑 **ACCESS INFO**

| Service | URL/Command | Credentials |
|---------|-------------|-------------|
| **n8n** | http://173.254.201.134:5678 | API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjEwMTliOC1kZTNlLTRlN2QtYmU2MS1mNDg4OTI1ZTI1ZGQiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NTI1MTMxfQ.AAnkDkilxRsKdqGKLIF8oST7Caoe9s5d2lYrMEf3acA |
| **SSH** | ssh root@173.254.201.134 | root / 05ngBiq2pTA8XSF76x |
| **Airtable** | Multiple bases | Via MCP |

---

## 📊 **CURRENT STATUS**

- ✅ **42 API Credentials** - All restored
- ✅ **27 Community Nodes** - All installed  
- ✅ **44 Workflows** - All operational
- ✅ **Automated Backups** - Daily at 2 AM
- ✅ **n8n Version** - 1.112.5 (latest stable)

---

## 🎯 **IMMEDIATE PRIORITIES**

1. **Ben (Tax4Us)** - $4,000 remaining, deadline Sep 15th ⚠️
2. **Shelly** - Lead monitoring agent (30-min intervals)
3. **Ortal** - Facebook group scraper
4. **Yoram (Father)** - Insurance agent automation

---

## 💰 **BUSINESS MODEL**

- **Agent Development**: $5,000 per agent
- **Monthly Maintenance**: $500-1,000 per agent
- **Revenue Potential**: $5,000 → $500,000+ annually

---

## 🚫 **NEVER DO**

- ❌ `docker rm n8n` without backup
- ❌ Delete `n8n_data` volume
- ❌ Manual credential configuration
- ❌ Work without extended MCP server
- ❌ Ignore automated backup system

---

## ✅ **ALWAYS DO**

- ✅ Use extended MCP server for n8n operations
- ✅ Backup before major changes
- ✅ Use root permissions for npm installs
- ✅ Test API connections before assuming failure
- ✅ Use real business data (no dummies)
- ✅ Follow BMAD methodology for major changes

---

*Quick Reference - Keep this handy!*


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)