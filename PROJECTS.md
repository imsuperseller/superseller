# SuperSeller AI — Project Map

> **Purpose**: Every project has a folder. Every folder has a CLAUDE.md + KNOWLEDGE.md.
> Open the folder in Claude Cowork → Claude knows exactly what it can/cannot touch and what the current status is.
> **Rule**: No source code is moved. Projects are organizational + context layers only.
> **Last updated**: March 8, 2026

---

## How This Works

1. Each folder below = one Cowork context
2. Open the folder in Claude Cowork (or `cd projects/X && claude`)
3. The CLAUDE.md tells Claude what files it owns and what it cannot touch
4. The KNOWLEDGE.md gives Claude full project context without needing to read the whole codebase
5. For codebase changes (SSH, deploys, DB migrations): report back to the main Claude Code session here

---

## System / Product Projects

| # | Project | Folder | What It Covers |
|---|---------|--------|----------------|
| 1 | **SuperSeller Web** | `projects/1-superseller-web/` | Next.js SaaS platform, admin portal, billing, PayPal, i18n, Prisma, auth |
| 2 | **Video Engine** | `projects/2-video-engine/` | VideoForge pipeline, Kling AI clips, Remotion compositions, FFmpeg, model selector |
| 3 | **Marketplace Bot** | `projects/3-marketplace-bot/` | FB Marketplace automation, GoLogin, UAD + MissParty, Firestore |
| 4 | **Infrastructure** | `projects/4-infrastructure/` | RackNerd VPS, PM2, Docker, MCP servers, CI/CD, env vars |
| 5 | **Social & Content** | `projects/5-social-content/` | SocialHub/Buzz (Phase 1 live), WAHA sessions, Telnyx FrontDesk Voice |
| 8 | **ClaudeClaw** | `projects/8-claudeclaw/` | WhatsApp AI bridge, group agent, 3-tier memory, guardrails, RAG, approvals |
| 7 | **Strategy & Docs** | `projects/7-strategy-docs/` | Root docs, brain.md, PRODUCT_BIBLE, NotebookLM, business intelligence |

---

## Customer Projects (Active + Delivered)

| Customer | Folder | Revenue | Status |
|----------|--------|---------|--------|
| **Elite Pro Remodeling** | `projects/customers/elite-pro-remodeling/` | $2,000/mo (signed) | IG pipeline BLOCKED on Saar's creds. Group agent LIVE in Hebrew. |
| **UAD Garage Doors** | `projects/customers/uad-garage-doors/` | Revenue split | ✅ FB Bot posting daily |
| **Miss Party** | `projects/customers/miss-party/` | Free | ✅ FB Bot posting daily |
| **Kedem Developments** | `projects/customers/kedem-developments/` | Per-video | Pilot delivered, dormant |
| **AC&C HVAC** | `projects/customers/ac-c-hvac/` | TBD | Site built, behind password, not live |
| **Yoram Friedman** | `projects/customers/yoram-friedman/` | Pay per lead | ✅ Site live, Apify not set up |
| **Wonder.care** | `projects/customers/wonder-care/` | Project-based | Pipeline delivered, proposal pending 3mo |
| **Ortal Pilates** | `projects/customers/ortal-pilates/` | TBD | Placeholder only, strategic asset |
| **Yossi / Mivnim** | (in PRODUCT_STATUS.md §7) | TBD | Winner Studio — PAUSED till Pesach April 2026 |

## Prospects / Hot Leads (Israeli Parliament Group)

Full pipeline strategy: `projects/leads-pipeline/CLAUDE.md`

| Lead | Folder | Business | Priority |
|------|--------|----------|----------|
| **Yehuda Alali** | `projects/customers/yehuda-alali-meat-point/` | Meat Point + Pizza Ella (kosher restaurants) | 🔴 #1 — posts daily, gets deleted |
| **Yaron Yashar** | `projects/customers/yaron-air-duct/` | Air duct / chimney / dryer vent | 🔴 Tier 1 |
| **Avi** | `projects/customers/avi-tokyo-bar/` | Tokyo Bar (kosher restaurant) | 🔴 Tier 1 |
| **Avi Construction** | `projects/customers/avi-construction/` | Roofing / general contractor | 🔴 Tier 1 |
| **Tomer** | `projects/customers/tomer-tesla-heroes/` | Tesla Heroes (Tesla repair) | 🟡 Tier 2 |
| **Maydan (Midan Arazi)** | `projects/customers/maydan-insurance/` | UnitedHealthcare insurance | 🟡 Tier 2 |
| Other Parliament members | `projects/leads-pipeline/` | Various | See pipeline doc |

> **Note**: Other Parliament members (Eliran, Dror, DialWise.ai/Etai) tracked in `leads-pipeline/CLAUDE.md`. Yaron Yashar's last name — not confirmed in docs, verify with Shai.

---

## Rensto (Separate Business)

| Folder | What It Covers |
|--------|----------------|
| `projects/rensto/` | Rensto Online Directory — live at rensto.com (separate codebase at `~/rensto - online directory/`) |

---

## Backlog / Pending Work

Items that need to happen but aren't assigned to an active sprint:

| Item | Folder | Decision Needed |
|------|--------|-----------------|
| VideoForge end-to-end audit + test | `projects/backlog/tourreel-audit/` | Approve ~$2 API spend |
| Billing system fix (7 issues) | `projects/backlog/billing-system-fix/` | Prioritize which of 7 issues to start |
| Iron Dome OS pipeline rebuild | `projects/backlog/iron-dome-rebuild/` | Pick rebuild option (A/B/C) |
| Elite Pro go-live (once Saar sends creds) | `projects/backlog/elite-pro-go-live/` | Waiting on Saar |

---

## File Ownership Map (No Overlaps)

```
apps/web/superseller-site/**           → Project 1 (Web)
apps/studio/**                         → Project 1 (Web)
apps/worker/**                         → Project 2 (Video Engine)
apps/worker-packages/**                → Project 2 (Video Engine)
  └── ClaudeClaw service files         → Project 8 (ClaudeClaw) [by convention, not folder]
fb-marketplace-lister/**               → Project 3 (Marketplace Bot)
platforms/marketplace/**               → Project 3 (Marketplace Bot)
infra/**                               → Project 4 (Infrastructure)
scripts/**                             → Project 4 (Infrastructure)
tools/**                               → Project 4 (Infrastructure)
ops/**                                 → Project 4 (Infrastructure)
.env*, .mcp.json, root configs         → Project 4 (Infrastructure)
shai friedman social/**                → Project 5 (Social & Content)
docs/**                                → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)       → Project 7 (Strategy & Docs)
elite-pro-remodeling/**                → Customer: Elite Pro
kedem developments/**                  → Customer: Kedem
ac-&-c-llc-hvac/**                     → Customer: AC&C
yoram-friedman-insurance/**            → Customer: Yoram
wonder.care/**                         → Customer: Wonder.care
ortal pilates/**                       → Customer: Ortal
~/rensto - online directory/           → Rensto (outside this repo)
```

---

## Skill Assignments

| Skill | Project |
|-------|---------|
| admin-portal | 1 — Web |
| customer-journey | 1 — Web |
| lead-pages | 1 — Web |
| ui-ux-pro-max | 1 — Web |
| ui-design-workflow | 1 — Web |
| videoforge-pipeline | 2 — Video Engine |
| model-observatory | 2 — Video Engine |
| cost-tracker | 2 — Video Engine |
| winner-studio | 2 — Video Engine |
| remotion-best-practices | 2 — Video Engine (app-local) |
| marketplace-saas | 3 — Marketplace Bot |
| deploy-ops | 4 — Infrastructure |
| monitoring-alerts | 4 — Infrastructure |
| antigravity-automation | 4 — Infrastructure |
| data-integrity | 4 — Infrastructure |
| database-management | 4 — Infrastructure |
| migration-validator | 4 — Infrastructure |
| credential-guardian | 4 — Infrastructure |
| resilience-patterns | 4 — Infrastructure |
| socialhub | 5 — Social & Content |
| whatsapp-waha | 5 — Social & Content + 8 — ClaudeClaw |
| frontdesk-voice | 5 — Social & Content |
| rag-pgvector | 8 — ClaudeClaw |
| notebooklm-hub | 7 — Strategy & Docs |
| api-contracts | 7 — Strategy & Docs |

---

## Cross-Project Communication

- **Runtime**: HTTP APIs + shared PostgreSQL database
- **Development**: Request files in `docs/cross-project-requests/`
- **Never**: Shared code imports across project boundaries
- **Codebase changes from Cowork**: Report to main Claude Code session

---

## Workflow: Cowork + Claude Code

```
┌─────────────────────────────────────────────────┐
│  Claude Cowork (claude.ai)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐ │
│  │ Elite Pro   │  │ ClaudeClaw  │  │ Billing │ │
│  │ project     │  │ project     │  │ backlog │ │
│  └─────────────┘  └─────────────┘  └─────────┘ │
│         │                │               │       │
│         └────────────────┴───────────────┘       │
│                          │                        │
│              "Deploy this / run that"             │
└──────────────────────────┼────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────┐
│  Claude Code CLI (this session)                  │
│  - SSH to RackNerd                               │
│  - DB migrations                                 │
│  - Code changes + rsync deploy                   │
│  - Health checks                                 │
│  - Antigravity orchestration                     │
└─────────────────────────────────────────────────┘
```
