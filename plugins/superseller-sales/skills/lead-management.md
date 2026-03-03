---
name: Lead Management
description: How SuperSeller AI captures, qualifies, tracks, and converts leads across WhatsApp groups, Workiz CRM, email, and Aitable dashboards.
---

# Lead Management

SuperSeller AI manages leads through a multi-channel system built around the WhatsApp-first culture of its primary customer base (Israeli/Jewish small business owners). This document describes the complete lead lifecycle.

## Lead Sources

| Source | Method | Volume | Quality |
|--------|--------|--------|---------|
| **WhatsApp groups** | Community monitoring, value-first engagement in Israeli business groups (Parliament, regional groups) | Primary | High -- warm, community-vetted |
| **Website** | superseller.agency contact form, pricing page submissions, chat widget | Secondary | Medium -- self-qualified by visiting |
| **Referral** | Existing customers referring peers through WhatsApp or in-person | Occasional | Highest -- pre-sold on trust |
| **Facebook** | Page messages, ad responses, post engagement | Supplementary | Medium |
| **Telnyx voice** | Inbound calls to +14699299314, analyzed by voice AI pipeline | Low volume | High -- caller has strong intent |
| **Manual** | Founder observation, event contacts, community interactions | Variable | High -- founder-qualified |

## Lead Lifecycle

```
Capture --> Qualify --> Engage --> Demo --> Propose --> Close --> Onboard
```

### 1. Capture

Leads enter the PostgreSQL `Lead` table with:
- `source`: Origin channel
- `status`: Starts as `new`
- `qualificationStatus`: Starts as `unqualified`
- `tags`: JSON with industry, location, priority markers
- `metadata`: JSON with source-specific context (group name, referrer, call transcript)

All leads are associated with a `userId` (the SuperSeller AI admin user for founder-sourced leads, or the referring customer's ID for referral leads).

### 2. Qualify

Qualification criteria (a lead is `qualified` when ALL are met):

| Criterion | Check |
|-----------|-------|
| **Industry fit** | Matches top 10 industries (restaurant, contractor, locksmith, auto, insurance, HVAC, cleaning, pool, education, bakery) |
| **Revenue range** | $100K-$1M/year (can sustain $79-299/mo) |
| **Pain confirmed** | Expressed specific need (more customers, missed calls, no online presence, manual processes) |
| **Budget signal** | Did not object to pricing range when discussed or implied |
| **Decision maker** | The person we are talking to can authorize a purchase |

Qualification is tracked in `qualificationStatus`:
- `unqualified` -- just captured, not yet assessed
- `qualifying` -- in conversation, gathering info
- `qualified` -- meets all criteria above
- `disqualified` -- does not fit (too small, wrong industry, no budget)

### 3. Engage

Engagement happens primarily on WhatsApp. The workflow:

1. **First touch**: Personalized message referencing their specific business and need
2. **Value delivery**: Create a free sample (landing page mockup, social post, demo video) for their business
3. **Conversation**: Answer questions, demonstrate the product via WhatsApp media sharing
4. **Demo**: Live demo where we generate content for their business in real-time

The WAHA WhatsApp API (session `superseller-whatsapp`) handles message sending and receiving. Approval workflows for SocialHub content also run through WAHA.

### 4. Track

Leads are tracked across three systems:

| System | Purpose | Sync |
|--------|---------|------|
| **PostgreSQL** | Source of truth for all lead data | Primary |
| **Aitable.ai** | Visual dashboard for pipeline view (datasheet `dstTYYmleksXHj3sCj`) | Synced via `syncedToAITable` flag on Lead record |
| **Workiz CRM** | Used specifically for UAD (air duct) and MissParty customers for job scheduling | Manual / n8n workflows |

### 5. Convert

Conversion path:
1. Lead accepts proposal or clicks checkout link
2. PayPal subscription created (stored in `Subscription` table)
3. `Entitlement` record created with credit balance (300/800/2000 based on plan)
4. Lead status updated to `closed_won` with `convertedAt` timestamp and `conversionValue`
5. `ServiceInstance` created for activated products
6. Onboarding begins (first deliverable within 24 hours)

## Pipeline Stages

| Stage | Status Value | Typical Duration | Exit Criteria |
|-------|-------------|-----------------|---------------|
| Prospect | `new` | 0-2 days | First outreach sent |
| Outreach | `contacted` | 1-5 days | Lead responds |
| Engaged | `responding` | 3-14 days | Qualification complete |
| Qualified | `qualified` | 1-7 days | Demo scheduled or sample delivered |
| Demo | `demo_scheduled` | 1-3 days | Demo completed |
| Proposal | `proposal_sent` | 1-7 days | Lead reviews pricing |
| Negotiation | `negotiating` | 1-14 days | Terms agreed |
| Trial | `trial` | 7-14 days | Trial period ends |
| Won | `closed_won` | -- | Payment received |
| Lost | `closed_lost` | -- | Lead declined or disqualified |

## Speed-to-Lead

Response time is critical and tracked in the `Lead` table:
- `firstContactAt`: When we first reached out
- `firstResponseAt`: When the lead first replied
- `responseTime`: Calculated seconds between contact and response
- `responseTimeStatus`: 'fast' (<5 min), 'good' (<1 hour), 'slow' (<24 hours), 'critical' (>24 hours)

Target: First contact within 5 minutes of lead capture. For voice leads (Telnyx), this is automatic via the AI voice pipeline.

## Aitable Dashboard

The Aitable dashboard provides a visual pipeline view:
- **Space**: `spc63cnXLdMYc`
- **Primary datasheet**: `dstTYYmleksXHj3sCj`
- **API token**: Stored in environment as `AITABLE_API_TOKEN`
- **Fields**: Maps to Lead table columns (name, company, status, source, notes, etc.)
- **Sync**: Leads with `syncedToAITable = false` need to be pushed to Aitable

## Key Rules

1. **Never cold-call** -- WhatsApp warm intro through community connections is the only acceptable first touch
2. **Hebrew first** for Israeli community leads; English for website/organic leads
3. **Always offer value before asking for commitment** -- free sample, demo, or useful advice
4. **Log every interaction** in the Lead's `notes` field with timestamp
5. **Archive, don't delete** -- leads that go cold get `status = 'archived'`, never deleted
6. **Respect community dynamics** -- being removed from a WhatsApp group for spam destroys the entire channel
