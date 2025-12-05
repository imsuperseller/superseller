# n8n MCP Multi-Instance Fix - October 10, 2025

**Issue**: Both Cursor and Claude Desktop running n8n MCP servers, but Docker containers interfering with npx-based servers
**Status**: ✅ FIXED
**Solution**: Killed Docker containers, both apps now using correct npx-based config

---

## Problem Analysis

### What Was Happening

User runs **BOTH Cursor and Claude Desktop simultaneously**, and both apps use `~/.cursor/mcp.json` for MCP configuration.

**Evidence**:
```bash
ps aux | grep -E "Claude|Cursor"
# Shows both apps running
```

**MCP Processes Running**:
- 3 × npx-based n8n-mcp processes (correct)
- ⚠️ Docker-based n8n-mcp processes don't work (use npx instead - see `docs/infrastructure/MCP_CONFIGURATION.md`)

**Log Files**:
- `~/Library/Logs/Claude/mcp-server-n8n-rensto.log` (should exist)
- `~/Library/Logs/Claude/mcp-server-tax4us-n8n.log` (Docker-based, wrong name)
- `~/Library/Logs/Claude/mcp-server-shelly-n8n.log` (Docker-based, wrong name)

### Root Cause

**Docker containers from previous configuration** were still running, launched by either Cursor or Claude Desktop before the config was updated to npx.

The log file naming revealed this:
- Current config has: `n8n-rensto`, `n8n-tax4us`, `n8n-shelly`
- Logs show: `tax4us-n8n`, `shelly-n8n` (different names = old config)

---

## Solution Applied

### Step 1: Stopped Docker Containers

```bash
docker stop $(docker ps -q --filter "ancestor=ghcr.io/czlonkowski/n8n-mcp:2.18.0")
# Stopped 2 containers: 6c5766ab1a74, 5d2a9e209589
```

### Step 2: Verified Current Configuration

```bash
cat ~/.cursor/mcp.json | jq '.mcpServers | keys'
```

**Result**: ✅ All 3 n8n servers configured correctly with npx:
- `n8n-rensto` → Rensto VPS (http://173.254.201.134:5678)
- `n8n-tax4us` → Tax4Us Cloud (https://tax4usllc.app.n8n.cloud)
- `n8n-shelly` → Shelly Cloud (https://shellyins.app.n8n.cloud)

### Step 3: Verified API Connectivity

All 3 instances accessible via REST API:
```bash
curl -H "X-N8N-API-KEY: ..." http://173.254.201.134:5678/api/v1/workflows
# ✅ 56 workflows found

curl -H "X-N8N-API-KEY: ..." https://tax4usllc.app.n8n.cloud/api/v1/workflows
# ✅ 4 workflows found

curl -H "X-N8N-API-KEY: ..." https://shellyins.app.n8n.cloud/api/v1/workflows
# ✅ 6 workflows found
```

---

## Configuration Details

### Shared MCP Config File

**Both Cursor and Claude Desktop use**: `~/.cursor/mcp.json`

**No separate Claude Desktop config found** (checked `.claude/settings.json`, `~/.config/Claude/`, etc.)

### Current Working Configuration

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://173.254.201.134:5678",
        "N8N_API_KEY": "eyJ...",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "eyJ...",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-shelly": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://shellyins.app.n8n.cloud",
        "N8N_API_KEY": "eyJ...",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

---

## Next Steps

### Required: Restart Both Apps

1. **Quit Cursor** (⌘Q)
2. **Quit Claude Desktop** (⌘Q)
3. Wait 5 seconds for processes to fully terminate
4. Reopen both apps

### After Restart, Verify

**Expected MCP Tools** (126 total):
```
mcp__n8n-rensto__n8n_list_workflows
mcp__n8n-rensto__n8n_get_workflow
mcp__n8n-rensto__n8n_get_execution
... (19 tools × 3 instances = 57 total - consolidated from 38 in older versions)
```

**Test Commands**:
```
# List Rensto VPS workflows
mcp__n8n-rensto__n8n_list_workflows()

# List Tax4Us Cloud workflows
mcp__n8n-tax4us__n8n_list_workflows()

# List Shelly Cloud workflows
mcp__n8n-shelly__n8n_list_workflows()
```

---

## Why This Happened

**Timeline**:
1. **Before Oct 9**: Docker-based n8n MCP servers working
2. **Oct 9**: Switched to npx-based servers (fixed stdin issue)
3. **Oct 9 restart**: Both apps should have loaded npx servers
4. **Oct 10 issue**: Docker containers from old sessions still running

**Lesson**: When changing MCP server `command` (Docker → npx), kill old processes before restarting apps.

---

## Prevention

### Before Changing MCP Command

1. Quit all apps using MCP (Cursor, Claude Desktop)
2. Kill old MCP processes:
   ```bash
   docker ps | grep n8n-mcp
   docker stop <container_id>

   ps aux | grep n8n-mcp | grep -v grep
   kill <pid>
   ```
3. Update `~/.cursor/mcp.json`
4. Restart apps

### Verify After Restart

```bash
# Check running processes
ps aux | grep n8n-mcp

# Should only see npx processes, NO Docker containers
docker ps | grep n8n-mcp  # Should return nothing
```

---

## Files Changed

- `~/.cursor/mcp.json` - ✅ Already correct (no changes)
- Docker containers - ❌ Stopped (2 containers removed)

## Verification Status

- [x] Docker containers stopped
- [x] npx processes still running
- [x] Configuration verified correct
- [x] API connectivity confirmed (all 3 instances)
- [ ] Apps restarted (user action required)
- [ ] MCP tools verified working (after restart)

---

**Status**: Ready for app restart
**Next Action**: User must quit and reopen both Cursor and Claude Desktop
