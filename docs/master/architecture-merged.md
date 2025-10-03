

---
# From: ARCHITECTURE.md
---

# Rensto MCP Gateway — Architecture

## Overview
Cloudflare Worker exposes HTTP API, validates auth/billing, signs and forwards to n8n, and records usage.

MCP Client -> Worker (/api/execute)
  - KV (tenants, idempotency, throttle)
  - n8n Webhook (HMAC-signed)
  - Airtable (usage log), Rollbar (errors)

## Components
- Security: HMAC (computeSignature), idempotency (KV), throttle (token bucket)
- Billing: ensureEntitled, recordUsage
- Task Bus: forwards SKU to n8n or runs internal tools
- Observability: Rollbar, Airtable

## Contract
Headers: x-rensto-run-id, x-rensto-sig, x-rensto-ts, x-rensto-tenant
Body: { sku, plan, payload, actor? }
HMAC: sha256 over `${ts}.${run_id}.${raw}`


> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)

---
# From: architecture.md
---

{
  "title": "Customer Portal Enhancement - System Architecture",
  "technologyStack": {
    "frontend": "Next.js 14, TypeScript, Tailwind CSS, GSAP",
    "backend": "Node.js, Express, Prisma",
    "database": "PostgreSQL",
    "design": "Rensto Design System, Shadcn/ui"
  },
  "components": [
    "Dynamic Portal Router",
    "Customer Configuration API",
    "Feature Toggle System",
    "Design System Components",
    "Animation System",
    "MCP Integration Layer"
  ]
}

> **📚 MCP Reference**: For current MCP server status and configurations, see [MCP_SERVERS_AUTHORITATIVE.md](./MCP_SERVERS_AUTHORITATIVE.md)