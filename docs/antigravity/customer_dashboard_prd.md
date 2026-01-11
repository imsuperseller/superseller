# Customer Dashboard PRD

## Overview

The Customer Dashboard is the **primary interface** where Rensto clients see value, manage their services, and are presented with upgrade opportunities. It must deliver immediate ROI visibility and seamless upsell paths.

---

## User Personas

| Persona | Description | Primary Goal |
|---------|-------------|--------------|
| **Free Trial User** | Signed up for 10 free leads | See leads quickly, understand value, convert to paid |
| **Single-Service Buyer** | Purchased one service (e.g., Get More Leads) | Track results, consider adding more services |
| **Full Suite Client** | Has all 4 services | Monitor all automations, manage usage |
| **Custom Solution Client** | Engaged for bespoke project | Track deliverables, communicate with team |

---

## User Journeys

### Journey 1: Free Trial → Paid Conversion
```
Free Leads Form → Email with leads → Dashboard link (magic token)
        ↓
Logs into Dashboard → Sees 10 leads → Clicks "Unlock More" CTA
        ↓
Pricing page → Stripe checkout → Entitlements updated
        ↓
Returns to Dashboard → Full Leads tab unlocked
```

### Journey 2: Existing Client → Upsell
```
Client logs in → Using "Get More Leads" service
        ↓
Sees "Add Automated Outreach" locked tab → Clicks to learn more
        ↓
Modal or page explaining benefits → "Add for $297/mo"
        ↓
Stripe checkout → Service added → Outreach tab unlocks
```

### Journey 3: Custom Solution Client
```
Signs contract → Receives dashboard access email
        ↓
Opens Dashboard → Sees Project tab with deliverables
        ↓
Tracks progress → Uploads assets → Views invoices
        ↓
Project completes → Transition to maintenance mode
```

---

## Features by Tab

### Overview (Always Visible)
- **Welcome message** with client name
- **Quick stats**: Active services count, leads generated, outreach sent
- **AI Opportunity Radar**: Personalized upsell suggestions based on data
- **Marketplace Hot Picks**: Relevant add-ons
- **Quick Actions**: Schedule call, contact support

### Leads (Visible if: freeLeadsTrial OR pillars.includes('leads'))
- Lead list with search & filter
- Status tracking: New → Contacted → Responded → Converted
- Export to CSV (locked for free trial)
- **Lead Delivery Options** (see below)
- **Upsell**: "Unlock unlimited leads + outreach"

---

## Lead Delivery Options

Users choose how to receive leads. Tiered model for upselling:

| Option | Price | Source |
|--------|-------|--------|
| **Email Delivery** | Free (included) | Default for all users |
| **CRM Integration (DIY)** | Free | Step-by-step instructions |
| **CRM Integration (Done-for-you)** | $297 one-time | Matches marketplace template pricing |
| **Full Automation Package** | $199-$1999/mo | Based on lead volume tier (existing pricing) |

> **Pricing rationale**: CRM setup at $297 aligns with marketplace templates. Lead volume tiers use existing pricing from [subscriptions page](file:///Users/shaifriedman/New%20Rensto/rensto/apps/web/rensto-site/src/app/subscriptions/ClientPage.tsx#L123-127).

### DIY Escalation Path

**Problem**: Many users will fail at DIY CRM setup.

**Solution**: Easy "Get Help" button throughout the flow:
```
User selects "DIY CRM Instructions"
        ↓
Instructions displayed with video walkthrough
        ↓
30-day timer starts → If no CRM connected, show prompt:
"Need help? We'll set it up for you → $99"
        ↓
Alternatively, instant button: "Skip the hassle → Let us do it"
```

### Implementation Notes

1. **Dashboard UI**: Add "Delivery Settings" section in Leads tab
2. **Firestore**: Track `deliveryMethod` in user entitlements
3. **n8n**: Universal Lead Machine branches based on delivery method
4. **CRM Webhooks**: Build connectors for common CRMs (HubSpot, GHL, Pipedrive)

---

### Outreach (Visible if: pillars.includes('outreach'))
- Email/SMS campaign status
- Delivery metrics: Sent, Opened, Replied
- Template management
- **Connection**: Pulls from n8n email sequence workflows

### Voice AI (Visible if: pillars.includes('voice'))
- Call logs with recordings
- Agent configuration
- Availability schedule
- **Connection**: Data from ElevenLabs + n8n voice workflows

### Content (Visible if: pillars.includes('content'))
- Content calendar
- Published posts
- Draft queue
- **Connection**: Data from WordPress/Buffer/n8n content workflows

### My Products (Visible if: marketplaceProducts.length > 0)
- Purchased templates/blueprints
- Download links
- Agent playground for testing

### Project (Visible if: customSolution !== null)
- Deliverables checklist with status
- File upload/download
- Invoice history
- Agent configuration (once deployed)

### Invoices (Visible if: paying customer)
- Payment history
- Next billing date
- Plan details

### Usage (Visible if: paying customer)
- LLM token consumption
- API call counts
- Reset dates

---

## Data Sources

| Data | Source | Update Frequency |
|------|--------|------------------|
| Leads | Firestore `/leads` + n8n Universal Lead Machine | Real-time on scrape completion |
| Outreach status | n8n execution logs | Hourly |
| Voice logs | ElevenLabs API + call provider | Real-time |
| Content posts | WordPress/Buffer APIs | Daily sync |
| Invoices | Stripe API | On payment events |
| Usage | Firestore `/usage` counters | Per-request increment |

---

## n8n Workflow Connections

| Workflow | Dashboard Feature |
|----------|-------------------|
| Universal Lead Machine v3.0 | Populates Leads tab |
| Email Outreach Sequence | Populates Outreach tab |
| Voice AI Call Handler | Populates Voice AI tab |
| Content Pipeline | Populates Content tab |
| RENSTO-STRIPE-HANDLER | Updates entitlements on purchase |

---

## Security

- **Magic Link Auth**: Short-lived token in URL, verified against Firestore
- **Token Rotation**: New token generated on each login request
- **Data Isolation**: Users can only see their own data (Firestore rules)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Free Trial → Paid Conversion | 15%+ |
| Dashboard Weekly Active Users | 60%+ of customers |
| Upsell Click-Through Rate | 5%+ |
| Support Ticket Reduction | 30% (via self-service) |

---

## Open Questions

~~1. Should we add a chat widget for support?~~
**Resolved**: No. Support uses **WAHA Pro (WhatsApp)** + **Telnyx (voice/SMS)**. Customers contact via WhatsApp or phone, handled by RAG-powered agents.

~~2. Do we want email notifications when new leads arrive?~~
**Yes** – Trigger from n8n when Universal Lead Machine completes.

~~3. Should we show competitor comparisons in upsell CTAs?~~
**Decision needed**: Low priority for now.

---

## Confirmed Requirements

| Requirement | Status |
|-------------|--------|
| **Slack Integration** | ✅ Yes – Instant alerts for admin |
| **Client Impersonation** | ✅ Yes – Admin can view dashboard as client |
| **Support Channel** | WAHA Pro (WhatsApp) + Telnyx (Voice/SMS) |
