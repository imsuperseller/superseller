---
name: Content Strategy
description: SuperSeller AI content strategy — blog cadence, social publishing pipeline, content pillars, and SocialHub workflow reference
---

# SuperSeller AI — Content Strategy

## Current State

- **Blog**: 7 posts live on superseller.agency/blog (5 seeded at launch + 2 generated via SocialHub pipeline)
- **Facebook Page**: SuperSeller AI (Page ID: 294290977372290) -- 1,094 followers
- **Instagram**: Account ID 17841410951596580 -- connected via same Meta Graph API token
- **SocialHub/Buzz**: LIVE -- text + image generation, WhatsApp approval, Facebook publishing
- **Aitable Dashboard**: Content posts synced to datasheet dstTYYmleksXHj3sCj

## Content Pillars

All SuperSeller AI content maps to one of four pillars. Rotate across pillars weekly to maintain variety and cover the full audience.

### 1. AI Automation for Small Business
**Goal**: Educate small business owners on what AI can actually do for them (not hype, real use cases).
**Topics**:
- How AI handles repetitive tasks (posting listings, following up leads, creating content)
- The 7 AI crew members and what each one does
- Before/after: manual process vs AI-automated process
- "Day in the life" of a business using SuperSeller AI
**Audience resonance**: This is the core value prop. Most of our ICP (Israeli/Jewish small biz owners, 30-55) know AI exists but do not know how to use it for their specific business.

### 2. Small Business Growth
**Goal**: Position SuperSeller as a growth partner, not just a tool.
**Topics**:
- Revenue optimization for $100K-$1M businesses
- Lead generation and follow-up strategies
- Time savings and ROI calculations
- Seasonal business patterns and how to prepare
- Pricing strategies for service businesses (contractors, HVAC, locksmiths)
**Audience resonance**: Our ICP cares about revenue first. Every piece of content should connect back to money saved or money earned.

### 3. Real Estate Tech
**Goal**: Showcase TourReel as the standout product for real estate professionals.
**Topics**:
- Virtual tour creation with AI (TourReel / Forge)
- Listing marketing automation
- How AI videos increase listing views and engagement
- Real estate photography tips and tricks
- Market-specific content (Dallas, Austin, Houston -- current customer base)
**Audience resonance**: Real estate agents are early adopters of visual tech. TourReel is our most mature product with 25+ AI videos produced.

### 4. Customer Success Stories
**Goal**: Social proof through real results.
**Topics**:
- Customer spotlights with permission
- Metrics and outcomes (listings posted, leads generated, videos created)
- Industry-specific wins (HVAC contractor, real estate agent, restaurant owner)
**CRITICAL RULE**: ONLY publish customer stories that are documented and verified. NEVER fabricate testimonials, quotes, or case studies. If we do not have a real story to tell, skip this pillar for the week and double up on another.

## Publishing Cadence

### Weekly Schedule
| Day | Platform | Content Type | Pillar Rotation |
|-----|----------|-------------|----------------|
| Monday | FB + IG | Educational tip / "Did you know" | AI Automation |
| Tuesday | Blog | Deep-dive article (800-1200 words) | Rotating |
| Wednesday | FB + IG | Crew member spotlight | AI Automation |
| Thursday | FB + IG | Engagement (poll / question) | Small Biz Growth |
| Friday | FB + IG | Product demo / behind-the-scenes | Real Estate Tech or any |
| Saturday | FB + IG | Repost best performer or inspirational | Any |
| Sunday | -- | Rest / plan next week | -- |

### Posting Times (US Central Time -- Dallas base)
- **Facebook**: 10:00 AM CT (Tue-Fri), 11:00 AM CT (weekend)
- **Instagram**: 12:00 PM CT (peak engagement for SMB audience)
- **Blog**: 8:00 AM CT Tuesday (catch morning readers)

### Monthly Targets
- 20-24 social posts (FB + IG combined)
- 4 blog posts
- 1 competitor intelligence briefing (via /competitor-brief)
- 1 brand consistency review (via /brand-review)

## SocialHub Publishing Pipeline

This is the live production pipeline (SocialHub / Buzz product):

```
1. CONTENT CREATION
   Claude AI generates post text
   ↓
2. IMAGE GENERATION
   Kie.ai creates the visual (Recraft for illustrations, Nano Banana Pro for photos)
   ↓
3. WHATSAPP APPROVAL
   Draft sent to owner via WAHA WhatsApp API
   Owner replies APPROVE or sends edits
   ↓
4. FACEBOOK PUBLISH
   Meta Graph API posts to Page 294290977372290
   ↓
5. AITABLE LOG
   Record created in datasheet dstTYYmleksXHj3sCj
   (platform, text, image URL, timestamp, post ID, status)
```

### Pipeline Technical Details
- **Text generation**: Claude (via direct API or cowork session)
- **Image generation**: Kie.ai API -- Recraft model for graphic/illustration style, Nano Banana Pro ($0.09/image) for photorealistic
- **WhatsApp**: WAHA Pro API (session: superseller-whatsapp) on RackNerd 172.245.56.50:3004
- **Facebook**: Graph API v19.0, permanent page access token, POST /{page-id}/photos for image posts
- **Instagram**: Graph API v19.0, POST /{ig-id}/media + POST /{ig-id}/media_publish (requires public image URL)
- **Aitable**: REST API, token auth, Space spc63cnXLdMYc

### What Is NOT Live Yet (Phase 2+)
- Instagram publishing (API connected but not in active pipeline)
- Multi-platform simultaneous publish
- Analytics and engagement tracking
- Competitive intelligence automation
- Social inbox (comment/DM management)
- Smart scheduling (AI-optimized post times)
- Content calendar with drag-and-drop UI

## Blog Strategy

### Current Posts (7 live)
The existing 7 posts were seeded at launch and cover introductory topics. New posts should build depth and target long-tail SEO keywords.

### Blog Post Structure
1. **Hook headline**: Benefit-driven, 8-12 words, includes primary keyword
2. **Opening paragraph**: State the problem the reader has. Be specific. 2-3 sentences.
3. **Body sections**: 3-4 sections with H2 headings. Each section is one key point with examples.
4. **Crew member tie-in**: Naturally reference which AI crew member solves the problem discussed.
5. **CTA**: End with "Become a Super Seller" and link to superseller.agency.
6. **Meta**: 150-char meta description, 5-8 tags, featured image (brand colors, Kie.ai generated).

### SEO Targets
- "AI for small business" (high volume, competitive)
- "AI listing videos" (medium volume, low competition -- TourReel niche)
- "AI social media manager for small business" (medium volume)
- "Facebook marketplace automation" (niche, highly relevant)
- "AI receptionist for contractors" (niche, high intent)
- "WhatsApp business automation" (growing, relevant to ICP)

## Content Rules (Non-Negotiable)

1. **Never fabricate**. No fake testimonials, no invented case studies, no made-up statistics. If we do not have it, we do not publish it.
2. **Always have a takeaway**. Every piece of content must leave the reader with something actionable -- a tip, a link, a tool, a question to ask themselves.
3. **Brand voice always**. See `brand-voice.md` skill for the complete voice guide. Confident, direct, practical, peer-to-peer.
4. **Track everything**. Every published piece gets logged in Aitable with platform, date, content, image URL, and post ID.
5. **Review monthly**. Run /brand-review on the full site once a month. Run /competitor-brief once a month. Adjust strategy based on findings.
