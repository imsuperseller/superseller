# 🔑 GITHUB TOKEN SETUP FOR SHADCN-UI MCP SERVER

**Purpose**: Lift rate limit from 60→5000 requests/hour  
**Scope**: No scopes required (public read-only access)  
**Security**: Stored in MCP config, not in code  

---

## 🚀 **STEP-BY-STEP SETUP**

### **1. Create GitHub Personal Access Token**

1. **Go to GitHub Settings**: https://github.com/settings/tokens
2. **Click**: "Generate new token (classic)"
3. **Note**: "shadcn-ui-mcp-server"
4. **Expiration**: Choose appropriate duration (30 days recommended)
5. **Scopes**: **NO SCOPES REQUIRED** (leave all unchecked)
6. **Click**: "Generate token"
7. **Copy**: The token (starts with `ghp_...`)

### **2. Update MCP Configuration**

**File**: `config/mcp/cursor-config.json`

**Current Configuration**:
```json
"shadcn-ui": {
  "command": "npx",
  "args": ["-y", "@jpisnice/shadcn-ui-mcp-server"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here",
    "SHADCN_FRAMEWORK": "react"
  }
}
```

**Replace** `"ghp_your_token_here"` with your actual token.

### **3. Verify Token Setup**

After updating the config, restart Cursor and test connectivity.

---

## 🔒 **SECURITY NOTES**

- **No Scopes**: Token has minimal permissions (read-only public access)
- **Rate Limiting**: 5000 requests/hour vs 60 without token
- **Storage**: Token stored in MCP config, not in code
- **Rotation**: Consider rotating token periodically

---

## 🧪 **TESTING CONNECTIVITY**

Once token is set up, test with:

```bash
# Test MCP server connectivity
"Use the shadcn-ui MCP tool to list available components and confirm connectivity."
```

**Expected Result**: List of available shadcn/ui components without rate limit errors.

---

## 📊 **RATE LIMIT COMPARISON**

| **Without Token** | **With Token** |
|-------------------|----------------|
| 60 requests/hour  | 5000 requests/hour |
| Basic access      | Enhanced access |
| Rate limit errors | Smooth operation |

---

**✅ Follow these steps to set up your GitHub token and enable full shadcn-ui MCP functionality.**


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)