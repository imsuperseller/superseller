# Roadmap: Admin Command Center v1.0

## Phase 1: Data Foundation — Project + Audit Models
**Goal:** Create the real database backbone that everything else builds on
**Requirements:** R1.1, R1.2, R1.3, R1.4, R1.5, R1.6, R2.1, R2.2, R2.3
**Scope:** Prisma models (Project, ProjectMilestone, ProjectTask, AuditTemplate, AuditSection, AuditItem, AuditInstance, AuditResponse), CRUD API routes, replace fake Projects API
**Why first:** Every subsequent phase writes to these tables

## Phase 2: Seed Playbooks + Customer Data
**Goal:** Populate the audit system with both playbooks and seed existing customers
**Requirements:** R2.4, R2.5, R2.6, R3.1, R3.2, R7.1, R7.2, R7.3, R7.4, R7.5
**Scope:** Seed script for SuperSeller 130-question audit template, Rensto 140-question playbook, create Project+AuditInstance for UAD/MissParty/ElitePro/Yoram, seed internal projects
**Why second:** Data model exists from Phase 1, now fill it

## Phase 3: CI Pipeline + Code Health
**Goal:** Every push runs tests, results land on admin automatically
**Requirements:** R4.1, R4.2, R4.3, R4.4, R4.5, R4.6
**Scope:** CiRun model, GitHub Actions ci.yml, POST/GET ci-status API, dynamic Mission Control Code Health
**Why third:** First automated data flow into the new Project system

## Phase 4: Multi-Project Portfolio
**Goal:** See all repos and deploys (SuperSeller, Rensto, Yoram, Iron Dome) on admin
**Requirements:** R5.1, R5.2, R5.3, R5.4, R5.5
**Scope:** GitHub API + Vercel API integration, external project cards, portfolio dashboard section
**Why fourth:** Extends Project model with external data sources

## Phase 5: Unified Alert Engine
**Goal:** One alert system — everything routes through it, WhatsApp + admin history
**Requirements:** R6.1, R6.2, R6.3, R6.4, R6.5, R6.6
**Scope:** Merge alert channels, project-linked AlertHistory, CI failure WhatsApp, recovery notifications
**Why fifth:** Requires CI (Phase 3) and portfolio (Phase 4) to be alert sources

## Phase 6: Admin UI + Agent Integration
**Goal:** Projects tab becomes the real command center, agents auto-update it
**Requirements:** R2.5, R2.6, R9.1, R9.2, R9.3
**Scope:** Customer audit UI (view/fill per customer), project CRUD forms, real stats dashboard, agent API contract for programmatic updates
**Why sixth:** All data flows exist, now make the UI comprehensive

## Phase 7: Residue Audit + Cleanup
**Goal:** Clean every doc, config, and memory file of stale references
**Requirements:** R8.1, R8.2, R8.3, R8.4
**Scope:** Scan all docs, cross-check memory, fix contradictions, track as Project on admin
**Why last:** Everything else is built — this is the polish pass
