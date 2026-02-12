# Pillar 2: Autonomous Secretary - Architecture & Setup

## Overview
The **Autonomous Secretary** (formerly Voice AI) is a multi-tenant system designed to handle inbound communication (Voice, WhatsApp) and administrative tasks (Calendar) for Rensto clients.

## Architecture

### 1. Data Model (`secretary_configs` Collection)
Each client has a singleton configuration document in `secretary_configs`.
- **Key Fields**:
  - `clientId` (string): Links to the client.
  - `agentName` (string): The persona name (e.g., "Sarah").
  - `greeting` (string): First message/voice response.
  - `voiceId` (string): ElevenLabs or Telnyx voice ID.
  - `transferNumber` (string): Fallback number for human escalation.
  - `whatsappEnabled` (boolean).

### 2. Frontend (Dashboard)
- **SecretaryTab**: Main interface for logs and configuration.
- **API (`/api/secretary/config`)**: Endpoint for updating the configuration.

### 3. Backend (n8n Workflows)
The n8n system acts as the "Brain". It must be **dynamic**, fetching configuration from Firestore at runtime.

#### The "Universal Router" Workflow
1.  **Trigger**: Webhook from WAHA (WhatsApp) or Telnyx (Voice).
2.  **Identify Client**: 
    - **Voice**: Inbound Call `To` Number -> Lookup `secretary_configs` where `phoneNumber == To`.
    - **WhatsApp**: Webhook ID -> Lookup `secretary_configs` where `n8nWebhookId == ID`.
3.  **Fetch Config**: Get `agentName`, `systemPrompt`, `tools` from PostgreSQL.
4.  **Execute Agent**: Pass these parameters to the LangChain/AI node.

## Setup Instructions for New Clients

1.  **Provision Number**: Buy a number (Telnyx/Twilio).
2.  **Create Config**:
    - Go to Admin Dashboard (or Client Dashboard).
    - Set `phoneNumber` to the new number.
    - Set `agentName` and `greeting`.
3.  **Configure n8n**:
    - Ensure the "Universal Router" is listening.
    - If using WhatsApp, register the session in WAHA and update the `secretary_configs` with the `wahaSessionId`.

## Troubleshooting
- **Agent says wrong name**: Check `secretary_configs` for that client.
- **Calls failing**: Ensure `phoneNumber` in Firestore matches the Telnyx DID exactly (E.164 format).
