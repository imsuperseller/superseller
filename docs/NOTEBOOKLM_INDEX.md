# NotebookLM Index

**Purpose**: Map each NotebookLM notebook ID to its purpose. Use with `notebooklm-mcp` and Stitch MCP (connected to Antigravity) to retrieve context.

| # | Notebook ID | Title | Sources | Purpose | Status |
|---|-------------|-------|---------|---------|--------|
| 1 | 1dc7ce26-2d18-4f46-b421-9d026a57205b | Project Template | 18 | BLAST methodology, agent behavior, reference hierarchy | Active |
| 2 | 3e820274-6839-4921-aa83-ad003dd2fb93 | KIE.AI | 39 | Kie.ai API docs, Kling 3.0 video/Suno music generation | Active |
| 3 | 0baf5f36-7ff0-4550-a878-923dbf59de5c | Zillow-to-Video | 22 | TourReel pipeline spec (canonical) | Active |
| 4 | fc048ba8-12b7-432a-b8d9-65baae62d529 | Master: Automation & Core Infra | 37 | Master domain: Antigravity, n8n, automation workflows | Active |
| 5 | 286f3e4a-a3a2-40ab-9c45-d198e91b27f4 | Google Stitch | 8 | Stitch MCP, design system, Gemini integration | Active |
| 6 | 719854ee-b94e-4555-9b2b-48ae136335b8 | superseller website | 14 | Main site, design, pages, business model | Active |
| 7 | e1acc83c-978f-4601-b98a-d4c4b4b9ff50 | Resources | 6 | General reference resources | Active |
| 8 | cb99e6aa-967f-40d4-9580-c02b3250bc78 | Master: Social Media, Lead Gen & Marketing | 49 | Master domain: Social Media, FB Marketplace, Profiles | Active |
| 9 | 98b120fa-bc5e-466a-a8d2-7a609c044283 | aitable.ai | 9 | Aitable.ai for dashboards/syncs | Active |
| 10 | 0789acdb-2485-43ec-9b4a-6dc227fcaead | WAHA Pro | 14 | WAHA browser automation, WhatsApp API | Active |
| 11 | f54f121b-97b1-45b2-8a05-156d1c8ad3f7 | Apify | 23 | Apify scraping, actors | Active |
| 12 | b906e69f-7b8c-4e31-88b8-4939c830604c | Claude Code | 9 | Claude Code / Cursor integration, agent behavior | Active |
| 13 | e109bcb2-d29e-44d5-bd4a-f67b88929be6 | mivnim (yossi laham) | 37 | Client project (Mivnim/Yossi Laham) | Active |
| 14 | 44494df5-e465-4ed7-bcc7-41898fe8e396 | Mastering Claude Code | 4 | AntiGravity workflows, local Ollama setup | Active |
| 15 | 382e5982-ef37-4fe8-bbc0-e16abfd4b755 | Instagram | 7 | Instagram platform reference | Active |
| 16 | e419bca1-17d8-4edf-a1ac-ff1d37cd67ea | Israeli Expatriates in Dallas | 1 | Community forum reference | Active |
| 17 | f0747c8b-1dd1-4451-8a02-9b1231c82dac | prd template | 5 | PRD, launch strategy, gap analysis | **LEGACY** |
| 18 | 8a655666-0728-4144-8c81-46b7ea6e0e48 | ~~fal.ai~~ | 3 | REMOVED — fully replaced by Kie.ai Kling 3.0 | **DEPRECATED** |
| 19 | f39b9a6b-5225-4287-a591-7a99b601dae3 | higgsfield.ai | 18 | Higgsfield.ai video AI | **DEPRECATED** |
| 20 | 8ace0529-3819-4325-8013-d7127f3053bc | tiktok | 0 | TikTok platform (empty) | **EMPTY** |

**URL Format**: `https://notebooklm.google.com/notebook/{ID}`

**MCP Integration**: NotebookLM and Stitch MCP servers are connected to Antigravity. Use `source_get_content` to extract key modules as Markdown to save tokens.

**Workflow catalog**: See `docs/n8n/N8N_WORKFLOWS_CATALOG.md` for grouping of N8n workflows notebook sources.
