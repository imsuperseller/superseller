# 🧠 Pillar 3: Knowledge Engine - Deep Dive

The **Knowledge Engine** is the "Brain" of the SuperSeller AI ecosystem. It powers all RAG (Retrieval-Augmented Generation) capabilities, ensuring that AI responses are grounded in verified data, documents, and web research rather than hallucinations.

## 🛠️ The Production Component Stack

### 1. LightRAG (The "Deep Brain")
- **Tech**: Python-based Graph RAG.
- **Location**: Self-hosted on VPS port `8020`.
- **Status**: ✅ Active.
- **Function**: Used for complex, interconnected knowledge where relationships between data points matter (e.g., business logic, multi-document research).
- **Trigger**: Called via the `query_lightrag` tool node in n8n.

### 2. Gemini File Search (The "Fast Brain")
- **Active Workflow**: Integrated into `INT-WHATSAPP-ROUTER-OPTIMIZED` ([1LWTwUuN6P6uq2Ha](https://n8n.superseller.agency/workflow/1LWTwUuN6P6uq2Ha)).
- **Tech**: Google Gemini Multimodal + File API Search Store.
- **Function**: Rapidly searches through uploaded PDF/TXT files. Best for "Ctrl+F" style lookups on specific documents.
- **Input**: Managed via the "Upload Files to Gemini" form in the dashboard.

### 3. Specialized Knowledge Bots
- **YouTube AI Clone** ([5pMi01SwffYB6KeX](https://n8n.superseller.agency/workflow/5pMi01SwffYB6KeX)): Extracts "wisdom" from video content for reprocessing.
- **CRO Insights Bot** ([vCxY2DXUZ8vUb30f](https://n8n.superseller.agency/workflow/vCxY2DXUZ8vUb30f)): Specialized in web-research for Conversion Rate Optimization.

---

## 🔍 How to find "Latest" Workflows
As requested, looking at the `updatedAt` timestamps in n8n confirms:
- **`INT-WHATSAPP-ROUTER-OPTIMIZED` (Jan 2, 2026)** is the current gold standard for RAG integration.
- **`RENSTO MASTER CONTROLLER` (Jan 9, 2026)** is the orchestrator that provisions these knowledge nodes for clients.

---

## 🛑 Legacy & Rejected Tools
- **PDF Sales Agent (Old Vector Store)** ([2IupcJdCKDv4LcoE](https://n8n.superseller.agency/workflow/2IupcJdCKDv4LcoE)): Inactive. Replaced by the Gemini/LightRAG combo for better accuracy.
