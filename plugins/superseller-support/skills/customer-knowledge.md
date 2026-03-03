---
name: Customer Knowledge Base
description: Current customer roster, their products, communication preferences, and account context
---

# Customer Knowledge Base

Reference for all active SuperSeller AI customers, their products, and how to communicate with them.

## Active Customers

### UAD Garage Doors
- **Products**: FB Marketplace Bot (daily posting), Lead Pipeline
- **Status**: Active, posting daily to Facebook Marketplace
- **Communication**: WhatsApp-first
- **Key context**: One of the first customers. FB Bot runs on RackNerd via PM2 (webhook-server + fb-scheduler). Telnyx voice lead analysis workflow active in n8n (workflow U6EZ2iLQ4zCGg31H).
- **Common issues**: GoLogin session expiry, posting schedule pauses, lead quality questions

### MissParty Rentals
- **Products**: FB Marketplace Bot (daily posting)
- **Status**: Active, posting daily to Facebook Marketplace
- **Communication**: WhatsApp-first
- **Key context**: Party rental business. FB Bot configuration in bot-config.json. Telnyx voice lead analysis workflow active in n8n (workflow 9gfvZo9sB4b3pMWQ).
- **Common issues**: Similar to UAD — GoLogin sessions, posting schedule

### Yossi / Mivnim Construction
- **Products**: Winner Studio (product photography / staging)
- **Status**: Built and verified end-to-end, but Yossi not actively using
- **Communication**: WhatsApp, Hebrew-speaking
- **Key context**: Construction/renovation company. Winner Studio was built for his use case (room staging, furniture placement). NotebookLM notebook e109bcb2 tracks his project.
- **Common issues**: Not currently active — may need re-engagement

### AC&C HVAC
- **Products**: Website + Dashboard
- **Status**: Website deployed at dist-chi-three-91.vercel.app, Dashboard at dist-dashboard-eight.vercel.app
- **Communication**: English
- **Key context**: HVAC company. Main site is Vite+React, dashboard is static HTML. Both password-protected. Dashboard login: admin / AcC-Lead$2026. Code at `/Users/shaifriedman/superseller/ac-&-c-llc-hvac/`.
- **Common issues**: Password resets, dashboard data updates, website content changes

## Communication Culture

- **Primary channel**: WhatsApp. Almost all customer communication happens on WhatsApp, not email.
- **Language**: Mix of English and Hebrew. Some customers are Hebrew-only.
- **Expectations**: Fast responses. Israeli business owners expect same-day resolution for urgent issues.
- **Tone**: Direct and practical. No corporate formality. First-name basis from day one.
- **Hours**: Customers may message at any hour. Respond during business hours (9 AM - 7 PM IST) unless P0.

## Tenant Structure

Each customer maps to a Tenant in the database:
- `Tenant` table: name, slug, plan, settings
- `TenantUser` table: links User to Tenant
- Subdomain routing: `[slug].superseller.agency` for portal access

## Customer Lifecycle

1. **Onboarding**: WhatsApp intro, product setup, initial configuration
2. **Active Use**: Daily/weekly product usage, credit consumption
3. **Support**: Issues handled via WhatsApp, escalated to technical fix if needed
4. **Renewal**: Monthly PayPal subscription auto-renew
5. **At Risk**: No usage for 14+ days, credit exhaustion, payment failure
