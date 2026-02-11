# 🔥 Firestore Workflow Management System

> [!WARNING]
> **DEPRECATED**: Firestore is retired. Primary database is PostgreSQL + Redis. See CLAUDE.md.

**Created**: December 11, 2025
**Purpose**: Comprehensive workflow catalog, client management, and version tracking (legacy)
**Credential ID**: `fT1kb9qsooSNM3RX` (Google Firebase Cloud Firestore OAuth2 API)

---

## 📊 SYSTEM OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FIRESTORE WORKFLOW SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │  TEMPLATES  │    │   CLIENTS   │    │  VERSIONS   │            │
│  │  (catalog)  │───▶│  (tracking) │───▶│  (history)  │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│         │                  │                  │                    │
│         ▼                  ▼                  ▼                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   PRICING   │    │  PROJECTS   │    │  CHANGELOG  │            │
│  │   (sales)   │    │  (delivery) │    │   (docs)    │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ FIRESTORE SCHEMA

### Collection: `templates`
Master catalog of all workflow templates.

```javascript
/templates/{templateId}
{
  // Identity
  id: "WA-AGENT-001",
  n8nWorkflowId: "eQSCUFw91oXLxtvn",
  name: "Rensto Voice Agent (Shai AI)",
  slug: "wa-agent-001-rensto-voice-agent",
  
  // Classification
  category: "whatsapp-agent",
  subcategory: "voice",
  tags: ["whatsapp-agent", "production", "template", "rensto"],
  status: "production", // production | template | needs-fix | archive | testing
  tier: "premium", // starter | professional | premium | enterprise
  
  // Description
  shortDescription: "Full-featured WhatsApp voice agent with AI",
  longDescription: "Complete WhatsApp agent handling voice, image, video...",
  useCases: [
    "Customer support",
    "Sales inquiries", 
    "Appointment booking"
  ],
  
  // Technical
  nodeCount: 50,
  complexity: "complex", // simple | medium | complex
  estimatedSetupTime: "2-4 hours",
  requiredCredentials: [
    "OpenAI API",
    "WAHA",
    "ElevenLabs"
  ],
  integrations: ["WhatsApp", "OpenAI", "ElevenLabs", "Google Gemini"],
  
  // Pricing
  pricing: {
    template: 197,          // DIY template price
    installation: 797,      // Full-service install
    monthly: 299,           // If subscription model
    currency: "USD"
  },
  
  // Metrics
  metrics: {
    deployments: 3,         // How many clients use this
    avgSetupTime: "3 hours",
    successRate: 95,
    lastUsed: "2025-12-10"
  },
  
  // Source
  sourceWorkflow: {
    id: "eQSCUFw91oXLxtvn",
    version: "v1",
    lastSync: "2025-12-11T06:00:00Z"
  },
  
  // Metadata
  createdAt: "2025-11-17T00:01:48.622Z",
  updatedAt: "2025-12-11T06:00:00Z",
  createdBy: "shai",
  isActive: true,
  isPublic: true // Show in marketing/sales catalog
}
```

### Collection: `clients`
Track all clients and their workflow deployments.

```javascript
/clients/{clientId}
{
  // Identity
  id: "tax4us",
  name: "Tax4Us LLC",
  slug: "tax4us",
  contact: {
    name: "Ben Ginati",
    email: "ben@tax4us.co.il",
    phone: "+1-XXX-XXX-XXXX",
    location: "Allen, TX"
  },
  
  // Business
  industry: "accounting",
  size: "small", // solo | small | medium | enterprise
  website: "https://tax4us.co.il",
  
  // Status
  status: "active", // prospect | active | paused | churned
  tier: "custom", // starter | professional | premium | custom
  
  // Relationship
  startDate: "2025-11-01",
  source: "referral", // referral | organic | paid | outreach
  referredBy: null,
  
  // Financial
  revenue: {
    total: 2500,
    monthly: 0,
    oneTime: 2500,
    currency: "USD"
  },
  
  // Workflows
  activeWorkflows: 4,
  
  // Notes
  notes: "Building content pipeline + WhatsApp agent",
  
  // Metadata
  createdAt: "2025-11-01T00:00:00Z",
  updatedAt: "2025-12-11T00:00:00Z"
}
```

### Subcollection: `clients/{clientId}/deployments`
Track which templates each client has.

```javascript
/clients/{clientId}/deployments/{deploymentId}
{
  // Identity
  id: "tax4us-wa-agent",
  templateId: "WA-AGENT-005",
  templateName: "Tax4Us RAG Voice Assistant",
  
  // Deployment
  n8nWorkflowId: "80w2xpBPTNGrcZMV",
  n8nInstance: "rensto", // rensto | tax4us-cloud | shelly-cloud
  
  // Status
  status: "active", // planning | building | testing | active | paused | archived
  
  // Customizations
  customizations: [
    "Custom knowledge base",
    "Hebrew language support",
    "Tax-specific prompts"
  ],
  
  // Timeline
  startedAt: "2025-11-25T00:00:00Z",
  deployedAt: "2025-11-26T00:00:00Z",
  
  // Billing
  pricing: {
    type: "one-time", // one-time | monthly | usage
    amount: 1500,
    billedAt: "2025-11-25T00:00:00Z"
  },
  
  // Usage
  usage: {
    lastExecution: "2025-12-10T14:30:00Z",
    totalExecutions: 234,
    errorsLast30Days: 2
  },
  
  // Metadata
  createdAt: "2025-11-25T00:00:00Z",
  updatedAt: "2025-12-11T00:00:00Z"
}
```

### Collection: `versions`
Track template version history.

```javascript
/templates/{templateId}/versions/{versionId}
{
  // Identity
  version: "v1.2.0",
  
  // Changes
  changelog: [
    "Added support for Hebrew voice transcription",
    "Fixed rate limiting issue",
    "Updated OpenAI node to v1.0.0"
  ],
  
  // Breaking
  breakingChanges: false,
  migrationRequired: false,
  migrationGuide: null,
  
  // Technical
  n8nVersion: "2.0.1",
  nodeVersions: {
    "n8n-nodes-base.openai": "1.0.0",
    "n8n-nodes-base.httpRequest": "4.3"
  },
  
  // Snapshot
  workflowSnapshot: {
    nodeCount: 50,
    connectionCount: 65
  },
  
  // Metadata
  releasedAt: "2025-12-10T00:00:00Z",
  releasedBy: "shai",
  notes: "Production release after testing with Tax4Us"
}
```

### Collection: `pricing`
Pricing catalog for sales.

```javascript
/pricing/{pricingId}
{
  // Identity
  id: "whatsapp-premium",
  name: "WhatsApp Premium Agent",
  
  // Pricing
  tiers: {
    template: {
      price: 197,
      description: "DIY - Download JSON and install yourself",
      includes: ["Workflow JSON", "Setup guide", "Email support"]
    },
    installation: {
      price: 797,
      description: "Full-service installation",
      includes: ["Everything in Template", "Installation", "Configuration", "1 hour training"]
    },
    managed: {
      price: 299,
      priceType: "monthly",
      description: "Fully managed service",
      includes: ["Everything in Installation", "Hosting", "Monitoring", "Updates", "Priority support"]
    }
  },
  
  // Metadata
  category: "whatsapp-agent",
  isActive: true,
  updatedAt: "2025-12-11T00:00:00Z"
}
```

### Collection: `analytics`
Aggregated metrics.

```javascript
/analytics/{period}
{
  // Period
  period: "2025-12",
  
  // Revenue
  revenue: {
    total: 5000,
    byCategory: {
      "whatsapp-agent": 2500,
      "content-pipeline": 1500,
      "lead-generation": 1000
    },
    byType: {
      "one-time": 4000,
      "monthly": 1000
    }
  },
  
  // Deployments
  deployments: {
    new: 5,
    total: 12
  },
  
  // Templates
  popularTemplates: [
    { id: "WA-AGENT-001", deployments: 3 },
    { id: "CONTENT-AGENT-001", deployments: 2 }
  ],
  
  // Clients
  clients: {
    new: 2,
    active: 5,
    churned: 0
  }
}
```

---

## 🔄 SYNC ARCHITECTURE

### n8n → Firestore Sync Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Trigger    │────▶│   Get n8n    │────▶│   Transform  │
│  (Schedule)  │     │  Workflows   │     │    Data      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌──────────────┐     ┌──────▼───────┐
                     │    Alert     │◀────│   Firestore  │
                     │   (Slack)    │     │    Upsert    │
                     └──────────────┘     └──────────────┘
```

### Sync Frequency
- **Templates**: On change or daily at midnight
- **Clients**: On change
- **Versions**: On template update
- **Analytics**: Weekly aggregation

---

## 📱 USE CASES

### 1. Sales Catalog
Query templates by category for prospect presentations:
```javascript
db.collection('templates')
  .where('isPublic', '==', true)
  .where('status', '==', 'production')
  .orderBy('tier')
```

### 2. Client Dashboard
Get all active workflows for a client:
```javascript
db.collection('clients').doc(clientId)
  .collection('deployments')
  .where('status', '==', 'active')
```

### 3. Version Check
Check if client needs update:
```javascript
db.collection('templates').doc(templateId)
  .collection('versions')
  .orderBy('releasedAt', 'desc')
  .limit(1)
```

### 4. Revenue Report
Get monthly revenue by category:
```javascript
db.collection('analytics').doc('2025-12')
  .get()
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Schema Setup ✅
- [x] Design collections
- [x] Define document structures
- [x] Create documentation

### Phase 2: Initial Sync
- [ ] Create n8n workflow to export to Firestore
- [ ] Populate templates from 124 workflows
- [ ] Add pricing data

### Phase 3: Client Tracking
- [ ] Add existing clients (Tax4Us, Dima, MeatPoint)
- [ ] Link deployments to templates
- [ ] Set up billing tracking

### Phase 4: Analytics
- [ ] Create aggregation workflow
- [ ] Set up dashboards
- [ ] Alert on milestones

---

## 🔐 SECURITY

### Firestore Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Templates - public read, admin write
    match /templates/{templateId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Clients - authenticated only
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Analytics - admin only
    match /analytics/{period} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## 📋 FIRESTORE CREDENTIAL

**Credential ID**: `fT1kb9qsooSNM3RX`
**Type**: Google Firebase Cloud Firestore OAuth2 API
**Location**: n8n.rensto.com credentials

---

## 🎯 BENEFITS

1. **Sales**: Show prospects a professional catalog with pricing
2. **Client Management**: Track who has what, billing status
3. **Development**: Version history, patterns library
4. **Analytics**: Revenue, usage, popular templates
5. **Automation**: Auto-sync from n8n keeps data fresh
