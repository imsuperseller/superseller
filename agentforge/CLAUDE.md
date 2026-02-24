# CLAUDE.md — AgentForge Project Instructions

> **Read this file completely before writing any code.**
> This is the master instruction file for building AgentForge, an autonomous AI-powered web development agent platform.

---

## Project Overview

AgentForge is a Next.js web application that automates the research, design, architecture, and code generation phases of web development projects. A user submits a client intake form, and the system runs a 6-stage AI pipeline (powered by Claude API with web search) that produces research reports, design specs, architecture plans, and production-ready starter code.

**Owner:** SuperSeller Agency (rensto.com)
**Primary User:** Agency developer (solo operator handling multiple client projects)
**Core Value Prop:** Turn a 15-40 hour manual research+development process into a 3-5 minute automated pipeline

---

## Reference Documents

The following companion documents contain the detailed specifications. **Read the relevant document before implementing each section:**

| Document | Contents | Read Before |
|----------|----------|-------------|
| `docs/PRD-v1.docx` | Product requirements, pipeline design, roadmap, success criteria | Starting the project |
| `docs/TechArch-v1.docx` | System architecture, data flows, API specs, database design | Any backend or architecture work |
| `docs/Prompts-Library-v1.docx` | All 6 stage prompts with system/user templates, variables, output schemas | Implementing pipeline stages |
| `docs/UIUX-Spec-v1.docx` | Design tokens, component specs, page wireframes, Tailwind config | Any frontend or UI work |
| `docs/Environment-Deployment.docx` | Setup guide, env vars, CI/CD, hosting config | Setup and deployment |
| `prisma/schema.prisma` | Complete database schema | Database work |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x+ |
| Language | TypeScript (strict mode) | 5.x |
| UI Components | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.x |
| Database | PostgreSQL via Supabase or Neon | - |
| ORM | Prisma | latest |
| Auth | NextAuth.js (credentials provider) | 4.x |
| AI | Anthropic Claude API | claude-sonnet-4-20250514 |
| File Storage | Cloudflare R2 (Phase 2) | - |
| Deployment | Vercel | - |

---

## Project Structure

```
agentforge/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/              # Main app layout group
│   │   ├── layout.tsx            # Sidebar + header layout
│   │   ├── page.tsx              # Dashboard home
│   │   ├── projects/
│   │   │   ├── page.tsx          # Project list
│   │   │   ├── new/page.tsx      # Intake form
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Pipeline view
│   │   │       └── deliverables/
│   │   │           └── page.tsx  # Deliverables panel
│   │   ├── clients/
│   │   │   ├── page.tsx          # Client directory
│   │   │   └── [id]/page.tsx     # Client detail
│   │   └── settings/
│   │       └── page.tsx          # App settings
│   ├── api/                      # API route handlers
│   │   ├── projects/
│   │   │   ├── route.ts          # GET list, POST create
│   │   │   └── [id]/
│   │   │       ├── route.ts      # GET detail, PATCH update
│   │   │       ├── restart/route.ts
│   │   │       └── deliverables/route.ts
│   │   ├── pipeline/
│   │   │   ├── start/route.ts    # POST trigger pipeline
│   │   │   └── stream/route.ts   # GET SSE endpoint
│   │   ├── clients/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   └── layout.tsx                # Root layout
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives
│   ├── forms/
│   │   └── IntakeForm.tsx
│   ├── pipeline/
│   │   ├── StageProgress.tsx
│   │   ├── StageResultViewer.tsx
│   │   └── PipelineTimer.tsx
│   ├── deliverables/
│   │   ├── DeliverablesPanel.tsx
│   │   ├── CodeViewer.tsx
│   │   └── MarkdownViewer.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── PageContainer.tsx
├── lib/                          # Core business logic
│   ├── pipeline/                 # Pipeline engine
│   │   ├── orchestrator.ts       # Main pipeline runner
│   │   ├── stage-executor.ts     # Individual stage runner
│   │   ├── context-builder.ts    # Builds context from prev stages
│   │   ├── event-emitter.ts      # SSE event management
│   │   └── stages/               # Stage definitions
│   │       ├── index.ts
│   │       ├── discovery.ts
│   │       ├── design-analysis.ts
│   │       ├── market-research.ts
│   │       ├── architecture.ts
│   │       ├── code-generation.ts
│   │       └── deliverables.ts
│   ├── ai/                       # AI service layer
│   │   ├── claude-client.ts      # Anthropic API wrapper
│   │   ├── prompt-manager.ts     # Load/version prompts
│   │   └── web-search.ts         # Search result parsing
│   ├── db/                       # Database layer
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── queries/              # Query functions
│   │       ├── projects.ts
│   │       ├── pipeline-runs.ts
│   │       ├── stage-results.ts
│   │       └── clients.ts
│   ├── storage/                  # File storage (Phase 2)
│   │   └── r2-client.ts
│   └── utils/
│       ├── constants.ts
│       ├── types.ts              # Global TypeScript types
│       └── validation.ts         # Zod schemas
├── prompts/                      # Default prompt templates
│   ├── discovery.md
│   ├── design-analysis.md
│   ├── market-research.md
│   ├── architecture.md
│   ├── code-generation.md
│   └── deliverables.md
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/
├── docs/                         # Reference documents
│   ├── PRD-v1.docx
│   ├── TechArch-v1.docx
│   ├── Prompts-Library-v1.docx
│   ├── UIUX-Spec-v1.docx
│   └── Environment-Deployment.docx
├── public/
├── .env.example
├── CLAUDE.md                     # This file
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Coding Standards

### TypeScript
- **Strict mode enabled** — no `any` types, no type assertions unless absolutely necessary
- **Prefer interfaces** over type aliases for object shapes
- **Zod for validation** — all API inputs validated with Zod schemas in `lib/utils/validation.ts`
- **Exhaustive switch** — all enums handled with exhaustive switch statements

### Naming Conventions
```
PascalCase    → Components, interfaces, types, enums
camelCase     → Functions, variables, props, file names (non-components)
UPPER_SNAKE   → Constants, env vars
kebab-case    → CSS classes, file names in app/ directory
```

### Component Conventions
```tsx
// Every component follows this structure:
// FILE: components/[category]/ComponentName.tsx

'use client'; // Only if client-side interactivity needed

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // All props typed, required first, optional last
  title: string;
  onAction: (id: string) => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function ComponentName({
  title,
  onAction,
  className,
  variant = 'default',
}: ComponentNameProps) {
  // Hooks first
  const [state, setState] = useState(false);

  // Handlers
  const handleClick = () => { /* ... */ };

  // Render
  return (
    <div className={cn('base-classes', className)}>
      {/* JSX */}
    </div>
  );
}
```

### Import Order
```tsx
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { z } from 'zod';

// 3. UI components (shadcn)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Custom components
import { StageProgress } from '@/components/pipeline/StageProgress';

// 5. Lib/utils
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/utils/types';
```

### File Rules
- **One component per file** (except small helper sub-components)
- **No default exports** — use named exports everywhere
- **`'use client'` only when needed** — server components by default
- **No `console.log`** in production code — use a logger utility or remove
- **No `// TODO` without a linked issue** — if something is incomplete, note it with `// TODO(phase-2): description`

---

## Design System Quick Reference

> Full spec in `docs/UIUX-Spec-v1.docx`. Use the Tailwind config from Section 5 of that document.

### Colors (most used)
```
Background:     bg-bg-base (#0A0A0F)    bg-bg-surface (#12121A)
Accent:         text-accent-primary (#F59E0B)   bg-accent-primary
Text:           text-text-primary (#E2E2E2)     text-text-secondary (#9CA3AF)
Feedback:       text-feedback-success (#10B981)  text-feedback-error (#EF4444)
Border:         border-border (#2A2A3C)
```

### Typography
```
Hero:     font-display text-display font-extrabold  (Outfit 42px 800)
H1:       font-display text-h1 font-bold             (Outfit 30px 700)
H2:       font-display text-h2 font-bold             (Outfit 24px 700)
Body:     font-body text-body                         (Outfit 14px 400)
Label:    font-mono text-label font-semibold uppercase tracking-wider
Code:     font-mono text-body-sm                      (JetBrains Mono 13px)
```

### Common Patterns
```tsx
// Card
<div className="bg-bg-surface border border-border rounded-xl p-6">

// Primary button
<Button className="bg-gradient-to-r from-accent-primary to-accent-secondary text-white font-bold">

// Input field
<Input className="bg-bg-muted border-border text-text-primary placeholder:text-text-tertiary" />

// Status badge (running)
<Badge className="bg-feedback-warning/15 text-feedback-warning border-feedback-warning/30 animate-pulse">

// Page section
<section className="py-12 px-6 max-w-7xl mx-auto">
```

---

## Pipeline Engine Implementation

> Full spec in `docs/TechArch-v1.docx` Section 3. Prompts in `docs/Prompts-Library-v1.docx`.

### Architecture Overview

```
POST /api/projects (create project)
  → POST /api/pipeline/start (trigger pipeline)
    → PipelineOrchestrator.runPipeline(projectId)
      → for each stage in [discovery, design, market, arch, code, deliverables]:
          → StageExecutor.execute(stage, context)
            → ContextBuilder.build(stage, previousResults)
            → PromptManager.getPrompt(stage.id)
            → ClaudeClient.call(systemPrompt, userPrompt, tools)
            → validate output with stage.outputSchema
            → persist to stage_results table
            → EventEmitter.emit('stage:complete', result)
      → package deliverables
      → EventEmitter.emit('pipeline:complete')
```

### Stage Execution Rules

1. **Sequential only** — stages run one after another, never in parallel
2. **Persist before advancing** — every stage result saved to DB before next stage starts
3. **Retry on failure** — max 3 retries with exponential backoff (2s, 4s, 8s)
4. **Context budget** — ContextBuilder must respect token limits per stage (see Prompts Library doc)
5. **SSE updates** — every state change emits an event to connected clients

### Claude API Call Pattern

```typescript
// lib/ai/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ClaudeCallOptions {
  systemPrompt: string;
  userMessage: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Anthropic.Tool[];
}

export async function callClaude(options: ClaudeCallOptions) {
  const {
    systemPrompt,
    userMessage,
    model = 'claude-sonnet-4-20250514',
    maxTokens = 4000,
    temperature = 0.3,
    tools = [],
  } = options;

  const toolsConfig = tools.length > 0 ? tools : [
    { type: 'web_search_20250305' as const, name: 'web_search' as const }
  ];

  // Only include tools for research stages
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    tools: tools.length > 0 ? toolsConfig : undefined,
    messages: [{ role: 'user', content: userMessage }],
  });

  // Extract text from response
  const textContent = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('\n\n');

  return {
    text: textContent,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    stopReason: response.stop_reason,
  };
}
```

### SSE Implementation Pattern

```typescript
// app/api/pipeline/stream/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get('runId');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Register this connection with the event emitter
      const unsubscribe = pipelineEvents.subscribe(runId!, (event) => {
        send(event.type, event.data);
        if (event.type === 'pipeline:complete' || event.type === 'pipeline:error') {
          controller.close();
        }
      });

      // Keep-alive every 15s
      const keepAlive = setInterval(() => {
        try { send('ping', { timestamp: Date.now() }); }
        catch { clearInterval(keepAlive); }
      }, 15000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(keepAlive);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Prompt Variable Injection

```typescript
// lib/ai/prompt-manager.ts
export function injectVariables(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(
    /\{\{(\w+)\}\}/g,
    (match, key) => variables[key] ?? match
  );
}

// Variables available per stage:
// Stage 2 (discovery):       All intake form fields
// Stage 3 (design_analysis): Intake + {{discoveryOutput}}
// Stage 4 (market_research): Intake + {{discoveryOutput}}
// Stage 5 (architecture):    Intake + {{discoveryOutput}} + {{designOutput}} + {{marketOutput}}
// Stage 6 (code_generation): Intake + {{discoveryOutput}} + {{designOutput}} + {{architectureOutput}}
// Stage 7 (deliverables):    All previous outputs (summarized to fit context)
```

---

## Database

> Full schema in `prisma/schema.prisma`. Entity relationships in `docs/TechArch-v1.docx` Section 7.

### Key Tables
- **users** — Auth accounts
- **clients** — Client directory (auto-created from intake)
- **projects** — Project records with intake data (JSON)
- **pipeline_runs** — Execution tracking per project
- **stage_results** — Individual stage outputs with token usage
- **deliverables** — Generated files with download URLs
- **prompt_templates** — Versioned prompts per stage

### Prisma Client Singleton

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## API Routes

> Full spec in `docs/TechArch-v1.docx` Section 6.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/projects` | POST | Create project from intake form, optionally auto-start pipeline |
| `/api/projects` | GET | List projects with pagination (page, limit, status filters) |
| `/api/projects/[id]` | GET | Full project detail with latest pipeline run and stage results |
| `/api/projects/[id]` | PATCH | Update project metadata |
| `/api/projects/[id]/restart` | POST | Restart pipeline from a specific stage |
| `/api/projects/[id]/deliverables` | GET | Get all deliverable content and download links |
| `/api/pipeline/start` | POST | Trigger pipeline for a project (body: { projectId, fromStage? }) |
| `/api/pipeline/stream` | GET | SSE endpoint for real-time progress (query: runId) |
| `/api/clients` | GET/POST | Client CRUD |
| `/api/health` | GET | Health check (returns { status: 'ok', timestamp }) |

### API Response Pattern

```typescript
// Success
return NextResponse.json({ data: result }, { status: 200 });

// Created
return NextResponse.json({ data: created }, { status: 201 });

// Validation error
return NextResponse.json(
  { error: 'Validation failed', details: zodErrors },
  { status: 400 }
);

// Not found
return NextResponse.json(
  { error: 'Project not found' },
  { status: 404 }
);

// Server error
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
);
```

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...          # Claude API key
DATABASE_URL=postgresql://...          # PostgreSQL connection string
NEXTAUTH_SECRET=...                    # Random 32+ char secret
NEXTAUTH_URL=http://localhost:3000     # App base URL

# Optional (Phase 2)
R2_ACCESS_KEY_ID=...                   # Cloudflare R2
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=agentforge-deliverables
R2_ENDPOINT=https://...r2.cloudflarestorage.com
VERCEL_TOKEN=...                       # For auto-deployment
```

---

## Development Workflow

### Getting Started
```bash
# 1. Clone and install
git clone <repo>
cd agentforge
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY, DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Set up database
npx prisma generate
npx prisma db push   # Development: push schema directly
# npx prisma migrate dev  # Production: use migrations

# 4. Seed defaults (prompt templates)
npx prisma db seed

# 5. Run dev server
npm run dev
```

### Build Order (Recommended Implementation Sequence)

**Phase 1: Foundation (Days 1-2)**
1. Initialize Next.js project with TypeScript, Tailwind, shadcn/ui
2. Copy `tailwind.config.ts` from UIUX Spec document Section 5
3. Copy `globals.css` from UIUX Spec document Section 6
4. Set up Prisma with the provided `schema.prisma`
5. Implement auth with NextAuth.js (credentials provider)
6. Create the dashboard layout (Sidebar + Header + PageContainer)

**Phase 2: Data Layer (Days 3-4)**
7. Implement database query functions in `lib/db/queries/`
8. Create API routes for projects CRUD
9. Create API route for clients CRUD
10. Set up Zod validation schemas in `lib/utils/validation.ts`

**Phase 3: Pipeline Engine (Days 5-8)**
11. Implement `lib/ai/claude-client.ts` (Anthropic API wrapper)
12. Implement `lib/ai/prompt-manager.ts` (template loading + variable injection)
13. Create prompt template files in `prompts/` (copy from Prompts Library doc)
14. Implement `lib/pipeline/context-builder.ts`
15. Implement `lib/pipeline/stage-executor.ts`
16. Implement `lib/pipeline/event-emitter.ts` (SSE)
17. Implement `lib/pipeline/orchestrator.ts` (main runner)
18. Create all 6 stage definitions in `lib/pipeline/stages/`
19. Create pipeline API routes (start, stream)

**Phase 4: UI Pages (Days 9-12)**
20. Dashboard home page (stats cards + project list)
21. New project page (IntakeForm component)
22. Pipeline view page (StageProgress + StageResultViewer + PipelineTimer)
23. Deliverables page (DeliverablesPanel + CodeViewer + MarkdownViewer)
24. Client directory page
25. Settings page

**Phase 5: Polish (Days 13-14)**
26. Loading states (skeletons) for all pages
27. Error handling and error boundaries
28. Empty states for all pages
29. Mobile responsive testing and fixes
30. End-to-end testing with a real client brief

---

## Key Implementation Notes

### Pipeline is the core — get it right first
The pipeline engine (`lib/pipeline/`) is the most critical code. Build and test it in isolation before connecting the UI. Use a simple test script:
```typescript
// scripts/test-pipeline.ts
import { PipelineOrchestrator } from '@/lib/pipeline/orchestrator';

const testIntake = {
  clientName: 'Test Client',
  businessName: 'Test Plumbing Co',
  businessType: 'local',
  serviceType: 'website',
  description: 'Local plumbing company needs a professional website',
  // ... rest of fields
};

const result = await PipelineOrchestrator.runPipeline(testIntake);
console.log(result);
```

### SSE must be reliable
The SSE connection is what makes the pipeline view feel real-time. Key requirements:
- Auto-reconnect on disconnect (client-side EventSource with retry)
- Keep-alive pings every 15 seconds
- Graceful cleanup when client navigates away
- Buffer events if client reconnects mid-pipeline

### Context window management is critical
Later pipeline stages receive outputs from earlier stages. The ContextBuilder MUST:
- Respect token budgets per stage (see Prompts Library doc Section 4)
- Prioritize concrete data (hex codes, URLs, font names) over prose
- Truncate intelligently — keep first and last sections, summarize middle
- Never exceed the model's context window

### Prompt templates are the product
The quality of AgentForge's output is 100% dependent on prompt quality. Prompts should be:
- Stored as markdown files in `prompts/` (with YAML frontmatter)
- Loaded by PromptManager at runtime
- Overridable from the database (for A/B testing)
- Versioned (every change gets a new version number)

### Generated code must use real content
The most common failure mode is the code generation stage producing Lorem Ipsum or placeholder content. The prompt explicitly tells Claude to use real business data from the discovery stage. If outputs contain placeholders, the prompt needs to be strengthened.

---

## Testing

### Manual Testing Checklist
- [ ] Create a project with all required fields → project saved to DB
- [ ] Create a project with missing required fields → validation error shown
- [ ] Start pipeline → SSE connection established, stages progress in order
- [ ] Each stage produces non-empty output → results visible in stage viewer
- [ ] Pipeline completes → all 6 stages show green checkmarks
- [ ] Deliverables panel shows 4 tabs with content → copy/download work
- [ ] Restart pipeline from Stage 4 → stages 4-6 re-run, 1-3 preserved
- [ ] Navigate away during pipeline → SSE reconnects on return
- [ ] Mobile responsive → sidebar collapses, forms stack, pipeline readable
- [ ] API error handling → graceful error messages, retry options

### Pipeline Quality Checklist
- [ ] Discovery stage finds real business information (not hallucinated)
- [ ] Design stage provides specific hex codes and font names
- [ ] Market stage includes real competitor URLs
- [ ] Architecture stage lists every component with file paths
- [ ] Code generation produces complete files (no placeholders)
- [ ] Code uses real business content from discovery
- [ ] Deliverables include actionable next steps

---

## Common Pitfalls

1. **Don't hardcode prompts in stage files** — always load from `prompts/` via PromptManager
2. **Don't skip Zod validation on API inputs** — every POST/PATCH must validate
3. **Don't use `any` types** — define proper interfaces in `lib/utils/types.ts`
4. **Don't forget `'use client'`** — components with useState/useEffect need it
5. **Don't use CSS modules or inline styles** — Tailwind only, use `cn()` for conditionals
6. **Don't make Claude API calls from client-side** — all AI calls go through API routes
7. **Don't forget error boundaries** — wrap pipeline view in an error boundary
8. **Don't skip the loading states** — every async data fetch needs a skeleton
9. **Don't use `console.log` for debugging** — use a structured logger
10. **Don't commit `.env.local`** — it's in `.gitignore`, use `.env.example` for documentation

---

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint check
npm run type-check   # TypeScript strict check (tsc --noEmit)
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema to database (dev)
npx prisma migrate dev --name <name>  # Create migration (production)
npx prisma studio    # Open Prisma Studio (database GUI)
```
