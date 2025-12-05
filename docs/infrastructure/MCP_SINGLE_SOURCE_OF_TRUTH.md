# MCP Configuration - Single Source of Truth

**⚠️ NOTE**: This is a duplicate of `MCP_CONFIGURATION.md`. For the authoritative document, see `docs/infrastructure/MCP_CONFIGURATION.md`.

**Last Updated**: November 28, 2025  
**Status**: ✅ **WORKING CONFIGURATION**

---

## ⚠️ CRITICAL: This is the ONLY working configuration

**All other MCP configuration approaches have been tested and failed:**
- ❌ Docker stdio mode - stdin closes prematurely
- ❌ HTTP endpoint mode - returns 404 errors
- ❌ Docker with startup scripts - same stdin issues

**✅ ONLY THIS WORKS**: npx mode (proven in October 2025)

---

## ✅ Working Configuration

**File**: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjM4OTQwMTM4LTVhZDUtNDBmZi1hZDM1LTgwZTY4MmRhYWZlNiIsImlhdCI6MTc2NDA1MjcyNX0.s_3K8cJYO3h6VuY4rpc94rIIo5eZOkWnyOfBAn5VnV4",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-shelly": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://shellyins.app.n8n.cloud",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNjUxZWNkZS04Yzc5LTRiMTktYjEzMC04NTJiY2VkYWViY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NDk1MDk3fQ.pDpDBUrHJCiPh1xaaq0p9PmRoGp-i36hiR_Ld_EhtZc",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

---

## ✅ Why This Works

1. **Proven in October 2025** - Fixed Docker stdio issues
2. **No Docker stdin problems** - Node.js handles stdio properly
3. **Faster startup** - No Docker image pull
4. **Lower memory** - Node.js process vs Docker container
5. **19 tools available** - All functionality working

---

## ❌ What Does NOT Work

### Docker stdio mode
- **Problem**: stdin closes prematurely, container exits before API calls complete
- **Documented**: `docs/infrastructure/N8N_MCP_FIX_REPORT.md` (October 2025)
- **Status**: ❌ DO NOT USE

### HTTP endpoint mode
- **Problem**: Returns 404 errors, SSE connection fails
- **Status**: ❌ DO NOT USE

### Docker with startup scripts
- **Problem**: Same stdin issues as Docker stdio
- **Status**: ❌ DO NOT USE

---

## 📋 Tools Available

**Total**: 19 tools (consolidated from 38 in older versions)

**Documentation Tools** (7):
- `tools_documentation`
- `search_nodes`
- `get_node`
- `validate_node`
- `get_template`
- `search_templates`
- `validate_workflow`

**Management Tools** (12):
- `n8n_create_workflow`
- `n8n_get_workflow`
- `n8n_update_full_workflow`
- `n8n_update_partial_workflow` (has known bug, use `n8n_update_full_workflow` as workaround)
- `n8n_delete_workflow`
- `n8n_list_workflows`
- `n8n_validate_workflow`
- `n8n_autofix_workflow`
- `n8n_trigger_webhook_workflow`
- `n8n_executions` (unified: get/list/delete)
- `n8n_health_check`
- `n8n_workflow_versions`

---

## 🔄 After Configuration Changes

1. **Restart Cursor completely**
2. **Check MCP status** - Should show "Connected" (not "Loading tools")
3. **Test tools** - `n8n_list_workflows` should work

---

## 📚 Historical Reference

- **October 2025**: Docker stdio had issues → Switched to npx ✅
- **November 2025**: Attempted HTTP endpoint → 404 errors ❌
- **November 28, 2025**: Confirmed npx is the only working solution ✅

**Reference**: `docs/infrastructure/N8N_MCP_FIX_REPORT.md` (October 2025)

---

## 🚨 IMPORTANT

**This is the ONLY configuration that works. All other approaches have been tested and failed.**

**If you see any documentation suggesting Docker or HTTP endpoint mode, it is OUTDATED and WRONG.**

**Always refer to this file**: `docs/infrastructure/MCP_CONFIGURATION.md`

---

**Last Updated**: November 28, 2025

