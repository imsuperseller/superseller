# Agent 1: WordPress Blog - Implementation Guide

**Workflow**: WF: Blog Master - AI Content Pipeline (zQIkACTYDgaehp6S)
**Date**: October 8, 2025
**Time to Implement**: 2-3 hours

---

## Overview

This guide walks through adding 3 optimizations to the existing Agent 1 workflow:
1. **context7 memory** - Remember previous blog topics
2. **Slack approval workflow** - Ben reviews before publishing
3. **Enhanced Slack notifications** - Notify on all key events

**Important**: We're EDITING the existing workflow, not creating a new one.

---

## Current Workflow Structure

```
Airtable Trigger
  ↓
Code: Prefilter & Exec ID
  ↓
IF: Should Process?
  ↓ YES                           ↓ NO
Code: Build Research Payload      Airtable: Update Rejected
  ↓                                 ↓
HTTP: Tavily Research            Slack: Notify Rejection
  ↓
Code: Build AI Payload
  ↓
OpenAI: Generate Content
  ↓
Code: Validate JSON
  ↓
HTTP: Check Post Exists
  ↓
IF: Create or Update?
  ↓ CREATE              ↓ UPDATE
WordPress: Create     WordPress: Update
  ↓                     ↓
  → Code: Merge WP Data ←
         ↓
    Airtable: Update Drafted
         ↓
    Gmail: Notify Success
```

---

## New Workflow Structure (After Optimizations)

```
Airtable Trigger
  ↓
Code: Prefilter & Exec ID
  ↓
IF: Should Process?
  ↓ YES                                    ↓ NO
🆕 HTTP: context7 Fetch History           Airtable: Update Rejected
  ↓                                         ↓
Code: Build Research Payload             Slack: Notify Rejection
  ↓
HTTP: Tavily Research
  ↓
Code: Build AI Payload (with context)
  ↓
OpenAI: Generate Content
  ↓
Code: Validate JSON
  ↓
🆕 Slack: Content Ready for Review
  ↓
🆕 Wait: 24 hours for approval
  ↓ APPROVED                               ↓ REJECTED / TIMEOUT
HTTP: Check Post Exists                   🆕 Slack: Reminder (if timeout)
  ↓                                         ↓
IF: Create or Update?                     🆕 Wait: 24 more hours
  ↓ CREATE              ↓ UPDATE            ↓
WordPress: Create     WordPress: Update   Auto-approve (48hr total)
  ↓                     ↓
  → Code: Merge WP Data ←
         ↓
    Airtable: Update Published
         ↓
    🆕 HTTP: context7 Save Context
         ↓
    🆕 Slack: Content Published
```

---

## Prerequisites

Before starting, ensure you have:
- [ ] Upstash Redis account (for context7)
- [ ] Upstash Redis URL and token
- [ ] Slack workspace with bot token
- [ ] Access to Tax4Us n8n Cloud: https://tax4usllc.app.n8n.cloud

---

## Step 1: Add context7 Fetch Node (15 minutes)

### 1.1 Add HTTP Request Node

1. Open workflow: https://tax4usllc.app.n8n.cloud/workflow/zQIkACTYDgaehp6S
2. Click between "IF: Should Process?" (YES output) and "Code: Build Research Payload"
3. Click **"+"** to add node
4. Search for "HTTP Request"
5. Configure:
   - **Method**: POST
   - **URL**: `https://your-upstash-url.upstash.io`
   - **Authentication**: Header Auth
   - **Header Name**: Authorization
   - **Header Value**: `Bearer YOUR_UPSTASH_TOKEN`
   - **Body**: JSON
   - **JSON**:
     ```json
     {
       "command": "GET",
       "args": ["tax4us:blog:history"]
     }
     ```

6. **Name**: `HTTP: context7 Fetch History`

### 1.2 Update "Code: Build Research Payload"

Modify the code node to include context7 history in the research query:

```javascript
// Get previous topics from context7
const previousTopics = $input.first().json.result || [];

// Get current topic from Airtable
const topic = $json.topic || '';
const keywords = $json.keywords || '';

// Build Tavily payload with context awareness
const tavilyPayload = {
  api_key: 'YOUR_TAVILY_API_KEY',
  query: `${topic} ${keywords}`,
  search_depth: 'advanced',
  max_results: 5,
  exclude_domains: previousTopics.length > 0
    ? ['already covered: ' + previousTopics.join(', ')]
    : []
};

return {
  json: {
    ...($json),
    tavilyPayload: JSON.stringify(tavilyPayload),
    previousTopics
  }
};
```

---

## Step 2: Add Slack Approval Workflow (45-60 minutes)

### 2.1 Add Slack Preview Node

1. After "Code: Validate JSON" node
2. Add **Slack** node
3. Configure:
   - **Resource**: Message
   - **Operation**: Post
   - **Authentication**: OAuth2 (use existing Tax4Us Slack credential)
   - **Channel**: #content-review (or DM to Ben)
   - **Message**:
     ```
     🔵 Blog Post Ready for Review

     📄 Title: {{ $json.pageContent.title }}
     📝 Word Count: {{ $json.pageContent.content.length }}
     🔗 Slug: tax4us.co.il/{{ $json.pageContent.slug }}

     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     📋 PREVIEW:

     {{ $json.pageContent.content.substring(0, 500) }}...

     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
     ⏱️ This approval expires in 24 hours
     ```
   - **Attachments**: Add buttons
     - Button 1: Text "✅ Approve & Publish", Value "approve", Style "primary"
     - Button 2: Text "❌ Reject", Value "reject", Style "danger"

4. **Name**: `Slack: Content Ready for Review`

### 2.2 Add Wait Node

1. After Slack preview node
2. Add **Wait** node
3. Configure:
   - **Resume**: On webhook call
   - **Webhook Method**: POST
   - **Webhook Path**: `blog-approval-{{ $json.execId }}`
   - **Resume On**: First item
   - **Options**:
     - Max Wait Time: 24 hours
     - On Timeout: Continue with first input item

4. **Name**: `Wait: Approval (24 hours)`

### 2.3 Add IF Node (Approval Check)

1. After Wait node
2. Add **IF** node
3. Configure:
   - **Condition**: `{{ $json.body.action }}` equals "approve"

4. **Name**: `IF: Approved?`
5. Connect:
   - **TRUE** output → "HTTP: Check Post Exists"
   - **FALSE** output → New Slack reminder node (next step)

### 2.4 Add Slack Reminder Node (for timeout)

1. After IF: Approved? (FALSE output)
2. Add **Slack** node
3. Configure:
   - **Message**:
     ```
     ⚠️ Blog Post Approval Reminder

     You haven't responded to the blog post approval request.

     Title: {{ $json.pageContent.title }}

     This will auto-approve in 24 hours if no response.
     ```

4. **Name**: `Slack: Approval Reminder`

### 2.5 Add Second Wait Node (24 more hours)

1. After Slack reminder
2. Add **Wait** node (same config as first wait)
3. **Name**: `Wait: Final Approval (24 hours)`
4. Connect output → "HTTP: Check Post Exists"

---

## Step 3: Add context7 Save Node (10 minutes)

### 3.1 Add HTTP Request Node After Airtable Update

1. After "Airtable: Update Drafted" node
2. Add **HTTP Request** node
3. Configure:
   - **Method**: POST
   - **URL**: `https://your-upstash-url.upstash.io`
   - **Authentication**: Header Auth (same as fetch)
   - **Body**: JSON
   - **JSON**:
     ```json
     {
       "command": "LPUSH",
       "args": [
         "tax4us:blog:history",
         "{{ $json.pageContent.title }}"
       ]
     }
     ```

4. **Name**: `HTTP: context7 Save Context`

---

## Step 4: Replace Gmail with Slack Notification (10 minutes)

### 4.1 Update Final Notification

1. Delete "Gmail: Notify Success" node
2. Add **Slack** node after context7 save
3. Configure:
   - **Message**:
     ```
     ✅ Blog Post Published

     📄 Title: {{ $json.pageContent.title }}
     🔗 URL: {{ $json.pageUrl }}
     📊 Word Count: {{ $json.pageContent.content.length }}

     🎯 WordPress ID: {{ $json.pageId }}
     ⏱️ Published at: {{ $now.toISO() }}
     ```

4. **Name**: `Slack: Content Published`

---

## Step 5: Update Airtable Status Field (5 minutes)

### 5.1 Change "Update Drafted" to "Update Published"

1. Edit "Airtable: Update Drafted" node
2. Change the status field update:
   - **Old**: Status = "Drafted"
   - **New**: Status = "Published" (only after approval)

3. **Name**: Change to `Airtable: Update Published`

---

## Step 6: Add Rejection Handling (Optional, 15 minutes)

If Ben clicks "Reject", you can add a feedback loop:

1. After IF: Approved? (FALSE output), before reminder
2. Add **IF** node:
   - **Condition**: `{{ $json.body.action }}` equals "reject"

3. **TRUE** output:
   - Add Slack node: "What changes do you need?"
   - Add Wait node for Ben's response
   - Loop back to "OpenAI: Generate Content" with feedback

4. **FALSE** output (timeout):
   - Continue to reminder flow

---

## Step 7: Test the Workflow (30 minutes)

### 7.1 Create Test Record in Airtable

1. Open Airtable: Content_Specs table
2. Create new record:
   - **Topic**: "Test: Deductions for Small Business"
   - **Status**: "Ready for Draft"
   - **Keywords**: "tax, deductions, small business"

### 7.2 Monitor Execution

1. Watch workflow execution in n8n
2. Check Slack for preview message
3. Click "Approve" button
4. Verify:
   - WordPress draft created
   - Airtable status = "Published"
   - context7 history saved
   - Slack success notification sent

### 7.3 Test Timeout Flow

1. Create another test record
2. Don't click approval buttons
3. Wait for reminder (or reduce wait time to 1 minute for testing)
4. Verify auto-approval after 48 hours

---

## Step 8: Activate Workflow

Once testing is complete:

1. Click "Active" toggle in top right
2. Workflow is now live and will:
   - Poll Airtable every minute
   - Generate blog content
   - Request approval from Ben
   - Auto-publish after 48 hours if no response

---

## Troubleshooting

### Issue: context7 returns empty history

**Solution**: Check Upstash URL and token, verify Redis key name

### Issue: Slack buttons don't work

**Solution**: Ensure Slack bot has `chat:write` and `im:write` permissions

### Issue: Wait node doesn't resume

**Solution**: Check webhook path is correct, test webhook URL manually

### Issue: WordPress post fails to create

**Solution**: Check WordPress API credentials, verify site is accessible

---

## Final Workflow Metrics

**Before Optimization**:
- 17 nodes
- No human approval
- No conversation memory
- Only rejection notifications

**After Optimization**:
- ~25 nodes
- ✅ Human approval required
- ✅ context7 memory (avoid topic repetition)
- ✅ Comprehensive Slack notifications
- ✅ 24-hour approval window with reminder
- ✅ Auto-approve after 48 hours (fallback)

---

## Next Steps

After Agent 1 is optimized:
1. Update Agent 1 note in Boost.space (ID: 289) with completion status
2. Move to Agent 3 adaptation (Hebrew content + Tax4Us branding)
3. Build Agent 2 (WordPress Pages)
4. Build Agent 4 (Autonomous Podcast)

---

**Created**: October 8, 2025
**Status**: Ready to implement
**Estimated Time**: 2-3 hours
