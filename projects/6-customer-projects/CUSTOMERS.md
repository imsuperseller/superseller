# SuperSeller AI — Customer Profiles

> **Last updated**: March 4, 2026
> **Source**: Web research + codebase analysis + WhatsApp Parliament group intel
> **Rule**: NEVER fabricate content. All facts below are verified from public sources + project files.

---

## 1. Elite Pro Remodeling

| Field | Details |
|-------|---------|
| **Full Name** | Elite Pro Remodeling and Construction LLC |
| **Location** | 17744 Preston Rd STE 200, Dallas, TX 75252 |
| **Phone** | (800) 476-7608 |
| **Email** | info@eliteproremodeling.com |
| **Website** | [eliteproremodeling.com](https://eliteproremodeling.com/) |
| **Instagram** | [@eliteproremodeling](https://www.instagram.com/eliteproremodeling/) — 22 followers, 9 posts |
| **BBB** | [BBB Profile](https://www.bbb.org/us/tx/dallas/profile/remodel-contractors/elite-pro-remodeling-and-construction-llc-0875-91350254) |
| **Rating** | 4.9/5 across review platforms |
| **Owners** | Saar + Mor (co-founders) |
| **Key Staff** | Mike (PM), Nir (field crew lead) |

### Services
Kitchen/bathroom/bedroom remodeling, full home remodeling, new construction, garage construction, flooring, landscaping, foundation repair, siding/decking, roofing, fencing, concrete, pools, electrical gates, security systems, windows/doors, driveways.

### SuperSeller Relationship
**Status**: ~90% built, blocked on expired Instagram token.

**What we're building**: Fully autonomous Instagram content pipeline — first customer for multi-client SaaS.

**Three AI Agents** (Python on RackNerd):
1. **Scout Agent** — Weekly competitive intelligence scraping of successful remodeling IG ads
2. **Creator Agent** — Daily: Claude AI → Kie.ai Kling 2.6 video (5s, 9:16 Reels) → R2 → AITable
3. **Publisher Agent** — WhatsApp dual-approval (Saar + Mor) → Instagram Graph API publish

**Deliverables**: 16-20 Reels/month, competitive monitoring, WhatsApp approval flow, weekly insights.

**Brand rules**: No music (natural audio only), zero text overlays, Mor/Saar in black company shirts, crew in yellow vests, dual WhatsApp approval required.

**Blocker**: Instagram access token expired March 4, 2026. Needs Facebook App ID/Secret to refresh.

**Codebase**: `elite pro remodeling/superseller-agents/` (local) and `/opt/superseller-agents/` (RackNerd)

**Key insight**: Premium craftsmanship (4.9 stars, BBB listed) but microscopic social presence (22 IG followers). The gap between quality of work and online visibility is massive.

---

## 2. Kedem Developments

| Field | Details |
|-------|---------|
| **Full Name** | Kedem Real Estate Development |
| **Location** | 16801 Addison Rd, Addison, TX 75001 |
| **Phone** | (469) 490-3777 |
| **Email** | info@kedemdvlp.com |
| **Website** | [kedemdvlp.com](https://kedemdvlp.com/) |
| **Instagram** | [@kedemdevelopments](https://www.instagram.com/kedemdevelopments/) — ~110 followers |
| **Principal** | Daniel Arbel (also Douglas Elliman listing agent) |
| **LinkedIn** | [Daniel Arbel](https://www.linkedin.com/in/daniel-arbel-5342a5b9) |

### Business
Luxury custom new construction + complete renovations in Dallas TX. 13 properties (8 available + 5 coming soon). Clusters in Dalhart, San Leandro, Cullen neighborhoods. Price range $800K-$1.5M+. Smart home tech integration.

### SuperSeller Relationship
**Status**: Active TourReel pilot — first external customer.

**Delivered**:
- 6847 Lakeshore Drive V8 video tour (2:22, 1080p, 16 cinematic scenes, 6 Kling AI clips)
- Full PRD for TourReel product
- Strategic plan with competitive analysis (vs. VideoTour.ai)
- Pricing brief (market research on competitors)
- Infrastructure audit

**TourReel web app**: Built at `kedem developments/tourreel-app/` (Next.js 16) but audited as "broken shell" — pipeline calls use wrong endpoints, no actual FFmpeg integration.

**Property focus**: 6847 Lakeshore Drive, Dallas TX 75214 (Lakewood near White Rock Lake). Acquired for $1.2M. "Old South Brick" style. Target completion: October 2026.

**NotebookLM**: Dedicated notebook `720eb7e6` — 41 sources (most of any customer).

**Upsell opportunity**: Only ~110 IG followers. Strong fit for SocialHub, Lead Landing Pages, FB Marketplace, FrontDesk Voice.

---

## 3. AC&C LLC HVAC

| Field | Details |
|-------|---------|
| **Full Name** | AC & C LLC (AC&C Heating & Air) |
| **Location** | 6327 McCallum Boulevard, Dallas, TX 75252 |
| **Phone** | (469) 998-9198 |
| **Email** | info@acandchvac.com |
| **Website** | [acandchvac.com](https://acandchvac.com/) (SuperSeller-built) |
| **Facebook** | [facebook.com/acandcllc](https://www.facebook.com/acandcllc) |
| **Instagram** | [instagram.com/acandcllc](https://www.instagram.com/acandcllc) |
| **Yelp** | [AC and C LLC Dallas](https://www.yelp.com/biz/ac-and-c-llc-dallas) — 14 photos |
| **Operator** | Neitha Parkey |
| **Founded** | ~2018, family-owned |

### Services
Chimney sweeping, fireplace repair, AC installation/repair, heating/furnace services, chimney caps/covers, safety inspections (Level 1-3). 24/7 emergency service.

### Certifications
NATE Certified, EPA 608, CSIA Certified, Texas State License (placeholder #TACLA123456 — needs verification).

### SuperSeller Relationship
**Status**: Active customer — website + lead gen dashboard delivered.

**Delivered**:
- Full website (Vite+React+TypeScript+Tailwind) at `acandchvac.com` → Vercel `dist-chi-three-91.vercel.app`
- Lead generation dashboard at `dist-dashboard-eight.vercel.app`
- 7 Apify-powered lead gen strategies (competitor review mining, new homeowner targeting, building permit intel, Nextdoor, weather emergency, realtor partnerships, social monitoring)
- Real Google/Yelp review sync via Apify
- Workiz CRM integration for lead routing

**Dashboard login**: admin / `AcC-Lead$2026`
**Website password gate**: `AcC-Site$2026`

**Codebase**: `ac-&-c-llc-hvac/`

**Next steps**: Remove password gate to go live, verify TACLA license number, activate real review sync.

---

## 4. Ortal Pilates

| Field | Details |
|-------|---------|
| **Business** | Ortal Pilates — boutique classical Pilates studio |
| **Instructor** | Ortal (first name) |
| **Website** | [imsuperseller.github.io/ortal-pilates](https://imsuperseller.github.io/ortal-pilates/) (GitHub Pages) |
| **Location** | Likely Dallas-Fort Worth TX (469 area code in config, placeholder address on site) |
| **Pricing** | Private $125/55min, Semi-Private $85/person/55min |
| **Equipment** | Gratz classical apparatus (Reformer, Cadillac, Chairs, Barrel, Ped-a-Pul) |

### Online Presence
**Zero** outside the GitHub Pages site we built. No Instagram, no Facebook, no Google Business, no Yelp, no ClassPass, no MindBody. Completely greenfield digital opportunity.

### Testimonials (real clients with FB profiles)
- Shiran (@shiran.stern) — chronic back pain recovery
- Avishag (@avishag.eckhous) — strength and control
- Coral (@coral.ohayon) — holistic approach

### SuperSeller Relationship
**Status**: Website delivered, not fully operational.

**Delivered**:
- 4-page static HTML site (index, booking, schedule, admin) on GitHub Pages
- Brand assets: AI-generated hero image, logo, studio images
- Design: Gold (#D4A574), Cream (#F8F6F0), Dark Brown (#3E2723), Playfair Display + Inter fonts
- n8n workflow "ORTAL-PILATES" running on RackNerd

**Issues**:
- Contact info is all placeholder (address, phone, WhatsApp)
- No custom domain (still on imsuperseller.github.io)
- Booking/payment is frontend-only (Stripe loaded but no backend)
- Schedule is hardcoded
- Was originally built as "Vered Pilates" and rebranded

---

## 5. Wonder.care

| Field | Details |
|-------|---------|
| **Full Name** | Wonder Care (וונדר) |
| **Type** | Israeli healthtech — "Uber for home nursing" |
| **Website** | [wonder.care](https://wonder.care) |
| **Phone** | *2585 (Israel, 24/7) |
| **WhatsApp** | +972-52-394-6885 |
| **Address** | BSR City Towers 3, Totzeret HaAretz 3, Petach Tikva, Israel |
| **App** | iOS + Android |
| **LinkedIn** | [Wonder - וונדר](https://linkedin.com/company/wonder) |
| **Rating** | 9/10 avg customer satisfaction |
| **Contact** | Ortal Flanary (ortal.f@wonder.care) |

### Leadership
- **Shlomi Lipshitz** — CEO & Co-Founder (emergency medical background)
- **Sharon Weiss** — CTO
- **Asherit Guzlan** — Professional Director (former IDF Chief Nurse)

### Services
12 categories of home healthcare: pregnancy/postpartum care, post-hospitalization, wound care, home medical procedures, elderly supervision, home medical tests, post-surgery nursing, physical therapy, newborn nursing, palliative care, pediatric nursing, online consultation. Nationwide Israel.

### SuperSeller Relationship
**Status**: Project-based automation client (NOT a SaaS subscriber).

**Delivered** (Project 1 — Completed Dec 2025):
- Google Sheets → Monday.com data sync pipeline (migrated from Make.com which was timing out on 100K+ rows)
- Self-hosted n8n on dedicated VPS (192.227.249.73, separate from main SuperSeller VPS)
- Batch processing 50 items/time, daily at 8 AM Israel time
- Google Apps Script backup (2,324 lines)

**Built but inactive** (Project 2):
- WhatsApp AI support agent (n8n + WAHA + GPT-4o + vector store with Wonder.care knowledge base)

**Outstanding proposal** (Dec 18, 2025):
- 4 tasks across pricing tiers ($900-$6,450):
  - Task 1: Connect all lead sources to Monday.com ($2,000)
  - Task 1 addon: WhatsApp bot for auto-detecting leads ($800)
  - Task 2a: Clone pipeline for 2026 orders ($250)
  - Task 2b: Full Excel automation ($1,000)
  - Task 3: Customer & nurse summary boards ($2,000)
  - Task 4: Historical data migration ($650)
- Retainer options: $150/mo (2hrs), $350/mo (5hrs), $650/mo (10hrs)

**Infrastructure**: Own VPS at 192.227.249.73, n8n v2.0.2, basic auth admin/Wonder2025!

---

## 6. Yoram Friedman Insurance

| Field | Details |
|-------|---------|
| **Full Name** | יורם פרידמן סוכנות לביטוח (Yoram Friedman Insurance Agency) |
| **License** | #604725 (Israeli Insurance Commissioner) |
| **Company** | Company #513352120, registered Dec 30, 2002 |
| **Location** | YL"G Street 15-19, Haifa, Israel (nationwide service) |
| **Phone** | 04-866-9460 |
| **WhatsApp** | +972-52-242-2274 |
| **Email** | yoram@friedmanbit.co.il |
| **Facebook** | [facebook.com/friedmanbit](https://facebook.com/friedmanbit) |
| **Experience** | 40+ years, 10x "Agent Excellence" award winner |

### Insurance Types
Life, health, mortgage (primary), critical illness, pension, personal accidents, business, car. Works with ALL insurance companies (independent). 100% remote process.

### Target Audience
Age 40-55, married with active mortgage, NIS 10K-15K/month income, Hebrew-speaking only.

### SuperSeller Relationship
**Status**: Customer — strategy delivered, website built, landing page retired.

**Delivered**:
- Marketing strategy documents (market analysis, content blueprint, social media plan)
- 10 scripted Facebook posts ready
- "Avi" AI avatar character (HeyGen, Hebrew-speaking) — 10 video scripts written, not produced
- Full multi-page Next.js 15 website in `yoram-friedman-insurance/web/`
- Lead form connected to n8n webhook

**Retired**: Old landing page (51 views, 0 submissions — retired Feb 24, 2026). Previously incorrectly hosted under a domain that has NO relation to Yoram or SuperSeller — purged completely.

**Vercel**: Project `yoram-leads` (prj_9buQsVSywfFvIBfUjEOn3D4D6str)

**Payment model**: Pay per lead.

**Biggest gap**: Zero online reviews, no live website confirmed, FB page unclear if maintained.

---

## 7. Rensto Online Directory

> **NOTE**: This is NOT an external customer — it's an internal SuperSeller product/asset. Rensto LLC = SuperSeller Agency (same legal entity). Included here for completeness since the codebase lives at repo root.

| Field | Details |
|-------|---------|
| **Type** | Premium contractor directory with pricing transparency scoring |
| **Domain** | [rensto.com](https://rensto.com) (repurposed to show automation platform messaging) |
| **Stack** | Next.js 14 + TypeScript + Tailwind + PostgreSQL |
| **Data** | 500 contractors scraped across 5 metros (Dallas, Austin, Phoenix, Charlotte, Nashville/Denver) |

### Status
**Dormant**. Codebase exists, domain repurposed. No active customers, no active data pipeline, admin dashboard is mock data.

**Revenue model** (planned, never launched): Lead gen $100-200/lead, premium listings $149/mo, verification badges $49-79/mo.

**Decision needed**: Kill the directory product or relaunch. Current state is dead weight in the repo.

---

## Customer Summary Table

| Customer | Location | Industry | SuperSeller Service | Status | Revenue Model |
|----------|----------|----------|-------------------|--------|---------------|
| Elite Pro Remodeling | Dallas TX | Remodeling | IG content pipeline | 90% built, blocked | SaaS subscription |
| Kedem Developments | Dallas TX | Luxury real estate | TourReel video | Pilot delivered | Per-video / SaaS |
| AC&C HVAC | Dallas TX | HVAC + chimney | Website + lead gen | Delivered, behind password | Lead gen |
| Ortal Pilates | Dallas TX (likely) | Fitness / Pilates | Website | Delivered, not operational | TBD |
| Wonder.care | Petach Tikva, Israel | Healthtech | n8n automation | Delivered + proposal pending | Project-based ($900-$6,450) |
| Yoram Friedman | Haifa, Israel | Insurance | Strategy + website | Delivered, LP retired | Pay per lead |
| Rensto Directory | Internal | Contractor directory | Internal product | Dormant | N/A |
