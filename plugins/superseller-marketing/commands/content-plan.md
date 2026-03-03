# /content-plan — Generate Weekly Content Plan

Generate a weekly content plan for SuperSeller AI across Facebook, Instagram, and the blog.

## Inputs

- `week_start` (optional): Start date for the plan. Defaults to next Monday.
- `focus_theme` (optional): Override theme for the week (e.g., "AI automation for contractors", "real estate tech").
- `promotions` (optional): Any active promotions or launches to weave in.

## Process

1. **Check existing content**: Query Aitable datasheet `dstTYYmleksXHj3sCj` to see what has been published recently. Avoid repeating topics within 2 weeks.

2. **Select from content pillars** (rotate weekly):
   - AI Automation for Small Business — How the crew replaces manual work
   - Small Business Growth — Revenue, leads, efficiency for $100K-$1M businesses
   - Real Estate Tech — TourReel, virtual tours, listing marketing
   - Customer Success Stories — Results, before/after, testimonials (ONLY if real, documented stories exist -- never fabricate)

3. **Generate the plan** using this cadence:
   - **Monday**: Educational post (FB + IG) — "Did you know..." or quick tip
   - **Tuesday**: Blog post — Deep-dive on one pillar topic (800-1200 words)
   - **Wednesday**: Crew spotlight (FB + IG) — Feature one AI crew member (Forge, Spoke, Market, FrontDesk, Scout, Buzz, or Cortex) with what they do and a real use case
   - **Thursday**: Engagement post (FB + IG) — Poll, question, or "this or that" to drive comments
   - **Friday**: Behind-the-scenes or product demo (FB + IG) — Show the product working, a dashboard screenshot, or a short video clip
   - **Weekend**: Repost best performer from the week or schedule an inspirational quote with brand colors

4. **For each post, provide**:
   - Platform(s): FB, IG, Blog
   - Post type: Text, Image, Video, Carousel
   - Headline / Hook (first line)
   - Full copy (brand voice: confident, direct, no fluff, Israeli-American entrepreneurial energy)
   - Image direction: Description for Kie.ai generation (style, colors, subject)
   - Hashtags: 5-8 relevant hashtags
   - Suggested publish time: Based on audience (small biz owners, 30-55, US-based, WhatsApp-first)
   - CTA: What action the reader should take

5. **Brand voice rules** (mandatory):
   - Speak as a peer, not a vendor. "We built this because we needed it too."
   - Use "you" and "your business" -- never "users" or "clients"
   - Keep it practical. Every post should have a takeaway or action.
   - No corporate jargon. No "leverage", "synergy", "ecosystem" unless mocking them.
   - OK to be bold: "Your competitors are already using AI. Why aren't you?"
   - Hebrew/Yiddish sprinkle is fine for personality (chutzpah, balagan, yalla).

6. **Output format**: Markdown table with one row per day, plus detailed copy blocks below the table.

## Example Output

| Day | Platform | Type | Topic | Crew Member |
|-----|----------|------|-------|-------------|
| Mon | FB + IG | Image + Text | 3 tasks AI handles while you sleep | Buzz |
| Tue | Blog | Article | Why Small Contractors Lose Leads (And How AI Fixes It) | Scout |
| Wed | FB + IG | Image + Text | Meet Forge: Your AI Video Producer | Forge |
| Thu | FB + IG | Poll | "What takes you the longest: posting listings, following up leads, or creating content?" | -- |
| Fri | FB + IG | Video/GIF | 30-sec demo: TourReel turning photos into a listing video | Forge |
| Sat | FB + IG | Repost | Best performer from the week | -- |

---

*After approval, use `/social-post` to create and publish each individual post.*
