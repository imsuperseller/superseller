# n8n Setup Guide for Dynamic Secretary

To enable the "Autonomous Secretary" to handle multiple clients dynamically, you need to update your **WhatsApp Router** workflow.

## The Problem
Currently, the "Detect WAHA Session" node has hardcoded IDs mapped to specific clients in the JavaScript code.

## The Solution
We have created a new API endpoint (`/api/secretary/lookup`) that n8n can call to get the correct configuration automatically.

## Integration Steps

1.  **Open n8n** and locate your **"INT-WHATSAPP-ROUTER"** workflow.
2.  **Delete** the "Detect WAHA Session" Code node.
3.  **Add an HTTP Request Node** in its place (after the Trigger).
    *   **Method**: `GET`
    *   **URL**: `https://superseller.agency/api/secretary/lookup` (or `http://host.docker.internal:3002/api/secretary/lookup` for local testing)
    *   **Query Parameters**:
        *   Name: `webhookId`
        *   Value: `{{ $json.webhookId }}`
4.  **Update the Output**:
    *   The API will return `{ found: true, config: { agentName: '...', ... } }`.
    *   Pass this `config` object to your AI Agent node.

## Example Config to Test
If you are testing locally, you can use the default SuperSeller AI webhook ID:
`webhookId` = `556f1aab-220c-4281-90b8-0570465d50b1`

This will ensure your routing is always in sync with the Dashboard settings!
