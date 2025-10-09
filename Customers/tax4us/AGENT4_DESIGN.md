# Agent 4: Autonomous Podcast Production - Design Document

**Customer**: Tax4Us LLC (Boost.space ID: 39)
**Workflow Name**: WF: Tax4Us Podcast - Weekly Auto-Production
**Agent Note ID**: 295 (Boost.space Space 45)
**Status**: Design Phase
**Created**: October 8, 2025
**Estimated Build Time**: 10-12 hours

---

## 🔴 CRITICAL REQUIREMENT

**Episodes MUST go LIVE every Thursday at 9:00 AM Texas Time (America/Chicago timezone)**

- Auto-publish to Apple Podcasts + Spotify (no approval needed)
- 5 approval points during the week (research, outline, script, audio, promotion)
- Weekly 7-day cycle: Monday → Thursday publish → Thursday promotion

---

## Purpose

Fully autonomous weekly podcast production system that:
1. Researches trending tax topics every Monday
2. Creates episode outline, script, and audio throughout the week
3. **Automatically publishes every Thursday at 9:00 AM Texas time**
4. Promotes episode across social media
5. Requires Ben's approval at 5 checkpoints (but auto-publishes if approved by Wednesday)

---

## Weekly Production Cycle

### Timeline (7-Day Cycle)

```
MONDAY (2 events):
  10:00 AM: Research Phase - Topic Proposals
    - Tavily: Search trending tax topics
    - OpenAI: Generate 3 episode topic proposals
    - Slack: Send proposals to Ben (Approve 1 of 3)
    - Wait: 4 hours for approval
    - Deadline: 2pm same day

  2:00 PM: Outline Phase - Episode Structure
    - Approved topic from 10am
    - OpenAI: Generate detailed episode outline
    - Slack: Send outline to Ben (Approve/Request Changes)
    - Wait: Until next day
    - Deadline: Tuesday 10am

TUESDAY (1 event):
  10:00 AM: Script Phase - Full Episode Script
    - Approved outline from Monday
    - OpenAI: Write complete podcast script (5-10 min episode)
    - Slack: Send script to Ben (Approve/Request Changes)
    - Wait: Until next day
    - Deadline: Wednesday 10am

WEDNESDAY (2 events):
  10:00 AM: Audio Phase - Voice Generation
    - Approved script from Tuesday
    - ElevenLabs: Generate audio (Josh voice, professional tone)
    - Slack: Send audio preview link to Ben (Approve/Request Changes)
    - Wait: Until 2pm same day
    - Deadline: 2pm same day

  2:00 PM: Upload Phase - Captivate.fm Scheduling
    - Approved audio from 10am
    - Captivate.fm API: Upload episode
    - Captivate.fm API: Schedule for Thursday 9:00 AM Texas time
    - Airtable: Log episode details
    - Slack: Confirm scheduled (no approval needed)

THURSDAY (2 events):
  9:00 AM: AUTO-PUBLISH (NO APPROVAL NEEDED)
    - Captivate.fm auto-publishes to Apple Podcasts + Spotify
    - n8n workflow verifies publication (webhook from Captivate)
    - Slack: Notify Ben "Episode is LIVE"
    - Airtable: Update status to "Published"

  2:00 PM: Promotion Phase - Social Media Posts
    - Agent 3 (Social Media) triggered
    - Generate promotional posts for all platforms
    - Slack: Send posts to Ben for approval
    - Wait: 24 hours for approval
    - If approved: Post to social media
```

---

## Technical Architecture

### Workflow Type: DUAL WORKFLOW APPROACH

**Reason**: n8n doesn't support multiple schedule triggers in one workflow

**Solution**: 2 workflows

#### Workflow 1: "WF: Podcast Producer - Weekly Scheduler"
- **Trigger**: Schedule trigger (runs every Monday at 10am)
- **Purpose**: Orchestrates the entire week
- **Sub-executes**: Calls Workflow 2 at appropriate times
- **Nodes**: ~15-20 (scheduling logic, sub-execution calls)

#### Workflow 2: "WF: Podcast Producer - Content Pipeline"
- **Trigger**: Webhook (called by Workflow 1)
- **Purpose**: Handles research → script → audio → upload
- **Nodes**: ~40-50 (complex content generation pipeline)

---

## Workflow 1: Weekly Scheduler (15-20 nodes)

### Node Flow

```
1. Schedule Trigger (Every Monday 10:00 AM Texas time)
   ↓
2. context7: Fetch Previous Episodes (avoid topic repetition)
   ↓
3. Airtable: Check if Episode Already in Progress
   ↓ IF NO
4. Airtable: Create New Episode Record (status: "Research Phase")
   ↓
5. Webhook: Call Workflow 2 (Phase: Research)
   ↓ WAIT 4 hours
6. Airtable: Check if Topic Approved
   ↓ IF YES
7. Wait Until Monday 2pm
   ↓
8. Webhook: Call Workflow 2 (Phase: Outline)
   ↓ WAIT until Tuesday 10am
9. Webhook: Call Workflow 2 (Phase: Script)
   ↓ WAIT until Wednesday 10am
10. Webhook: Call Workflow 2 (Phase: Audio)
   ↓ WAIT until Wednesday 2pm
11. Webhook: Call Workflow 2 (Phase: Upload)
   ↓ WAIT until Thursday 9am
12. Airtable: Verify Captivate.fm Published Episode
   ↓
13. Slack: Notify Ben "Episode is LIVE"
   ↓ WAIT until Thursday 2pm
14. Webhook: Call Agent 3 (Social Media Promotion)
   ↓
15. Airtable: Update Episode Status = "Completed"
```

**Key Features**:
- Uses Wait nodes with specific times (not delays)
- Timezone: America/Chicago (Texas time)
- Handles approval timeouts (auto-approve if no response)
- Stores state in Airtable (resume if workflow restarts)

---

## Workflow 2: Content Pipeline (40-50 nodes)

### Phase 1: Research (Monday 10am)

```
1. Webhook Trigger (receives: phase="research", episode_id)
   ↓
2. Airtable: Fetch Episode Record
   ↓
3. context7: Fetch Previous Episodes (topic history)
   ↓
4. Tavily: Search Trending Tax Topics
   - Query: "trending tax news {current_month} {current_year}"
   - Focus: IRS updates, tax deadlines, law changes, small business
   - Results: Top 10 articles
   ↓
5. OpenAI: Generate 3 Topic Proposals
   - Input: Tavily results + previous episode topics
   - Output: 3 episode topics (title + 50-word summary each)
   - Criteria: Relevant to small business, timely, actionable
   ↓
6. Code: Format Slack Message
   ↓
7. Slack: Send Topic Proposals to Ben
   - Message: "Choose 1 of 3 topics for this week's episode"
   - Buttons: [Topic 1] [Topic 2] [Topic 3]
   - Timeout: 4 hours
   ↓
8. Wait: Until Ben Approves (or timeout)
   ↓ APPROVED
9. Airtable: Update Episode (selected_topic, status="Outline Phase")
   ↓
10. context7: Save Selected Topic
   ↓
   ↓ TIMEOUT (4 hours, no response)
11. Code: Auto-Select Topic (pick first one)
   ↓
12. Slack: Notify Ben "Auto-selected Topic 1 (no response)"
   ↓
13. (Continue to Airtable update)
```

---

### Phase 2: Outline (Monday 2pm)

```
1. Webhook Trigger (receives: phase="outline", episode_id)
   ↓
2. Airtable: Fetch Episode Record (get selected_topic)
   ↓
3. context7: Fetch Topic Context
   ↓
4. Tavily: Deep Research on Topic
   - Query: "{selected_topic} small business tax"
   - Focus: Actionable tips, examples, IRS guidelines
   ↓
5. OpenAI: Generate Episode Outline
   - Input: Research + topic
   - Output: Structured outline (intro, 3-5 key points, outro)
   - Length: 5-10 minutes when spoken
   - Tone: Conversational, educational, Texas-friendly
   ↓
6. Code: Format Outline for Slack
   ↓
7. Slack: Send Outline to Ben
   - Message: "Episode outline ready for review"
   - Preview: Formatted outline
   - Buttons: [Approve] [Request Changes]
   - Timeout: 20 hours (until Tuesday 10am)
   ↓
8. Wait: Until Ben Approves (or timeout)
   ↓ APPROVED
9. Airtable: Update Episode (outline, status="Script Phase")
   ↓
10. context7: Save Outline
   ↓
   ↓ REQUEST CHANGES
11. Slack: Modal "What changes do you want?"
   ↓
12. context7: Save Feedback
   ↓
13. (Loop back to OpenAI with feedback)
   ↓
   ↓ TIMEOUT
14. Slack: Reminder "Outline still needs approval"
   ↓
15. Wait: 4 more hours
   ↓ STILL NO RESPONSE
16. Auto-Approve + Notify Ben
```

---

### Phase 3: Script (Tuesday 10am)

```
1. Webhook Trigger (receives: phase="script", episode_id)
   ↓
2. Airtable: Fetch Episode Record (get outline)
   ↓
3. context7: Fetch Outline Context
   ↓
4. OpenAI: Write Full Episode Script
   - Input: Approved outline
   - Output: Complete script (word-for-word, 1000-1500 words)
   - Format: Include intro music cue, outro music cue
   - Tone: Conversational, pause markers, emphasis markers
   - Length: 5-10 minutes when read aloud
   - Include: CTA (visit tax4us.co.il, subscribe to podcast)
   ↓
5. Code: Calculate Estimated Audio Length
   - Rule: 150 words per minute average
   - Output: "~7 minutes"
   ↓
6. Code: Format Script for Slack
   ↓
7. Slack: Send Script to Ben
   - Message: "Full episode script ready"
   - Preview: First 500 words + "..." + last 200 words
   - Details: Word count, estimated length
   - Buttons: [Approve] [Request Changes] [View Full Script]
   - Timeout: 20 hours (until Wednesday 10am)
   ↓
8. Wait: Until Ben Approves (or timeout)
   ↓ APPROVED
9. Airtable: Update Episode (script, status="Audio Phase")
   ↓
10. context7: Save Script
   ↓
   ↓ REQUEST CHANGES / TIMEOUT
11. (Similar to Outline phase - request feedback or auto-approve)
```

---

### Phase 4: Audio (Wednesday 10am)

```
1. Webhook Trigger (receives: phase="audio", episode_id)
   ↓
2. Airtable: Fetch Episode Record (get script)
   ↓
3. ElevenLabs: Generate Audio
   - Voice: "Josh" (professional, warm, male voice)
   - Settings:
     * Stability: 0.75 (consistent)
     * Similarity Boost: 0.75 (high quality)
     * Style: 0.5 (moderate expressiveness)
   - Input: Full script (1000-1500 words)
   - Output: MP3 file (5-10 minutes)
   ↓
4. Code: Get Audio File URL (ElevenLabs returns URL)
   ↓
5. HTTP: Download Audio File (save to temp storage)
   ↓
6. Code: Get Audio Duration (ffprobe or file metadata)
   ↓
7. Code: Generate Waveform Preview Image (optional)
   ↓
8. Slack: Send Audio Preview to Ben
   - Message: "Episode audio ready for review"
   - Audio Player: Embedded audio link
   - Details: Duration, file size
   - Buttons: [Approve] [Request Changes] [Re-Record]
   - Timeout: 4 hours (until Wednesday 2pm)
   ↓
9. Wait: Until Ben Approves (or timeout)
   ↓ APPROVED
10. Airtable: Update Episode (audio_url, duration, status="Upload Phase")
   ↓
11. context7: Save Audio Details
   ↓
   ↓ REQUEST CHANGES
12. Slack: Modal "What needs to change?"
   - Options: [Re-record entire audio] [Adjust specific section]
   ↓
13. context7: Save Feedback
   ↓
14. (If re-record: loop back to ElevenLabs)
   ↓
   ↓ TIMEOUT (4 hours)
15. Auto-Approve (must upload by 2pm to make Thursday 9am deadline)
   ↓
16. Slack: Notify Ben "Audio auto-approved (deadline approaching)"
```

---

### Phase 5: Upload (Wednesday 2pm)

```
1. Webhook Trigger (receives: phase="upload", episode_id)
   ↓
2. Airtable: Fetch Episode Record (get all data)
   ↓
3. HTTP: Download Audio from URL (if not already downloaded)
   ↓
4. Captivate.fm API: Upload Audio File
   - Endpoint: POST /api/v1/shows/{show_id}/episodes
   - Body: {
       "title": "{episode_title}",
       "show_notes": "{show_notes}",
       "audio_file": "{base64_encoded_audio}",
       "status": "scheduled",
       "publish_date": "{next_thursday_9am_texas_time}"
     }
   - Returns: Episode ID
   ↓
5. Airtable: Update Episode (captivate_episode_id, captivate_url)
   ↓
6. Code: Calculate Publish Time
   - Next Thursday 9:00 AM Texas time (America/Chicago)
   - Convert to UTC for Captivate API
   - Example: Thursday 9am CST = Thursday 3pm UTC (or 2pm UTC if DST)
   ↓
7. Captivate.fm API: Schedule Episode
   - Endpoint: PATCH /api/v1/episodes/{episode_id}
   - Body: { "publish_date": "{thursday_9am_utc}" }
   ↓
8. Airtable: Update Episode (status="Scheduled")
   ↓
9. context7: Save Scheduled Episode
   ↓
10. Slack: Notify Ben
   - Message: "✅ Episode scheduled for Thursday 9:00 AM Texas time"
   - Details: Title, duration, Captivate link
   - Action: [Preview in Captivate.fm] [Unschedule (emergency)]
   ↓
11. Webhook: Register Publish Notification
   - Captivate.fm sends webhook when episode goes live
   - n8n listens for webhook on Thursday 9am
```

---

## Phase 6: Publish Verification (Thursday 9am)

**Note**: This happens in Workflow 1 (Scheduler), not Workflow 2

```
1. Schedule Trigger (Every Thursday 9:10 AM Texas time)
   - 10-minute delay to allow Captivate processing
   ↓
2. Airtable: Get This Week's Episode
   ↓
3. Captivate.fm API: Get Episode Status
   - Check if status = "published"
   ↓ IF PUBLISHED
4. Airtable: Update Episode (status="Live", published_at)
   ↓
5. context7: Save Published Episode
   ↓
6. Slack: Notify Ben
   - Message: "🎉 Episode is LIVE on Apple Podcasts + Spotify!"
   - Links: Apple Podcasts, Spotify, Captivate.fm
   - Analytics: Downloads (if available)
   ↓
   ↓ IF NOT PUBLISHED
7. Slack: Alert Ben "⚠️ Episode did not publish! Check Captivate.fm"
   ↓
8. Airtable: Update Episode (status="Failed")
```

---

## Phase 7: Promotion (Thursday 2pm)

**Note**: Calls Agent 3 (Social Media workflow)

```
1. Schedule Trigger (Every Thursday 2:00 PM Texas time)
   ↓
2. Airtable: Get This Week's Episode
   ↓
3. Code: Build Promotion Payload
   - Episode title
   - Episode summary
   - Episode links (Apple, Spotify)
   - Hashtags (#tax #podcast #smallbusiness #texas)
   ↓
4. Webhook: Call Agent 3 (Social Media)
   - Trigger social media posts for all platforms
   - Agent 3 generates posts and sends to Ben for approval
   ↓
5. Airtable: Update Episode (promotion_status="Sent to Agent 3")
   ↓
6. Slack: Notify Ben
   - Message: "Social media promotion posts sent for approval"
   - Link: Go to Agent 3 Slack thread
```

---

## Airtable Schema (Podcasts Table)

**Table Name**: Podcasts
**Base**: appkZD1ew4aKoBqDM

**Fields**:
| Field Name | Type | Purpose |
|------------|------|---------|
| `episode_number` | Number | Auto-increment |
| `episode_title` | Text | Episode title |
| `selected_topic` | Long Text | Approved topic from research |
| `outline` | Long Text | Episode outline |
| `script` | Long Text | Full episode script |
| `audio_url` | URL | ElevenLabs audio file URL |
| `duration` | Number | Audio length in seconds |
| `captivate_episode_id` | Text | Captivate.fm episode ID |
| `captivate_url` | URL | Captivate.fm episode URL |
| `apple_podcasts_url` | URL | Apple Podcasts link |
| `spotify_url` | URL | Spotify link |
| `status` | Single Select | Research, Outline, Script, Audio, Upload, Scheduled, Live, Completed, Failed |
| `publish_date` | Date | Thursday 9am Texas time |
| `published_at` | DateTime | Actual publish timestamp |
| `research_approved_at` | DateTime | When Ben approved topic |
| `outline_approved_at` | DateTime | When Ben approved outline |
| `script_approved_at` | DateTime | When Ben approved script |
| `audio_approved_at` | DateTime | When Ben approved audio |
| `promotion_status` | Single Select | Pending, Sent, Approved, Posted |
| `downloads_week1` | Number | Week 1 downloads |
| `downloads_total` | Number | Total downloads |
| `notes` | Long Text | Internal notes |
| `created_at` | Created Time | Auto |
| `updated_at` | Last Modified Time | Auto |

---

## ElevenLabs Integration

### Voice Selection: "Josh"
- **Why Josh**: Professional, warm, male voice suitable for tax/finance content
- **Alternatives**: "Antoni" (well-rounded), "Arnold" (authoritative)

### API Details
- **Endpoint**: `POST /v1/text-to-speech/{voice_id}`
- **Voice ID (Josh)**: `TxGEqnHWrfWFTfGW9XjX`
- **Request Body**:
  ```json
  {
    "text": "{full_episode_script}",
    "model_id": "eleven_monolingual_v1",
    "voice_settings": {
      "stability": 0.75,
      "similarity_boost": 0.75,
      "style": 0.5,
      "use_speaker_boost": true
    }
  }
  ```
- **Response**: Audio file URL (MP3, 96kbps)
- **Cost**: ~$0.30 per episode (1000 words = ~$0.30)

---

## Captivate.fm Integration

### Podcast Details
- **Show Name**: "Tax4Us Weekly" (or Ben's chosen name)
- **Show ID**: (To be obtained after Captivate.fm account setup)
- **Distribution**: Apple Podcasts, Spotify, Google Podcasts, Amazon Music, etc.

### API Details
- **Base URL**: `https://api.captivate.fm`
- **Authentication**: API Key (Bearer token)
- **Key Endpoints**:
  1. `GET /api/v1/shows` - List shows
  2. `POST /api/v1/shows/{show_id}/episodes` - Upload episode
  3. `PATCH /api/v1/episodes/{episode_id}` - Update episode (schedule)
  4. `GET /api/v1/episodes/{episode_id}` - Get episode status
  5. `GET /api/v1/episodes/{episode_id}/analytics` - Get download stats

### Webhook Support
- Captivate.fm can send webhooks when episode publishes
- Register webhook URL in Captivate settings
- Payload includes: episode_id, status, published_at

---

## Timezone Handling (CRITICAL)

### Texas Time = America/Chicago
- **CST** (Central Standard Time): UTC-6 (November - March)
- **CDT** (Central Daylight Time): UTC-5 (March - November)

### n8n Schedule Trigger Settings
```json
{
  "triggerTimes": {
    "item": [
      {
        "mode": "everyWeek",
        "hour": 9,
        "minute": 0,
        "dayOfWeek": 4,
        "timezone": "America/Chicago"
      }
    ]
  }
}
```

**Important**: Always use `"timezone": "America/Chicago"` in all schedule triggers!

---

## Estimated Node Count

### Workflow 1 (Scheduler): 15-20 nodes
- Schedule trigger: 2 (Monday, Thursday)
- Airtable: 5 (create episode, check status, update, verify publish, update complete)
- context7: 1 (fetch previous episodes)
- Webhook: 5 (call Workflow 2 for each phase)
- Wait: 4 (Monday 2pm, Tuesday 10am, Wednesday 10am, Wednesday 2pm)
- Slack: 2 (notify live, alert failed)
- IF: 2 (check approved, check published)

### Workflow 2 (Content Pipeline): 40-50 nodes
- Webhook trigger: 1
- IF: 5 (phase routing, approval handling)
- Airtable: 10 (read episode, update status, save data)
- context7: 6 (fetch history, save context for each phase)
- Tavily: 2 (trending topics, deep research)
- OpenAI: 3 (topics, outline, script)
- ElevenLabs: 1 (audio generation)
- Captivate.fm HTTP: 3 (upload, schedule, verify)
- Slack: 12 (approvals, reminders, notifications)
- Code: 8 (payload builders, formatters, calculators)
- Wait: 4 (approval timeouts)

**Total**: 55-70 nodes across 2 workflows

---

## Build Plan

### Phase 1: Workflow 1 (Scheduler) - 2-3 hours
1. Create workflow "WF: Podcast Producer - Weekly Scheduler"
2. Add Monday 10am schedule trigger
3. Add Airtable episode creation
4. Add webhook calls to Workflow 2
5. Add Wait nodes with correct times
6. Test scheduling logic (dry run)

### Phase 2: Workflow 2 (Research + Outline) - 3-4 hours
1. Create workflow "WF: Podcast Producer - Content Pipeline"
2. Add webhook trigger with phase routing
3. Implement Research phase (Tavily + OpenAI + Slack approval)
4. Implement Outline phase (OpenAI + Slack approval)
5. Test with Workflow 1

### Phase 3: Workflow 2 (Script + Audio) - 3-4 hours
1. Implement Script phase (OpenAI + Slack approval)
2. Implement Audio phase (ElevenLabs + Slack approval)
3. Add audio download and storage
4. Test end-to-end (Research → Audio)

### Phase 4: Workflow 2 (Upload) + Captivate.fm - 2-3 hours
1. Set up Captivate.fm account (if not done)
2. Implement Upload phase (Captivate.fm API)
3. Implement schedule logic (Thursday 9am Texas time)
4. Add publish verification
5. Test with Captivate.fm staging

### Phase 5: Integration + Testing - 2-3 hours
1. Connect Workflow 1 + Workflow 2
2. Add Agent 3 promotion trigger
3. End-to-end testing (full week simulation)
4. Timezone verification (Thursday 9am CST/CDT)
5. Ben approval testing

**Total Build Time**: 12-17 hours (estimate: 10-12 hours for experienced developer)

---

## Success Criteria

- ✅ Episodes publish every Thursday 9:00 AM Texas time (CRITICAL)
- ✅ Ben receives approval requests at 5 checkpoints
- ✅ Auto-approve works if Ben doesn't respond
- ✅ Reminders sent if approval pending
- ✅ context7 prevents topic repetition
- ✅ ElevenLabs audio quality acceptable
- ✅ Captivate.fm auto-distributes to Apple + Spotify
- ✅ Social media promotion triggered after publish
- ✅ Workflow recovers from failures (idempotent)

---

## Risks & Mitigation

### Risk 1: Thursday 9am Deadline Missed
**Impact**: CRITICAL - defeats entire purpose
**Mitigation**:
- Auto-approve audio by Wednesday 2pm if no response
- Send urgent Slack alert Wednesday 1pm if still waiting
- Have emergency manual publish procedure documented

### Risk 2: ElevenLabs API Failure
**Impact**: HIGH - no audio = no episode
**Mitigation**:
- Retry logic (up to 3 attempts)
- Alert Ben immediately if ElevenLabs fails
- Fallback: Use Google Text-to-Speech (lower quality but functional)

### Risk 3: Captivate.fm API Issues
**Impact**: HIGH - episode won't publish
**Mitigation**:
- Test Captivate.fm integration thoroughly
- Have Ben's Captivate.fm login credentials for manual upload
- Verify publish webhook is working

### Risk 4: Timezone Confusion
**Impact**: MEDIUM - episode publishes at wrong time
**Mitigation**:
- Always use `America/Chicago` timezone
- Test during DST transition (March and November)
- Add timezone verification in Slack messages

### Risk 5: Approval Bottleneck
**Impact**: MEDIUM - Ben busy, can't approve in time
**Mitigation**:
- Clear timeout rules (auto-approve after 4-24 hours)
- Reminders sent before auto-approve
- Allow Ben to pre-approve upcoming episodes

---

## Next Steps

1. ✅ Complete design document (DONE)
2. ⏭️ Set up Captivate.fm account (Ben's task)
3. ⏭️ Get Captivate.fm API key
4. ⏭️ Set up ElevenLabs account (if not done)
5. ⏭️ Create Airtable Podcasts table with fields
6. ⏭️ Build Workflow 1 (Scheduler)
7. ⏭️ Build Workflow 2 (Content Pipeline) - Phase by phase
8. ⏭️ Test full week cycle (Monday → Thursday)
9. ⏭️ Test timezone (verify Thursday 9am Texas time)
10. ⏭️ Deploy to production
11. ⏭️ Update Agent 4 note in Boost.space (ID: 295)

---

## Questions for Ben

1. **Podcast Name**: What should the podcast be called? "Tax4Us Weekly"? Something else?
2. **Episode Length**: 5-10 minutes ideal? Or prefer shorter/longer?
3. **Voice**: Okay with "Josh" from ElevenLabs? Or want to test other voices?
4. **Captivate.fm**: Do you already have an account? Or need to set up?
5. **Approval Timing**: Are the approval timeouts reasonable? (4-24 hours)
6. **Auto-Approve**: Comfortable with auto-approve if you don't respond by deadline?
7. **Show Notes**: Should AI generate show notes too? Or just title + description?
8. **Music**: Need intro/outro music? Or voice-only?
9. **Emergency Contact**: Who should be alerted if Thursday 9am deadline at risk?
10. **First Episode**: When do you want to start? Next Thursday? Or week after?

---

**This is the MOST CRITICAL workflow. Thursday 9:00 AM Texas time is non-negotiable.**
