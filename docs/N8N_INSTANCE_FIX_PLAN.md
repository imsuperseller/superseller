# 🔧 N8N INSTANCE FIX PLAN

## 🎯 **OVERVIEW**

Based on the comprehensive diagnosis, the n8n instance has configuration issues that need manual intervention before we can proceed with the BMAD plan workflow fixes.

## 📊 **DIAGNOSIS RESULTS**

### **✅ Working Operations:**
- Basic connectivity (n8n instance reachable)
- GET workflows (can retrieve workflow list)
- GET executions (can retrieve execution history)
- Workflow activation (can activate workflows)

### **❌ Failing Operations:**
- API key validation (405 error on credentials endpoint)
- n8n version check (404 error on version endpoint)
- Workflow updates (400 error on PUT requests)
- Missing API endpoints (404 errors on active, owner endpoints)

## 🔍 **ROOT CAUSE ANALYSIS**

### **1. API Key Permissions Issue**
- **Problem**: API key works for basic operations but fails on credentials management
- **Impact**: Cannot manage credentials programmatically
- **Solution**: Verify API key permissions or regenerate with proper permissions

### **2. Missing API Endpoints**
- **Problem**: Some n8n API endpoints return 404 (version, active, owner)
- **Impact**: Cannot check n8n version or get instance information
- **Solution**: Check n8n installation and configuration

### **3. Workflow Update Restrictions**
- **Problem**: PUT requests to update workflows return 400 errors
- **Impact**: Cannot fix workflow configurations programmatically
- **Solution**: Check n8n database permissions and configuration

## 🛠️ **MANUAL FIX STEPS**

### **Step 1: Access n8n Web Interface**
```bash
# SSH to Racknerd VPS
ssh root@173.254.201.134

# Check n8n service status
systemctl status n8n

# Access n8n web interface
# Open browser to: http://173.254.201.134:5678
```

### **Step 2: Verify n8n Installation**
```bash
# Check n8n version
n8n --version

# Check n8n configuration
cat /opt/n8n/.n8n/config

# Check n8n logs
journalctl -u n8n -f
```

### **Step 3: Fix API Key Permissions**
1. **Access n8n web interface**
2. **Go to Settings → API**
3. **Check current API key permissions**
4. **Regenerate API key if needed**
5. **Ensure API key has full permissions**

### **Step 4: Check Database Configuration**
```bash
# Check n8n database configuration
cat /opt/n8n/.n8n/config | grep -i database

# Check database connectivity
# (Depends on database type - SQLite, PostgreSQL, MySQL)
```

### **Step 5: Restart n8n Service**
```bash
# Restart n8n service
systemctl restart n8n

# Check service status
systemctl status n8n

# Check logs for errors
journalctl -u n8n -n 50
```

## 🎯 **BMAD PLAN WORKFLOW FIXES**

### **Current Critical Workflows Status:**
1. ✅ **Customer Onboarding Automation** (2 versions found)
2. ✅ **Lead-to-Customer Pipeline** (2 versions found)
3. ✅ **Finance Unpaid Invoices** (1 version found)
4. ❌ **Assets Renewals < 30d** (Missing - needs creation)
5. ❌ **Projects — In Progress Digest** (Missing - needs creation)

### **Immediate Actions After n8n Fix:**

#### **1. Fix Existing Critical Workflows**
- **Customer Onboarding Automation**: Fix missing trigger nodes
- **Lead-to-Customer Pipeline**: Verify configuration
- **Finance Unpaid Invoices**: Fix missing trigger nodes

#### **2. Create Missing Critical Workflows**
- **Assets Renewals < 30d**: Create new workflow
- **Projects — In Progress Digest**: Create new workflow

#### **3. Test All Critical Workflows**
- Activate each workflow
- Test execution
- Verify functionality

## 📋 **VERIFICATION STEPS**

### **After Manual Fixes:**
1. **Re-run diagnosis script**
2. **Verify API key works for all operations**
3. **Test workflow updates**
4. **Check n8n version endpoint**
5. **Verify all critical workflows can be activated**

### **Success Criteria:**
- ✅ API key validation passes
- ✅ n8n version check works
- ✅ Workflow updates succeed
- ✅ All 5 critical workflows active
- ✅ 100% success rate on critical workflows

## 🚨 **FALLBACK PLAN**

### **If Manual Fixes Fail:**
1. **Consider n8n reinstallation**
2. **Backup existing workflows**
3. **Fresh n8n installation**
4. **Restore critical workflows only**
5. **Focus on BMAD plan workflows only**

## 📊 **LEGACY WORKFLOWS MANAGEMENT**

### **Current Status:**
- **94 legacy workflows organized** into categories
- **68 workflows inactive** (can be cleaned up)
- **11 customer-specific workflows** (need proper isolation)
- **3 test workflows** (should be moved to test environment)

### **Future Actions:**
1. **Clean up inactive workflows** (after critical workflows fixed)
2. **Organize customer-specific workflows**
3. **Move test workflows to separate environment**
4. **Archive old workflows**

## 🎯 **NEXT STEPS**

### **Immediate (Manual):**
1. **Access n8n web interface**
2. **Fix API key permissions**
3. **Check n8n configuration**
4. **Restart n8n service**

### **After Manual Fixes:**
1. **Re-run diagnosis script**
2. **Fix existing critical workflows**
3. **Create missing critical workflows**
4. **Test all critical workflows**
5. **Achieve 100% critical workflow success rate**

### **Long-term:**
1. **Clean up legacy workflows**
2. **Implement proper workflow organization**
3. **Set up monitoring and alerts**
4. **Document workflow management procedures**

---

## 📞 **SUPPORT INFORMATION**

### **VPS Access:**
- **IP**: 173.254.201.134
- **Port**: 5678 (n8n web interface)
- **SSH**: root@173.254.201.134

### **Critical Files:**
- **n8n config**: `/opt/n8n/.n8n/config`
- **n8n logs**: `journalctl -u n8n`
- **n8n service**: `systemctl status n8n`

### **API Key:**
- **Current**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MWJlOWY1MC1hYjM2LTRiMjEtYjE0ZS03ZmJkOTc1YjVkM2MiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1MTk0ODMxfQ.jWtkUl32xeGcxAIWabry6z8gWCF4CMjCSCjeAjiphgE`
- **Status**: Needs permission verification/regeneration
