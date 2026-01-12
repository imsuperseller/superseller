# 🎙️ Pillar 2: Autonomous Secretary - Deep Dive

The **Autonomous Secretary** is Rensto's inbound operations engine. It is designed to act as a 24/7 front-desk, handling voice calls, WhatsApp queries, and calendar scheduling without human intervention.

## 🛠️ The Production Component Stack

### 1. Inbound Voice Agent (The "Front Desk")
- **Active Workflow**: `TELNYX-VOICE-AI-002: Premium Rensto Voice Agent` ([MqMYMeA9U9PEX1cH](https://n8n.rensto.com/workflow/MqMYMeA9U9PEX1cH))
- **Tech**: Telnyx Voice API + OpenAI GPT-4o + ElevenLabs TTS.
- **Function**: Answers inbound calls, handles context-aware conversations, and can transfer to a human if needed.
- **Primary Data**: `VOICE_CALL_LOGS` collection in Firestore.

### 2. WhatsApp Multi-Agent Router
- **Active Workflow**: `INT-WHATSAPP-ROUTER-OPTIMIZED: Multi-Customer AI Agent` ([1LWTwUuN6P6uq2Ha](https://n8n.rensto.com/workflow/1LWTwUuN6P6uq2Ha))
- **Tech**: WAHA Pro + Google Gemini Flash.
- **Function**: Routes messages from WhatsApp to specific customer contexts. It uses a "Human-in-Loop" fallback if the AI is unsure.
- **Agent Integration**: Connects directly to the **Knowledge Engine (Pillar 3)** for answering technical questions.

### 3. AI Calendar Assistant
- **Active Workflow**: `AI Calendar Assistant` ([5Fl9WUjYTpodcloJ](https://n8n.rensto.com/workflow/5Fl9WUjYTpodcloJ))
- **Tech**: Custom n8n scheduling logic.
- **Function**: Replaced TidyCal/Calendly. It manages the actual "booking" event, checking availability and sending confirmation links via WhatsApp/SMS.

---

## 📅 Status as of Jan 11, 2026
- **Readiness**: ✅ Production Ready.
- **Gaps**: Missing a unified "Secretary Dashboard Config" in the web UI (currently being refactored in `VoiceTab.tsx`).
- **Legacy Tools**: Vapi (Replaced by Telnyx), TidyCal (Replaced by Custom AI).

> [!TIP]
> This pillar is the primary "Lead Nurturer". While the Lead Machine (Pillar 1) finds the leads, the Secretary (Pillar 2) qualifies them and puts them on the calendar.
