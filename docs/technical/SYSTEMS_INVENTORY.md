# Rensto: Master Systems Inventory

This document tracks the status, configuration, and integration health of every system in the Rensto ecosystem.

## 🧱 Core Infrastructure
| System | Usage | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Vercel** | Frontend Hosting (Next.js) | ✅ Active | Primary landing & app site |
| **Firebase** | Backend/DB/Auth | ✅ Active | 9 collections standardized |
| **Racknerd** | VPS Hosting (n8n, WAHA) | ✅ Active | IP: 172.245.56.50 |
| **Cloudflare** | DNS/Security/WAF | 🟡 Auditing | Needs verification of `n8n.` subdomains |
| **Docker** | Containerization | ✅ Active | Managing n8n, WAHA, LightRAG |
| **Rollbar** | Error Monitoring | ❓ Needs Check | Verify event flow from client/n8n |

## 🌐 Local Development Ports
| System | Port | Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **WAHA Pro** | 3000 | Docker | WhatsApp API (RESERVED) |
| **Admin Hub** | 3001 | Next.js | Dedicated Admin Panel |
| **Main Site** | 3002 | Next.js | Landing & User Portal |
| **Marketplace** | 3003 | Next.js | Templates |
| **Browserless** | 3005 | Docker | Headless Chrome |
| **SaaS API** | 5000 | Express | Billing & Tenants |
| **Hyperise** | 5050 | Node.js | Personalization |
| **n8n** | 5678 | Docker | Workflows |
| **LightRAG** | 8020 | Python | Knowledge Engine |

## 🤖 Automations & AI
| System | Usage | Status | Notes |
| :--- | :--- | :--- | :--- |
| **n8n** | Workflow Engine | ✅ Optimized | 100+ workflows tagged |
| **n8n Data Tables** | Local DB for workflows | ✅ Active | Used for lead processing |
| **n8n Community Nodes** | Extended functionality | ✅ Active | WAHA, Telnyx nodes installed |
| **WAHA Pro** | WhatsApp API | ✅ Active | Multi-session router running |
| **Telnyx** | Voice AI Platform | ✅ Fixed | Fixed timeout bug in Hope agent |
| **ElevenLabs** | TTS (Voice Synthesis) | ✅ Active | Optimized for low latency |
| **OpenAI** | LLM Logic | ✅ Active | Moving non-critical to Gemini Flash |
| **Gemini / Google RAG** | Knowledge Retrieval | ✅ Active | Integrated into Router |
| **LightRAG** | Graph-based RAG | ✅ Active | Running on VPS |
| **AssemblyAI** | Transcription | ❓ Replaced? | Likely replaced by Whisper or Gemini |
| **Apify** | Web Scraping / Lead Gen | 🟡 Active | Used in Lead Machine |
| **PiAPI / Kie.ai** | Image/Video Generation | ✅ Active | Content Engine core |

## 💰 Finance & Operations
| System | Usage | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Stripe** | Payments / Subscriptions | 🟡 Testing | Standardizing webhook logic |
| **Invoices** | Billing | 🟡 Testing | Integrated with Stripe/Resend |
| **ESignatures.com** | Contracts API | ❓ Setup | Needs API integration check |
| **PartnerStack** | Affiliate Management | ❓ Setup | Needs attribution verification |
| **Notion** | Knowledge/Internal PM | ❓ Status | Clarify if customer-facing |
| **Outlook** | Email Integration | 🟡 Active | Used for notification workflows |
| **Ampleleads.io** | Lead Sourcing | ✅ Active | Primary source for Israeli leads |

## 📐 Product & UX
| Area | Status | Notes |
| :--- | :--- | :--- |
| **The 4 Pillars** | ✅ Aligned | Lead Gen, Voice AI, Knowledge, Content |
| **Marketplace** | ✅ Optimized | Refined descriptions & feature sets |
| **Customer Journey** | 🟡 Testing | Onboarding flow needs stress test |
| **Business Model** | ✅ Defined | Care plans (Starter, Growth, Scale) |
| **Language (EN/HE)** | ✅ Standardized | Multi-regional landing pages live |

---

## 🛑 Missing / Legacy Cleanup
- **TidyCal**: Removed from UI. (User mentioned: AI Agent replaces this).
- **AndyNoCode**: Likely legacy project management. Reconfirm.
- **Vapi**: Removed from UI/Code. Replaced by Telnyx.
