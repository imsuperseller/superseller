# Tax4Us: 4 AI Agents - Testing Guide

**Created**: October 8, 2025
**Last Updated**: October 8, 2025, 5:00 PM
**Status**: Ready for Testing - All Workflows Active
**Build Phase**: ✅ 100% Complete
**Configuration Phase**: ✅ 100% Complete (All credentials, Show ID, and activations done)
**Testing Phase**: ⏳ 0% Complete (Awaiting Ben to begin testing)

---

## Current System Status

### Workflow Activation Status (as of Oct 8, 2025 5:00 PM)

| Agent | Workflow ID | Status | Nodes | Credentials | Action Required |
|-------|-------------|--------|-------|-------------|-----------------|
| **Agent 1** | zQIkACTYDgaehp6S | ✅ ACTIVE | 21 | 12 configured | Ready for testing |
| **Agent 2** | 3HrunP4OmMNNdNq7 | ✅ ACTIVE | 16 | 10 configured | Ready for testing |
| **Agent 3** | GpFjZNtkwh1prsLT | ✅ ACTIVE | 39 | 16 configured | Ready for testing |
| **Agent 4 - Scheduler** | wNV24WNtaEmAFXDy | ✅ ACTIVE | 17 | 10 configured | Ready for testing |
| **Agent 4 - Pipeline** | GGDoM591l7Pg2fST | ✅ ACTIVE | 29 | 17 configured | Ready for testing |

**Total**: 5 workflows, 138 nodes, 65 credentials configured

---

## CRITICAL: Pre-Testing Requirements

### 1. Workflow Activation ✅ COMPLETE

✅ **All 5 workflows are now ACTIVE**

All workflows have been successfully activated in the correct order:
1. ✅ Agent 2: WordPress Pages
2. ✅ Agent 4 - Pipeline: Content Pipeline (webhook receiver)
3. ✅ Agent 4 - Scheduler: Weekly Scheduler (webhook sender)

### 2. Captivate.fm Show ID ✅ COMPLETE

✅ **Show ID has been configured in Agent 4 Pipeline**

**Configured Show ID**: 45191a59-cf43-4867-83e7-cc2de0c5e780

All Captivate.fm credentials and Show ID have been properly configured in:
- Workflow: https://tax4usllc.app.n8n.cloud/workflow/GGDoM591l7Pg2fST
- Node: "Captivate: Upload & Schedule"
- API URL: `https://api.captivate.fm/shows/45191a59-cf43-4867-83e7-cc2de0c5e780/episodes`

✅ **Agent 4 is ready for full testing**

### 3. ACF REST API Verification (Recommended for Agent 2)

**Required Steps**:
1. Log into tax4us.co.il WordPress admin
2. Go to Plugins → Verify "Advanced Custom Fields" is active
3. Go to Settings → Permalinks → Ensure "Post name" is selected
4. Test ACF REST API endpoint:
   ```bash
   curl -u "username:application_password" \
     "https://tax4us.co.il/wp-json/wp/v2/pages?_fields=id,title,acf"
   ```
5. Should return JSON with ACF fields

---

## Testing Plan

### Phase 1: Individual Agent Testing (4-5 hours)

#### Test 1.1: Agent 1 - WordPress Blog

**Purpose**: Verify optimized blog workflow with context7 memory and Slack approval

**Prerequisites**:
- ✅ Already active
- ❌ Recent error (ID: 6149) - needs investigation

**Test Steps**:
1. Add test record to Airtable:
   - Base: Tax4Us Content (appkZD1ew4aKoBqDM)
   - Table: Content_Specs (tbl01234567890123)
   - Fields:
     - Title: "Test Post: 2025 Tax Filing Deadlines"
     - Type: "Blog Post"
     - Status: "Ready"
     - Target Date: Today

2. Wait 30 seconds for Airtable trigger

3. Expected Behavior:
   - context7 fetches previous 20 blog topics
   - Tavily researches trending tax topics
   - OpenAI generates blog post
   - Slack notification sent: "Blog post ready for approval"
   - Wait node holds for 24 hours or approval
   - If approved: Publishes to WordPress
   - context7 saves topic to prevent duplication
   - Slack notification: "Blog post published"

4. Verify:
   - [ ] Airtable trigger fired
   - [ ] context7 fetch worked (check execution log)
   - [ ] Tavily research completed
   - [ ] OpenAI generated content
   - [ ] Slack approval message received
   - [ ] Approve via Slack button
   - [ ] WordPress post created/updated
   - [ ] context7 saved topic
   - [ ] Final Slack notification sent

5. Check for Errors:
   - If error occurs, note execution ID
   - Open: https://tax4usllc.app.n8n.cloud/executions/{execution_id}
   - Screenshot error and send to Shai

**Expected Time**: 30 minutes (including 24hr wait simulation)

---

#### Test 1.2: Agent 2 - WordPress Pages

**Purpose**: Verify new pages workflow with ACF integration

**Prerequisites**:
- ⚠️ Must be activated first (see above)
- ✅ WordPress + Tavily credentials configured

**Test Steps**:
1. Add test record to Airtable:
   - Base: Tax4Us Content (appkZD1ew4aKoBqDM)
   - Table: Content_Specs (same as Agent 1)
   - Fields:
     - Title: "Test Service: Business Tax Preparation"
     - Type: "Service Page"
     - Status: "Ready"
     - Target Date: Today

2. Wait 30 seconds for Airtable trigger

3. Expected Behavior:
   - Airtable trigger fires
   - context7 fetches previous 20 pages
   - Tavily researches tax service information
   - OpenAI generates page content + ACF fields
   - Code node builds ACF payload
   - HTTP node checks if page exists
   - If not exists: Creates new page via WordPress API
   - If exists: Updates existing page
   - HTTP node updates ACF fields
   - Slack notification sent: "Page ready for approval"
   - Wait node holds for approval
   - If approved: Page stays published
   - context7 saves topic
   - Slack notification: "Page published"
   - Airtable updated with WordPress URL

4. Verify:
   - [ ] Airtable trigger fired
   - [ ] context7 fetch worked
   - [ ] Tavily research completed
   - [ ] OpenAI generated content
   - [ ] ACF payload built correctly (check execution log)
   - [ ] Page created/updated in WordPress
   - [ ] ACF fields populated (check page in WordPress admin)
   - [ ] Slack approval message received
   - [ ] Approve via Slack
   - [ ] context7 saved topic
   - [ ] Airtable updated with URL
   - [ ] Final Slack notification sent

5. Verify ACF Fields on WordPress:
   - Go to: https://tax4us.co.il/wp-admin/post.php?post={page_id}&action=edit
   - Scroll down to ACF field groups
   - Verify all custom fields populated correctly

**Expected Time**: 45 minutes

---

#### Test 1.3: Agent 3 - Social Media (Hebrew + English)

**Purpose**: Verify bilingual social media posts with branding

**Prerequisites**:
- ✅ Already active
- ❌ Recent errors (ID: 6145, 6146) - needs investigation
- ✅ Hebrew system prompts configured

**Test Steps**:
1. Add test record to Airtable:
   - Base: Tax4Us Content (appkZD1ew4aKoBqDM)
   - Table: Social_Posts or Content_Specs (check which table Agent 3 uses)
   - Fields:
     - Title: "Test Post: Tax Deductions for Small Business"
     - Platform: "LinkedIn"
     - Status: "Ready"
     - Target Date: Today

2. Wait 30 seconds for Airtable trigger

3. Expected Behavior:
   - Airtable trigger fires
   - context7 fetches previous 20 social posts
   - SerpAPI or Tavily researches topic
   - 8 LangChain AI agents process content:
     1. Research Agent (finds trending topics)
     2. Content Agent (generates post copy)
     3. Hebrew Translation Agent (creates עברית version)
     4. Platform Optimization Agent (formats for LinkedIn)
     5. Hashtag Agent (generates relevant hashtags)
     6. Image Agent (suggests/generates visuals)
     7. CTA Agent (creates call-to-action)
     8. Compliance Agent (ensures Tax4Us branding + compliance)
   - Bilingual output generated (Hebrew first, then English)
   - Slack notification: "Social post ready for approval"
   - Wait node holds for approval
   - If approved: Posts to LinkedIn (or Facebook)
   - context7 saves topic
   - Slack notification: "Post published"

4. Verify Bilingual Output:
   - [ ] Hebrew version included (🇮🇱 עברית label)
   - [ ] English version included (🇺🇸 English label)
   - [ ] Both versions convey same message
   - [ ] Hebrew is natural (not Google Translate style)
   - [ ] Tax4Us branding present in both
   - [ ] Hashtags relevant to tax/finance
   - [ ] Disclaimers included
   - [ ] Contact info present

5. Verify:
   - [ ] Airtable trigger fired
   - [ ] context7 fetch worked
   - [ ] All 8 AI agents executed
   - [ ] Bilingual content generated
   - [ ] Slack approval message received
   - [ ] Approve via Slack
   - [ ] Post published to LinkedIn/Facebook
   - [ ] context7 saved topic
   - [ ] Final Slack notification sent

**Expected Time**: 1 hour

---

#### Test 1.4: Agent 4 - Autonomous Podcast

**Purpose**: Verify dual-workflow podcast production pipeline

**Prerequisites**:
- ✅ Both workflows activated
- ✅ Captivate Show ID configured
- ✅ Tavily, ElevenLabs, Captivate credentials configured

**Test Steps**:

**Part A: Scheduler Workflow Test** (Workflow 1)

1. Open: https://tax4usllc.app.n8n.cloud/workflow/wNV24WNtaEmAFXDy
2. Click "Test workflow" button (manual trigger)
3. Expected Behavior:
   - Manual trigger fires
   - Schedule node determines current cycle phase (Monday/Tuesday/Wednesday/Thursday)
   - Based on phase, fires appropriate webhook to Content Pipeline
   - For Monday 10am: Sends webhook to "Webhook: Start Research"
   - Pipeline receives webhook and starts research

4. Verify:
   - [ ] Manual trigger successful
   - [ ] Schedule calculated correctly (check execution log)
   - [ ] Webhook URL correct (points to Pipeline)
   - [ ] HTTP request sent successfully (200 status)

**Part B: Content Pipeline Test** (Workflow 2)

5. Content Pipeline receives webhook and executes:
   - **Monday 10am Phase**: Research + Topic Proposals
     - Tavily researches trending tax topics
     - OpenAI generates 3 topic proposals
     - Slack notification: "3 podcast topics ready for approval"
     - Wait node holds for approval
     - If approved: Saves approved topic to Airtable

   - **Monday 2pm Phase**: Generate Outline
     - Fetches approved topic from Airtable
     - OpenAI generates detailed episode outline
     - Slack notification: "Outline ready for approval"
     - Wait node holds
     - If approved: Saves outline

   - **Tuesday 10am Phase**: Write Script
     - Fetches outline
     - OpenAI writes full podcast script (5-10 min)
     - Slack notification: "Script ready for approval"
     - Wait node holds
     - If approved: Saves script

   - **Wednesday 10am Phase**: Generate Audio
     - Fetches script
     - ElevenLabs API generates audio (Josh voice)
     - Returns audio file URL
     - Slack notification: "Audio ready for approval"
     - Wait node holds
     - If approved: Proceeds to upload

   - **Wednesday 2pm Phase**: Upload to Captivate
     - Captivate API uploads audio file
     - Creates new episode with metadata
     - Schedules for Thursday 9am Texas time
     - Slack notification: "Episode scheduled for Thursday 9am"
     - context7 saves topic

   - **Thursday 9am Phase**: Auto-Publish
     - Captivate auto-publishes (no approval needed)
     - Distributes to Apple Podcasts, Spotify, etc.

   - **Thursday 2pm Phase**: Social Promotion
     - Generates social media posts about episode
     - Slack notification: "Social posts ready for approval"
     - If approved: Posts to LinkedIn/Facebook

6. Verify Each Phase:
   - [ ] Research completed (3 topics generated)
   - [ ] Slack approval 1 received
   - [ ] Approve topic via Slack
   - [ ] Outline generated
   - [ ] Slack approval 2 received
   - [ ] Approve outline
   - [ ] Script written (check length: 5-10 min read time)
   - [ ] Slack approval 3 received
   - [ ] Approve script
   - [ ] ElevenLabs audio generated (Josh voice)
   - [ ] Audio file downloadable
   - [ ] Slack approval 4 received
   - [ ] Approve audio
   - [ ] Captivate upload successful
   - [ ] Episode scheduled for Thursday 9am
   - [ ] context7 saved topic
   - [ ] Social posts generated
   - [ ] Slack approval 5 received

**Expected Time**: 2-3 hours (includes 5 approval checkpoints)

---

### Phase 2: Integration Testing (2-3 hours)

#### Test 2.1: context7 Memory Verification

**Purpose**: Ensure all 4 agents prevent topic duplication

**Test Steps**:
1. For each agent, run 2 tests with same topic:
   - Test 1: Add "2025 Tax Filing Deadlines" to Airtable
   - Test 2: Add "2025 Tax Filing Deadlines" again

2. Expected Behavior:
   - Test 1: Agent generates content normally
   - Test 2: Agent detects duplicate in context7 and either:
     - Skips generation, OR
     - Generates different angle on same topic

3. Verify context7 Keys:
   - Agent 1: `tax4us:blog:history`
   - Agent 2: `tax4us:pages:history`
   - Agent 3: `tax4us:social:history`
   - Agent 4: `tax4us:podcast:history`

4. Check Upstash Redis:
   - [ ] All 4 keys exist
   - [ ] Each key has 1-20 items
   - [ ] Items are topic strings

**Expected Time**: 1 hour

---

#### Test 2.2: Slack Approval Flow

**Purpose**: Verify all approval workflows work correctly

**Test Steps**:
1. Test each approval scenario:
   - **Immediate Approval**: Click approve within 1 minute
   - **Delayed Approval**: Wait 10 minutes, then approve
   - **Rejection**: Click reject button
   - **Timeout**: Wait for auto-approve timeout (varies by agent)

2. Verify:
   - [ ] Approval buttons work (approve/reject)
   - [ ] Approved content proceeds to next step
   - [ ] Rejected content stops workflow
   - [ ] Timeout auto-approves (check agent settings)
   - [ ] All notifications clear and actionable

**Expected Time**: 1 hour

---

#### Test 2.3: Airtable Integration

**Purpose**: Verify all Airtable triggers and updates work

**Test Steps**:
1. For each agent:
   - Add record to Airtable with Status = "Ready"
   - Verify workflow triggers within 30 seconds
   - After completion, verify Airtable updated with:
     - WordPress URL (Agent 1, 2)
     - Social post URL (Agent 3)
     - Podcast episode URL (Agent 4)
     - Status changed to "Published"

2. Verify:
   - [ ] All triggers fire on Status = "Ready"
   - [ ] No duplicate executions
   - [ ] Airtable updates successful
   - [ ] URLs are valid and clickable

**Expected Time**: 30 minutes

---

### Phase 3: Production Readiness (1-2 hours)

#### Test 3.1: Weekly Schedule Verification (Agent 4)

**Purpose**: Verify Agent 4 follows exact weekly schedule

**Required**: Change n8n server time to test each day

**Test Steps**:
1. Monday 10am: Verify research phase triggers
2. Monday 2pm: Verify outline phase triggers
3. Tuesday 10am: Verify script phase triggers
4. Wednesday 10am: Verify audio phase triggers
5. Wednesday 2pm: Verify upload phase triggers
6. Thursday 9am: Verify auto-publish (no approval)
7. Thursday 2pm: Verify social promotion triggers

**Critical Verification**:
- [ ] Thursday 9am publish is AUTOMATIC (no human approval)
- [ ] All other phases require approval
- [ ] Timezone is America/Chicago (Texas time)

**Expected Time**: 1 hour (simulated)

---

#### Test 3.2: Error Handling

**Purpose**: Verify workflows handle errors gracefully

**Test Steps**:
1. Simulate API failures:
   - Disable Tavily credential temporarily
   - Verify workflow catches error and sends Slack notification
   - Re-enable credential

2. Simulate invalid data:
   - Add Airtable record with missing required fields
   - Verify workflow handles gracefully

3. Verify:
   - [ ] Errors caught and logged
   - [ ] Slack notifications sent for errors
   - [ ] Workflows don't crash entire system

**Expected Time**: 30 minutes

---

## Known Issues (To Be Investigated)

### Agent 1: Error ID 6149
- **Status**: Error
- **Date**: 2025-10-08T16:59:01
- **Likely Cause**: Unknown (needs investigation)
- **Action**: Check execution log for details

### Agent 3: Error ID 6145
- **Status**: Error
- **Date**: 2025-10-08T12:20:50
- **Likely Cause**: Unknown (needs investigation)
- **Action**: Check execution log for details

---

## Testing Checklist

### Pre-Testing Setup
- [x] All 5 workflows activated ✅
- [x] Captivate Show ID configured in Agent 4 Pipeline ✅
- [ ] ACF REST API verified on tax4us.co.il
- [ ] Slack workspace configured for notifications
- [ ] Airtable test records prepared

### Individual Agent Tests
- [ ] Agent 1: WordPress Blog (30 min)
- [ ] Agent 2: WordPress Pages (45 min)
- [ ] Agent 3: Social Media (1 hour)
- [ ] Agent 4: Autonomous Podcast (2-3 hours)

### Integration Tests
- [ ] context7 Memory Verification (1 hour)
- [ ] Slack Approval Flow (1 hour)
- [ ] Airtable Integration (30 min)

### Production Readiness
- [ ] Weekly Schedule Verification (1 hour)
- [ ] Error Handling (30 min)

### Final Verification
- [ ] All agents producing quality content
- [ ] No duplicate topics across agents
- [ ] All Slack notifications working
- [ ] All Airtable updates successful
- [ ] Agent 4 ready for Thursday 9am deadline

---

## Success Criteria

**Agent 1** (WordPress Blog):
- ✅ context7 prevents duplicate topics
- ✅ Slack approval before publish working
- ✅ Ben approves content quality
- ✅ WordPress posts created successfully

**Agent 2** (WordPress Pages):
- ✅ All 4 content types working (Service, FAQ, Glossary, Case Study)
- ✅ ACF fields populate correctly
- ✅ Pages visible on tax4us.co.il

**Agent 3** (Social Media):
- ✅ Bilingual content (Hebrew + English) generates correctly
- ✅ Posts use Tax4Us branding
- ✅ LinkedIn + Facebook publishing works
- ✅ Hebrew is natural and professional

**Agent 4** (Autonomous Podcast):
- 🔴 **Episodes publish EVERY THURSDAY 9:00 AM TEXAS TIME** (CRITICAL)
- ✅ 5 approval checkpoints working
- ✅ Auto-publish if approved by Wednesday
- ✅ Captivate.fm auto-distributes to Apple + Spotify
- ✅ ElevenLabs Josh voice quality acceptable

---

## Contact & Support

**Questions During Testing**: Email Shai Friedman (shai@rensto.com)

**Ben's Action Items**:
1. ~~Activate 3 inactive workflows~~ ✅ COMPLETE
2. ~~Provide Captivate.fm Show ID~~ ✅ COMPLETE
3. Verify ACF REST API on WordPress (optional but recommended)
4. Execute testing plan (6-10 hours total)
5. Approve/reject content quality at each checkpoint
6. Report any errors with execution IDs

**Expected Testing Time**: 6-10 hours total (can be spread over 2-3 days)

---

**Testing Phase Start Date**: TBD (after Ben activates workflows)
**Target Production Launch**: Week of Oct 14, 2025
**First Podcast Episode**: Thursday, Oct 17, 2025, 9:00 AM Texas time

---

**Last Updated**: October 8, 2025
**Status**: Ready for Ben to Begin Testing
