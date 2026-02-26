# 🎬 RENSTO CONTENT AI - System Overview

**Status**: 🚧 In Development
**Launch Date**: TBD (6-8 weeks)
**Service Type**: Ready Solutions - Content Creator Package
**Target Market**: YouTubers, Content Creators, Marketing Agencies

---

## Executive Summary

**SuperSeller AI Content AI** is an AI-powered content processing system that transforms any content (YouTube videos, PDFs, documents, podcasts) into viral scripts, summaries, blog posts, and provides RAG-powered chatbot capabilities.

**Value Proposition**: *"Transform any content into viral gold in minutes"*

---

## Core Features

### 1. **Multi-Format Content Ingestion**
- YouTube video transcription (via Apify + Gemini)
- PDF/Document extraction (via Gemini multimodal)
- Image OCR processing
- Audio transcription
- Web page scraping (via FireCrawl)

### 2. **RAG-Powered Content Chat**
- Chat with your uploaded content
- Context-aware AI responses
- Multi-turn conversations with memory
- Source citations
- Powered by LightRAG + OpenAI

### 3. **Viral Content Generation**
- TikTok scripts (30-60 sec)
- Instagram Reel scripts (15-30 sec)
- YouTube Short scripts (60 sec)
- Twitter threads (10 tweets)
- Blog posts (1500-2000 words)
- Email newsletters

### 4. **Content Library & Management**
- Organized content dashboard
- Search across all content
- Tag and categorize
- Export options

---

## Technical Architecture

### Infrastructure Stack

```
┌─────────────────────────────────────────┐
│      RENSTO CONTENT AI SYSTEM           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Customer Portal (Next.js)      │   │
│  │  - Upload Interface             │   │
│  │  - Chat Interface               │   │
│  │  - Content Dashboard            │   │
│  │  - Generator Tools              │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │  n8n Workflows                  │   │
│  │  - RDY-CONTENT-001: YouTube     │   │
│  │  - RDY-CONTENT-002: Documents   │   │
│  │  - RDY-CONTENT-003: RAG Chat    │   │
│  │  - RDY-CONTENT-004: Scripts     │   │
│  │  - RDY-CONTENT-005: Blogs       │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │  AI Processing Layer            │   │
│  │  - OpenAI GPT-4o-mini (primary) │   │
│  │  - OpenAI text-embed-3-small    │   │
│  │  - Gemini API (transcription)   │   │
│  │  - LightRAG (vectors)           │   │
│  └─────────────────────────────────┘   │
│              ↓                          │
│  ┌─────────────────────────────────┐   │
│  │  Data Storage                   │   │
│  │  - n8n Data Tables (primary)    │   │
│  │  - Airtable (dashboards)        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Technology Stack

**AI/ML:**
- **OpenAI** (cloud LLMs)
  - `gpt-4o-mini` - Content generation ($0.15/$0.60 per 1M tokens)
  - `text-embedding-3-small` - Embeddings ($0.02 per 1M tokens)
- **Gemini API** - Transcription, OCR, fallback processing
- **LightRAG** - Vector storage and retrieval

**Processing:**
- **n8n** - Workflow automation engine
- **Apify** - YouTube transcript extraction
- **FireCrawl** - Web scraping
- **Tavily** - Research API

**Storage:**
- **n8n Data Tables** - Primary operational data (Tier 1)
- **Airtable** - Customer dashboards and reporting (Tier 2)
- **Local Files** - LightRAG vector indices

**Infrastructure:**
- **VPS**: 172.245.56.50 (existing n8n server)
- **Docker**: n8n container
- **HTTPS**: Cloudflare Tunnel (n8n.superseller.agency)
- **AI**: OpenAI API (no local hosting required)

---

## n8n Workflows

### RDY-CONTENT-001: YouTube Video Processor
**Purpose**: Extract and process YouTube video transcripts

**Flow**:
```
Webhook (YouTube URL) →
HTTP Request (metadata) →
Apify (transcript) →
Code (clean) →
Text Splitter (1000 chars) →
OpenAI Embeddings →
LightRAG Insert →
Store in Data Table →
Respond
```

**Input**: `{ url: "https://youtube.com/watch?v=..." }`
**Output**: `{ transcript, word_count, processing_time }`

---

### RDY-CONTENT-002: PDF/Document Processor
**Purpose**: Extract text from documents

**Flow**:
```
Webhook (file upload) →
Read Binary File →
Gemini (extract text) →
Text Splitter →
OpenAI Embeddings →
LightRAG Insert →
Store in Data Table →
Respond
```

**Supported Formats**: PDF, DOCX, images (OCR), TXT

---

### RDY-CONTENT-003: RAG Chat Handler
**Purpose**: Chat with uploaded content

**Flow**:
```
Webhook (chat message) →
LightRAG Query (retrieve context) →
AI Agent (OpenAI GPT-4o-mini) →
  - System: "Use context to answer"
  - Tools: [LightRAG Retriever]
  - Memory: Window Buffer (10 messages)
Store chat →
Respond
```

**Features**:
- Multi-turn conversations
- Context-aware responses
- Source citations
- Conversation history

---

### RDY-CONTENT-004: Viral Script Generator
**Purpose**: Generate platform-specific scripts

**Flow**:
```
Webhook (content + platform) →
AI Chain (OpenAI GPT-4o-mini) →
  Prompt: "Generate {platform} script..."
Store generated script →
Respond
```

**Platforms Supported**:
- **TikTok**: 150 words, 30-60 sec, vertical format
- **Instagram Reel**: 100 words, 15-30 sec
- **YouTube Short**: 200 words, 60 sec
- **Twitter Thread**: 280 chars × 10 tweets

**Script Structure**:
1. Hook (first 3 seconds)
2. 3 key points
3. Call-to-action

---

### RDY-CONTENT-005: Blog/Newsletter Generator
**Purpose**: Generate long-form content

**Flow**:
```
Webhook (topic + sources) →
Tavily (research) →
LightRAG Query (user content) →
AI Chain (OpenAI GPT-4o-mini) →
  Prompt: "Write SEO blog post..."
Store generated blog →
Respond
```

**Blog Structure**:
- Title & meta description
- Introduction with hook
- 5 main sections (H2/H3)
- Conclusion with CTA
- 1500-2000 words
- SEO optimized

---

## Data Models

### n8n Data Tables

#### `content_uploads`
```typescript
{
  id: string (auto)
  customer_id: string
  type: 'youtube' | 'pdf' | 'document' | 'audio'
  url: string
  status: 'processing' | 'completed' | 'failed'
  file_size: number
  created_at: datetime
}
```

#### `transcripts`
```typescript
{
  id: string (auto)
  upload_id: string (FK → content_uploads)
  content: text
  word_count: number
  language: string
  created_at: datetime
}
```

#### `generated_content`
```typescript
{
  id: string (auto)
  upload_id: string (FK → content_uploads)
  type: 'script' | 'blog' | 'newsletter' | 'thread'
  platform: string
  content: text
  word_count: number
  created_at: datetime
}
```

#### `chat_sessions`
```typescript
{
  id: string (auto)
  customer_id: string
  messages: json[]
  last_message_at: datetime
  created_at: datetime
}
```

#### `rag_embeddings`
```typescript
{
  id: string (auto)
  content_id: string (FK → content_uploads)
  chunk_index: number
  chunk_text: text
  embedding: vector (stored in LightRAG)
  metadata: json
  created_at: datetime
}
```

---

## Pricing Model

### Three Tiers

#### **Basic - $297/month**
- 50 content uploads/month
- 10 GB storage
- YouTube + PDF processing
- RAG chat (1000 messages/month)
- 50 script generations/month
- Email support
- **Target**: Individual creators

#### **Professional - $697/month** ⭐ RECOMMENDED
- 250 content uploads/month
- 50 GB storage
- All content types
- RAG chat (unlimited messages)
- 250 script generations/month
- 50 blog posts/month
- Priority support
- Slack integration
- **Target**: Agencies, teams

#### **Enterprise - $1,997/month**
- Unlimited uploads
- 500 GB storage
- All features
- White-label option
- Custom workflows
- Priority OpenAI processing
- API access
- Dedicated support
- **Target**: Large agencies, brands

### Add-ons
- **Extra Storage**: $10/10GB
- **Extra Processing**: $50/100 uploads
- **Custom Model Training**: $500 one-time
- **White-Label Setup**: $2,000 one-time

---

## API Endpoints

### Base URL
`https://api.superseller.agency/v1/content-ai`

### Authentication
```
Authorization: Bearer {customer_token}
```

### Endpoints

#### `POST /upload`
Upload content for processing

**Request**:
```json
{
  "type": "youtube",
  "url": "https://youtube.com/watch?v=..."
}
```

**Response**:
```json
{
  "upload_id": "uuid",
  "status": "processing",
  "estimated_time": "2 minutes"
}
```

---

#### `POST /process/youtube`
Process YouTube video

**Request**:
```json
{
  "url": "https://youtube.com/watch?v=...",
  "options": {
    "extract_chapters": true,
    "generate_summary": true
  }
}
```

---

#### `POST /process/document`
Process document (PDF, DOCX, image)

**Request**:
```json
{
  "file": "base64_encoded_file",
  "type": "pdf"
}
```

---

#### `POST /chat`
Chat with RAG-powered bot

**Request**:
```json
{
  "session_id": "uuid",
  "message": "Summarize this video",
  "context": ["upload_id_1", "upload_id_2"]
}
```

**Response**:
```json
{
  "response": "Based on the video, ...",
  "sources": ["video_1_chunk_3", "video_1_chunk_7"],
  "confidence": 0.89
}
```

---

#### `POST /generate/script`
Generate viral script

**Request**:
```json
{
  "content_id": "upload_id",
  "platform": "tiktok",
  "tone": "enthusiastic",
  "length": "30_seconds"
}
```

**Response**:
```json
{
  "script": "🎬 Hook: Did you know...\n\n📌 Point 1: ...\n\n...",
  "word_count": 150,
  "estimated_duration": "32 seconds"
}
```

---

#### `POST /generate/blog`
Generate blog post

**Request**:
```json
{
  "topic": "Content Marketing Trends 2025",
  "sources": ["upload_id_1", "upload_id_2"],
  "keywords": ["SEO", "video marketing"],
  "tone": "professional"
}
```

---

#### `GET /library/:customerId`
Get customer's content library

**Response**:
```json
{
  "uploads": [...],
  "total_count": 247,
  "storage_used": "12.4 GB",
  "monthly_limit": "50 GB"
}
```

---

## Webhook URLs

### Production (n8n.superseller.agency)
- **YouTube**: `https://n8n.superseller.agency/webhook/content-youtube`
- **Document**: `https://n8n.superseller.agency/webhook/content-document`
- **Chat**: `https://n8n.superseller.agency/webhook/content-chat`
- **Script Gen**: `https://n8n.superseller.agency/webhook/content-script`
- **Blog Gen**: `https://n8n.superseller.agency/webhook/content-blog`

---

## Performance Metrics

### Target SLAs

**Processing Times**:
- YouTube video (10 min): <2 minutes
- PDF (50 pages): <1 minute
- RAG chat response: <3 seconds
- Script generation: <10 seconds
- Blog generation: <30 seconds

**Availability**:
- Uptime: 99.5%
- API response time: <500ms (p95)

**Storage**:
- Per customer average: 20 GB
- Text storage (n8n): Unlimited
- Vector storage (LightRAG): 100GB total

---

## Business Metrics

### Year 1 Goals

**Customers**:
- Month 3: 10 customers (beta)
- Month 6: 50 customers
- Month 12: 150 customers

**Revenue** (assuming avg $697/customer):
- Month 3: $6,970 MRR
- Month 6: $34,850 MRR
- Month 12: $104,550 MRR = **$1.25M ARR**

**Margins**:
- Infrastructure costs: $50-500/month (OpenAI API, scales with usage)
- Gross margin: 70-85% (varies with volume)
- Net profit margin: 55-70% (after support and API costs)

---

## Implementation Status

### Phase 1: Infrastructure Setup (Week 1) ✅
- [x] Evaluate AI providers (Ollama vs OpenAI)
- [x] Decided on OpenAI API for speed-to-market
- [x] OpenAI credentials configured in n8n
- [ ] Create n8n Data Tables
- [ ] Test basic AI workflow with OpenAI

### Phase 2: Core Workflows (Weeks 2-3)
- [ ] Build RDY-CONTENT-001 (YouTube)
- [ ] Build RDY-CONTENT-002 (Documents)
- [ ] Build RDY-CONTENT-003 (RAG Chat)
- [ ] Build RDY-CONTENT-004 (Scripts)
- [ ] Build RDY-CONTENT-005 (Blogs)

### Phase 3: Customer Portal (Week 4)
- [ ] Build upload interface
- [ ] Build chat interface
- [ ] Build content dashboard
- [ ] Build generator tools
- [ ] API integration

### Phase 4: Documentation & Launch (Weeks 5-6)
- [x] Technical documentation (this file)
- [ ] User guide
- [ ] API documentation
- [ ] Marketing materials
- [ ] Beta launch (10 customers)

---

## Competition Analysis

### Poppy AI
**Pricing**: $300-399/year ($25-27/month)
**Strengths**: Visual canvas interface, multi-AI models
**Weaknesses**: Manual process, no automation

**SuperSeller AI's Advantage**:
- **Lower price**: $297/month vs $399/year (but more features)
- **Automation**: Workflows automate entire process
- **RAG included**: Poppy doesn't have RAG chat
- **Brand**: SuperSeller AI's automation expertise

### Other Competitors
- **Descript**: $30/month (focused on video editing)
- **Jasper**: $49/month (focused on copywriting)
- **ChatGPT Plus**: $20/month (no specialized content tools)

**Differentiation**: We're the only solution combining **content processing + automation + RAG + generation** in one platform.

---

## Security & Compliance

### Data Protection
- All content encrypted at rest
- HTTPS for all API calls
- Per-customer data isolation
- GDPR compliant data handling

### Content Moderation
- Terms of service enforcement
- Copyright violation checks
- Spam/abuse detection
- Content filtering (optional)

---

## Support & Training

### Customer Onboarding
1. **Welcome Email** (automated)
2. **Setup Call** (15 min)
3. **First Upload Walkthrough**
4. **Weekly Check-in** (first month)

### Documentation
- Video tutorials (YouTube)
- Written guides (Notion)
- API documentation (this file)
- FAQ & troubleshooting

### Support Channels
- **Basic**: Email (24hr response)
- **Pro**: Email + Slack (12hr response)
- **Enterprise**: Email + Slack + Phone (4hr response)

---

## Future Roadmap

### Q2 2025 (Post-Launch)
- Audio podcast processing
- Collaboration features (teams)
- Advanced analytics dashboard
- A/B testing for content

### Q3 2025
- Multi-language support
- Mobile app (iOS/Android)
- Video generation (AI-powered)
- Integration marketplace

### Q4 2025
- White-label platform
- Agency partnerships
- API marketplace
- Education/courses

---

## Contact & Resources

**Project Lead**: Shai Friedman (shai@superseller.agency)
**Technical Documentation**: `/docs/products/CONTENT_AI_TECHNICAL_DOCUMENTATION.md`
**User Guide**: `/docs/products/CONTENT_AI_USER_GUIDE.md`
**API Docs**: This file (API Endpoints section)

**n8n Instance**: https://n8n.superseller.agency
**Customer Portal**: https://superseller.agency/content-ai (coming soon)

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0-alpha
**Status**: 🚧 In Development
