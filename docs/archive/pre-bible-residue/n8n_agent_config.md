# Autonomous Care Plan Agent - Configuration & Logic

**Version**: 1.0.0 (Dec 2025)
**Status**: Integrated (Ready for n8n workflow mapping)

## Overview
The Autonomous Care Plan Agent is designed to diagnose and patch n8n workflow errors for high-tier Rensto customers. It operates on a "Human-in-the-Loop" (HITL) model, where the AI proposes a fix, and a human admin approves it before deployment.

## Technical Stack
- **Web Frontend**: Next.js (Dashboard & Magic Button)
- **Persistence**: Firestore (`SUPPORT_CASES` collection)
- **Reasoning**: Perplexity AI (Sonar Reasoning models)
- **Knowledge Base**: Gemini (RAG over n8n documentation and Rensto internal guides)
- **Workflow Engine**: n8n

## Data Flow
1. **Trigger**: Customer clicks the "Magic Button" in the dashboard.
2. **Context Capture**: The button captures:
   - `customerId`
   - `workflowId` (if available)
   - Recent execution errors from the `USAGE_LOGS` or provided by the client.
3. **Ingestion**: `/api/support/create` stores the case in Firestore and triggers the n8n webhook (`N8N_SUPPORT_AGENT_WEBHOOK_URL`).
4. **Research Phase**:
   - The n8n agent queries **Perplexity Sonar** with the error message and workflow context.
   - It performs a RAG search against the **Gemini Knowledge Base** (including `llms.txt` and internal n8n guides).
5. **Reasoning Phase**:
   - The agent documents its findings in the `aiReasoningLog` field in Firestore.
   - It identifies the root cause (e.g., "Expired Application Password", "Mismatched Schema").
6. **Patch Generation**:
   - The agent generates a JSON diff or code snippet to fix the issue.
   - It simulates a test result (marked as `testResult: pass/fail`).
7. **Approval Loop**:
   - The case status moves to `awaiting_approval`.
   - The admin views the case in the **Admin Dashboard Support Queue**.
   - Admin clicks "Approve & Deploy", which updates Firestore status to `resolved` and (optionally) triggers a final deployment workflow in n8n.

## AI Prompt Patterns

### Perplexity Sonar Prompt
```text
Analyze the following n8n workflow error for customer {{customerId}}:
Workflow: {{workflowId}}
Error: {{errorMessage}}
Context: {{workflowJson}}

Using your knowledge of the n8n node ecosystem and the Rensto Care Plan standards ($X97 pricing, Care Plan terminology), identify:
1. The likely root cause.
2. A technical patch (JSON or Javascript).
3. Verification steps.
```

## Maintenance & Monitoring
- **Max Attempts**: The agent is limited to 3 autonomous attempts before escalating to a human (Status: `escalated`).
- **Logs**: All reasoning steps are streamed to Firestore for client transparency.
