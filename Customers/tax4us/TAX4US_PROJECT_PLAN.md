# Tax4Us AI Agents Project - Complete Documentation

**Project Start**: October 8, 2025
**Client**: Ben @ Tax4Us LLC (info@tax4us.co.il)
**Platform**: n8n Cloud (https://tax4usllc.app.n8n.cloud)
**Version**: n8n@1.115.1
**Airtable**: 5 bases (appkZD1ew4aKoBqDM = primary)
**Podcast Schedule**: **LIVE THURSDAYS 9:00 AM TEXAS TIME** (2:00 PM UTC / 5:00 PM Israel)

---

## 🎯 PROJECT OVERVIEW

### Mission
Build 4 autonomous AI agents for Tax4Us content production with human-in-the-loop approval at critical decision points.

### Success Criteria
- ✅ All 4 agents operational on Tax4Us n8n Cloud
- ✅ Slack notifications for all success/failure/urgent errors
- ✅ Human approval required before publishing
- ✅ Podcast episodes ready every Thursday 9am Texas time
- ✅ Context7 integration for conversation memory
- ✅ Full documentation for Ben

---

## 🤖 THE 4 AGENTS

### Agent 1: WordPress Blog Content (ACTIVE)
**Status**: ✅ EXISTS - Optimizations Pending
**Workflow ID**: `zQIkACTYDgaehp6S`
**Name**: "WF: Blog Master - AI Content Pipeline"

**Current Flow**:
```
Airtable (Content_Specs) → Prefilter → Tavily Research → OpenAI Generate →
Validate JSON → Check WP Exists → Create/Update WP Post → Update Airtable →
Gmail Notify
```

**Optimizations Needed**:
- ⚠️ Add context7 for conversation memory
- ⚠️ Improve research quality (use n8n-mcp for advanced research)
- ⚠️ Add Slack notifications (currently only Gmail)
- ⚠️ Add human approval step before publishing

**Integrations**:
- Airtable (Tax4Us base: appkZD1ew4aKoBqDM)
- Tavily (research API)
- OpenAI (gpt-4o, gpt-4o-mini)
- WordPress (tax4us.co.il)
- Gmail (info@tax4us.co.il)
- Slack (to be added)

---

### Agent 2: WordPress Non-Blog Content (TO BUILD)
**Status**: 🔨 DESIGN PHASE
**Workflow ID**: TBD
**Content Types**: Services, FAQs, Glossary, Case Studies

**Proposed Flow**:
```
Airtable (Content_Specs, type!=blog_post) → Filter by Type →
Type-Specific Template Selection → Research (if needed) →
AI Generate (OpenAI/Claude) → ACF Field Mapping →
Slack Approval Request → [WAIT FOR BEN] →
Create WP Page with ACF → Update Airtable → Slack Notify
```

**Content Types & Templates**:

| Type | WP Template | ACF Fields | Research? |
|------|-------------|-----------|-----------|
| **service** | Service Page | hero_subtitle, service_features[], pricing, cta_text, schema_json | YES (competitor analysis) |
| **faq** | FAQ Page | faq_category, questions[], answers[], related_services[] | YES (common questions) |
| **glossary** | Glossary Page | term_he, term_en, definition_he, definition_en, examples[] | YES (official definitions) |
| **case_study** | Case Study Page | client_industry, challenge, solution, results[], testimonial | NO (manual data from Ben) |

**ACF Integration**:
- WordPress REST API v2 with ACF v5.11+
- POST to `/wp-json/wp/v2/pages` with `acf: {}` object
- Field groups must have "Show in REST API" enabled

**Approval Process**:
1. Generate content draft
2. Send Slack message to Ben with preview URL
3. Ben clicks "Approve" or "Reject" button
4. If approved → Publish to WordPress
5. If rejected → Log reason, update Airtable status

**Estimated Build Time**: 6-8 hours

---

### Agent 3: Social Media Multi-Platform (ACTIVE)
**Status**: ✅ EXISTS - Working
**Workflow ID**: `GpFjZNtkwh1prsLT`
**Name**: "✨ Automate Multi-Platform Social Media Content Creation with AI"

**Current Flow**:
```
Form Trigger (workflows.diy) → Build Research Payload → Tavily Research →
Build AI Payload → OpenAI Generate (multi-platform) → Prepare Email Review →
Gmail User for Approval → [WAIT FOR APPROVAL] →
Generate Image (OpenAI DALL-E) → Save to imgbb.com →
Publish to: LinkedIn + Facebook → Aggregate Results →
Slack Notify (if rejected)
```

**Platforms Supported**:
- LinkedIn (organization posts with images)
- Facebook (page posts with images)
- Instagram (captions + hashtags + emojis)
- X/Twitter (280 char limit)
- TikTok (video suggestions)
- Threads (text posts)
- YouTube Shorts (video titles + descriptions)

**Approval**: ✅ Already has human-in-loop via Gmail

**Tax4Us Adaptation Needed**:
- Change form trigger to Airtable (Content_Specs, type=social_announcement)
- Add Hebrew content generation
- Add Tax4Us branding (logo, colors)
- Route to Tax4Us social accounts (not workflows.diy)

**Estimated Adaptation Time**: 2-3 hours

---

### Agent 4: Autonomous Podcast Production (TO BUILD)
**Status**: 🔨 DESIGN PHASE
**Target**: **LIVE THURSDAYS 9:00 AM TEXAS TIME**
**Workflow ID**: TBD

**CRITICAL**: Weekly schedule trigger for **Thursday 9am Central Time** (America/Chicago)

**Complete Autonomous Flow**:

#### Phase 1: Research & Topic Selection (Monday Morning)
```
Cron Trigger (Monday 10am Texas) →
Review Recent Episodes (last 4 weeks) →
Market Research:
  - Competitor podcasts (Apple Podcasts API)
  - Google Trends (tax topics)
  - Reddit/Twitter trending tax discussions
  - IRS.gov recent updates
  - Tax law changes
→ Generate 3 Episode Topic Proposals →
Slack to Ben: "Which topic?" [Option 1] [Option 2] [Option 3] →
[WAIT FOR BEN SELECTION] →
Store selected topic in Airtable (Podcasts table)
```

#### Phase 2: Content Creation (Monday Afternoon - Tuesday)
```
Ben Selects Topic →
Deep Research:
  - Tavily API (comprehensive search)
  - IRS publications
  - Tax law databases
  - Case studies
→ Generate Episode Outline:
  - Intro (30 sec)
  - Main segments (3-5 topics)
  - Practical tips
  - Call-to-action
  - Outro (15 sec)
→ Slack to Ben: "Review episode outline" [Google Doc link] →
[WAIT FOR BEN APPROVAL] →
If approved → Continue
If changes → Regenerate with feedback
```

#### Phase 3: Script Writing (Tuesday Afternoon)
```
Approved Outline →
AI Script Generation (OpenAI GPT-4o):
  - Write full script (10-15 min episode)
  - Include Hebrew terms where relevant
  - Professional + conversational tone
  - Add timestamps
  - Include show notes
→ Slack to Ben: "Review script" [Google Doc link] →
[WAIT FOR BEN APPROVAL] →
If approved → Continue
If changes → Regenerate with feedback
```

#### Phase 4: Audio Recording (Wednesday Morning)
```
Approved Script →
Voice Selection:
  - ElevenLabs Voice: "Josh" (authoritative)
  - Language: en-US
  - Settings: professional tone, moderate pace
→ Generate Audio (ElevenLabs API):
  - Split script into segments
  - Generate each segment
  - Add intro/outro music (if available)
  - Merge segments
→ Upload to temporary storage →
Slack to Ben: "Listen to episode" [Audio player embed] →
[WAIT FOR BEN APPROVAL] →
If approved → Continue
If re-record → Adjust voice settings, regenerate
```

#### Phase 5: Publishing (Wednesday Afternoon - Ready for Thursday)
```
Approved Audio →
Generate Podcast Metadata:
  - Episode title
  - Description (English)
  - Show notes (detailed)
  - Transcript (auto-generated)
  - Keywords/tags
→ Upload to Captivate.fm:
  - POST /api/episodes
  - Set publish date: Thursday 9:00 AM Texas
  - Add Apple Podcasts metadata
  - Add Spotify metadata
→ Schedule in Captivate →
Update Airtable (Podcasts table):
  - Captivate Episode ID
  - Apple URL
  - Spotify URL
  - Audio URL
  - Duration
  - Status: "Scheduled"
→ Slack to Ben: "✅ Episode scheduled for Thursday 9am Texas" [Preview links]
```

#### Phase 6: Auto-Publish (Thursday 9:00 AM Texas)
```
Captivate Auto-Publishes →
RSS Feed Updates →
Apple Podcasts (live within 1-2 hours) →
Spotify (live within 1-2 hours) →
n8n Webhook from Captivate (confirmation) →
Update Airtable:
  - Status: "Published"
  - Published At: timestamp
→ Slack to Ben: "🎙️ LIVE: Episode is now on Apple Podcasts & Spotify" [Links]
```

#### Phase 7: Post-Publish (Thursday Afternoon)
```
Generate Social Promotion Posts:
  - LinkedIn post (professional)
  - Facebook post (conversational)
  - Twitter thread (3-5 tweets)
  - Instagram story text
→ Slack to Ben: "Promote episode on social?" [Preview posts] →
[WAIT FOR BEN APPROVAL] →
If approved → Trigger Agent 3 (Social Media) → Publish
```

**Weekly Timeline** (7-day cycle):

| Day | Time (Texas) | Phase | Action | Approval? |
|-----|-------------|-------|--------|-----------|
| **Monday** | 10:00 AM | Research | Generate 3 topic proposals | ✅ YES (topic selection) |
| **Monday** | 2:00 PM | Content | Create episode outline | ✅ YES (outline approval) |
| **Tuesday** | 10:00 AM | Script | Write full script | ✅ YES (script approval) |
| **Wednesday** | 10:00 AM | Record | Generate audio with ElevenLabs | ✅ YES (audio approval) |
| **Wednesday** | 2:00 PM | Publish | Upload to Captivate, schedule for Thursday 9am | ✅ YES (final confirmation) |
| **Thursday** | **9:00 AM** | **GO LIVE** | Captivate auto-publishes to Apple/Spotify | ❌ NO (automatic) |
| **Thursday** | 2:00 PM | Promote | Generate social posts | ✅ YES (promotion approval) |

**Total Approvals per Episode**: 5 (Topic, Outline, Script, Audio, Promotion)

**ElevenLabs Configuration**:
```json
{
  "voice_id": "Josh",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.65,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  },
  "language": "en",
  "pronunciation_dictionary_locators": []
}
```

**Captivate.fm Integration**:
- API: https://docs.captivate.fm
- Endpoint: `POST /api/shows/{show_id}/episodes`
- Schedule: `publish_at: "2025-10-10T14:00:00Z"` (Thursday 9am Texas = 2pm UTC)
- Auto-publish: Captivate handles RSS feed updates
- Distribution: Apple Podcasts + Spotify (automated by Captivate)

**WordPress Sync** (Post-Publish):
- Create blog post: "New Podcast Episode: [Title]"
- Embed Apple Podcasts player
- Include transcript
- Add show notes
- Link to Spotify

**Estimated Build Time**: 10-12 hours

---

## 📊 AIRTABLE STRUCTURE

### Primary Base: appkZD1ew4aKoBqDM

**Tables**:

1. **Content_Specs** (Master content queue)
   - Fields: Spec ID, Type (service/faq/glossary/case_study/blog_post/podcast_episode/social_announcement), Language (en/he), Title EN, Title HE, Outline, Keywords, Status (New/Drafted/Needs_Approval/Approved/Published/Rejected), Priority, Due Date, Owner Email
   - Used by: All 4 agents

2. **Agents** (Workflow registry)
   - Fields: Agent Key, Agent Name, Workflow Name, Trigger Source, Status (Active), Last Run At, Managed Tables
   - Links: Content_Specs, WP_Pages, WP_Posts, Podcasts, Social_Queue, Published_Content, Errors_Log

3. **WP_Posts** (WordPress blog posts)
   - Fields: WP Post ID, Spec ID, Language, Title EN, Slug EN, URL, State (Draft/Published), Drafted At, Published At, Last Error
   - Agent: 1

4. **WP_Pages** (WordPress pages - services, FAQs, etc.)
   - Fields: WP ID, Spec ID, Endpoint, Language, URL, ACF Ready, State, Drafted At, Published At
   - Agent: 2

5. **Podcasts** (Captivate episodes)
   - Fields: Captivate Episode ID, Spec ID, Show ID, Episode Number, Season, Title, Description, Audio URL, Duration Seconds, Publish Date, Apple URL, Spotify URL, Transcript URL, Status (Drafted/Approved/Published), Last Error
   - Agent: 4

6. **Social_Queue** (Social media posts)
   - Fields: Message, Platform (Facebook/LinkedIn), Spec ID, Link URL, Image URL, Scheduled At, Posted At, Post ID, Status (Queued/Posted/Failed/Cancelled)
   - Agent: 3

7. **Published_Content** (All published content registry)
   - Fields: URL, Platform (WP_PAGE/WP_POST/PODCAST), Spec ID, External ID, Title, Language, Published At, Social Shared
   - All agents write here

8. **Errors_Log** (Error tracking)
   - Fields: Error ID, Timestamp, Agent Key, Spec ID, Workflow Run ID, Source, Status Code, Message, Retry Count, Resolved
   - All agents write here

9. **Content_Approvals** (Human-in-loop tracking)
   - Fields: content_id, requested_at, approver_email, status (pending/approved/rejected/timeout), responded_at, notes
   - All agents write here when requesting approval

10. **voice_profiles** (TTS voice settings)
    - Fields: speaker_name, voice_provider (ElevenLabs/Google/Amazon/Azure), voice_id, language (en-US/he-IL), is_active
    - Agent: 4

### Other Bases:

- **appC48EN3y7IPN1Qn**: Content_Specs (duplicate/staging?)
- **applx2qObfxkFt6oO**: WP_Posts, Social_Published, Social_Queue, Podcasts, WP_Pages
- **appF2SY9JUdKbTR7h**: Config, voice_profiles, Agents, brand_assets, cta_library
- **appwysg49ktaQs9vq**: metrics, daily_metrics, Errors_Log, engagement_tracking

**Note**: Consider consolidating duplicate tables into primary base (appkZD1ew4aKoBqDM).

---

## 🔧 TECHNICAL STACK

### n8n Workflows
- **Platform**: Tax4Us n8n Cloud (tax4usllc.app.n8n.cloud)
- **Version**: n8n@1.115.1
- **Access**: API key stored in infra/n8n-multi-instance-manager/n8n-instances.json

### AI Models
- **OpenAI**: gpt-4o (content generation), gpt-4o-mini (cost-optimized), DALL-E 3 (images)
- **Anthropic**: Claude 3.5 Sonnet (content validation, quality checks)
- **ElevenLabs**: Multilingual v2 (podcast voice synthesis)

### Research & Data
- **Tavily API**: Web research, real-time data
- **context7**: Conversation memory and context tracking (Upstash)
- **n8n-mcp**: Advanced n8n workflow management

### Integrations
- **WordPress**: tax4us.co.il (REST API v2 + ACF)
- **Airtable**: 5 bases (primary: appkZD1ew4aKoBqDM)
- **Captivate.fm**: Podcast hosting + distribution
- **Slack**: Notifications + approvals (OAuth2)
- **Gmail**: Email notifications (OAuth2)
- **Facebook**: Page posting (Graph API)
- **LinkedIn**: Organization posting (OAuth2)
- **ElevenLabs**: Text-to-speech (API key)
- **Google**: Calendar, Docs, Drive (OAuth2)
- **GitHub**: Version control (OAuth2)
- **Cal.com**: Scheduling (API)

### MCP Servers
- **n8n-mcp**: n8n workflow management (Docker)
- **context7**: Conversation memory (Upstash)
- **airtable-mcp**: Airtable operations (NPX)
- **boost-space-mcp**: Project tracking (local)
- **notion-mcp**: Documentation (NPX)
- **typeform-mcp**: Forms (local)
- **quickbooks-mcp**: Accounting (local)
- **make-mcp**: Make.com integration (local)

---

## 🎯 IMPLEMENTATION TIMELINE

### Week 1: Setup & Agent 2 (Oct 8-15, 2025)
- [x] Day 1: Research & Planning (TODAY)
  - [x] Audit 5 Airtable bases
  - [x] Research tax4us.co.il business model
  - [x] Research Captivate.fm API
  - [x] Research ElevenLabs voices
  - [x] Research WordPress ACF integration
  - [x] Document complete project plan

- [ ] Day 2-3: Agent 1 Optimization
  - [ ] Add context7 integration
  - [ ] Improve research pipeline (n8n-mcp + Tavily)
  - [ ] Add Slack notifications
  - [ ] Add human approval step before publishing
  - [ ] Test end-to-end

- [ ] Day 4-6: Build Agent 2 (WordPress Non-Blog)
  - [ ] Create workflow structure
  - [ ] Build type-specific content generation
  - [ ] Implement ACF field mapping
  - [ ] Add Slack approval workflow
  - [ ] Test all 4 content types (service, faq, glossary, case_study)

- [ ] Day 7: Testing & Documentation
  - [ ] Test Agent 1 + Agent 2 together
  - [ ] Write user guide for Ben
  - [ ] Record demo video

### Week 2: Agent 4 Podcast (Oct 16-22, 2025)
- [ ] Day 1-2: Podcast Research & Topic Phase
  - [ ] Build market research workflow
  - [ ] Integrate competitor analysis
  - [ ] Create 3-option proposal generator
  - [ ] Test Slack approval buttons

- [ ] Day 3-4: Content Creation Phase
  - [ ] Build deep research pipeline
  - [ ] Create episode outline generator
  - [ ] Build script writing workflow
  - [ ] Test iterative approval loop

- [ ] Day 5-6: Audio Recording Phase
  - [ ] Integrate ElevenLabs API
  - [ ] Build audio generation workflow
  - [ ] Add music/intro/outro handling
  - [ ] Test voice quality

- [ ] Day 7: Publishing & Scheduling
  - [ ] Integrate Captivate.fm API
  - [ ] Build Thursday 9am scheduler
  - [ ] Test WordPress sync
  - [ ] Test social promotion flow

### Week 3: Agent 3 Adaptation & Testing (Oct 23-29, 2025)
- [ ] Day 1-2: Social Media Adaptation
  - [ ] Change trigger from Form to Airtable
  - [ ] Add Hebrew content generation
  - [ ] Add Tax4Us branding
  - [ ] Route to Tax4Us social accounts

- [ ] Day 3-4: End-to-End Testing
  - [ ] Test all 4 agents independently
  - [ ] Test agent interactions
  - [ ] Load testing (10+ items in queue)
  - [ ] Error recovery testing

- [ ] Day 5-6: Documentation & Training
  - [ ] Complete user documentation
  - [ ] Record training videos for Ben
  - [ ] Create troubleshooting guide
  - [ ] Document all Slack commands

- [ ] Day 7: Handoff & First Live Podcast
  - [ ] Knowledge transfer session with Ben
  - [ ] Monitor first live podcast (Thursday 9am)
  - [ ] Gather feedback
  - [ ] Make final adjustments

---

## 📋 TASK BREAKDOWN

### Phase 1: Research (COMPLETED - Oct 8, 2025)
- [x] Audit all 5 Tax4Us Airtable bases
- [x] Research tax4us.co.il business model
- [x] Research Captivate.fm API capabilities
- [x] Research WordPress ACF REST API
- [x] Research ElevenLabs voices
- [x] Review existing workflows
- [x] Create complete project plan

### Phase 2: Agent 1 Optimization
- [ ] Add context7 MCP integration
- [ ] Enhance research with n8n-mcp tools
- [ ] Add Slack notification nodes
- [ ] Build human approval step (Slack buttons)
- [ ] Test with 5 blog post samples
- [ ] Document changes

### Phase 3: Agent 2 Development
- [ ] Design workflow architecture
- [ ] Create Airtable trigger (filter by type)
- [ ] Build type router (service/faq/glossary/case_study)
- [ ] Service template generator
  - [ ] Competitor research sub-workflow
  - [ ] Generate service description
  - [ ] Map to ACF fields
  - [ ] Create WordPress page
- [ ] FAQ template generator
  - [ ] Common questions research
  - [ ] Generate Q&A pairs
  - [ ] Map to ACF repeater fields
- [ ] Glossary template generator
  - [ ] Official definitions research
  - [ ] Generate bilingual terms
  - [ ] Map to ACF fields
- [ ] Case study template generator
  - [ ] Use manual data from Airtable
  - [ ] Generate narrative
  - [ ] Map to ACF fields
- [ ] Slack approval workflow
  - [ ] Send preview to Ben
  - [ ] Wait for approval
  - [ ] Handle rejection with feedback
- [ ] WordPress publishing
  - [ ] POST to /wp-json/wp/v2/pages
  - [ ] Include ACF data
  - [ ] Handle errors
- [ ] Update Airtable (WP_Pages + Published_Content)
- [ ] Send success/failure notification (Slack)
- [ ] Test all 4 content types
- [ ] Document workflow

### Phase 4: Agent 3 Adaptation
- [ ] Change trigger from Form to Airtable
- [ ] Filter by type=social_announcement
- [ ] Add Hebrew language support in prompts
- [ ] Update branding (Tax4Us logo, colors)
- [ ] Route to Tax4Us accounts (not workflows.diy)
- [ ] Test with 3 sample posts
- [ ] Document changes

### Phase 5: Agent 4 Development (Podcast)
- [ ] **Phase 1: Research & Topic Selection**
  - [ ] Create cron trigger (Monday 10am Texas)
  - [ ] Build "recent episodes" query
  - [ ] Integrate market research APIs
    - [ ] Competitor podcasts
    - [ ] Google Trends
    - [ ] Reddit/Twitter trending
    - [ ] IRS.gov updates
  - [ ] Generate 3 topic proposals
  - [ ] Send Slack approval (topic selection)
  - [ ] Wait for Ben's choice
  - [ ] Store in Airtable

- [ ] **Phase 2: Content Creation**
  - [ ] Deep research workflow (Tavily + context7)
  - [ ] Generate episode outline
  - [ ] Format for Google Docs
  - [ ] Send Slack approval (outline review)
  - [ ] Handle feedback loop
  - [ ] Store approved outline

- [ ] **Phase 3: Script Writing**
  - [ ] Build script generator (OpenAI GPT-4o)
  - [ ] Include Hebrew terms
  - [ ] Add timestamps
  - [ ] Generate show notes
  - [ ] Send Slack approval (script review)
  - [ ] Handle revisions
  - [ ] Store approved script

- [ ] **Phase 4: Audio Recording**
  - [ ] Integrate ElevenLabs API
  - [ ] Configure "Josh" voice
  - [ ] Split script into segments
  - [ ] Generate audio segments
  - [ ] Merge segments
  - [ ] Upload to temp storage
  - [ ] Send Slack approval (audio review)
  - [ ] Handle re-record requests
  - [ ] Store approved audio

- [ ] **Phase 5: Publishing**
  - [ ] Generate podcast metadata
  - [ ] Integrate Captivate.fm API
  - [ ] Upload episode to Captivate
  - [ ] Set publish date (Thursday 9am Texas)
  - [ ] Update Airtable (Podcasts table)
  - [ ] Send Slack confirmation

- [ ] **Phase 6: Auto-Publish** (Thursday 9am)
  - [ ] Captivate webhook listener
  - [ ] Update Airtable status
  - [ ] Send Slack "LIVE" notification
  - [ ] Monitor Apple/Spotify availability

- [ ] **Phase 7: Post-Publish**
  - [ ] Generate social promotion posts
  - [ ] Send Slack approval (promotion)
  - [ ] Trigger Agent 3 if approved
  - [ ] Track engagement

- [ ] Test complete cycle (7-day simulation)
- [ ] Document workflow
- [ ] Create Ben's control panel

### Phase 6: Integration Testing
- [ ] Test all 4 agents independently
- [ ] Test agent interactions (e.g., podcast → social)
- [ ] Test Airtable data flow
- [ ] Test error handling
- [ ] Test Slack notification reliability
- [ ] Test approval timeouts
- [ ] Load test (20+ items in queue)
- [ ] Security audit (API keys, credentials)

### Phase 7: Documentation & Training
- [ ] Write user guide for Ben
- [ ] Document Slack commands
- [ ] Create troubleshooting guide
- [ ] Record demo videos
- [ ] Create Airtable views for Ben
- [ ] Set up monitoring dashboard
- [ ] Document maintenance procedures
- [ ] Create backup/recovery procedures

### Phase 8: Handoff & Support
- [ ] Knowledge transfer session with Ben
- [ ] Monitor first week (Oct 29 - Nov 5)
- [ ] Gather feedback
- [ ] Make adjustments
- [ ] Ensure Thursday podcast launches smoothly
- [ ] Final documentation updates

---

## 🚨 CRITICAL DEPENDENCIES

### API Access Required
- [x] Tax4Us n8n Cloud (have API key)
- [x] Airtable (have PAT: patnvGcDyEXcN6zbu.a5a237b0d3c661bc55cf83337a9128094dada5b58dcb145147fb89ecbbd779b3)
- [x] OpenAI (have credential ID: IVfkaQOIs6jCRdyu)
- [x] ElevenLabs (have credential ID: appears in workflow)
- [x] Tavily (have credential ID: LFS4VZVE8X06q4BK)
- [x] WordPress (have credential ID: GjqU4oaqFsD4KT0i)
- [x] Gmail (have credential ID: IcCnuN7tSKdtbOGM)
- [x] Slack (need to confirm OAuth setup)
- [x] Facebook Graph API (have credential ID: BrX2IqT7rHFxV45I)
- [ ] Captivate.fm API (need to set up)
- [ ] context7 (need to configure)

### Configuration Needed
- [ ] Slack workspace access for Tax4Us
- [ ] Captivate.fm Show ID
- [ ] WordPress ACF field groups created
- [ ] Tax4Us social media account credentials
- [ ] context7 API key setup
- [ ] Timezone settings (America/Chicago for cron)

---

## 📞 COMMUNICATION PROTOCOL

### Slack Channels (to be created)
- `#ai-agents-status` - Real-time agent activity
- `#ai-agents-approvals` - All approval requests
- `#ai-agents-errors` - Error notifications
- `#ai-podcast-production` - Weekly podcast cycle

### Notification Rules
- ✅ **Success**: Brief message with link (e.g., "✅ Blog post published: [link]")
- ⚠️ **Approval Needed**: Interactive buttons, 24-hour timeout
- 🚨 **Error**: Detailed error message, retry count, Airtable error ID
- 📊 **Daily Summary**: 6pm Texas time, all agent activity

### Approval Timeouts
- Blog posts: 24 hours → auto-reject
- Services/FAQs: 48 hours → auto-reject
- Podcast topics: 24 hours → auto-select most popular
- Podcast script: 48 hours → proceed with draft
- Podcast audio: 24 hours → proceed with first take
- Social posts: 12 hours → auto-reject

---

## 🎓 LESSONS LEARNED (To be updated)

### What Works Well
- (To be filled after testing)

### What Needs Improvement
- (To be filled after testing)

### Optimization Opportunities
- (To be filled after testing)

---

## 📈 SUCCESS METRICS

### Operational Metrics
- Agent uptime: > 99%
- Average approval response time: < 4 hours
- Error rate: < 5%
- Content quality score: > 8/10 (Ben's rating)

### Business Metrics
- Blog posts published: 8-12 per month
- Podcast episodes: 4 per month (every Thursday)
- Social posts: 20-30 per month
- Time saved for Ben: 20+ hours per week

### Quality Metrics
- Human approval acceptance rate: > 80%
- Retry rate (rejected content): < 20%
- WordPress SEO score: > 70
- Podcast listener retention: > 60%

---

## 🔐 SECURITY & COMPLIANCE

### API Key Management
- All keys stored in n8n credentials (encrypted)
- No keys in Airtable or Slack
- Regular key rotation (quarterly)

### Data Privacy
- PII detection enabled (Airtable Moderation_Results table)
- Compliance checks before publishing
- GDPR-compliant data handling

### Access Control
- Ben = Admin (all approvals, all Airtable access)
- n8n agents = Service account (limited Airtable access)
- Slack bot = Read/write to specific channels

---

## 📚 DOCUMENTATION LINKS

- Tax4Us Website: https://tax4us.co.il
- n8n Cloud: https://tax4usllc.app.n8n.cloud
- Airtable Primary Base: https://airtable.com/appkZD1ew4aKoBqDM
- Captivate.fm Docs: https://docs.captivate.fm
- ElevenLabs API: https://elevenlabs.io/docs
- WordPress REST API: https://developer.wordpress.org/rest-api/
- ACF REST API: https://www.advancedcustomfields.com/resources/wp-rest-api-integration/

---

**Last Updated**: October 8, 2025
**Next Review**: October 15, 2025 (after Agent 2 build)
**Owner**: Shai Friedman (for Rensto) + Ben (Tax4Us)
**Status**: 🚧 IN PROGRESS - Research Complete, Building Agents
