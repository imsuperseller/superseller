# CLAUDE.md — Social App (A.N.T. Architecture)

> **Read this file first.** It specifies the absolute ground truth for the Social App as dictated by NotebookLM and the B.L.A.S.T. Master System Protocol.

## Paradigm
This project is an **Agentic AI System** using the **A.N.T. 3-Layer Architecture**. It relies on deterministic Python scripts and LLM reasoning loops rather than a traditional Next.js/Express web application stack.

## File Structure

```plaintext
social app/
├── gemini.md          # Project Constitution: Data schemas, behavioral rules, state tracking
├── .env               # API Keys and secrets
├── .env.master        # Master centralized credentials (do not commit)
├── architecture/      # Layer 1: SOPs (The "How-To" Markdown files)
├── tools/             # Layer 3: Python Scripts (The "Engines")
└── .tmp/              # Temporary Workbench (ephemeral intermediate data/logs)
```

## The A.N.T. Layers

1.  **Layer 1: Architecture (`architecture/`)**
    Contains Technical Standard Operating Procedures (SOPs) written in Markdown. These define the goals, inputs, tool logic, and handling of edge cases.
2.  **Layer 2: Navigation (Decision Making)**
    The reasoning layer (acted out by the AI/Agent acting on the context). It routes data between SOPs and tools. It calls execution tools in the correct order rather than performing complex tasks itself.
3.  **Layer 3: Tools (`tools/`)**
    Atomic, testable, deterministic Python scripts.

## B.L.A.S.T. Protocol Workflow
1.  **Blueprint:** Define the goal in `gemini.md` and `architecture/SOP.md`.
2.  **Link:** Connect necessary credentials (`.env`) and external APIs.
3.  **Architect:** Write the Layer 1 logic.
4.  **Stylize:** Build out the structural outputs.
5.  **Trigger:** Execute the Python scripts in `tools/`.

## Memory Files (Must be maintained during runs)
- `task_plan.md`: Phases, goals, and checklists.
- `findings.md`: Research, discoveries, and constraints.
- `progress.md`: Logs of actions taken, errors, tests, and results.

## External Tooling Integrations
-  **Sora 2 Pro Storyboard API** (kie.ai)
-  **Apify Scrapers** (Instagram Reel, Facebook Posts via MCP)
-  **Content Repurposing Engine** workflows.

## Rule
Absolutely **no Web SaaS framework code** (Next.js, Vite, Express) belongs in this directory, as per the NotebookLM single source of truth.
