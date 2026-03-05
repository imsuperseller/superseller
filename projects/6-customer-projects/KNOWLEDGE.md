# Project 6: Customer Projects — Knowledge Base

## Architecture Overview

Customer projects are standalone directories, each containing a complete client site or deliverable. They have NO dependencies on the SuperSeller AI main codebase — no shared imports, no shared database, no shared configs.

## Key Patterns

### Known Customer Directories
- `elite pro remodeling/`
- `rensto - online directory/`
- `ac-&-c-llc-hvac/` — AC&C HVAC (Vite+React main site + static dashboard)
- `kedem developments/` — Kedem Developments
- `ortal pilates/` — Ortal Pilates
- `wonder.care/` — Wonder Care
- `yoram-friedman-insurance/` — Yoram Friedman Insurance

### Per-Customer Isolation
- Each customer gets their own directory at the repo root
- Own `package.json`, own build process, own deployment
- Customer content comes from strategy docs in separate private repos
- SuperSeller SaaS platform features (landing pages, portals) are in Project 1

### AgentForge Integration
- AgentForge is the multi-stage AI research pipeline for client proposals
- Business discovery → design analysis → market research → deliverable packaging
- Uses Antigravity orchestration, BullMQ, and credit billing
- Code not started yet (spec only)

### Content Governance
This project has the strictest content rules in the system:
1. **Never fabricate**: No invented testimonials, case studies, or quotes
2. **Extract verbatim**: Copy from customer strategy docs
3. **Leave empty**: If content doesn't exist, omit the section
4. **Cite sources**: Track which doc and section content came from
5. **Violation history**: Past violations include fabricated testimonials despite docs explicitly stating content didn't exist

### Deployment
- Customer sites typically deploy to Vercel
- Each has its own Vercel project (not part of the main superseller project)
- Domain mapping varies per customer

## Known Customers

> **Full profiles with contact info, social links, and relationship details**: See [`CUSTOMERS.md`](CUSTOMERS.md)

| Customer | Location | Industry | Stack | Status |
|----------|----------|----------|-------|--------|
| Elite Pro Remodeling | Dallas TX | Remodeling | Python agents (RackNerd) | 90% built, IG token expired |
| Kedem Developments | Dallas TX | Luxury real estate | TourReel (Kling AI) | Pilot delivered |
| AC&C HVAC | Dallas TX | HVAC + chimney | Vite+React (Vercel) | Website delivered, behind password |
| Ortal Pilates | Dallas TX | Fitness / Pilates | Static HTML (GitHub Pages) | Website delivered, not operational |
| Wonder.care | Israel | Healthtech | n8n automation (own VPS) | Delivered + $6.4K proposal pending |
| Yoram Friedman Insurance | Israel | Insurance | Next.js 15 (Vercel) | Strategy + website delivered |
| Rensto Directory | Internal | Contractor directory | Next.js 14 | Dormant — internal product, not a customer |
