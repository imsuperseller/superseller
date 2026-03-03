---
name: feature-spec
description: Write a feature specification using B.L.A.S.T. methodology
---

# Feature Spec

Write a product feature specification following the B.L.A.S.T. methodology and SuperSeller AI conventions.

## B.L.A.S.T. Framework

- **B**lueprint — Define what we're building, why, and the success criteria
- **L**aunch — Implementation plan with phases and dependencies
- **A**udit — Quality checks, testing strategy, edge cases
- **S**ync — Documentation updates, NotebookLM sync, team communication
- **T**rack — Metrics, monitoring, cost tracking

## Spec Template

### 1. Problem Statement
What pain point does this solve? Which customer segment benefits?

### 2. Solution Overview
High-level description. Which product does this belong to?

### 3. Technical Design
- Database changes (Prisma schema + Drizzle schema — must sync both)
- API endpoints (route, method, auth, input/output types)
- Frontend components (if applicable)
- External API integrations

### 4. Implementation Plan
- Phase 1 (MVP): Core functionality
- Phase 2: Polish and edge cases
- Phase 3: Monitoring and optimization

### 5. Cost Impact
- API costs per operation (reference Model Observatory)
- Credit consumption for customers
- Infrastructure costs

### 6. Testing Strategy
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)

### 7. Documentation Updates
- Which NotebookLM notebook to update
- Which SKILL.md files affected
- CLAUDE.md updates needed

## Rules

- Query NotebookLM for existing specs before writing new ones
- Reference DECISIONS.md for any prior decisions on this feature
- Never skip the cost tracking section
