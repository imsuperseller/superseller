# 📚 MASTER TEMPLATE CATALOG

**Last Updated**: December 2025
**Purpose**: Complete inventory of all available workflow templates

---

## 🎯 CATEGORY OVERVIEW

### 00. Utility Belt (Infrastructure)
**Purpose**: Use in EVERY client project
**Status**: ✅ Complete

### 01. Growth Engine (Sales & Outreach)
**Purpose**: Lead generation, prospecting, email automation
**Status**: 🚧 In Progress

### 02. Content Factory (Marketing)
**Purpose**: Content creation, repurposing, social media
**Status**: 🚧 In Progress

### 03. Operations Brain (Admin & Support)
**Purpose**: Support automation, knowledge base, voice AI
**Status**: 🚧 In Progress

---

## 00. UTILITY BELT

### `util_error_handler.json`
**Purpose**: Centralized error handling and alerting
**Input**: Error node data
**Output**: Slack/Discord/Telegram alert with "Fix it" link
**Dependencies**: None
**Cost**: $0.00
**Status**: ✅ Ready

**Usage**: Connect Error Trigger from any workflow

---

### `util_cost_calculator.json`
**Purpose**: Track LLM API costs for client billing
**Input**: Token usage data from LLM nodes
**Output**: Logs to Google Sheet/Airtable with cost breakdown
**Dependencies**: Google Sheets or Airtable
**Cost**: $0.00
**Status**: ✅ Ready

**Usage**: Call after every LLM node execution

---

### `util_human_approval.json`
**Purpose**: Pause workflow for human review
**Input**: Data to review
**Output**: Slack message with Approve/Reject buttons
**Dependencies**: Slack webhook
**Cost**: $0.00
**Status**: ✅ Ready

**Usage**: Call before critical actions (sending emails, posting content)

---

## 01. GROWTH ENGINE (Sales & Outreach)

### `func_enrich_company.json`
**Purpose**: Enrich company data from website/name
**Input**: `{"action": "enrich_company", "payload": {"domain": "example.com"}}`
**Output**: `{"ceo": "John Doe", "recentNews": "...", "techStack": [...]}`
**Dependencies**: Apollo/Clay API, Perplexity API, caching DB
**Cost**: $0.05 per call (cached: $0.00)
**Status**: 🚧 In Progress

**Caching**: Checks Supabase/Airtable first, only calls API if not cached

---

### `func_scrape_linkedin_profile.json`
**Purpose**: Extract LinkedIn profile data
**Input**: `{"action": "scrape_linkedin", "payload": {"url": "linkedin.com/in/johndoe"}}`
**Output**: `{"workHistory": [...], "recentPosts": [...], "about": "..."}`
**Dependencies**: LinkedIn scraping API (Apify/Phantombuster)
**Cost**: $0.02 per profile
**Status**: 🚧 In Progress

---

### `func_generate_icebreaker.json`
**Purpose**: Generate personalized opening line
**Input**: `{"action": "generate_icebreaker", "payload": {"prospectData": {...}}}`
**Output**: `{"icebreaker": "One sentence personalized opening"}`
**Dependencies**: Claude 3.5 Sonnet or GPT-4
**Cost**: $0.01 per generation
**Status**: 🚧 In Progress

---

### `func_check_email_validity.json`
**Purpose**: Validate email address before sending
**Input**: `{"action": "validate_email", "payload": {"email": "user@example.com"}}`
**Output**: `{"valid": true, "score": 0.95, "reason": "..."}`
**Dependencies**: NeverBounce API or similar
**Cost**: $0.001 per validation
**Status**: 🚧 In Progress

---

### `func_send_smart_email.json`
**Purpose**: Send email with domain throttling
**Input**: `{"action": "send_email", "payload": {"to": "...", "subject": "...", "body": "...", "campaignId": "..."}}`
**Output**: `{"sent": true, "messageId": "...", "delay": 5}`
**Dependencies**: Gmail/Outlook API
**Cost**: $0.00
**Status**: 🚧 In Progress

**Smart Features**:
- Delays if multiple emails to same domain
- Tracks campaign ID
- Respects rate limits

---

### `agent_sales_orchestrator.json` (Example Parent)
**Purpose**: AI Agent that orchestrates sales outreach
**Instructions**: "Find CEO of [Company], research them, draft personalized email, validate email, send"
**Dependencies**: All func_* workflows above
**Cost**: Variable (depends on functions called)
**Status**: 🚧 In Progress

**Example Flow**:
1. Call `func_enrich_company`
2. Call `func_scrape_linkedin_profile`
3. Call `func_generate_icebreaker`
4. Call `func_check_email_validity`
5. Call `func_send_smart_email`

---

## 02. CONTENT FACTORY (Marketing)

### `func_transcribe_video.json`
**Purpose**: Transcribe video to timestamped text
**Input**: `{"action": "transcribe", "payload": {"url": "youtube.com/watch?v=..."}}`
**Output**: `{"transcript": "...", "timestamps": [...]}`
**Dependencies**: Whisper API or Deepgram
**Cost**: $0.006 per minute
**Status**: 🚧 In Progress

---

### `func_repurpose_content.json`
**Purpose**: Repurpose content for different platforms
**Input**: `{"action": "repurpose", "payload": {"text": "...", "platform": "linkedin"}}`
**Output**: `{"content": "...", "format": "thread"}` or `{"content": "...", "format": "long-form"}`
**Dependencies**: Claude 3.5 Sonnet or GPT-4
**Cost**: $0.02 per repurpose
**Status**: 🚧 In Progress

---

### `func_image_generator.json`
**Purpose**: Generate images for content
**Input**: `{"action": "generate_image", "payload": {"prompt": "...", "aspectRatio": "16:9"}}`
**Output**: `{"imageUrl": "...", "prompt": "..."}`
**Dependencies**: Midjourney API, Flux API, or DALL-E 3
**Cost**: $0.04 per image
**Status**: 🚧 In Progress

---

### `func_auto_post_social.json`
**Purpose**: Post to social media platforms
**Input**: `{"action": "post", "payload": {"platform": "linkedin", "text": "...", "mediaUrl": "..."}}`
**Output**: `{"posted": true, "postId": "...", "url": "..."}`
**Dependencies**: LinkedIn API, X API, Instagram API
**Cost**: $0.00
**Status**: 🚧 In Progress

**Platforms Supported**:
- LinkedIn
- X (Twitter)
- Instagram

---

### `func_seo_checker.json`
**Purpose**: Check SEO metrics and suggest keywords
**Input**: `{"action": "check_seo", "payload": {"keyword": "...", "content": "..."}}`
**Output**: `{"keywordDensity": 0.05, "suggestions": [...], "score": 85}`
**Dependencies**: Semrush API or Ahrefs API
**Cost**: $0.10 per check
**Status**: 🚧 In Progress

---

### `agent_content_manager.json` (Example Parent)
**Purpose**: AI Agent that manages content pipeline
**Instructions**: "Take YouTube video, transcribe, repurpose for LinkedIn/X/Blog, generate images, schedule posts"
**Dependencies**: All func_* workflows above
**Cost**: Variable
**Status**: 🚧 In Progress

**Example Flow**:
1. Call `func_transcribe_video`
2. Loop: Call `func_repurpose_content` for each platform
3. Loop: Call `func_image_generator` for each piece
4. Loop: Call `func_auto_post_social` for each platform

---

## 03. OPERATIONS BRAIN (Admin & Support)

### `func_rag_search_internal.json`
**Purpose**: Search internal knowledge base
**Input**: `{"action": "rag_search", "payload": {"query": "How do I reset password?"}}`
**Output**: `{"results": [{"chunk": "...", "score": 0.95}, ...], "top3": [...]}`
**Dependencies**: Vector DB (Pinecone, Weaviate), Notion/Drive
**Cost**: $0.001 per search
**Status**: 🚧 In Progress

---

### `func_classify_ticket.json`
**Purpose**: Classify support tickets automatically
**Input**: `{"action": "classify", "payload": {"ticketText": "..."}}`
**Output**: `{"category": "Billing", "urgency": "Medium", "confidence": 0.92}`
**Dependencies**: GPT-4 or Claude
**Cost**: $0.01 per classification
**Status**: 🚧 In Progress

**Categories**: Urgent, Billing, Technical, Feature Request, Bug

---

### `func_voice_synthesizer.json`
**Purpose**: Generate voice audio from text
**Input**: `{"action": "synthesize", "payload": {"text": "...", "voice": "professional"}}`
**Output**: `{"audioUrl": "...", "duration": 30}`
**Dependencies**: ElevenLabs API
**Cost**: $0.18 per 1000 characters
**Status**: 🚧 In Progress

---

### `func_calendar_check.json`
**Purpose**: Check calendar availability
**Input**: `{"action": "check_calendar", "payload": {"timeRange": "2025-12-10T09:00:00Z/2025-12-10T17:00:00Z"}}`
**Output**: `{"freeSlots": ["2025-12-10T10:00:00Z", ...], "busy": [...]}`
**Dependencies**: Google Calendar API or Outlook API
**Cost**: $0.00
**Status**: 🚧 In Progress

---

### `func_pdf_parser.json`
**Purpose**: Extract structured data from PDFs
**Input**: `{"action": "parse_pdf", "payload": {"pdfUrl": "..."}}`
**Output**: `{"totalAmount": 1000, "date": "2025-12-06", "vendor": "..."}`
**Dependencies**: PDF parsing API (Unstructured.io, Adobe PDF Services)
**Cost**: $0.05 per PDF
**Status**: 🚧 In Progress

---

### `agent_support_triaging.json` (Example Parent)
**Purpose**: AI Agent that triages support tickets
**Instructions**: "When email comes in, classify it. If Billing, search knowledge base for refund policy, draft reply, ask human to approve"
**Dependencies**: All func_* workflows above
**Cost**: Variable
**Status**: 🚧 In Progress

**Example Flow**:
1. Call `func_classify_ticket`
2. If category = "Billing":
   - Call `func_rag_search_internal`
   - Draft reply using LLM
   - Call `util_human_approval`
3. Send approved reply

---

## 📊 TEMPLATE USAGE MATRIX

| Template | Growth Engine | Content Factory | Operations Brain |
|----------|---------------|-----------------|------------------|
| `util_error_handler` | ✅ Required | ✅ Required | ✅ Required |
| `util_cost_calculator` | ✅ Required | ✅ Required | ✅ Required |
| `util_human_approval` | ⚠️ Recommended | ⚠️ Recommended | ✅ Required |
| `func_enrich_company` | ✅ Core | ❌ | ❌ |
| `func_send_smart_email` | ✅ Core | ❌ | ⚠️ Optional |
| `func_transcribe_video` | ❌ | ✅ Core | ❌ |
| `func_rag_search_internal` | ❌ | ❌ | ✅ Core |
| `func_classify_ticket` | ❌ | ❌ | ✅ Core |

---

## 🔄 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2025 | Initial catalog creation |

---

**Next Steps**: See `IMPLEMENTATION_GUIDE.md` for how to use these templates in client projects.
