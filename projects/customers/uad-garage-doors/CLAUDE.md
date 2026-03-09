# Customer: UAD (David Szender — Garage Doors)

> **Type**: Active customer — revenue split on converting leads (no fixed fee)
> **Contact**: David Szender
> **Status**: ✅ LIVE — verified posting daily as of March 8, 2026

---

## What We're Building For Them

**FB Marketplace Bot** — automated listing posting across 30 DFW cities. 5 posts/15min cycle, 4 Telnyx phone numbers, dynamic phone overlays, AI-generated city-specific copy, image variation pool.

**Lead Pipeline**: Telnyx Voice AI → Claude Sonnet analysis → Workiz CRM (n8n workflow `U6EZ2iLQ4zCGg31H` — DO NOT DISABLE).

---

## File Ownership

### CAN edit (this project OWNS)
```
(no customer-specific directory for UAD — config lives in the shared bot)
fb-marketplace-lister/deploy-package/bot-config.json   ← UAD section only
```

### Read for context
- `platforms/marketplace/PLATFORM_BIBLE.md`
- `PRODUCT_STATUS.md` §1

---

## Key Config

- **Bot config (server)**: `/opt/fb-marketplace-bot/bot-config.json` (UAD section)
- **n8n voice pipeline**: `U6EZ2iLQ4zCGg31H` (Telnyx → Claude → Workiz)
- **Phones**: 4 Telnyx numbers for rotation
- **Cities**: 30 DFW cities
- **Rate**: 5 posts per 15-minute cycle

---

## Revenue Model

Revenue split on leads that convert to sales. No fixed monthly fee. No SaaS plan in the system.

---

## Backlog

| Item | Priority |
|------|----------|
| FB Marketplace → PostgreSQL migration (away from Firestore) | P2 |
| Add more cities to rotation | P3 |
| Dashboard for David to see posting stats | P3 |
