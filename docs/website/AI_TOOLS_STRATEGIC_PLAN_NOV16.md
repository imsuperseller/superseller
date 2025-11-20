# AI Tools Strategic Plan - November 16, 2025

**Status**: ✅ **RESEARCH COMPLETE - STRATEGIC PLAN READY**

---

## 📊 **EXECUTIVE SUMMARY**

**Tools Analyzed**:
1. **HeyGen Creator** ($29/month) - AI video generation
2. **Kie.ai** - AI platform (limited info, needs clarification)
3. **Midjourney** - AI image generation (pricing varies)
4. **ElevenLabs Creator** ($22/month) - AI voice synthesis

**Total Monthly Cost**: ~$51-100/month (depending on Midjourney tier)

**Primary Use Case**: Create professional demo videos, hero images, and voiceovers for Rensto website and marketing materials.

---

## 🔍 **TOOL-BY-TOOL ANALYSIS**

### **1. HeyGen Creator ($29/month)**

**Features**:
- ✅ Unlimited videos up to 30 minutes each
- ✅ 1080p export quality
- ✅ 700+ stock video avatars
- ✅ 1 custom video avatar + 1 custom interactive avatar
- ✅ Voice cloning
- ✅ 175+ languages and dialects
- ✅ Brand kit integration
- ✅ Watermark removal
- ✅ Fast processing

**Current Status in Rensto**:
- ✅ Account available
- ✅ Scripts written (`webflow/HEYGEN_VIDEO_SCRIPTS.md`)
- ❌ Not actively producing videos yet

**Recommended Use Cases**:

#### **Priority 1: Ready Solutions Demo Videos** ⭐ **HIGHEST PRIORITY**
- **What**: 1-2 minute demo videos for each industry package
- **Why**: We just implemented YouTube video embedding - videos are ready to use
- **How Many**: 16 videos (one per industry)
- **Scripts**: Already written in `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- **Timeline**: 1-2 weeks to produce all
- **Output**: Upload to YouTube (unlisted) → Embed on `/solutions` page

#### **Priority 2: Homepage Hero Video**
- **What**: 30-second hero background video
- **Why**: Increase engagement, show value proposition visually
- **Script**: "Everyone Else Is Using Agents" (already written)
- **Timeline**: 1 day
- **Output**: Autoplay on homepage hero section

#### **Priority 3: Service Page Videos**
- **What**: 15-30 second videos for each service type
- **Why**: Visual storytelling for Marketplace, Subscriptions, Custom Solutions
- **How Many**: 4 videos (one per service page)
- **Timeline**: 2-3 days
- **Output**: Embed on service pages

#### **Priority 4: Customer Testimonials**
- **What**: 60-90 second testimonial videos
- **Why**: Social proof, credibility
- **How Many**: 3-5 videos (Tax4Us, Shelly, Wonder.care)
- **Timeline**: 1 week
- **Output**: Embed on homepage, service pages, case studies

**Workflow**:
1. Use existing scripts from `webflow/HEYGEN_VIDEO_SCRIPTS.md`
2. Select avatar (professional business avatar or @shai for founder videos)
3. Add Rensto logo at start/end
4. Generate video in HeyGen UI
5. Export 1080p
6. Upload to YouTube (unlisted)
7. Add video ID to code (we just implemented this!)

**Monthly Cost**: $29/month
**ROI**: High - Professional videos without hiring videographer ($200-500/video if outsourced)

---

### **2. Midjourney Standard Plan** ✅ **ACTIVE UNTIL MAR 24, 2026**

**Your Account Status**:
- ✅ Standard Plan ACTIVE
- ✅ 15h Fast generations
- ✅ SD and HD video generation
- ✅ General commercial terms
- ✅ Optional credit top ups
- ✅ 3 concurrent fast image jobs
- ✅ 3 concurrent fast video jobs
- ✅ Unlimited Relaxed image generations
- ✅ Use editor on uploaded images

**Recommended Use Cases**:

#### **Priority 1: Hero Images for Industry Pages** ⭐ **HIGH PRIORITY**
- **What**: Custom hero images for each of 16 industry pages
- **Why**: Professional, unique visuals for each industry
- **How Many**: 16 hero images
- **Prompts**: Already documented in `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
- **Timeline**: 1-2 days (if prompts are ready)
- **Output**: Upload to website, use as hero backgrounds

**Workflow**:
1. Use prompts from `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
2. Generate in Midjourney Discord (use Fast mode for quick iterations)
3. Upscale best results
4. Download and optimize (compress if needed)
5. Upload to website

**Monthly Cost**: Already paid (active until Mar 24, 2026)
**ROI**: High - Professional images without hiring designer

---

### **3. Kie.ai** ✅ **5,333 CREDITS AVAILABLE**

**Your Account Status**:
- ✅ 5,333 credits current balance
- ⚠️ Need clarification on what credits are used for

**Potential Use Cases** (pending clarification):
- Content generation
- Image/video processing
- AI-powered features

**Action**: Research Kie.ai credit usage to determine best use case

---

### **4. ElevenLabs Creator ($22/month)**

**Features**:
- ✅ 100,000 characters per month (~10-15 minutes of speech)
- ✅ Professional voice cloning
- ✅ 192kbps audio quality
- ✅ 70+ languages
- ✅ Text-to-speech (TTS)
- ✅ Voice library access
- ✅ Mobile app

**Recommended Use Cases**:

#### **Option A: Voiceovers for HeyGen Videos** ⭐ **RECOMMENDED**
- **What**: High-quality voiceovers for demo videos
- **Why**: Better quality than HeyGen's built-in TTS
- **How**: Clone your voice or use professional voice from library
- **Timeline**: Same as HeyGen video production
- **Output**: Audio files → Import into HeyGen videos

#### **Option B: Standalone Voice Content**
- **What**: Podcast narration, audio-only content
- **Why**: If you want to create audio content separately
- **Use Case**: Less relevant for current priorities

**Decision**: 
- **If using HeyGen**: HeyGen has built-in TTS (good enough for most cases)
- **If you want premium quality**: Use ElevenLabs for voiceovers → Import into HeyGen
- **Recommendation**: Start with HeyGen's built-in TTS, upgrade to ElevenLabs if quality is insufficient

**Monthly Cost**: $22/month (only if needed)
**ROI**: Medium - Nice-to-have upgrade, not essential

---

### **3. Midjourney** (Pricing: ~$10-60/month depending on tier)

**Features** (typical):
- ✅ AI image generation
- ✅ High-quality artistic images
- ✅ Multiple styles
- ✅ Discord-based interface
- ✅ Commercial usage rights (depending on tier)

**Recommended Use Cases**:

#### **Priority 1: Hero Images for Industry Pages** ⭐ **HIGH PRIORITY**
- **What**: Custom hero images for each of 16 industry pages
- **Why**: Professional, unique visuals for each industry
- **How Many**: 16 hero images
- **Prompts**: Already documented in `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
- **Timeline**: 1-2 days (if prompts are ready)
- **Output**: Upload to website, use as hero backgrounds

**Example Prompts** (from your docs):
```
HVAC Hero: "Modern HVAC control panel with digital automation overlay,
smart home interface, technician using tablet, residential home in background,
professional photography, bright and clean, trustworthy aesthetic, 16:9 aspect ratio"

Real Estate Hero: "Real estate agent using automation dashboard on iPad,
modern office with city skyline view, multiple property listings on screen,
professional business setting, 16:9 aspect ratio"
```

#### **Priority 2: Social Media Graphics**
- **What**: Graphics for LinkedIn, Instagram, Facebook posts
- **Why**: Consistent brand visuals
- **How Many**: 10-20 graphics/month
- **Timeline**: Ongoing
- **Output**: Post on social media

#### **Priority 3: Video Thumbnails**
- **What**: Thumbnails for YouTube videos
- **Why**: Higher click-through rates
- **How Many**: 1 per video (16+ thumbnails)
- **Timeline**: Same as video production
- **Output**: Upload to YouTube

**Workflow**:
1. Use prompts from `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
2. Generate in Midjourney Discord
3. Upscale best results
4. Download and optimize (compress if needed)
5. Upload to website/social media

**Monthly Cost**: ~$10-60/month (depending on tier)
**ROI**: High - Professional images without hiring designer ($50-200/image if outsourced)

---

### **4. Kie.ai** ⚠️ **NEEDS CLARIFICATION**

**Research Findings**:
- Limited information available
- Appears to be AI-powered platform for customer interactions
- May integrate with ElevenLabs speech-to-text API
- Possible use: Customer support automation, sentiment analysis

**Questions**:
1. What is Kie.ai's primary function?
2. Do you have an account? What tier?
3. What problem are you trying to solve with it?

**Potential Use Cases** (pending clarification):
- Customer support automation
- Content transcription
- Sentiment analysis
- Text processing

**Recommendation**: **WAIT** - Need more information before recommending use cases.

---

## 🎯 **STRATEGIC RECOMMENDATIONS**

### **Phase 1: Immediate Actions (Week 1-2)** ⭐ **START HERE**

#### **1. HeyGen - Ready Solutions Demo Videos**
**Priority**: 🔥 **HIGHEST**
**Why**: We just implemented YouTube video embedding - videos are ready to use immediately
**Action**:
1. Open HeyGen UI
2. Use scripts from `webflow/HEYGEN_VIDEO_SCRIPTS.md`
3. Create 3-5 videos for top industries (HVAC, Roofer, Dentist)
4. Upload to YouTube (unlisted)
5. Add video IDs to `apps/web/rensto-site/src/app/solutions/page.tsx`
6. Deploy to production

**Timeline**: 1-2 weeks
**Cost**: $29/month (already have account)
**ROI**: Immediate - Videos go live on website

#### **2. Midjourney - Hero Images**
**Priority**: 🔥 **HIGH**
**Why**: Professional visuals improve conversion rates
**Action**:
1. Sign up for Midjourney (if not already)
2. Use prompts from `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
3. Generate 16 hero images (one per industry)
4. Upload to website

**Timeline**: 1-2 days
**Cost**: ~$10-60/month
**ROI**: High - Professional images without designer

---

### **Phase 2: Content Expansion (Week 3-4)**

#### **3. HeyGen - Homepage Hero Video**
**Priority**: **MEDIUM**
**Action**: Create 30-second hero video using existing script
**Timeline**: 1 day

#### **4. HeyGen - Service Page Videos**
**Priority**: **MEDIUM**
**Action**: Create 4 videos (one per service type)
**Timeline**: 2-3 days

#### **5. HeyGen - Customer Testimonials**
**Priority**: **MEDIUM**
**Action**: Create 3-5 testimonial videos
**Timeline**: 1 week

---

### **Phase 3: Quality Upgrades (Month 2+)**

#### **6. ElevenLabs - Premium Voiceovers**
**Priority**: **LOW** (only if HeyGen TTS quality is insufficient)
**Action**: Clone voice or use professional voice → Import into HeyGen videos
**Cost**: $22/month (only if needed)

#### **7. Midjourney - Social Media Graphics**
**Priority**: **LOW** (ongoing)
**Action**: Generate 10-20 graphics/month for social media
**Timeline**: Ongoing

---

## 💰 **COST ANALYSIS**

### **Monthly Costs**:

| Tool | Monthly Cost | Priority | Status |
|------|-------------|----------|--------|
| **HeyGen Creator** | $29 | HIGH | ✅ Account available |
| **Midjourney** | $10-60 | HIGH | ⏳ Need to sign up |
| **ElevenLabs Creator** | $22 | LOW | ⏳ Only if needed |
| **Kie.ai** | TBD | TBD | ⚠️ Need clarification |
| **Total** | **$61-111/month** | | |

### **ROI Comparison**:

| Tool | Cost/Month | Value if Outsourced | Savings |
|------|-----------|-------------------|---------|
| HeyGen (16 videos) | $29 | $3,200-8,000 | $3,171-7,971 |
| Midjourney (16 images) | $10-60 | $800-3,200 | $740-3,140 |
| ElevenLabs (optional) | $22 | $200-500 | $178-478 |

**Total Potential Savings**: $4,089-11,589/month (if producing content regularly)

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **Week 1: HeyGen Demo Videos**
- [ ] Review existing scripts in `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- [ ] Select top 5 industries for initial videos (HVAC, Roofer, Dentist, Real Estate, Amazon Seller)
- [ ] Create 5 demo videos in HeyGen UI
- [ ] Upload to YouTube (unlisted)
- [ ] Add video IDs to `solutions/page.tsx`
- [ ] Deploy to production
- [ ] Test on live site

### **Week 2: Complete Demo Videos**
- [ ] Create remaining 11 demo videos
- [ ] Upload all to YouTube
- [ ] Update all video IDs in code
- [ ] Deploy to production

### **Week 3: Midjourney Hero Images**
- [ ] Sign up for Midjourney (if not already)
- [ ] Generate 16 hero images using prompts from docs
- [ ] Optimize images (compress if needed)
- [ ] Upload to website
- [ ] Update hero sections on industry pages

### **Week 4: Additional Content**
- [ ] Create homepage hero video
- [ ] Create service page videos
- [ ] Create customer testimonial videos
- [ ] Deploy all content

---

## 🎬 **CONTENT PRODUCTION WORKFLOW**

### **For HeyGen Videos**:

1. **Script Selection**: Use scripts from `webflow/HEYGEN_VIDEO_SCRIPTS.md`
2. **Avatar Selection**: Professional business avatar or @shai (for founder videos)
3. **Media Addition**: Add Rensto logo at start/end
4. **Generation**: Create video in HeyGen UI
5. **Export**: Download 1080p version
6. **Upload**: Upload to YouTube (unlisted)
7. **Integration**: Add video ID to code
8. **Deploy**: Push to production

### **For Midjourney Images**:

1. **Prompt Selection**: Use prompts from `webflow/VIDEO_PROMPTS_CUSTOMER_TOOLS_FINAL.md`
2. **Generation**: Create in Midjourney Discord
3. **Upscale**: Upscale best results
4. **Download**: Save high-resolution version
5. **Optimize**: Compress if needed (target: <200KB)
6. **Upload**: Upload to website
7. **Update**: Update hero sections

---

## ❓ **QUESTIONS FOR YOU**

Before finalizing the plan, please clarify:

1. **Kie.ai**: What is it for? Do you have an account? What problem are you solving?
2. **Midjourney**: Do you have an account? What tier?
3. **Priorities**: Which phase should we start with? (I recommend Phase 1)
4. **Timeline**: When do you want to start producing content?
5. **Resources**: Who will be creating the content? (You, team member, or should I help automate?)

---

## 🚀 **ACTION PLAN - STARTING NOW**

**✅ Status**: Ready to begin HeyGen demo videos

**📋 Action Plan Created**: See `docs/website/HEYGEN_DEMO_VIDEOS_ACTION_PLAN_NOV16.md`

**🎯 First Step**: Create HVAC demo video (30 seconds)
- Script ready in `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- Follow step-by-step guide in action plan
- Timeline: 1-2 hours for first video

**📊 Your Account Status**:
- ✅ HeyGen Creator: Active ($29/month)
- ✅ Midjourney Standard: Active until Mar 24, 2026
- ✅ Kie.ai: 5,333 credits available
- ⏳ ElevenLabs: Not needed yet (HeyGen TTS is sufficient)

**🎬 Next Steps**:
1. Open `docs/website/HEYGEN_DEMO_VIDEOS_ACTION_PLAN_NOV16.md`
2. Follow Phase 2 (Create HVAC video)
3. Upload to YouTube (unlisted)
4. Add video ID to code
5. Deploy to production

**Timeline**: 1-2 weeks for all 16 videos (or 1-2 days for top 5)

---

**Ready to start? Open the action plan and begin with HVAC video!**
