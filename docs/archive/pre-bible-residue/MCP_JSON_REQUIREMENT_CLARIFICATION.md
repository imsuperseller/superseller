# MCP.json Requirement Clarification - n8n MCP

**Date**: November 26, 2025  
**Question**: Does n8n MCP still need to be in mcp.json?

---

## ✅ **Answer: YES, n8n MCP MUST be in mcp.json**

**Why**: `mcp.json` is how Cursor knows which MCP servers to connect to and how to connect to them.

---

## 🔍 **How MCP Configuration Works**

### **What mcp.json Does**

`mcp.json` tells Cursor:
1. **Which MCP servers exist** (server names)
2. **How to connect** (HTTP endpoint, command, etc.)
3. **What credentials to use** (API keys, tokens)

**Without mcp.json entry**: Cursor doesn't know the MCP server exists → **No tools available**

**With mcp.json entry**: Cursor connects to MCP server → **Tools become available**

---

## 📊 **Current n8n MCP Configurations**

From `~/.cursor/mcp.json`:

### **1. n8n-rensto** (npx Mode - WORKING)
```json
{
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
```
**Connection Method**: npx (Node.js stdio)  
**Why in mcp.json**: Tells Cursor WHAT command to run and HOW

### **2. n8n-tax4us** (npx Mode - WORKING)
```json
{
  "n8n-tax4us": {
    "command": "npx",
    "args": ["-y", "n8n-mcp"],
    "env": {
      "N8N_API_URL": "https://tax4usllc.app.n8n.cloud",
      "N8N_API_KEY": "[API_KEY]",
      "MCP_MODE": "stdio",
      "LOG_LEVEL": "error"
    }
  }
}
```
**Connection Method**: npx (Node.js stdio)  
**Why in mcp.json**: Tells Cursor WHAT command to run and HOW

### **3. n8n-ops** (Node.js Script Mode)
```json
{
  "n8n-ops": {
    "command": "node",
    "args": ["/path/to/n8n-unified-server.js"],
    "env": {
      "N8N_RENSTO_VPS_URL": "http://172.245.56.50:5678",
      "N8N_RENSTO_VPS_KEY": "[API_KEY]",
      "N8N_TAX4US_CLOUD_URL": "https://tax4usllc.app.n8n.cloud",
      "N8N_TAX4US_CLOUD_KEY": "[API_KEY]"
    }
  }
}
```
**Connection Method**: Local Node.js script (stdio mode)  
**Why in mcp.json**: Tells Cursor WHAT command to run and HOW

### **4. n8n-shelly** (Node.js Script Mode)
```json
{
  "n8n-shelly": {
    "command": "node",
    "args": ["/path/to/n8n-shelly-wrapper.cjs"]
  }
}
```
**Connection Method**: Local Node.js script (stdio mode)  
**Why in mcp.json**: Tells Cursor WHAT command to run

---

## 🎯 **Key Insight: HTTP Endpoint vs Local Script**

### **HTTP Endpoint Mode** (n8n 1.122.0+) ⚠️ **DOES NOT WORK**
- **What it means**: n8n 1.122.0+ has a built-in MCP server accessible via HTTP, but **this endpoint returns 404 errors**
- **mcp.json role**: Would tell Cursor the URL to connect to (if it worked)
- **Status**: ❌ **DO NOT USE** - HTTP endpoint returns 404
- **Current Solution**: Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

### **Local Script Mode** (Older method)
- **What it means**: Run a local Node.js script that acts as MCP server
- **mcp.json role**: Tells Cursor what command to execute
- **Still needed?**: ✅ **YES** - Without the mcp.json entry, Cursor doesn't know what to run

---

## ❌ **Common Misconception**

**False**: "If n8n has a built-in HTTP MCP endpoint, I don't need mcp.json"  
**Also False**: "HTTP endpoint works" - It returns 404. Use npx mode instead.

**Reality**: 
- The HTTP endpoint is just a **connection method**
- Cursor still needs to **know about it** via mcp.json
- mcp.json is the **configuration file** that tells Cursor what MCP servers exist

**Analogy**: 
- HTTP endpoint = "The restaurant exists and has a phone number"
- mcp.json = "Your phone's contact list that stores the restaurant's number"
- Without the contact entry, you can't call the restaurant even though it exists

---

## 🔧 **What Changed with n8n 1.122.0**

### **Before** (n8n < 1.122.0):
```json
{
  "n8n-rensto": {
    "command": "node",
    "args": ["/path/to/wrapper-script.js"],
    "env": {
      "N8N_API_URL": "http://172.245.56.50:5678",
      "N8N_API_KEY": "[KEY]"
    }
  }
}
```
- Required: Local wrapper script
- Connection: stdio (standard input/output)
- mcp.json: Tells Cursor to run local script

### **After** (n8n 1.122.0+ - Current Working Solution):
```json
{
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
```
- Required: ✅ **Still need mcp.json entry**
- Connection: stdio via npx (HTTP endpoint returns 404, does not work)
- mcp.json: Tells Cursor the command to run (npx) and environment variables
- **Note**: HTTP endpoint mode was added in n8n 1.122.0 but returns 404 - use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

---

## ✅ **Conclusion**

**n8n MCP MUST be in mcp.json** because:

1. ✅ Cursor reads mcp.json to discover MCP servers
2. ✅ mcp.json tells Cursor how to connect (HTTP URL or command)
3. ✅ Without mcp.json entry, Cursor doesn't know the MCP server exists
4. ⚠️ HTTP endpoint mode returns 404 - Use npx mode instead (see `docs/infrastructure/MCP_CONFIGURATION.md`)

**What changed**: 
- ✅ **Working**: Use npx mode with mcp.json (proven in October 2025)
- ❌ **HTTP endpoint**: Returns 404, doesn't work

**What didn't change**:
- ✅ **mcp.json is still required** - it's the configuration file that tells Cursor about MCP servers

---

## 📝 **Summary**

| Question | Answer |
|----------|--------|
| Does n8n MCP need mcp.json? | ✅ **YES - Always required** |
| What changed with n8n 1.122.0? | HTTP endpoint mode added (but returns 404 - use npx mode instead) |
| Do I still need mcp.json? | ✅ **YES - Required for npx mode** |
| What does mcp.json do? | Tells Cursor WHAT command to run (npx) and environment variables |
| HTTP endpoint mode? | ❌ **DOES NOT WORK** - Returns 404, use npx mode instead |

---

**Last Updated**: November 26, 2025  
**Verified By**: AI Assistant

