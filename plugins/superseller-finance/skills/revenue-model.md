---
name: Revenue Model
description: Revenue streams, unit economics, financial targets, and growth model for SuperSeller AI
---

# Revenue Model

SuperSeller AI revenue structure, unit economics, and financial targets.

## Revenue Streams

### 1. TourReel Subscriptions (Primary)
- **Description**: AI-generated property videos for real estate agents and property managers
- **Pricing**: Included in all subscription tiers (Starter $79, Pro $149, Team $299)
- **Unit economics**: Average TourReel video costs $0.30-$1.00 in API calls (3-10 Kling clips). Remotion photo compositions are free.
- **Margin**: 85-95% on Remotion-only videos, 60-80% on Kling-heavy videos
- **Growth lever**: Volume of listings processed per customer

### 2. FB Marketplace Bot Activations
- **Description**: Automated Facebook Marketplace posting for businesses
- **Active customers**: UAD Garage Doors, MissParty Rentals
- **Pricing**: Included in subscription or as standalone $79/month
- **Unit economics**: Primarily compute cost (RackNerd VPS shared), near-zero marginal cost per post
- **Margin**: ~95% (fixed infrastructure cost, scales with customers)
- **Growth lever**: Number of businesses activated

### 3. SocialHub / Buzz (Growing)
- **Description**: AI content creation + WhatsApp approval + multi-platform publishing
- **Status**: Live but early stage
- **Pricing**: Included in subscription, credit-based usage
- **Unit economics**: ~$0.10-$0.20 per post (Claude content + Nano Banana image)
- **Margin**: 80-90%
- **Growth lever**: Posts per customer per month, platform expansion

### 4. Winner Studio Credits (Dormant)
- **Description**: AI product photography and room staging
- **Status**: Built end-to-end, customer (Yossi/Mivnim) not actively using
- **Pricing**: Credit-based (8 credits per render)
- **Unit economics**: $0.10-$0.50 per render depending on complexity
- **Margin**: 75-85%
- **Growth lever**: Requires re-engagement or new customers

### 5. FrontDesk Voice AI (Future)
- **Description**: AI receptionist for small businesses
- **Pricing**: Credit-based (1 credit per minute)
- **Unit economics**: Telnyx voice costs ~$0.02/min, charged at ~$0.26/min (1 credit = $0.26 at Starter tier)
- **Margin**: ~92%
- **Growth lever**: Call volume per customer

### 6. Lead Landing Pages (Future)
- **Description**: AI-generated landing pages for lead capture
- **Status**: Infrastructure ready, no active customers
- **Pricing**: Credit-based (3 credits per page)
- **Margin**: ~95% (compute only)

## Financial Targets

| Metric | Current (Est.) | H1 2026 Target | 2027 Target |
|--------|---------------|----------------|-------------|
| **MRR** | $300-$1,000 | $5,000 | $20,000 |
| **Active Customers** | 3-5 | 30 | 100+ |
| **ARPU** | $79-$149 | $150 | $200 |
| **Gross Margin** | 80%+ | 80%+ | 85%+ |
| **API Cost Ratio** | 5-15% of revenue | < 15% | < 10% |
| **Churn** | N/A (too few) | < 8%/month | < 5%/month |

## Unit Economics per Customer

### Starter ($79/month, 300 credits)

| Item | Monthly |
|------|---------|
| Revenue | $79.00 |
| API costs (est. 200 credits used) | -$5.00 |
| Infrastructure (shared) | -$1.50 |
| Payment processing (PayPal ~3.5%) | -$2.77 |
| **Net margin** | **$69.73 (88%)** |

### Pro ($149/month, 800 credits)

| Item | Monthly |
|------|---------|
| Revenue | $149.00 |
| API costs (est. 600 credits used) | -$15.00 |
| Infrastructure (shared) | -$1.50 |
| Payment processing (PayPal ~3.5%) | -$5.22 |
| **Net margin** | **$127.28 (85%)** |

### Team ($299/month, 2000 credits)

| Item | Monthly |
|------|---------|
| Revenue | $299.00 |
| API costs (est. 1500 credits used) | -$37.50 |
| Infrastructure (shared) | -$1.50 |
| Payment processing (PayPal ~3.5%) | -$10.47 |
| **Net margin** | **$249.53 (83%)** |

## Cost Structure

### Variable Costs (Scale with Usage)
- AI API calls (Kling, Suno, Nano Banana, Gemini, Claude)
- PayPal transaction fees (~3.5%)

### Fixed Costs (Monthly)
- RackNerd VPS: $15/month
- Vercel Pro: $20/month
- Domain: ~$1.25/month
- Total fixed: ~$36/month

### Breakeven
- At $36/month fixed costs and ~85% gross margin, breakeven is approximately 1 Starter customer
- Real breakeven (including owner time value): ~10 customers at Starter tier ($790 MRR)

## Growth Model

### Phase 1: Foundation (Current — Q1 2026)
- 3-5 paying customers
- Focus: Product stability, reduce manual intervention
- Target: $500 MRR

### Phase 2: Traction (Q2-Q3 2026)
- 15-30 paying customers
- Focus: Self-serve onboarding, automated billing, customer portal
- Target: $5,000 MRR
- Key initiatives: Free trial, content marketing, WhatsApp Parliament group outreach

### Phase 3: Scale (Q4 2026 — 2027)
- 50-100+ paying customers
- Focus: Multi-tenant efficiency, partner channel, product expansion
- Target: $20,000 MRR
- Key initiatives: Agency partnerships, white-label, API access tier

## Competitive Pricing Context

- Per-function competitors charge $30-$80/month per tool
- Full stack equivalent from specialists: $243-$475/month
- SuperSeller bundle at $79-$299 represents 50-80% savings
- Key differentiator: 7 AI functions bundled, no competitor does this
- Gap: No free trial currently (recommendation from competitor benchmarking)
