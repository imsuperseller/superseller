# HTTP Request Node v4.3 - Actual Available Options

**Node**: `n8n-nodes-base.httpRequest` version **4.3**

---

## ✅ What's Actually Available

### **Options Section** (Click "Options" to expand):

1. **Timeout**:
   - **Location**: Options → Timeout
   - **Type**: Number
   - **Default**: `10000` (10 seconds)
   - **Min Value**: `1`
   - **What to set**: `60000` (60 seconds) or `120000` (120 seconds)

2. **Batching** (if needed)
3. **Redirect** (if needed)
4. **Response Format** (if needed)
5. **Pagination** (if needed)

### **❌ NOT Available in Options**:
- ❌ "Retry on Fail" - This is a **node-level setting**, not in Options
- ❌ "Max Tries" - This is a **node-level setting**, not in Options  
- ❌ "Wait Between Tries" - This is a **node-level setting**, not in Options

---

## 🔧 Where to Find Retry Settings

### **Node-Level Error Handling** (Not in Options):

These settings are at the **node level**, not in the Options section:

1. **Click on the node** (not Options)
2. Look for **"On Error"** or **"Error Handling"** section
3. Or look for **"Retry"** section at the node level

**Note**: In n8n, retry settings might be:
- In the node's main settings (not Options)
- Or configured via workflow settings
- Or not available in HTTP Request node v4.3

---

## ✅ Actual Fix for Timeout

### **What You Can Actually Do**:

**1. Update Timeout in Options**:
- Open "Fetch n8n Workflows" node
- Click **"Options"** (expand it)
- Find **"Timeout"** field
- Change from `10000` to `120000` (120 seconds)

**2. Change URL to localhost**:
- **URL**: `http://localhost:5678/api/v1/workflows?limit=50`
- This is faster than IP address

**3. Reduce Limit**:
- Add `?limit=50` to URL (reduces response size)
- Or `?limit=50&active=true` (only active workflows)

---

## 🔧 Complete Fix Steps

### **In "Fetch n8n Workflows" HTTP Request Node**:

1. **URL Field**:
   - Change to: `http://localhost:5678/api/v1/workflows?limit=50`

2. **Options Section** (Click "Options"):
   - **Timeout**: `120000` (120 seconds)

3. **Save**

**That's it!** No retry settings to configure - just timeout and URL.

---

## 🎯 Why This Works

- **localhost**: Faster than IP (no network overhead)
- **limit=50**: Smaller response (faster to process)
- **120000 timeout**: Enough time for 50 workflows

---

## 📝 If Still Timing Out

**Use Code Node Instead** (more reliable):

1. **Delete** HTTP Request node
2. **Add Code Node**:
   - Name: "Fetch n8n Workflows"
3. **Code**:
```javascript
try {
  const response = await this.helpers.request({
    method: 'GET',
    url: 'http://localhost:5678/api/v1/workflows?limit=50',
    headers: {
      'X-N8N-API-KEY': $env.N8N_API_KEY
    },
    timeout: 60000
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

**Last Updated**: November 30, 2025
