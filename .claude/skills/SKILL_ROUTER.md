# Skill Router

**29 skills** (on disk) | Match task → load skill on demand. Skills are NOT preloaded — only loaded when triggered.

## Quick Lookup

| Task | Skill(s) |
|------|----------|
| Spec / plan / requirements / atomic commits / codebase map | `spec-driven-dev` |
| VideoForge / video pipeline / Kling / Remotion | `videoforge-pipeline` + `cost-tracker` |
| Avatar video / Winner Studio / lip-sync | `winner-studio` + `cost-tracker` |
| FB Marketplace bot / GoLogin / listings | `marketplace-saas` |
| WhatsApp group agent / The Method / guardrails | `whatsapp-waha` (covers WAHA + ClaudeClaw group agent) |
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
| Autonomous agents / credential sentinel / session watchdog | `autonomous-agents` |
| Retry / circuit breaker / fallback | `resilience-patterns` |
| Automation / Antigravity / n8n | `antigravity-automation` |
| API cost tracking / trackExpense / budget | `cost-tracker` |
| UI design / colors / typography / styles | `ui-ux-pro-max` |
| Convert v0/Stitch UI to code / scroll animations | `ui-design-workflow` |
| Competitor ad research / Meta Ads Library | `competitor-research` |
| NotebookLM / specs / methodology | `notebooklm-hub` |
| RAG / pgvector / vector search / embeddings | `rag-pgvector` |
| AI model selection / pricing / observatory | `model-observatory` |
| Customer onboarding / dashboard / provisioning | `customer-journey` |
| Admin portal / admin.superseller.agency | `admin-portal` |

## Disambiguation

| Ambiguity | Rule |
|-----------|------|
| **DB**: day-to-day vs migration vs drift | `database-management` (schema) → `migration-validator` (deploy) → `data-integrity` (post-deploy) |
| **Cost**: customer billing vs operational | `customer-journey` (customer $) vs `cost-tracker` (our API spend) |
| **UI**: design vs execution | `ui-ux-pro-max` (what) + `ui-design-workflow` (how) |
| **Monitoring vs Resilience** | `monitoring-alerts` (detect) vs `resilience-patterns` (self-heal) |
| **WhatsApp**: messaging vs group agent | `whatsapp-waha` (send/receive + ClaudeClaw group agent / The Method) |

## Multi-Skill Combos

- **Video job**: videoforge-pipeline + cost-tracker + model-observatory
- **New API endpoint**: api-contracts + database-management + credential-guardian
- **Schema migration**: database-management + migration-validator + data-integrity
- **New customer onboarding**: customer-journey + lead-pages + whatsapp-waha + cost-tracker
- **New product launch**: customer-journey + admin-portal + api-contracts + database-management + cost-tracker
