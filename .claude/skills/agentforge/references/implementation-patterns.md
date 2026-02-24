# AgentForge Implementation Patterns (Level 2)

> Loaded when implementing/modifying AgentForge pipeline code, schema, or stage logic.
> For architecture overview and critical rules, see SKILL.md (Level 1).

## Database Models (Add to existing Prisma schema)

```prisma
// --- AgentForge Models (add to existing schema.prisma) ---

enum AFProjectStatus {
  CREATED
  RUNNING
  COMPLETED
  FAILED
}

enum AFStageStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}

model AFProject {
  id            String           @id @default(cuid())
  userId        String
  user          User             @relation(fields: [userId], references: [id])
  name          String
  intakeData    Json             // Full form submission
  status        AFProjectStatus  @default(CREATED)
  currentStage  String?
  totalTokens   Int              @default(0)
  totalCost     Float            @default(0)
  creditsUsed   Int              @default(0)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  stages        AFStageResult[]
  deliverables  AFDeliverable[]

  @@index([userId, createdAt])
  @@index([status])
}

model AFStageResult {
  id           String        @id @default(cuid())
  projectId    String
  project      AFProject     @relation(fields: [projectId], references: [id])
  stageId      String        // discovery, design_analysis, market_research, deliverables
  stageOrder   Int
  status       AFStageStatus @default(PENDING)
  output       String?       @db.Text
  outputJson   Json?
  inputTokens  Int           @default(0)
  outputTokens Int           @default(0)
  model        String?
  durationMs   Int?
  error        String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@unique([projectId, stageId])
  @@index([projectId, stageOrder])
}

model AFDeliverable {
  id         String    @id @default(cuid())
  projectId  String
  project    AFProject @relation(fields: [projectId], references: [id])
  title      String
  content    String    @db.Text  // Markdown report
  format     String    @default("markdown") // markdown, pdf
  metadata   Json?
  createdAt  DateTime  @default(now())

  @@index([projectId])
}
```

## Common Patterns

### Run Pipeline via BullMQ (follows TourReel pattern)
```typescript
import { Queue } from 'bullmq';
import { checkCredits, deductCredits } from '@/lib/credits';
import { UnrecoverableError } from 'bullmq';

const agentforgeQueue = new Queue('agentforge', { connection: redis });

// API route: start pipeline
export async function POST(req: Request) {
  const { userId, intakeData } = await req.json();

  const balance = await checkCredits(userId);
  if (balance < 50) {
    return Response.json({ error: 'Insufficient credits' }, { status: 402 });
  }

  const project = await prisma.aFProject.create({
    data: { userId, name: intakeData.businessName, intakeData, status: 'RUNNING' }
  });

  await agentforgeQueue.add('research-pipeline', { projectId: project.id, userId });
  return Response.json({ projectId: project.id });
}
```

### Call Claude Server-Side (Anthropic SDK)
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

async function runStage(stageId: string, prompt: string, model: string) {
  const response = await anthropic.messages.create({
    model, // 'claude-haiku-4-5-20251001' or 'claude-sonnet-4-6'
    max_tokens: 5000,
    messages: [{ role: 'user', content: prompt }],
    // web_search tool for research stages only
    ...(stageId !== 'deliverables' && {
      tools: [{ type: 'web_search_20250305' }]
    })
  });
  return response;
}
```

### Context Passing Between Stages
```typescript
// Each stage receives previous outputs as context
const stageInputs = {
  discovery: (intake) => intake,
  design_analysis: (intake, prev) => ({ ...intake, discoveryOutput: prev.discovery }),
  market_research: (intake, prev) => ({ ...intake, discoveryOutput: prev.discovery }),
  deliverables: (intake, prev) => ({
    ...intake,
    discoveryOutput: prev.discovery,
    designOutput: prev.design_analysis,
    marketOutput: prev.market_research,
  }),
};
```

## Spec Documents
The original AgentForge specs exist as Word docs in `agentforge/`. These should be converted to markdown or moved to NotebookLM:
- `AgentForge-PRD-v1.docx` — Product requirements (partially superseded by SKILL.md)
- `AgentForge-Prompts-Library-v1.docx` — Prompt templates (most critical — extract prompts from here)
- `AgentForge-UIUX-Spec-v1.docx` — UI design tokens
- `AgentForge-TechArch-v1.docx` — Original architecture (superseded — use SKILL.md instead)
- `AgentForge-EnvDeploy-v1.docx` — Deploy config (superseded — deploys with rensto-site on Vercel)
