# Agent Production Readiness Audit
**Purpose**: Ensure all 7 crew members are production-ready before accepting paying customers
**Date**: February 23, 2026
**Authority**: Blocks Phase 3 of FB Marketplace Integration (cannot accept customers until agents pass audit)

---

## The Problem

We've built pricing ($299/$699/$1499), added Market as the 7th crew member, and updated marketing copy — but we haven't verified that each agent delivers a **flawless customer experience** worthy of the price.

**Customer mindset when they pay $299/mo**:
- "This better work perfectly"
- "If it fails, I want my money back"
- "Why am I paying for this when [competitor] does it better?"

**Missing verification**:
- ❌ End-to-end testing for each agent
- ❌ Error handling (what happens when API fails?)
- ❌ Notification system (does customer know what's happening?)
- ❌ Prompt optimization (are outputs high quality?)
- ❌ Model version stability (are we using latest/best models?)
- ❌ Credit deduction accuracy (charged correctly?)
- ❌ Performance benchmarks (how fast is it?)
- ❌ Edge case handling (bad inputs, rate limits, timeouts)

---

## Agent Inventory & Current Status

| Agent | Status | Credit Cost | API Dependencies | Tested? | Production Ready? |
|-------|--------|-------------|------------------|---------|-------------------|
| **Forge** (Video Producer) | ✅ Live | 50 | Kie.ai Kling 3.0, Suno, Gemini, FFmpeg | ⚠️ Partial | ❌ Unknown |
| **Spoke** (Spokesperson) | ✅ Live | 50 | Kie.ai Kling 3.0, Gemini, HeyGen fallback | ⚠️ Partial | ❌ Unknown |
| **Market** (Marketplace Automation) | ⚠️ Just Added | 25 | Kie.ai Seedream, Gemini, GoLogin, Puppeteer | ❌ No | ❌ No |
| **FrontDesk** (AI Receptionist) | 🔜 Coming Soon | 5 | Telnyx AI Voice, Gemini | ❌ No | ❌ No |
| **Scout** (Lead Hunter) | 🔜 Coming Soon | 15 | TBD (Apify? Clay? n8n?) | ❌ No | ❌ No |
| **Buzz** (Content Creator) | 🔜 Coming Soon | 10 | TBD (social APIs, Gemini) | ❌ No | ❌ No |
| **Cortex** (Analyst) | 🔜 Coming Soon | 2 | Ollama nomic-embed, pgvector, Gemini | ⚠️ RAG tested | ❌ No |

**Reality**: Only **2 agents** (Forge, Spoke) are "live", and even those haven't passed a formal production readiness audit.

---

## Production Readiness Checklist (Per Agent)

### 1. Functional Testing
- [ ] **Happy path works**: Standard input → expected output, no errors
- [ ] **Edge cases handled**: Empty input, malformed data, oversized files, special characters
- [ ] **API failures gracefully handled**: Kie.ai timeout, Gemini rate limit, model unavailable
- [ ] **Retry logic works**: Transient failures retry with exponential backoff
- [ ] **Fallback models work**: If primary model fails, fallback produces acceptable output
- [ ] **Credit deduction accurate**: Customer charged exactly the amount advertised (no overcharging)

### 2. Error Handling & Recovery
- [ ] **User-facing error messages**: Clear, actionable ("Your video is processing, check back in 5 min" vs "Error 500")
- [ ] **Logging & monitoring**: All errors logged to Postgres, alerting set up for critical failures
- [ ] **Manual intervention path**: If automation fails, admin can manually complete task
- [ ] **Refund/credit policy**: If agent fails, customer gets credits refunded automatically
- [ ] **Max retry limit**: Prevents infinite loops (e.g., max 3 retries before marking as failed)

### 3. Notifications & User Experience
- [ ] **WhatsApp notifications work**: Customer gets notified when task starts, completes, or fails
- [ ] **Status tracking**: Customer can see real-time progress (queued → processing → complete)
- [ ] **Delivery method works**: Video delivered via WhatsApp/email/dashboard download
- [ ] **Quality preview**: Customer can approve/reject output before credits deducted (if applicable)
- [ ] **Turnaround time communicated**: "Your video will be ready in 3-5 minutes" (accurate estimate)

### 4. Prompt Optimization & Quality
- [ ] **Prompt version tracked**: All prompts versioned in code (Gemini v2.5 Flash prompt for Forge = v1.2.3)
- [ ] **Output quality benchmarked**: Sample outputs reviewed by human (does it meet quality bar?)
- [ ] **Competitor comparison**: Output quality matches or exceeds competitors (Opus Clip, Descript, etc.)
- [ ] **Brand consistency**: Tone, style, format align with customer's brand (if customizable)
- [ ] **A/B testing ready**: Can swap prompts/models and measure quality improvement

### 5. Performance & Scalability
- [ ] **Speed benchmarked**: P50, P95, P99 latency measured (e.g., Forge video: P95 = 4 min)
- [ ] **Rate limit handling**: Kie.ai 100 req/min, Gemini 60 req/min — queuing works under load
- [ ] **Cost per task measured**: Actual API cost vs. credit price (is margin positive?)
- [ ] **Concurrent task limit**: Can handle 10 customers requesting videos simultaneously?
- [ ] **Storage costs tracked**: R2 storage, egress bandwidth monitored

### 6. Billing & Credit Accuracy
- [ ] **Credit cost documented**: Advertised cost matches actual deduction (Forge = 50 credits)
- [ ] **Transaction logging**: Every credit deduction logged in CreditTransaction table
- [ ] **Insufficient credits handled**: Customer sees "Not enough credits, upgrade plan" before task starts
- [ ] **Overage protection**: Prevent charging more than advertised (if task uses extra API calls, absorb cost)
- [ ] **Refund flow tested**: Failed task triggers automatic credit refund

### 7. Security & Data Privacy
- [ ] **Data isolation**: Customer A cannot see Customer B's videos/leads/content
- [ ] **PII handling**: Phone numbers, addresses, names stored securely, not logged in plain text
- [ ] **API key security**: Kie.ai, Gemini keys not exposed in client-side code or logs
- [ ] **Content ownership**: Customer owns all generated assets (videos, images, text)
- [ ] **GDPR/CCPA compliance**: Customer can delete all their data on request

---

## Agent-Specific Audit Plans

### Forge (Video Producer) - 50 credits/video

**Current Stack**: Zillow scraper → Gemini analysis → Kling 3.0 video gen → FFmpeg assembly → R2 storage → WhatsApp delivery

**Critical Tests**:
1. **End-to-end test with real Zillow URL**:
   - Input: `https://www.zillow.com/homedetails/123-Main-St/12345678_zpid/`
   - Expected: Cinematic 60-90 sec video, 16:9 format, with music, delivered to WhatsApp in <5 min
   - Verify: Credit deduction = 50, video playable, no corruption

2. **Edge cases**:
   - Zillow URL with no images (does it fail gracefully or generate generic scenes?)
   - Zillow URL that 404s (does customer get notified?)
   - Customer uploads custom images instead of Zillow URL (does it work?)

3. **API failure scenarios**:
   - Kling 3.0 times out after 3 min (does Kling Std fallback work?)
   - FFmpeg crashes during assembly (does error get logged and customer refunded?)
   - R2 upload fails (does retry work?)

4. **Quality check**:
   - Sample 10 real estate videos from Forge
   - Compare quality to Opus Clip, InVideo, Descript
   - Measure: smooth transitions, music sync, text overlay readability, face compositing quality

5. **Performance benchmark**:
   - Measure P50, P95, P99 latency for 100 videos
   - Document: "95% of videos complete in under 4 minutes"

**Pass Criteria**:
- ✅ 95% success rate on happy path
- ✅ All failures trigger customer notification + credit refund
- ✅ Output quality rated 4/5 or higher vs. competitors
- ✅ P95 latency < 5 min

---

### Spoke (Spokesperson) - 50 credits/video

**Current Stack**: Voice note + photo → Gemini script gen → Kling 3.0 avatar lip-sync → R2 storage → WhatsApp delivery

**Critical Tests**:
1. **End-to-end test**:
   - Input: 30-sec voice note (English, clear audio) + headshot photo
   - Expected: 30-sec lip-synced avatar video, natural lip movements, delivered to WhatsApp in <3 min
   - Verify: Credit deduction = 50, audio synced with lips

2. **Edge cases**:
   - Voice note with background noise (does Gemini handle it?)
   - Photo with sunglasses or side profile (does Kling reject it or handle gracefully?)
   - Non-English voice note (does it work for Spanish, Hebrew, etc.?)

3. **Quality check**:
   - Lip-sync accuracy (does it look uncanny valley or natural?)
   - Audio quality (is voice clear or distorted?)
   - Compare to HeyGen, D-ID, Synthesia

**Pass Criteria**:
- ✅ Lip-sync quality rated 4/5 or higher
- ✅ Works for English + at least 2 other languages
- ✅ Fallback to HeyGen works if Kling fails

---

### Market (Marketplace Automation) - 25 credits/listing

**Current Stack**: Product config → Gemini copy → Kie.ai Seedream 3 images → ImageMagick overlay → GoLogin + Puppeteer post → PostgreSQL tracking

**Critical Tests**:
1. **End-to-end test (UAD Garage Doors)**:
   - Input: Product type = DOORS, config = "16x7 Classic Steel White"
   - Expected: Unique title/description, 3 images with phone overlay, posted to FB Marketplace, listing URL returned
   - Verify: Credit deduction = 25, post visible on Facebook, unique content (not duplicate)

2. **Credit gating**:
   - Customer with 20 credits tries to create listing (25 required)
   - Expected: Error "Insufficient credits, upgrade plan"
   - Verify: No listing generated, no credits deducted

3. **Session management**:
   - GoLogin profile cookies expired
   - Expected: Bot detects expired session, notifies customer "Re-upload cookies"
   - Verify: No failed posts, customer alerted proactively

4. **Deduplication**:
   - Create 10 listings in a row for UAD
   - Expected: All 10 have unique title, description, config (no exact duplicates)
   - Verify: `unique_hash` column tracks configs, no repeats

5. **Performance**:
   - Measure time from "Create Listing" button click → listing live on Facebook
   - Expected: P95 < 3 min

**Pass Criteria**:
- ✅ 95% success rate (posts actually appear on FB)
- ✅ 100% credit accuracy (charge 25, no more, no less)
- ✅ Deduplication works (no duplicate configs)
- ✅ Session expiry detection works (customer notified before posting fails)

---

### FrontDesk (AI Receptionist) - 5 credits/call

**Current Stack**: Telnyx AI Voice Assistant → conversation polling → Gemini analysis → CRM push → WhatsApp notification

**Status**: ⚠️ Not yet integrated into credit system

**Critical Tests**:
1. **End-to-end test**:
   - Input: Inbound call to +14699299314
   - Expected: AI answers within 2 rings, captures caller name/phone/reason, books appointment, logs to CRM, customer gets WhatsApp summary
   - Verify: Credit deduction = 5, call transcript stored, CRM updated

2. **Call transfer**:
   - Caller says "This is an emergency, I need a human"
   - Expected: AI transfers to owner's phone immediately
   - Verify: Transfer works, customer notified

3. **Credit calculation**:
   - 30-sec call vs. 5-min call (do both cost 5 credits, or is it per-minute?)
   - Define: Flat 5 credits per call OR 1 credit per minute?

**Pass Criteria**:
- ✅ AI answers 100% of calls (no voicemail)
- ✅ Transfer works reliably
- ✅ CRM integration pushes lead data correctly

---

### Scout (Lead Hunter) - 15 credits/lead

**Status**: 🔜 Not built yet

**Required before launch**:
- [ ] Define lead sources (Apify scrapers? Clay? LinkedIn scraping?)
- [ ] Define lead qualification criteria (AI scoring model)
- [ ] Build WhatsApp/CRM delivery flow
- [ ] Test lead quality (10 test leads → measure conversion rate)

---

### Buzz (Content Creator) - 10 credits/post

**Status**: 🔜 Not built yet

**Required before launch**:
- [ ] Define social platforms (Facebook, Instagram, LinkedIn, X, TikTok, YouTube)
- [ ] Build approval workflow (WhatsApp preview → customer approves → publish)
- [ ] API integrations for each platform
- [ ] Test post scheduling (optimal time picker)

---

### Cortex (Analyst) - 2 credits/query

**Current Stack**: Ollama nomic-embed → pgvector HNSW → Gemini 2.5 Flash retrieval

**Status**: ⚠️ RAG pipeline tested, not wired to credit system

**Critical Tests**:
1. **End-to-end test**:
   - Input: Customer uploads 10 PDFs (SOPs, pricing, FAQs)
   - Query: "What is our return policy?"
   - Expected: Answer with source citations, delivered in <3 sec
   - Verify: Credit deduction = 2

2. **Multi-tenancy**:
   - Customer A uploads docs
   - Customer B queries
   - Expected: Customer B sees "No documents found" (isolation works)

**Pass Criteria**:
- ✅ 95% answer accuracy (source-cited responses)
- ✅ <3 sec query latency
- ✅ Data isolation verified

---

## Rollout Strategy — APPROVED (Feb 23, 2026)

**Decision**: Option A — Sequential Audit-First approach approved after codebase research.

**Research findings** (Feb 23):
- Only **Forge** has credit system integration (pre-check, deduction, refund)
- **Spoke** does NOT exist as standalone agent (only realtor composite in TourReel)
- **Market** is standalone bot (96% feature complete) but NOT wired to credit system
- **Zero notification system** across all agents (customers never notified when jobs complete/fail)
- **Zero quality benchmarking** (no rating system, no output quality tracking)
- **Marketing claims mismatch**: Website says "7 agents live" but only Forge is in SaaS billing

**Critical blockers for accepting paying customers**:
1. No customer notifications → "Where's my video?" complaints
2. Market not in credit system → broken billing (website says 25 credits, code charges 0)
3. Spoke marketed but doesn't exist → potential fraud claims
4. No quality/SLA tracking → can't defend against "bad quality" complaints

### Phase 0: Audit Live Agents (Week 1) — IN PROGRESS
1. **Forge** (Video Producer) - Full production readiness audit
2. **Spoke** (Spokesperson) - Discovery: agent doesn't exist, decision needed
3. **Market** (Marketplace Automation) - Full production readiness audit

**Deliverable**: Pass/Fail scorecard for each agent. Any agent that fails blocks customer launch.

### Phase 1: Fix Critical Gaps (Week 2)
1. Wire all agents to credit system (deduction + refund on failure)
2. Add error handling + customer notifications
3. Optimize prompts for quality
4. Benchmark performance (latency, cost, quality)

### Phase 2: Beta Testing (Week 3)
1. Invite 3-5 beta customers (UAD, MissParty, + 3 new)
2. Monitor for 7 days: failures, complaints, refund requests
3. Measure NPS: "How likely are you to recommend SuperSeller AI?" (target: 9/10)
4. Iterate based on feedback

### Phase 3: Public Launch (Week 4)
1. Open $299/$699/$1499 subscriptions to public
2. Remove "coming soon" badges from live agents
3. Monitor first 100 customers: churn rate, support tickets, credits usage
4. Adjust pricing/features based on data

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Agent uptime** | 99.5% | % of tasks that complete successfully |
| **Customer satisfaction (NPS)** | 9/10 | Survey after first month |
| **Refund rate** | <2% | % of customers who request refund in first 30 days |
| **Support ticket volume** | <0.5 tickets/customer/month | Median tickets per customer |
| **Credit accuracy** | 100% | % of transactions where charged amount = advertised cost |
| **API cost vs. revenue** | 40%+ margin | (Revenue - API costs) / Revenue |

---

## Bird's Eye View: What's Missing?

### 1. **Unified Dashboard**
- Customer should see status of ALL agents in one place
- Real-time: "Forge is processing your video (2 min remaining)"
- History: "Market posted 5 listings this week"

### 2. **Notification System**
- WhatsApp for real-time updates ✅ (exists)
- Email for weekly summary ❌ (missing)
- SMS for critical alerts ❌ (missing)

### 3. **Quality Assurance Loop**
- Customer can rate outputs (1-5 stars)
- Poor ratings trigger human review
- Data feeds back into prompt optimization

### 4. **Usage Analytics**
- "You've used 320/500 credits this month"
- "Your most-used agent: Forge (12 videos)"
- "Upgrade to Pro to unlock Scout and Buzz"

### 5. **Admin Tools**
- Manual task retry (if automation fails)
- Customer impersonation (for support)
- Bulk operations (regenerate all failed tasks)

### 6. **Documentation**
- Help docs for each agent (superseller.agency/docs/forge)
- Video tutorials (Loom screencasts)
- API docs (for custom integrations)

### 7. **SLA Commitments**
- Document expected turnaround times:
  - Forge: 95% complete in <5 min
  - Spoke: 95% complete in <3 min
  - Market: 95% posted in <3 min
  - FrontDesk: 100% answered within 2 rings
  - Cortex: 95% queries answered in <3 sec

### 8. **Model Version Tracking**
- Track which model version was used for each output
- Example: Forge video from Jan 1 = Kling 3.0 Pro v1.2, Gemini 2.5 Flash v20250102
- Enables rollback if new model degrades quality

---

## Integration with FB Marketplace Plan

This audit **blocks** the following phases from the FB Marketplace Integration Plan:

| Phase | Blocked By Audit? |
|-------|-------------------|
| Phase 1: Codebase Updates | ✅ Complete (already done) |
| Phase 2: Backend Integration (Credit Wiring) | ⚠️ **BLOCKED** until Market audit passes |
| Phase 3: Documentation | ⚠️ **BLOCKED** until audit complete (can't document features that don't work) |
| Phase 4: Customer Migration | ⚠️ **BLOCKED** until all agents pass audit |

**New Timeline**:
- **Week 1**: Agent audit (Forge, Spoke, Market)
- **Week 2**: Fix gaps + backend credit integration
- **Week 3**: Documentation + NotebookLM sync
- **Week 4**: Beta testing + customer migration

---

*Authority: Tier 1 (execution-blocking) | Owner: Shai | Updated: 2026-02-23*
