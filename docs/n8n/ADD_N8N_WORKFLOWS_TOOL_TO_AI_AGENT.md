# Add n8n Workflows Query Tool to AI Agent

**Problem**: AI Agent can query Boost.space but has no way to get the list of n8n workflows to sync.

**Solution**: Add an HTTP Request Tool that queries the n8n API to get all workflows.

---

## 🎯 New Tool: Query n8n Workflows (GET)

### **Purpose**: 
Query the n8n API to retrieve all workflows for comparison and syncing.

### **Configuration Steps**:

**1. Add New HTTP Request Tool Node**:
- Click "+" to add a new node
- Search for "HTTP Request Tool"
- Select `n8n-nodes-base.httpRequestTool`
- Name it: **"Query n8n Workflows"**

**2. Configure the Tool**:

**Method**: `GET`

**URL**: 
```
http://173.254.201.134:5678/api/v1/workflows
```

**Authentication**: 
- Select: `Generic Credential Type`
- Choose: `HTTP Header Auth`
- Create credential with:
  - **Name**: `X-N8N-API-KEY`
  - **Value**: Your n8n API key (from `~/.cursor/mcp.json` or n8n settings)

**Tool Description**:
```
Query n8n API to retrieve all workflows. Use GET method with X-N8N-API-KEY header authentication. Returns JSON array of workflow objects with fields: id, name, active, isArchived, createdAt, updatedAt, nodeCount, tags. Use this tool when the user asks to list, get, retrieve, or sync n8n workflows. This tool provides the source data for comparing with Boost.space products to identify new, updated, or deleted workflows.
```

**Query Parameters** (Optional):
- `active`: `true` or `false` (filter by active status)
- `limit`: `250` (max workflows to return)

**Response Optimization**: 
- ✅ Enable "Optimize Response"
- **Data Field**: Leave empty or use `={{ $fromAI('Field_Containing_Data', '', 'string') }}`
- **Fields to Include**: `selected`
- **Fields**: `id, name, active, isArchived, createdAt, updatedAt, nodeCount`

**3. Connect to AI Agent**:
- Connect this tool to the AI Agent node via `ai_tool` connection
- Same as other Boost.space tools

---

## 📋 Alternative: Use n8n API Key in Header

If HTTP Header Auth doesn't work, use **Query Parameters** or **Headers** section:

**Headers**:
- **Name**: `X-N8N-API-KEY`
- **Value**: `={{ $env.N8N_API_KEY }}` or hardcode your API key

**Note**: Store API key in n8n credentials for security.

---

## 🔧 Complete Tool Configuration

### **Node Settings**:
```json
{
  "parameters": {
    "toolDescription": "Query n8n API to retrieve all workflows. Use GET method with X-N8N-API-KEY header authentication. Returns JSON array of workflow objects with fields: id, name, active, isArchived, createdAt, updatedAt, nodeCount, tags. Use this tool when the user asks to list, get, retrieve, or sync n8n workflows. This tool provides the source data for comparing with Boost.space products to identify new, updated, or deleted workflows.",
    "method": "GET",
    "url": "http://173.254.201.134:5678/api/v1/workflows",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        {
          "name": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('parameters0_Name', ``, 'string') }}",
          "value": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('parameters0_Value', ``, 'string') }}"
        }
      ]
    },
    "options": {
      "timeout": 30000
    },
    "optimizeResponse": true,
    "dataField": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Field_Containing_Data', ``, 'string') }}",
    "fieldsToInclude": "selected",
    "fields": "id, name, active, isArchived, createdAt, updatedAt, nodeCount"
  },
  "type": "n8n-nodes-base.httpRequestTool",
  "typeVersion": 4.3,
  "name": "Query n8n Workflows",
  "credentials": {
    "httpHeaderAuth": {
      "id": "[YOUR_CREDENTIAL_ID]",
      "name": "n8n-api-key"
    }
  }
}
```

---

## 🔑 Getting Your n8n API Key

**Option 1: From n8n Settings**:
1. Go to n8n: `http://173.254.201.134:5678`
2. Click Settings → API
3. Generate or copy API key

**Option 2: From MCP Config**:
- Check `~/.cursor/mcp.json` for n8n API key
- Look for `N8N_API_KEY` or similar

**Option 3: From Environment**:
- If stored in n8n environment variables, use `={{ $env.N8N_API_KEY }}`

---

## 📝 Update AI Agent System Message

After adding the tool, update the AI Agent's system message to mention it:

Add to system message:
```
**n8n Workflows**:
- Query n8n Workflows: Retrieve all workflows from n8n API for comparison and syncing
```

---

## ✅ Testing

After adding the tool, test with:
1. "List all n8n workflows"
2. "Get workflows from n8n"
3. "Sync all n8n workflows to Boost.space products"

The AI Agent should:
1. Query n8n workflows (using new tool)
2. Query Boost.space products (existing tool)
3. Compare and identify new/updated workflows
4. Create products for new workflows
5. Update products for changed workflows

---

## 🎯 Expected Workflow

```
User: "Sync all n8n workflows to Boost.space products"

AI Agent:
1. Uses "Query n8n Workflows" tool → Gets list of 100+ workflows
2. Uses "Query Products" tool → Gets existing products in Space 59
3. Compares:
   - New workflows (not in Boost.space) → Create products
   - Updated workflows (name/date changed) → Update products
   - Deleted workflows (in Boost.space but not in n8n) → Report
4. Reports: "Synced 100 workflows: 95 new products created, 5 products updated"
```

---

**Last Updated**: November 30, 2025
