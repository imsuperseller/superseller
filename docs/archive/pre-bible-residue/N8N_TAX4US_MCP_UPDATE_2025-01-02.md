# Tax4Us n8n MCP Configuration Update

**Date**: January 2, 2025  
**Status**: ✅ **CONFIGURATION COMPLETE**

---

## ✅ Updates Applied

### 1. Updated `~/.cursor/mcp.json`
- **Changed**: API key for `n8n-tax4us` MCP server
- **New Token**: Public API token (audience: `public-api`)
- **URL**: `https://tax4usllc.app.n8n.cloud`
- **Method**: `npx` stdio mode (same as Rensto)

### 2. Updated Wrapper File
- **File**: `infra/mcp-servers/n8n-mcp-wrapper/n8n-tax4us-wrapper.cjs`
- **Updated**: API key to match new public API token
- **Note**: Wrapper is for reference; actual MCP uses `npx` method

### 3. Updated Documentation
- **File**: `docs/infrastructure/MCP_CONFIGURATION.md`
- **Updated**: Tax4Us configuration example with new API token

---

## ✅ Configuration Details

### Current `mcp.json` Entry
```json
{
  "mcpServers": {
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY0NjA1OTA2fQ.J3vPZjOepbtoBoo_tFiFqbU0eNbrIUOp9V06UAFFUGQ",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

### API Token Verification
✅ **Tested**: API token successfully retrieves workflows from Tax4Us n8n instance
- **Endpoint**: `https://tax4usllc.app.n8n.cloud/api/v1/workflows`
- **Status**: 200 OK
- **Response**: Workflows data retrieved successfully

---

## 🔄 Next Steps

1. **Restart Cursor completely** to load new MCP configuration
2. **Verify MCP connection** - Should show "Connected" (not "Loading tools")
3. **Test tools** - `mcp__n8n-tax4us__n8n_list_workflows` should work

---

## 📋 Available Tools

Once Cursor restarts, the following tools should be available:

**Documentation Tools** (7):
- `mcp__n8n-tax4us__tools_documentation`
- `mcp__n8n-tax4us__search_nodes`
- `mcp__n8n-tax4us__get_node`
- `mcp__n8n-tax4us__validate_node`
- `mcp__n8n-tax4us__get_template`
- `mcp__n8n-tax4us__search_templates`
- `mcp__n8n-tax4us__validate_workflow`

**Management Tools** (12):
- `mcp__n8n-tax4us__n8n_create_workflow`
- `mcp__n8n-tax4us__n8n_get_workflow`
- `mcp__n8n-tax4us__n8n_update_full_workflow`
- `mcp__n8n-tax4us__n8n_update_partial_workflow`
- `mcp__n8n-tax4us__n8n_delete_workflow`
- `mcp__n8n-tax4us__n8n_list_workflows`
- `mcp__n8n-tax4us__n8n_validate_workflow`
- `mcp__n8n-tax4us__n8n_autofix_workflow`
- `mcp__n8n-tax4us__n8n_trigger_webhook_workflow`
- `mcp__n8n-tax4us__n8n_executions`
- `mcp__n8n-tax4us__n8n_health_check`
- `mcp__n8n-tax4us__n8n_workflow_versions`

**Total**: 19 tools (same as Rensto n8n MCP)

---

## 🔍 Token Information

### Public API Token (Used for MCP)
- **Audience**: `public-api`
- **Purpose**: Direct API access via n8n-mcp package
- **Expires**: Check token expiration date
- **Usage**: npx stdio mode MCP connection

### MCP Server Token (Alternative - Not Used)
- **Audience**: `mcp-server-api`
- **Purpose**: HTTP endpoint mode (not currently used)
- **Note**: Available if switching to HTTP endpoint mode in future

---

## ⚠️ Important: Cloud vs Self-Hosted Differences

### Technical Differences

**Rensto (Self-Hosted VPS)**:
- **URL**: `http://172.245.56.50:5678` (HTTP, IP address)
- **Type**: Self-hosted (full API access)
- **API Support**: ✅ Full - workflows, executions, credentials, health, systemInfo, logs, execute, dataTables, metrics

**Tax4Us (n8n Cloud)**:
- **URL**: `https://tax4usllc.app.n8n.cloud` (HTTPS, domain)
- **Type**: Cloud (limited API access)
- **API Support**: ⚠️ Limited - workflows ✅, executions ✅, but **NOT**: credentials, health, systemInfo, logs, execute, dataTables, metrics

### Configuration Impact

**Good News**: The `n8n-mcp` package handles these differences automatically:
- ✅ Same configuration format for both (just different URL and API key)
- ✅ Package detects instance type and adjusts available tools
- ✅ No special configuration needed for cloud vs self-hosted
- ✅ Both use `npx -y n8n-mcp` with same environment variables

**What This Means**:
- ✅ **Workflow tools work identically** on both instances
- ✅ **Execution tools work identically** on both instances
- ⚠️ **Some advanced tools may not be available** on Tax4Us Cloud (credentials, health checks, etc.)
- ✅ **MCP configuration is correct** - no changes needed

### Verified Working

Both APIs tested and working:
- ✅ **Rensto VPS**: 100 workflows accessible
- ✅ **Tax4Us Cloud**: 35 workflows accessible
- ✅ **Both**: Same API response format, same authentication method

---

## ✅ Verification Checklist

- [x] API token updated in `~/.cursor/mcp.json`
- [x] Wrapper file updated with new token
- [x] Documentation updated
- [x] API token tested and verified working
- [ ] Cursor restarted (user action required)
- [ ] MCP connection verified in Cursor
- [ ] Tools available and testable

---

## 📚 Related Documentation

- `docs/infrastructure/MCP_CONFIGURATION.md` - Main MCP configuration guide
- `docs/infrastructure/N8N_MCP_FIX_REPORT.md` - Historical fix documentation
- `docs/infrastructure/N8N_MCP_SUCCESS_2025-11-20.md` - Previous success report

---

**Configuration matches Rensto n8n MCP setup exactly. After Cursor restart, Tax4Us n8n MCP should work identically to Rensto.**

