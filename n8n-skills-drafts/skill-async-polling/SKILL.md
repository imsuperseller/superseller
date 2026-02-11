# n8n Async Polling & Long-Running Tasks

## Purpose
Guide for implementing polling patterns when working with external APIs that process tasks asynchronously (image generation, video rendering, AI processing, etc.).

## Activates On
- polling, poll status, long-running, async task, wait for completion
- taskId, job status, check status, external API
- loop until complete, retry pattern

---

## Core Concept: The Polling Loop Pattern

Many external APIs (Kie.ai, Runway, Replicate, ElevenLabs) work asynchronously:
1. **Submit task** → Get `taskId`
2. **Poll status** → Check if complete
3. **Loop** until success or timeout
4. **Collect result** → Extract output URL

```
┌─────────────────┐
│ Submit Task     │ → Returns taskId
└────────┬────────┘
         ↓
┌─────────────────┐
│ Store TaskId    │ → Save to staticData
└────────┬────────┘
         ↓
    ┌────┴────┐
    ↓         │
┌───────────┐ │
│ Poll API  │ │
└─────┬─────┘ │
      ↓       │
┌───────────┐ │
│ Check     │ │
│ Status    │ │
└─────┬─────┘ │
      ↓       │
   Success? ──┘ No → Wait → Loop back
      │
      ↓ Yes
┌───────────┐
│ Collect   │
│ Result    │
└───────────┘
```

---

## Critical Pattern #1: TaskId Preservation

### The Problem
In a polling loop, `$json` changes with each iteration. The original `taskId` is lost.

```javascript
// ❌ WRONG: $json.taskId is undefined after first poll
// First iteration: $json has taskId from Submit node
// Second iteration: $json has response from Poll node (no taskId!)
```

### Solution A: Direct Node Reference (Recommended)
Reference the original node that has the taskId:

```javascript
// Poll node URL expression
={{ "https://api.example.com/status?taskId=" + $("SubmitTask").first().json.taskId }}

// Or with nested response
={{ "https://api.example.com/status?taskId=" + $("SubmitTask").first().json.data.taskId }}
```

**Why this works**: `$("NodeName").first()` always returns the output from that node's execution, regardless of current loop iteration.

### Solution B: StaticData Storage (For Complex Workflows)
Store taskId in workflow static data on first pass:

```javascript
// StoreTaskId Code node (runs after Submit)
const execId = $execution.id;
const staticData = $getWorkflowStaticData("global");
if (!staticData[execId]) staticData[execId] = {};

const taskId = $json?.data?.taskId || $json?.taskId;
staticData[execId].myTaskId = taskId;

return [{ json: { ...$json, storedTaskId: taskId } }];
```

```javascript
// Poll node URL - read from staticData
={{ 
  const scope = $getWorkflowStaticData("global")[$execution.id] || {};
  "https://api.example.com/status?taskId=" + scope.myTaskId
}}
```

**When to use StaticData**:
- Multiple concurrent polling loops
- Complex branching where direct reference fails
- Need to store multiple values across iterations

---

## Critical Pattern #2: Status Check Logic

### The Problem
Different APIs return success in different formats:

```javascript
// API A
{ "status": "success" }

// API B  
{ "status": 4 }  // numeric code

// API C
{ "data": { "state": "completed" } }

// API D
{ "success": true, "status": "processing" }  // misleading!
```

### Solution: Robust Status Checking

```javascript
// CheckStatus Code node
const SUCCESS_STATUSES = [
  4,           // numeric code
  'completed', 
  'succeeded', 
  'done', 
  'success',   // string status
  1, 
  true, 
  'true'
];

const FATAL_STATUSES = ['failed', 'error', 'cancelled', -1, false];

// Check multiple possible locations
const status = $json.status || $json.data?.state || $json.state;
const isSuccess = SUCCESS_STATUSES.includes(status);
const isFatal = FATAL_STATUSES.includes(status) || $json.error;

return [{
  json: {
    ...$json,
    success: isSuccess,
    fatal: isFatal,
    shouldContinue: !isSuccess && !isFatal
  }
}];
```

### If Node Condition
```javascript
// Success condition
{{ $json.success === true }}

// Or check actual status
{{ $json.status === "success" || $json.data?.state === "success" }}
```

---

## Critical Pattern #3: Result Extraction

### The Problem
Many APIs return the result URL inside a stringified JSON:

```javascript
// What the API returns
{
  "code": 200,
  "data": {
    "resultJson": "{\"resultUrls\":[\"https://cdn.example.com/video.mp4\"]}"
  }
}
```

### Solution: Parse Nested JSON

```javascript
// CollectResult Code node
let resultUrl = $json.resultUrl;  // Try direct field first

// Parse from stringified JSON
if (!resultUrl && $json.data?.resultJson) {
  try {
    const parsed = JSON.parse($json.data.resultJson);
    resultUrl = parsed.resultUrls?.[0] || parsed.url || parsed.output;
  } catch (e) {
    // resultJson wasn't valid JSON
  }
}

// Try other common locations
if (!resultUrl) {
  resultUrl = $json.data?.url || $json.output?.url || $json.result?.url;
}

if (!resultUrl) {
  throw new Error("Could not extract result URL from response");
}

return [{ json: { ...$json, extractedUrl: resultUrl } }];
```

---

## Complete Workflow Example

### Node Structure
```
1. SubmitTask (HTTP Request)
   ↓
2. StoreTaskId (Code) - Store taskId in staticData
   ↓
3. PollStatus (HTTP Request) - Uses direct node reference
   ↓
4. CheckStatus (Code) - Parse and evaluate status
   ↓
5. IsComplete (If) - Branch on success/fatal/continue
   ├── true → CollectResult (Code)
   ├── false (fatal) → HandleError
   └── false (continue) → Wait (5s) → Loop to PollStatus
```

### Key Configuration

**PollStatus HTTP Request**:
```javascript
// URL with direct node reference
URL: https://api.example.com/jobs/status
Query Parameters:
  taskId: {{ $("SubmitTask").first().json.data.taskId }}
```

**Wait Node**:
- Amount: 5 (seconds)
- Connect output back to PollStatus input

**IsComplete If Node**:
```javascript
// Condition
{{ $json.success === true }}
```

---

## Common Mistakes

### Mistake 1: Using $json in Poll URL
```javascript
// ❌ WRONG - loses taskId after first iteration
{{ "https://api.example.com/status?taskId=" + $json.taskId }}

// ✅ CORRECT - persists across iterations  
{{ "https://api.example.com/status?taskId=" + $("SubmitTask").first().json.data.taskId }}
```

### Mistake 2: Not Handling Stringified JSON
```javascript
// ❌ WRONG - resultUrl is undefined
const url = $json.data.resultUrl;

// ✅ CORRECT - parse the stringified JSON
const parsed = JSON.parse($json.data.resultJson);
const url = parsed.resultUrls[0];
```

### Mistake 3: Wrong Success Status
```javascript
// ❌ WRONG - "success" field is API wrapper, not task status
{{ $json.success === true }}

// ✅ CORRECT - check actual task status
{{ $json.status === "success" || $json.data?.state === "completed" }}
```

### Mistake 4: No Timeout Protection
Always add a maximum iteration count or timeout:

```javascript
// In CheckStatus Code node
const scope = $getWorkflowStaticData("global")[$execution.id];
scope.pollCount = (scope.pollCount || 0) + 1;

if (scope.pollCount > 60) {  // 60 polls * 5 seconds = 5 minutes
  return [{ json: { fatal: true, error: "Polling timeout exceeded" } }];
}
```

---

## API-Specific Patterns

### Kie.ai (Image/Video Generation)
```javascript
// Submit: POST https://api.kie.ai/api/v1/jobs/createTask
// Poll: GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=xxx
// Success: status === "success" OR data.state === 4
// Result: JSON.parse(data.resultJson).resultUrls[0]
```

### Replicate
```javascript
// Submit: POST https://api.replicate.com/v1/predictions
// Poll: GET https://api.replicate.com/v1/predictions/{id}
// Success: status === "succeeded"
// Result: output[0] or output.video
```

### ElevenLabs
```javascript
// Submit: POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
// Response is immediate binary audio (no polling needed)
// For longer content, use history endpoint
```

---

## Quick Reference

| Pattern | Use Case | Key Expression |
|---------|----------|----------------|
| Direct Node Ref | Simple polling | `$("Node").first().json.taskId` |
| StaticData | Complex/concurrent | `$getWorkflowStaticData("global")[$execution.id]` |
| Status Array | Multi-format APIs | `SUCCESS_STATUSES.includes(status)` |
| JSON Parse | Nested results | `JSON.parse($json.data.resultJson)` |

---

## Evaluation Scenarios

```json
{
  "id": "async-001",
  "query": "My polling loop loses the taskId after the first iteration",
  "expected_behavior": [
    "Identifies $json changes in loop iterations",
    "Recommends direct node reference $('Node').first().json",
    "Provides alternative staticData pattern"
  ]
}
```

```json
{
  "id": "async-002", 
  "query": "API returns success:false but status:success - which do I check?",
  "expected_behavior": [
    "Explains API wrapper vs task status difference",
    "Shows robust status checking with multiple fields",
    "Provides SUCCESS_STATUSES array pattern"
  ]
}
```

```json
{
  "id": "async-003",
  "query": "resultUrl is undefined but I can see it in the API response",
  "expected_behavior": [
    "Identifies stringified JSON in resultJson field",
    "Shows JSON.parse pattern",
    "Lists common result URL locations"
  ]
}
```
