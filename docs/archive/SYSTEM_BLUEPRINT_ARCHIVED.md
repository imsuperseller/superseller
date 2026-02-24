# 🗺️ Rensto Universal System Blueprint

This document serves as the **Single Source of Truth** for the Rensto ecosystem infrastructure, port mapping, and routing.

## 🏗️ Core Infrastructure & Services

| Service | Technology | Port (Dev) | Domain (Prod) | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **WAHA Pro** | Docker / Go | **3000** | `waha.rensto.com` | WhatsApp Gateway (REST API) |
| **Admin Hub** | Next.js (15) | **3001** | `admin.rensto.com` | Dedicated Administrative Dashboard |
| **Main Site** | Next.js (16) | **3002** | `rensto.com` | Primary Website & User Portal |
| **Marketplace** | Next.js (14) | **3003** | `market.rensto.com` | Automation Template Marketplace |
| **SaaS API** | Express.js | **5000** | `api.rensto.com` | Micro-SaaS Tenant & Billing Logic |
| **Browserless** | Docker | **3005** | `browserless.rensto.com` | Headless Chrome Service |
| **Hyperise** | Node.js | **5050** | `hyperise.rensto.com` | Image/Video Personalization |
| **n8n** | Docker / Node | **5678** | `n8n.rensto.com` | Workflow Automation Engine |
| **Gateway** | Cloudflare | **8787** | `gateway.rensto.com` | Edge Router & Tenant Registry |
| **LightRAG** | Python | **8020** | `rag.rensto.com` | Knowledge Retrieval Agent |

## 🗄️ Database Layer

| Database | Technology | Port | Access | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **PostgreSQL** | Postgres 15 | **5432** | Internal | Primary Relational Data |
| **Redis** | Redis 7 | **6379** | Internal | Cache, Tasks & Idempotency |
| **MongoDB** | Mongo 6/7 | **27017** | External | High-volume Metadata & Logs |
| **Firestore** | Firebase | Cloud | SDK | Real-time Config & User State |

## 🛠️ Port Conflict Resolution Checklist

- [x] **WAHA Pro (3000)**: Reserved exclusively for WhatsApp API.
- [x] **Rensto Site (3002)**: Updated from default 3000 to prevent WAHA collisions.
- [x] **SaaS API (5000)**: Standardized to port 5000 (Prevents 3000/3001 conflict).
- [x] **Marketplace (3003)**: Updated from default 3000.
- [x] **Admin Dashboard (3001)**: Verified and set as the canonical admin entry point.
- [x] **Browserless (3005)**: Set to avoid port 3000 conflict.

---
> [!IMPORTANT]
> **Developer Note**: Always use `npm run dev:port` or specific port flags to maintain this organization. Do not run any service on port 3000 except for WAHA.
