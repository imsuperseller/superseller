# 🔌 API Routes Reference

> **Source of Truth for all Next.js API endpoints.**

---

## 🛒 Checkout & Payment

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/checkout` | POST | Generic checkout initiation |
| `/api/payment/create` | POST | Create Stripe payment intent |
| `/api/payment/confirm` | POST | Confirm payment completion |
| `/api/webhooks/stripe` | POST | Stripe webhook receiver |

---

## 📦 Marketplace

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/marketplace/templates` | GET | List available templates |
| `/api/marketplace/[id]` | GET | Get single template details |
| `/api/marketplace/downloads` | POST | Generate secure download token |
| `/api/marketplace/customize` | POST | Submit custom config for template |

---

## ⚙️ Fulfillment

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/fulfillment/initiate` | POST | Create ServiceInstance, trigger n8n |
| `/api/fulfillment/finalize` | POST | Mark service as complete |

**Webhook**: Triggers `N8N_FULFILLMENT_WEBHOOK_URL` (default: `https://n8n.superseller.agency/webhook/fulfillment-orchestrator`)

---

## 🎯 Custom Solutions

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/custom-solutions/checkout` | POST | Custom solution purchase |
| `/api/custom-solutions/intake` | POST | Discovery form submission |
| `/api/proposals/generate` | POST | Generate proposal document |
| `/api/solutions/generate` | POST | Generate solution spec |

---

## 🎫 Support

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/support/create` | POST | Create support ticket |
| `/api/support/list` | GET | List tickets for user |
| `/api/support/update` | PATCH | Update ticket status |

---

## 🔐 Auth

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/auth/logout` | POST | Clear auth session |

---

## 🏥 Health

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health/check` | GET | System health status |
| `/api/webhooks/usage` | POST | Usage tracking webhook |

---

## Stripe Flow Types

The Stripe webhook (`/api/webhooks/stripe`) handles these `metadata.flowType` values:

| flowType | Handler |
| :--- | :--- |
| `marketplace-template` | Creates download token, logs purchase |
| `service-purchase` | Creates/updates client in Firestore |
| `managed-plan` | Provisions subscription with addons |
| `marketplace-install` | Queues for admin installation |
| `marketplace-custom` | Custom configuration flow |
| `ready-solutions` | Industry package purchase |
| `custom-solutions` | Bespoke project initiation |
