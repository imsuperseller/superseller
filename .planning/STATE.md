# State: Universal Customer Onboarding System

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-13)

**Core value:** Every customer gets an AI agent in a WhatsApp group from Day 1 — product-aware, zero friction
**Current focus:** Phase 1 — Universal Group + Product-Aware Agent

## Current Phase

**Phase:** 1 — Universal Group + Product-Aware Agent
**Status:** Planning
**Plans:** Creating now

## Phase History

(None — project just initialized and scope corrected)

## Blockers

None identified.

## Notes

- Admin project ID: `cmmpgo3k60000h5zuaxfqac80`
- DB foundation already built (CharacterBible, PipelineRun, TenantAsset tables)
- WAHA client has full group management capabilities
- Group agent framework exists and is production-tested
- ServiceInstance + Subscription tables track customer's products (no enums — string types)
- Sora 2 accessed via Kie.ai API (NOT fal.ai): `POST /v1/jobs/createTask` with `model: "sora-2-pro-text-to-video"`
- Old `character-pipeline/group-bootstrap.ts` exists but is too narrow — Phase 1 replaces it with universal `onboarding/group-bootstrap.ts`

---
*Last updated: 2026-03-13 — scope corrected to universal onboarding*
