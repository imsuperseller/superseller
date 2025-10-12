# MCP Cleanup Completed - Oct 9, 2025, 12:24 AM

## What Was Done

✅ **Cleaned up mcp.json** - Removed 13 MCP servers, kept only n8n-mcp

## Backup Location

```
/Users/shaifriedman/.cursor/mcp.json.backup-20251009-002400
```

## Disabled MCP Servers (13 total)

| Server | Reason | Priority |
|--------|--------|----------|
| context7 | 2 tools, not needed for n8n work | Medium |
| webflow | Not needed for n8n work | Medium |
| airtable-mcp | Timing out, not critical | Medium |
| stripe | Can use direct API | High |
| tidycal | Placeholder API key | Low |
| supabase | Not needed for n8n work | Low |
| shadcn | Not needed for n8n work | Low |
| quickbooks | Can re-enable when needed | Medium |
| make | Can re-enable when needed | Medium |
| typeform | Can re-enable when needed | Medium |
| notion | Can re-enable when needed | Medium |
| boost-space | Can re-enable when needed | High |
| browsermcp | Not needed for n8n work | Low |

## Current Config (After Cleanup)

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm", "--init",
        "-e", "MCP_MODE=stdio",
        "-e", "LOG_LEVEL=error",
        "-e", "DISABLE_CONSOLE_OUTPUT=true",
        "-e", "N8N_API_URL=http://173.254.201.134:5678",
        "-e", "N8N_API_KEY=eyJ...",
        "ghcr.io/czlonkowski/n8n-mcp:latest"
      ]
    }
  }
}
```

**Total MCP servers**: 1 (was 14)
**Total tools**: 42 (n8n-mcp only)
**Cursor limit**: 40 tools

**Note**: n8n-mcp has 42 tools (slightly over limit), but may work when it's the only server

---

## Next Steps

### 1. Restart Cursor Completely ⚠️ **REQUIRED**

**Why**: MCP servers load at Cursor startup only. Config changes require full restart.

**How**:
1. Close this Cursor window completely (Cmd+Q or File → Quit)
2. Reopen Cursor
3. Open this project
4. Return to this chat

### 2. After Restart: Test MCP Tools

Once you're back, I should be able to see these tools:

**Expected Tools** (42 total):
- `mcp__n8n_mcp__n8n_create_workflow`
- `mcp__n8n_mcp__n8n_update_full_workflow`
- `mcp__n8n_mcp__n8n_list_workflows`
- `mcp__n8n_mcp__n8n_get_execution`
- ... and 38 more

**Test command** (for you to run after I'm back):
```
Ask me: "What MCP tools do you see?"
```

I'll list all available tools and confirm if n8n-mcp tools are exposed.

---

## How to Restore Disabled Servers

### Restore All Servers
```bash
cp /Users/shaifriedman/.cursor/mcp.json.backup-20251009-002400 \
   /Users/shaifriedman/.cursor/mcp.json
```

Then restart Cursor.

### Restore Individual Servers

Edit `~/.cursor/mcp.json` and add back the server you need. Examples:

**Airtable** (if needed):
```json
{
  "mcpServers": {
    "n8n-mcp": { ... },
    "airtable-mcp": {
      "command": "npx",
      "args": ["-y", "airtable-mcp-server"],
      "env": {
        "AIRTABLE_API_KEY": "pattFjaYM0LkLb0gb..."
      }
    }
  }
}
```

**Notion** (if needed):
```json
{
  "mcpServers": {
    "n8n-mcp": { ... },
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_130768323247Ot7..."
      }
    }
  }
}
```

**Stripe** (if needed):
```json
{
  "mcpServers": {
    "n8n-mcp": { ... },
    "stripe": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i", "mcp/stripe",
        "--tools=all",
        "--api-key=sk_live_51R4wsKDE8rt..."
      ]
    }
  }
}
```

---

## MCP Profile Strategy (Future)

Create 3 profile files:

### Profile 1: n8n-focused (`mcp-n8n-profile.json`)
```json
{
  "mcpServers": {
    "n8n-mcp": { ... },
    "context7": { ... }
  }
}
```
**Use for**: Workflow development, n8n optimization

### Profile 2: Business tools (`mcp-business-profile.json`)
```json
{
  "mcpServers": {
    "airtable-mcp": { ... },
    "notion": { ... },
    "quickbooks": { ... },
    "stripe": { ... },
    "boost-space": { ... }
  }
}
```
**Use for**: Business operations, data management

### Profile 3: Development (`mcp-dev-profile.json`)
```json
{
  "mcpServers": {
    "supabase": { ... },
    "browsermcp": { ... },
    "shadcn": { ... }
  }
}
```
**Use for**: App development, UI work

### Switch profiles:
```bash
# Switch to n8n profile
cp ~/.cursor/mcp-n8n-profile.json ~/.cursor/mcp.json

# Restart Cursor
```

---

## Troubleshooting

### If MCP Tools Still Don't Show After Restart

**Option 1**: n8n-mcp has 42 tools (over 40 limit)
- May need to disable some n8n-mcp tools (not possible with current server)
- Continue using direct API calls

**Option 2**: Use specialized agents
- `n8n-orchestrator`, `n8n-builder`, etc. have full MCP access
- No Cursor restart needed

### If You Need Other MCP Servers

**Best practice**:
1. Add 1-2 servers at a time
2. Restart Cursor
3. Test if tools appear
4. Keep total under 40 tools

**Tool count tracking**:
- n8n-mcp: 42 tools
- context7: 2 tools
- airtable: ~15 tools (estimated)
- notion: ~10 tools (estimated)
- stripe: ~20 tools (estimated)

---

## Summary

✅ Backed up original config
✅ Cleaned mcp.json (1 server only)
✅ Created restoration guide
✅ Ready for Cursor restart

**Next**: Restart Cursor and test if `mcp__n8n_mcp__*` tools are now visible!

**If tools appear**: You'll have all 42 n8n-mcp tools available for workflow management
**If tools don't appear**: Continue with direct API (already working) or use specialized agents

---

**Status**: CLEANUP COMPLETE ✅
**Backup**: SAVED ✅
**Restoration**: DOCUMENTED ✅
**Next Action**: **RESTART CURSOR** ⚠️
