# Fix: "fetch n8n workflows" Code Node Timeout

**Problem**: Code node times out after 60 seconds, returns empty `n8nWorkflows: []`

**Error**: `"timeout of 60000ms exceeded"`

**Solution**: Fix the Code node to use better timeout handling and error recovery.

---

## 🔧 Fix the Code Node

### **Current Issue**:
The Code node is timing out when trying to fetch 100+ workflows from the n8n API.

### **Updated Code** (Replace in "fetch n8n workflows" node):

```javascript
// Fetch workflows with better timeout and error handling
try {
  // Use longer timeout and retry logic
  const response = await this.helpers.request({
    method: 'GET',
    url: 'http://173.254.201.134:5678/api/v1/workflows?limit=100',
    headers: {
      'X-N8N-API-KEY': $env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw'
    },
    timeout: 120000, // 120 seconds
    retry: {
      maxRetries: 3,
      retryDelay: 2000
    }
  });

  // Parse response
  const workflows = Array.isArray(response) ? response : response.data?.workflows || [];

  // Format for AI Agent
  const formattedWorkflows = workflows.map(wf => ({
    id: wf.id,
    name: wf.name,
    active: wf.active,
    isArchived: wf.isArchived,
    createdAt: wf.createdAt,
    updatedAt: wf.updatedAt,
    nodeCount: wf.nodeCount,
    tags: wf.tags || []
  }));

  return [{
    json: {
      ...$input.first().json,
      n8nWorkflows: formattedWorkflows,
      workflowCount: formattedWorkflows.length
    }
  }];

} catch (error) {
  // On error, return error info but continue
  return [{
    json: {
      ...$input.first().json,
      n8nWorkflows: [],
      error: error.message,
      errorType: 'timeout_or_network_error'
    }
  }];
}
```

---

## 🔧 Alternative: Use n8n Internal API (Better)

If the HTTP request keeps timing out, use n8n's internal API access:

```javascript
// Use n8n's internal workflow access (if available)
try {
  // Try to access workflows via n8n's internal methods
  // This might require different approach depending on n8n version
  
  // Option 1: Use $execution.workflow if available
  // Option 2: Use n8n's workflow execution context
  
  // For now, use HTTP with better settings
  const response = await this.helpers.request({
    method: 'GET',
    url: 'http://localhost:5678/api/v1/workflows?limit=100',
    headers: {
      'X-N8N-API-KEY': $env.N8N_API_KEY
    },
    timeout: 120000
  });

  const workflows = Array.isArray(response) ? response : response.data?.workflows || [];

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
      })),
      workflowCount: workflows.length
    }
  }];
} catch (error) {
  return [{
    json: {
      ...$input.first().json,
      n8nWorkflows: [],
      error: error.message
    }
  }];
}
```

---

## 🔧 Best Solution: Use HTTP Request Node Instead

**Replace the Code node with an HTTP Request node**:

1. **Delete** the "fetch n8n workflows" Code node
2. **Add** HTTP Request node:
   - Name: "Fetch n8n Workflows"
   - Method: `GET`
   - URL: `http://173.254.201.134:5678/api/v1/workflows?limit=100`
   - Authentication: HTTP Header Auth
     - Name: `X-N8N-API-KEY`
     - Value: Your API key
   - Options:
     - Timeout: `120000` (120 seconds)
     - Retry on Fail: ✅ Enable
     - Max Tries: `3`

3. **Add Set node** to format the data:
   - Name: "Format Workflows"
   - Use "Set" node to transform:
     ```
     n8nWorkflows: {{ $json.map(item => ({
       id: item.id,
       name: item.name,
       active: item.active,
       isArchived: item.isArchived,
       createdAt: item.createdAt,
       updatedAt: item.updatedAt,
       nodeCount: item.nodeCount
     })) }}
     ```

4. **Connect**: Chat Trigger → HTTP Request → Set → AI Agent

---

## 🔧 Quick Fix: Increase Timeout in Code Node

**Simplest fix** - just update the timeout:

1. Open "fetch n8n workflows" Code node
2. Find the `timeout: 60000` line
3. Change to `timeout: 120000` (120 seconds)
4. Also add `?limit=100` to the URL to reduce response size
5. Save and test

**Updated URL in code**:
```javascript
url: 'http://173.254.201.134:5678/api/v1/workflows?limit=100',
timeout: 120000, // 120 seconds instead of 60
```

---

## 🔧 Alternative: Use Pagination

If 100 workflows still times out, fetch in smaller batches:

```javascript
// Fetch workflows in batches
const batches = [];
const limit = 50; // Smaller batches
let offset = 0;
let hasMore = true;

while (hasMore && batches.length < 3) { // Max 3 batches = 150 workflows
  try {
    const response = await this.helpers.request({
      method: 'GET',
      url: `http://173.254.201.134:5678/api/v1/workflows?limit=${limit}&offset=${offset}`,
      headers: {
        'X-N8N-API-KEY': $env.N8N_API_KEY
      },
      timeout: 30000 // 30 seconds per batch
    });

    const workflows = Array.isArray(response) ? response : response.data?.workflows || [];
    batches.push(...workflows);
    
    hasMore = workflows.length === limit;
    offset += limit;
  } catch (error) {
    // Stop on error
    break;
  }
}

return [{
  json: {
    ...$input.first().json,
    n8nWorkflows: batches.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      isArchived: wf.isArchived,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      nodeCount: wf.nodeCount
    })),
    workflowCount: batches.length
  }
}];
```

---

## ✅ Recommended Fix

**Use the HTTP Request node approach** (Solution 3 above) - it's more reliable than Code node for API calls.

**Or** if keeping Code node, use the pagination approach to fetch in smaller batches.

---

**Last Updated**: November 30, 2025
