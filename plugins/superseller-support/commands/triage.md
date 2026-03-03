---
name: Triage Support Request
description: Classify incoming support requests by product, priority, and route to appropriate response
---

# Triage Support Request

Classify and route an incoming customer support request.

## Input

The user will provide a support request — this could be a WhatsApp message, email, voice call transcript, or direct description of a customer issue.

## Process

### Step 1: Identify the Customer

Query PostgreSQL to match the customer:

```sql
SELECT u.id, u.name, u.email, u.phone,
       t.name AS tenant_name, t.slug,
       si.product, si.status AS service_status
FROM "User" u
LEFT JOIN "TenantUser" tu ON tu."userId" = u.id
LEFT JOIN "Tenant" t ON tu."tenantId" = t.id
LEFT JOIN "ServiceInstance" si ON si."userId" = u.id
WHERE u.phone LIKE '%<phone_fragment>%'
   OR u.email ILIKE '%<email_fragment>%'
   OR u.name ILIKE '%<name_fragment>%';
```

If the customer is not found, flag as **New Contact** and ask the user whether to create a record.

### Step 2: Classify by Product

Map the issue to one of these products:

| Product | Keywords / Signals |
|---------|-------------------|
| **TourReel** | video, listing, Zillow, property, render, clip, photo, Kling, Remotion |
| **FB Marketplace Bot** | marketplace, posting, listing, GoLogin, Facebook, ad, marketplace bot |
| **SocialHub / Buzz** | social media, post, content, WhatsApp approval, Facebook page, Instagram |
| **Winner Studio** | product photo, staging, furniture, room, design |
| **FrontDesk** | voice, phone, call, assistant, Telnyx, answering |
| **Lead Pages** | landing page, lead capture, form, LP |
| **Billing / Account** | payment, subscription, credits, PayPal, invoice, cancel, upgrade |
| **General** | anything that does not fit above |

### Step 3: Assign Priority

| Priority | Criteria | Response SLA |
|----------|----------|--------------|
| **P0 — Critical** | Service completely down, data loss, billing error charging wrong amount | Immediate (within 1 hour) |
| **P1 — High** | Feature broken but workaround exists, customer cannot complete primary task | Same day (within 4 hours) |
| **P2 — Medium** | Minor bug, cosmetic issue, feature request with business impact | Within 24 hours |
| **P3 — Low** | Question, how-to, feature request, nice-to-have | Within 48 hours |

### Step 4: Route and Recommend Action

Based on product and priority, recommend:

1. **Immediate technical fix** (P0/P1) — Check server health, PM2 status, API keys, database connectivity.
2. **Customer response** (all) — Draft a WhatsApp or email reply using the `/respond` command.
3. **Escalation** (P0 or unknown) — Flag for manual review with full context.
4. **Knowledge base** (P2/P3) — Check if the answer exists in product troubleshooting docs.

## Output Format

```
TRIAGE RESULT
─────────────
Customer:    [Name] ([Tenant])
Product:     [Product Name]
Priority:    [P0/P1/P2/P3] — [Label]
Category:    [Bug / Question / Feature Request / Billing / Outage]
Summary:     [One-line description]

Recommended Action:
1. [Primary action]
2. [Secondary action if needed]

Response SLA: [Timeframe]
```

## Notes

- WhatsApp-first culture: most support comes via WhatsApp, not email.
- Israeli/Jewish small business owners are direct communicators. Match their pace.
- If a P0 involves the FB Marketplace Bot, check PM2 status on RackNerd (172.245.56.50) immediately.
- If Telnyx/voice related, check the active API key and assistant configuration.
