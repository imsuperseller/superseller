# Skill Router

**31 skills** | Match task → load skill on demand. Skills are NOT preloaded — only loaded when triggered.

## Quick Lookup

| Task | Skill(s) |
|------|----------|
| TourReel / video pipeline / Kling / Remotion | `tourreel-pipeline` + `cost-tracker` |
| Avatar video / Winner Studio / lip-sync | `winner-studio` + `cost-tracker` |
| FB Marketplace bot / GoLogin / listings | `marketplace-saas` |
| WhatsApp group agent / The Method / guardrails | `whatsapp-group-agent` |
| WhatsApp messaging / WAHA / OTP | `whatsapp-waha` |
| Voice AI / Telnyx / FrontDesk | `frontdesk-voice` |
| SocialHub / social media / content calendar | `socialhub` |
| Lead landing pages / /lp/ routes | `lead-pages` |
| AgentForge / research pipeline | `agentforge` |
| Deploy / RackNerd / PM2 / Vercel | `deploy-ops` |
| Database schema / Prisma / Drizzle | `database-management` |
| Migration safety / cross-ORM compile | `migration-validator` |
| Data sync / schema drift / Aitable | `data-integrity` |
| API endpoints / routes / contracts | `api-contracts` |
| API keys / credentials / rotation | `credential-guardian` |
| Health checks / monitoring / alerts | `monitoring-alerts` |
| Retry / circuit breaker / fallback | `resilience-patterns` |
| Automation / Antigravity / n8n | `antigravity-automation` |
| Billing / PayPal / credits / subscriptions | `billing-credits` |
| API cost tracking / trackExpense / budget | `cost-tracker` |
| UI design / colors / typography / styles | `ui-ux-pro-max` |
| Convert v0/Stitch UI to code / scroll animations | `ui-design-workflow` |
| Video → scroll website / Apple-style page | `video-to-website` |
| Excalidraw / architecture diagrams | `excalidraw-diagram` |
| Realistic AI images / Nano Banana | `nano-banana-image` |
| NotebookLM / specs / methodology | `notebooklm-hub` |
| RAG / pgvector / vector search / embeddings | `rag-pgvector` |
| AI model selection / pricing / observatory | `model-observatory` |
| Customer onboarding / dashboard / provisioning | `customer-journey` |
| Admin portal / admin.superseller.agency | `admin-portal` |

## Disambiguation

| Ambiguity | Rule |
|-----------|------|
| **DB**: day-to-day vs migration vs drift | `database-management` (schema) → `migration-validator` (deploy) → `data-integrity` (post-deploy) |
| **Cost**: customer billing vs operational | `billing-credits` (customer $) vs `cost-tracker` (our API spend) |
| **UI**: design vs execution | `ui-ux-pro-max` (what) + `ui-design-workflow` (how) |
| **Monitoring vs Resilience** | `monitoring-alerts` (detect) vs `resilience-patterns` (self-heal) |
| **WhatsApp**: messaging vs group agent | `whatsapp-waha` (send/receive) vs `whatsapp-group-agent` (The Method) |

## Multi-Skill Combos

- **Video job**: tourreel-pipeline + cost-tracker + model-observatory
- **New API endpoint**: api-contracts + database-management + credential-guardian
- **Schema migration**: database-management + migration-validator + data-integrity
- **New customer onboarding**: customer-journey + billing-credits + lead-pages + whatsapp-waha
- **New product launch**: billing-credits + customer-journey + admin-portal + api-contracts + database-management
