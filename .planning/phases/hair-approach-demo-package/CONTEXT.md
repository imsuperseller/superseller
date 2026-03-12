# Hair Approach Demo Package — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning
**Source:** User directive + failure audit from video hero sessions

<domain>
## Phase Boundary

Create a **prospect demo package** for DeAnna Delagarza Rozenblum (Hair Approach, Dallas TX) that demonstrates SuperSeller AI's production capabilities and makes her want to become a $500-750/month paying customer.

**Target reaction:** "I NEED this" — not "nice landing page."

**What this phase delivers:**
1. Branded Remotion showreel video (her actual portfolio photos, not IG reel scrapes)
2. AI-upscaled portfolio images (720px source → 2K+ via Kie.ai/Recraft)
3. Kling 3.0 subtle motion clips from her best static photos
4. Video hero integration into /lp/hair-approach (replacing dark gradient)
5. Sample social content mockups showing what her IG could look like

**What this phase does NOT deliver:**
- Full SocialHub integration
- Ongoing content creation pipeline
- Payment/billing setup
- Review generation activation
</domain>

<decisions>
## Implementation Decisions

### Source Material (LOCKED)
- Use the 6 gallery photos already on R2 (pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/hair-approach/portfolio/*)
- Do NOT re-download IG reels — 720px portrait source was the root cause of all failures
- Upscale photos FIRST via Recraft Crisp ($0.0025/img) before any video work

### Video Production (LOCKED)
- Use Remotion PropertyTour composition path (NOT manual FFmpeg)
- Ken Burns effect with her brand patterns (slow, elegant — not real estate fast-pan)
- Brand overlay: Playfair Display font, honey gold (#C9A96E) accents, dark charcoal (#1a1a1a) backgrounds
- Output: 1920x1080 (16:9 master) + 1080x1920 (9:16 for social demo)
- Duration: 15-20 seconds
- Music: Suno V5 — elegant/luxury salon style, NOT upbeat real estate

### AI Enhancement (LOCKED)
- Kling 3.0 Std mode for 2-3 photos → subtle motion (hair movement, light shift)
- Cost cap: Max $0.30 total on Kling clips (3 clips × $0.03 each + margin)
- Recraft Crisp upscale for all 6 photos ($0.015 total)
- Total budget: Under $0.50 for all AI generation

### Landing Page Integration (LOCKED)
- Video plays as hero background with object-cover
- Fallback: First upscaled photo as poster frame
- Must render at 1440px without blur (1920px source → no upscaling needed)
- Keep HeroSlideshow component as secondary fallback (already in code)

### Social Content Mockups (LOCKED)
- Create 3 static mockup images showing sample IG posts
- Use Remotion to render (deterministic, branded)
- Phone mockup frame (PhoneMockup component exists in Remotion)
- Content: Before/after, styling tip, client result — all using HER photos

### Quality Gates (MANDATORY — from feedback_verify_before_done.md)
- Browser verification at 1440px before ANY "done" declaration
- Check video dimensions match container BEFORE deploying
- Cache-busted URL verification after deploy
- Screenshot evidence required

### Claude's Discretion
- Exact Ken Burns patterns per photo (slow zoom, gentle pan)
- Suno music prompt wording
- Exact text overlay copy for showreel
- Social mockup layout details
- Transition timing between slides
</decisions>

<specifics>
## Specific Details

### Deanna's Brand (from update-hair-approach-brand.ts)
- Primary: #1a1a1a (dark charcoal)
- Accent: #C9A96E (honey gold)
- CTA: #C9A96E (warm gold)
- Font: Playfair Display
- Tone: "Elegant, warm, A-list professional. Confident but approachable. Editorial luxury feel."
- Tagline: "Master Hair Stylist & Hair Colorist | Blonde Specialist | Balayage"

### R2 Gallery Photos (existing)
1. gallery_blonde-highlights.jpg
2. gallery_client-waves.jpg
3. gallery_brunette-result.jpg
4. gallery_blonde-transformation.jpg
5. gallery_color-change.jpg
6. gallery_platinum-result.jpg

### Available Remotion Components
- KenBurnsSlide.tsx (6 patterns + 5 alternates)
- IntroCard.tsx (can be adapted for salon branding)
- OutroCard.tsx (CTA card)
- PhoneMockup.tsx (iPhone frame for social demos)
- FilmGrain.tsx, Vignette.tsx, GlassPanel.tsx (premium overlays)
- TransitionSeries (fade, slide, wipe, flip)

### Worker Pipeline
- RackNerd: 172.245.56.50, port 3002
- Remotion renderMedia() for photo composition
- R2 upload for final assets
- BullMQ for job queuing

### Cost Tracking (MANDATORY)
- Every Kling/Suno/Recraft call → trackExpense()
- Session cost table in progress.md
</specifics>

<deferred>
## Deferred Ideas

- Full SocialHub pipeline (Phase 2 product, code not started)
- Avatar video with Deanna's likeness (would need her consent + photo)
- Review generation activation (built but needs real customer)
- Analytics dashboard population (needs traffic first)
- Before/after comparison video (needs Deanna to provide before photos)
</deferred>

---

*Phase: hair-approach-demo-package*
*Context gathered: 2026-03-12 via failure audit + user directive*
