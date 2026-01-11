# n8n Workflow Categorization & Visibility Mapping

Below is the proposed categorization of your current n8n workflows. Once approved, I will apply these as tags in n8n and set the logic in the Frontend/Firebase.

| ID | Workflow Name | Pillar | UI Visibility | Tags to Apply |
| :--- | :--- | :--- | :--- | :--- |
| `4OYGXXMYeJFfAo6X` | 🎬 Celebrity Selfie Movie Sets Generator | Content Engine | Marketplace | `pillar:content`, `ui:marketplace` |
| `5pMi01SwffYB6KeX` | YouTube AI Clone | Knowledge Engine | Marketplace | `pillar:knowledge`, `ui:marketplace` |
| `8GC371u1uBQ8WLmu` | Find Winning Ads Meta Library | Lead Gen | Marketplace | `pillar:lead-gen`, `ui:marketplace` |
| `5Fl9WUjYTpodcloJ` | AI Calendar Agent | Voice AI | Marketplace | `pillar:voice-ai`, `ui:marketplace` |
| `MqMYMeA9U9PEX1cH` | Telnyx Voice AI Agent | Voice AI | Dashboard | `pillar:voice-ai`, `ui:admin-dash` |
| `0Ss043Wge5zasNWy` | Cold Outreach Lead Machine v2 | Lead Gen | Dashboard | `pillar:lead-gen`, `ui:admin-dash`, `ui:customer-dash` |
| `1LWTwUuN6P6uq2Ha` | INT-WHATSAPP-ROUTER-OPTIMIZED | Internal | Admin Dash | `internal`, `ui:admin-dash` |
| `0gU5vRLIcrGhnPA0` | Rensto Master Controller | Internal | Admin Dash | `internal`, `ui:admin-dash` |
| `7zzmIgdAwF8uYESp` | PDF Upload to Gemini (Tax4Us) | Knowledge | Client Dash | `pillar:knowledge`, `ui:customer-dash`, `client:tax4us` |
| `5mObI7a6JbqbmWDa` | Tax4Us Podcast Master v1 | Content | Client Dash | `pillar:content`, `ui:customer-dash`, `client:tax4us` |

---

## 📈 Efficiency Recommendations (Better/Faster/Smarter)

1.  **WhatsApp Router (`1LWTwUuN6P6uq2Ha`)**:
    - **Optimization**: You are hardcoding webhook IDs to session names in a Code node. We should move this to a Firestore lookup (`whatsapp_instances` collection) so you can add new clients via the Admin Dashboard without editing n8n.
    - **Cost**: The Gemini tool is used for RAG and OpenAI for logic. I can refactor this to use **Gemini 1.5 Flash** for both, reducing latency and cost by ~60%.

2.  **Lead Machine (`0Ss043Wge5zasNWy`)**:
    - **Optimization**: Implemented "Batching" for the outreach phase. Currently, it triggers per lead, which is slow and hits rate limits. Moving to a "Wait + Batch" approach will be 5x faster.

3.  **Template Generalization**:
    - **Smarter**: We should use the `MKT-MARKETPLACE-001` workflow to automatically "strip" customer-specific IDs (like the Tax4Us vector store) when a customer buys a template from the marketplace.

---

## 🛑 Security Audit
- No hardcoded API keys found in the top 5 workflows; they are properly using the n8n Credentials system.
- One minor finding: The `query_lightrag` node uses a hardcoded IP `172.245.56.50`. We should change this to `localhost` if n8n is on the same machine, or use a DNS record `lightrag.rensto.com` for better portability.
