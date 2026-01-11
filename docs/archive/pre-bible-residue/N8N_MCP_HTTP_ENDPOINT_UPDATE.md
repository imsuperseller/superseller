# n8n MCP Server HTTP Endpoint Configuration

**Date**: November 25, 2025  
**n8n Version**: 1.122.0  
**Status**: ❌ **DOES NOT WORK** - Returns 404 errors

**⚠️ DO NOT USE THIS APPROACH** - See `docs/infrastructure/MCP_CONFIGURATION.md` for working solution.

---

## 🔧 Configuration Update

⚠️ **HISTORICAL NOTE**: After updating n8n to 1.122.0, HTTP endpoint mode was attempted but **returns 404 errors and does not work**. Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`).

### **HTTP Endpoint Details**

- **URL**: `https://n8n.rensto.com/mcp-server/http`
- **Token**: JWT token for MCP server API access
- **Audience**: `mcp-server-api`
- **Issuer**: `n8n`

### **Updated MCP Configuration**

**Location**: `~/.cursor/mcp.json`

**Previous Configuration** (stdio mode):
```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "node",
      "args": ["/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/n8n-mcp-wrapper/n8n-rensto-wrapper.cjs"]
    }
  }
}
```

**⚠️ HTTP MODE DOES NOT WORK** - Returns 404 errors. Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`):

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://172.245.56.50:5678",
        "N8N_API_KEY": "[API_KEY]",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-tax4us": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_API_KEY": "[API_KEY]",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    },
    "n8n-ops": {
      "command": "node",
      "args": [
        "/Users/shaifriedman/New Rensto/rensto/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js"
      ],
      "env": {
        "N8N_RENSTO_VPS_URL": "http://172.245.56.50:5678",
        "N8N_RENSTO_VPS_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYyOTE2NzEwfQ.JbIeOnRil3E3_P44LjAWhiY9KRcAHkuuVhJghABz3aQ",
        "N8N_TAX4US_CLOUD_URL": "https://tax4usllc.app.n8n.cloud",
        "N8N_TAX4US_CLOUD_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw",
        "N8N_SHELLY_CLOUD_URL": "https://shellyins.app.n8n.cloud",
        "N8N_SHELLY_CLOUD_KEY": "",
        "N8N_OPS_ALLOWED_INSTANCES": "rensto-vps,tax4us-cloud",
        "N8N_OPS_AUDIT_LOG": "true"
      }
    }
  }
}
```

---

## ❌ HTTP Mode Does Not Work

**Problem**: HTTP endpoint returns 404 errors when accessed from Cursor.

**Solution**: Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

**Why npx works**:
1. ✅ Proven in October 2025 - Fixed Docker stdio issues
2. ✅ No Docker stdin problems
3. ✅ Faster startup
4. ✅ Lower memory usage

---

## ♻️ Hybrid MCP Strategy (Core + Ops)

To balance safety with full control, the MCP stack now runs in two tiers:

1. **Core Endpoints (HTTP)**  
   - Servers: `n8n-rensto`, `n8n-tax4us`  
   - Tools: `search_workflows`, `get_workflow_details`, `execute_workflow`  
   - Usage: Default for quick inspections and launches. No destructive access.

2. **Ops Endpoint (Stdio Unified Server)**  
   - Server name: `n8n-ops`  
   - Location: `/rensto-marketplace/plugins/rensto-n8n-agents/mcpServers/n8n-unified-server.js`  
   - Coverage: 40+ tools (workflows, executions, credentials, data tables, diagnostics) routed to Rensto + Tax4Us instances.  
   - Access control:  
     - `N8N_OPS_ALLOWED_INSTANCES=rensto-vps,tax4us-cloud` limits which tenants accept destructive calls.  
     - `N8N_OPS_AUDIT_LOG=true` enables structured console auditing for every tool invocation.  
   - When to use: Editing workflows, rotating credentials, reading execution logs, bulk cleanup, or any task that exceeds the 3-tool core surface.

**Agent Routing Rules**
- Start with `n8n-rensto` / `n8n-tax4us`.  
- Automatically escalate to `n8n-ops` when a requested action requires tooling outside the core trio.  
- If `n8n-ops` is unavailable, fall back to core endpoints and report the limitation.

---

## 🔍 Token Details

**JWT Token Structure**:
- **Subject (sub)**: User ID (`0b4a3251-26f6-4617-bcf9-e07f3ca968a7`)
- **Issuer (iss)**: `n8n`
- **Audience (aud)**: `mcp-server-api`
- **JTI**: Unique token ID
- **IAT**: Issued at timestamp

**Token Expiration**: Check token expiration and regenerate if needed via n8n UI

---

## 📋 Verification Steps

1. **⚠️ HTTP Endpoint Test** (❌ RETURNS 404):
   ```bash
   curl -X POST "https://n8n.rensto.com/mcp-server/http" \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"cursor-test","version":"1.0"}}}'
   ```
   
   **Actual Response**: ❌ **404 Error** - Endpoint does not exist
   
   **Current Solution**: Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

2. **Check Cursor MCP Status** (npx mode):
   - Restart Cursor
   - Verify `n8n-rensto` MCP server is connected (should show npx mode)
   - Test MCP tools (e.g., `mcp_n8n-rensto_n8n_list_workflows`)

## ❌ Test Results (November 28, 2025)

**Date**: November 28, 2025  
**Status**: ❌ **HTTP ENDPOINT RETURNS 404**

### **Rensto n8n (Self-Hosted)**
- ❌ HTTP endpoint: **404 ERROR**
- ❌ SSE connection: **FAILS**
- ✅ **Solution**: Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

### **Tax4Us n8n (Cloud)**
- ❌ HTTP endpoint: **404 ERROR**  
- ❌ SSE connection: **FAILS**
- ✅ **Solution**: Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

---

## ⚠️ Important Notes

1. **Token Security**: Keep the JWT token secure - it provides full MCP server API access
2. **Token Expiration**: JWT tokens may expire - regenerate via n8n UI if needed
3. **⚠️ HTTP mode doesn't work** - Returns 404 errors. Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)
4. **All Instances**: 
- ✅ **All instances**: Use npx mode (HTTP endpoint returns 404 for all)

---

## ✅ Working Configuration

**Use npx mode** (see `docs/infrastructure/MCP_CONFIGURATION.md` for complete configuration):

```json
{
  "mcpServers": {
    "n8n-rensto": {
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "N8N_API_URL": "http://172.245.56.50:5678",
        "N8N_API_KEY": "[API_KEY]",
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error"
      }
    }
  }
}
```

---

**Last Updated**: November 25, 2025  
**n8n Version**: 1.122.0  
**Configuration File**: `~/.cursor/mcp.json`

