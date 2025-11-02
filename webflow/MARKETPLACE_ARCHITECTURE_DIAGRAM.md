# 🏗️ Marketplace System - Complete Architecture Diagram

**Date**: November 2, 2025  
**Purpose**: Visual representation of entire Marketplace purchase automation system

---

## 🎨 **SYSTEM ARCHITECTURE OVERVIEW**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CUSTOMER PURCHASE FLOW                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         STRIPE CHECKOUT                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Customer clicks "Buy Now" on Marketplace page                   │   │
│  │ → Creates Stripe Checkout Session                               │   │
│  │ → Metadata: flowType, productId, tier, templateName           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Payment Complete
┌─────────────────────────────────────────────────────────────────────────┐
│              NEXT.JS WEBHOOK HANDLER                                     │
│  Location: apps/web/rensto-site/src/app/api/stripe/webhook/route.ts    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Validates Stripe signature                                    │   │
│  │ 2. Extracts metadata (flowType, productId, etc.)                │   │
│  │ 3. Routes to appropriate n8n webhook:                          │   │
│  │    • marketplace-template → /webhook/stripe-marketplace-template│ │
│  │    • marketplace-install → /webhook/stripe-marketplace-install  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐      ┌───────────────────────┐
        │  TEMPLATE PURCHASE    │      │  INSTALLATION PURCHASE│
        │     (Download)        │      │   (Full Service)       │
        └───────────────────────┘      └───────────────────────┘
                    │                               │
                    ▼                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW: STRIPE-MARKETPLACE-001                 │
│  Instance: http://173.254.201.134:5678                                   │
│  Webhook: /webhook/stripe-marketplace-template                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Node 1: Parse Webhook Data                                       │   │
│  │   → Extracts: customerEmail, productId, amount, sessionId       │   │
│  │                                                                   │   │
│  │ Node 2: Find Customer                                            │   │
│  │   → Airtable: appQijHhqqP4z6wGe, table: Customers               │   │
│  │   → Filter: Email = customerEmail                                │   │
│  │                                                                   │   │
│  │ Node 3: Create/Update Customer                                   │   │
│  │   → Airtable: Creates customer if not found                      │   │
│  │                                                                   │   │
│  │ Node 4: Find Marketplace Product                                 │   │
│  │   → Airtable: app6saCaH88uK3kCO, table: Marketplace Products    │   │
│  │   → Filter: Workflow ID = productId                              │   │
│  │                                                                   │   │
│  │ Node 5: Create Marketplace Purchase                              │   │
│  │   → Airtable: app6saCaH88uK3kCO, table: Marketplace Purchases   │   │
│  │   → Links to: Marketplace Products (linked record)               │   │
│  │   → Status: "⏳ Pending"                                         │   │
│  │                                                                   │   │
│  │ Node 6: HTTP Request → POST /api/marketplace/downloads            │   │
│  │   → Body: { templateId, customerEmail, sessionId, purchaseRecordId }│
│  │   → Returns: { downloadLink, expiresAt, workflowFileUrl }        │   │
│  │                                                                   │   │
│  │ Node 7: Update Purchase with Download Link                       │   │
│  │   → Airtable: Updates Marketplace Purchases record                │   │
│  │   → Sets: Download Link, Expiry, Status: "📥 Download Link Sent"│   │
│  │                                                                   │   │
│  │ Node 8: Respond Success                                           │   │
│  │   → Returns success response to webhook                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              DOWNLOAD LINK GENERATION API                                │
│  Endpoint: POST https://api.rensto.com/api/marketplace/downloads       │
│  Location: apps/web/rensto-site/src/app/api/marketplace/downloads/     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Find Product (Airtable: Marketplace Products)                 │   │
│  │    → Filter: Workflow ID = templateId                           │   │
│  │                                                                   │   │
│  │ 2. Generate Secure Token                                         │   │
│  │    → Format: base64url(purchaseRecordId:email:timestamp)        │   │
│  │    → Expiry: 7 days from now                                     │   │
│  │                                                                   │   │
│  │ 3. Create Download Link                                           │   │
│  │    → URL: https://api.rensto.com/api/marketplace/download/{token}│   │
│  │                                                                   │   │
│  │ 4. Update Airtable Purchase Record                               │   │
│  │    → Sets: Download Link, Expiry, Status, Access Granted        │   │
│  │                                                                   │   │
│  │ 5. Return Response                                               │   │
│  │    → { downloadLink, expiresAt, workflowFileUrl, product }      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼ Customer receives download link
┌─────────────────────────────────────────────────────────────────────────┐
│                   DOWNLOAD TOKEN HANDLER                                │
│  Endpoint: GET https://api.rensto.com/api/marketplace/download/{token} │
│  Location: apps/web/rensto-site/src/app/api/marketplace/download/[token]│
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. Decode Token                                                 │   │
│  │    → Extracts: purchaseRecordId, customerEmail, timestamp      │   │
│  │                                                                   │   │
│  │ 2. Validate Purchase Record                                     │   │
│  │    → Airtable: Reads Marketplace Purchases record              │   │
│  │    → Checks: Expiry not passed, record exists                  │   │
│  │                                                                   │   │
│  │ 3. Get Product Information                                       │   │
│  │    → Airtable: Reads Marketplace Products (via linked record)  │   │
│  │    → Extracts: Source File path                                 │   │
│  │                                                                   │   │
│  │ 4. Update Download Count                                         │   │
│  │    → Airtable: Increments Download Count, sets Last Downloaded  │   │
│  │                                                                   │   │
│  │ 5. Redirect to GitHub Raw File                                   │   │
│  │    → URL: https://raw.githubusercontent.com/imsuperseller/rensto/main/{path}│
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GITHUB RAW FILE                                  │
│  Repository: imsuperseller/rensto                                        │
│  Path: workflows/templates/{workflow-id}.json                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Customer downloads workflow JSON file                            │   │
│  │ → Can import into their n8n instance                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

════════════════════════════════════════════════════════════════════════════

                    ┌───────────────────────┐
                    │  INSTALLATION PURCHASE│
                    │   (Full Service)     │
                    └───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW: STRIPE-INSTALL-001                      │
│  Instance: http://173.254.201.134:5678                                   │
│  Webhook: /webhook/stripe-marketplace-install                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Node 1: Parse Webhook Data                                       │   │
│  │                                                                   │   │
│  │ Node 2: Find Customer                                            │   │
│  │                                                                   │   │
│  │ Node 3: Create/Update Customer                                   │   │
│  │                                                                   │   │
│  │ Node 4: Create Project                                           │   │
│  │   → Airtable: appQijHhqqP4z6wGe, table: Projects                 │   │
│  │   → Status: "⏳ Pending Installation"                            │   │
│  │                                                                   │   │
│  │ Node 5: Find Marketplace Product                                 │   │
│  │                                                                   │   │
│  │ Node 6: Create Marketplace Purchase                              │   │
│  │   → Purchase Type: "Installation"                                │   │
│  │   → Installation Booked: false                                    │   │
│  │                                                                   │   │
│  │ Node 7: HTTP Request → POST /api/installation/booking                   │
│  │   → Body: { customerEmail, workflowName, productId, projectId, purchaseRecordId }│
│  │   → Returns: { tidycalLink, bookingUrl, url }                    │   │
│  │                                                                   │   │
│  │ Node 8: Update Purchase with TidyCal Link                        │   │
│  │   → Sets: TidyCal Booking Link, Status: "📅 Installation Booked" │   │
│  │   → Sets: Installation Booked: true, Access Granted: true      │   │
│  │                                                                   │   │
│  │ Node 9: Respond Success                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              INSTALLATION BOOKING API                                    │
│  Endpoint: POST https://api.rensto.com/api/installation/booking        │
│  Location: apps/web/rensto-site/src/app/api/installation/booking/      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 1. TidyCal API: GET /me                                         │   │
│  │    → Gets account info (vanity_path: "shai")                   │   │
│  │                                                                   │   │
│  │ 2. TidyCal API: GET /booking-types                              │   │
│  │    → Lists all booking types                                     │   │
│  │    → Finds: title/url_slug contains "installation" or "setup"  │   │
│  │                                                                   │   │
│  │ 3. Extract Booking URL                                           │   │
│  │    → From booking type.url field                                 │   │
│  │    → Format: https://tidycal.com/{vanity_path}/{url_slug}      │   │
│  │                                                                   │   │
│  │ 4. Update Airtable Purchase Record                               │   │
│  │    → Sets: TidyCal Booking Link, Status, Installation Booked    │   │
│  │                                                                   │   │
│  │ 5. Return Response                                               │   │
│  │    → { tidycalLink, bookingUrl, url, bookingTypeId }             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         TIDYCAL API                                      │
│  Base URL: https://tidycal.com/api                                       │
│  Authentication: Bearer Token (JWT)                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Account: vanity_path = "shai"                                   │   │
│  │ Booking Types: Installation service                             │   │
│  │ Booking URL: https://tidycal.com/shai/installation              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼ Customer receives TidyCal booking link
┌─────────────────────────────────────────────────────────────────────────┐
│                         TIDYCAL CALENDAR                                 │
│  Customer books installation call                                        │
│  → Calendar event created                                                │
│  → Customer and Rensto notified                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 **DATA STORAGE ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AIRTABLE DATABASES                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌─────────────────────────────┐    ┌─────────────────────────────────┐
│ OPERATIONS & AUTOMATION     │    │  RENSTO CLIENT OPERATIONS       │
│ Base ID: app6saCaH88uK3kCO  │    │  Base ID: appQijHhqqP4z6wGe     │
│                             │    │                                 │
│ ┌─────────────────────────┐ │    │ ┌─────────────────────────────┐ │
│ │ Marketplace Products    │ │    │ │ Customers                   │ │
│ │ Table: tblLO2RJuYJjC806X│ │    │ │ Table: tbl6BMipQQPJvPIWw    │ │
│ │ • 8 products populated│ │    │ │ │ • Email (unique)          │ │
│ │ • Workflow ID (unique) │ │    │ │ • Name, Last Contact Date   │ │
│ │ • Source File (GitHub) │ │    │ │ • Annual Revenue            │ │
│ │ • Download/Install Price│ │    │ │ • Customer Lifetime Value  │ │
│ └─────────────────────────┘ │    │ └─────────────────────────────┘ │
│           │                 │    │           │                     │
│           │ Linked Record   │    │           │ Linked Record       │
│           ▼                 │    │           ▼                     │
│ ┌─────────────────────────┐ │    │ ┌─────────────────────────────┐ │
│ │ Marketplace Purchases   │ │    │ │ Projects                     │ │
│ │ Table: tblzxijTsGsDIFSKx│ │    │ │ Table: tblNopy7xK0IUYf8E     │ │
│ │ • Product (→ Products)   │ │    │ │ • Customer (→ Customers)     │ │
│ │ • Customer Email        │ │    │ │ • Project Name              │ │
│ │ • Purchase Type         │ │    │ │ • Status                     │ │
│ │ • Download Link         │ │    │ │ • Start Date                 │ │
│ │ • TidyCal Booking Link  │ │    │ └─────────────────────────────┘ │
│ │ • Status                │ │    └─────────────────────────────────┘
│ │ • Download Count        │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

## 🔄 **COMPLETE PURCHASE FLOW DIAGRAM**

```
┌──────────────┐
│   CUSTOMER   │
│  on Website  │
└──────┬───────┘
       │ Clicks "Buy Now"
       ▼
┌──────────────────────┐
│  STRIPE CHECKOUT     │
│  • Creates session    │
│  • Collects payment  │
│  • Sets metadata      │
└──────┬───────────────┘
       │ Payment Complete
       │ Event: checkout.session.completed
       ▼
┌────────────────────────────────────────┐
│  NEXT.JS WEBHOOK HANDLER               │
│  • Validates Stripe signature          │
│  • Extracts metadata                   │
│  • Routes to n8n webhook               │
└──────┬─────────────────────────────────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ marketplace-│ │ marketplace-│ │  Other      │
│   template  │ │    install   │ │  flowTypes  │
└──────┬──────┘ └──────┬───────┘ └─────────────┘
       │               │
       ▼               ▼
┌─────────────────┐ ┌─────────────────┐
│ n8n: STRIPE-    │ │ n8n: STRIPE-    │
│ MARKETPLACE-001 │ │ INSTALL-001     │
└──────┬──────────┘ └──────┬──────────┘
       │                    │
       │ Creates Records    │ Creates Records
       │ • Customer         │ • Customer
       │ • Purchase         │ • Project
       │                    │ • Purchase
       │                    │
       ▼                    ▼
┌─────────────────┐ ┌─────────────────┐
│ POST /api/      │ │ POST /api/      │
│ marketplace/    │ │ installation/   │
│ downloads       │ │ booking         │
└──────┬──────────┘ └──────┬──────────┘
       │                    │
       │                    │ Calls TidyCal API
       │                    │ • GET /me
       │                    │ • GET /booking-types
       │                    │
       ▼                    ▼
┌─────────────────┐ ┌─────────────────┐
│ Returns:        │ │ Returns:        │
│ downloadLink    │ │ tidycalLink     │
└──────┬──────────┘ └──────┬──────────┘
       │                    │
       │ Updates Airtable   │ Updates Airtable
       │                    │
       ▼                    ▼
┌─────────────────┐ ┌─────────────────┐
│ Customer        │ │ Customer         │
│ receives:       │ │ receives:       │
│ Download link   │ │ TidyCal link     │
│ (7-day expiry)  │ │ (booking page)   │
└─────────────────┘ └─────────────────┘
```

---

## 🔌 **INTEGRATION POINTS MAP**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │   STRIPE    │    │   TIDYCAL   │    │  AIRTABLE   │             │
│  │             │    │             │    │             │             │
│  │ Payment     │    │ Scheduling  │    │ Database    │             │
│  │ Processing  │    │ & Calendar  │    │ Storage     │             │
│  │             │    │             │    │             │             │
│  │ Webhooks:   │    │ API:        │    │ API:        │             │
│  │ • checkout. │    │ • /me       │    │ • REST      │             │
│  │   session.  │    │ • /booking- │    │ • Tables:   │             │
│  │   completed │    │   types     │    │   - Products│             │
│  │             │    │             │    │   - Purchases│            │
│  │ Metadata:   │    │ Auth: JWT   │    │   - Customers│            │
│  │ • flowType  │    │ Token       │    │   - Projects│            │
│  │ • productId │    │             │    │             │             │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘             │
│         │                  │                  │                    │
│         └──────────────────┼──────────────────┘                    │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              NEXT.JS API ENDPOINTS (Vercel)                   │ │
│  │              Domain: api.rensto.com                           │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ /api/stripe/webhook                                     │  │ │
│  │  │ • Receives Stripe events                                │  │ │
│  │  │ • Validates signatures                                  │  │ │
│  │  │ • Triggers n8n webhooks                                 │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ /api/marketplace/downloads                               │  │ │
│  │  │ • Generates download tokens                              │  │ │
│  │  │ • Updates Airtable                                       │  │ │
│  │  │ • Returns download links                                │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ /api/marketplace/download/{token}                       │  │ │
│  │  │ • Validates tokens                                      │  │ │
│  │  │ • Tracks downloads                                      │  │ │
│  │  │ • Redirects to GitHub                                   │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  │                                                               │ │
│  │  ┌────────────────────────────────────────────────────────┐  │ │
│  │  │ /api/installation/booking                              │  │ │
│  │  │ • Calls TidyCal API                                     │  │ │
│  │  │ • Gets booking links                                    │  │ │
│  │  │ • Updates Airtable                                      │  │ │
│  │  └────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    n8n WORKFLOW ENGINE                        │ │
│  │                    Instance: 173.254.201.134:5678            │ │
│  │                                                               │ │
│  │  ┌────────────────────────┐    ┌────────────────────────┐   │ │
│  │  │ STRIPE-MARKETPLACE-001│    │ STRIPE-INSTALL-001      │   │ │
│  │  │ • Template purchases  │    │ • Installation purchases│   │ │
│  │  │ • Creates records     │    │ • Creates records       │   │ │
│  │  │ • Calls download API  │    │ • Calls booking API     │   │ │
│  │  └────────────────────────┘    └────────────────────────┘   │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                            │                                        │
│                            ▼                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                      DATA STORAGE                             │ │
│  │                                                               │ │
│  │  ┌──────────────┐         ┌──────────────┐                   │ │
│  │  │   AIRTABLE   │         │    GITHUB    │                   │ │
│  │  │              │         │              │                   │ │
│  │  │ • Products   │         │ • Workflow   │                   │ │
│  │  │ • Purchases  │         │   JSON files │                   │ │
│  │  │ • Customers  │         │              │                   │ │
│  │  │ • Projects   │         │ Raw URLs for │                   │ │
│  │  └──────────────┘         │   downloads  │                   │ │
│  │                           └──────────────┘                   │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📈 **TECHNICAL STACK & DEPENDENCIES**

### **Frontend/Website**:
- **Webflow** - Marketing site (rensto.com)
- **Stripe Checkout** - Payment processing
- **JavaScript** - Client-side checkout initiation

### **Backend/API**:
- **Next.js 14+** (App Router) - API routes
- **TypeScript** - Type safety
- **Vercel** - Hosting (api.rensto.com)
- **Axios** - HTTP client for external APIs

### **Workflow Automation**:
- **n8n Community Edition v1.113.3**
- **VPS**: RackNerd (173.254.201.134:5678)
- **Workflows**: 2 active (Marketplace purchases)

### **Data Storage**:
- **Airtable** - Primary database (Operations & Automation, Rensto Client Operations)
- **GitHub** - File storage (workflow JSONs)

### **External Integrations**:
- **Stripe API** - Payment processing and webhooks
- **TidyCal API** - Calendar booking and scheduling
- **Airtable API** - Database operations

---

## 🔐 **AUTHENTICATION & CREDENTIALS**

### **API Keys & Tokens**:
- **Airtable**: Personal Access Token (env: `AIRTABLE_API_KEY`)
- **TidyCal**: JWT token (env: `TIDYCAL_API_KEY` or hardcoded)
- **Stripe**: Secret key + webhook secret (env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- **n8n**: API key (stored in n8n credentials, not used in this session)

### **Access Methods**:
- **Airtable**: Direct REST API calls with Bearer token
- **TidyCal**: Direct REST API calls with Bearer JWT token
- **n8n**: Webhook triggers (no direct API calls in this session)
- **GitHub**: Public raw file URLs (no authentication required)

---

## 📝 **CODE ARTIFACTS CREATED**

### **API Routes** (3 files):
1. **`apps/web/rensto-site/src/app/api/marketplace/downloads/route.ts`**
   - **Lines**: ~160
   - **Functions**: `findProductByWorkflowId()`, `updatePurchaseRecord()`, `getWorkflowFile()`, `POST handler`
   - **Dependencies**: `axios`, `NextRequest`, `NextResponse`

2. **`apps/web/rensto-site/src/app/api/marketplace/download/[token]/route.ts`**
   - **Lines**: ~100
   - **Functions**: `getPurchaseRecord()`, `updateDownloadCount()`, `GET handler`
   - **Dependencies**: `axios`, `NextRequest`, `NextResponse`

3. **`apps/web/rensto-site/src/app/api/installation/booking/route.ts`** (updated)
   - **Lines**: ~200
   - **Functions**: `getTidyCalBookingLink()`, `updatePurchaseRecord()`, `POST handler`, `GET handler`
   - **Dependencies**: `axios`, `NextRequest`, `NextResponse`

### **Documentation** (4 files):
1. `webflow/API_ENDPOINTS_COMPLETE.md` - API specifications
2. `webflow/MARKETPLACE_SYSTEM_COMPLETE.md` - System overview
3. `webflow/TIDYCAL_INTEGRATION_COMPLETE.md` - TidyCal details
4. `webflow/MARKETPLACE_INTEGRATION_COMPREHENSIVE_SUMMARY.md` - Technical summary
5. `webflow/MARKETPLACE_ARCHITECTURE_DIAGRAM.md` - This file

---

## 🧪 **TESTING REQUIREMENTS**

### **Manual Testing Needed**:
1. **Stripe Test Checkout**:
   - Create test checkout session with `flowType: "marketplace-template"`
   - Verify webhook triggers n8n workflow
   - Verify download link generated

2. **Download Link Testing**:
   - Access download link before expiry
   - Verify file downloads correctly
   - Test expired link (wait 7 days or modify expiry)
   - Verify download count increments

3. **Installation Booking Testing**:
   - Create test checkout with `flowType: "marketplace-install"`
   - Verify TidyCal booking link generated
   - Verify link opens correct TidyCal calendar
   - Test booking link functionality

### **Automated Testing** (Future):
- Unit tests for API endpoints
- Integration tests for n8n workflows
- E2E tests for complete purchase flows

---

**Status**: ✅ **ARCHITECTURE DOCUMENTED - READY FOR VISUALIZATION**

