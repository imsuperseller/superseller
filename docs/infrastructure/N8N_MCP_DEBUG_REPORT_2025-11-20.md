# n8n-MCP Debug Report - November 20, 2025

**Issue**: n8n-mcp tools not available in Cursor
**Root Cause**: Environment variables not being passed from `~/.cursor/mcp.json` to spawned process

---

## Problem Summary

### What Gets the Command Stuck?

The `node /Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js` command hangs because:

1. **n8n-mcp is an MCP protocol server** that communicates via stdio (stdin/stdout)
2. It waits indefinitely for JSON-RPC protocol messages
3. When run directly in terminal without MCP client, it appears "stuck" but is actually waiting for protocol messages

### The Real Issue

**Environment variables are not being passed** from `~/.cursor/mcp.json` to the spawned Node.js process.

**Evidence**:
- ✅ When env vars are provided manually: `"MCP server initialized with 42 tools (n8n API: configured)"`
- ❌ When Cursor spawns it: `"MCP server initialized with 23 tools (n8n API: not configured)"`

**Result**: Only 23 documentation tools available, missing 19 n8n API tools.

---

## Test Results

### Test 1: Direct Execution with Env Vars
```bash
N8N_API_URL="http://173.254.201.134:5678" \
N8N_API_KEY="..." \
node /Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js
```

**Result**: ✅ **42 tools initialized (n8n API: configured)**

### Test 2: MCP Protocol Test
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize",...}' | \
N8N_API_URL="http://173.254.201.134:5678" \
N8N_API_KEY="..." \
node /Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js
```

**Result**: ✅ **Server responds correctly, 42 tools available**

### Test 3: Cursor Spawned Process
**Status**: ❌ **23 tools only (n8n API: not configured)**

**Conclusion**: Cursor is not passing `env` variables from `mcp.json` to the spawned process.

---

## Current Configuration

**File**: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "node",
      "args": ["/Users/shaifriedman/.npm-global/lib/node_modules/n8n-mcp/dist/mcp/index.js"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "N8N_INSTANCE_ID": "rensto-selfhosted",
        "ENABLE_ALL_TOOLS": "true"
      }
    }
  }
}
```

**Config Structure**: ✅ Correct (matches MCP spec)

---

## Solution: Wrapper Script

Create a wrapper script that explicitly sets environment variables before spawning n8n-mcp.

**Benefits**:
- Guarantees env vars are set
- Works around Cursor's env var passing bug
- Can add logging/debugging
- Single point of configuration

**Implementation**: See `infra/mcp-servers/n8n-mcp-wrapper/` directory

---

## Next Steps

1. ✅ Create wrapper script for n8n-rensto
2. ✅ Update `~/.cursor/mcp.json` to use wrapper
3. ⏳ Test in Cursor after restart
4. ⏳ Repeat for n8n-tax4us and n8n-shelly if needed

---

## References

- Previous reports: `docs/infrastructure/MCP_TOOLS_TEST_RESULTS.md`
- Cursor bug: `docs/infrastructure/CURSOR_MCP_INTEGRATION_DIAGNOSTIC_REPORT.md`
- n8n-mcp package: https://github.com/czlonkowski/n8n-mcp

