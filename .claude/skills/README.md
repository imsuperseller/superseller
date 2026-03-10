# Claude Skills — SuperSeller AI Project

**29 active skills** — see `SKILL_ROUTER.md` for full index, decision tree, and multi-skill workflow patterns.

## Active Skills (29)

### Product Skills (7)
| Skill | Purpose | Status |
|-------|---------|--------|
| **videoforge-pipeline** | Real estate video: Kling 3.0 AI clips + Remotion photo composition | Active |
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

### Cost & Development Skills (2)
| Skill | Purpose |
|-------|---------|
| **cost-tracker** | API cost tracking (trackExpense(), anomaly detection, budgets) |
| **spec-driven-dev** | SPEC → PLAN → EXECUTE → VERIFY workflow, atomic commits, codebase mapping |

### UI/UX & Creative Skills (2)
| Skill | Purpose |
|-------|---------|
| **ui-ux-pro-max** | Design intelligence (50+ styles, 97 palettes, 57 fonts) |
| **ui-design-workflow** | External UI bridge (v0/Stitch → SuperSeller branded React) + scroll-driven animation pipeline (Lenis + GSAP) |

### Knowledge & AI Skills (3)
| Skill | Purpose |
|-------|---------|
| **notebooklm-hub** | 30+ notebooks, query patterns, auth flow, conflict resolution |
| **rag-pgvector** | pgvector + Ollama RAG stack (HNSW, multi-tenant docs) |
| **model-observatory** | 34+ curated + 118 auto-discovered models, daily sync, pipeline recommendations |

### Customer & Portal Skills (3)
| Skill | Purpose |
|-------|---------|
| **customer-journey** | 4-stage funnel, PayPal provisioning, magic-link auth, entitlements |
| **admin-portal** | 8-tab admin dashboard, CRM, system monitoring, treasury |
| **competitor-research** | Multi-tenant competitor ad research via Meta Ads Library |

### Communication Skills (1)
| Skill | Purpose |
|-------|---------|
| **whatsapp-waha** | WhatsApp via WAHA Pro (messaging, OTP, video delivery) |

### Autonomous & Meta Skills (2)
| Skill | Purpose |
|-------|---------|
| **autonomous-agents** | Self-healing monitoring (credential sentinel, session watchdog, doc scanner) |
| **skill-template** | Scaffold for creating new skills |

## Key References
- `SKILL_ROUTER.md` — Decision tree for task→skill routing
- `CLAUDE.md` — Project-wide rules and architecture
- `brain.md` — North Star and agent protocol
