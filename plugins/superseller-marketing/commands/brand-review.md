# /brand-review — Brand Consistency Review

Review content, pages, or marketing materials against SuperSeller AI brand guidelines and flag inconsistencies.

## Inputs

- `target` (required): What to review. Can be:
  - A URL (e.g., `https://superseller.agency/pricing`)
  - A file path (e.g., `apps/web/superseller-site/src/app/[locale]/(main)/page.tsx`)
  - Pasted text/copy to review
  - "full-site" to audit the entire superseller.agency website
- `severity` (optional): "strict" (flag everything) or "major-only" (flag deal-breakers). Defaults to "strict".

## Brand Guidelines Checklist

### Colors
- **Primary Orange**: #f47920 -- CTAs, highlights, energy
- **Accent Teal**: #4ecdc4 -- secondary actions, success states, data
- **Navy Background**: #0d1b2e -- dark sections, hero backgrounds, professionalism
- **Flag**: Any use of off-brand colors (random blues, reds, greens not in the palette)
- **Flag**: Orange used for errors/warnings (it is the brand color, not an alert color)

### Typography
- **Font**: Outfit -- all headings and body text
- **Flag**: Any other font family in use (especially system defaults like Arial, Helvetica)
- **Flag**: Missing Noto Sans fallbacks for RTL locales (Hebrew, Farsi) and non-Latin scripts (Hindi, Korean)

### Voice & Tone
- **Correct**: Confident, direct, practical, founder-to-founder
- **Correct**: "You" and "your business" addressing the reader
- **Correct**: Short sentences. Paragraph breaks. Easy to scan.
- **Flag**: Corporate jargon ("leverage", "synergy", "ecosystem", "holistic", "paradigm")
- **Flag**: Passive voice ("It was designed to..." vs "We built this to...")
- **Flag**: Generic SaaS speak ("solutions", "platform", "suite") without specificity
- **Flag**: Overly formal tone ("We are pleased to inform you...")
- **Flag**: Fabricated testimonials, case studies, or quotes not backed by real documentation

### Messaging
- **Tagline**: "Turning Customers into Super Sellers"
- **Hero**: "Stop Hustling. Start Selling. Your AI Crew Handles the Rest."
- **CTA**: "Become a Super Seller"
- **Flag**: Inconsistent CTAs across pages (e.g., "Get Started" on one page, "Sign Up" on another, when "Become a Super Seller" is the canonical CTA)
- **Flag**: Missing value proposition on any page (every page should answer "why SuperSeller?")

### Crew Members
Every crew member reference must be accurate:
- **Forge** -- AI Video Producer (TourReel)
- **Spoke** -- AI Avatar & Presenter
- **Market** -- AI Marketplace Manager (FB Marketplace Bot)
- **FrontDesk** -- AI Voice Receptionist
- **Scout** -- AI Lead Hunter
- **Buzz** -- AI Social Media Manager (SocialHub)
- **Cortex** -- AI Brain & Strategy
- **Flag**: Wrong crew member name, wrong function, or generic "AI agent" when a specific crew member should be named

### Visual
- **Flag**: Stock photos that feel generic or corporate
- **Flag**: Low-resolution images or broken image links
- **Flag**: Missing alt text on images
- **Flag**: Inconsistent card/component styling across pages

### Technical (if reviewing code/pages)
- **Flag**: Hardcoded English text not wrapped in i18n `t()` calls (site supports 7 locales)
- **Flag**: Missing RTL support for Hebrew (he) and Farsi (fa) locales
- **Flag**: "Rensto" or "rensto" appearing anywhere (old brand name, should be fully migrated)
- **Flag**: Stripe references in user-facing copy (migrated to PayPal Feb 2026)

## Output Format

### Summary
Overall brand health score: X/10 with 1-line summary.

### Issues Found

| # | Severity | Category | Location | Issue | Suggested Fix |
|---|----------|----------|----------|-------|---------------|
| 1 | High | Voice | /pricing hero | Uses "leverage AI" -- corporate jargon | Change to "put AI to work" |
| 2 | Med | Color | Footer CTA | Button is #2563eb (blue) not #f47920 (orange) | Update to brand orange |
| ... | ... | ... | ... | ... | ... |

### Praise
What is working well -- brand-consistent elements to keep and replicate.

### Priority Fixes
Top 3 fixes ranked by customer impact.
