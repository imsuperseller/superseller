# ⚙️ Operations & Processes

> **Source of Truth for day-to-day workflows and SOPs.**

---

## Key Operational Systems

| System | Purpose | URL |
| :--- | :--- | :--- |
| **Firestore** | Primary database for leads, customers, service instances. | Firebase Console |
| **n8n** | Workflow automation engine. | https://n8n.rensto.com |
| **Vercel** | Frontend hosting. | https://vercel.com/rensto |
| **Stripe** | Payments. | https://dashboard.stripe.com |
| **Resend** | Transactional email. | https://resend.com |

---

## Fulfillment Process

1.  **Purchase**: Stripe webhook fires.
2.  **Lead Creation**: API creates `ServiceInstance` in Firestore.
3.  **Notification**: n8n notifies admin via Slack/email.
4.  **Queue**: Appears in Admin Fulfillment Queue (`/control/fulfillment`).
5.  **Delivery**: Admin completes setup, marks as fulfilled.

---

## Daily Admin Tasks

- [ ] Check Fulfillment Queue for pending orders.
- [ ] Review n8n workflow execution logs for errors.
- [ ] Respond to support emails within 24 hours.

---

## Weekly Admin Tasks

- [ ] Review Stripe for failed payments.
- [ ] Audit Firestore for orphaned records.
- [ ] Check analytics for traffic/conversion trends.
