# HeyGen Demo Videos - Action Plan
**Date**: November 16, 2025  
**Status**: 🚀 **READY TO START**

**📚 Related Documents**:
- **Stylized Avatar Strategy**: See `HEYGEN_STYLIZED_AVATAR_STRATEGY.md` for creating stylized avatar (brand mascot + video presenter)
- **Avatar Looks Strategy**: See `HEYGEN_AVATAR_LOOKS_STRATEGY.md` for realistic avatar looks (if using realistic style)
- **Video Scripts**: See `webflow/HEYGEN_VIDEO_SCRIPTS.md` for all scripts

---

## 🎯 **PRIORITY ORDER & STRATEGIC FOCUS**

**Focus**: Main conversion-driving videos (hero videos), not testimonials  
**Best Practice**: Problem-focused openings, concise (30-120 seconds), clear CTAs

### **Phase 1: Essential Hero Videos** (Week 1) 🔥 **START HERE**

1. **🔥 Custom Solutions** (`/custom`) - **TOP PRIORITY** - **1 hero video** (30-60s)
2. **Marketplace** (`/marketplace`) - **1 hero video** (30-60s)
3. **Subscriptions** (`/subscriptions`) - **1 hero video** (30-60s)
4. **Solutions** (`/solutions`) - **1 hero video** (30s)

**Total Phase 1**: 4 videos (can create in 1-2 days)

### **Phase 2: Demo Videos** (Week 2)

5. **Marketplace** - Installation Demo (60-90s)
6. **Subscriptions** - Lead Generation Demo (60-90s)

**Total Phase 2**: 2 videos

### **Phase 3: Industry Demos** (Week 3-4)

7. **Solutions** - 16 Industry Videos (30s each)

**Total Phase 3**: 16 videos

**Grand Total**: 22 videos (4 hero + 2 demo + 16 industry)

---

## 🎯 **GOAL**

Create demo videos for all 4 service pages, starting with Custom Solutions (highest priority).

**Timeline**: 
- **Week 1**: Custom Solutions (3 videos) + Marketplace (2 videos) = 5 videos
- **Week 2**: Subscriptions (2 videos) + Solutions hero (1 video) = 3 videos
- **Week 3-4**: Solutions industry demos (16 videos)

**Output**: YouTube videos (unlisted) → Embedded on website

---

## 📋 **STEP-BY-STEP GUIDE**

### **Phase 1: Preparation (Day 1 - 30 minutes)**

#### **Step 1: Review Scripts**
- [ ] Open `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- [ ] Review scripts for these 5 industries:
  1. **HVAC** (line 253-262)
  2. **Roofer** (use template, adapt script)
  3. **Dentist** (use template, adapt script)
  4. **Real Estate** (use template, adapt script)
  5. **Amazon Seller** (use template, adapt script)

#### **Step 2: Prepare Media Assets**
- [ ] Rensto logo (PNG, transparent background)
- [ ] Screenshots (if needed):
  - Industry-specific contexts (HVAC truck, realtor car, etc.)
  - Gmail inbox examples
  - Airtable dashboard examples
  - WhatsApp interface examples

#### **Step 3: Set Up YouTube Channel**
- [ ] Ensure YouTube channel is ready
- [ ] Note: Videos will be uploaded as "Unlisted" (can embed but won't appear in search)

---

---

## 🎬 **PHASE 1: CUSTOM SOLUTIONS - HERO VIDEO** 🔥 **TOP PRIORITY**

### **Main Video: Hero Background** (30-60 seconds)

**Purpose**: Explain what custom automation is, hook with problem, drive to consultation CTA  
**Placement**: Hero section background (autoplay, muted, loop)  
**Goal**: Convert visitors to consultation bookings

### **Recommended Script** (60 seconds):

**Script** (Problem-focused, conversion-driven):
```
You're working 50+ hour weeks. Gmail chaos. Google Sheets scattered. WhatsApp unanswered. Manual work is killing your business. Your competitor is ahead because they automated. But generic automation doesn't fit YOUR business. You need custom automation. Built for YOUR tools. YOUR workflows. YOUR problems. Here's how it works. Step one: Free consultation. Tell us what's killing you. We listen. Step two: We build your automation. Connect YOUR tools. Gmail. WhatsApp. Airtable. OpenAI. Claude. Gemini. Step three: Launch and reclaim your time. Agent handles YOUR busywork. You focus on growth. Custom built for you. $3,500 to $8,000. Free consultation. Get started today.
```

**Media to Add**:
- Rensto logo (start: 0:00-2:00, end: 58:00-60:00)
- Screenshot: Gmail inbox chaos (during problem section)
- Screenshot: Google Sheets scattered data (during problem section)
- Screenshot: Airtable organized dashboard (during solution section)
- Screenshot: n8n workflow (during process section)

**HeyGen Steps**:
1. Open HeyGen UI → Create Video
2. Select: Stylized Rensto Mascot avatar → Apply "Professional Consultant" look (see `HEYGEN_STYLIZED_AVATAR_STRATEGY.md`)
3. Paste script above
4. Duration: 60 seconds
5. Add Rensto logo at start/end
6. Add screenshots during narration (Gmail chaos, Sheets, Airtable, workflow)
7. Generate → Export 1080p
8. Upload to YouTube (unlisted)
9. **Add to Custom Solutions page** (hero section background - see integration guide)

**Additional Videos**: ❌ **NOT NEEDED** - Hero video covers everything for now

---

### **Integration Steps for Custom Solutions Page**

After creating each video:

1. **Upload to YouTube** (unlisted)
2. **Get video ID** from URL
3. **Update Custom Solutions page**:
   - File: `apps/web/rensto-site/src/app/custom/page.tsx`
   - Add video modal integration (similar to Solutions page)
   - Or embed directly in hero section
4. **Deploy to production**

---

## 🛍️ **PHASE 2: MARKETPLACE VIDEOS**

### **Main Video: Hero Background** (30-60 seconds)

**Purpose**: Explain what templates are, show how they work, drive to browse or install  
**Placement**: Hero section background  
**Goal**: Convert visitors to template purchases or installation bookings

**Recommended Script** (60 seconds):
```
You've got 47 browser tabs open. Gmail. Google Sheets. WhatsApp. Tools that don't talk to each other. Manual copy-paste. Two hours daily. What if all your tools actually worked together? Pre-built automation templates. Gmail connected to Airtable. WhatsApp automated. OpenAI integrated. Download and use in 10 minutes. Or let us install it for you. Templates tested in real businesses. Proven results. From $29 per template. Installation from $797. Browse templates or book installation. Get started today.
```

**Media to Add**:
- Rensto logo (start/end)
- Screenshot: Browser with 47 tabs (Gmail, Sheets, WhatsApp)
- Screenshot: n8n template dashboard
- Screenshot: Airtable organized dashboard

---

### **Additional Video: Installation Demo** (60-90 seconds)

**Purpose**: Convert DIY users to installation service  
**Placement**: "Need Help Installing?" section  
**Goal**: Show step-by-step installation process

**Recommended Script** (90 seconds):
```
You've been using Google Sheets for everything. Customer data from Gmail emails. Invoice information. Lead details. WhatsApp customer messages. All in Sheets. Manual copy-paste. Three hours daily. Errors. Frustration. What if you migrate to Airtable? Here's how our installation service works. Step one: Import your Sheets data to Airtable. Ten-minute wizard. Done. Step two: We connect your agent. Gmail account linked. WhatsApp connected. OpenAI, Claude, Gemini integrated. Step three: Watch it work. New Gmail email arrives. Agent extracts data automatically. Adds to Airtable. Sends WhatsApp response via OpenAI. All automated. No more Sheets. No more manual work. Agent handles Gmail, WhatsApp, customer data automatically. From three hours daily to zero hours. Time saved equals money made. Agent does the work. You focus on growing your business. Installation service: $797 to $3,500. We handle everything. Get started today.
```

**Media to Add**:
- Rensto logo (start/end)
- Screenshot: Google Sheets with scattered data
- Screenshot: Airtable migration wizard
- Screenshot: Agent connection setup
- Screenshot: Automated workflows running

---

## 📊 **PHASE 3: SUBSCRIPTIONS VIDEOS**

### **Main Video: Hero Background** (30-60 seconds)

**Purpose**: Hook with competitor problem, show automated lead generation solution  
**Placement**: Hero section background  
**Goal**: Convert visitors to subscription signups

**Recommended Script** (60 seconds):
```
Monday: Great sales call. You nailed it. You meant to follow up Tuesday. You forget. Wednesday. Thursday. Friday: Your lead just accepted connection from your competitor. Deal lost. They responded in 5 minutes. You took 3 days. Why? Automated lead generation. Leads come in from LinkedIn, Google Maps, Facebook, Apify. Agent automatically enriches. Adds email, phone, company info. Sends Gmail follow-up immediately. Sends WhatsApp message within minutes. Lead impressed by fast response. You? Still manually checking LinkedIn. Automated lead generation: 100 to 2,000 qualified leads per month. Agent handles responses automatically. $299 per month for 100 leads. $599 for 500. $1,499 for 2,000 plus. Cost per lead: $3 to $7. Your competitor is already doing this. Start today.
```

**Media to Add**:
- Rensto logo (start/end)
- Screenshot: Monday sales call success
- Screenshot: Gmail follow-up reminder (forgotten)
- Screenshot: LinkedIn notification (competitor connection)
- Screenshot: Automated lead response dashboard

---

### **Additional Video: Lead Generation Demo** (60-90 seconds)

**Purpose**: Show the process, build trust  
**Placement**: "Where We Get Your Leads" or "Why Choose" section  
**Goal**: Show lead sources → Enrichment → Response → Delivery

**Recommended Script** (90 seconds):
```
Your competitor is getting leads from LinkedIn, Google Maps, Facebook, Apify. And they're responding in minutes. Not days. Minutes. How? Automated lead generation. Here's how it works. Lead comes in from LinkedIn. Agent automatically enriches the lead. Adds email, phone, company info. Stores in Airtable. Agent sends Gmail follow-up via OpenAI. Agent sends WhatsApp message immediately. Lead impressed by fast response. You? You're still manually checking LinkedIn. Copy-pasting to Gmail. Forgetting WhatsApp follow-up. Three days later, deal lost. Automated lead generation: 100 to 2,000 qualified leads per month. Agent handles Gmail responses, WhatsApp messages, Airtable updates automatically. $299 per month for 100 leads. $599 for 500. $1,499 for 2,000 plus. Cost per lead: $3 to $7. Your competitor is already doing this. Every day you wait is another day they're ahead. Get started today.
```

**Media to Add**:
- Rensto logo (start/end)
- Screenshot: Lead sources (LinkedIn, Apify, Google Maps)
- Screenshot: Airtable lead enrichment
- Screenshot: Agent sending Gmail + WhatsApp responses
- Screenshot: Lead conversion dashboard

---

## 🎯 **PHASE 4: SOLUTIONS VIDEOS**

### **Main Video: Hero Background** (30 seconds)

**Purpose**: Show 16 industries, explain industry-specific automation  
**Placement**: Hero section background  
**Goal**: Drive to industry selection

**Recommended Script** (30 seconds):
```
HVAC contractors. Real estate agents. Roofers. Dentists. Amazon sellers. Bookkeepers. Sixteen industries. Each with unique needs. Service scheduling. Lead response. Invoice generation. Appointment reminders. All different. All manual. Until now. Industry-specific automation. Built for YOUR business. HVAC: Service scheduling automated. Realtor: Lead response in seconds. Roofer: Invoice generation automated. Dentist: Appointment reminders automated. All industries. Gmail handled. WhatsApp answered. Airtable organized. Agent does the work. $890 to $2,990. Built for your industry. Find your package.
```

**Media to Add**:
- Rensto logo (start/end)
- Screenshots: Industry contexts (HVAC truck, realtor car, roofer job site, dentist office)
- Screenshot: Industry-specific Airtable dashboard

---

### **Additional Videos: 16 Industry Demo Videos** (30 seconds each)

**Purpose**: Help users choose the right industry package  
**Placement**: "Watch Demo" button (already implemented!)  
**Goal**: Show what each industry package includes

**Template Script** (adapt for each industry):
```
[INDUSTRY NAME] professionals. [PAIN POINT 1]. [PAIN POINT 2]. [PAIN POINT 3]. Manual chaos. Gmail [SPECIFIC ISSUE]. Google Sheets with [DATA TYPE] scattered. WhatsApp messages from [WHO] go unanswered. [CONSEQUENCE]. Losing [WHAT]. What if your agent handles it all? [SOLUTION 1] automated. [SOLUTION 2] sent automatically. [SOLUTION 3] answered via agent. [DATA TYPE] organized in Airtable. No more Sheets. No more [PROBLEM]. Agent handles Gmail, WhatsApp, [DATA TYPE] automatically. Built specifically for [INDUSTRY] professionals. Agent does the work. You focus on [CORE BUSINESS]. $890 to $2,990. Get started today.
```

**Example - HVAC**:
```
HVAC technicians. Service calls. Customer follow-ups. Invoicing. Manual chaos. Gmail reminders get lost. Google Sheets with customer data scattered. WhatsApp messages from customers go unanswered. Missing service calls. Losing customers. What if your agent handles it all? Service scheduling automated. Gmail reminders sent automatically. WhatsApp messages answered via agent. Customer data organized in Airtable. No more Sheets. No more missed calls. Agent handles Gmail, WhatsApp, customer data automatically. Built specifically for HVAC contractors. Agent does the work. You focus on service. $890 to $2,990. Get started today.
```

**Industries**: HVAC, Roofer, Dentist, Real Estate, Amazon Seller, Bookkeeping, Busy Mom, E-commerce, Fence Contractor, Insurance, Lawyer, Locksmith, Photographer, Product Supplier, Synagogue, Torah Teacher

---

---

## 📋 **DETAILED STEP-BY-STEP GUIDE**

### **PHASE 1: CUSTOM SOLUTIONS - Video 1 (Start Here!)**

#### **Step 1: Open HeyGen UI**
- [ ] Go to https://heygen.com
- [ ] Log in to Creator account
- [ ] Click "Create Video" or "New Video"

#### **Step 2: Select Avatar**
- [ ] Choose: Professional business avatar
- [ ] Recommendation: Use professional avatar for all Custom Solutions videos

#### **Step 3: Add Script (Video 1 - Hero Background)**
- [ ] Copy script from Phase 1, Video 1 above
- [ ] Paste into HeyGen script field
- [ ] Duration: 30 seconds

#### **Step 4: Configure Settings**
- [ ] Language: English
- [ ] Voice: Select professional voice
- [ ] Resolution: 1080p
- [ ] Remove watermark: Yes (Creator plan)

#### **Step 5: Add Media**
- [ ] Add Rensto logo at start (0:00-2:00)
- [ ] Add Rensto logo at end (28:00-30:00)
- [ ] Add screenshots:
  - Shelly's Google Sheets chaos
  - Airtable migration in progress
  - Custom agent dashboard

#### **Step 6: Generate & Export**
- [ ] Click "Generate"
- [ ] Wait 2-5 minutes
- [ ] Review video
- [ ] Export 1080p
- [ ] Save as: `custom-solutions-hero-shelly-story.mp4`

#### **Step 7: Upload to YouTube**
- [ ] Go to YouTube Studio
- [ ] Upload video
- [ ] Title: "Custom Automation - Shelly's Story | Rensto"
- [ ] Description: "See how Shelly saved 4.5 hours daily by migrating from Google Sheets to Airtable with custom automation. $3,500-$8,000. Free consultation: https://rensto.com/custom"
- [ ] Visibility: **Unlisted**
- [ ] Publish
- [ ] **Copy video ID** (e.g., `dQw4w9WgXcQ`)

#### **Step 8: Integrate into Custom Solutions Page**
- [ ] Open `apps/web/rensto-site/src/app/custom/page.tsx`
- [ ] Add YouTube video modal component (similar to Solutions page)
- [ ] Or embed directly in hero section
- [ ] Test locally
- [ ] Deploy to production

**Repeat Steps 1-8 for Videos 2 & 3 (Tax4Us story, How It Works)**

---

### **PHASE 2: MARKETPLACE - Videos 1 & 2**

Follow same steps as Phase 1, using Marketplace scripts from Phase 2 section above.

---

### **PHASE 3: SUBSCRIPTIONS - Videos 1 & 2**

Follow same steps as Phase 1, using Subscriptions scripts from Phase 3 section above.

---

### **PHASE 4: SOLUTIONS - Hero + 16 Industry Videos**

Follow same steps as Phase 1, using Solutions scripts from Phase 4 section above.

#### **Step 1: Open HeyGen UI**
- [ ] Go to https://heygen.com
- [ ] Log in to Creator account
- [ ] Click "Create Video" or "New Video"

#### **Step 2: Select Avatar & Look**
- [ ] Select: Stylized Rensto Mascot avatar
- [ ] Apply Look: "Industry Specialist" (see `HEYGEN_STYLIZED_AVATAR_STRATEGY.md` for look prompts)
- [ ] For HVAC: Use HVAC-specific industry look (work shirt, HVAC context)
- [ ] Recommendation: Match look to industry for authenticity

#### **Step 3: Add Script**
- [ ] Copy script from `webflow/HEYGEN_VIDEO_SCRIPTS.md` (HVAC section:

**HVAC Script (30 seconds)**:
```
HVAC technicians. Service calls. Customer follow-ups. Invoicing. Manual chaos. Gmail reminders get lost. Google Sheets with customer data scattered. WhatsApp messages from customers go unanswered. Missing service calls. Losing customers. What if your agent handles it all? Service scheduling automated. Gmail reminders sent automatically. WhatsApp messages answered via agent. Customer data organized in Airtable. No more Sheets. No more missed calls. Agent handles Gmail, WhatsApp, customer data automatically. Built specifically for HVAC contractors. Agent does the work. You focus on service. $890 to $2,990. Get started today.
```

#### **Step 4: Configure Video Settings**
- [ ] Duration: 30 seconds
- [ ] Language: English (or your preferred language)
- [ ] Voice: Select professional voice (or use voice cloning if you have it set up)
- [ ] Resolution: 1080p

#### **Step 5: Add Media**
- [ ] Add Rensto logo at start (0:00-2:00)
- [ ] Add Rensto logo at end (28:00-30:00)
- [ ] Optional: Add screenshots during narration:
  - HVAC service truck (around "HVAC technicians")
  - Gmail inbox chaos (around "Gmail reminders get lost")
  - Airtable dashboard (around "Customer data organized")

#### **Step 6: Generate Video**
- [ ] Click "Generate" or "Create Video"
- [ ] Wait for processing (usually 2-5 minutes)
- [ ] Review video

#### **Step 7: Export**
- [ ] Click "Export" or "Download"
- [ ] Select: 1080p quality
- [ ] Download video file
- [ ] Save as: `hvac-demo-video.mp4`

#### **Step 8: Upload to YouTube**
- [ ] Go to YouTube Studio
- [ ] Click "Create" → "Upload video"
- [ ] Upload `hvac-demo-video.mp4`
- [ ] Set title: "HVAC Automation Demo - Rensto"
- [ ] Set description: "See how Rensto's automation agents handle Gmail, WhatsApp, and Airtable for HVAC contractors. Built specifically for your industry. $890-$2,990. Get started: https://rensto.com/solutions"
- [ ] Set visibility: **Unlisted** (important!)
- [ ] Click "Publish"
- [ ] **Copy the video ID** from URL (e.g., `dQw4w9WgXcQ` from `youtube.com/watch?v=dQw4w9WgXcQ`)

#### **Step 9: Add to Website**
- [ ] Open `apps/web/rensto-site/src/app/solutions/page.tsx`
- [ ] Find the HVAC niche object (around line 30-52)
- [ ] Add `videoId: 'YOUR_VIDEO_ID_HERE'` (replace with actual video ID)
- [ ] Save file
- [ ] Test locally: `npm run dev`
- [ ] Verify: Click HVAC → Click "Watch Demo" → Video should open in modal

#### **Step 10: Deploy**
- [ ] Commit changes: `git add . && git commit -m "Add HVAC demo video"`
- [ ] Deploy: `cd apps/web/rensto-site && vercel --prod --yes`
- [ ] Test on production: https://rensto.com/solutions → Click HVAC → "Watch Demo"

---

### **Phase 3: Create Remaining 4 Videos (Day 3-7)**

Repeat Phase 2 for each industry:

#### **Video 2: Roofer**
- [ ] Use template script (adapt for roofing industry)
- [ ] Script focus: Storm damage leads, insurance claims, project management
- [ ] Upload to YouTube (unlisted)
- [ ] Add video ID to Roofer niche object
- [ ] Deploy

#### **Video 3: Dentist**
- [ ] Use template script (adapt for dental practice)
- [ ] Script focus: Appointment reminders, insurance verification, patient follow-ups
- [ ] Upload to YouTube (unlisted)
- [ ] Add video ID to Dentist niche object
- [ ] Deploy

#### **Video 4: Real Estate**
- [ ] Use template script (adapt for real estate)
- [ ] Script focus: Lead nurturing, property listings, client relationships
- [ ] Upload to YouTube (unlisted)
- [ ] Add video ID to Real Estate niche object
- [ ] Deploy

#### **Video 5: Amazon Seller**
- [ ] Use template script (adapt for Amazon FBA)
- [ ] Script focus: Inventory management, review monitoring, order processing
- [ ] Upload to YouTube (unlisted)
- [ ] Add video ID to Amazon Seller niche object
- [ ] Deploy

---

### **Phase 4: Template Scripts for Remaining Industries**

For industries not in the initial 5, use this template:

**Template Script (30 seconds)**:
```
[INDUSTRY NAME] professionals. [PAIN POINT 1]. [PAIN POINT 2]. [PAIN POINT 3]. Manual chaos. Gmail [SPECIFIC ISSUE]. Google Sheets with [DATA TYPE] scattered. WhatsApp messages from [WHO] go unanswered. [CONSEQUENCE]. Losing [WHAT]. What if your agent handles it all? [SOLUTION 1] automated. [SOLUTION 2] sent automatically. [SOLUTION 3] answered via agent. [DATA TYPE] organized in Airtable. No more Sheets. No more [PROBLEM]. Agent handles Gmail, WhatsApp, [DATA TYPE] automatically. Built specifically for [INDUSTRY] professionals. Agent does the work. You focus on [CORE BUSINESS]. $890 to $2,990. Get started today.
```

**Example - Roofer**:
```
Roofing contractors. Storm damage leads. Insurance claim coordination. Project management. Manual chaos. Gmail reminders get lost. Google Sheets with project data scattered. WhatsApp messages from customers go unanswered. Missing storm damage opportunities. Losing projects. What if your agent handles it all? Lead response automated. Insurance coordination sent automatically. Project updates answered via agent. Project data organized in Airtable. No more Sheets. No more missed opportunities. Agent handles Gmail, WhatsApp, project data automatically. Built specifically for roofing contractors. Agent does the work. You focus on installations. $890 to $2,990. Get started today.
```

---

## 📊 **PROGRESS TRACKER**

### **Phase 1: Essential Hero Videos** (Week 1) 🔥 **START HERE**
- [ ] Custom Solutions - Hero Video (30-60s) - **TOP PRIORITY**
- [ ] Marketplace - Hero Video (30-60s)
- [ ] Subscriptions - Hero Video (30-60s)
- [ ] Solutions - Hero Video (30s)

**Goal**: 4 videos in 1-2 days

### **Phase 2: Demo Videos** (Week 2)
- [ ] Marketplace - Installation Demo (60-90s)
- [ ] Subscriptions - Lead Generation Demo (60-90s)

**Goal**: 2 videos in 1-2 days

### **Phase 3: Industry Demos** (Week 3-4)
- [ ] Solutions - 16 Industry Videos (30s each)

**Goal**: 16 videos in 1-2 weeks (can batch create)

---

## 🎬 **HEYGEN UI TIPS**

### **Best Practices**:
1. **Avatar Selection**: Use professional business avatar for industry demos
2. **Voice**: Choose clear, professional voice (test a few options)
3. **Pacing**: Script should be ~150-200 words for 30-second video
4. **Media**: Add logo at start/end, screenshots during key points
5. **Brand Kit**: Use Rensto brand colors if available in HeyGen

### **Common Issues**:
- **Video too long**: Shorten script or increase speaking speed
- **Avatar looks off**: Try different avatar or adjust settings
- **Audio quality**: Use HeyGen's built-in TTS (usually good enough)

---

## ✅ **QUALITY CHECKLIST**

Before uploading each video:
- [ ] Script matches industry (pain points, solutions, pricing)
- [ ] Rensto logo appears at start and end
- [ ] Video is 30 seconds (or target duration)
- [ ] Audio is clear and professional
- [ ] Avatar looks professional
- [ ] No watermarks (Creator plan removes them)
- [ ] 1080p quality

Before deploying to website:
- [ ] Video ID is correct (test YouTube URL)
- [ ] Video is unlisted on YouTube
- [ ] Code change is saved
- [ ] Tested locally (video modal opens)
- [ ] Deployed to production
- [ ] Tested on live site

---

## 🚀 **QUICK START (TODAY)** 🔥 **START HERE**

**Priority 1: Custom Solutions Hero Video** (30-60 seconds)

1. **Open HeyGen**: https://heygen.com
2. **Copy script** from "PHASE 1: CUSTOM SOLUTIONS - HERO VIDEO" above
3. **Create video**:
   - Select: Professional business avatar
   - Paste script (60 seconds)
   - Add Rensto logo (start/end)
   - Add screenshots (Gmail chaos, Sheets, Airtable, workflow)
   - Generate → Export 1080p
4. **Upload to YouTube** (unlisted)
5. **Get video ID**
6. **Integrate into Custom Solutions page**:
   - Add as hero section background (autoplay, muted, loop)
   - Or use video modal (see `docs/website/VIDEO_INTEGRATION_GUIDE_NOV16.md`)
7. **Deploy to production**

**Time**: ~2-3 hours for first video (including HeyGen learning + integration)

**Next**: Create remaining 3 hero videos (Marketplace, Subscriptions, Solutions), then add demo videos

---

## 📝 **NOTES**

- **Scripts are ready**: All scripts exist in `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- **Code is ready**: YouTube video embedding is already implemented
- **You just need**: Create videos in HeyGen UI and add video IDs to code
- **No coding required**: Just copy/paste video IDs

---

## 🆘 **TROUBLESHOOTING**

**Issue**: Video doesn't open in modal
- **Fix**: Check video ID is correct, ensure YouTube video is unlisted

**Issue**: Video quality is low
- **Fix**: Export in 1080p, ensure Creator plan is active

**Issue**: Script is too long/short
- **Fix**: Adjust script length (aim for 150-200 words for 30 seconds)

**Issue**: Avatar doesn't look right
- **Fix**: Try different avatar, or use @shai for founder videos

---

**Ready to start? Begin with Phase 2 (HVAC video) - it's the template for all others!**

