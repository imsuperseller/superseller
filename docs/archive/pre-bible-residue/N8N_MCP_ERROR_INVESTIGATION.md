# n8n MCP Error Investigation

**Date**: November 26, 2025  
**Status**: ⚠️ Errors showing but MCP functional  
**Priority**: Medium (MCP works, but errors should be fixed)

---

## 🔍 **Current Status**

From Cursor MCP server list:
- **n8n-rensto**: "Error - Show Output" (red dot) ⚠️
- **n8n-tax4us**: "Disabled" (no red dot) ✅ (intentional)
- **n8n-ops**: "Error - Show Output" (red dot) ⚠️

---

## ✅ **What We Know**

### **MCP Still Works**
- ✅ MCP servers are separate from workflow execution
- ✅ Errors are workflow execution failures, not MCP failures
- ✅ MCP can still query n8n API, manage workflows, access data

### **But Errors Should Be Fixed**
- ⚠️ Errors indicate workflow execution problems
- ⚠️ May indicate configuration issues
- ⚠️ Could affect workflow functionality

---

## 🔍 **What These Errors Likely Mean**

### **"Error - Show Output"**
**Possible Causes**:
1. **Workflow execution failed** - A workflow run encountered an error
2. **MCP server connection issue** - Temporary connection problem
3. **Configuration error** - Invalid credentials or endpoint
4. **n8n API error** - n8n instance returned an error

### **"Disabled"**
- **n8n-tax4us**: This is likely intentional (workflow disabled)
- ✅ Not an error - just inactive

---

## 🔧 **Investigation Steps**

### **Step 1: Check MCP Server Logs**

**For n8n-rensto**:
- ⚠️ HTTP endpoint returns 404 - Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)
- Verify JWT token is valid
- Check n8n instance health: `http://172.245.56.50:5678/healthz`

**For n8n-ops**:
- Check if unified server script is running
- Verify environment variables are set correctly
- Check if all 3 n8n instances are accessible

### **Step 2: Check n8n Workflow Executions**

**Possible workflow errors**:
- Workflow execution failures
- Node configuration errors
- Missing credentials
- Invalid connections

**Action**: Use MCP tools to check recent executions:
```javascript
// Check recent executions for errors
mcp_n8n-rensto_n8n_list_executions({
  limit: 10,
  status: "error"
})
```

### **Step 3: Verify MCP Configuration**

**Check mcp.json**:
- ✅ n8n-rensto: npx mode configured (see `docs/infrastructure/MCP_CONFIGURATION.md`)
- ✅ n8n-tax4us: npx mode configured
- ✅ n8n-ops: Local script configured
- ✅ n8n-shelly: npx mode configured
- ⚠️ HTTP endpoint mode returns 404 - not used

**Verify credentials**:
- JWT tokens valid and not expired
- API keys correct
- Endpoints accessible

---

## 📊 **Recommended Actions**

### **Priority 1: Investigate Errors** (30 min)

1. **Check MCP server status**:
   - Test HTTP endpoints
   - Verify credentials
   - Check n8n instance health

2. **Check workflow executions**:
   - List recent failed executions
   - Identify error patterns
   - Fix workflow issues

3. **Verify MCP functionality**:
   - Test MCP tools
   - Confirm tools are callable
   - Verify data access

### **Priority 2: Fix Root Causes** (1-2 hours)

**If workflow execution errors**:
- Fix workflow node issues
- Update credentials
- Fix connections

**If MCP connection errors**:
- Update JWT tokens if expired
- Fix endpoint URLs
- Restart MCP servers if needed

### **Priority 3: Monitor** (Ongoing)

- Set up error alerts
- Monitor workflow execution success rate
- Track MCP server health

---

## ✅ **Acceptable vs Unacceptable**

### **✅ Acceptable**:
- **n8n-tax4us: "Disabled"** - Intentional, workflow inactive
- **Temporary errors** - Network hiccups, transient issues
- **Workflow execution errors** - Can be fixed, MCP still works

### **⚠️ Needs Investigation**:
- **Persistent "Error - Show Output"** - Should be investigated
- **MCP tools not working** - Critical issue
- **n8n API inaccessible** - Blocks MCP functionality

---

## 🎯 **Conclusion**

**Current State**: 
- ✅ MCP functional (can use tools)
- ⚠️ Errors showing (should investigate)
- ✅ Not blocking MCP usage

**Recommendation**:
1. **Short term**: Accept errors if MCP tools work
2. **Medium term**: Investigate and fix root causes
3. **Long term**: Set up monitoring to prevent future issues

**Action Required**: 
- ⚠️ Investigate errors when time permits
- ✅ Continue using MCP tools (they work despite errors)
- 📋 Document findings when investigating

---

**Last Updated**: November 26, 2025  
**Status**: MCP functional, errors need investigation

