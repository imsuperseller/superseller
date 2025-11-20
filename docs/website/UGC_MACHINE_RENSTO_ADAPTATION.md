# 🎬 UGC Machine Workflow - Rensto Adaptation Guide

**Date**: November 16, 2025  
**Status**: ✅ **READY TO IMPLEMENT**  
**Source**: Chase AI's "AI Ads God" workflow + tutorial transcript

---

## 🎯 **OVERVIEW**

This guide shows how to adapt the UGC Machine workflow (from the tutorial) to create video ads for Rensto's services. Instead of product ads, we'll use it to:

1. **Find winning automation/tech service ads** from Meta Ad Library
2. **Reverse-engineer their structure** using Gemini
3. **Adapt them for Rensto's services** (Marketplace, Tailored Solutions, Industry Packages, Subscriptions)
4. **Generate Sora 2 prompts** ready for video creation

**Key Difference**: We're creating **service ads**, not product ads. The workflow stays the same, but the messaging adapts to Rensto's value propositions.

---

## 🔄 **HOW IT WORKS (Rensto Version)**

### **Step 1: Find Winning Ads**
- Search Meta Ad Library for: "automation", "workflow", "n8n", "business automation", "lead generation", "CRM automation"
- Look for ads running 4-6+ weeks (proven winners)
- Focus on UGC-style testimonials, case studies, service demos

### **Step 2: Analyze with Gemini**
- Upload winning ad URL to Airtable
- Gemini analyzes: cinematography, editing style, dialogue, character, performance
- Creates detailed template (same as original workflow)

### **Step 3: Adapt for Rensto**
- LLM receives:
  - Original ad analysis
  - **Rensto brand messaging** (from Custom GPT or manual)
  - **Service type** (Marketplace, Tailored Solutions, etc.)
  - **Character** (HeyGen stylized avatar or Sora 2 cameo)

### **Step 4: Generate Sora 2 Prompts**
- Creates 10-15 second prompt segments
- Adapts dialogue to Rensto's messaging
- Preserves visual style from winning ad
- Outputs ready-to-use prompts

---

## 📋 **SETUP INSTRUCTIONS**

### **Boost.space Authentication**

**Already Configured**: The workflow uses your existing Boost.space credential:
- **Credential ID**: `Q8kGX30JZ1ONAdgL`
- **Credential Name**: `boost.space`
- **Type**: HTTP Header Auth (Bearer token)
- **Applied to**: Both "Get a record" and "Update record" nodes

**No setup needed** - The credential is already referenced in the workflow.

### **Prerequisites**

1. **Boost.space Notes Module** (Create in Space)
   - **Space**: Create new Space or use existing (e.g., Space 60 for Video Content)
   - **Note Structure**: Each note stores one ad analysis
   - **Fields stored in note content** (JSON):
     - `originalAdUrl` (text)
     - `renstoServiceMessage` (long text) → **Rensto service messaging**
     - `character` (text) → **HeyGen avatar name or Sora 2 cameo**
     - `scene1Prompt` through `scene5Prompt` (long text)
   - **Labels**: `["sora2", "ugc-machine", "video-prompts"]` (for filtering)

2. **n8n Workflow** (Import `ugcMachine.json`)
   - **Webhook Node**: Update production URL
   - **HTTP Request Nodes**: 
     - **Get Note**: `GET https://superseller.boost.space/api/note/{id}`
     - **Update Note**: `PUT https://superseller.boost.space/api/note/{id}`
     - **Auth**: Uses existing credential `boost.space` (ID: `Q8kGX30JZ1ONAdgL`)
   - **Gemini Node**: Add API key (free tier available)
   - **OpenRouter Node**: Add API key (Claude Sonnet 4.5)

3. **Brand Messaging** (Prepare in advance)
   - Use Custom GPT: https://chatgpt.com/g/g-690e8d15c50c8191bcf2d162a93387bb-brand-messaging
   - Or manually create system prompt with:
     - Service type (Marketplace, Tailored Solutions, etc.)
     - Value propositions
     - Target audience
     - Key messaging points
     - Brand voice

4. **Character Setup**
   - **Option A**: Use HeyGen stylized avatar (see `HEYGEN_STYLIZED_AVATAR_STRATEGY.md`)
   - **Option B**: Create Sora 2 cameo (like `@chasegpt_1` in tutorial)
   - **Option C**: Use detailed character description

---

## 🎨 **RENSTO-SPECIFIC ADAPTATIONS**

### **1. Service-Specific Messaging**

**For Marketplace Ads**:
```
Service Type: Marketplace (DIY Templates)
Value Props: $29-$197 templates, instant download, self-install
Target: DIY business owners, solopreneurs
Messaging: "Stop paying $3,000 for custom automation. Get proven workflows for $29."
```

**For Tailored Solutions Ads**:
```
Service Type: Tailored Solutions (Bespoke Automation)
Value Props: Custom-built workflows, voice AI consultation, full setup
Target: Growing businesses, agencies
Messaging: "We build exactly what you need. Free consultation, custom automation."
```

**For Industry Packages Ads**:
```
Service Type: Industry Packages (Niche-Specific)
Value Props: $890-$2,990 packages, industry-specific workflows
Target: HVAC, Dentist, Roofer, Real Estate, etc.
Messaging: "Everything you need for [industry]. Proven workflows, ready to deploy."
```

**For Subscriptions Ads**:
```
Service Type: Subscriptions (SaaS Mini-Apps)
Value Props: $299-$1,499/month, lead generation, video generation, CRM
Target: Service businesses needing ongoing automation
Messaging: "Get 100-500 leads/month delivered automatically. Or generate videos on demand."
```

### **2. Character Selection**

**Use Your Stylized Avatar** (from `HEYGEN_STYLIZED_AVATAR_STRATEGY.md`):
- **Name**: `Rensto Mascot Base` (or whatever you named it)
- **In Sora 2**: Reference as detailed description (Sora 2 doesn't support HeyGen avatars directly)
- **Alternative**: Create Sora 2 cameo using your stylized avatar as reference

**Sora 2 Cameo Creation** (Recommended):
1. Generate video in Sora 2 using your stylized avatar description
2. Create cameo from that video (like `@chasegpt_1`)
3. Reference as `@shai-lfc` in prompts (user's Sora 2 cameo)

### **3. Ad Types to Target**

**Search Terms for Meta Ad Library**:
- "business automation"
- "workflow automation"
- "n8n automation"
- "lead generation service"
- "CRM automation"
- "marketing automation"
- "small business automation"
- "agency automation"

**Ad Styles to Look For**:
- ✅ UGC testimonials ("I saved 20 hours/week...")
- ✅ Before/after comparisons
- ✅ Service demos
- ✅ Case study videos
- ✅ Problem → Solution narratives
- ❌ Avoid: Product unboxings, e-commerce ads

---

## 📝 **WORKFLOW MODIFICATIONS**

### **Modify System Prompt (Prompt Generator Node)**

**Original**: Adapts product ads  
**Rensto Version**: Adapts service ads

**Key Changes**:
1. **Dialogue Adaptation**: Focus on time saved, automation benefits, service outcomes
2. **Product References**: Replace with "workflow", "automation", "system", "service"
3. **CTAs**: "Get started at rensto.com" instead of "Buy at Costco"
4. **Visuals**: Show dashboards, workflows, automation in action (not physical products)

**Example Dialogue Adaptation**:

**Original (Product)**:
> "went to Costco over the weekend and I got Mr. Hyde's, Hyde's Signature Dual Tub. Now this is for energy. So I'm one to like not like to try things that like make you jittery."

**Rensto Version (Service)**:
> "I was spending 20 hours a week on manual tasks. Gmail, Sheets, WhatsApp, all manual. Then I found Rensto's automation templates. Now I'm one to not like paying thousands for custom automation. These templates are $29 and they actually work."

---

## 🎬 **USAGE WORKFLOW**

### **Step-by-Step Process**

1. **Find Winning Ad**
   - Go to Meta Ad Library
   - Search for automation/service ads
   - Find one running 4-6+ weeks
   - Extract video URL (right-click → Inspect → Network → Copy media URL)

2. **Prepare Boost.space Note**
   - Create new Note in Boost.space
   - **Title**: Ad name (e.g., "Automation Service UGC Ad")
   - **Content** (JSON format):
     ```json
     {
       "originalAdUrl": "https://video-url...",
       "renstoServiceMessage": "Service Type: Marketplace...",
       "character": "@shai-lfc"
     }
     ```
   - **Labels**: Add `sora2`, `ugc-machine`, `video-prompts`
   - Copy Note ID from URL

3. **Run Workflow**
   - Call webhook: `https://your-n8n.com/webhook/{webhook-id}?recordId={note-id}`
   - Or trigger manually in n8n with Note ID
   - Wait 1-3 minutes
   - Prompts populate in note content: `scene1Prompt` through `scene5Prompt`

4. **Review & Refine**
   - Check dialogue matches Rensto messaging
   - Verify character references
   - Ensure service type is correct
   - Adjust if needed

5. **Generate Videos**
   - Copy prompts to Sora 2 (or Kai.ai for cheaper)
   - Generate 10-15 second clips
   - Stitch together in post-production
   - Add captions, logo, final edits

---

## 🔗 **INTEGRATION WITH EXISTING STRATEGY**

### **Connection to HeyGen Strategy**

**HeyGen Videos** (from `HEYGEN_DEMO_VIDEOS_ACTION_PLAN_NOV16.md`):
- **Purpose**: Demo videos, hero videos, industry-specific content
- **Style**: Professional, polished, stylized avatar

**UGC Machine Videos** (This workflow):
- **Purpose**: Social media ads, conversion-focused content
- **Style**: Authentic UGC, testimonial-style, based on winning ads

**Use Both**:
- **HeyGen**: Website hero videos, demo pages, industry packages
- **UGC Machine**: Facebook/Instagram ads, TikTok, YouTube Shorts

### **Connection to Video Generation Subscription**

**Subscription Service**: Video Generation ($297-$1,997/month)
- **Use Case**: Generate videos for customers using this workflow
- **Process**: Customer provides ad URL → Workflow generates prompts → You create videos
- **Value**: "We'll create video ads based on proven winners in your niche"

---

## 📊 **EXAMPLE: RENSTO MARKETPLACE AD**

### **Winning Ad Found**:
- **Original**: UGC testimonial for business tool
- **Style**: Kitchen selfie, fast-paced, authentic
- **Duration**: 30 seconds

### **Rensto Adaptation**:

**Scene 1 (10 seconds)**:
```
"Spent $3,000 on custom automation last year. Didn't work. Then I found Rensto's marketplace. Templates are $29. They actually work. I'm one to not like paying thousands for something I can get for $29."
```

**Scene 2 (15 seconds)**:
```
B-ROLL: Dashboard showing automation running, workflows active, time saved metrics
Voiceover: "I've been using their lead generation template. It connects Gmail, Airtable, and n8n. Everything automated. I'm getting 50 leads a week now. All for $29."
```

**Scene 3 (5 seconds)**:
```
"Check out rensto.com/marketplace. Templates start at $29. Stop overpaying for automation."
```

---

## 🚀 **NEXT STEPS**

1. **Import Workflow**: Copy `ugcMachine.json` to n8n
2. **Set Up Airtable**: Create base with required fields
3. **Prepare Brand Messaging**: Use Custom GPT or create manually
4. **Create Character**: Set up HeyGen avatar or Sora 2 cameo
5. **Test Run**: Find one winning ad, run workflow, review output
6. **Iterate**: Refine prompts, adjust messaging, test different ad styles

---

## 📚 **RELATED DOCUMENTS**

- **HeyGen Strategy**: `docs/website/HEYGEN_STYLIZED_AVATAR_STRATEGY.md`
- **HeyGen Scripts**: `webflow/HEYGEN_VIDEO_SCRIPTS.md`
- **Video Strategy**: `docs/website/HEYGEN_DEMO_VIDEOS_ACTION_PLAN_NOV16.md`
- **Subscription Services**: `docs/website/SUBSCRIPTION_SERVICES_COMPLETE_LIST.md`

---

## ⚠️ **IMPORTANT NOTES**

1. **Sora 2 Limitations**: 
   - Can't directly use HeyGen avatars
   - Need to create Sora 2 cameo or use detailed descriptions
   - Consider using HeyGen for talking head, Sora 2 for B-roll

2. **Cost Considerations**:
   - Gemini API: Free tier available
   - OpenRouter: Pay-per-use (Claude Sonnet 4.5)
   - Sora 2: $0.15 per 10-second video (Kai.ai) or free with watermark

3. **Iteration Required**:
   - First prompts may need refinement
   - Test multiple variations
   - Edit in post-production

4. **Legal/Compliance**:
   - Don't copy competitor ads exactly
   - Adapt messaging, visuals, dialogue
   - Use as inspiration, not duplication

---

**Last Updated**: November 16, 2025  
**Status**: Ready for implementation  
**Next Action**: Import workflow, set up Airtable, test with one ad

