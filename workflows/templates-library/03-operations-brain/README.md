# 🧠 OPERATIONS BRAIN TEMPLATES

**Purpose**: Admin & Support workflow templates
**Status**: 🚧 In Progress

---

## 📋 PLANNED TEMPLATES

### Function Workflows (do one thing)

| Template | Purpose | Source Workflows | Status |
|----------|---------|------------------|--------|
| `func_rag_search_internal.json` | Search internal knowledge base | PDF Gemini Upload | 🚧 Pending |
| `func_classify_ticket.json` | Classify support tickets automatically | Voice Agent | 🚧 Pending |
| `func_voice_synthesizer.json` | Generate voice audio from text | SALES-WHATSAPP-001 | 🚧 Pending |
| `func_calendar_check.json` | Check calendar availability | INT-INFRA-009 | 🚧 Pending |
| `func_pdf_parser.json` | Extract structured data from PDFs | PDF Gemini Upload | 🚧 Pending |

### Agent Workflows (orchestrate functions)

| Template | Purpose | Status |
|----------|---------|--------|
| `agent_support_triaging.json` | AI Agent that triages support tickets | 🚧 Pending |

---

## 🔄 EXTRACTION SOURCES

These production workflows will be READ (not modified) for patterns:

- **SALES-WHATSAPP-001**: Rensto Voice Agent (Shai AI) (Active)
- **Inbound Voice Agent** (Inactive)
- **INT-INFRA-009**: Calendar Agent (Dom) v1 (Active)
- **PDF and Text File Upload to Google Gemini** (Inactive)
- **INT-INFRA-001**: Server Monitoring Agent (Terry) v1 (Active)
- **WhatsApp Group Polling - Approval Handler** (Active)

---

## 📖 USAGE

See `../IMPLEMENTATION_GUIDE.md` for how to use these templates.

---

## 🔒 SAFETY

All templates are created from extracted patterns.
Production workflows remain **untouched**.

See `../PRODUCTION_WORKFLOW_EXTRACTION_STRATEGY.md` for policy.
