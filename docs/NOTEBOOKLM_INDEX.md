# NotebookLM Index

**Purpose**: Map each NotebookLM notebook ID to its purpose. Use with `notebooklm-mcp` and Stitch MCP (connected to Antigravity) to retrieve context.

| # | Notebook ID | Title | Purpose |
|---|-------------|-------|---------|
| 1 | 5811a372-2d18-4f46-b421-9d026a57205b | Project Template | Starting template for new projects |
| 2 | 3e820274-6839-4921-aa83-ad003dd2fb93 | KIE.AI | Kie.ai API docs, video/music generation |
| 3 | 0baf5f36-7ff0-4550-a878-923dbf59de5c | Zillow-to-Video | TourReel / real estate video pipeline |
| 4 | fc048ba8-12b7-432a-b8d9-65baae62d529 | N8n workflows | Workflow catalog (Rensto, marketplace, customer) |
| 5 | 286f3e4a-a3a2-40ab-9c45-d198e91b27f4 | Google Stitch | Stitch MCP, Gemini integration |
| 6 | 12c80d7d-9baa-4b86-a6b0-b434f41aba37 | Antigravity | Antigravity platform, MCP, automation |
| 7 | f360003f-eebb-4085-a141-72fe7909c6db | n8n rensto | n8n platform patterns, MCP, skills, B.L.A.S.T. |
| 8 | 719854ee-b94e-4555-9b2b-48ae136335b8 | rensto website | Main site, design, pages |
| 9 | e1acc83c-978f-4601-b98a-d4c4b4b9ff50 | Resources | General reference resources |
| 10 | 743744d5-2c3e-4070-a2fe-20db34506789 | Marketplace Listing Engine | FB Marketplace Lister, productization |
| 11 | 98b120fa-bc5e-466a-a8d2-7a609c044283 | aitable.ai | Aitable.ai for dashboards/syncs |
| 12 | 0789acdb-2485-43ec-9b4a-6dc227fcaead | WAHA Pro | WAHA browser automation |
| 13 | f54f121b-97b1-45b2-8a05-156d1c8ad3f7 | Apify | Apify scraping, actors |
| 14 | 8a655666-0728-4144-8c81-46b7ea6e0e48 | fal.ai | fal.ai API, image/video generation |
| 15 | cb99e6aa-967f-40d4-9580-c02b3250bc78 | shai social | *(Personal — Facebook profile)* |
| 16 | f39b9a6b-5225-4287-a591-7a99b601dae3 | higgsfield.ai | Higgsfield.ai video AI |
| 17 | b906e69f-7b8c-4e31-88b8-4939c830604c | Claude Code | Claude Code / Cursor integration |

**URL Format**: `https://notebooklm.google.com/notebook/{ID}`

**MCP Integration**: NotebookLM and Stitch MCP servers are connected to Antigravity. Use `source_get_content` to extract key modules as Markdown to save tokens.

**Workflow catalog**: See `docs/n8n/N8N_WORKFLOWS_CATALOG.md` for grouping of N8n workflows notebook sources.
