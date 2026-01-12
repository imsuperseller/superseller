# 🏛️ Rensto Pillars: Production Source of Truth

This document serves as the absolute authority on the **Active Production Stack** for each of the 4 Rensto Pillars. If a tool is not listed here as "Active", it is either in development or legacy.

---

## 🏎️ Pillar 1: Lead Machine
**Core Function**: Autonomous lead sourcing, enrichment, and outreach.
**Production Status**: 🟢 **LIVE / PRODUCTION MODE** (Synced & Activated Jan 11, 2026)

| Component | Tool (ACTIVE) | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Outreach Email** | **Microsoft Outlook (Office 365)** | ✅ Active | Replaced Instantly.ai (rejected due to cost). |
| **Outreach SMS** | **Telnyx** | ✅ Active | Primary for automated SMS follow-ups. |
| **Lead Sourcing** | **Apollo.io / Ampleleads.io** | ✅ Active | USA/Global precision + Israeli niche. |
| **Scraping** | **Apify** | ✅ Active | Google Maps and LinkedIn scrapers. |
| **Orchestration** | **n8n (v3 Orchestrator)** | ✅ Active | Workflow ID: `x7GwugG3fzdpuC4f`. |
| **Methods (Upsells)** | **Facebook Group Scraper** | 💎 Premium | Extract leads from private groups. |
| **Methods (Upsells)** | **Warm Outreach Method** | 💎 Premium | Multi-channel (LinkedIn + Email) warmup. |

> [!NOTE]
> See [Pillar 1 Guide](file:///Users/shaifriedman/New%20Rensto/rensto/docs/products/LEAD_MACHINE_GTM.md) for strategy.

> [!IMPORTANT]
> **Instantly.ai** is LEGACY. Do not use or reference in active production paths.

---

## 🎙️ Pillar 2: Autonomous Secretary
**Core Function**: Inbound communications, voice agents, and scheduling.
**Production Status**: 🟢 **LIVE / PRODUCTION MODE** (Hardened & Rebranded Jan 11, 2026)

| Component | Tool (ACTIVE) | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Voice AI** | **Telnyx Voice API** | ✅ Active | Replaced Vapi/Twilio for unified billing/control. |
| **Voice Synthesis** | **ElevenLabs** | ✅ Active | High-fidelity TTS. |
| **WhatsApp Comms** | **WAHA Pro** | ✅ Active | Self-hosted on Racknerd VPS. |
| **Scheduling** | **Rensto AI Agent** | ✅ Active | Replaced TidyCal/Calendly for deeper integration. |
| **Methods (Upsells)** | **COO Growth Agent** | 💎 Premium | Conti v2: Professional high-level follow-ups. |
| **Methods (Upsells)** | **Ops System Manager** | 💎 Premium | Automated internal ops coordination. |

> [!NOTE]
> See [Pillar 2 Deep Dive Guide](file:///Users/shaifriedman/New%20Rensto/rensto/docs/products/PILLAR_2_SECRETARY_GUIDE.md) for full stack details.

---

## 🧠 Pillar 3: Knowledge Engine
**Core Function**: RAG (Retrieval-Augmented Generation) and expert knowledge bots.
**Production Status**: 🟢 **LIVE / PRODUCTION MODE** (Dashboard Interface Added Jan 11, 2026)

| Component | Tool (ACTIVE) | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Graph RAG** | **LightRAG** | ✅ Active | Python-based graph retrieval on port 8020. |
| **Standard RAG** | **Gemini / OpenAI** | ✅ Active | Vector retrieval for smaller contexts. |
| **Primary LLM** | **GPT-4o / Gemini Flash** | ✅ Active | Flash used for high-speed, low-cost ops. |
| **Data Storage** | **n8n Data Tables** | ✅ Active | Primary operational storage. |
| **Methods (Upsells)** | **Finance Agent (Finny)** | 💎 Premium | P&L and Invoice intelligence RAG. |
| **Methods (Upsells)** | **Research Pulse** | 💎 Premium | Automated multi-source web verification. |

> [!NOTE]
> See [Pillar 3 Deep Dive Guide](file:///Users/shaifriedman/New%20Rensto/rensto/docs/products/PILLAR_3_KNOWLEDGE_GUIDE.md) for the "Brain" architecture.

---

## 🎬 Pillar 4: Content Engine
**Core Function**: AI-driven content creation, distribution, and social management.
**Production Status**: 🟢 **LIVE / PRODUCTION MODE** (API Triggers Wired Jan 11, 2026)

| Component | Tool (ACTIVE) | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Video Engine** | **Sora2 / PiAPI** | ✅ Active | High-quality AI video generation. |
| **Research** | **Tavily / FireCrawl** | ✅ Active | Deep web research and clean scraping. |
| **Transcription** | **Gemini Multimodal** | ✅ Active | Handles video and complex PDF/image files. |
| **Methods (Upsells)** | **Smart SEO Blog System** | 💎 Premium | Converts videos to high-ranking articles. |
| **Methods (Upsells)** | **Authority Distribution** | 💎 Premium | Multi-platform auto-posting (X, LI, Meta). |

---

## 🛑 Legacy & Rejected Tools (DO NOT USE)
- **Instantly.ai**: Rejected due to high cost. Use Outlook.
- **Vapi**: Rejected in favor of Telnyx native Voice API.
- **TidyCal**: Replaced by custom AI agents.
- **Airtable**: Replaced by Firestore for core business data.
- **Boost.space**: Replaced by Firestore for metadata.
