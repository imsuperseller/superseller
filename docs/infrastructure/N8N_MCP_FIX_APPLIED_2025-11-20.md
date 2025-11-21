# n8n-MCP Fix Applied - November 20, 2025

**Status**: ✅ **FIX APPLIED** - Wrapper scripts created and config updated

---

## Problem Summary

**Issue**: n8n-mcp tools not available in Cursor (only 23 tools instead of 42)

**Root Cause**: Cursor not passing environment variables from `~/.cursor/mcp.json` to spawned Node.js process

**Evidence**:
- ✅ With env vars: `"MCP server initialized with 42 tools (n8n API: configured)"`
- ❌ Without env vars: `"MCP server initialized with 23 tools (n8n API: not configured)"`

---

## Solution Implemented

### Wrapper Scripts Created

Created 3 wrapper scripts that explicitly set environment variables before spawning n8n-mcp:

1. **`infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs`**
   - Sets `N8N_API_URL` and `N8N_API_KEY` for Rensto VPS instance
   - Spawns n8n-mcp with environment variables guaranteed

2. **`infra/mcp-servers/n8n-mcp-wrapper/n8n-tax4us-wrapper.cjs`**
   - Sets `N8N_API_URL` and `N8N_API_KEY` for Tax4Us Cloud instance

3. **`infra/mcp-servers/n8n-mcp-wrapper/n8n-shelly-wrapper.cjs`**
   - Sets `N8N_API_URL` and `N8N_API_KEY` for Shelly Cloud instance

### Configuration Updated

**File**: `~/.cursor/mcp.json`

**Before**:
```json
{
  "n8n-rensto": {
    "command": "node",
    "args": ["/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js"],
    "env": {
      "N8N_API_URL": "...",
      "N8N_API_KEY": "..."
    }
  }
}
```

**After**:
```json
{
  "n8n-rensto": {
    "command": "node",
    "args": ["/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs"]
  }
}
```

**Benefits**:
- ✅ Environment variables guaranteed to be set
- ✅ Works around Cursor's env var passing bug
- ✅ Single point of configuration
- ✅ Can add logging/debugging if needed

---

## Next Steps

1. **Restart Cursor completely** (required for MCP config changes)
2. **Verify tools are available** - Should see 42 tools per instance (not 23)
3. **Test n8n API tools** - Tools like `n8n_health_check`, `n8n_list_workflows` should be available

---

## Testing

To test the wrapper manually:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize",...}' | \
node /Users/shaifriedman/New\ Rensto/rensto/infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs
```

**Expected**: Server responds with protocol version and capabilities.

---

## Files Created

- `infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs`
- `infra/mcp-servers/n8n-mcp-wrapper/n8n-tax4us-wrapper.cjs`
- `infra/mcp-servers/n8n-mcp-wrapper/n8n-shelly-wrapper.cjs`
- `docs/infrastructure/N8N_MCP_DEBUG_REPORT_2025-11-20.md`
- `docs/infrastructure/N8N_MCP_FIX_APPLIED_2025-11-20.md` (this file)

---

## References

- Debug report: `docs/infrastructure/N8N_MCP_DEBUG_REPORT_2025-11-20.md`
- Previous reports: `docs/infrastructure/MCP_TOOLS_TEST_RESULTS.md`

