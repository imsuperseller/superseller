# MCP Tools Investigation - November 20, 2025

## Issue
When attempting to use n8n MCP tools (e.g., `mcp_n8n-rensto_n8n_list_executions`), the tools are not available in the tool list, resulting in errors like:
```
Error calling tool: Tool mcp_n8n-rensto_n8n_list_executions not found
```

## Root Cause Analysis

### Configuration Check
- **MCP Config Location**: `~/.cursor/mcp.json`
- **n8n-rensto Server Config**:
  ```json
  {
    "command": "npx",
    "args": ["-y", "n8n-mcp@latest"],
    "env": {
      "N8N_API_URL": "http://173.254.201.134:5678",
      "N8N_API_KEY": "...",
      "N8N_INSTANCE_ID": "rensto-selfhosted",
      "ENABLE_ALL_TOOLS": "true"
    }
  }
  ```

### Verification Steps Taken
1. ✅ n8n-mcp package is installable (`npx -y n8n-mcp@latest` works)
2. ❌ MCP tools not appearing in available tools list
3. ❌ `list_mcp_resources` returns no resources for n8n-rensto server

### Possible Causes
1. **MCP Server Not Running**: The n8n-mcp server may not be properly initialized by Cursor
2. **Tool Registration Issue**: Tools may not be properly registered with the MCP protocol
3. **Cursor Integration Issue**: Cursor may not be properly connecting to the MCP server
4. **Version Mismatch**: n8n-mcp@latest may have breaking changes

## Workaround Used
Direct API calls via Python/curl to n8n REST API:
```python
requests.get(
    "http://173.254.201.134:5678/api/v1/executions",
    headers={"X-N8N-API-KEY": "..."}
)
```

## Fix Applied (November 20, 2025)

**⚠️ HISTORICAL NOTE**: This document references using a direct path to installed package, but the current working solution is **npx mode** (see `docs/infrastructure/MCP_CONFIGURATION.md`).

**Current Working Solution**:
```json
{
  "command": "npx",
  "args": ["-y", "n8n-mcp"],
  "env": {
    "N8N_API_URL": "http://173.254.201.134:5678",
    "N8N_API_KEY": "[API_KEY]",
    "MCP_MODE": "stdio",
    "LOG_LEVEL": "error"
  }
}
```

**Verification**:
- ✅ n8n-mcp@2.22.19 installed globally
- ✅ Entry point file exists at `/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js`
- ✅ Config updated to match working `n8n-tax4us` pattern

**Action Required**: **RESTART CURSOR** for MCP configuration changes to take effect. After restart, n8n MCP tools should be available.

## Next Steps
1. ✅ Config fixed - matches working n8n-tax4us pattern
2. ⏳ **RESTART CURSOR** to load new MCP configuration
3. Test MCP tools after restart: `mcp_n8n-rensto_n8n_list_executions`, `mcp_n8n-rensto_n8n_get_execution`, etc.

## Impact
- **Before**: MCP tools not available, had to use direct API calls
- **After**: MCP tools should be available after Cursor restart
- **Long-term**: Proper MCP architecture maintained

