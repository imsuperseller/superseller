# Directive: n8n Debugging & Error Handling

**Purpose**: Provide a systematic approach to diagnosing, fixing, and preventing workflow failures.

**Last Updated**: February 2026  
**Target Version**: n8n 2.4.6

## 1. Debugging Methodology

### The Setup
- **Execution Model**: Data flows as `[{ "json": {...} }]`. Nodes iterate over items.
- **n8n 2.x**: Code nodes run in Task Runners (isolated), `process.env` blocked by default.
- **Logs**: Enable "Save Failed Executions" for production auditing.

### Tools
1. **MCP Tools** (Recommended):
   - `n8n_get_execution` - Get full execution data with errors
   - `n8n_analyze_execution_errors` - Pattern detection
   - `n8n_validate_workflow` - Structural validation
2. **Debug in Editor**:
   - Load data from a failed execution directly into the canvas.
   - Fix the node, then execute it with the loaded data to verify.
3. **Pin Data**:
   - Freeze output of a node during development to save API calls.
4. **Manual Execution**:
   - **Execute Workflow**: Full run.
   - **Execute Step**: Single node (requires preceding data).

## 2. Error Handling Patterns

### Global Error Handler
-   **Configuration**: Set "Error Workflow" in Workflow Settings to `INT-TECH-ERR-HANDLER`.
-   **Trigger**: Use `Error Trigger` node (captures `execution.id`, `error.message`, etc.).
-   **Action**: Log to Slack/PagerDuty/Data Table.

### Node-Level Handling
-   **Settings**: "On Error" -> "Continue (using error output)".
-   **Pattern**: Create an error branch from the node (Try/Catch logic).

### Retry Logic
-   **Auto-Retry**: Enable "Retry On Fail" in settings (Max Tries: 3-5, Wait: 5000ms).
-   **Manual Loop**: For complex backoff, use a Loop + Wait node.
    -   Use `runOnceForEachItem` to manage retry counters.

## 3. Common Error Codes

| Code | Meaning | Fix |
| :--- | :--- | :--- |
| **400** | Bad Request | Check JSON format and required fields. |
| **401** | Unauthorized | Refresh credentials/Reconnect OAuth. |
| **429** | Rate Limit | Enable "Split In Batches" + Wait node. |
| **5xx** | Server Error | Implement Retry on Fail. |

## 4. Testing Strategies

### Test Scenarios
-   **Edge Cases**: Use `Edit Fields` node to inject: `null`, `[]` (empty array), `undefined`.
-   **Mocking**: Use `Debug Helper` node to generate random user data or throw simulated errors.

### Local Webhooks
-   Use `ngrok` to expose local n8n instances for webhook testing.
-   `curl` payloads to test webhook triggers with various JSON bodies.

## 5. Performance
-   **Memory**: Large payloads (base64 images) crash the process (~180MB default limit).
-   **Fix**:
    -   Use `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`.
    -   Process in batches (Split In Batches: 50 items).
    -   Use dedicated heavy-lifting tools (e.g., ImageMagick via CLI) instead of JS nodes for massive files if possible.
