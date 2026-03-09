# SuperSeller AI

Unified lead generation and content platform. AI-powered video creation, social media automation, WhatsApp AI bridge, and customer landing pages.

## Products

| Product | Status | What It Does |
|---------|--------|-------------|
| **TourReel** | Live | AI property videos (Kling 3.0 + Remotion dual-path) |
| **FB Marketplace Bot** | Live | Automated FB Marketplace posting (UAD + Miss Party) |
| **ClaudeClaw** | Live | WhatsApp-to-Claude AI bridge with 3-tier memory |
| **SocialHub/Buzz** | Live | Text+image to WhatsApp approval to FB publish |
| **Winner Studio** | Built | AI avatar videos (paused — Pesach 2026) |
| **FrontDesk Voice AI** | Partial | Telnyx voice assistant, webhook migration pending |
| **Lead Landing Pages** | Ready | `/lp/[slug]` infrastructure complete, design upgrade pending |

## Quick Start

```bash
cd apps/web/superseller-site
npm install && npm run dev    # Runs on port 3002
```

## Key URLs

| Service | URL |
|---------|-----|
| Main site | https://superseller.agency |
| Admin | https://admin.superseller.agency |
| Worker health | http://172.245.56.50:3002/api/health |
| n8n | https://n8n.superseller.agency |

## Stack

- **Web**: Next.js 14+ on Vercel
- **Worker**: Node.js + BullMQ + Remotion + FFmpeg on RackNerd
- **Database**: PostgreSQL + pgvector (Prisma + Drizzle)
- **AI**: Kie.ai (Kling 3.0, Suno), Gemini Flash, Ollama embeddings
- **Payments**: PayPal (migrated from Stripe Feb 2026)

## Documentation

See **[CLAUDE.md](CLAUDE.md)** for complete technical documentation — architecture, deployment, credentials, and all product details.

| Doc | Purpose |
|-----|---------|
| `CLAUDE.md` | Master technical router |
| `PRODUCT_STATUS.md` | Live product + customer tracker |
| `DECISIONS.md` | All user decisions as canonical truth |
| `docs/INFRA_SSOT.md` | Infrastructure single source of truth |
| `docs/PRODUCT_BIBLE.md` | SaaS billing, credits, agent specs |

---

**Last Updated**: March 8, 2026
