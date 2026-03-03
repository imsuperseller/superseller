# /social-post — Create and Publish Social Media Post

Create a social media post with AI-generated text and image, get approval via WhatsApp, and publish to Facebook and/or Instagram.

## Inputs

- `topic` (required): What the post is about.
- `platform` (required): One or more of `fb`, `ig`, `blog`. Defaults to `fb`.
- `tone` (optional): Override tone. Defaults to brand voice (confident, direct, practical).
- `image_style` (optional): Specific image direction. Defaults to brand palette (orange #f47920, teal #4ecdc4, navy #0d1b2e).
- `crew_member` (optional): Feature a specific crew member (Forge, Spoke, Market, FrontDesk, Scout, Buzz, Cortex).
- `skip_approval` (optional): If `true`, publish immediately without WhatsApp approval. Defaults to `false`.

## Pipeline

### Step 1: Generate Text

Write the post copy using Claude. Follow these rules:

- **Hook first**: The first line must stop the scroll. Lead with a bold statement, question, or surprising fact.
- **Body**: 2-4 short paragraphs. Each paragraph is 1-2 sentences max. Use line breaks for readability.
- **CTA**: End with a clear call to action. "Become a Super Seller" is the primary CTA. Link to https://superseller.agency when appropriate.
- **Hashtags**: 5-8 hashtags at the end. Always include #SuperSellerAI. Mix industry-specific and general.
- **Character limits**: FB has no hard limit but keep under 500 chars for engagement. IG captions up to 2200 chars.
- **Emoji usage**: Sparingly. 1-2 per post max. Never a wall of emojis.

Brand voice:
- Talk like a founder who built the product, not a marketing team.
- "We" = the SuperSeller crew (AI agents). "You" = the small business owner.
- Be direct: "Here's what works." Not: "In our experience, we've found that..."
- Israeli-American energy: urgent, practical, no BS, a bit of chutzpah.

### Step 2: Generate Image

Use Kie.ai to generate the post image:

- **Model**: Use Recraft for illustrations/graphics, Nano Banana Pro for photorealistic.
- **Style**: Clean, modern, brand colors (orange #f47920, teal #4ecdc4, navy #0d1b2e background).
- **Dimensions**: 1080x1080 for FB/IG feed, 1080x1920 for Stories.
- **Include**: Brand elements where natural. Avoid cluttered compositions.
- **Text on image**: Minimal. 5 words max on the image itself -- the caption carries the message.

Compose the Kie.ai prompt with:
```
{subject description}, clean modern design, {brand color palette}, professional SaaS marketing style, minimal text overlay
```

### Step 3: WhatsApp Approval (unless skip_approval=true)

Send the draft to the owner via WAHA WhatsApp API:

1. Send the image to the approval WhatsApp number.
2. Send the caption text as a follow-up message.
3. Send: "Reply APPROVE to publish, or send edits."
4. Wait for response:
   - "APPROVE" or "Yes" or thumbs up -> proceed to publish.
   - Any other text -> treat as edit instructions, revise, and re-send for approval.

### Step 4: Publish

**Facebook** (Page ID: 294290977372290):
- Upload photo via `POST /{page-id}/photos` with `caption` and `source`.
- If text-only: `POST /{page-id}/feed` with `message`.

**Instagram** (Account ID: 17841410951596580):
- Create media container: `POST /{ig-account-id}/media` with `image_url` and `caption`.
- Publish: `POST /{ig-account-id}/media_publish` with the container ID.
- Note: IG requires a publicly accessible image URL. Upload to R2 first if needed.

### Step 5: Log to Aitable

After publishing, create a record in Aitable datasheet `dstTYYmleksXHj3sCj`:
- Platform
- Post text
- Image URL
- Publish timestamp
- Post ID from the platform
- Status: "published"

## Output

Return:
- The published post URL(s)
- Image URL
- Aitable record ID
- Engagement baseline (to check back in 24h)
