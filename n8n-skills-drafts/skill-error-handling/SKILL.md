# n8n Error Handling Patterns

## Purpose
Implement robust error handling in n8n workflows using continueOnFail, Error Trigger, graceful degradation, and structured error responses.

## Activates On
- error handling, continueOnFail, error trigger
- try catch, graceful degradation, fallback
- workflow error, node failure, retry pattern

---

## Core Concept: Error Handling Strategies

n8n provides multiple error handling mechanisms:

| Strategy | Use Case | Configuration |
|----------|----------|---------------|
| `continueOnFail` | Non-critical nodes | Node settings |
| `alwaysOutputData` | Ensure data flow | Node settings |
| Error Trigger | Global error handler | Separate workflow |
| Try/Catch in Code | Code node errors | JavaScript pattern |
| If/Switch branching | Conditional error paths | Workflow design |

---

## Pattern #1: continueOnFail

Allow workflow to continue even if a node fails:

### Enable in Node Settings
```json
{
  "name": "Send WhatsApp",
  "type": "n8n-nodes-base.httpRequest",
  "continueOnFail": true,
  "parameters": { ... }
}
```

### Detect Failure in Next Node
```javascript
// CheckIfFailed Code node
const input = $input.first().json;

if (input.error) {
  // Previous node failed
  return [{
    json: {
      success: false,
      error: input.error.message || "Unknown error",
      nodeName: input.error.node || "Unknown"
    }
  }];
}

// Previous node succeeded
return [{ json: { success: true, data: input } }];
```

### Best Practices
```javascript
// ✅ Good: Non-critical notifications
"Send Email Notification" → continueOnFail: true
"Post to Slack" → continueOnFail: true
"Log to Analytics" → continueOnFail: true

// ❌ Bad: Critical operations
"Save to Database" → continueOnFail: false  // Must succeed
"Process Payment" → continueOnFail: false   // Must succeed
```

---

## Pattern #2: alwaysOutputData

Ensure nodes always produce output, even with no results:

### Enable in Node Settings
```json
{
  "name": "Update Progress",
  "type": "n8n-nodes-base.dataTable",
  "alwaysOutputData": true,
  "parameters": { ... }
}
```

### Why This Matters
```
Without alwaysOutputData:
  DataTable (no update) → [no output] → Switch [never executes!]

With alwaysOutputData:
  DataTable (no update) → [empty array] → Switch [executes with empty]
```

### When to Use
- DataTable update nodes (may not match rows)
- Filter nodes (may filter all items)
- Any node before a required downstream node
- Database operations with conditional updates

---

## Pattern #3: Error Trigger Workflow

Create a separate workflow to handle errors globally:

### Error Handler Workflow
```
Error Trigger → Format Error → Send Alert → Log to Database
```

### Error Trigger Node Configuration
```json
{
  "name": "Error Trigger",
  "type": "n8n-nodes-base.errorTrigger",
  "parameters": {},
  "typeVersion": 1
}
```

### Error Data Structure
```javascript
// Data received by Error Trigger
{
  "execution": {
    "id": "12345",
    "url": "https://n8n.example.com/execution/12345",
    "retryOf": null,
    "error": {
      "message": "The connection refused",
      "stack": "Error: The connection refused\n    at..."
    },
    "lastNodeExecuted": "HTTP Request",
    "mode": "webhook"
  },
  "workflow": {
    "id": "abc123",
    "name": "My Workflow"
  }
}
```

### Format Error for Notification
```javascript
// FormatError Code node
const error = $json.execution.error;
const workflow = $json.workflow;
const execution = $json.execution;

return [{
  json: {
    subject: `❌ Workflow Failed: ${workflow.name}`,
    message: `
Workflow: ${workflow.name} (${workflow.id})
Execution: ${execution.id}
Failed Node: ${execution.lastNodeExecuted}
Error: ${error.message}

View: ${execution.url}
    `.trim(),
    severity: "error",
    timestamp: new Date().toISOString()
  }
}];
```

---

## Pattern #4: Try/Catch in Code Nodes

Handle errors gracefully within Code nodes:

```javascript
// SafeOperation Code node
const items = $input.all();
const results = [];
const errors = [];

for (const item of items) {
  try {
    // Risky operation
    const parsed = JSON.parse(item.json.data);
    const processed = {
      id: parsed.id,
      value: parsed.value * 2
    };
    results.push({ json: { success: true, data: processed } });
  } catch (e) {
    // Capture error but continue
    errors.push({
      json: {
        success: false,
        error: e.message,
        originalData: item.json.data
      }
    });
  }
}

// Return both successes and failures
return [...results, ...errors];
```

### Separate Success and Error Branches
```javascript
// After SafeOperation, use If node
// Condition: {{ $json.success === true }}
// True branch → Process results
// False branch → Handle errors
```

---

## Pattern #5: Graceful Degradation

Provide fallback values when operations fail:

```javascript
// SafeExtract Code node
const input = $json;

// Extract with fallbacks
const name = input.user?.name || input.username || input.email?.split("@")[0] || "Unknown";
const email = input.user?.email || input.email || "no-email@example.com";

// Parse with fallback
let metadata = {};
try {
  metadata = JSON.parse(input.metadata || "{}");
} catch (e) {
  metadata = { parseError: e.message };
}

// API call with fallback (in n8n, use separate node with continueOnFail)
const enrichedData = input.enriched || { source: "fallback" };

return [{
  json: {
    name,
    email,
    metadata,
    enrichedData,
    hadFallbacks: !input.user || !input.metadata
  }
}];
```

---

## Pattern #6: Retry Pattern

Implement retry logic for transient failures:

```javascript
// RetryableOperation Code node
const MAX_RETRIES = 3;
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");
if (!staticData[execId]) staticData[execId] = {};
const scope = staticData[execId];

// Track retry count
scope.retryCount = (scope.retryCount || 0) + 1;

const input = $input.first().json;

// Check if this is a retry after failure
if (input.error && scope.retryCount <= MAX_RETRIES) {
  return [{
    json: {
      shouldRetry: true,
      retryCount: scope.retryCount,
      waitSeconds: Math.pow(2, scope.retryCount) // Exponential backoff
    }
  }];
}

if (scope.retryCount > MAX_RETRIES) {
  return [{
    json: {
      shouldRetry: false,
      failed: true,
      error: `Max retries (${MAX_RETRIES}) exceeded`,
      lastError: input.error?.message
    }
  }];
}

// Success - reset retry count
scope.retryCount = 0;
return [{ json: { success: true, data: input } }];
```

---

## Pattern #7: Structured Error Response

Return consistent error format:

```javascript
// ErrorFormatter Code node
function formatError(error, context = {}) {
  return {
    success: false,
    error: {
      message: error.message || String(error),
      code: error.code || "UNKNOWN_ERROR",
      type: error.name || "Error",
      stack: error.stack?.split("\n").slice(0, 3).join("\n"),
      timestamp: new Date().toISOString(),
      context: {
        node: context.node || "Unknown",
        workflow: context.workflow || "Unknown",
        input: context.input ? JSON.stringify(context.input).substring(0, 200) : null
      }
    }
  };
}

try {
  // Your operation here
  const result = JSON.parse($json.data);
  return [{ json: { success: true, data: result } }];
} catch (e) {
  return [{
    json: formatError(e, {
      node: "DataParser",
      input: $json.data
    })
  }];
}
```

---

## Pattern #8: Partial Success Handling

Handle workflows where some items succeed and others fail:

```javascript
// ProcessBatch Code node
const items = $input.all();
const results = {
  successful: [],
  failed: [],
  stats: {
    total: items.length,
    successCount: 0,
    failCount: 0
  }
};

for (const item of items) {
  try {
    const processed = processItem(item.json);
    results.successful.push({ json: processed });
    results.stats.successCount++;
  } catch (e) {
    results.failed.push({
      json: {
        originalItem: item.json,
        error: e.message
      }
    });
    results.stats.failCount++;
  }
}

// Decide how to proceed
if (results.stats.failCount === results.stats.total) {
  throw new Error("All items failed processing");
}

// Return summary with all results
return [{
  json: {
    ...results.stats,
    partialSuccess: results.stats.failCount > 0,
    successful: results.successful.map(r => r.json),
    failed: results.failed.map(r => r.json)
  }
}];
```

---

## Common Mistakes

### Mistake 1: Silent Failures
```javascript
// ❌ WRONG - error is swallowed, no visibility
try {
  doSomething();
} catch (e) {
  // nothing
}

// ✅ CORRECT - log or return error info
try {
  doSomething();
} catch (e) {
  return [{ json: { success: false, error: e.message } }];
}
```

### Mistake 2: Missing continueOnFail on Notifications
```javascript
// ❌ WRONG - email failure stops entire workflow
"Process Data" → "Send Email" (fails) → "Update Database" (never runs!)

// ✅ CORRECT - email failure doesn't block workflow
"Process Data" → "Send Email" (continueOnFail: true) → "Update Database" (runs)
```

### Mistake 3: No alwaysOutputData on Conditionals
```javascript
// ❌ WRONG - Filter removes all items, downstream never executes
"Get Data" → "Filter" (0 items) → "Switch" (never executes!)

// ✅ CORRECT - empty array still triggers downstream
"Get Data" → "Filter" (alwaysOutputData: true, 0 items) → "Switch" (executes with empty)
```

---

## Quick Reference

| Scenario | Solution |
|----------|----------|
| Non-critical node | `continueOnFail: true` |
| Node might return empty | `alwaysOutputData: true` |
| Global error handling | Error Trigger workflow |
| Per-item error handling | try/catch in Code node |
| Need fallback values | Defensive defaults with `||` |
| Transient failures | Retry pattern with staticData |
| Partial batch success | Separate success/fail arrays |

---

## Node Settings Reference

```json
{
  "name": "My Node",
  "type": "n8n-nodes-base.httpRequest",
  
  // Error handling settings
  "continueOnFail": true,      // Don't stop on error
  "alwaysOutputData": true,    // Output even if empty
  "retryOnFail": true,         // Built-in retry (some nodes)
  "maxTries": 3,               // Retry attempts
  "waitBetweenTries": 1000,    // Ms between retries
  
  "parameters": { ... }
}
```

---

## Evaluation Scenarios

```json
{
  "id": "error-001",
  "query": "My workflow stops when email notification fails",
  "expected_behavior": [
    "Identifies notification as non-critical",
    "Recommends continueOnFail: true",
    "Shows how to check for error in next node"
  ]
}
```

```json
{
  "id": "error-002",
  "query": "How do I set up global error notifications?",
  "expected_behavior": [
    "Explains Error Trigger workflow pattern",
    "Shows error data structure",
    "Provides error formatting example"
  ]
}
```

```json
{
  "id": "error-003",
  "query": "DataTable update doesn't pass data to the next node",
  "expected_behavior": [
    "Identifies alwaysOutputData issue",
    "Explains when nodes produce no output",
    "Shows proper configuration"
  ]
}
```
