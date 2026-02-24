---
name: socialhub
description: >-
  SocialHub — multi-platform social media management with AI content creation for Rensto.
  Covers content generation (Claude + Kie.ai), multi-platform publishing (FB, IG, LinkedIn,
  X, TikTok, YouTube), approval workflows, analytics, competitive intelligence, and smart
  scheduling. Phase 2 product — spec complete, code NOT started. Use when working on SocialHub,
  social media automation, content distribution, or multi-platform publishing.
  Not for FB Marketplace bot (see marketplace-saas), video pipeline, or general website.
  Example: "Scaffold the SocialHub app" or "Implement the content approval workflow".
autoTrigger:
  - "SocialHub"
  - "social media"
  - "content distribution"
  - "multi-platform"
  - "social publishing"
  - "content calendar"
  - "social inbox"
  - "engagement"
  - "social app"
negativeTrigger:
  - "FB Marketplace"
  - "marketplace bot"
  - "video pipeline"
  - "TourReel"
  - "Winner Studio"
  - "landing page"
  - "admin portal"
---

# SocialHub (Phase 2 — Spec Complete, Code Not Started)

## Critical
- **Spec exists, code does NOT** — 7 spec docs, 23 DB tables defined, 45+ API endpoints planned.
- **Phase 2 priority** — Build AFTER existing products (Winner Studio, TourReel, FB Bot) are validated.
- **Architecture**: A.N.T. 3-layer (SOPs → Navigation → Tools). Self-contained app at `apps/socialhub/`.
- **Auth**: Reuse existing (WhatsApp OTP + magic-link), NOT Clerk. Decision made.
- **Database**: New tables in existing PostgreSQL (not a separate DB).
- **Worker**: BullMQ on RackNerd (alongside tourreel-worker).
- **Content distribution layer for ALL products**: Winner Studio videos, TourReel videos, Lead Pages traffic.

## Strategic Role

```
Winner Studio → finished video → SocialHub → distribute to FB/IG/LinkedIn/YouTube
TourReel     → property video  → SocialHub → realtor's social channels
Lead Pages   → landing page    → SocialHub → organic social drives traffic
FB Bot       → Marketplace     ← separate (SocialHub = organic social)
```

## Planned Architecture

```
apps/socialhub/           (Next.js app, like apps/studio/)
├── src/
│   ├── app/api/          (45+ API endpoints)
│   ├── lib/              (services, clients)
│   └── types/
├── architecture/         (SOPs in markdown)
├── tools/                (atomic execution scripts)
└── scripts/              (DB migrations)
```

## Planned Features

### 1. Content Creation (3 modes)
- **AI-generated**: Claude Sonnet/Haiku + Kie.ai for media
- **Manual**: User creates content directly
- **Hybrid**: AI assists manual creation

### 2. Approval Workflow
- WhatsApp approval loop (WAHA Pro)
- 2-level approval (owner + manager)
- Real-time notifications

### 3. Multi-Platform Publishing
- Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube
- Platform-specific formatting (aspect ratios, character limits)
- Unified posting queue

### 4. Analytics Engine
- Engagement metrics (likes, comments, shares)
- Post performance tracking
- Competitor scraping (Apify)

### 5. Competitive Intelligence
- Meta Ad Library winning ads
- Competitor content analysis

### 6. Social Inbox
- Unified comments across platforms
- AI-suggested replies (Claude)

### 7. Smart Scheduling
- Optimal posting time calculation
- Engagement data-driven scheduling

### 8. SEO Module
- Hashtag recommendations
- Content optimization

## Planned Database Tables (23)

| Table | Purpose |
|-------|---------|
| SocialPost | Published posts |
| ContentDraft | Work-in-progress content |
| ApprovalRequest | Workflow items |
| PlatformAccount | Connected social accounts (OAuth) |
| EngagementMetric | Analytics data |
| CompetitorAd | Competitor content |
| SocialComment | Comment tracking |
| PostSchedule | Scheduling queue |
| + 15 more | Supporting tables |

## Planned API Endpoints (45+)

### Content
- `POST /api/social/content/create` — AI content generation
- `POST /api/social/content/draft` — Manual draft
- `POST /api/social/content/approve` — Approval workflow

### Publishing
- `POST /api/social/publish` — Multi-platform publish
- `POST /api/social/schedule` — Schedule posts

### Analytics
- `GET /api/social/analytics/posts` — Post metrics
- `GET /api/social/analytics/engagement` — Engagement trends
- `GET /api/social/analytics/competitor` — Competitor analysis

### Platform Management
- `POST /api/social/accounts/connect` — OAuth integration
- `GET /api/social/accounts` — Connected accounts

### Inbox
- `GET /api/social/comments` — Unified comments
- `POST /api/social/replies/suggest` — AI reply suggestions

## Planned SaaS Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 1 org, 3 posts/month, 1 platform |
| Pro | $49/mo | 3 orgs, 50 posts, 4 platforms, smart scheduling |
| Business | $199/mo | Unlimited, all platforms, competitive intelligence |

## Planned BullMQ Workers (15+)

- Content generation (Claude)
- Media generation (Kie.ai / Sora 2)
- Platform publishing
- Engagement scraping
- Competitor analysis
- Schedule optimization
- Analytics aggregation

## Implementation Order (When Started)

1. Scaffold `apps/socialhub/` (Next.js)
2. Migrate DB schema from spec to Prisma
3. Build content creation pipeline first
4. Add single-platform publishing (Facebook)
5. Add approval workflow (WhatsApp)
6. Expand to multi-platform
7. Add analytics
8. Add competitive intelligence

## Spec Documents

| File | Purpose |
|------|---------|
| `social app/CLAUDE.md` | Architecture overview (48 lines) |
| `social app/gemini.md` | AI content generation spec |
| `social app/architecture/` | SOP definitions |
| `social app/tools/` | Tool scripts |

## References

- NotebookLM cb99e6aa — Social Media, Lead Gen & Marketing (50 sources)
- NotebookLM 382e5982 — Instagram (7 sources)
- NotebookLM 8ace0529 — TikTok
- NotebookLM f540f799 — Sora 2 (media generation)
- `PRODUCT_STATUS.md` lines 308-345 — Phase 2 status
