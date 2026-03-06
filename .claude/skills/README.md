# Claude Skills — SuperSeller AI Project

**30 active skills** — see `SKILL_ROUTER.md` for full index, decision tree, and multi-skill workflow patterns.

## Active Skills (30)

### Product Skills (7)
| Skill | Purpose | Status |
|-------|---------|--------|
| **tourreel-pipeline** | Real estate video: Kling 3.0 AI clips + Remotion photo composition | Active |
| **winner-studio** | AI avatar video for Mivnim/Yossi (Gemini + avatar-pro + WhatsApp delivery) | Active |
| **marketplace-saas** | FB Marketplace bot SaaS (multi-tenant, GoLogin, Kie.ai image gen) | Active |
| **lead-pages** | Dynamic /lp/[slug] landing pages with per-customer branding | Active |
| **frontdesk-voice** | Telnyx AI voice assistant (FrontDesk) | Active (partial) |
| **agentforge** | Multi-stage AI research pipeline | Spec only |
| **socialhub** | Social media management (text+image→WhatsApp approval→FB publish) | Phase 1 Live |

### Infrastructure Skills (9)
| Skill | Purpose |
|-------|---------|
| **deploy-ops** | RackNerd SSH/rsync/PM2, Vercel deploys, FFmpeg auto-update |
| **database-management** | Prisma + Drizzle dual-ORM, schema sync, migrations |
| **migration-validator** | Cross-ORM migration safety (ensures both ORMs compile) |
| **data-integrity** | Cross-store consistency (Postgres/Aitable/PayPal reconciliation) |
| **api-contracts** | 80+ endpoint inventory, Zod validation, breaking-change detection |
| **credential-guardian** | API key lifecycle, expiry monitoring, key rotation |
| **monitoring-alerts** | 11 services monitored, alert rules, uptime tracking |
| **resilience-patterns** | Retry, circuit breakers, fallback chains, error budgets |
| **antigravity-automation** | Primary automation engine (n8n = backup only) |

### Billing & Cost Skills (2)
| Skill | Purpose |
|-------|---------|
| **billing-credits** | PayPal billing + credit ledger (formerly stripe-credits) |
| **cost-tracker** | API cost tracking (trackExpense(), anomaly detection, budgets) |

### UI/UX & Creative Skills (5)
| Skill | Purpose |
|-------|---------|
| **ui-ux-pro-max** | Design intelligence (50+ styles, 97 palettes, 57 fonts) |
| **ui-design-workflow** | External UI bridge (v0/Stitch → SuperSeller branded React) + scroll-driven animation pipeline (Lenis + GSAP) |
| **video-to-website** | Turn video into scroll-driven animated website (standalone vanilla HTML/CSS/JS, Apple-style) |
| **excalidraw-diagram** | Generate editable Excalidraw diagrams (JSON schema, color zones, layout) |
| **nano-banana-image** | Hyper-realistic AI image generation via Kie.ai (Nano Banana 2, structured JSON prompting) |

### Knowledge & AI Skills (3)
| Skill | Purpose |
|-------|---------|
| **notebooklm-hub** | 30+ notebooks, query patterns, auth flow, conflict resolution |
| **rag-pgvector** | pgvector + Ollama RAG stack (HNSW, multi-tenant docs) |
| **model-observatory** | 34+ curated + 118 auto-discovered models, daily sync, pipeline recommendations |

### Customer & Portal Skills (2)
| Skill | Purpose |
|-------|---------|
| **customer-journey** | 4-stage funnel, PayPal provisioning, magic-link auth, entitlements |
| **admin-portal** | 8-tab admin dashboard, CRM, system monitoring, treasury |

### Communication Skills (1)
| Skill | Purpose |
|-------|---------|
| **whatsapp-waha** | WhatsApp via WAHA Pro (messaging, OTP, video delivery) |

### Meta Skills (1)
| Skill | Purpose |
|-------|---------|
| **skill-template** | Scaffold for creating new skills |

## Cowork Plugins (6)
Located in `plugins/` — for Claude Desktop/Web (Cowork layer). See individual plugin READMEs.

## Key References
- `SKILL_ROUTER.md` — Decision tree for task→skill routing
- `CLAUDE.md` — Project-wide rules and architecture
- `brain.md` — North Star and agent protocol
