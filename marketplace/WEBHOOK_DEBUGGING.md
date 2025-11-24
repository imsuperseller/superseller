# Webhook Execution Debugging

## Issue
Webhook triggers workflow but executions finish in <0.01 seconds with `"data": null`

## Evidence

### Execution 16518 (First Trigger)
- Started: 2025-11-21T19:24:22.550Z
- Stopped: 2025-11-21T19:24:22.556Z
- Duration: 0.006 seconds
- Status: success
- Data: null

### Execution 16522 (Second Trigger)
- Started: 2025-11-21T19:28:51.338Z
- Stopped: 2025-11-21T19:28:51.346Z
- Duration: 0.008 seconds
- Status: success
- Data: null

## Configuration Verified ✅

### Webhook Node
```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2.1,
  "parameters": {
    "path": "15ba8733-51a7-4bc7-8a6b-a39c276aa1e6",
    "responseMode": "lastNode",  // ✅ Correct
    "options": {}
  }
}
```

### Connection
```json
{
  "Webhook": {
    "main": [[{
      "node": "Set Workflow ID",  // ✅ Connected
      "type": "main",
      "index": 0
    }]]
  }
}
```

### Set Workflow ID
```json
{
  "parameters": {
    "assignments": {
      "assignments": [{
        "name": "workflow_id",
        "value": "cJbG8MpomtNrR1Sa",  // ✅ Valid workflow ID
        "type": "string"
      }]
    }
  }
}
```

## Hypotheses

### 1. Webhook Response Mode Issue
- `responseMode: "lastNode"` should wait for entire workflow
- But executions show no data and finish instantly
- **Possible**: Webhook is responding before workflow runs

### 2. Execution Failure
- Workflow might be failing silently after webhook
- Error in "Get a workflow" node (n8n API call)?
- Missing credentials or permissions?

### 3. Test Mode Limitation
- Webhook works in test mode (`executionMode: "test"`)
- But test mode might have limitations
- **Solution**: Activate workflow permanently

## Next Steps

1. **Check if OTHER triggers work** (Schedule Trigger)
   - If Schedule works → webhook-specific issue
   - If Schedule fails → workflow logic issue

2. **Check n8n node credentials**
   - Verify "Get a workflow" node has valid n8n API credentials
   - Test the API call manually

3. **Activate workflow permanently**
   - Exit test mode
   - Webhook stays registered
   - Full execution mode

4. **Add error handling**
   - Add error outputs to nodes
   - Log execution data for debugging

## Recommendation

Try clicking "Execute Workflow" from the "Schedule Trigger" node in the canvas to see if it runs the full workflow. This will tell us if the issue is webhook-specific or affects the entire workflow.
