# Multi-Instance n8n MCP: What Worked, What Broke, What's Fixed

**Date**: October 10, 2025
**Issue**: Understanding why Tax4Us MCP access stopped working
**Root Cause**: Multi-instance manager replaced working 3-server setup with broken single-server switching

---

## Executive Summary

**THE ORIGINAL APPROACH WORKED**:
- 3 separate n8n MCP servers configured simultaneously
- Each with unique name: `n8n-rensto`, `n8n-tax4us`, `n8n-shelly`
- Claude Code could access ANY instance via `mcp__n8n-tax4us__*` tools
- No switching needed, no Cursor restarts required

**THE MULTI-INSTANCE MANAGER BROKE IT**:
- Attempted to create a "switching" system (Oct 8-9, 2025)
- Replaced 3 servers with 1 server that gets reconfigured
- Required Cursor restart after every switch (MCP limitation)
- Made MCP tools inaccessible

**CURRENT STATUS**:
- ✅ **mcp.json has REVERTED to 3-server config** (as of Oct 9, 2025)
- ⚠️ **Claude Code NOT restarted yet**, so tools not visible
- ✅ **Config is correct**, just needs restart to activate

---

## What Worked (Original Setup - Before Oct 8, 2025)

### Configuration (3 Separate MCP Servers)

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJ..."
      }
    },
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "eyJ..."
      }
    },
    "n8n-shelly": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://shellyins.app.n8n.cloud",
        "N8N_API_KEY": "eyJ..."
      }
    }
  }
}
```

### How It Worked

**Available Tools** (after Claude Code start):
```
mcp__n8n-rensto__n8n_list_workflows     ← Rensto VPS workflows
mcp__n8n-rensto__n8n_get_workflow
...

mcp__n8n-tax4us__n8n_list_workflows     ← Tax4Us workflows
mcp__n8n-tax4us__n8n_get_workflow
...

mcp__n8n-shelly__n8n_list_workflows     ← Shelly workflows
mcp__n8n-shelly__n8n_get_workflow
...
```

**Benefits**:
- ✅ All 3 instances accessible simultaneously
- ✅ No switching required
- ✅ No Cursor restarts needed
- ✅ Direct access via unique tool names
- ✅ Complete instance isolation
- ✅ No confusion about which instance is "active"

**Tool Count**:
- n8n-rensto: 42 tools
- n8n-tax4us: 42 tools
- n8n-shelly: 42 tools
- **Total: 126 n8n tools** (+ other MCP servers)

---

## What Broke (Multi-Instance Manager - Oct 8-9, 2025)

### The Failed Approach

**Concept**: Instead of 3 separate MCP servers, use 1 server and "switch" its configuration

**Implementation**:
```javascript
// n8n-instance-manager.js
async switchToInstance(instanceName) {
  // Update ~/.cursor/mcp.json with new N8N_API_URL and N8N_API_KEY
  // Replace entire n8n-mcp server config
  // Requires Cursor restart to take effect
}
```

**Problems**:
1. ❌ **MCP can't hot-reload** - Cursor restart required after every switch
2. ❌ **Only 1 instance accessible at a time** - lost ability to work with multiple
3. ❌ **Switching complexity** - required scripts, backups, safety checks
4. ❌ **Error-prone** - easy to forget which instance is "active"
5. ❌ **Broke workflow** - made MCP tools inaccessible

**Why It Failed**:
- MCP servers load at Cursor startup
- Configuration changes require full restart
- Can't dynamically switch between instances
- Attempted workaround was overly complex

**Documentation Created** (archived):
- `/infra/archive/n8n-multi-instance-manager-FAILED-2025-10-09/`
- `MCP_INVESTIGATION_REPORT.md`
- `MCP_DIAGNOSTIC_COMPLETE.md`
- `INSTANT_SWITCHING_SOLUTION.md`
- `USAGE_GUIDE.md`

---

## What's Fixed (Current State - Oct 10, 2025)

### Configuration Reverted

**Current ~/.cursor/mcp.json** (as of Oct 9, 2025):
```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "[REDACTED_RENSTO_VPS_KEY]",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "[REDACTED_TAX4US_KEY]",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-shelly": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://shellyins.app.n8n.cloud",
        "N8N_API_KEY": "[REDACTED_SHELLY_KEY]",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

**Status**:
- ✅ All 3 n8n MCP servers configured
- ✅ Each with unique name and API credentials
- ✅ All using `npx` (not Docker - fixed Oct 9)
- ⚠️ **Requires Claude Code restart to activate**

### After Restart (Expected Behavior)

**Available Tools**:
```
mcp__n8n-rensto__*     (42 tools for Rensto VPS)
mcp__n8n-tax4us__*     (42 tools for Tax4Us Cloud)
mcp__n8n-shelly__*     (42 tools for Shelly Cloud)
```

**Usage**:
```
# Work with Rensto VPS
mcp__n8n-rensto__n8n_list_workflows()

# Work with Tax4Us Cloud
mcp__n8n-tax4us__n8n_list_workflows()

# Work with Shelly Cloud
mcp__n8n-shelly__n8n_list_workflows()

# All accessible simultaneously, no switching needed!
```

---

## Key Learnings

### ✅ What Works

**3 Separate MCP Servers**:
- Each n8n instance gets its own MCP server with unique name
- All instances accessible simultaneously
- No switching, no restarts (except initial Claude Code start)
- Clear, explicit tool names (`mcp__n8n-tax4us__*`)

**npx Instead of Docker**:
- Fixed stdin lifecycle issues (Oct 9, 2025)
- All 40+ tools now functional
- Lower memory usage
- Faster startup

### ❌ What Doesn't Work

**Single MCP Server with Switching**:
- Can't hot-reload MCP configuration
- Requires Cursor restart after every switch
- Only 1 instance accessible at a time
- Complex, error-prone workflow

**Why Switching Fails**:
- MCP servers initialize at Cursor startup
- Environment variables baked into running process
- No IPC mechanism to update running MCP server
- Architectural limitation of MCP protocol

### 📚 Documentation

**What to Keep**:
- `/docs/infrastructure/N8N_MCP_FIX_REPORT.md` - Docker → npx fix
- `/docs/infrastructure/MULTI_N8N_MCP_HISTORY_REPORT.md` - This document
- `~/.cursor/mcp.json` - Current working 3-server config

**What to Ignore**:
- `/infra/archive/n8n-multi-instance-manager-FAILED-2025-10-09/` - Entire directory
- `n8n-instance-manager.js` - Switching approach doesn't work
- All "switching" documentation

---

## Recommendations

### Immediate Action Required

**RESTART CLAUDE CODE**:
1. Quit Claude Code completely (Cmd+Q)
2. Reopen Claude Code
3. Verify tools are now visible:
   ```
   Ask: "List all available MCP tools with 'n8n' in the name"
   ```
4. Expected to see:
   - `mcp__n8n-rensto__*` (42 tools)
   - `mcp__n8n-tax4us__*` (42 tools)
   - `mcp__n8n-shelly__*` (42 tools)

### Long-Term Strategy

**Keep 3-Server Approach**:
- ✅ DO: Keep current 3-server configuration
- ✅ DO: Use explicit tool names to access specific instances
- ✅ DO: Document which instance serves which purpose
- ❌ DON'T: Try to implement switching
- ❌ DON'T: Reduce to single MCP server
- ❌ DON'T: Use environment variable switching

**Tool Count Management**:
- Current: 126 n8n tools (42 × 3 instances)
- Plus: 12 other MCP servers (airtable, notion, stripe, etc.)
- Total: ~170-200 tools estimated
- Cursor limit: Unknown (previously thought to be 40, but clearly handles more)

**If Tool Limit Exceeded**:
- Disable non-essential MCP servers temporarily
- Keep all 3 n8n servers (highest priority)
- Re-enable other servers as needed

---

## Verification Checklist

After Claude Code restart, verify:

- [ ] `mcp__n8n-rensto__n8n_list_workflows` returns Rensto VPS workflows (70 workflows)
- [ ] `mcp__n8n-tax4us__n8n_list_workflows` returns Tax4Us workflows (18 workflows)
- [ ] `mcp__n8n-shelly__n8n_list_workflows` returns Shelly workflows
- [ ] All 3 instances accessible without switching
- [ ] No Cursor restart needed to change instances
- [ ] No confusion about which instance is "active"

---

## TLDR

**Before Oct 8**: 3 separate MCP servers, everything worked ✅
**Oct 8-9**: Implemented switching, broke everything ❌
**Oct 9**: Reverted to 3 servers, fixed Docker issue ✅
**Oct 10 (now)**: Config is correct, just needs Claude Code restart ⚠️

**Next Step**: **RESTART CLAUDE CODE** to activate the working configuration.

---

**Status**: ANALYSIS COMPLETE ✅
**Root Cause**: Multi-instance manager (archived) ✅
**Solution**: 3-server config (active) ✅
**Action Required**: Restart Claude Code ⚠️
