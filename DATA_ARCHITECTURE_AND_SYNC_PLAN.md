# DATA ARCHITECTURE AND SYNCHRONIZATION PLAN
## Rensto 4 Service Types - Complete Data Flow Architecture

**Date**: September 30, 2024  
**Status**: 🏗️ **ARCHITECTURE PLANNING**  
**Purpose**: Complete data architecture and synchronization between Airtable (source of truth) and Webflow (public website)

---

## 🎯 **EXECUTIVE SUMMARY**

**DATA SOURCE HIERARCHY**:
1. **Airtable** - Master data source (business operations, customer data, content)
2. **Webflow CMS** - Public website content (marketing, pricing, case studies)
3. **MongoDB** - Application data (user sessions, API data, real-time data)
4. **Vercel** - Application hosting and API endpoints

---

## 🏗️ **DATA ARCHITECTURE OVERVIEW**

### **PRIMARY DATA FLOW**
```
Airtable (Source of Truth)
    ↓ (Sync via API)
Webflow CMS (Public Content)
    ↓ (Fetch via API)
Vercel Website (Display)
    ↓ (User Actions)
MongoDB (Application Data)
    ↓ (Business Logic)
Airtable (Updated Data)
```

---

## 📊 **AIRTABLE BASE STRUCTURE (SOURCE OF TRUTH)**

### **1. Core Business Operations Base** (`app4nJpP1ytGukXQT`)
**Purpose**: Central hub for all business operations

#### **Tables for 4 Service Types**:

##### **A. Service Types Management**
```
Table: Service Types
Fields:
- Service Type ID (Primary)
- Name (Marketplace, Custom Solutions, Subscriptions, Ready Solutions)
- Description
- Status (Active/Inactive)
- Pricing Model
- Target Market
- Features (JSON)
- Created Date
- Last Updated
```

##### **B. Marketplace Products**
```
Table: Marketplace Products
Fields:
- Product ID (Primary)
- Name
- Service Type (Linked to Service Types)
- Category (Templates, Installation, Support)
- Description
- Price
- Features (JSON)
- Download Link
- Installation Guide
- Status (Published/Draft/Archived)
- Created Date
- Last Updated
```

##### **C. Custom Solutions**
```
Table: Custom Solutions
Fields:
- Solution ID (Primary)
- Customer (Linked to Customers)
- Service Type (Custom Solutions)
- Consultation Date
- Voice AI Session ID
- Business Plan (JSON)
- Implementation Status
- Technical Requirements
- Pricing
- Status (Consultation/Planning/Implementation/Complete)
- Created Date
- Last Updated
```

##### **D. Subscriptions**
```
Table: Subscriptions
Fields:
- Subscription ID (Primary)
- Customer (Linked to Customers)
- Service Type (Subscriptions)
- Niche Selection
- Lead Volume
- CRM Integration
- Billing Cycle
- Status (Active/Inactive/Cancelled)
- Created Date
- Last Updated
```

##### **E. Ready Solutions**
```
Table: Ready Solutions
Fields:
- Solution ID (Primary)
- Niche (HVAC, Roofer, Realtor, etc.)
- Service Type (Ready Solutions)
- Package Name
- Description
- Solutions Included (JSON)
- Pricing
- Target Market
- Status (Available/In Development/Archived)
- Created Date
- Last Updated
```

### **2. Customer Management Base** (`appSCBZk03GUCTfhN`)
**Purpose**: Customer relationship management

#### **Tables**:
```
Table: Customers
Fields:
- Customer ID (Primary)
- Company Name
- Contact Person
- Email
- Phone
- Service Type (Linked to Service Types)
- Status (Lead/Active/Inactive)
- Onboarding Date
- Last Contact
- Notes
- Created Date
- Last Updated
```

### **3. Content Management Base** (`appSoTojCS6c22O7f`)
**Purpose**: Content for Webflow CMS synchronization

#### **Tables**:
```
Table: Webflow Content
Fields:
- Content ID (Primary)
- Content Type (Blog Post, Case Study, Testimonial, Service Page)
- Title
- Content (Rich Text)
- SEO Title
- SEO Description
- Featured Image
- Status (Draft/Published/Archived)
- Webflow Collection ID
- Webflow Item ID
- Created Date
- Last Updated
```

---

## 🌐 **WEBFLOW CMS STRUCTURE (PUBLIC CONTENT)**

### **Current Collections**:
1. **Templates** (`685de5b00b5f4d63609f506c`) - n8n workflow templates
2. **Categories** (`6879e133650abb9531505958`) - Service categories
3. **Reviews** (`6879e155751ae39122097bd9`) - Customer reviews
4. **Use Cases** (`6879e15df042f4144f1ebb17`) - Success stories
5. **Pricing Plans** (`68dc288efc7144a9d6a9126c`) - Service pricing

### **Required Collections for 4 Service Types**:

#### **A. Service Types Collection**
```
Fields:
- Name (Single line text)
- Description (Long text)
- Icon (Image)
- Features (Long text)
- Button Text (Single line text)
- Button Link (URL)
- Most Popular (Switch)
- Status (Single select: Active/Inactive)
```

#### **B. Marketplace Products Collection**
```
Fields:
- Product Name (Single line text)
- Service Type (Reference to Service Types)
- Category (Single select: Templates/Installation/Support)
- Description (Long text)
- Price (Number)
- Features (Long text)
- Download Link (URL)
- Installation Guide (Long text)
- Status (Single select: Published/Draft/Archived)
```

#### **C. Niche Solutions Collection**
```
Fields:
- Niche Name (Single line text)
- Service Type (Reference to Service Types)
- Description (Long text)
- Solutions Included (Long text)
- Pricing (Number)
- Target Market (Long text)
- Case Study (Reference to Use Cases)
- Status (Single select: Available/In Development/Archived)
```

#### **D. Customer Stories Collection**
```
Fields:
- Customer Name (Single line text)
- Company (Single line text)
- Service Type (Reference to Service Types)
- Story (Long text)
- Results (Long text)
- Before/After Images (Multi Image)
- Video Testimonial (Video)
- Status (Single select: Published/Draft/Archived)
```

---

## 🔄 **SYNCHRONIZATION STRATEGY**

### **1. Airtable → Webflow Sync**
**Frequency**: Real-time via webhooks + scheduled sync (every 15 minutes)

#### **Sync Process**:
```javascript
// Pseudo-code for sync process
async function syncAirtableToWebflow() {
    // 1. Get updated records from Airtable
    const updatedRecords = await airtable.getUpdatedRecords();
    
    // 2. Transform data for Webflow format
    const webflowData = transformForWebflow(updatedRecords);
    
    // 3. Update Webflow CMS
    for (const item of webflowData) {
        if (item.webflowItemId) {
            await webflow.updateItem(item);
        } else {
            await webflow.createItem(item);
        }
    }
}
```

#### **Webhook Configuration**:
```
Airtable Webhooks:
- Base: Core Business Operations
- Table: Service Types → Webflow: Service Types Collection
- Table: Marketplace Products → Webflow: Marketplace Products Collection
- Table: Ready Solutions → Webflow: Niche Solutions Collection
- Table: Customers → Webflow: Customer Stories Collection
```

### **2. Webflow → Vercel Sync**
**Frequency**: Real-time via Webflow API

#### **API Integration**:
```javascript
// Fetch content from Webflow CMS
async function fetchWebflowContent() {
    const collections = await webflow.getCollections();
    const content = {};
    
    for (const collection of collections) {
        content[collection.slug] = await webflow.getItems(collection.id);
    }
    
    return content;
}
```

### **3. MongoDB Integration**
**Purpose**: Application data, user sessions, real-time data

#### **Collections**:
```
- users (user accounts, preferences)
- sessions (user sessions, authentication)
- api_calls (usage tracking, billing)
- analytics (user behavior, performance)
- subscriptions (active subscriptions, billing)
```

---

## 🛠️ **IMPLEMENTATION PLAN**

### **Phase 1: Airtable Setup (Week 1)**
1. **Create Service Types Table**
   - Add all 4 service types
   - Configure fields and relationships
   - Set up automation rules

2. **Create Marketplace Products Table**
   - Add existing n8n templates
   - Configure pricing and features
   - Set up product categories

3. **Create Custom Solutions Table**
   - Add consultation tracking
   - Configure business plan storage
   - Set up implementation status

4. **Create Subscriptions Table**
   - Add niche selection options
   - Configure lead volume tracking
   - Set up CRM integration fields

5. **Create Ready Solutions Table**
   - Add niche-specific packages
   - Configure solution bundles
   - Set up pricing models

### **Phase 2: Webflow CMS Setup (Week 2)**
1. **Create Service Types Collection**
   - Add 4 service type items
   - Configure fields and relationships
   - Set up collection settings

2. **Create Marketplace Products Collection**
   - Add product items from Airtable
   - Configure pricing display
   - Set up download links

3. **Create Niche Solutions Collection**
   - Add niche-specific solutions
   - Configure package descriptions
   - Set up pricing information

4. **Create Customer Stories Collection**
   - Add success stories
   - Configure testimonials
   - Set up case studies

### **Phase 3: Synchronization Setup (Week 3)**
1. **Airtable Webhooks**
   - Configure webhook endpoints
   - Set up authentication
   - Test webhook delivery

2. **Webflow API Integration**
   - Set up API authentication
   - Configure collection access
   - Test data synchronization

3. **Vercel API Endpoints**
   - Create sync endpoints
   - Set up error handling
   - Configure logging

### **Phase 4: Testing & Optimization (Week 4)**
1. **Data Flow Testing**
   - Test Airtable → Webflow sync
   - Test Webflow → Vercel sync
   - Test MongoDB integration

2. **Performance Optimization**
   - Optimize sync frequency
   - Implement caching
   - Set up monitoring

3. **Error Handling**
   - Set up retry mechanisms
   - Configure alerting
   - Implement fallback procedures

---

## 📋 **SYNCHRONIZATION RULES**

### **Data Mapping Rules**:

#### **Service Types**:
```
Airtable: Service Types Table
    ↓
Webflow: Service Types Collection
    ↓
Vercel: Homepage Service Cards
```

#### **Marketplace Products**:
```
Airtable: Marketplace Products Table
    ↓
Webflow: Marketplace Products Collection
    ↓
Vercel: /marketplace page
```

#### **Custom Solutions**:
```
Airtable: Custom Solutions Table
    ↓
Webflow: Service Types Collection (Custom Solutions)
    ↓
Vercel: /custom page
```

#### **Subscriptions**:
```
Airtable: Subscriptions Table
    ↓
Webflow: Service Types Collection (Subscriptions)
    ↓
Vercel: /subscriptions page
```

#### **Ready Solutions**:
```
Airtable: Ready Solutions Table
    ↓
Webflow: Niche Solutions Collection
    ↓
Vercel: /solutions/[niche] pages
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **API Endpoints**:
```
POST /api/sync/airtable-to-webflow
GET /api/sync/webflow-to-vercel
POST /api/sync/update-content
GET /api/sync/status
```

### **Webhook Endpoints**:
```
POST /api/webhooks/airtable/service-types
POST /api/webhooks/airtable/marketplace-products
POST /api/webhooks/airtable/custom-solutions
POST /api/webhooks/airtable/subscriptions
POST /api/webhooks/airtable/ready-solutions
```

### **Database Schema**:
```sql
-- Sync tracking table
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    source_table VARCHAR(100),
    target_collection VARCHAR(100),
    record_id VARCHAR(100),
    status VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Content cache table
CREATE TABLE content_cache (
    id SERIAL PRIMARY KEY,
    collection_slug VARCHAR(100),
    item_id VARCHAR(100),
    content JSONB,
    last_sync TIMESTAMP,
    created_at TIMESTAMP
);
```

---

## 🎯 **SUCCESS CRITERIA**

### **Data Consistency**:
- ✅ All Airtable data synced to Webflow within 15 minutes
- ✅ All Webflow content available on Vercel website
- ✅ No data conflicts or duplicates
- ✅ Real-time updates for critical content

### **Performance**:
- ✅ Sync operations complete within 30 seconds
- ✅ Website loads content within 2 seconds
- ✅ 99.9% uptime for sync operations
- ✅ Error recovery within 5 minutes

### **Business Impact**:
- ✅ All 4 service types properly represented
- ✅ Customer data flows seamlessly
- ✅ Content updates reflect immediately
- ✅ Analytics track all user interactions

---

## 🚨 **CRITICAL REMINDERS**

1. **AIRTABLE IS SOURCE OF TRUTH** - All business data originates here
2. **WEBFLOW IS CONTENT DISPLAY** - Marketing content and public information
3. **MONGODB IS APPLICATION DATA** - User sessions, API data, real-time data
4. **VERCEL IS PRESENTATION LAYER** - Website display and user interactions
5. **SYNC FREQUENCY** - Real-time for critical data, 15-minute intervals for content
6. **ERROR HANDLING** - Always have fallback procedures and retry mechanisms
7. **MONITORING** - Track all sync operations and performance metrics

---

**Last Updated**: September 30, 2024  
**Status**: 🏗️ **ARCHITECTURE PLANNING**  
**Next Steps**: Begin Phase 1 implementation
