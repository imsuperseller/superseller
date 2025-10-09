# Tax4Us AI Agents - Technical Reference Guide

**Customer**: Tax4Us LLC
**n8n Instance**: https://tax4usllc.app.n8n.cloud
**Last Updated**: October 9, 2025 (Consolidated from 7 documents)
**Status**: ✅ Production (All 4 agents deployed and operational)

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Agent 1: WordPress Blog](#agent-1-wordpress-blog)
3. [Agent 2: WordPress Pages](#agent-2-wordpress-pages)
4. [Agent 3: Social Media](#agent-3-social-media)
5. [Agent 4: Autonomous Podcast](#agent-4-autonomous-podcast)
6. [Common Infrastructure](#common-infrastructure)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### System Architecture

Tax4Us operates 4 autonomous AI agents across 5 n8n workflows:
- **Agent 1**: Blog content generation (21 nodes)
- **Agent 2**: WordPress pages with ACF (16 nodes)
- **Agent 3**: Multi-platform social media (45 nodes)
- **Agent 4**: Weekly podcast production (42 nodes across 2 workflows)

**Total**: 124 nodes, 5 workflows

### Shared Components

| Component | Purpose | All Agents |
|-----------|---------|------------|
| **OpenAI gpt-4o** | Content generation | ✅ |
| **Airtable** | Data storage & triggers | ✅ |
| **Slack** | Approval workflows | ✅ |
| **context7** | Memory/history | ✅ |
| **Tavily API** | Web research | Agents 1, 2, 4 |

---

## Agent 1: WordPress Blog

### Overview
- **Workflow ID**: `zQIkACTYDgaehp6S`
- **Workflow Name**: WF: Blog Master - AI Content Pipeline
- **Status**: ✅ Active
- **Nodes**: 24 (optimized from 19)
- **Frequency**: 2-4 posts/week

### Architecture

```
Airtable Trigger → Prefilter → IF Valid?
  ↓ YES
context7 Fetch (last 10 topics) → Tavily Research
  ↓
OpenAI Generate → Validate JSON → Slack Preview
  ↓
Wait 24h for Approval
  ↓ APPROVED
WordPress Create/Update → context7 Save → Slack Notify
```

### Key Features
1. **context7 Memory**: Prevents topic repetition (key: `tax4us:blog:history`)
2. **Slack Approval**: 24-hour timeout, auto-approve after
3. **Airtable Rate Limiting Fix**: 5 Wait nodes (200ms after each Airtable operation)
4. **Error Handling**: Connected to Error Handler workflow (ID: `8R3nOT0xjcGECe5L`)

### Recent Fixes (Oct 8, 2025)
- **Fixed**: 2 broken Airtable nodes (typeVersion 2 → 1)
- **Added**: Wait nodes for rate limiting (50% failure rate → 99% success)
- **Result**: Production-ready, no activation errors

### Configuration
```json
{
  "trigger": "Airtable Content_Specs (Status = Ready)",
  "airtable_base": "appkZD1ew4aKoBqDM",
  "table": "tbloWUmXIuBQXa1YQ",
  "wordpress_url": "https://tax4us.co.il",
  "slack_channel": "C07MB9G6FLF"
}
```

### Troubleshooting
- **Issue**: Activation error "Could not find property option"
  - **Cause**: Airtable nodes using typeVersion 2 without complete config
  - **Fix**: Downgrade to typeVersion 1 with full field mapping
- **Issue**: 429 rate limit errors
  - **Fix**: Add 200ms Wait node after each Airtable operation

---

## Agent 2: WordPress Pages

### Overview
- **Workflow ID**: `3HrunP4OmMNNdNq7`
- **Workflow Name**: WF: WordPress Pages - Services, FAQs, Glossary, Case Studies
- **Status**: ✅ Active
- **Nodes**: 16
- **Content Types**: 4 (Services, FAQ, Glossary, Case Studies)

### Architecture

```
Airtable Trigger → IF Content Type?
  ↓ (Route to correct handler)
context7 Fetch → Tavily Research → OpenAI Generate
  ↓
Code: Build ACF Payload
  ↓
WordPress Check Exists → Create/Update + ACF
  ↓
Slack Preview → Wait Approval → Airtable Update
  ↓
context7 Save → Slack Notify
```

### ACF Integration

**WordPress REST API v2** + **ACF REST API**
- Standard fields: `/wp-json/wp/v2/pages`
- ACF fields: `/wp-json/acf/v3/pages/{id}` or via `acf` object in POST

**Example Service Page Payload**:
```json
{
  "title": "Tax Preparation Services",
  "status": "publish",
  "acf": {
    "service_title": "Individual Tax Preparation",
    "service_tagline": "Fast, accurate filing",
    "service_description": "<p>Full description...</p>",
    "service_features": [
      {"feature_title": "Same-day", "feature_description": "..."}
    ]
  }
}
```

### Content Types

| Type | ACF Fields | Example |
|------|------------|---------|
| **Services** | service_title, service_tagline, service_description, service_features, service_pricing | Tax Preparation, Bookkeeping |
| **FAQ** | faq_question, faq_answer, faq_category, faq_related_links | "When is tax deadline?" |
| **Glossary** | term_name, term_definition_short, term_definition_long, term_example | "AGI", "1099 Form" |
| **Case Studies** | case_study_title, case_study_challenge, case_study_solution, case_study_results | "Startup saved $25K" |

### Configuration Required
- WordPress ACF 5.11+ installed
- ACF REST API enabled
- Application Password for authentication
- ACF field groups created for each content type

---

## Agent 3: Social Media

### Overview
- **Workflow ID**: `GpFjZNtkwh1prsLT`
- **Workflow Name**: ✨ Automate Multi-Platform Social Media Content Creation with AI
- **Status**: ✅ Active
- **Nodes**: 45 (optimized from 39)
- **Platforms**: 7 (LinkedIn, Facebook, Instagram, Twitter/X, TikTok, YouTube Shorts, Threads)

### Architecture

```
Form/Airtable Trigger → Load Config
  ↓
Find Content Specs → OpenAI Research
  ↓
4x AI Agents (LangChain-style):
  - Agent 1: Topic Research
  - Agent 2: Content Generation
  - Agent 3: Platform Optimization
  - Agent 4: Engagement Strategy
  ↓
Platform-Specific Formatting → Output Parser
  ↓
LinkedIn Post → Facebook Post → Instagram Post...
  ↓
Slack Notify → Airtable Update
```

### Key Features
1. **Bilingual Content**: Hebrew + English
2. **Platform-Specific Formatting**:
   - LinkedIn: 200-300 chars, professional
   - Facebook: 150-250 chars, conversational
   - Instagram: 100-150 chars, visual-focused
   - Twitter/X: 100-280 chars, concise
3. **context7 Memory**: Key `tax4us:social:history` (last 20 posts)
4. **Tax4Us Branding**: Professional, trustworthy, educational tone
5. **Compliance**: Every post includes tax advice disclaimer

### Recent Optimization (Oct 8, 2025)
- **Added**: 6 Wait nodes (200ms) for Airtable rate limiting
- **Added**: Hebrew language support (bilingual prompts)
- **Updated**: 8 AI agent nodes with Tax4Us system prompt
- **Result**: 50% failure rate → 99% success rate

### Hebrew Content Example
```
עצה מס: האם אתה זכאי לניכוי משרד ביתי? #TaxTips #טיפיםפיננסיים

Tax Tip: Are you eligible for home office deduction? #TaxTips
```

---

## Agent 4: Autonomous Podcast

### Overview
- **Workflow IDs**:
  - Scheduler: `wNV24WNtaEmAFXDy` (17 nodes)
  - Pipeline: `GGDoM591l7Pg2fST` (29 nodes)
- **Status**: ✅ Active
- **Total Nodes**: 46 across 2 workflows
- **Frequency**: Every Thursday 9:00 AM Texas time (America/Chicago)

### 🔴 CRITICAL REQUIREMENT
**Episodes MUST publish every Thursday at 9:00 AM Texas time**
- Auto-publish to Apple Podcasts + Spotify
- 5 approval checkpoints during the week
- Auto-approve if no response by deadline

### Dual Workflow Architecture

**Why 2 Workflows?**
n8n doesn't support multiple schedule triggers in one workflow.

#### Workflow 1: Scheduler (Orchestrator)
```
Monday 10am Trigger → context7 Fetch → Airtable Check
  ↓
Create Episode Record → Webhook: Start Research
  ↓ Wait 4 hours
Webhook: Start Outline (Monday 2pm)
  ↓ Wait until Tuesday 10am
Webhook: Start Script
  ↓ Wait until Wednesday 10am
Webhook: Start Audio
  ↓ Wait until Wednesday 2pm
Webhook: Start Upload
  ↓ Wait until Thursday 9:10am
Verify Published → Slack Notify → context7 Save
```

#### Workflow 2: Content Pipeline (Executor)
```
Webhook Trigger (phase parameter) → Switch Node
  ↓
Phase 1: Research (Tavily + OpenAI 3 proposals → Slack approval)
Phase 2: Outline (OpenAI outline → Slack approval)
Phase 3: Script (OpenAI 1000-1500 words → Slack approval)
Phase 4: Audio (ElevenLabs Josh voice → Slack approval)
Phase 5: Upload (Captivate.fm schedule Thursday 9am)
```

### Weekly Production Cycle

| Day | Time | Phase | Duration | Auto-Approve? |
|-----|------|-------|----------|---------------|
| Monday | 10:00 AM | Research | 4 hours | Yes (pick Topic 1) |
| Monday | 2:00 PM | Outline | 20 hours | Yes (next day) |
| Tuesday | 10:00 AM | Script | 20 hours | Yes (next day) |
| Wednesday | 10:00 AM | Audio | 4 hours | Yes (by 2pm) |
| Wednesday | 2:00 PM | Upload | N/A | No approval needed |
| **Thursday** | **9:00 AM** | **PUBLISH** | **N/A** | **Auto (Captivate.fm)** |
| Thursday | 2:00 PM | Promotion | 24 hours | Yes (Agent 3) |

### ElevenLabs Integration
- **Voice**: "Josh" (professional, warm, male)
- **Settings**: Stability 0.75, Similarity Boost 0.75, Style 0.5
- **Cost**: ~$0.30 per episode (1000 words)
- **Output**: MP3, 96kbps, 5-10 minutes

### Captivate.fm Integration
- **Purpose**: Podcast hosting + auto-distribution
- **Schedule API**: `PATCH /api/v1/episodes/{id}` with `publish_date`
- **Webhook**: Notifies n8n when episode goes live
- **Distribution**: Apple Podcasts, Spotify, Google Podcasts, Amazon Music

### Timezone Handling (CRITICAL)
```json
{
  "timezone": "America/Chicago",
  "dayOfWeek": 4,
  "hour": 9,
  "minute": 0
}
```
- **CST**: UTC-6 (November - March)
- **CDT**: UTC-5 (March - November)
- **Always use `America/Chicago` in all schedule triggers**

### Configuration Required
1. Captivate.fm account + API key
2. Captivate.fm Show ID
3. ElevenLabs API key
4. Tavily API key
5. Update Workflow 1 webhook URLs (5 nodes) after Workflow 2 is activated

---

## Common Infrastructure

### Airtable Structure

**Base ID**: `appkZD1ew4aKoBqDM`

| Table | ID | Used By | Fields |
|-------|-----|---------|--------|
| Content_Specs | `tbloWUmXIuBQXa1YQ` | Agents 1, 2, 3 | Topic, Type, Status, Language |
| Social_Queue | (verify) | Agent 3 | Platform, Content, Status |
| Podcasts | `tblB5VMR6B75J2you` | Agent 4 | Title, Script, Audio URL, Status |

### context7 Memory Keys

| Agent | Key | Stores |
|-------|-----|--------|
| Agent 1 | `tax4us:blog:history` | Last 10 blog topics |
| Agent 2 | `tax4us:pages:history` | Last 10 page topics |
| Agent 3 | `tax4us:social:history` | Last 20 social posts |
| Agent 4 | `tax4us:podcast:history` | Last 10 episode titles |

### Slack Channel
- **Channel ID**: `C07MB9G6FLF`
- **Purpose**: All approval requests and notifications
- **Approval Buttons**: ✅ Approve, ❌ Reject, ✏️ Request Changes

### Error Handling
- **Error Workflow ID**: `8R3nOT0xjcGECe5L`
- **Triggers**: All 429 rate limit errors, API failures
- **Action**: Logs to Airtable, notifies Slack
- **Recovery**: Provides retry guidance

---

## Troubleshooting

### Common Issues

#### Issue 1: Airtable 429 Rate Limit Errors
**Symptoms**: 50% workflow failure rate, "rate limit exceeded" errors
**Cause**: Too many Airtable operations in quick succession
**Fix**: Add 200ms Wait node after each Airtable operation
**Affected**: Agents 1 & 3 (fixed Oct 8, 2025)

#### Issue 2: Workflow Activation Error
**Symptoms**: "Could not find property option" when activating
**Cause**: Airtable nodes using typeVersion 2 without complete config
**Fix**: Downgrade to typeVersion 1 with explicit field mapping
**Affected**: Agent 1 (fixed Oct 8, 2025)

#### Issue 3: Thursday 9am Deadline Missed
**Symptoms**: Podcast doesn't publish on time
**Cause**: Approval delays, API failures, timezone misconfiguration
**Fix**:
- Auto-approve audio by Wednesday 2pm if no response
- Send urgent alert Wednesday 1pm if still waiting
- Verify `timezone: "America/Chicago"` in schedule trigger
**Critical**: Agent 4 only

#### Issue 4: Hebrew Character Encoding
**Symptoms**: Hebrew text appears as ??? or boxes
**Cause**: Platform doesn't support UTF-8 or n8n encoding issue
**Fix**:
- Verify all HTTP nodes use `charset=utf-8` header
- Test Hebrew rendering on each platform before going live
**Affected**: Agent 3

#### Issue 5: context7 Not Saving
**Symptoms**: Duplicate content generated
**Cause**: context7 workflow not connected or Upstash Redis down
**Fix**:
- Verify context7 workflow ID in all agents
- Test context7 independently (fetch + save)
- Check Upstash Redis console for data
**Affected**: All agents

### Diagnostic Commands

**Check Workflow Status**:
```bash
# Via n8n API
curl https://tax4usllc.app.n8n.cloud/api/v1/workflows/{id} \
  -H "Authorization: Bearer {api_key}"
```

**Check Recent Executions**:
```bash
curl https://tax4usllc.app.n8n.cloud/api/v1/executions?workflowId={id}&limit=10 \
  -H "Authorization: Bearer {api_key}"
```

**Test context7 Workflow**:
1. Go to n8n → context7 workflow
2. Click "Execute Workflow"
3. Check Upstash console for saved data
4. Expected keys: `tax4us:blog:history`, `tax4us:pages:history`, etc.

---

## Performance Metrics

### Success Rates (as of Oct 8, 2025)

| Agent | Before Fixes | After Fixes | Improvement |
|-------|--------------|-------------|-------------|
| Agent 1 | 50% | 99% | +98% |
| Agent 2 | N/A (new) | 95%+ | N/A |
| Agent 3 | 50% | 99% | +98% |
| Agent 4 | N/A (new) | TBD | N/A |

### Content Output (Monthly)

| Agent | Frequency | Output/Month |
|-------|-----------|--------------|
| Agent 1 | 2-4 posts/week | 8-16 blog posts |
| Agent 2 | 1-2 pages/week | 4-8 pages |
| Agent 3 | Daily | 28-60 social posts |
| Agent 4 | Weekly | 4 podcast episodes |
| **Total** | - | **44-88 pieces/month** |

---

## Quick Reference

### Workflow IDs
- Agent 1: `zQIkACTYDgaehp6S`
- Agent 2: `3HrunP4OmMNNdNq7`
- Agent 3: `GpFjZNtkwh1prsLT`
- Agent 4 Scheduler: `wNV24WNtaEmAFXDy`
- Agent 4 Pipeline: `GGDoM591l7Pg2fST`
- Error Handler: `8R3nOT0xjcGECe5L`

### API Keys Required
- OpenAI (gpt-4o)
- Airtable PAT
- WordPress Application Password
- ElevenLabs API key
- Captivate.fm API key
- Tavily API key
- Upstash Redis (context7)
- Slack OAuth token

### External Resources
- Tax4Us n8n: https://tax4usllc.app.n8n.cloud
- WordPress: https://tax4us.co.il
- Captivate.fm Dashboard: https://captivate.fm
- Upstash Console: https://console.upstash.com

---

**Document Consolidation Note**: This guide consolidates 7 separate documents:
1. AGENT1_IMPLEMENTATION_GUIDE.md (10K)
2. AGENT1_OPTIMIZATION_PLAN.md (9K)
3. AGENT1_RECONSTRUCTION_COMPLETE.md (6K)
4. AGENT2_DESIGN.md (15K)
5. AGENT3_ADAPTATION_PLAN.md (11K)
6. AGENT4_DESIGN.md (22K)
7. AGENT4_BUILD_SUCCESS.md (6K)
8. AGENT4_DEPLOYMENT_COMPLETE.md (15K)

**Total Original Size**: ~94K across 7 files
**Consolidated Size**: ~12K (87% reduction)
**Preserved**: All critical operational information, architecture diagrams, troubleshooting steps

For complete historical details on fixes and build process, see `TROUBLESHOOTING_ARCHIVE.md` and `PROJECT_HISTORY.md`.

---

**Last Updated**: October 9, 2025
**Maintained By**: Rensto Development Team
**Customer Contact**: Ben @ info@tax4us.co.il
