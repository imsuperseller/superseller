# Rensto Project Context

## Business Overview

**Company**: Rensto LLC  
**Location**: Plano, TX  
**Owner**: Shai Friedman  
**Email**: service@rensto.com  
**Positioning**: "Strategic automation partner that delivers measurable business outcomes"

## Target Market (ICP)

1. **Amazon Sellers/Brands**

   - Need: Inventory automation, review monitoring, competitor tracking
   - Pain: Manual spreadsheet updates, missed restock opportunities
   - Value: Save 10+ hours/week, prevent stockouts

2. **SMBs with Manual Operations**

   - Need: Form processing, email automation, data sync
   - Pain: Copy-paste between systems, human errors
   - Value: 80% reduction in manual tasks

3. **Content-Heavy Sites**
   - Pain: Slow sites, expensive developers, version chaos
   - Value: 3x faster loads, easy updates

## Service Offerings

### Discovery & Planning

- **Automation Audit** ($499): I guarantee you'll identify $25,000+ in annual savings within 2 hours, or I'll refund 100%
- **Sprint Planning** ($1,500): I guarantee you'll see ROI within 60 days, or I'll continue working for free until you do

### Implementation

- **AI Content Engine** ($1,200): I guarantee 20% increase in organic traffic within 90 days, or I'll continue optimizing for free
- **Lead Intake Agent** ($900): I guarantee 50% reduction in manual lead processing time within 30 days, or full refund plus $500 bonus
- **Voice Agent System** ($2,500): I guarantee 100% call coverage with zero missed calls, or I'll refund 100% and pay you $1,000 for the inconvenience
- **Advanced Offer Crafting** ($1,800): I guarantee 40% increase in proposal acceptance rates within 60 days, or I'll continue optimizing for free
- **System Monitoring** ($1,200): I guarantee 99.9% system uptime or I'll refund 100% of your investment

### Ongoing Support

- **Starter Care** ($750/mo): 5 hours support + monitoring
- **Growth Care** ($1,500/mo): 10 hours + quarterly optimization
- **Scale Care** ($3,000/mo): 20 hours + dedicated automation engineer
- **Enterprise Care** ($5,000/mo): 40 hours + dedicated team + 24/7 monitoring

## Key Differentiators

1. **Speed with Safety**

   - Production-ready in days
   - Security-first approach
   - Automated testing & validation

2. **Client Ownership**

   - You own the infrastructure
   - No vendor lock-in
   - Complete documentation

3. **Fixed, Transparent Pricing**

   - No hourly billing surprises
   - Clear scope & deliverables
   - Money-back guarantee

4. **n8n-First Approach**

   - Visual workflow builder
   - 400+ integrations
   - Self-hosted option

5. **WIP Limits**
   - Max 2 concurrent builds
   - 100% focus on your project
   - Faster delivery

## Technical Architecture

### Core Stack

- **Frontend**: Next.js 15.4.6, TypeScript, Tailwind CSS, shadcn/ui
- **Animations**: GSAP with scroll-triggered effects
- **Automation**: n8n (self-hosted or managed)
- **AI Integration**: OpenAI GPT-4, Twilio Voice API
- **Databases**: PostgreSQL (n8n), MongoDB (app data)
- **CRM**: MongoDB (primary database)
- **Infrastructure**: Docker, Cloudflare Tunnel, Racknerd VPS
- **Backups**: Automated to Icedrive
- **Monitoring**: Comprehensive system monitoring, Bug detection, Security scanning
- **Alerts**: Slack integration, Real-time notifications

### Design System

> **🎨 NEW**: Perfect Design System implemented with iterative design method
> - **Location**: `docs/PERFECT_DESIGN_SYSTEM.md`
> - **Features**: Design extraction, multiple variations, infinite iteration
> - **Usage**: Cursor rules for automated design generation

#### Legacy Design Tokens (Preserved in Perfect Design System)
- **Colors**:
  - Background: `#0B1318`
  - Card: `#111827`
  - Text: `#E5E7EB`
  - Muted: `#94A3B8`
  - Accent 1: `#2F6A92`
  - Accent 2: `#FF6536`
  - Border: `rgba(255,255,255,0.08)`
- **Effects**: Glass morphism, gradient CTAs, logo glow
- **Typography**: System font stack, responsive sizing
- **Spacing**: 8px grid system
- **Radius**: 1rem for cards
- **Shadows**: Subtle depth with `0 10px 30px rgba(0,0,0,0.25)`

#### Perfect Design System Features
- **Design Extraction**: Extract design tokens from any UI image
- **Multiple Variations**: Generate 3+ design approaches automatically
- **Infinite Iteration**: Rapid iteration on chosen designs
- **Cultural Adaptation**: Geographical and persona-based variations
- **Device Optimization**: Device-specific design adaptations
- **Cursor Rules**: Automated design generation via cursor rules

## Development Methodology

### BMAD (Build, Measure, Adjust, Document)

1. **Build**: Sprint-based development with clear deliverables
2. **Measure**: Automated testing, performance metrics
3. **Adjust**: Quick iterations based on feedback
4. **Document**: Comprehensive docs for handover

### Quality Gates

- Format & lint checks
- Type safety validation
- 85% test coverage minimum
- E2E test scenarios
- Security scanning
- Performance benchmarks (Lighthouse ≥95)

## Project Workflows

### MongoDB Integration

Primary database for all customer data and business operations.

**Collections**:

1. **Organizations** → Multi-tenant customer organizations
2. **Projects** → `🔨 In Progress` (status: Building/Review)
3. **Finance** → `📄 Unpaid` (status: Sent/Partial)
4. **Assets** → `Renewals < 30d` (days_to_renew ≤ 30)

### n8n Automations

1. **Daily Follow-ups** (08:00 CT): Check leads needing action
2. **Project Digest** (09:00 CT): Active projects summary
3. **Invoice Reminder** (09:15 CT): Unpaid invoices alert
4. **Renewal Alert** (07:45 CT): Assets expiring soon
5. **Contact Intake**: New lead processing

## Communication Tone

- **Direct**: No fluff, get to the point
- **Technical**: Assume some technical literacy
- **Honest**: Realistic timelines and limitations
- **Helpful**: Provide context and alternatives
- **Professional**: Business-appropriate but not stuffy

## Success Metrics

### Project Level

- Delivery within timeline
- Zero security incidents
- Client can self-manage after handover
- 85%+ test coverage
- Lighthouse scores ≥95

### Business Level

- Client time saved: 10+ hours/week
- Manual task reduction: 80%+
- ROI within 3 months
- Client satisfaction: NPS >8

## Future Roadmap

### Phase 1 (Current)

- Marketing site launch
- Core automation templates
- Basic monitoring

### Phase 2 (Q2 2024)

- Client portal
- Advanced analytics
- AI-powered optimizations

### Phase 3 (Q3 2024)

- Marketplace for templates
- Partner program
- Enterprise features

## Important Notes

### Security Requirements

- No exposed ports in production
- All secrets in environment variables
- Encrypted credential storage
- Regular security audits
- Automated backups

### Operational Constraints

- Max 2 concurrent client builds
- Timezone: America/Chicago
- Support hours: Business days
- Emergency response: Within 4 hours

### Legal & Compliance

- Terms of Service required
- Privacy Policy required
- GDPR considerations for EU clients
- SOC2 roadmap for enterprise

---

_This context document should be updated with each major project change._
