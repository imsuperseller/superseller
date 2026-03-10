# Project 2: Video Engine (VideoForge + Remotion)

> **Role**: Video pipeline — VideoForge AI videos, Remotion photo composition, Kling AI clips, FFmpeg, BullMQ workers, model selection.
> **Authority**: SOLE owner of Drizzle schema and worker code.

---

## File Ownership

### CAN edit (this project OWNS these files)
```
apps/worker/**
apps/worker-packages/**
```

### CANNOT edit (owned by other projects)
```
apps/web/superseller-site/**      → Project 1 (Web)
apps/studio/**                    → Project 1 (Web)
fb marketplace lister/**          → Project 3 (Marketplace Bot)
platforms/marketplace/**          → Project 3 (Marketplace Bot)
infra/**                          → Project 4 (Infrastructure)
scripts/**                        → Project 4 (Infrastructure)
tools/**                          → Project 4 (Infrastructure)
.env*                             → Project 4 (Infrastructure)
docs/**                           → Project 7 (Strategy & Docs)
brain.md, CLAUDE.md, *.md (root)  → Project 7 (Strategy & Docs)
```

### CAN read (for reference, but never modify)
- `apps/web/superseller-site/prisma/schema.prisma` — Prisma schema (for shared table awareness)
- `apps/web/superseller-site/src/lib/credits.ts` — web credit logic
- `docs/REMOTION_BIBLE.md` — Remotion reference
- All root `.md` files

---

## Assigned Skills
- videoforge-pipeline
- model-observatory
- cost-tracker
- winner-studio

> **Note**: `remotion-best-practices` skill exists at `apps/worker/.agents/skills/remotion-best-practices/` (app-local, not in `.claude/skills/`). This project owns it but it's not in the global skill registry.

---

## Key Files
| Resource | Path |
|----------|------|
| Drizzle Schema | `apps/worker-packages/db/src/schema.ts` |
| Worker Entry | `apps/worker/src/index.ts` |
| Video Pipeline Worker | `apps/worker/src/queue/workers/video-pipeline.worker.ts` |
| Remotion Renderer | `apps/worker/src/services/remotion-renderer.ts` |
| Remotion Compositions | `apps/worker/remotion/` |
| Model Selector | `apps/worker/src/services/model-selector.ts` |
| Credits Service | `apps/worker/src/services/credits.ts` |
| Kie.ai Service | `apps/worker/src/services/kie.ts` |
| FFmpeg Service | `apps/worker/src/services/ffmpeg.ts` |
| R2 Storage | `apps/worker/src/services/r2.ts` |
| Gemini Service | `apps/worker/src/services/gemini.ts` |
| Config | `apps/worker/src/config.ts` |
| BullMQ Connection | `apps/worker/src/queue/connection.ts` |
| Deploy Script | `apps/worker/deploy-to-racknerd.sh` |

---

## Build / Test / Deploy

```bash
# Development
cd apps/worker
npm run dev              # tsx watch src/index.ts (local port 3001)

# Build
npm run build            # tsc

# Deploy to RackNerd
./apps/worker/deploy-to-racknerd.sh
# OR manual:
rsync -avz --exclude node_modules apps/worker/ root@172.245.56.50:/opt/tourreel-worker/apps/worker/

# Health check
curl -s http://172.245.56.50:3002/api/health
```

---

## Cross-Project Rules

1. **Drizzle schema**: This project owns Drizzle schema. User table is shared (must stay in sync with Prisma). Job and Clip are Drizzle-only. After Prisma changes to User by Project 1, sync Drizzle here.
2. **Schema requests**: If you need new Prisma tables/columns, create `docs/cross-project-requests/schema-request-*.md` for Project 1.
3. **Cost tracking**: MANDATORY — every API generation MUST call `trackExpense()`. Rates: Kling Pro $0.10, Std $0.03, Suno $0.06, Nano $0.09, Gemini $0.001.
4. **Pre-deploy trace**: Before deploying to RackNerd, trace the data flow through every changed code path. Document the trace before deploying.
5. **Credit burn**: If changes touch any path calling Kie.ai/Kling/Suno/Recraft/Nano, confirm with user before deploying.

---

## Database
- **ORM**: Drizzle
- **Connection**: Same `DATABASE_URL` as web → PostgreSQL on RackNerd
- **Shared table**: User (exists in both Prisma and Drizzle — must stay in sync)
- **Drizzle-only tables**: Job, Clip — these do NOT exist in Prisma. This project owns them exclusively.
- **Worker-only concerns**: BullMQ job queues (Redis), R2 storage, video artifacts

## Dual-Path Pipeline
1. **Kling AI clips**: AI-generated cinematic clips ($0.10/clip Pro, $0.03/clip Std)
2. **Remotion compositions**: Zero-cost photo compositions (Ken Burns, transitions, branding)
   - 19 components, 14 compositions (5 types × 2 ratios + 4 property ratios)
   - Components: KenBurns, IntroCard, OutroCard, RoomLabel, VideoSlide, SceneOverlay, PhoneMockup, LaptopMockup, ProductDemoScene + 5 shared

## URLs
| Service | URL |
|---------|-----|
| Worker Health | http://172.245.56.50:3002/api/health |
| RackNerd SSH | root@172.245.56.50 |
