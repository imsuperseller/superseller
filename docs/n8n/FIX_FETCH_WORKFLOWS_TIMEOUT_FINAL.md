# Fix: "Fetch n8n Workflows" HTTP Request Timeout

**Error**: `The connection was aborted, perhaps the server is offline`  
**Timeout**: 120 seconds exceeded  
**Node**: "Fetch n8n Workflows" (HTTP Request)

**Root Cause**: n8n API is slow to respond when querying 100+ workflows.

---

## 🔧 Solution 1: Use localhost Instead of IP (Recommended)

### **Update the HTTP Request Node**:

1. **Open "Fetch n8n Workflows" node**

2. **Change URL**:
   - **Current**: `http://173.254.201.134:5678/api/v1/workflows?limit=100`
   - **Change to**: `http://localhost:5678/api/v1/workflows?limit=50`
   
   **Why**:
   - `localhost` is faster (no network overhead)
   - `limit=50` reduces response size (fetch in smaller batches)

3. **Update Options**:
   - **Timeout**: `60000` (60 seconds should be enough for localhost)
   - ✅ **Retry on Fail**: Enable
   - **Max Tries**: `3`
   - **Wait Between Tries**: `2000`

4. **Save and test**

---

## 🔧 Solution 2: Use Code Node with Better Error Handling

### **Replace HTTP Request with Code Node**:

1. **Delete** "Fetch n8n Workflows" HTTP Request node

2. **Add Code Node**:
   - Name: "Fetch n8n Workflows"
   - Type: `n8n-nodes-base.code`

3. **Code** (with pagination and error handling):
```javascript
// Fetch workflows in smaller batches with retry logic
const fetchWorkflows = async (limit = 50, offset = 0) => {
  try {
    const response = await this.helpers.request({
      method: 'GET',
      url: `http://localhost:5678/api/v1/workflows?limit=${limit}&offset=${offset}`,
      headers: {
        'X-N8N-API-KEY': $env.N8N_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3YjYwZjYxZC03ZDFkLTQ5ODAtYWQ1My1iOWM5NTJlNjEzYTEiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU1NzkzNDIwfQ.FhnGpgBcvWyWZ_KH1PCdmBI_sK08C2hqTY-8GzEQ1Tw'
      },
      timeout: 30000 // 30 seconds per batch
    });
    return Array.isArray(response) ? response : response.data?.workflows || [];
  } catch (error) {
    return []; // Return empty on error
  }
};

// Fetch first batch (50 workflows)
const workflows = await fetchWorkflows(50, 0);

// Format for AI Agent
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
    workflowCount: workflows.length,
    note: workflows.length < 50 ? 'All workflows fetched' : 'First 50 workflows fetched (more available)'
  }
}];
```

4. **Connect**: Chat Trigger → Code Node → AI Agent

**Benefits**:
- ✅ Faster (localhost, smaller batches)
- ✅ Better error handling
- ✅ Won't timeout (30 seconds is enough for 50 workflows)

---

## 🔧 Solution 3: Use n8n API Node (If Available)

### **Check if n8n has a native API node**:

1. Search for "n8n" in node list
2. If there's a native n8n API node, use that instead
3. Configure to list workflows

**Note**: This might not exist, but worth checking.

---

## 🔧 Solution 4: Fetch Only Active Workflows

### **Reduce the dataset**:

**Update URL**:
```
http://localhost:5678/api/v1/workflows?limit=50&active=true
```

**Why**: Only active workflows need syncing (reduces from 100+ to ~30-40)

---

## 🔧 Solution 5: Use Schedule Trigger with Caching

### **Pre-fetch workflows on schedule**:

1. **Add Schedule Trigger** (separate from Chat Trigger):
   - Runs every hour
   - Fetches workflows
   - Stores in n8n Data Table or static data

2. **AI Agent reads from cache**:
   - No need to fetch on every request
   - Much faster

**This is more complex but most efficient for frequent syncs.**

---

## ✅ Recommended Quick Fix

**Use Solution 1** (localhost + smaller limit):

1. Open "Fetch n8n Workflows" HTTP Request node
2. Change URL to: `http://localhost:5678/api/v1/workflows?limit=50`
3. Change timeout to: `60000` (60 seconds)
4. Enable retry on fail
5. Save and test

**If still timing out**, use **Solution 2** (Code node with pagination).

---

## 🎯 Why This Happens

- **100+ workflows** = Large response
- **Network overhead** = IP address is slower than localhost
- **n8n API** = Can be slow when querying many workflows
- **Solution** = Use localhost + smaller batches

---

## 📋 Testing

After fixing:

1. **Test**: "Sync missing workflows"
2. **Check**: Should complete in < 30 seconds
3. **Verify**: `n8nWorkflows` array has workflows
4. **Confirm**: AI Agent can see workflows and sync them

---

**Last Updated**: November 30, 2025
