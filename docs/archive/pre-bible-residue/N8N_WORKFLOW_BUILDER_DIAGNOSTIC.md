# n8n-workflow-builder MCP Server Diagnostic Report

**Date**: October 12, 2025
**Status**: ⚠️ Server Functional, Tools Not Exposed to Claude Code

---

## Executive Summary

The n8n-workflow-builder MCP server is **fully functional** at the server level:
- ✅ Configuration corrected (URL doubling issue fixed)
- ✅ All 3 instances respond correctly with different API keys
- ✅ JSON-RPC protocol working perfectly
- ❌ **Critical Gap**: Tools not accessible to Claude Code main session

---

## What Works

### 1. MCP Server Configuration ✅

**Location**: `/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified.json`

**Fixed Configuration**:
```json
{
  "environments": {
    "rensto": {
      "n8n_host": "http://172.245.56.50:5678",
      "n8n_api_key": "[REDACTED_RENSTO_KEY]"
    },
    "tax4us": {
      "n8n_host": "https://tax4usllc.app.n8n.cloud",
      "n8n_api_key": "[REDACTED_TAX4US_KEY]"
    },
    "shelly": {
      "n8n_host": "https://shellyins.app.n8n.cloud",
      "n8n_api_key": "[REDACTED_SHELLY_KEY]"
    }
  },
  "defaultEnv": "rensto"
}
```

**Key Fix**: Removed `/api/v1/` suffix from URLs (was causing URL doubling: `/api/v1//api/v1/workflows`)

### 2. Server Functionality ✅

**Test Results** (via direct JSON-RPC):
```bash
# Rensto VPS
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"rensto"}}}' | node build/index.js
# Result: ✅ 200 OK, 56+ workflows returned

# Tax4Us Cloud
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"tax4us"}}}' | node build/index.js
# Result: ✅ 200 OK, different API key used

# Shelly Cloud
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"shelly"}}}' | node build/index.js
# Result: ✅ 200 OK, different API key used
```

**Verified Behavior**:
- ✅ Each instance uses its correct API key
- ✅ Correct base URL construction (`http://172.245.56.50:5678/api/v1/workflows`)
- ✅ Environment switching works perfectly
- ✅ All API responses valid JSON

### 3. Cursor Registration ✅

**Location**: `~/.cursor/mcp.json`

**Configuration**:
```json
{
  "mcpServers": {
    "n8n": {
      "command": "node",
      "args": [
        "/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js"
      ]
    }
  }
}
```

**Status**: ✅ Correctly registered (server name: `n8n`)

---

## What Doesn't Work

### Critical Issue: Tool Accessibility ❌

**Problem**: Claude Code main session has **0 tools** from n8n-workflow-builder server

**Expected Tools** (should be prefixed `mcp__n8n__*`):
1. `mcp__n8n__list_workflows`
2. `mcp__n8n__get_workflow`
3. `mcp__n8n__create_workflow`
4. `mcp__n8n__update_workflow`
5. `mcp__n8n__delete_workflow`
6. `mcp__n8n__activate_workflow`
7. `mcp__n8n__deactivate_workflow`
8. `mcp__n8n__execute_workflow`
9. `mcp__n8n__list_executions`
10. `mcp__n8n__get_execution`
11. `mcp__n8n__delete_execution`
12. `mcp__n8n__create_tag`
13. `mcp__n8n__get_tags`
14. `mcp__n8n__get_tag`
15. `mcp__n8n__update_tag`
16. `mcp__n8n__delete_tag`

**Actual Tools Available**: 0

**Tools Claude Code DOES Have**:
- Standard tools: Bash, Read, Edit, Write, Glob, Grep, etc.
- IDE tools: `mcp__ide__getDiagnostics`, `mcp__ide__executeCode`
- Other MCP servers: (not tested, but likely working if ide tools work)

---

## Root Cause Analysis

### Hypothesis 1: Cursor-Level Integration Issue ⚠️

**Evidence**:
- Other MCP servers (like `ide`) expose tools successfully
- Direct JSON-RPC calls to n8n server work perfectly
- Cursor shows server in config but tools not exposed

**Likely Cause**: Cursor's MCP client may be:
- Not loading the n8n server on startup
- Failing silently during tool discovery
- Caching old tool lists

### Hypothesis 2: Tool Discovery Protocol Issue ⚠️

**Evidence**:
- Server implements `tools/list` correctly (tested via JSON-RPC)
- Returns 16 tool definitions with proper schemas
- But tools don't appear in Claude Code's tool list

**Possible Cause**: Cursor may require:
- Specific tool naming conventions
- Additional metadata in tool definitions
- Server restart or Cursor restart

### Hypothesis 3: Server Lifecycle Issue ⚠️

**Evidence**:
- Server shows: "Port 3456 is already in use. Assuming another instance is already running."
- This happens on every test

**Concern**: Multiple instances may be running, causing confusion

---

## Diagnostic Commands

### Check Server is Running
```bash
lsof -i :3456
# Should show node process
```

### Test Server Directly
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node build/index.js 2>&1 | grep -A 5 "list_workflows"
```

### Check Cursor Logs
```bash
# Cursor logs location (may vary):
# ~/Library/Logs/Cursor/
# Look for MCP-related errors
```

### Verify MCP Config Syntax
```bash
cat ~/.cursor/mcp.json | jq '.mcpServers.n8n'
# Should return valid JSON
```

---

## Action Plan

### Immediate Actions (User Required)

1. **Restart Cursor** (CRITICAL)
   ```bash
   # Close Cursor completely
   # macOS: Cmd+Q (not just close window)
   # Relaunch Cursor
   ```

   **Why**: Cursor only loads MCP servers on startup. Config changes require full restart.

2. **Verify Tools Appear**
   - After restart, check if `mcp__n8n__*` tools visible
   - Test with simple command like: "List all n8n workflows"

3. **Check Cursor Developer Console** (if tools still missing)
   - Open Cursor Developer Tools
   - Check Console for MCP-related errors
   - Look for "n8n" server initialization logs

### If Still Not Working

**Option A: Kill All Node Processes**
```bash
# Warning: This kills ALL node processes
pkill -f "n8n-unified-server"
# Then restart Cursor
```

**Option B: Change Server Name**
```bash
# Edit ~/.cursor/mcp.json
# Change "n8n" to "n8n-workflow-builder"
# May help with tool prefix generation
```

**Option C: Add Explicit Config to Index.js**
```javascript
// In build/index.js, ensure server name matches:
new Server(
  { name: 'n8n', version: '0.3.0' }, // Must match ~/.cursor/mcp.json key
  { capabilities: { tools: {}, resources: {}, prompts: {} } }
);
```

**Option D: Test with Different MCP Client**
```bash
# Install MCP inspector
npm install -g @modelcontextprotocol/inspector

# Test server
mcp-inspector /Users/shaifriedman/New\ Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js
```

---

## Success Criteria

The following must all be true for success:

1. ✅ Server responds to JSON-RPC `tools/list` (DONE)
2. ✅ Server responds to `list_workflows` with all 3 instances (DONE)
3. ✅ Each instance uses correct API key (DONE)
4. ✅ Cursor config valid JSON (DONE)
5. ❌ **Claude Code sees `mcp__n8n__*` tools** (BLOCKED)
6. ❌ **Claude Code can call `mcp__n8n__list_workflows`** (BLOCKED)
7. ❌ **Claude Code can specify instance parameter** (BLOCKED)

---

## Technical Details

### Server Architecture

**Entry Point**: `/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js`

**Key Components**:
- `N8NWorkflowServer` class (MCP server implementation)
- `EnvironmentManager` (handles multi-instance config)
- `ConfigLoader` (reads `.config.json`)
- `n8nApi` (makes API calls with correct credentials)

**Tool Registration**:
```typescript
// src/index.ts line 253
this.server.setRequestHandler(ListToolsRequestSchema, async (req: any) => {
  return {
    tools: [
      {
        name: 'list_workflows',
        enabled: true,
        description: 'List all workflows...',
        inputSchema: {
          type: 'object',
          properties: {
            instance: {
              type: 'string',
              description: 'Optional instance name (rensto, tax4us, shelly)'
            }
          }
        }
      },
      // ... 15 more tools
    ]
  };
});
```

**Tool Handler**:
```typescript
// src/index.ts line 665
this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'list_workflows':
      const workflows = await this.n8nWrapper.listWorkflows(args.instance);
      return { content: [{ type: 'text', text: JSON.stringify(workflows) }] };
    // ... other tools
  }
});
```

### Environment Switching Logic

**Parameter Flow**:
1. Claude Code calls: `mcp__n8n__list_workflows({ instance: "tax4us" })`
2. MCP server receives: `{ name: "list_workflows", arguments: { instance: "tax4us" } }`
3. Handler calls: `n8nWrapper.listWorkflows("tax4us")`
4. Wrapper calls: `envManager.getApiInstance("tax4us")`
5. ConfigLoader gets: `config.environments.tax4us`
6. Returns axios instance with: `baseURL: "https://tax4usllc.app.n8n.cloud/api/v1"` + correct API key

**Default Behavior** (no instance specified):
- Uses `defaultEnv: "rensto"` from `.config.json`
- Falls back to Rensto VPS

---

## Known Working Commands

### Test All 3 Instances (Bash)
```bash
cd /Users/shaifriedman/New\ Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers

# Rensto VPS
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"rensto"}}}' | node build/index.js 2>&1 | grep -E "(Response status:|API Key:)" | head -2

# Tax4Us Cloud
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"tax4us"}}}' | node build/index.js 2>&1 | grep -E "(Response status:|API Key:)" | head -2

# Shelly Cloud
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_workflows","arguments":{"instance":"shelly"}}}' | node build/index.js 2>&1 | grep -E "(Response status:|API Key:)" | head -2
```

### Expected Output
```
[DEBUG] API Key: [REDACTED_KEY] [different for each instance]
[DEBUG] Response status: 200
```

---

## Next Steps

### Priority 1: User Must Restart Cursor ⏸️

**Action**: User closes and relaunches Cursor
**Expected Result**: Tools appear in Claude Code's tool list
**Verification**: User asks Claude Code to list workflows

### Priority 2: If Tools Still Missing 🔍

**Action**: User shares Cursor console logs showing MCP server initialization
**Expected Info**:
- Did server start successfully?
- Were tools registered?
- Any errors during initialization?

### Priority 3: Alternative Access Method 🔧

If Cursor integration continues failing:
- Create wrapper Bash scripts that call JSON-RPC directly
- Add to allowed commands in `.cursorrules`
- Less elegant but would unblock workflow management

---

## Documentation Updates Needed

### CLAUDE.md Updates
```markdown
## 18. n8n-MCP Workflow Builder Fix (Oct 12, 2025)

**Issue**: URL doubling + tool accessibility
**Status**: ✅ Server Fixed, ⏸️ Awaiting Cursor Restart
**Solution**:
- Removed `/api/v1/` suffix from `.config.json`
- Verified all 3 instances working via JSON-RPC
- Next: User restart Cursor to expose tools

**Usage** (once tools available):
- `mcp__n8n__list_workflows({ instance: "rensto" })` - Rensto VPS
- `mcp__n8n__list_workflows({ instance: "tax4us" })` - Tax4Us Cloud
- `mcp__n8n__list_workflows({ instance: "shelly" })` - Shelly Cloud
```

---

## References

- **Server Code**: `/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/`
- **Config File**: `/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified.json`
- **Cursor Config**: `~/.cursor/mcp.json`
- **Previous Report**: `/docs/infrastructure/N8N_MCP_FIX_REPORT.md` (Oct 9, 2025 - npx vs Docker fix)
- **Tool Access Audit**: `/docs/infrastructure/TOOL_ACCESS_AUDIT_REPORT.md` (Oct 11, 2025)

---

**Report Status**: Complete
**Last Updated**: October 12, 2025, 1:15 AM PST
**Next Review**: After user restarts Cursor and tests tool availability
