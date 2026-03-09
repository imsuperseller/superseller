# Customer: Elite Pro Remodeling

> **Type**: Active paying customer — $2,000/mo (signed, not started billing)
> **Contact**: Saar Bitton (owner) + Mor Dayan (PM) | (800) 476-7608 | info@elitepreremodeling.com
> **WhatsApp group**: `120363408376076110@g.us` (ClaudeClaw group agent active)

---

## What We're Building For Them

1. **ClaudeClaw Group Agent** ✅ LIVE — Claude AI assistant in their WhatsApp group, answers @superseller mentions
2. **Instagram Content Pipeline** 🔴 BLOCKED — Python agents on RackNerd (DRY_RUN mode, waiting for credentials)
3. **Demo video** ✅ DONE — R2: `elite-pro-demo/elite-pro-v12-final.mp4` (25.7s, 1080x1920)
4. **eSignatures contract** ⏳ NOT SENT — template ID `99de20b5-2bb9-4439-9532-e00902fe6824`

---

## File Ownership

### CAN edit (this project OWNS these files)
```
elite-pro-remodeling/**          ← customer-specific local content
docs/customer-projects/elite-pro-remodeling.md
```

### CANNOT edit — must coordinate with:
```
apps/worker/src/services/group-agent.ts    → Project 8 (ClaudeClaw)
apps/worker/src/services/group-memory.ts   → Project 8 (ClaudeClaw)
/opt/superseller-agents/ (server)          → use SSH via main Claude Code session
```

### CAN read (for context)
- `docs/customer-projects/elite-pro-remodeling.md` — full customer doc
- `projects/8-claudeclaw/KNOWLEDGE.md` — group agent context
- `projects/6-customer-projects/CUSTOMERS.md` — customer profile

---

## Current Blockers (prioritized)

| Blocker | Who | Status |
|---------|-----|--------|
| Meta App ID + Secret (for IG token refresh) | Saar to provide | WAITING |
| Saar + Mor phone numbers (for dual WhatsApp approval) | Saar to provide | WAITING |
| eSignatures contract sent | Shai to send | NOT SENT — template ready |
| IG account ID fix | Internal | `/opt/superseller-agents/config.py` has wrong IG_ACCOUNT_ID (SuperSeller's, not Elite Pro's) |

---

## What To Do In This Session

Use this folder for:
- Planning content strategy
- Writing copy / messaging
- Reviewing competitor intel (63 ads indexed in RAG)
- Preparing for onboarding when Saar provides credentials
- Drafting the eSignatures contract send

**For code changes** (Python agents, ClaudeClaw group, RackNerd server): tell main Claude Code session.

---

## Quick Reference

| Item | Value |
|------|-------|
| IG account (theirs) | Need to get from Saar — NOT `17841410951596580` (that's SuperSeller's) |
| IG handle | @eliteproremodeling |
| Landing page | https://elite-pro-landing.vercel.app |
| Demo video | https://pub-f1692e774ca04e3b9e495f7d3c85a759.r2.dev/elite-pro-demo/elite-pro-v12-final.mp4 |
| eSignatures template | `99de20b5-2bb9-4439-9532-e00902fe6824` |
| Python agents server | `/opt/superseller-agents/` on RackNerd (cron, DRY_RUN=True) |
| Tenant ID | `elite-pro-remodeling` |
| Voice IDs | Mor: `1prnFNmpCkb2bx39pQSi`, Saar: `jlOXsp2JeEQ29fkljTTO` |

---

## Brand Rules (NEVER VIOLATE)

- No music on Reels — natural audio only
- Zero text overlays on video
- Mor + Saar in black company shirts on camera
- Crew in yellow safety vests
- Dual WhatsApp approval required before ANY post goes live (Saar + Mor both must approve)
- Premium tone — they have 4.9★ BBB rating, content must match
