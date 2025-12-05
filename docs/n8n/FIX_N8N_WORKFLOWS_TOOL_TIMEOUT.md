# Fix: n8n Workflows Query Tool Timeout

**Error**: `The connection timed out, consider setting the 'Retry on Fail' option in the node settings`

**Root Cause**: Querying 100+ workflows takes too long, causing timeout.

**Solutions**: Add timeout/retry settings, use pagination, or use Code node.

---

## 🔧 Solution 1: Add Timeout & Retry Settings (Quick Fix)

### **In "Query n8n Workflows" Node**:

**1. Options Section**:
- **Timeout**: `60000` (60 seconds) or `90000` (90 seconds)
- **Retry on Fail**: ✅ Enable
- **Max Tries**: `3`
- **Wait Between Tries**: `2000` (2 seconds)

**2. Add Query Parameters for Pagination**:
- **limit**: `100` (get first 100 workflows)
- This reduces response size and speeds up the request

**Updated URL**:
```
http://173.254.201.134:5678/api/v1/workflows?limit=100
```

---

## 🔧 Solution 2: Use Code Node Instead (Better Approach)

Instead of HTTP Request Tool, use a **Code node** that accesses n8n workflows directly via the internal API.

### **Create Code Node**:

**1. Add Code Node**:
- Name: "Get n8n Workflows"
- Type: `n8n-nodes-base.code`

**2. Code**:
```javascript
// Get all n8n workflows via internal API
const workflows = await this.helpers.request({
  method: 'GET',
  url: 'http://173.254.201.134:5678/api/v1/workflows',
  headers: {
    'X-N8N-API-KEY': $env.N8N_API_KEY || 'YOUR_API_KEY_HERE'
  },
  timeout: 60000
});

// Parse response
const workflowList = Array.isArray(workflows) ? workflows : workflows.data?.workflows || [];

// Format for AI Agent
return workflowList.map(workflow => ({
  json: {
    id: workflow.id,
    name: workflow.name,
    active: workflow.active,
    isArchived: workflow.isArchived,
    createdAt: workflow.createdAt,
    updatedAt: workflow.updatedAt,
    nodeCount: workflow.nodeCount,
    tags: workflow.tags || []
  }
}));
```

**3. Connect**:
- Connect Code node output to AI Agent input
- AI Agent will receive workflow list as input data

**Note**: This approach doesn't require the AI Agent to call a tool - the workflows are provided as input data.

---

## 🔧 Solution 3: Update HTTP Request Tool with Better Settings

### **If keeping HTTP Request Tool**:

**1. Node Settings**:
- **Timeout**: `90000` (90 seconds)
- **Retry on Fail**: ✅ Enable
- **Max Tries**: `3`
- **Wait Between Tries**: `3000` (3 seconds)

**2. Query Parameters**:
- Add `limit=100` to reduce response size
- Add `active=true` if you only want active workflows

**Updated URL**:
```
http://173.254.201.134:5678/api/v1/workflows?limit=100&active=true
```

**3. Response Optimization**:
- ✅ Enable "Optimize Response"
- **Fields to Include**: `selected`
- **Fields**: `id, name, active, isArchived, createdAt, updatedAt, nodeCount`
- This reduces response size significantly

---

## 🔧 Solution 4: Pre-fetch Workflows (Best for AI Agent)

### **Add Code Node Before AI Agent**:

**1. Add Code Node** between Chat Trigger and AI Agent:
- Name: "Fetch n8n Workflows"
- Type: `n8n-nodes-base.code`

**2. Code**:
```javascript
// Fetch workflows
const response = await this.helpers.request({
  method: 'GET',
  url: 'http://173.254.201.134:5678/api/v1/workflows',
  headers: {
    'X-N8N-API-KEY': $env.N8N_API_KEY
  },
  timeout: 60000
});

const workflows = Array.isArray(response) ? response : response.data?.workflows || [];

// Add workflows to input data for AI Agent
return [{
  json: {
    ...$input.first().json,
    n8nWorkflows: workflows.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      isArchived: wf.isArchived,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      nodeCount: wf.nodeCount
    }))
  }
}];
```

**3. Update AI Agent System Message**:
Add to system message:
```
**Input Data**: The workflow list is provided in the input data as `n8nWorkflows` array. Use this data instead of querying n8n API.
```

**4. Connection**:
- Chat Trigger → Code Node → AI Agent
- AI Agent receives workflows as input, no tool call needed

---

## 🎯 Recommended Approach

**Best Solution**: **Solution 4 (Pre-fetch Workflows)**

**Why**:
- ✅ No timeout issues (Code node handles it better)
- ✅ Faster (workflows available immediately)
- ✅ No need for AI Agent to call tool
- ✅ More reliable (no network issues)
- ✅ Can add error handling easily

**Alternative**: **Solution 1 (Add Timeout/Retry)** if you want to keep the HTTP Request Tool approach.

---

## 📋 Quick Fix Steps (Solution 1)

1. **Open "Query n8n Workflows" node**

2. **Click "Options"**:
   - **Timeout**: `90000` (90 seconds)
   - ✅ **Retry on Fail**: Enable
   - **Max Tries**: `3`
   - **Wait Between Tries**: `3000`

3. **Update URL**:
   ```
   http://173.254.201.134:5678/api/v1/workflows?limit=100
   ```

4. **Save and test**

---

## 🔍 Debugging

If still timing out:

1. **Check n8n API is accessible**:
   - Test URL in browser: `http://173.254.201.134:5678/api/v1/workflows`
   - Should return JSON (with API key in header)

2. **Reduce limit further**:
   - Try `limit=50` or `limit=25`
   - Test if smaller batches work

3. **Check network**:
   - Is n8n instance accessible from itself?
   - Try `localhost:5678` instead of IP

4. **Use Code node** (Solution 4) - most reliable

---

**Last Updated**: November 30, 2025
