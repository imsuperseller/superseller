# Tax4Us: context7 Memory System - Manual Implementation Guide

**Date**: October 8, 2025, 9:30 PM
**Status**: ⚠️ Requires Manual Implementation
**Reason**: API limitations prevent programmatic workflow creation
**Time Required**: 30-45 minutes

---

## 🎯 WHAT YOU NEED TO DO

We've successfully fixed the rate limiting issues in Agent 1 & Agent 3 (✅ COMPLETE). Now we need to implement the context7 memory system to prevent duplicate content.

**Problem**: The MCP API doesn't support creating new workflows programmatically on n8n Cloud.

**Solution**: Manual implementation following this step-by-step guide.

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Verify Existing Workflow (5 minutes)

1. Log into Tax4Us n8n Cloud: https://tax4usllc.app.n8n.cloud

2. Search for existing context7 workflow:
   - Click "Workflows" in left sidebar
   - Search for: "context7" OR "memory" OR workflow ID "ycPU7mVTyEJhMUi2"

3. **If workflow EXISTS**:
   - ✅ Skip to Phase 3 (Test & Connect)
   - Note the workflow ID

4. **If workflow DOESN'T exist**:
   - ⚠️ Continue to Phase 2 (Build from scratch)

---

### Phase 2: Build context7 Workflow (20 minutes)

**Option A: Import from JSON** (Recommended - 5 minutes)

1. Download the workflow JSON (created in next section of this guide)

2. In n8n UI:
   - Click "Workflows" → "Import from File"
   - Select `context7-workflow.json`
   - Click "Import"

3. Configure Upstash Redis credential (see Phase 2B below)

4. Activate the workflow

**Option B: Build Manually** (20 minutes)

If JSON import doesn't work, follow these steps:

#### Step 1: Create New Workflow
- Click "+ New Workflow"
- Name: "Tax4Us - context7 Memory System"

#### Step 2: Add Webhook Trigger
- Add node: "Webhook"
- Configuration:
  - HTTP Method: POST
  - Path: `context7`
  - Response Mode: "When Last Node Finishes"
  - Response Data: "Last Node"

#### Step 3: Add Switch Node
- Add node: "Switch"
- Connect from Webhook
- Add 3 routes:
  - Route 1: `{{ $json.action === "fetch" }}`
  - Route 2: `{{ $json.action === "save" }}`
  - Route 3: `{{ $json.action === "clear" }}`

#### Step 4: Add FETCH Branch (Route 1)

**Node 1: HTTP Request - Fetch History**
- Method: GET
- URL: `https://api.upstash.com/lrange/{{ $json.key }}/0/{{ $json.limit || 20 }}`
- Authentication: "Predefined Credential Type" → "Upstash Redis API"
- Header Name: `Authorization`
- Header Value: `Bearer {{ $credentials.upstashRedis.token }}`

**Node 2: Format Fetch Response**
- Type: Code
- Code:
```javascript
const result = $input.first().json.result || [];
return [{
  json: {
    success: true,
    action: 'fetch',
    key: $('Switch').item.json.key,
    data: result,
    count: result.length
  }
}];
```

#### Step 5: Add SAVE Branch (Route 2)

**Node 1: HTTP Request - Save Topic**
- Method: POST
- URL: `https://api.upstash.com/lpush/{{ $json.key }}`
- Authentication: Upstash Redis API
- Body:
```json
{
  "value": "{{ $json.value }}"
}
```

**Node 2: HTTP Request - Trim List**
- Method: POST
- URL: `https://api.upstash.com/ltrim/{{ $json.key }}/0/19`
- Authentication: Upstash Redis API
- Purpose: Keep only last 20 items

**Node 3: Format Save Response**
- Type: Code
- Code:
```javascript
return [{
  json: {
    success: true,
    action: 'save',
    key: $('Switch').item.json.key,
    value: $('Switch').item.json.value,
    message: 'Topic saved to history'
  }
}];
```

#### Step 6: Add CLEAR Branch (Route 3)

**Node 1: HTTP Request - Clear History**
- Method: POST
- URL: `https://api.upstash.com/del/{{ $json.key }}`
- Authentication: Upstash Redis API

**Node 2: Format Clear Response**
- Type: Code
- Code:
```javascript
return [{
  json: {
    success: true,
    action: 'clear',
    key: $('Switch').item.json.key,
    message: 'History cleared'
  }
}];
```

#### Step 7: Add Respond to Webhook
- Add node: "Respond to Webhook"
- Connect all 3 branch outputs to this node
- Response: `{{ $json }}`

#### Step 8: Save & Activate
- Click "Save"
- Toggle workflow to "Active"
- Copy the webhook URL (should be: `https://tax4usllc.app.n8n.cloud/webhook/context7`)

---

### Phase 3: Configure Upstash Redis (10 minutes)

#### Option A: Use Existing Upstash Account

If you already have Upstash Redis set up:

1. Get your Upstash Redis REST token:
   - Go to: https://console.upstash.com
   - Select your database
   - Click "REST API" tab
   - Copy the token (starts with "Bearer ...")

2. In n8n:
   - Go to "Credentials" in left sidebar
   - Click "+ Add Credential"
   - Search for "HTTP Header Auth"
   - Name: "Upstash Redis API"
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_TOKEN_HERE`
   - Click "Save"

#### Option B: Create New Upstash Account (If needed)

1. Go to: https://console.upstash.com
2. Sign up (free tier available)
3. Create new Redis database:
   - Name: "tax4us-memory"
   - Region: Choose closest to your n8n instance
   - Plan: Free tier is sufficient
4. Get REST API token (see Option A above)
5. Configure in n8n (see Option A above)

---

### Phase 4: Test context7 Workflow (5 minutes)

#### Test 1: Fetch Empty History

**Request**:
```bash
curl -X POST https://tax4usllc.app.n8n.cloud/webhook/context7 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "fetch",
    "key": "tax4us:blog:history",
    "limit": 20
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "action": "fetch",
  "key": "tax4us:blog:history",
  "data": [],
  "count": 0
}
```

#### Test 2: Save Topic

**Request**:
```bash
curl -X POST https://tax4usllc.app.n8n.cloud/webhook/context7 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "save",
    "key": "tax4us:blog:history",
    "value": "Test Topic: 2025 Tax Filing Deadlines"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "action": "save",
  "key": "tax4us:blog:history",
  "value": "Test Topic: 2025 Tax Filing Deadlines",
  "message": "Topic saved to history"
}
```

#### Test 3: Fetch History (Should Have Data)

Repeat Test 1 - should now return:
```json
{
  "success": true,
  "action": "fetch",
  "key": "tax4us:blog:history",
  "data": ["Test Topic: 2025 Tax Filing Deadlines"],
  "count": 1
}
```

✅ **If all 3 tests pass, context7 is working!**

---

## 🔗 CONNECTING AGENTS TO context7

Now that context7 works, we need to connect all 4 agents to it.

### For EACH Agent (4 total):

1. **Agent 1** (ID: zQIkACTYDgaehp6S - Blog Content Generator)
2. **Agent 2** (ID: 3HrunP4OmMNNdNq7 - Pages & FAQ Generator)
3. **Agent 3** (ID: GpFjZNtkwh1prsLT - Social Media Content)
4. **Agent 4** (ID: GGDoM591l7Pg2fST - Content Generation Pipeline)

### Add 2 Nodes to Each Agent:

#### Node 1: Fetch History (BEFORE content generation)

**Position**: After Airtable trigger, BEFORE OpenAI/content generation

**Node Type**: Execute Workflow

**Configuration**:
- Workflow: "Tax4Us - context7 Memory System"
- Source: "Workflow ID" (use the ID of context7 workflow)
- Parameters:
```json
{
  "action": "fetch",
  "key": "tax4us:AGENT_TYPE:history",
  "limit": 20
}
```

**Memory Keys** (use correct one for each agent):
- Agent 1: `tax4us:blog:history`
- Agent 2: `tax4us:pages:history`
- Agent 3: `tax4us:social:history`
- Agent 4: `tax4us:podcast:history`

**Update OpenAI Prompt**: Add this to the system prompt:
```
IMPORTANT: Avoid these previous topics:
{{ $('Execute Workflow - Fetch History').item.json.data.join(', ') }}

Generate fresh, unique content that differs from these topics.
```

#### Node 2: Save History (AFTER content published)

**Position**: After WordPress/Social publish, BEFORE final notification

**Node Type**: Execute Workflow

**Configuration**:
- Workflow: "Tax4Us - context7 Memory System"
- Source: "Workflow ID"
- Parameters:
```json
{
  "action": "save",
  "key": "tax4us:AGENT_TYPE:history",
  "value": "{{ $json.title || $json.topic || $json.subject }}"
}
```

---

## 📊 INTEGRATION CHECKLIST

### Agent 1: Blog Content Generator
- [ ] context7 workflow ID obtained
- [ ] "Fetch History" node added (before OpenAI)
- [ ] Memory key: `tax4us:blog:history`
- [ ] OpenAI prompt updated with duplicate prevention
- [ ] "Save History" node added (after WordPress publish)
- [ ] Tested with sample blog post
- [ ] No duplicate topics generated

### Agent 2: Pages & FAQ Generator
- [ ] context7 workflow ID obtained
- [ ] "Fetch History" node added (before OpenAI)
- [ ] Memory key: `tax4us:pages:history`
- [ ] OpenAI prompt updated with duplicate prevention
- [ ] "Save History" node added (after WordPress publish)
- [ ] Tested with sample page
- [ ] No duplicate pages generated

### Agent 3: Social Media Content
- [ ] context7 workflow ID obtained
- [ ] "Fetch History" node added (before LangChain agents)
- [ ] Memory key: `tax4us:social:history`
- [ ] LangChain prompt updated with duplicate prevention
- [ ] "Save History" node added (after social publish)
- [ ] Tested with sample post
- [ ] No duplicate posts generated

### Agent 4: Content Generation Pipeline
- [ ] context7 workflow ID obtained
- [ ] "Fetch History" node added (in Research phase)
- [ ] Memory key: `tax4us:podcast:history`
- [ ] OpenAI prompt updated with duplicate prevention
- [ ] "Save History" node added (in Verify Publish phase)
- [ ] Tested with sample episode
- [ ] No duplicate episodes generated

---

## ✅ SUCCESS CRITERIA

After completing all steps:

1. **context7 workflow**:
   - ✅ Active and responding to webhook calls
   - ✅ All 3 tests pass (fetch, save, verify)
   - ✅ Upstash Redis storing data correctly

2. **All 4 agents connected**:
   - ✅ Each agent has "Fetch History" node
   - ✅ Each agent has "Save History" node
   - ✅ OpenAI/LangChain prompts updated
   - ✅ Correct memory keys used

3. **Duplicate prevention working**:
   - ✅ Test each agent twice with same topic
   - ✅ Second attempt generates different content
   - ✅ Memory persists across executions

---

## 🚨 TROUBLESHOOTING

### Issue 1: "Workflow not found" when executing

**Cause**: context7 workflow is inactive or ID is wrong

**Fix**:
1. Verify context7 workflow is ACTIVE
2. Copy the exact workflow ID
3. Update Execute Workflow nodes with correct ID

### Issue 2: "Authentication failed" in Upstash

**Cause**: Redis credential not configured or token is wrong

**Fix**:
1. Check Upstash console for correct token
2. Verify token includes "Bearer " prefix
3. Test token with curl:
```bash
curl -X GET https://api.upstash.com/ping \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue 3: Topics not being saved

**Cause**: "Save History" node parameters incorrect

**Fix**:
1. Check the value being passed: `{{ $json.title }}`
2. Verify the field exists in previous node output
3. Try hardcoded test value first: `"Test Topic"`

### Issue 4: Duplicate content still generated

**Cause**: OpenAI prompt not reading history correctly

**Fix**:
1. Check "Fetch History" node output in execution log
2. Verify OpenAI prompt is accessing: `$('Execute Workflow - Fetch History').item.json.data`
3. Test with manual execution to see if prompt receives data

---

## 📞 NEED HELP?

If you encounter issues:

1. **Check n8n execution logs**:
   - Click "Executions" in left sidebar
   - Find failed execution
   - Review error messages

2. **Check Upstash console**:
   - Go to: https://console.upstash.com
   - Select your database
   - Click "Data Browser"
   - Verify keys exist: `tax4us:blog:history`, etc.

3. **Contact support**:
   - Email: shai@rensto.com
   - Include: Workflow ID, error message, execution ID

---

## ⏱️ TIME ESTIMATE

- **Phase 1** (Verify): 5 minutes
- **Phase 2** (Build): 20 minutes (or 5 min if importing JSON)
- **Phase 3** (Configure Upstash): 10 minutes
- **Phase 4** (Test): 5 minutes
- **Phase 5** (Connect 4 agents): 10 minutes (2.5 min per agent)

**Total**: 45-50 minutes

---

## 📄 RELATED FILES

- `context7-workflow.json` - Workflow to import (next file)
- `CONTEXT7_INTEGRATION_EXAMPLES.md` - Detailed examples for each agent
- `CURRENT_STATUS_AND_FIXES_NEEDED.md` - Original investigation report

---

**Created**: October 8, 2025, 9:30 PM
**Status**: Ready for implementation
**Next Steps**: Follow Phase 1 checklist above
