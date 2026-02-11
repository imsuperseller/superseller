# 🎬 Video Workflow Architecture Plan - Multi-Purpose System

**Date**: November 16, 2025  
**Status**: 🚀 **READY TO IMPLEMENT**  
**Current Workflow**: `8GC371u1uBQ8WLmu` - "Rensto Website Video Generator" (UGC Machine)

---

## 🎯 **CURRENT WORKFLOW STATUS**

### **What You Have Now** (`8GC371u1uBQ8WLmu`)

**Workflow Name**: "Rensto Website Video Generator"  
**URL**: http://172.245.56.50:5678/workflow/8GC371u1uBQ8WLmu  
**Purpose**: Generate Sora 2 prompts from winning Meta Ad Library ads (UGC-style social media ads)

**What It Does**:
1. **Part 1 (Automated)**: Weekly scrape of Meta Ad Library → Find long-running ads → Store to Boost.space
2. **Part 2 (Manual/Webhook)**: Analyze video → Generate Rensto-specific Sora 2 prompts → Save to Boost.space

**Current Use Case**: Social media ads, UGC-style testimonials, conversion-focused content

**Status**: ✅ Fully configured, ready to test

---

## 🏗️ **PROPOSED WORKFLOW ARCHITECTURE**

### **Strategy: Specialized Workflows for Different Video Types**

Instead of one monolithic workflow, create **specialized workflows** for each video purpose:

| Workflow Type | Purpose | Video Style | Tool | Status |
|--------------|---------|------------|------|--------|
| **UGC Machine** | Social media ads | UGC testimonials | Sora 2 | ✅ Ready |
| **Hero Generator** | Homepage/service heroes | Professional demos | HeyGen | ⚠️ Needs workflow |
| **Demo Generator** | Product demos | Screen recordings + voiceover | HeyGen | ⚠️ Needs workflow |
| **Industry Generator** | Niche page videos | Industry-specific | HeyGen/Sora 2 | ⚠️ Needs workflow |
| **Testimonial Generator** | Social proof | Customer testimonials | HeyGen/Sora 2 | ⚠️ Needs workflow |

---

## 📋 **DETAILED WORKFLOW BREAKDOWN**

### **1. UGC Machine** (Current - `8GC371u1uBQ8WLmu`) ✅

**Purpose**: Generate Sora 2 prompts for social media ads  
**Input**: Winning Meta Ad Library video URL  
**Output**: 5 Sora 2 prompts (10-15 seconds each)  
**Use Cases**:
- Facebook/Instagram ads
- TikTok/Reels content
- LinkedIn video posts
- Conversion-focused social content

**Workflow**: Already configured ✅

**Next Steps**:
1. ✅ Test with sample Boost.space note (ID: 297)
2. Generate first video using `@shai-lfc` cameo (user's Sora 2 cameo)
3. Use prompts in Sora 2 to create videos
4. Post to social media

---

### **2. Hero Video Generator** (New - To Create)

**Purpose**: Generate hero background videos for homepage and service pages  
**Input**: Page type, service messaging, script  
**Output**: HeyGen video (30-60 seconds)  
**Use Cases**:
- Homepage hero (`/`)
- Marketplace hero (`/marketplace`)
- Subscriptions hero (`/subscriptions`)
- Ready Solutions hero (`/ready-solutions`)
- Custom Solutions hero (`/custom-solutions`)

**Workflow Structure**:
```
Webhook Trigger
  ↓
Get Page Config (Boost.space)
  ↓
Generate Script (LLM - Claude/Gemini)
  ↓
Create HeyGen Video (HeyGen API)
  ↓
Upload to YouTube (Unlisted)
  ↓
Update Website (Vercel/Next.js - manual or via API)
  ↓
Notify (Slack/Email)
```

**Input Parameters**:
- `pageType`: `homepage` | `marketplace` | `subscriptions` | `ready-solutions` | `custom-solutions`
- `videoLength`: `30` | `60` | `90` seconds
- `avatarLook`: `Professional Consultant` | `Tech Innovator` | `Friendly Guide`
- `scriptOverride`: (optional) Custom script

**Output**:
- YouTube video URL (unlisted)
- Video ID for embedding
- Vercel/Next.js page update (manual - edit `apps/web/rensto-site/src/app/` files)

**Priority**: 🔥 **HIGH** - Needed for all 5 pages

---

### **3. Demo Video Generator** (New - To Create)

**Purpose**: Generate product demo videos (screen recordings + voiceover)  
**Input**: Product type, demo steps, screenshots  
**Output**: HeyGen video with screen recordings (60-120 seconds)  
**Use Cases**:
- Marketplace installation demos
- Subscriptions lead generation demos
- Ready Solutions workflow walkthroughs
- Custom Solutions case studies

**Workflow Structure**:
```
Webhook Trigger
  ↓
Get Product Config (Boost.space)
  ↓
Prepare Screenshots/Media (from config)
  ↓
Generate Script (LLM)
  ↓
Create HeyGen Video (with media)
  ↓
Upload to YouTube
  ↓
Update Product Page
```

**Input Parameters**:
- `productType`: `marketplace-template` | `subscription-service` | `industry-package` | `custom-project`
- `productId`: Specific product identifier
- `demoSteps`: Array of demo steps
- `mediaAssets`: Screenshots, logos, dashboards

**Priority**: **MEDIUM** - Needed for 2-3 demo videos

---

### **4. Industry Video Generator** (New - To Create)

**Purpose**: Generate industry-specific videos for niche pages  
**Input**: Industry name, service messaging  
**Output**: HeyGen or Sora 2 video (30 seconds)  
**Use Cases**:
- 16+ industry niche pages (HVAC, Dentist, Roofer, etc.)
- Industry-specific hero videos
- Industry-specific testimonials

**Workflow Structure**:
```
Webhook Trigger (or Batch)
  ↓
Get Industry Config (Boost.space)
  ↓
Generate Industry-Specific Script (LLM)
  ↓
Create Video (HeyGen or Sora 2)
  ↓
Upload to YouTube
  ↓
Update Industry Page (Vercel/Next.js - edit page files or use CMS if configured)
```

**Input Parameters**:
- `industry`: `hvac` | `dentist` | `roofer` | `realtor` | etc.
- `videoType`: `hero` | `testimonial` | `demo`
- `tool`: `heygen` | `sora2`

**Priority**: **MEDIUM** - Needed for 16+ industry pages

---

### **5. Testimonial Generator** (New - To Create)

**Purpose**: Generate customer testimonial videos  
**Input**: Customer case study, quotes, results  
**Output**: HeyGen or Sora 2 video (30-60 seconds)  
**Use Cases**:
- Customer success stories
- Social proof videos
- Case study videos
- Before/after comparisons

**Workflow Structure**:
```
Webhook Trigger
  ↓
Get Customer Case Study (Boost.space/Airtable)
  ↓
Generate Testimonial Script (LLM)
  ↓
Create Video (HeyGen with customer avatar or Sora 2)
  ↓
Upload to YouTube
  ↓
Add to Website (Testimonials section)
```

**Input Parameters**:
- `customerId`: Customer identifier
- `caseStudyId`: Case study record ID
- `videoStyle`: `realistic` | `stylized` | `animated`
- `tool`: `heygen` | `sora2`

**Priority**: **LOW** - Nice to have, not critical

---

## 🚀 **IMPLEMENTATION PLAN**

### **Phase 1: Current Workflow Testing** (Week 1)

**Goal**: Verify UGC Machine works end-to-end

**Tasks**:
1. ✅ Create test Boost.space note (DONE - Note ID: 297)
2. ⚠️ Trigger workflow via webhook
3. ⚠️ Verify prompts are generated
4. ⚠️ Generate first video in Sora 2 using `@shai-lfc` cameo
5. ⚠️ Test cameo creation
6. ⚠️ Use cameo in second video

**Deliverable**: Working UGC Machine workflow + first social media ad video

---

### **Phase 2: Hero Video Generator** (Week 2) 🔥 **PRIORITY**

**Goal**: Create workflow for homepage and service page hero videos

**Tasks**:
1. Create new workflow: `VIDEO-HERO-GENERATOR-001`
2. Set up HeyGen API integration
3. Create Boost.space config for each page type
4. Build script generation (LLM)
5. Build HeyGen video creation
6. Build YouTube upload automation
7. Test with Custom Solutions page (highest priority)

**Deliverable**: Automated hero video generation for 5 pages

**Pages to Generate**:
1. Homepage (`/`) - "Business Owner Morning Routine"
2. Custom Solutions (`/custom-solutions`) - "Custom Automation Explained"
3. Marketplace (`/marketplace`) - "Template Benefits"
4. Subscriptions (`/subscriptions`) - "Lead Generation Service"
5. Ready Solutions (`/ready-solutions`) - "Industry Packages"

---

### **Phase 3: Demo Video Generator** (Week 3)

**Goal**: Create workflow for product demo videos

**Tasks**:
1. Create new workflow: `VIDEO-DEMO-GENERATOR-001`
2. Set up media asset management
3. Build demo script generation
4. Build HeyGen video with media
5. Test with Marketplace installation demo

**Deliverable**: Automated demo video generation

---

### **Phase 4: Industry Video Generator** (Week 4)

**Goal**: Create workflow for industry-specific videos

**Tasks**:
1. Create new workflow: `VIDEO-INDUSTRY-GENERATOR-001`
2. Set up batch processing for 16 industries
3. Build industry-specific script templates
4. Generate videos for all industries
5. Update Vercel/Next.js pages (edit files in `apps/web/rensto-site/src/app/`)

**Deliverable**: 16+ industry hero videos

---

## 📊 **WORKFLOW NAMING CONVENTION**

**Format**: `VIDEO-{TYPE}-{PURPOSE}-{VERSION}`

**Examples**:
- `VIDEO-UGC-MACHINE-001` (current: `8GC371u1uBQ8WLmu`)
- `VIDEO-HERO-GENERATOR-001` (new)
- `VIDEO-DEMO-GENERATOR-001` (new)
- `VIDEO-INDUSTRY-GENERATOR-001` (new)
- `VIDEO-TESTIMONIAL-GENERATOR-001` (new)

---

## 🔧 **TECHNICAL ARCHITECTURE**

### **Shared Components** (All Workflows Use):

1. **Boost.space Integration**:
   - Page/Product configs
   - Video metadata storage
   - Script templates

2. **LLM Integration**:
   - Script generation (Claude Sonnet 4.5)
   - Content adaptation (Gemini 2.5 Pro)
   - Brand voice consistency

3. **Video Platform APIs**:
   - HeyGen API (professional videos)
   - Sora 2 API (via Kai.ai or direct)
   - YouTube API (upload automation)

4. **Website Integration**:
   - Vercel/Next.js (edit page files in `apps/web/rensto-site/src/app/`)
   - CMS updates (for dynamic pages)

---

## 📝 **NEXT IMMEDIATE STEPS**

### **For Current Workflow** (`8GC371u1uBQ8WLmu`):

1. **Test the Workflow**:
   ```bash
   curl "http://172.245.56.50:5678/webhook/4f2edfb2-eb77-4c8d-8f83-462cba2b5e16?recordId=297"
   ```

2. **Check Boost.space Note** (ID: 297):
   - Verify prompts were generated
   - Check `scene1Prompt` through `scene5Prompt` fields

3. **Generate First Video**:
   - Use Primary Prompt from `SORA2_RENSTO_MASCOT_CAMEO_PROMPT.md`
   - Use existing `@shai-lfc` cameo (user's Sora 2 cameo)
   - Use cameo in generated prompts

4. **Create Social Media Ad**:
   - Use generated prompts in Sora 2
   - Stitch clips together
   - Add captions, logo
   - Post to social media

---

### **For New Workflows** (Hero Video Generator):

1. **Create Workflow Structure**:
   - Duplicate current workflow as template
   - Remove Meta Ad Library scraping (Part 1)
   - Keep LLM script generation
   - Add HeyGen API integration
   - Add YouTube upload

2. **Set Up Configs**:
   - Create Boost.space notes for each page type
   - Store page configs, scripts, video metadata

3. **Test with Custom Solutions**:
   - Generate first hero video
   - Upload to YouTube
   - Embed on Custom Solutions page

---

## 🎯 **DECISION: Duplicate or Specialize?**

### **Recommendation: Specialized Workflows** ✅

**Why**:
- ✅ Each workflow has different inputs/outputs
- ✅ Different tools (HeyGen vs Sora 2)
- ✅ Different use cases (hero vs ad vs demo)
- ✅ Easier to maintain and update
- ✅ Can run in parallel
- ✅ Clear separation of concerns

**Structure**:
```
VIDEO-UGC-MACHINE-001      → Social media ads (Sora 2)
VIDEO-HERO-GENERATOR-001   → Hero videos (HeyGen)
VIDEO-DEMO-GENERATOR-001   → Demo videos (HeyGen)
VIDEO-INDUSTRY-GENERATOR-001 → Industry videos (HeyGen/Sora 2)
```

**Shared Resources**:
- Boost.space for configs
- LLM for script generation
- Brand messaging templates
- Avatar/cameo references

---

## 📚 **RELATED DOCUMENTS**

- **UGC Machine Summary**: `docs/website/UGC_MACHINE_WORKFLOW_COMPLETE_SUMMARY.md`
- **HeyGen Demo Videos Plan**: `docs/website/HEYGEN_DEMO_VIDEOS_ACTION_PLAN_NOV16.md`
- **Video Strategy by Page**: `docs/website/VIDEO_STRATEGY_BY_PAGE_NOV16.md`
- **Sora 2 Cameo Prompt**: `docs/website/SORA2_RENSTO_MASCOT_CAMEO_PROMPT.md`
- **HeyGen Avatar Strategy**: `docs/website/HEYGEN_STYLIZED_AVATAR_STRATEGY.md`

---

**Last Updated**: November 16, 2025  
**Status**: 🚀 Ready to implement  
**Next Action**: Test current workflow, then create Hero Video Generator workflow

