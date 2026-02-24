# Project Constitution (gemini.md)

## Goal
The Social App acts as an autonomous, multi-tenant agentic pipeline governing social media content lifecycles via the A.N.T. Architecture.

## Behavior Rules
1. Agents must exclusively rely on deterministic Python scripts stored in `tools/` for execution.
2. Complex decision-making occurs in the LLM navigation layer guided by SOPs in `architecture/`.
3. Intermediate artifacts and temporary execution states go to `.tmp/`.

## Core Data Entities
- **Content Origin:** Sourced via Apify scrapers or NotebookLM integrations.
- **Transformation:** Passed to generative tools (e.g., Sora 2 Pro / Runway via kie.ai, Claude for copy).
- **Delivery:** Transmitted to social endpoints.
