# 🎥 Video Asset Placement Guide (Sora2 Pro + Cameo)

**Date**: October 31, 2025  
**Tool**: Sora2 Pro (video generation) + Cameo (voiceover)  
**Purpose**: Exact locations for all videos across website

---

## 📊 **VIDEO STORAGE STRATEGY**

### **Recommended: Webflow Asset Manager**

**Why**:
- Direct integration with Webflow Designer
- Automatic CDN hosting
- Easy to manage and update
- No external dependencies

**Upload Process**:
1. Webflow Designer → Assets panel
2. Click "Upload Assets"
3. Create folders:
   - `/videos/homepage/`
   - `/videos/marketplace/`
   - `/videos/subscriptions/`
   - `/videos/ready-solutions/`
   - `/videos/custom-solutions/`
   - `/videos/case-studies/`

**Alternative**: YouTube Unlisted (for longer videos)
- Upload to YouTube as unlisted
- Embed via iframe in Webflow
- Better for SEO (YouTube indexing)

---

## 📍 **EXACT VIDEO PLACEMENT BY PAGE**

### **1. HOMEPAGE** (`688967be8e345bde39d46152`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background (behind text)
**File**: `homepage-hero-morning-routine.mp4`
**Content**: "Business Owner Morning Routine" split-screen (30 seconds)
**Sora2 Pro Prompt**:
- Left side: Business owner at desk, overwhelmed, 47 browser tabs, frantic typing
- Right side: Same person, calm, organized dashboard, coffee break
**Cameo Script**:
- "6am: Already behind. 94 emails overnight. Remember: forgot to follow up with 6 leads yesterday. Copying data between systems (again). 9:30am. Actual work hasn't started yet."
- (Right side): "7am: Slept an extra hour. Overnight emails sorted automatically. Follow-ups sent while sleeping. Data synced across all tools automatically. 8am. Starting strategic work with coffee still hot."
**Settings**: Autoplay, muted, loop, poster image for mobile
**Size**: 1920×1080 (desktop), 1080×1080 (mobile)
**Format**: MP4, H.264, < 5MB (compressed)

#### **Video #2: Service Card - Marketplace** (Priority 2)
**Location**: Marketplace service card (hover or click to play)
**File**: `homepage-service-marketplace.mp4`
**Content**: "The Tool Hoarder" character (15 seconds)
**Sora2 Pro Prompt**: Business owner with laptop showing 47 browser tabs, switching frantically between apps
**Cameo Script**: "I'm very organized. I have a tool for everything. Email tool. Calendar tool. CRM tool. Invoicing tool. [frantic clicking] And I spend 90 minutes a day just switching between them all. Where did I save that client note?"
**Settings**: Click to play (no autoplay)

#### **Video #3: Service Card - Subscriptions** (Priority 2)
**Location**: Subscriptions service card
**File**: `homepage-service-subscriptions.mp4`
**Content**: "Follow-Up Failure" scenario (15 seconds)
**Sora2 Pro Prompt**: Calendar showing Monday, Tuesday, Wednesday... lead notification fades
**Cameo Script**: "Nailed that sales call! [day passes] Meant to follow up yesterday... [day 3] Definitely following up today... [day 7] Why haven't they responded? [LinkedIn notification: Competitor connected]"

#### **Video #4: Service Card - Ready Solutions** (Priority 2)
**Location**: Ready Solutions service card
**File**: `homepage-service-ready-solutions.mp4`
**Content**: "The Optimistic Multi-Tasker" (15 seconds)
**Sora2 Pro Prompt**: Split-screen: confident business owner saying "I've got this" vs. actual chaos on desktop
**Cameo Script**: "I've got this under control. [screen split shows: 89 browser tabs, 47 unread Slack messages, 6 missed calls, 3 double-booked meetings]"

#### **Video #5: Service Card - Custom Solutions** (Priority 2)
**Location**: Custom Solutions service card
**File**: `homepage-service-custom-solutions.mp4`
**Content**: "The Heroic Martyr" (15 seconds)
**Sora2 Pro Prompt**: Business owner working late, exhausted but proud
**Cameo Script**: "Some people use automation. Not me. I do everything personally. Every email. Every invoice. Every data entry. Because I care about my clients. [yawn] Sure, I haven't slept more than 4 hours in six months. But at least I can say I did everything MYSELF."

#### **Video #6: Pain Point Section** (Priority 3)
**Location**: Between services and features sections
**File**: `homepage-pain-point-weekend-warrior.mp4`
**Content**: "Weekend Warrior" sketch (20 seconds)
**Sora2 Pro Prompt**: Business owner at kid's game, checking phone, working on laptop
**Cameo Script**: "I don't work weekends. I just check email really quick on Saturday morning. And then I remembered I forgot to invoice three clients. And then I saw a lead came in Friday night so I need to respond before Monday. [looks up, dark outside] Wait, is it Sunday night?"

---

### **2. MARKETPLACE PAGE** (`68ddb0fb5b6408d0687890dd`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background
**File**: `marketplace-hero-tool-hoarder.mp4`
**Content**: "The Optimistic Multi-Tasker" (30 seconds)
**Sora2 Pro Prompt**: Business owner confidently saying "I've got this" while screen shows chaos
**Cameo Script**: "You've got 47 browser tabs open. Three of them are calendar apps you forgot you had open. Five are email threads you swore you'd respond to. Twelve are tools that don't talk to each other, so you're manually copying data between them. And somewhere in that chaos is the thing you actually needed to do today."

#### **Video #2: Installation Demo** (Priority 1)
**Location**: "How It Works" section
**File**: `marketplace-installation-demo.mp4`
**Content**: "Manual Setup vs. 10-Minute Installation" (60 seconds)
**Sora2 Pro Prompt**: Split-screen comparison
**Cameo Script**: "Manual setup: 3 hours of configuration, 47 browser tabs, copy-paste hell, frustration, errors. Automated installation: 10 minutes, one-click, everything connected, ready to use. The difference? We built it so you don't have to."

---

### **3. SUBSCRIPTIONS PAGE** (`68dfc41ffedc0a46e687c84b`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background
**File**: `subscriptions-hero-followup-failure.mp4`
**Content**: "Follow-Up Failure" scenario (30 seconds)
**Sora2 Pro Prompt**: Calendar progression, lead notification fading, competitor connection notification
**Cameo Script**: "While you're manually entering data, your competitor just closed another deal. They're not smarter. They're not better at sales. They just responded faster. Because while you were copying customer info between systems, they were responding to leads in minutes—automated."

#### **Video #2: Lead Generation Demo** (Priority 1)
**Location**: Features section
**File**: `subscriptions-lead-gen-demo.mp4`
**Content**: "Manual Lead Gen vs. Automated Delivery" (45 seconds)
**Sora2 Pro Prompt**: Dashboard comparison: manual spreadsheet vs. automated dashboard
**Cameo Script**: "Manual: Hours researching leads, manual data entry, forgotten follow-ups, lost deals. Automated: Leads delivered monthly, verified contacts, automatic follow-ups, deals closed."

---

### **4. READY SOLUTIONS PAGE** (`68dfc5266816931539f098d5`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background
**File**: `ready-solutions-hero-industry-montage.mp4`
**Content**: "Industry Montage" (30 seconds)
**Sora2 Pro Prompt**: Quick cuts of different industries: HVAC tech, realtor, roofer, dentist
**Cameo Script**: "Every industry has the same problems: email chaos, forgotten follow-ups, manual data entry, tool juggling. Generic automation tries to be everything to everyone. Industry-specific automation actually solves YOUR problems."

#### **Video #2-6: Top 5 Industry Videos** (Priority 2)
**Location**: Industry cards (hover to play)

**HVAC** (`homepage-service-hvac.mp4`):
**Sora2 Pro**: HVAC technician with tablet, service van
**Cameo**: "Forgetting to follow up on service calls? That's money walking out the door."

**Realtor** (`homepage-service-realtor.mp4`):
**Sora2 Pro**: Realtor with phone, showing property
**Cameo**: "Lead came in Friday night. You responded Monday. They already bought from your competitor."

**Roofer** (`homepage-service-roofer.mp4`):
**Sora2 Pro**: Roofer on roof, tablet in hand
**Cameo**: "Spending Saturday on invoices instead of closing that storm damage deal."

**Dentist** (`homepage-service-dentist.mp4`):
**Sora2 Pro**: Dentist office, scheduling system
**Cameo**: "Manual scheduling = no-shows. Automated reminders = full appointment books."

**Amazon Seller** (`homepage-service-amazon-seller.mp4`):
**Sora2 Pro**: Amazon seller dashboard, product listings
**Cameo**: "Inventory management, pricing, reviews—all manual. Automation handles it while you sleep."

---

### **5. CUSTOM SOLUTIONS PAGE** (`68ddb0642b86f8d1a89ba166`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background
**File**: `custom-solutions-hero-heroic-martyr.mp4`
**Content**: "The Heroic Martyr" character sketch (30 seconds)
**Sora2 Pro Prompt**: Exhausted business owner, proud but defeated
**Cameo Script**: "You're not supposed to be the robot. That's literally what computers are for. You started this business for vision, energy, plans to actually enjoy it. Then reality hit: manual processes, endless follow-ups, tool chaos. Custom automation fixes YOUR specific problems."

#### **Video #2: Consultation Demo** (Priority 1)
**Location**: "How It Works" section
**File**: `custom-solutions-consultation-demo.mp4`
**Content**: "Voice AI Consultation Walkthrough" (60 seconds)
**Sora2 Pro Prompt**: Screen recording of consultation interface
**Cameo Script**: "Step 1: Tell us what's killing you. 30-minute call where you vent about everything manual and annoying. We listen, take notes, plot your escape route. Step 2: We build your automation. Custom workflows connecting YOUR tools, automating YOUR busywork. Step 3: Launch and reclaim your time. 48 hours later, follow-ups send themselves, data syncs automatically, invoices generate on schedule."

---

### **6. CASE STUDIES PAGE** (`6905208b87881520f8fb1fa4`)

#### **Video #1: Hero Background** (Priority 1)
**Location**: Hero section background
**File**: `case-studies-hero-results-montage.mp4`
**Content**: "Real Results Montage" (30 seconds)
**Sora2 Pro Prompt**: Success visuals: before/after metrics, business transformation
**Cameo Script**: "Real results from real businesses. Not corporate fluff. See how companies transformed from manual chaos to intelligent automation."

#### **Video #2-4: Case Study Testimonials** (Priority 1)
**Location**: Each case study card

**Shelly (Insurance)** (`case-studies-shelly-testimonial.mp4`):
**Content**: 60-90 second interview
**Sora2 Pro**: Professional headshot + metrics overlay
**Cameo Questions**:
- "What was your biggest pain point before automation?"
- "How much time do you save now?"
- "What would you tell other business owners?"

**Tax4Us (Tax Services)** (`case-studies-tax4us-testimonial.mp4`):
**Content**: 60-90 second interview
**Similar format**

**Wonder.care (Healthcare)** (`case-studies-wonder-care-testimonial.mp4`):
**Content**: 60-90 second interview
**Similar format**

---

## 🖼️ **IMAGE ASSET PLACEMENT**

### **Character Illustrations** (All Pages)

#### **"Inbox Warrior"**
**Location**: Email automation sections
**File**: `character-inbox-warrior.png`
**Size**: 800×600
**Style**: Business owner at desk, overwhelmed by email notifications
**Pages**: Homepage, Subscriptions, Ready Solutions

#### **"Weekend Warrior"**
**Location**: Time savings sections
**File**: `character-weekend-warrior.png`
**Size**: 800×600
**Style**: Business owner working Saturday, family in background
**Pages**: Homepage, Custom Solutions

#### **"Tool Hoarder"**
**Location**: Integration/tool sections
**File**: `character-tool-hoarder.png`
**Size**: 800×600
**Style**: Split-screen showing 47 browser tabs, app chaos
**Pages**: Homepage, Marketplace

#### **"Heroic Martyr"**
**Location**: Manual work sections
**File**: `character-heroic-martyr.png`
**Size**: 800×600
**Style**: Exhausted but proud posture, working late
**Pages**: Custom Solutions

---

### **Meme Graphics** (FAQ Sections, Pain Point Sections)

**Files Needed**: 10 meme-style graphics from strategy
- `meme-before-after-manual-vs-automated.png`
- `meme-is-this-entrepreneurship.png`
- `meme-weekend-thief.png`
- `meme-inbox-hell.png`
- `meme-followup-failure.png`
- `meme-competitor-advantage.png`
- `meme-tool-chaos.png`
- `meme-email-overload.png`
- `meme-time-waster.png`
- `meme-data-entry-hell.png`

**Location**: FAQ sections, objection-handling sections
**Size**: 1080×1080 (square, social-ready)

---

### **Infographics** (Stats Sections)

**Files Needed**:
- `infographic-email-overload-stats.png` (121 checks/day, 28% of workweek)
- `infographic-followup-roi.png` (48% never follow up, 400% better conversion)
- `infographic-time-savings.png` (20+ hours/week reclaimed)
- `infographic-competitor-gap.png` (35-50% sales go to fastest responder)

**Location**: Stats sections, social proof sections
**Size**: 1200×800 (landscape)

---

## 📋 **VIDEO PRODUCTION WORKFLOW**

### **Step 1: Script Creation** (Use Content Strategy)
- Extract exact scripts from content strategy document
- Adapt to 15-30 second format
- Add Cameo voiceover timing

### **Step 2: Sora2 Pro Generation**
- Use prompts provided above
- Generate videos matching descriptions
- Export in 1920×1080 (desktop) or 1080×1080 (mobile)

### **Step 3: Cameo Voiceover**
- Record voiceover using Cameo
- Match timing to Sora2 Pro videos
- Export audio separately

### **Step 4: Video Editing**
- Combine Sora2 Pro visuals + Cameo audio
- Add captions/subtitles (70-80% watch without sound)
- Compress to < 5MB per video
- Format: MP4, H.264

### **Step 5: Upload to Webflow**
- Upload to Webflow Asset Manager
- Organize in folder structure
- Get embed URLs

### **Step 6: Embed in Pages**
- Add video elements in Webflow Designer
- Configure settings (autoplay, muted, loop)
- Add poster images for mobile
- Test playback

---

## ✅ **VIDEO PLACEMENT CHECKLIST**

### **Priority 1 Videos** (Week 1-2):
- [ ] Homepage hero video
- [ ] Marketplace hero video
- [ ] Subscriptions hero video
- [ ] Ready Solutions hero video
- [ ] Custom Solutions hero video
- [ ] Case Studies hero video

### **Priority 2 Videos** (Week 3-4):
- [ ] Homepage service card videos (4 videos)
- [ ] Marketplace installation demo
- [ ] Subscriptions lead gen demo
- [ ] Ready Solutions top 5 industry videos
- [ ] Custom Solutions consultation demo
- [ ] Case Studies testimonials (3 videos)

### **Priority 3 Videos** (Week 5-6):
- [ ] Homepage pain point video
- [ ] Additional industry videos (11 remaining)
- [ ] FAQ explainer videos
- [ ] Tutorial videos

---

**Status**: Plan ready, exact locations specified  
**Next**: Create video production schedule, generate with Sora2 Pro + Cameo

