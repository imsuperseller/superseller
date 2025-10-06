# Rensto Infrastructure

## 📋 **INFRASTRUCTURE OVERVIEW**

This directory contains all infrastructure and automation components for the Rensto project.

## 🚀 **QUICK START**

**For complete operations information, see: [`RENSTO-OPERATIONS-GUIDE.md`](RENSTO-OPERATIONS-GUIDE.md)**

### **Essential Commands**

```bash
# Start infrastructure
docker-compose up -d

# Import workflows
./import-remaining-workflows-v3.sh

# Test all integrations
./test-integrations.sh

# Fix Airtable field mappings
./fix-workflow-fields.sh
```

## 📁 **DIRECTORY STRUCTURE**

```
infra/
├── RENSTO-OPERATIONS-GUIDE.md    # 📋 Complete operations guide
├── docker-compose.yml            # 🐳 Infrastructure services
├── import-remaining-workflows-v3.sh  # 🔄 Workflow import script
├── test-integrations.sh          # 🧪 Integration testing
├── fix-workflow-fields.sh        # 🔧 Airtable field fixes
├── backup.sh                     # 💾 Backup automation
├── data/                         # 📁 Data storage
├── systemd/                      # 🔧 System services
└── cloudflared/                  # 🌐 Cloudflare tunnel config
```

## 🎯 **PRODUCTION STATUS**

**✅ 100% OPERATIONAL**

- ✅ n8n Platform: http://173.254.201.134:5678
- ✅ All workflows imported and ready
- ✅ Airtable integration operational (NPX-based MCP)
- ✅ All APIs and databases working

## 📖 **DOCUMENTATION**

- **[RENSTO-OPERATIONS-GUIDE.md](RENSTO-OPERATIONS-GUIDE.md)** - Complete operations guide (single source of truth)

## 🔧 **MAINTENANCE**

All maintenance procedures are documented in the operations guide.

**For troubleshooting, API formats, and complete automation procedures, see: [`RENSTO-OPERATIONS-GUIDE.md`](RENSTO-OPERATIONS-GUIDE.md)**
