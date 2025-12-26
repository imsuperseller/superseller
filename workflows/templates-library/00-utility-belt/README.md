# 🛠️ UTILITY BELT - Infrastructure Workflows

**Purpose**: Core infrastructure workflows used in EVERY client project
**Status**: ✅ Complete

---

## 📋 OVERVIEW

The Utility Belt contains essential workflows that should be included in every client project. These are the "foundation" workflows that handle error management, cost tracking, and human approvals.

---

## 🔧 WORKFLOWS

### 1. `util_error_handler.json`

**Purpose**: Centralized error handling and alerting

**Features**:
- Captures errors from any workflow
- Formats error information (workflow, node, stack trace)
- Sends Slack alert with "Fix it" link
- Optionally logs to Airtable

**Setup Required**:
- `SLACK_WEBHOOK_URL` environment variable
- `N8N_URL` environment variable (for fix links)
- `AIRTABLE_ERROR_LOG_BASE_ID` (optional, for logging)

**Usage**:
1. Import workflow into n8n
2. Configure environment variables
3. Connect Error Trigger from any workflow to this workflow

**Example Connection**:
```
Your Workflow
  └─ Error Trigger → util_error_handler
```

---

### 2. `util_cost_calculator.json`

**Purpose**: Track LLM API costs for accurate client billing

**Features**:
- Calculates cost from token usage
- Supports OpenAI and Anthropic pricing
- Logs to Google Sheets or Airtable
- Tracks by client, project, and workflow

**Input Format**:
```json
{
  "action": "calculate_cost",
  "payload": {
    "provider": "openai",
    "model": "gpt-4o",
    "inputTokens": 1000,
    "outputTokens": 500,
    "clientId": "client-123",
    "projectId": "project-456",
    "workflowId": "workflow-789"
  }
}
```

**Setup Required**:
- `GOOGLE_SHEETS_COST_TRACKER_ID` (for Google Sheets logging)
- OR `AIRTABLE_COST_TRACKER_BASE_ID` (for Airtable logging)

**Usage**:
Call this workflow via HTTP Request node after every LLM node execution:

```javascript
// In your workflow, after LLM node:
const costData = {
  action: "calculate_cost",
  payload: {
    provider: "openai",
    model: "gpt-4o",
    inputTokens: $json.usage?.prompt_tokens || 0,
    outputTokens: $json.usage?.completion_tokens || 0,
    clientId: "client-123",
    projectId: "project-456",
    workflowId: "{{ $workflow.id }}"
  }
};

// HTTP Request to util_cost_calculator webhook
```

---

### 3. `util_human_approval.json`

**Purpose**: Pause workflow for human review before critical actions

**Features**:
- Sends Slack message with Approve/Reject buttons
- Waits for webhook response
- Returns approved/rejected status
- Optional Airtable logging

**Input Format**:
```json
{
  "action": "request_approval",
  "payload": {
    "data": {
      "to": "customer@example.com",
      "subject": "Important Update",
      "body": "..."
    },
    "action": "Send email to customer",
    "requester": "sales-workflow",
    "timeout": 3600
  }
}
```

**Setup Required**:
- `SLACK_WEBHOOK_URL` environment variable
- `N8N_URL` environment variable (for approval links)
- `AIRTABLE_APPROVALS_BASE_ID` (optional)

**Usage**:
Call this workflow before critical actions:

```javascript
// Before sending important email:
const approvalRequest = {
  action: "request_approval",
  payload: {
    data: {
      to: "customer@example.com",
      subject: "Contract Proposal",
      body: "..."
    },
    action: "Send contract proposal email",
    requester: "{{ $workflow.name }}"
  }
};

// HTTP Request to util_human_approval webhook
// Wait for response
// If approved, continue; if rejected, stop
```

---

## 🚀 QUICK SETUP GUIDE

### Step 1: Import All Utilities

1. Import `util_error_handler.json`
2. Import `util_cost_calculator.json`
3. Import `util_human_approval.json`

### Step 2: Configure Environment Variables

Add to your n8n environment:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
N8N_URL=http://n8n.rensto.com
AIRTABLE_ERROR_LOG_BASE_ID=appXXXXX
GOOGLE_SHEETS_COST_TRACKER_ID=your-sheet-id
AIRTABLE_APPROVALS_BASE_ID=appXXXXX
```

### Step 3: Connect to Client Workflows

For each client workflow:

1. **Add Error Handling**:
   - Add Error Trigger node
   - Connect to `util_error_handler` workflow

2. **Add Cost Tracking**:
   - After each LLM node, call `util_cost_calculator`
   - Pass token usage data

3. **Add Human Approval** (where needed):
   - Before critical actions, call `util_human_approval`
   - Wait for approval before proceeding

---

## 📊 COST TRACKING PRICING

Current pricing (as of Dec 2025):

**OpenAI**:
- GPT-4o: $0.0025/1K input, $0.01/1K output
- GPT-4 Turbo: $0.01/1K input, $0.03/1K output
- GPT-3.5 Turbo: $0.0005/1K input, $0.0015/1K output
- Whisper: $0.006/minute

**Anthropic**:
- Claude 3.5 Sonnet: $0.003/1K input, $0.015/1K output
- Claude 3 Opus: $0.015/1K input, $0.075/1K output

**Note**: Update pricing in `util_cost_calculator.json` if prices change.

---

## 🔄 VERSION UPDATES

When updating these workflows:

1. **Test in Draft mode** first
2. **Update pricing** if needed
3. **Publish** updated version
4. **Update documentation**

All client workflows using these utilities will automatically use the new published version.

---

## 📝 BEST PRACTICES

1. **Always use error handling**: Connect Error Trigger to `util_error_handler` in every workflow
2. **Track all LLM costs**: Call `util_cost_calculator` after every LLM node
3. **Get approval for critical actions**: Use `util_human_approval` before:
   - Sending emails to customers
   - Posting to social media
   - Making financial transactions
   - Deleting data

---

**Next**: See `../IMPLEMENTATION_GUIDE.md` for how to use these in client projects.
