# 💰 Business Model

> **Source of Truth for Rensto's pricing, fulfillment, and products.**

---

## The "Fulfillment Loop"
1.  **Selection**: Users choose an AI service from the [/offers](file:///Users/shaifriedman/New%20Rensto/rensto/apps/web/rensto-site/src/app/offers) or [/marketplace](file:///Users/shaifriedman/New%20Rensto/rensto/apps/web/rensto-site/src/app/marketplace) catalogs.
2.  **Conversion**: Payments processed via Stripe.
3.  **Configuration**: Users provide metadata on `/success` page.
4.  **Initiation**: System creates a `ServiceInstance` in **Firestore** and triggers an **n8n orchestration webhook**.
5.  **Provisioning**: Admins oversee the [Fulfillment Queue](https://www.rensto.com/control/fulfillment).

---

## Pricing Models

| Type | Description |
| :--- | :--- |
| **Product Purchase** | One-time fee for a specific workflow/modkit. |
| **Managed Plans** | Monthly recurring revenue (MRR) for hosting and maintenance. |
| **Service Sprints** | One-time implementation fees (Install/Custom tiers). |

---

## The "Core 7" Products

| Product | ID | Price (Download) |
| :--- | :--- | :--- |
| **YouTube AI Clone** | `5pMi01SwffYB6KeX` | $347 |
| **Floor Plan to Property Tour** | `stj8DmATqe66D9j4` | $397 |
| **AI Calendar Assistant** | `5Fl9WUjYTpodcloJ` | $147 |
| **Meta Ad Library Analyzer** | `8GC371u1uBQ8WLmu` | $197 |
| **Monthly CRO Insights Bot** | `vCxY2DXUZ8vUb30f` | $247 |
| **Call Audio Lead Analyzer** | `U6EZ2iLQ4zCGg31H` | $497 |
| **Celebrity Selfie Video** | `4OYGXXMYeJFfAo6X` | $297 |

---

## Marketplace & Fulfillment Logic

- **Discovery**: User browses `/marketplace`. Products are filtered by tags (e.g., `#n8n`).
- **Purchase**: Handled via Stripe Checkout (`/api/checkout`).
- **Delivery Mechanism**: Automated via n8n. Stripe webhook triggers n8n, which calls `/api/marketplace/downloads` to generate a secure link, then emails it to the user.
