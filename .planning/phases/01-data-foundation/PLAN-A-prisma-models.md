---
wave: 1
depends_on: []
files_modified:
  - apps/web/superseller-site/prisma/schema.prisma
autonomous: true
requirements: [R1.1, R1.2, R1.3, R2.1, R2.2, R2.3]
---

# Plan A: Prisma Models — Project + Audit System

## Objective
Add 8 new Prisma models to the schema: `Project`, `ProjectMilestone`, `ProjectTask`, `AuditTemplate`, `AuditSection`, `AuditItem`, `AuditInstance`, `AuditResponse`. Also add optional `projectId` FK to `ServiceInstance` and `WhatsAppInstance` to link existing SaaS provisioning records to projects.

Run `prisma db push` (not `migrate`) to apply — consistent with how the existing schema is managed (no migration files in the repo for the main tables).

## Tasks

<task id="1">
Open `/Users/shaifriedman/superseller/apps/web/superseller-site/prisma/schema.prisma`.

Append the following models at the end of the file, after all existing models.

**Project model** (R1.1):
```prisma
/// A tracked unit of work — internal project, customer engagement, infra initiative, or external repo/site.
model Project {
  id              String    @id @default(cuid())
  name            String
  description     String?
  /// internal | customer | infrastructure | external
  type            String    @default("internal")
  /// planning | in_progress | verification | completed | blocked
  status          String    @default("planning")
  /// 0–100
  progress        Int       @default(0)
  /// business pillar label (e.g. "Marketplace", "VideoForge", "Infrastructure")
  pillar          String?
  owner           String?
  githubRepo      String?
  vercelProjectId String?
  startDate       DateTime?
  dueDate         DateTime?
  /// Free-form JSON for external IDs, tags, or phase-specific metadata
  metadata        Json?
  outlookEventId  String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @default(now()) @updatedAt

  milestones      ProjectMilestone[]
  tasks           ProjectTask[]
  auditInstances  AuditInstance[]
  serviceInstances ServiceInstance[]
  whatsAppInstances WhatsAppInstance[]

  @@index([type])
  @@index([status])
}
```

**ProjectMilestone model** (R1.2):
```prisma
/// A named checkpoint within a Project.
model ProjectMilestone {
  id        String    @id @default(cuid())
  projectId String
  title     String
  dueDate   DateTime?
  /// pending | complete | overdue
  status    String    @default("pending")
  order     Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @default(now()) @updatedAt

  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}
```

**ProjectTask model** (R1.3):
```prisma
/// An actionable task within a Project.
model ProjectTask {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  description String?
  /// todo | in_progress | done | blocked
  status      String   @default("todo")
  assignee    String?
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @default(now()) @updatedAt

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
}
```

**AuditTemplate model** (R2.1):
```prisma
/// Defines a reusable playbook — e.g. "SuperSeller New Business Audit" or "Rensto City Launch".
model AuditTemplate {
  id          String         @id @default(cuid())
  name        String
  description String?
  version     String         @default("1.0")
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @default(now()) @updatedAt

  sections    AuditSection[]
  instances   AuditInstance[]
}
```

**AuditSection model** (R2.1):
```prisma
/// A section within an AuditTemplate (e.g., "Business Fundamentals").
model AuditSection {
  id         String      @id @default(cuid())
  templateId String
  title      String
  order      Int         @default(0)
  createdAt  DateTime    @default(now())

  template   AuditTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  items      AuditItem[]

  @@index([templateId])
}
```

**AuditItem model** (R2.1):
```prisma
/// A single question or checklist item within an AuditSection.
model AuditItem {
  id          String       @id @default(cuid())
  sectionId   String
  question    String
  /// Freeform hint to help the responder answer
  hint        String?
  /// Optional: maps to a SuperSeller product for auto-suggest (Phase 6+)
  productTag  String?
  order       Int          @default(0)
  createdAt   DateTime     @default(now())

  section     AuditSection @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  responses   AuditResponse[]

  @@index([sectionId])
}
```

**AuditInstance model** (R2.2):
```prisma
/// One run of an AuditTemplate for a specific Project/customer.
model AuditInstance {
  id         String        @id @default(cuid())
  templateId String
  projectId  String?
  /// Label for this engagement (e.g. "UAD Onboarding — March 2026")
  label      String?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @default(now()) @updatedAt

  template   AuditTemplate  @relation(fields: [templateId], references: [id])
  project    Project?       @relation(fields: [projectId], references: [id])
  responses  AuditResponse[]

  @@index([templateId])
  @@index([projectId])
}
```

**AuditResponse model** (R2.3):
```prisma
/// One answer to one AuditItem within an AuditInstance.
model AuditResponse {
  id         String        @id @default(cuid())
  instanceId String
  itemId     String
  /// pending | complete | na
  status     String        @default("pending")
  answer     String?
  notes      String?
  updatedAt  DateTime      @default(now()) @updatedAt

  instance   AuditInstance @relation(fields: [instanceId], references: [id], onDelete: Cascade)
  item       AuditItem     @relation(fields: [itemId], references: [id])

  @@unique([instanceId, itemId])
  @@index([instanceId])
}
```
</task>

<task id="2">
Add optional `projectId` FK to `ServiceInstance` and `WhatsAppInstance` models so existing SaaS provisioning records can be linked to Project records without breaking existing data.

In the `ServiceInstance` model block, add:
```prisma
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
```

In the `WhatsAppInstance` model block, add:
```prisma
  projectId   String?
  project     Project? @relation(fields: [projectId], references: [id])
```

These fields are optional — no data migration needed, existing rows get `NULL`.
</task>

<task id="3">
From the repo root, run:
```bash
cd /Users/shaifriedman/superseller/apps/web/superseller-site && npx prisma db push
```

This pushes all new models to the live PostgreSQL database. Confirm the output shows the new tables were created without errors.
</task>

<task id="4">
Run Prisma client generation so TypeScript types are available to the API routes:
```bash
cd /Users/shaifriedman/superseller/apps/web/superseller-site && npx prisma generate
```
</task>

## Verification
- [ ] `npx prisma db push` exits 0 with no errors
- [ ] `npx prisma generate` exits 0 with no errors
- [ ] Running `psql $DATABASE_URL -c "\dt"` (or equivalent) shows the 8 new tables: `Project`, `ProjectMilestone`, `ProjectTask`, `AuditTemplate`, `AuditSection`, `AuditItem`, `AuditInstance`, `AuditResponse`
- [ ] `ServiceInstance` and `WhatsAppInstance` tables now have nullable `projectId` column (check via `\d "ServiceInstance"`)

## must_haves
- All 8 new models exist in the database with correct columns, FKs, and indexes
- `ServiceInstance.projectId` and `WhatsAppInstance.projectId` are nullable columns (existing rows unaffected)
- Prisma client is regenerated — TypeScript types are available for Plan B and Plan C
- No existing tables or columns were dropped or altered (schema is additive only)
