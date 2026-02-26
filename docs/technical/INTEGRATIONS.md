# 🔗 Integrations & APIs

> **Source of Truth for external services SuperSeller AI uses.**

---

## Active Integrations

| Service | Purpose | Access |
| :--- | :--- | :--- |
| **PostgreSQL + Redis** | Primary database. | Connection strings in env. |
| **Firebase/Firestore** | Legacy database (migration complete Feb 2026). | Admin SDK. |
| **Stripe** | Payments. | API Key in env. |
| **OpenAI** | LLM (GPT-4o). | API Key in env. |
| **Telnyx** | Voice/SMS. | API Key in env. |
| **WAHA** | WhatsApp. | Self-hosted on VPS. |
| **Resend** | Transactional Email. | API Key in env. |
| **Microsoft Outlook** | Outreach Email. | OAuth via n8n. |
| **Apify** | Web scraping (LinkedIn, Google Maps). | API Key. |
| **ElevenLabs** | Voice synthesis. | API Key. |

---

## n8n MCP Servers (6 Active)

1. n8n
2. Stripe
3. TidyCal
4. Supabase
5. Shadcn
6. Context7

---

## Legacy / Archived Services (For Reference)

- **Instantly.ai**: Replaced by Microsoft Outlook (rejected due to cost).
- **Airtable**: Replaced by Firestore for core data.
- **Boost.space**: Replaced by Firestore for infrastructure metadata.
- **Typeform**: Replaced by native Lead Qualification workflows.
- **Notion**: Replaced by centralized MD docs/Firestore.

---

## VPS Infrastructure

- **IP**: 172.245.56.50 (n8n.superseller.agency)
- **Services**: n8n, WAHA, LightRAG.
