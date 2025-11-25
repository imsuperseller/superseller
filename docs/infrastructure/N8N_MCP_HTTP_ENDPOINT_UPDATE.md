# n8n MCP Server HTTP Endpoint Configuration

**Date**: November 25, 2025  
**n8n Version**: 1.122.0  
**Status**: ✅ Configured

---

## 🔧 Configuration Update

After updating n8n to 1.122.0, the MCP server now supports HTTP endpoint mode (in addition to stdio mode).

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

**New Configuration** (HTTP mode):
```json
{
  "mcpServers": {
    "n8n-rensto": {
      "url": "https://n8n.rensto.com/mcp-server/http",
      "headers": {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYjRhMzI1MS0yNmY2LTQ2MTctYmNmOS1lMDdmM2NhOTY4YTciLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6ImVjYzFlYWQ4LWJkMzctNGY4My1iZTRmLTZiZDhhNThlMzk0YiIsImlhdCI6MTc2NDA1MTA4Mn0.QeolGfdZUOZn-GBizI382d1-q5Dpsjn_e5Vekd6GxsU"
      }
    }
  }
}
```

---

## ✅ Benefits of HTTP Mode

1. **No Local Wrapper Needed**: Direct connection to n8n instance
2. **Simpler Configuration**: Just URL and token
3. **Better Performance**: HTTP/SSE connection instead of stdio
4. **Native n8n Feature**: Built into n8n 1.122.0+

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

1. **Test Endpoint**:
   ```bash
   curl -H "Authorization: Bearer <token>" \
        -H "Accept: application/json, text/event-stream" \
        "https://n8n.rensto.com/mcp-server/http"
   ```

2. **Check Cursor MCP Status**:
   - Restart Cursor
   - Verify `n8n-rensto` MCP server is connected
   - Test MCP tools (e.g., `mcp_n8n-rensto_n8n_list_workflows`)

---

## ⚠️ Important Notes

1. **Token Security**: Keep the JWT token secure - it provides full MCP server API access
2. **Token Expiration**: JWT tokens may expire - regenerate via n8n UI if needed
3. **Fallback**: If HTTP mode doesn't work, can revert to stdio mode using the wrapper script
4. **Other Instances**: Tax4Us and Shelly instances still use stdio mode (no HTTP endpoint available)

---

## 🔄 Rollback (If Needed)

If HTTP mode doesn't work, revert to stdio mode:

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

---

**Last Updated**: November 25, 2025  
**n8n Version**: 1.122.0  
**Configuration File**: `~/.cursor/mcp.json`

