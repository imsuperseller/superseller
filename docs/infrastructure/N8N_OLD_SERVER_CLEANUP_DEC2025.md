# n8n Old Server References Cleanup - December 2025

**Date**: December 6, 2025  
**Issue**: Workflows and credentials still referencing old server (173.254.201.134)  
**Status**: ✅ **CLEANED UP**

---

## 🔍 **FINDINGS**

### **Workflows with Old IP** (11 total)
1. ✅ SUB-LEAD-009: Production Lead Gen Comprehensive v1 (ACTIVE)
2. ✅ INT-TECH-002: Template Deployment Pipeline v1 (ACTIVE)
3. ✅ MKT-TEMPLATE-001: Sora 2 Automation Template v1 (ACTIVE)
4. ✅ INT-INFRA-001: Server Monitoring Agent (Terry) v1 (ACTIVE)
5. ✅ WhatsApp Polling Listener - Handle Approvals (ACTIVE)
6. ✅ WhatsApp Group Polling - Approval Handler (ACTIVE)
7. ✅ WhatsApp Evolution API - Approval Handler (ACTIVE)
8. ⚠️ [ARCHIVED] MicroSaaS: Israel/Jewish Leads – NYC
9. ⚠️ [ARCHIVED] Production Lead Generation & Enrichment (2 versions)

### **Credentials with Old IP**
- ✅ **RackNerd SSH credential**: Updated from `173.254.201.134` → `172.245.56.50`

### **Workflow System Prompts**
- ✅ **INT-INFRA-001 (Terry)**: Had old IP in system prompt - Updated

---

## ✅ **FIXES APPLIED**

### **1. Updated SSH Credential**
```sql
UPDATE credentials_entity 
SET data = json_replace(data, "$.host", "172.245.56.50") 
WHERE name = "RackNerd" AND data LIKE "%173.254.201.134%";
```
**Result**: ✅ RackNerd credential now points to new server

### **2. Updated Active Workflows**
```sql
UPDATE workflow_entity 
SET nodes = replace(nodes, "173.254.201.134", "n8n.rensto.com") 
WHERE nodes LIKE "%173.254.201.134%" AND active = 1;
```
**Result**: ✅ All 7 active workflows updated to use `n8n.rensto.com`

### **3. Restarted n8n**
- Container restarted to apply database changes
- All workflows now use domain name instead of old IP

---

## 🎯 **IMPACT ON SQLITE_FULL ERROR**

**Possible Causes**:
1. ✅ **Workflows trying to connect to old server** → FIXED (updated to new server)
2. ✅ **SSH credential pointing to old server** → FIXED (updated to new server)
3. ✅ **Failed connection attempts logging errors** → Should stop now

**Why This Could Cause SQLITE_FULL**:
- If workflows were repeatedly trying to connect to old server
- Each failed attempt creates execution records
- Execution data accumulates in database
- Database grows until it hits limits

---

## 📊 **VERIFICATION**

### **Before Cleanup**:
- 11 workflows with old IP
- 1 SSH credential with old IP
- Active workflows trying to connect to unreachable server

### **After Cleanup**:
- ✅ 0 active workflows with old IP
- ✅ SSH credential updated to new server
- ✅ All workflows use `n8n.rensto.com` domain

---

## 🔄 **REMAINING REFERENCES** (Non-Critical)

### **Archived Workflows** (OK to Leave)
- 3 archived workflows still have old IP
- These are inactive and won't cause issues
- Can be updated manually if needed

### **Export Files** (Historical)
- `/opt/n8n/data/n8n/exports/all_after.json` - Contains example curl with old IP
- `/opt/n8n/data/n8n/exports/creds_dec_2025-09-06.json` - Historical credential export
- `/opt/n8n/data/n8n/n8nEventLog-1.log` - Historical event logs

**These are safe to leave** - they're historical exports, not active configurations.

---

## ✅ **NEXT STEPS**

1. **Monitor n8n logs** for 24 hours:
   ```bash
   docker logs -f n8n_rensto | grep -i "error\|timeout\|connection"
   ```

2. **Test data table creation**:
   - Go to: https://n8n.rensto.com
   - Try creating a new data table
   - Should work without SQLITE_FULL error

3. **Check workflow executions**:
   - Monitor workflows that were using old IP
   - Verify they're now connecting successfully

4. **Enable execution pruning** (if not already):
   - Set `EXECUTIONS_DATA_MAX_AGE=168` (7 days)
   - Prevents database from growing too large

---

## 🛡️ **PREVENTION**

**Best Practice**: Always use domain names (`n8n.rensto.com`) instead of IP addresses in:
- Workflow nodes
- Credentials
- Webhook URLs
- System prompts

**Why**: Makes server migrations seamless - only DNS needs updating.

---

**Last Updated**: December 6, 2025  
**Status**: ✅ **CLEANUP COMPLETE**
