---
name: Draft Outreach
description: Draft personalized outreach messages for SuperSeller AI prospects, optimized for the Israeli/Jewish small business community and WhatsApp-first culture.
---

# /draft-outreach

Draft a personalized outreach message for a prospect or lead. Messages are tailored to SuperSeller AI's primary customer avatar: Israeli/Jewish small business owners (30-55), WhatsApp-first, service businesses, $100K-$1M revenue.

## Parameters

- **lead_name**: Name of the prospect (required)
- **business_type**: Their industry -- restaurant, contractor, locksmith, auto, insurance, HVAC, cleaning, etc.
- **context**: How we know them or what triggered the outreach (WhatsApp group post, referral, website visit, etc.)
- **channel**: Where the message will be sent -- `whatsapp` (default), `facebook`, `email`, `sms`
- **language**: `hebrew` (default for WhatsApp), `english`, or `mixed` (Hebrew with English tech terms)
- **tone**: `warm_intro` (first contact), `follow_up` (second+ touch), `re_engage` (gone cold), `referral` (mutual connection)

## What to do

1. **Look up the lead** in PostgreSQL to get any existing data:

```sql
SELECT name, company, phone, email, source, status, notes, tags, metadata
FROM "Lead"
WHERE name ILIKE '%{lead_name}%' OR company ILIKE '%{lead_name}%'
LIMIT 5;
```

2. **Draft the message** following these rules:

### Message Framework

**For WhatsApp (Hebrew-first):**
- Open with a personal connection (mutual group, referral name, shared community)
- One sentence about what you noticed about their business (genuine, specific)
- One sentence about what SuperSeller AI does (benefit-focused, not feature-focused)
- Offer something free and concrete: "I can create a [landing page / demo video / social post] for your business in 5 minutes -- want to see?"
- Close with a low-pressure question, not a pitch

**For Facebook:**
- Comment on something they posted or shared
- Brief mention of how AI could help with that specific thing
- Link to superseller.agency with a relevant page

**For Email (last resort):**
- Subject: Under 50 characters, benefit-focused
- Body: 3 short paragraphs max
- CTA: Single, clear action

### Industry-Specific Hooks

| Industry | Hook | Product to Lead With |
|----------|------|---------------------|
| Restaurant | "I saw your restaurant -- your food photos could be getting you 10x more customers" | SocialHub (Buzz), TourReel |
| Contractor | "Contractors who have a landing page get 3x more calls from Google" | Lead Pages, FB Bot |
| Locksmith | "You're missing calls while you're on a job -- what if AI answered for you?" | FrontDesk |
| Auto | "I can list your inventory on Facebook Marketplace automatically" | FB Marketplace Bot |
| Insurance | "Your leads need follow-up within 5 minutes or they go cold" | FrontDesk, Lead Pages |
| HVAC | "Spring is coming -- are you ready for the rush of AC calls?" | FrontDesk, Lead Pages |
| Cleaning | "I can post your services on Marketplace in 15 cities, automatically" | FB Marketplace Bot |

### Tone Guidelines

- **Never pitch features** -- always lead with their specific pain
- **Never bulk-blast** -- every message must reference something specific about them
- **Hebrew code-switching is natural** -- terms like "AI", "landing page", "bot" stay in English
- **Social proof format**: "I helped [name] from [city] with his [business] -- he got [result]" (only use real examples)
- **Price anchoring**: Only mention $79/mo if they ask about cost -- never lead with price
- **Community respect**: Never spam groups. Only direct messages after observing their need.

### Anti-Patterns (NEVER do these)

- Generic "Hi, I have an AI tool you might like" messages
- Feature lists ("We have RAG, NLP, vector search...")
- Pressure tactics ("Limited time offer", "Act now")
- Comparing to tools they have never heard of ("Better than HubSpot")
- English-only messages to Hebrew-speaking leads
- Sending without researching the lead first
- Fabricated results or testimonials

3. **Output** the draft with:
   - The message text (ready to copy-paste)
   - Channel and language used
   - Suggested send time (consider timezone and business hours)
   - Follow-up plan (when to send the next message if no response)

4. **Log the outreach** -- after the message is approved and sent, update the lead status:

```sql
UPDATE "Lead"
SET status = 'contacted',
    first_contact_at = NOW(),
    notes = CONCAT(COALESCE(notes, ''), E'\n[{date}] Outreach via {channel}: {summary}')
WHERE id = '{lead_id}';
```

## Example Output

**WhatsApp message for Yehuda Alali (restaurant owner, Hebrew):**

> Yehuda, hey! I saw your post in the Parliament group looking for marketing help for the restaurants. I built an AI system that creates social media posts and short videos for restaurants automatically -- you just approve on WhatsApp and it publishes. Want me to create a sample post for one of your restaurants? Takes 2 minutes, completely free, no strings attached.

**Follow-up plan**: If no response in 48 hours, send one more message with a sample image/video created for his business. If still no response after 5 days, mark as cold and revisit in 2 weeks.
