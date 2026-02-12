# 🛠️ Technical Stack

> **Source of Truth for Rensto's infrastructure and architecture.**

---

## Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS + "Neon/Dark" Custom Theme
- **State**: React Server Components + Client Hooks

---

## Backend & Data
- **API Routes**: Next.js Edge & Node.js API Routes
- **Database (Primary)**: **PostgreSQL + Redis** (migration from Firestore complete Feb 2026)
- **Auth**: Firebase Auth (specialized flows)
- **LLM**: OpenAI (GPT-4o), Gemini

---

## Infrastructure
- **Web Hosting**: Vercel
- **n8n / Databases**: Self-hosted on Racknerd VPS (172.245.56.50)
- **Comms**: Resend (Transactional Email), Microsoft Outlook (Outreach Email), Stripe (Payments), Telnyx (Voice/SMS), WAHA (WhatsApp)

---

## Key Directories

| Path | Purpose |
| :--- | :--- |
| `/src/app/control` | **The Admin Command Center**. Fulfillment Queue and metrics. |
| `/src/app/app` | Internal dashboard for logged-in users. |
| `/src/app/dashboard` | Public-facing client portal. |
| `/src/app/api/fulfillment` | Core logic for initiating service orders. |
| `/src/components/ui` | Uses `*-enhanced` components for premium aesthetics. |

---

## Middleware & Automation
- **Engine**: n8n (hosted on Racknerd).
- **Routing**: Multi-Customer Router handles incoming webhooks/messages.
- **Agents**: AI Agents run as classes in Next.js or workflows in n8n.
