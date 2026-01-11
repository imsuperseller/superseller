# n8n Migration to New VPS - Execution Plan

**Date**: January 2, 2025  
**Old VPS**: 172.245.56.50 (29GB, 100% full)  
**New VPS**: 172.245.56.50 (100GB, 6GB RAM, 5 vCPU)  
**Status**: 🚧 IN PROGRESS

---

## 📋 Migration Overview

Migrating n8n from old VPS (disk full) to new VPS with 100GB storage.

---

## 🎯 Migration Steps

### **Phase 1: New VPS Setup** ✅
1. SSH access to new VPS
2. Install Docker and Docker Compose
3. Create n8n directory structure
4. Set up firewall rules

### **Phase 2: Backup Transfer** ⏳
1. Transfer backup from old VPS to new VPS
2. Verify backup integrity

### **Phase 3: n8n Restoration** ⏳
1. Create docker-compose.yml on new VPS
2. Restore data volume from backup
3. Start n8n container
4. Verify version and health

### **Phase 4: DNS/Configuration Update** ⏳
1. Update Cloudflare DNS (if using n8n.rensto.com)
2. Update any webhook URLs
3. Test external access

### **Phase 5: Verification** ⏳
1. Verify all workflows present
2. Verify all credentials working
3. Test workflow execution
4. Monitor for 24 hours

---

## 🔧 New VPS Details

**IP Address**: 172.245.56.50  
**Hostname**: racknerd-fd5b1b8  
**Node**: DAL177KVM  
**OS**: Ubuntu 24.04 64 Bit  
**Disk**: 100 GB  
**RAM**: 6 GB  
**Swap**: 3 GB  
**Bandwidth**: 9.77 TB  

**API Key**: CU8AI-6H4JM-86J1M  
**API Hash**: 38b81400a1532cad7c41da953d8e6ddd0a67f719

---

## 📦 Backup Location

**Old VPS**: `/root/n8n-backups/2025-12-05_195047/`  
**Backup Size**: 881M (compressed)  
**Contains**: Complete data volume backup (database, workflows, credentials, settings)

---

## 🚀 Execution

See execution commands below.

---

**Last Updated**: January 2, 2025
