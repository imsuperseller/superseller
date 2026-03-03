---
name: product-status
description: Review status of all 7 SuperSeller AI products with health metrics
---

# Product Status

Generate a comprehensive status report for all SuperSeller AI products.

## Products to Review

| Product | Expected Status | Key Checks |
|---------|----------------|------------|
| **TourReel** | LIVE | Job queue health, Kling API success rate, R2 storage, recent renders |
| **FB Marketplace Bot** | LIVE | UAD + MissParty posting daily, GoLogin sessions active, webhook-server healthy |
| **SocialHub/Buzz** | LIVE | Content pipeline (Claude → Kie.ai → WhatsApp → FB), recent posts |
| **Winner Studio** | Built | Spoke agent, Kie.ai avatar-pro/infinitalk, Yossi usage |
| **Lead Landing Pages** | Infrastructure | /lp/[slug] routes, any active customer pages |
| **FrontDesk Voice AI** | Partial | Telnyx assistant status, call handling, webhook config |
| **RAG/pgvector** | Infrastructure | Ollama health, vector index status, connected products (should be zero) |

## Steps

1. Query `ServiceInstance` table for all active services
2. Check health endpoints: web (/api/health), worker (172.245.56.50:3002/api/health)
3. Query `Job` table for recent job completions/failures per product
4. Check PM2 process status on RackNerd
5. Query `api_expenses` for cost per product this week

## Output

Per-product card with: Status | Last Activity | Success Rate | Weekly Cost | Issues | Next Priority
