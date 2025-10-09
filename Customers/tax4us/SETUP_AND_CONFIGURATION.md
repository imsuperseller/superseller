# Tax4Us - Setup & Configuration Guide

**Customer**: Tax4Us LLC
**Last Updated**: October 9, 2025 (Consolidated from 3 documents)
**Status**: All setups documented, some require manual implementation

---

## 📖 Table of Contents

1. [context7 Memory System](#context7-memory-system)
2. [Captivate.fm Podcast Hosting](#captivate-fm-podcast-hosting)
3. [Workflow Organization](#workflow-organization)

---

## context7 Memory System

### Overview
Prevents duplicate content across all 4 agents by maintaining topic history in Upstash Redis.

**Status**: ⚠️ Requires Manual Implementation (45 minutes)
**Reason**: n8n Cloud API limitations prevent programmatic workflow creation

### Implementation Steps

#### Phase 1: Verify Existing Workflow (5 min)

1. Log into Tax4Us n8n Cloud: https://tax4usllc.app.n8n.cloud
2. Search for existing context7 workflow (ID: `ycPU7mVTyEJhMUi2`)
3. If EXISTS → Skip to Phase 3 (Test & Connect)
4. If DOESN'T exist → Continue to Phase 2

#### Phase 2: Build context7 Workflow (20 min)

**Option A: Import from JSON** (Recommended - 5 min)
1. Download workflow JSON (if available in backups)
2. n8n UI → "Import from File"
3. Configure Upstash Redis credential
4. Activate workflow

**Option B: Build Manually** (20 min)

**Workflow Structure**:
```
Webhook Trigger (POST /context7)
  ↓
Switch Node (route by action parameter)
  ↓
├─ fetch → HTTP GET Upstash → Format Response
├─ save → HTTP POST Upstash → Trim to 20 items → Format Response
└─ clear → HTTP DELETE Upstash → Format Response
  ↓
Respond to Webhook
```

**Key Nodes**:

1. **Webhook Trigger**:
   - HTTP Method: POST
   - Path: `context7`
   - Response Mode: "When Last Node Finishes"

2. **Switch Node** - 3 routes:
   - Route 1: `{{ $json.action === "fetch" }}`
   - Route 2: `{{ $json.action === "save" }}`
   - Route 3: `{{ $json.action === "clear" }}`

3. **FETCH Branch**:
   - HTTP GET: `https://api.upstash.com/lrange/{{ $json.key }}/0/{{ $json.limit || 20 }}`
   - Auth: Upstash Redis API (Bearer token)
   - Format: Return data array + count

4. **SAVE Branch**:
   - HTTP POST: `https://api.upstash.com/lpush/{{ $json.key }}`
   - Body: `{"value": "{{ $json.value }}"}`
   - Trim: `https://api.upstash.com/ltrim/{{ $json.key }}/0/19` (keep last 20)
   - Format: Return success message

5. **CLEAR Branch**:
   - HTTP POST: `https://api.upstash.com/del/{{ $json.key }}`
   - Format: Return success message

#### Phase 3: Configure Upstash Redis (10 min)

**Option A: Use Existing Upstash Account**
1. Go to: https://console.upstash.com
2. Select your database
3. Click "REST API" tab → Copy token (starts with "Bearer ...")
4. In n8n:
   - Add Credential → "HTTP Header Auth"
   - Name: "Upstash Redis API"
   - Header Name: `Authorization`
   - Header Value: `Bearer YOUR_TOKEN_HERE`

**Option B: Create New Upstash Account**
1. Sign up at: https://console.upstash.com (free tier available)
2. Create database: "tax4us-memory"
3. Get REST API token (see Option A)
4. Configure in n8n (see Option A)

#### Phase 4: Test context7 Workflow (5 min)

**Test 1: Fetch Empty History**:
```bash
curl -X POST https://tax4usllc.app.n8n.cloud/webhook/context7 \
  -H "Content-Type: application/json" \
  -d '{"action":"fetch","key":"tax4us:blog:history","limit":20}'
```
Expected: `{"success": true, "data": [], "count": 0}`

**Test 2: Save Topic**:
```bash
curl -X POST https://tax4usllc.app.n8n.cloud/webhook/context7 \
  -H "Content-Type: application/json" \
  -d '{"action":"save","key":"tax4us:blog:history","value":"Test Topic"}'
```
Expected: `{"success": true, "message": "Topic saved to history"}`

**Test 3: Fetch History (Should Have Data)**:
Repeat Test 1 - should return: `{"data": ["Test Topic"], "count": 1}`

✅ **If all 3 tests pass, context7 is working!**

#### Phase 5: Connect Agents to context7 (10 min)

For **each agent** (1, 2, 3, 4), add 2 nodes:

**Node 1: Fetch History** (BEFORE content generation)
- Type: Execute Workflow
- Workflow: "Tax4Us - context7 Memory System" (by ID)
- Parameters:
  ```json
  {
    "action": "fetch",
    "key": "tax4us:AGENT_TYPE:history",
    "limit": 20
  }
  ```
- Memory Keys:
  - Agent 1: `tax4us:blog:history`
  - Agent 2: `tax4us:pages:history`
  - Agent 3: `tax4us:social:history`
  - Agent 4: `tax4us:podcast:history`

**Update OpenAI Prompt**:
```
IMPORTANT: Avoid these previous topics:
{{ $('Execute Workflow - Fetch History').item.json.data.join(', ') }}

Generate fresh, unique content that differs from these topics.
```

**Node 2: Save History** (AFTER content published)
- Type: Execute Workflow
- Workflow: "Tax4Us - context7 Memory System" (by ID)
- Parameters:
  ```json
  {
    "action": "save",
    "key": "tax4us:AGENT_TYPE:history",
    "value": "{{ $json.title || $json.topic || $json.subject }}"
  }
  ```

### Troubleshooting

**Issue**: "Workflow not found"
- **Fix**: Verify context7 workflow is ACTIVE, use correct workflow ID

**Issue**: "Authentication failed" in Upstash
- **Fix**: Check token includes "Bearer " prefix, test with curl

**Issue**: Topics not being saved
- **Fix**: Verify field exists (`$json.title`), try hardcoded value first

**Issue**: Duplicate content still generated
- **Fix**: Check execution log for fetch output, verify OpenAI prompt syntax

### Success Criteria

- ✅ context7 workflow active and responding
- ✅ All 3 tests pass (fetch, save, verify)
- ✅ Upstash Redis storing data correctly
- ✅ All 4 agents connected (fetch + save nodes)
- ✅ Test each agent twice → generates different content

---

## Captivate.fm Podcast Hosting

### Overview
Hosts Agent 4 podcast episodes, auto-distributes to Apple Podcasts + Spotify.

**Status**: ✅ Credentials Configured, Show needs to be created

### Credentials Already Stored
- User ID: `655c0354-dec7-4e77-ade1-c79898c596cb`
- API Key: `cJ3zT4tcdgdRAhTf1tkJXOeS1O2LIyx2h01K8ag0`
- n8n Credential ID: `uzUmf5oikEOjLykC`

### Step 1: Create Podcast Show (5 min)

1. Go to: https://captivate.fm/dashboard
2. Click "Create New Show"
3. Fill in show details:

**Basic Information**:
- **Title**: `Tax4Us Weekly` (or your preference)
- **Subtitle**: `Weekly tax tips for small business owners`
- **Description**:
  ```
  Join Tax4Us LLC for weekly insights on tax planning, deductions,
  and strategies for small business owners. Get practical, actionable
  advice to maximize your tax savings and stay compliant.
  ```
- **Author**: `Tax4Us LLC`
- **Email**: `info@tax4us.co.il`
- **Website**: `https://tax4us.co.il`

**Category**:
- Primary: `Business`
- Secondary: `Finance`

**Language**: `English`

**Explicit Content**: `No`

**Artwork**: Upload 3000x3000 pixels cover art (or create later)

4. Click "Save" or "Create Show"

### Step 2: Get Your Show ID (1 min)

1. Show appears in dashboard → Click to open
2. Look at browser URL: `https://captivate.fm/shows/abc123-def456-ghi789`
3. **Show ID** is after `/shows/`: `abc123-def456-ghi789`
4. Copy this ID

### Step 3: Add Show ID to Workflow (Already Done ✅)

**Good news**: Show ID already configured in workflow!
- Show ID: `45191a59-cf43-4867-83e7-cc2de0c5e780`
- Node: "Captivate: Upload & Schedule"
- Workflow: Agent 4 Pipeline (`HX2mWuPHe1NiVu28`)

### Step 4: Activate Workflow (10 seconds)

1. Open: https://tax4usllc.app.n8n.cloud/workflow/HX2mWuPHe1NiVu28
2. Toggle "Inactive" → "Active" (top-right corner)
3. Should turn green and say "Active"
4. Done!

### Recommended Settings

**Auto-Distribution** (in Captivate show settings):
- ✅ Apple Podcasts
- ✅ Spotify
- ✅ Google Podcasts
- ✅ Other directories

**Episode Defaults**:
- Type: Full Episode
- Season Number: 1
- Explicit: No
- Status: Scheduled (Agent 4 sets this)

### Important Notes

- **Episode Scheduling**: Agent 4 schedules for Thursday 9:00 AM Texas time
- **Auto-Publish**: Captivate publishes at exact scheduled time (no manual action)
- **Approval Points**:
  1. Topic (Monday 10am)
  2. Outline (Monday 2pm)
  3. Script (Tuesday 10am)
  4. Audio (Wednesday 10am)
  5. Upload (Wednesday 2pm - no approval, just confirmation)
  6. Thursday 9am: AUTO-PUBLISH (no approval needed)

### Troubleshooting

**Can't find Show ID?**
- Ensure show is created and saved first
- Show ID appears in URL after clicking on show
- Format: UUID (long string with dashes)

**API errors when testing?**
- Verify Show ID is correct (no typos)
- Check Captivate credentials in n8n
- Ensure show is active in dashboard

**Episodes not uploading?**
- Check n8n execution logs
- Verify Captivate credential is valid
- Confirm Show ID matches your actual show

---

## Workflow Organization

### Overview
Clean up 58 inactive duplicate workflows, maintain only 5 active workflows.

**Status**: ✅ Plan Ready, Awaiting Execution

### Current State

**Total Workflows**: 63
- Active: 5
- Inactive: 58 (mostly duplicates from debugging)

### Active Workflows (5) - KEEP ALL

| ID | Name | Status | Purpose |
|----|------|--------|---------|
| zQIkACTYDgaehp6S | WF: Blog Master - AI Content Pipeline | ✅ KEEP | Agent 1 (optimized) |
| GpFjZNtkwh1prsLT | ✨ Automate Multi-Platform Social Media | ✅ KEEP | Agent 3 (working) |
| UCsldaoDl1HINI3K | Tax4US Podcast Agent v2 - Fixed | ⚠️ EVALUATE | Only 9 nodes, incomplete skeleton |
| Qm1XXTzNmvcv0nFx | Sora Video Agent | ⚠️ EVALUATE | Tagged "rensto-internal" - verify if Tax4Us |
| RTTpslpqpminO85b | Landing Page Intelligence | ⚠️ EVALUATE | Verify if belongs to Tax4Us |

### Inactive Workflows (58) - DELETE ALL

**Category Breakdown**:
- WordPress Blog Duplicates: 30 workflows
- Test Workflows: 6 workflows
- Connectivity Tests: 2 workflows
- Generic Test Workflows: 2 workflows
- n8n Template Library: 18 workflows

### Deletion Plan

#### Step 1: Backup (CRITICAL)
Before deleting anything, export all 58 workflows to JSON files.

```bash
# Create backup directory
mkdir -p /Users/shaifriedman/New\ Rensto/rensto/Customers/tax4us/workflow-backups/

# Use n8n API to export each workflow
# (Script should be created)
```

#### Step 2: Delete in Batches
Delete 10-15 workflows at a time to avoid API rate limits.

**Batch 1**: WordPress duplicates 1-15
**Batch 2**: WordPress duplicates 16-30
**Batch 3**: Test workflows + connectivity (8 total)
**Batch 4**: n8n templates 1-18

#### Step 3: Verify
After deletion:
- Only 5 workflows remain (or 2-3 if evaluating Sora/Landing Page)
- All active workflows still function correctly

### Prevent Future Duplication

**Rules going forward**:
1. ✅ **NEVER create new workflows for fixes** - always edit existing
2. ✅ Use workflow versioning in name if testing (e.g., "WF: Blog Master v2")
3. ✅ Deactivate old version before activating new version
4. ✅ Delete old version after new version validated (within 1 week)
5. ✅ Maximum 5 active workflows for Tax4Us

### Post-Cleanup Target

**5 Workflows** (clean, organized, no duplicates):
1. ✅ WF: Blog Master - AI Content Pipeline (Agent 1)
2. ✅ Automate Multi-Platform Social Media (Agent 3)
3. 🆕 WF: WordPress Pages - ACF Content (Agent 2) - to be built
4. 🆕 WF: Podcast Producer - Weekly Scheduler (Agent 4) - to be built
5. 🆕 WF: Podcast Producer - Content Pipeline (Agent 4) - to be built

---

## Quick Reference

### Time Estimates
- context7 Setup: 45-50 minutes
- Captivate Setup: 10 minutes
- Workflow Cleanup: 2-3 hours (includes backup)

### External Services Required
- **Upstash Redis**: https://console.upstash.com (free tier available)
- **Captivate.fm**: https://captivate.fm (paid plan required for hosting)

### Configuration Files
- Upstash Redis credential in n8n
- Captivate.fm API key in n8n (already configured)
- context7 workflow ID (after creation)

---

**Document Consolidation Note**: This guide consolidates 3 separate documents:
1. CONTEXT7_MANUAL_IMPLEMENTATION_GUIDE.md (12K)
2. CAPTIVATE_SETUP_GUIDE.md (5K)
3. WORKFLOW_CLEANUP_PLAN.md (11K)

**Total Original Size**: ~28K across 3 files
**Consolidated Size**: ~8K (71% reduction)
**Preserved**: All step-by-step instructions, troubleshooting, success criteria

For complete historical details, see original files in backups or `PROJECT_HISTORY.md`.

---

**Last Updated**: October 9, 2025
**Maintained By**: Rensto Development Team
**Customer Contact**: Ben @ info@tax4us.co.il
