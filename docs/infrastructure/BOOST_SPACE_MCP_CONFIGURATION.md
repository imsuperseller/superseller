# ✅ Boost.space MCP Server Configuration

**Date**: November 27, 2025  
**Status**: ✅ Configured and Ready

---

## 📋 **CONFIGURATION DETAILS**

### **MCP Server Name**: `boost-space`

### **Configuration Type**: Local Node.js Server (stdio)

### **Location**: `~/.cursor/mcp.json`

### **Server File**: 
```
/Users/shaifriedman/New Rensto/rensto/infra/mcp-servers/boost-space-mcp-server/server.js
```

### **Environment Variables**:
- `BOOST_SPACE_PLATFORM`: `https://superseller.boost.space`
- `BOOST_SPACE_API_KEY`: `88c5ff57783912fcc05fec10a22d67b5806d48346ab9ef562f17e2188cc07dba`
- `NODE_ENV`: `production`
- `DISABLE_CONSOLE_OUTPUT`: `true`

---

## 🔧 **ALTERNATIVE: Remote SSE Server**

Boost.space also provides a remote SSE (Server-Sent Events) MCP endpoint:

**URL**: `https://mcp.boost.space/v1/superseller/sse`

**Note**: This remote SSE option may require different configuration. If you want to test the remote SSE server instead of the local server, you can modify the config to use:

```json
"boost-space-sse": {
  "url": "https://mcp.boost.space/v1/superseller/sse"
}
```

**Current Setup**: Using local server (more reliable, full control)

---

## ✅ **VERIFICATION**

To verify the Boost.space MCP server is working:

1. **Restart Cursor** (required after MCP config changes)
2. **Check MCP Tools**: Look for `mcp__boost-space__*` tools in available tools
3. **Test Connection**: Try using a Boost.space MCP tool like `list_modules`

---

## 🛠️ **AVAILABLE TOOLS**

The Boost.space MCP server provides **40+ tools** including:

### **Data Operations**:
- `list_modules` - Get all available modules
- `describe_module_schema` - Get module field structure
- `query_records` - Query records with filters
- `create_record` - Create new records
- `update_record` - Update existing records
- `bulk_upsert_records` - Bulk import/update
- `delete_record` - Delete records

### **File Operations**:
- `upload_file` - Upload files
- `attach_file_to_record` - Link files to records

### **Module Operations**:
- `get_module_metrics` - Get record counts
- `create_module` - Create custom modules

---

## 📝 **USAGE**

Once Cursor is restarted, you can use Boost.space MCP tools directly:

- "List all Boost.space modules"
- "Query products from Boost.space"
- "Create a new workflow record in Boost.space"
- "Bulk upsert workflows to Boost.space"

---

## 🔄 **NEXT STEPS**

1. ✅ **Configuration Complete** - MCP server added to `~/.cursor/mcp.json`
2. ⏭️ **Restart Cursor** - Required for MCP changes to take effect
3. ⏭️ **Test Connection** - Verify tools are available
4. ⏭️ **Start Using** - Begin storing successful workflows in Boost.space

---

**Last Updated**: November 27, 2025  
**Status**: ✅ Ready to Use (after Cursor restart)
