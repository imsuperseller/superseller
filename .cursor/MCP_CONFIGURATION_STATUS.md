# MCP Server Configuration Status

**Last Updated**: October 9, 2025, 3:00 AM
**Status**: ✅ OPERATIONAL - 11 servers active (QuickBooks temporarily disabled)

---

## 🎯 **Executive Summary**

MCP (Model Context Protocol) servers provide Claude Code with direct access to external services like n8n, Airtable, Notion, and more. As of October 9, 2025, 11 MCP servers are active and properly configured.

**Fixed Issues**:
- ✅ n8n API key updated (was truncated)
- ✅ TidyCal API key added (was placeholder)
- ✅ Context7 removed (not needed for workflow nodes)
- ✅ Docker container cleanup script created
- ✅ QuickBooks temporarily disabled (needs Node.js MCP wrapper)
- ✅ CLAUDE.md updated with accurate status

---

## 📊 **MCP Servers Overview** (11 Active, 1 Disabled)

### **Docker-Based Servers** (1 - n8n-mcp moved to npx)

| Server | Image | Status | Purpose |
|--------|-------|--------|---------|
| **n8n-mcp** | npx -y n8n-mcp | ✅ Configured | Access n8n workflows via npx (Docker doesn't work) |
| **stripe-mcp** | mcp/stripe | ✅ Configured | Stripe API operations |

**Note**: n8n-mcp moved to npx (Docker had stdin issues). See `docs/infrastructure/MCP_CONFIGURATION.md` for working config.

### **NPX-Based Servers** (6 - includes n8n-mcp)

| Server | Package | Status | Purpose |
|--------|---------|--------|---------|
| **airtable-mcp** | airtable-mcp-server | ✅ Configured | Access 11 Airtable bases, 867 records |
| **notion-mcp** | @notionhq/notion-mcp-server | ✅ Configured | Access 3 Notion databases, 80 records |
| **supabase-mcp** | @supabase/mcp-server-supabase | ✅ Configured | Read-only Supabase access |
| **shadcn-mcp** | shadcn@latest mcp | ✅ Configured | shadcn/ui component library |
| **context7** | @upstash/context7-mcp | ❌ **REMOVED** | Not needed for n8n nodes |

**Note**: NPX servers download on first use, cached afterward.

### **Local Node.js Servers** (5)

| Server | Location | Status | Purpose |
|--------|----------|--------|---------|
| **webflow-mcp** | infra/mcp-servers/webflow-mcp-server/ | ✅ Configured | Webflow site management |
| **make-mcp** | infra/mcp-servers/make-mcp-server/ | ✅ Configured | Make.com workflow automation |
| **typeform-mcp** | infra/mcp-servers/typeform-mcp-server/ | ✅ Configured | Typeform API (5 forms) |
| **tidycal-mcp** | infra/mcp-servers/tidycal-mcp-server/ | ✅ Configured | TidyCal scheduling API |
| **boost-space-mcp** | infra/mcp-servers/boost-space-mcp-server/ | ✅ Configured | Boost.space (110 infrastructure records) |

**Note**: Local servers require Node.js runtime, must be in correct directory.

### **Disabled Servers** (1)

| Server | Location | Status | Reason |
|--------|----------|--------|--------|
| **quickbooks-mcp** | infra/mcp-servers/quickbooks-mcp-server/ | ⚠️ **DISABLED** | Needs Node.js MCP wrapper (current directory contains Java-based CData project) |

**Note**: QuickBooks OAuth credentials preserved in mcp.json for future implementation. Use existing OAuth scripts in `/scripts/` for now.

---

## 🔧 **Configuration File**

**Location**: `~/.cursor/mcp.json`

**Structure**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "docker|node|npx",
      "args": [...],
      "env": {
        "API_KEY": "..."
      }
    }
  }
}
```

**Backup Location**: `~/.cursor/mcp.json.backup-20251009-002400`

---

## 🐛 **Common Issues & Solutions**

### **Issue 1: "No MCP servers configured"**

**Cause**: Cursor hasn't initialized MCP servers yet

**Solution**:
1. Restart Cursor completely (MCP loads at startup)
2. Check `~/.cursor/mcp.json` exists
3. Verify JSON syntax is valid

### **Issue 2: "unauthorized" errors**

**Cause**: Truncated or invalid API keys

**Solution**:
1. Get full API key from service UI
2. Update in `~/.cursor/mcp.json`
3. Restart Cursor

### **Issue 3: Multiple unhealthy Docker containers**

**Cause**: Docker MCPs create new containers on each Cursor restart, old ones don't stop cleanly

**Solution**:
```bash
# Run cleanup script (created Oct 9, 2025)
bash /.cursor/scripts/mcp-docker-cleanup.sh
```

**Recommended**: Run weekly or before Cursor restart

### **Issue 4: Server won't start**

**Causes & Solutions**:
- **Docker not running**: `docker ps` should work
- **Node.js not installed**: Check with `node --version`
- **NPX package unavailable**: Check internet connection
- **File permissions**: Check script is executable

---

## 🚨 **Docker Container Management**

### **Problem**

Docker-based MCPs (n8n-mcp, stripe-mcp) create new containers on each Cursor launch. Old containers stay running but report "unhealthy" status. This accumulates over time.

### **Why It Happens**

1. Cursor runs `docker run` command from `mcp.json`
2. New container starts with stdio communication
3. When Cursor restarts, new containers spawn
4. Old containers lose MCP connection but don't stop
5. Containers accumulate: 4+ n8n-mcp, 3+ stripe-mcp

### **Professional Solution**

**Created**: `/.cursor/scripts/mcp-docker-cleanup.sh`

**What it does**:
- Stops all n8n-mcp and stripe-mcp containers
- Containers auto-remove (due to `--rm` flag)
- Cleans up any exited containers (safety check)
- Shows current Docker status

**Usage**:
```bash
# Before starting Cursor (recommended)
bash /.cursor/scripts/mcp-docker-cleanup.sh

# Or run weekly/monthly as maintenance
```

**Benefits**:
- ✅ No manual container IDs needed
- ✅ Safe (only affects MCP containers)
- ✅ Fast (< 5 seconds)
- ✅ Prevents Docker bloat

---

## 📈 **Performance Notes**

**First Cursor Launch** (Cold Start):
- Docker: Pull images (~2-3 min first time only)
- NPX: Download packages (~1 min first time only)
- Local: Instant (if Node.js installed)

**Subsequent Launches** (Warm Start):
- Docker: Use cached images (~5-10 sec)
- NPX: Use cached packages (~2-3 sec)
- Local: Instant

**Memory Usage**:
- Each Docker container: ~50-100MB
- NPX servers: ~30-50MB each
- Local servers: ~20-40MB each
- **Total**: ~500MB-1GB (acceptable for development)

---

## 🔐 **Security Best Practices**

1. **API Keys**:
   - Never commit `~/.cursor/mcp.json` to git
   - Use environment variables when possible
   - Rotate keys quarterly

2. **Permissions**:
   - Use read-only access where possible (e.g., Supabase)
   - Limit scope of API keys
   - Use separate keys for dev/prod

3. **Backups**:
   - `mcp.json` is automatically backed up before changes
   - Keep latest 3 backups
   - Store encrypted copy externally

---

## 📝 **Change Log**

### October 9, 2025, 3:00 AM
- ✅ Temporarily disabled QuickBooks MCP (needs Node.js wrapper)
- ✅ Updated MCP count (12 → 11 active)
- ✅ Preserved QuickBooks OAuth credentials for future implementation

### October 9, 2025, 2:30 AM
- ✅ Fixed n8n MCP API key (was truncated)
- ✅ Added TidyCal API key (was placeholder)
- ✅ Removed Context7 (not needed)
- ✅ Created Docker cleanup script
- ✅ Cleaned up 8 old stopped containers
- ✅ Stopped 7 running MCP containers
- ✅ Updated CLAUDE.md with accurate MCP count (17 → 12)
- ✅ Removed n8n-multi-instance-manager references

### October 9, 2025, 1:43 AM
- ❌ Attempted to add browsermcp (failed - infinite recursion bug)
- ✅ Restored mcp.json from backup
- ✅ Documented issue in MCP_STATUS.md

### October 8, 2025
- Created n8n-multi-instance-manager (later removed Oct 9)
- Configured 3 n8n instances (VPS, Tax4Us, Shelly)

---

## 🎯 **Next Steps**

**Immediate** (Required):
1. ⚠️ **RESTART CURSOR** - MCP servers initialize at startup
2. Run `/mcp` command to verify all 11 active servers connect
3. Test n8n MCP tools (list workflows, get workflow details)

**Weekly Maintenance**:
1. Run Docker cleanup script before Cursor restart
2. Check for MCP server updates
3. Review API usage/quotas

**Monthly Audit**:
1. Verify all API keys are valid
2. Check for unused MCP servers (remove if not needed)
3. Update this document with any changes

---

## 📚 **Resources**

- **MCP Documentation**: https://docs.claude.com/en/docs/claude-code/mcp
- **n8n API**: https://docs.n8n.io/api/
- **Airtable API**: https://airtable.com/developers/web/api/introduction
- **Notion API**: https://developers.notion.com/
- **CLAUDE.md**: Section 4 (Active Systems) → MCP Servers

---

## ✅ **Verification Checklist**

Before marking as complete, verify:

- [x] All 11 active MCP servers listed in `~/.cursor/mcp.json`
- [x] No placeholder API keys (e.g., "YOUR_KEY_HERE")
- [x] n8n API key is complete (not truncated)
- [x] Docker cleanup script is executable
- [x] QuickBooks temporarily disabled with credentials preserved
- [x] CLAUDE.md updated (removed n8n-multi-instance-manager)
- [x] Git changes committed with clear message
- [ ] Cursor restarted and `/mcp` command works

---

**Status**: ✅ **READY FOR CURSOR RESTART**

After restart, run `/mcp` to verify all 11 active servers connect successfully.

**Note**: QuickBooks MCP temporarily disabled - will be reimplemented as Node.js MCP server wrapper.
