# 🔄 Firebase Workflow Documentation

**Created**: January 4, 2026
**Purpose**: Source of truth for all workflows - what exists, where, and their status

---

## 🎯 The Problem This Solves

Currently:
- Workflows are scattered across codebase, n8n, and Firebase
- No single source of truth for what's active vs archived
- Frontend doesn't know what to display where
- Unclear which workflows belong to SuperSeller AI vs customers

**Solution**: Firebase `templates` collection as the single source of truth.

---

## 📋 Marketplace Templates (Firebase `templates` Collection)

These are the 7 core marketplace products that appear on superseller.agency/marketplace:

| ID | Name | Category | Price | Status |
| :--- | :--- | :--- | :--- | :--- |
| `4OYGXXMYeJFfAo6X` | Celebrity Selfie Video Generator | Creative Content | $297 | ✅ Active |
| `8GC371u1uBQ8WLmu` | Meta Ad Library Analyzer | Lead & Sales | $197 | ✅ Active |
| `5pMi01SwffYB6KeX` | YouTube AI Clone | Knowledge & Research | $347 | ✅ Active |
| `U6EZ2iLQ4zCGg31H` | Call Audio Lead Analyzer | Lead & Sales | $497 | ✅ Active |
| `5Fl9WUjYTpodcloJ` | AI Calendar Assistant | Operations | $147 | ✅ Active |
| `stj8DmATqe66D9j4` | Floor Plan to Property Tour | Creative Content | $397 | ✅ Active |
| `vCxY2DXUZ8vUb30f` | Monthly CRO Insights Bot | Knowledge & Research | $247 | ✅ Active |

---

## 🏢 Core Products (Offers Page)

These map to workflows but are sold as bundles:

| Product | Price | Workflow(s) Used | Department |
| :--- | :--- | :--- | :--- |
| **Automation Audit** | $497 | N/A (Service) | `internal_ops` |
| **The Lead Machine** | $1,297 | INT-LEAD-001, Call Audio Analyzer, Meta Ad Analyzer | `lead_machine` |
| **Autonomous Secretary** | $497 | AI Calendar Assistant | `autonomous_secretary` |
| **Knowledge Engine** | $1,497 | YouTube AI Clone, CRO Insights | `knowledge_engine` |
| **Content Engine** | $1,497 | Celebrity Selfie, Floor Plan Tour | `content_engine` |
| **Full Ecosystem** | $5,497 | All of above | All |

---

## 📁 Workflow File Categories

### Internal Operations (INT-*)
| File | Purpose | Status |
| :--- | :--- | :--- |
| `INT-WHATSAPP-SUPPORT-001-*.json` | WhatsApp support bot (many versions) | ⚠️ Needs audit |
| `INT-WHATSAPP-ROUTER-001.json` | WhatsApp message routing | ⚠️ Needs audit |
| `INT-CUSTOMER-002-*.json` | Customer project sync | ❓ Unknown |
| `INT-VPS-001-*.json` | VPS management | ❓ Unknown |
| `INT-LEMMY-001.json` | Reddit/Lemmy integration | ❓ Unknown |

### Knowledge Engine Workflows
| File | Purpose | Status |
| :--- | :--- | :--- |
| `KNOWLEDGE-ENGINE-001-Document-Ingestion.json` | Document processing | ⚠️ Verify |
| `KNOWLEDGE-ENGINE-002-RAG-Query.json` | RAG queries | ⚠️ Verify |

### Marketplace / Product
| File | Purpose | Status |
| :--- | :--- | :--- |
| `MKT-MARKETPLACE-001-Workflow-Generalizer.json` | Template generalization | ⚠️ Verify |

### Stripe Integration
| File | Purpose | Status |
| :--- | :--- | :--- |
| `STRIPE-INSTALL-001-*.json` | Stripe installation flow | ⚠️ Verify |
| `STRIPE-MARKETPLACE-001-*.json` | Marketplace purchases | ⚠️ Verify |

### Typeform Integrations
| File | Purpose | Status |
| :--- | :--- | :--- |
| `TYPEFORM-FREE-LEADS-SAMPLE-001.json` | Free lead capture | ⚠️ Verify |
| `TYPEFORM-READINESS-SCORECARD-001.json` | Business readiness quiz | ⚠️ Verify |
| `TYPEFORM-READY-SOLUTIONS-QUIZ-001.json` | Solutions quiz | ⚠️ Verify |
| `TYPEFORM-TEMPLATE-REQUEST-001.json` | Template requests | ⚠️ Verify |
| `TYPEFORM-VOICE-AI-CONSULTATION-001.json` | Voice AI consults | ⚠️ Verify |

### Voice AI
| File | Purpose | Status |
| :--- | :--- | :--- |
| `telnyx-voice-ai-agent.json` | SuperSeller AI Voice Agent | ⚠️ Check n8n |
| `telnyx-voice-ai-agent-v2.json` | V2 (improved?) | ⚠️ Check n8n |

---

## 👥 Customer Workflows

### Active Customers
| Customer | Folder | n8n Instance | Status |
| :--- | :--- | :--- | :--- |
| **UAD Garage Doors** | TBD | SuperSeller AI n8n | ✅ Active |
| **Miss Party** | TBD | SuperSeller AI n8n | ✅ Active |
| **Tax4Us** | `/Customers/tax4us/` | `tax4usllc.app.n8n.cloud` | ✅ Active |
| **Wonder Care** | `/Customers/wonder.care/` | TBD | ❓ Status? |
| **Ortal** | `/Customers/ortal/` | TBD | ❓ Status? |
| **Ben Ginati** | `/Customers/ben-ginati/` | Tax4Us cloud | ✅ Same as Tax4Us |

---

## 🏷️ Template Schema (Enhanced)

Each template in Firebase should have:

```typescript
interface Template {
  // Core Info
  id: string;
  name: string;
  description: string;
  category: string;
  
  // Pricing
  price: number;           // Download price
  installPrice?: number;   // With implementation ($797 default)
  customPrice?: number;    // Full custom ($1,497 default)
  
  // Status
  readinessStatus: 'Active' | 'Beta' | 'Coming Soon' | 'Internal' | 'Draft';
  
  // Ownership (NEW)
  owner: 'superseller' | 'client';
  clientId?: string;
  department: 'lead_machine' | 'autonomous_secretary' | 'knowledge_engine' | 'content_engine' | 'internal_ops' | 'client_fulfillment';
  
  // n8n Integration (NEW)
  n8nWorkflowId?: string;
  n8nWorkflowUrl?: string;
  
  // Stripe Integration (NEW)
  stripeProductId?: string;
  stripePriceId?: string;
  
  // Visibility Rules (NEW)
  showInMarketplace: boolean;
  showInAdminDashboard: boolean;
  showInClientDashboard: boolean;
  
  // Audit
  lastAuditedAt?: Timestamp;
}
```

---

## 🔧 n8n Production Details (CORRECTED)

> [!IMPORTANT]
> The correct n8n server is `172.245.56.50`, NOT `172.245.56.50` (old/deprecated)

- **URL**: `https://n8n.superseller.agency`
- **IP**: `172.245.56.50`
- **VPS**: RackNerd DAL177KVM (Ubuntu 24.04, 6GB RAM, 100GB disk)
- **WAHA**: `http://172.245.56.50:3000` (WhatsApp API)

### n8n Production Workflows (VERIFIED)
- **WhatsApp Message Router**: `1LWTwUuN6P6uq2Ha` (Production - Updated Jan 2, 2026)
- **Telnyx Voice AI**: `MqMYMeA9U9PEX1cH` (Production v2 - Active)
- **Voice Agent v1**: `eQSCUFw91oXLxtvn` (Inactive - Legacy)
- **PDF Sales Agent**: `2IupcJdCKDv4LcoE` (Inactive)


---

## 👥 Customer Workflows (CORRECTED)

### Active Customers
| Customer | Folder | n8n Instance | Status |
| :--- | :--- | :--- | :--- |
| **UAD Garage Doors** | TBD | SuperSeller AI n8n | ✅ Active |
| **Miss Party** | TBD | SuperSeller AI n8n | ✅ Active |
| **Tax4Us** | `/Customers/tax4us/` | `tax4usllc.app.n8n.cloud` | ✅ Active |
| **Ben Ginati** | `/Customers/ben-ginati/` | Tax4Us cloud | ✅ Same as Tax4Us |

### Inactive / Prospects
| Name | Folder | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Wonder.care / Ortal** | `/Customers/wonder.care/` | ❌ Inactive | No plan, no website, no maintenance |
| **Ortal** | `/Customers/ortal/` | ℹ️ Same as wonder.care | Also works for local-il.com |
| **Nir Sheinbein** | `/workflows/nir-sheinbein/` | ❌ Prospect only | Never converted to customer |

---

## ✅ Typeform Removal Complete

> [!NOTE]
> All Typeform workflow files have been removed and replaced by code-based forms (e.g., `/custom` page).
> Typeform is no longer used for lead intake or business qualification.


---

## 📋 Marketplace Display Rules

> Only products that have:
> 1. All fields complete in Firebase
> 2. `showInMarketplace: true`
> 3. `readinessStatus: 'Active'`

Should appear in the marketplace. Currently using mock data.

---

## ❓ Remaining Questions (From User Session)

### WhatsApp Workflow Version
User confirmed there are many versions:
- `1LWTwUuN6P6uq2Ha`
- `2IupcJdCKDv4LcoE`
- `eQSCUFw91oXLxtvn`
- `MqMYMeA9U9PEX1cH`

**Question**: Which is the latest/production version?

### Care Plans
- **Starter (5 hrs)**: Monitoring and email support.
- **Growth (15 hrs)**: Continuous optimizations and updates.
- **Scale (40 hrs)**: Dedicated engineer for evolution and custom features.
**Current Rule**: Care plans provide expert maintenance hours. Workflow access is sold separately via Marketplace or Custom Installation.


---

## 📋 Action Items (After User Answers)

1. [ ] Populate Firebase `templates` collection with all active workflows
2. [ ] Add `owner`, `department`, `visibility` fields to each template
3. [ ] Connect marketplace to fetch from Firebase instead of mock data
4. [ ] Create admin tool to manage workflow visibility
5. [ ] Document which n8n workflow ID maps to which Firebase template

---

## 📎 Related Documentation

- [workflows/README.md](file:///Users/shaifriedman/New%20SuperSeller AI/superseller/workflows/README.md) - Workflow folder structure
- [types/firestore.ts](file:///Users/shaifriedman/New%20SuperSeller AI/superseller/apps/web/superseller-site/src/types/firestore.ts) - Template interface
- [CLIENTS.md](file:///Users/shaifriedman/New%20SuperSeller AI/superseller/docs/business/CLIENTS.md) - Customer list
