# Rensto Inbound Lead Funnel (PRD)

Strategic design for converting social media attention into qualified high-ticket leads using "Call to Action" (CTA) automation.

## Funnel Architecture

### Entry Point: Social DM
- **Trigger**: User comments a keyword (e.g., "SOLVE", "LEADS", "SECRETARY") on any short-form post.
- **Automation**: ManyChat / Instagram DM triggers an automated qualifying flow.

### The Qualification Flow (LLM Guided)
1. **Initial Greeting**: "Glad you saw the [Pillar] demo! Quick question to see if we're a fit: What's your business's current ARR?"
2. **Segmentation**:
    - **< $2M**: Push to **Marketplace** (Self-service templates).
    - **$2M - $10M**: The "Sweet Spot". Push to **Discovery Call**.
    - **> $10M**: High-Ticket Custom. Push to **Whale Onboarding**.

### Lead Scoring & CRM Integration
- All leads from DM flows are pushed to the **Rensto Master CRM** (n8n + PostgreSQL `leads` table).
- n8n analyzes the business niche and drafts a "Personalized Problem-Solver" response for Shai to review.

## Revenue Loops
- **The "Free Taste"**: Lead Machine Free Trial (10 leads) as the primary lead magnet in social content.
- **The "High-Ticket"**: Secretary AI / Knowledge Engine bundles as the backend sale.

## Technical Requirements
- ManyChat API Integration.
- n8n Webhook for DM data ingestion.
- PostgreSQL `leads` table updates.
