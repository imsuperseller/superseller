# Directive: Debug n8n Workflow

**Purpose**: Systematic approach to diagnosing, root-causing, and resolving n8n workflow issues.

**Last Updated**: February 2026

---

## 1. Debugging Methodology

### Prerequisites
- Access to n8n via MCP tools (`n8n_get_workflow`, `n8n_get_execution`)
- Workflow ID and/or Execution ID

### The Process
1. **Observe**: Get execution data, identify failed node
2. **Analyze**: Understand error message, check input/output data
3. **Fix**: Apply correction to workflow
4. **Test**: Run execution, verify fix

---

## 2. Get Execution Details

```
n8n_get_execution(id=EXECUTION_ID, instance="superseller", includeData=true)
```

Key fields to check:
- `status`: running / success / error / waiting
- `data.resultData.lastNodeExecuted`: Where it stopped
- `data.resultData.error.message`: The error message
- `data.resultData.runData`: Node-by-node execution data

---

## 3. Common Error Patterns

### Node Reference Errors
```
"Problem getting the JSON data of the node 'NodeName'"
```
**Cause**: Referenced node doesn't exist or hasn't executed yet.
**Fix**: Use correct node name or ensure execution order.

### Expression Errors
```
"Cannot read property 'X' of undefined"
```
**Cause**: Data path doesn't exist in input.
**Fix**: Use optional chaining `$json.data?.field` or check data structure.

### TaskId Lost in Polling Loop
```
"taskId is required"
```
**Cause**: Using `$json.taskId` which changes each iteration.
**Fix**: Use direct node reference `$("SubmitNode").first().json.taskId`.

### Stringified JSON Not Parsed
```
resultUrl is undefined
```
**Cause**: API returns result inside `JSON.parse($json.data.resultJson)`.
**Fix**: Parse the nested JSON string.

### DataTable Filter Required
```
"At least one condition is required"
```
**Cause**: DataTable update node needs filter condition in 2.x.
**Fix**: Add filter using `dataTable_rowId` from staticData.

### AI Response Format Mismatch
```
"No JSON array found in AI response"
```
**Cause**: Code expects `$json.result` but AI returns `$json.content[0].text`.
**Fix**: Handle provider-specific response formats.

---

## 4. Debugging Checklist

### Pre-Execution
- [ ] Workflow is **Published** (not just Saved)
- [ ] Webhook is registered (deactivate/activate if needed)
- [ ] Credentials are valid
- [ ] Input payload matches expected format

### Node-Level
- [ ] Check node input data (from previous node output)
- [ ] Verify expression syntax
- [ ] Check for `continueOnFail` / `alwaysOutputData` settings
- [ ] Verify direct node references exist in execution path

### Polling Loops
- [ ] TaskId stored in staticData or using direct node reference
- [ ] Status check handles multiple formats (`"success"`, `4`, `true`)
- [ ] Result extraction parses nested JSON if needed
- [ ] Timeout protection implemented

### Data Flow
- [ ] Nodes produce output (`alwaysOutputData: true` if needed)
- [ ] Connections are properly wired
- [ ] Branch conditions evaluate correctly

---

## 5. MCP Tools for Debugging

| Tool | Use Case |
|------|----------|
| `n8n_get_execution` | Get full execution data including errors |
| `n8n_get_executions` | List recent executions, filter by status |
| `n8n_get_workflow` | Get current workflow definition |
| `n8n_validate_workflow` | Check for structural issues |
| `n8n_analyze_execution_errors` | Pattern detection across failures |

---

## 6. Fix Deployment

After identifying the fix:

1. **Get workflow**: `n8n_get_workflow(id=WORKFLOW_ID)`
2. **Modify locally**: Edit JSON with fix
3. **Deploy**: `n8n_update_workflow(id=WORKFLOW_ID, workflowFilePath=PATH)`
4. **Activate**: `n8n_activate_workflow(id=WORKFLOW_ID)`
5. **Test**: Trigger new execution

---

## 7. Current Active Workflow

### SUB-VIDEO-MERGE-011-HARDENED
- **ID**: `stj8DmATqe66D9j4`
- **Purpose**: Real estate video generation pipeline
- **Key Stages**:
  1. Form/Webhook Trigger
  2. Floor Plan Analysis (Gemini)
  3. Exterior Photos (Zillow/Apify)
  4. Image-to-Video Generation (Kie.ai)
  5. Audio Generation (Kie.ai)
  6. Video Rendering (Racknerd)
  7. Notifications (Email/WhatsApp)

### Known Patterns in This Workflow
- Uses `GlobalSettings` for configuration
- Uses execution-scoped staticData for state
- Uses direct node references for polling
- Parses `resultJson` from Kie.ai responses
