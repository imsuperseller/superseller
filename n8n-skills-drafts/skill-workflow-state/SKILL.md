# n8n Workflow State Management

## Purpose
Manage persistent state across nodes and loop iterations using staticData, direct node references, and execution-scoped storage.

## Activates On
- staticData, state management, persist data, store value
- cross-node data, loop state, execution data
- $getWorkflowStaticData, node reference, $execution

---

## Core Concept: State Persistence Options

n8n provides three main ways to persist state:

| Method | Scope | Persistence | Use Case |
|--------|-------|-------------|----------|
| Direct Node Reference | Execution | During execution | Access any node's output |
| StaticData (global) | Workflow | Across executions | Counters, caches, tokens |
| StaticData (node) | Node | Across executions | Node-specific state |
| Execution-Scoped | Execution | During execution | Prevent cross-execution pollution |

---

## Pattern #1: Direct Node References

Access any node's output from anywhere in the workflow:

```javascript
// Access output from a specific node
$("NodeName").first().json.fieldName

// Access all items from a node
$("NodeName").all()

// Access specific item by index
$("NodeName").item(0).json.fieldName

// Access from previous execution of same node (in loops)
$("NodeName").first().json  // Always returns first execution output
```

### In Expressions (non-Code nodes)
```javascript
// HTTP Request URL
{{ $("SubmitTask").first().json.data.taskId }}

// Set node value
{{ $("GlobalSettings").first().json.API_KEY }}

// Conditional in If node
{{ $("CheckStatus").first().json.success === true }}
```

### In Code Nodes
```javascript
// Access another node's output
const settings = $("GlobalSettings").first().json;
const apiKey = settings.API_KEY;
const baseUrl = settings.BASE_URL;

// Use in current logic
const url = `${baseUrl}/api/status`;
return [{ json: { url, apiKey } }];
```

---

## Pattern #2: Global StaticData

Persist data across workflow executions:

```javascript
// Get global static data
const staticData = $getWorkflowStaticData("global");

// Read value
const counter = staticData.requestCount || 0;

// Write value
staticData.requestCount = counter + 1;
staticData.lastRun = new Date().toISOString();

// Data persists after workflow ends!
return [{ json: { counter: staticData.requestCount } }];
```

### Common Use Cases
- **API token caching**: Store OAuth tokens until expiry
- **Rate limiting**: Track request counts
- **Incremental sync**: Store last sync timestamp
- **Deduplication**: Store processed IDs

```javascript
// Token caching example
const staticData = $getWorkflowStaticData("global");

// Check if token is still valid
if (staticData.token && staticData.tokenExpiry > Date.now()) {
  return [{ json: { token: staticData.token, cached: true } }];
}

// Token expired or missing - will refresh in next node
return [{ json: { needsRefresh: true } }];
```

---

## Pattern #3: Execution-Scoped State (CRITICAL)

**Problem**: Global staticData is shared across concurrent executions. This causes data pollution.

**Solution**: Scope state by execution ID:

```javascript
// Execution-scoped state pattern
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");

// Initialize execution scope
if (!staticData[execId]) {
  staticData[execId] = {};
}
const scope = staticData[execId];

// Now use scope for this execution only
scope.taskId = $json.data.taskId;
scope.startTime = Date.now();
scope.videos = scope.videos || [];

return [{ json: { ...$json, stored: true } }];
```

### Reading Execution-Scoped Data
```javascript
// In later node
const execId = $execution.id;
const scope = $getWorkflowStaticData("global")[execId] || {};

const taskId = scope.taskId;
const videos = scope.videos || [];
```

### In Expressions
```javascript
// HTTP Request URL parameter
{{ $getWorkflowStaticData("global")[$execution.id]?.taskId }}
```

### Cleanup (Important!)
```javascript
// At end of workflow, clean up to prevent memory leaks
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");
delete staticData[execId];

return [{ json: { cleaned: true } }];
```

---

## Pattern #4: Node-Specific StaticData

Store state specific to a single node:

```javascript
// Get node-specific static data
const nodeData = $getWorkflowStaticData("node");

// Track this node's execution count
nodeData.executionCount = (nodeData.executionCount || 0) + 1;

// Store node-specific cache
nodeData.cache = nodeData.cache || {};
nodeData.cache[key] = value;
```

### Use Cases
- Node-level caching
- Rate limiting per node
- Tracking node-specific metrics

---

## Pattern #5: Collecting Data Across Loop Iterations

Accumulate data from multiple loop passes:

```javascript
// CollectVideos Code node (runs in loop)
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");
if (!staticData[execId]) staticData[execId] = {};
const scope = staticData[execId];

// Initialize collection array
scope.collectedVideos = scope.collectedVideos || [];

// Extract URL from current iteration
let videoUrl = $json.resultUrl;
if (!videoUrl && $json.data?.resultJson) {
  try {
    const parsed = JSON.parse($json.data.resultJson);
    videoUrl = parsed.resultUrls?.[0];
  } catch (e) {}
}

// Add to collection (avoid duplicates)
if (videoUrl && !scope.collectedVideos.includes(videoUrl)) {
  scope.collectedVideos.push(videoUrl);
}

return [{ 
  json: { 
    ...$json, 
    currentUrl: videoUrl,
    totalCollected: scope.collectedVideos.length,
    allVideos: scope.collectedVideos
  } 
}];
```

---

## Pattern #6: Global Settings Node

Create a settings node at workflow start for consistent configuration:

```javascript
// GlobalSettings Code node (first node after trigger)
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");
if (!staticData[execId]) staticData[execId] = {};

// Store configuration in execution scope
const scope = staticData[execId];
scope.settings = {
  API_KEY: "your-api-key",
  BASE_URL: "https://api.example.com",
  WEBHOOK_URL: "https://n8n.yoursite.com/webhook",
  MAX_RETRIES: 3,
  POLL_INTERVAL: 5000
};

// Also return as output for direct node reference
return [{ json: scope.settings }];
```

### Access Settings Anywhere
```javascript
// Via direct node reference (recommended)
$("GlobalSettings").first().json.API_KEY

// Via staticData (backup)
$getWorkflowStaticData("global")[$execution.id]?.settings?.API_KEY
```

---

## Common Mistakes

### Mistake 1: Using $json in Loops
```javascript
// ❌ WRONG - $json changes each iteration
const taskId = $json.taskId;  // undefined after first poll

// ✅ CORRECT - direct node reference persists
const taskId = $("SubmitTask").first().json.taskId;
```

### Mistake 2: Not Scoping by Execution ID
```javascript
// ❌ WRONG - concurrent executions overwrite each other
const staticData = $getWorkflowStaticData("global");
staticData.currentTask = taskId;  // DANGEROUS!

// ✅ CORRECT - scoped by execution
const scope = $getWorkflowStaticData("global")[$execution.id];
scope.currentTask = taskId;
```

### Mistake 3: Forgetting to Initialize
```javascript
// ❌ WRONG - crashes if scope doesn't exist
const videos = staticData[execId].videos;  // TypeError!

// ✅ CORRECT - defensive initialization
if (!staticData[execId]) staticData[execId] = {};
const videos = staticData[execId].videos || [];
```

### Mistake 4: Memory Leaks
```javascript
// ❌ WRONG - never cleans up execution data
// Old execution data accumulates forever

// ✅ CORRECT - cleanup at workflow end
// Add cleanup node at all terminal branches
delete $getWorkflowStaticData("global")[$execution.id];
```

### Mistake 5: Complex Expressions in Non-Code Nodes
```javascript
// ❌ WRONG - complex logic in expression (error-prone)
{{ (() => {
  const s = $getWorkflowStaticData("global")[$execution.id];
  return s?.taskId || $json?.taskId;
})() }}

// ✅ CORRECT - use Code node for complex logic
// Then reference with simple expression
{{ $("StoreTaskId").first().json.storedTaskId }}
```

---

## Quick Reference

| Need | Solution | Syntax |
|------|----------|--------|
| Access node output | Direct reference | `$("NodeName").first().json.field` |
| Persist across executions | Global staticData | `$getWorkflowStaticData("global")` |
| Execution-safe state | Scoped staticData | `staticData[$execution.id]` |
| Loop-safe data | Direct reference | `$("OriginalNode").first().json` |
| Collect across iterations | Scoped array | `scope.items.push(value)` |

---

## Decision Tree

```
Need to access data?
├── From another node in same execution?
│   └── Use: $("NodeName").first().json.field
│
├── From previous workflow execution?
│   └── Use: $getWorkflowStaticData("global").field
│
├── In a loop, need original data?
│   └── Use: $("OriginalNode").first().json.field
│
├── Storing data for later nodes?
│   ├── Simple value → Return in json output
│   └── Complex/multiple values → Execution-scoped staticData
│
└── Need to persist after workflow ends?
    └── Use: $getWorkflowStaticData("global").field
```

---

## Evaluation Scenarios

```json
{
  "id": "state-001",
  "query": "How do I access data from an earlier node in my workflow?",
  "expected_behavior": [
    "Shows $('NodeName').first().json pattern",
    "Explains this works from any node",
    "Shows expression and Code node syntax"
  ]
}
```

```json
{
  "id": "state-002",
  "query": "My concurrent workflow executions are overwriting each other's data",
  "expected_behavior": [
    "Identifies global staticData collision issue",
    "Shows execution-scoped pattern with $execution.id",
    "Provides initialization and cleanup patterns"
  ]
}
```

```json
{
  "id": "state-003",
  "query": "How do I collect URLs from multiple loop iterations?",
  "expected_behavior": [
    "Shows execution-scoped array pattern",
    "Demonstrates push with deduplication",
    "Returns accumulated array in output"
  ]
}
```
