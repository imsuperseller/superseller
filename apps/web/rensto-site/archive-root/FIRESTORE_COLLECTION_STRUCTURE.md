# 🔥 Firestore Collection Structure - Rensto Platform
## Optimized for SMB Service Businesses (Jan 2026)

**Last Updated**: January 5, 2026  
**Status**: 📋 Redesigned Based on Market Research  
**Purpose**: Comprehensive Firestore schema optimized for service-based SMB customers (HVAC, realtors, restaurants, insurance agents, CPAs, garage doors, local stores, etc.)

---

## 🎯 Design Philosophy

### **Core Principle**: Outcome-Focused, Not Feature-Focused

Collections are designed around **business outcomes** that SMB service businesses care about:
1. **Speed to Lead** - Track response times (critical: <5 min = 21x conversion)
2. **Lead Qualification** - Pre-qualify leads before owner invests time
3. **Appointment Booking** - Eliminate back-and-forth scheduling
4. **24/7 Availability** - Never miss a lead, even at 2am
5. **Time Savings** - Track hours saved per month (ROI metric)

### **Target Customer Profile**
- **WHO**: 1-50 employees, $200K-$10M revenue, service-based businesses
- **PAIN**: Missing leads, wasting time on repetitive tasks, no work-life balance
- **BUDGET**: $250-$500/month for automation, $997-$5,000 one-time for setup
- **TECH LEVEL**: Not tech-savvy, needs "done for you" solutions

---

## 📦 Complete Collection Structure

### **1. CUSTOMER & IDENTITY**

#### `users` ❌ (MISSING - CRITICAL)
**Purpose**: End-user accounts (paying customers)  
**Why Critical**: Foundation for all customer relationships

**Key Fields**:
```typescript
{
  id: string;                    // Firebase Auth UID or email-based
  email: string;                // Primary identifier
  name?: string;
  phone?: string;
  
  // Business Profile (SMB-specific)
  businessName?: string;
  businessType: 'hvac' | 'realtor' | 'restaurant' | 'insurance' | 'cpa' | 'garage_door' | 'local_store' | 'lawyer' | 'contractor' | 'other';
  businessSize: 'solo' | 'small_team' | 'medium_team'; // 1-5, 6-20, 21-50
  revenueRange?: '$200k-500k' | '$500k-1m' | '$1m-5m' | '$5m-10m';
  
  // Account Status
  status: 'active' | 'suspended' | 'cancelled';
  emailVerified: boolean;
  
  // Service Access
  activeServices: {
    marketplace: boolean;
    whatsapp: boolean;          // WhatsApp AI agent
    subscriptions: boolean;     // Lead generation
    custom_solutions: boolean;
    care_plan: 'none' | 'starter' | 'growth' | 'scale';
  };
  
  // Billing
  stripeCustomerId?: string;
  defaultPaymentMethodId?: string;
  billingAddress?: Address;
  
  // Preferences
  preferences: {
    language: 'en' | 'he' | 'es';  // Multi-language support
    emailNotifications: boolean;
    smsNotifications: boolean;
    timezone?: string;              // For appointment booking
  };
  
  // Metadata
  source: 'organic' | 'referral' | 'paid_ad' | 'partner' | 'qualification_quiz';
  referrerId?: string;
  qualificationScore?: number;      // From /custom quiz
  qualificationTier?: 'high' | 'medium' | 'low';
  
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `email` (ascending) - unique
- `businessType` (ascending) + `status` (ascending)
- `stripeCustomerId` (ascending)
- `activeServices.whatsapp` (ascending) + `status` (ascending)
- `activeServices.care_plan` (ascending) + `status` (ascending)
- `createdAt` (descending)

---

### **2. WHATSAPP AI AGENT (Primary Service)**

#### `whatsapp_instances` ❌ (MISSING - CRITICAL)
**Purpose**: Active WhatsApp AI agent deployments  
**Why Critical**: This is your #1 product for SMBs - needs dedicated tracking

**Key Fields**:
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  businessType: string;
  
  // WhatsApp Configuration
  phoneNumber: string;              // WhatsApp Business number
  wahaInstanceId?: string;         // WAHA Pro instance ID
  n8nWorkflowId?: string;          // n8n workflow managing this agent
  
  // Bundle Selection (Outcome-Focused)
  bundle: 'never_miss_lead' | 'auto_qualify_book' | 'full_ai_sales_rep';
  bundleFeatures: {
    instantResponse: boolean;       // 24/7 instant replies
    faqAutoAnswer: boolean;         // Answer common questions
    leadCapture: boolean;           // Capture name, phone, email
    qualification: boolean;          // Ask qualifying questions
    appointmentBooking: boolean;     // Book directly in calendar
    quoteSending: boolean;          // Send estimates via WhatsApp
    objectionHandling: boolean;     // Handle "too expensive" etc.
    multiLanguage: boolean;         // Spanish, Hebrew, etc.
    humanEscalation: boolean;       // "Alert Me" button
  };
  
  // Add-Ons (Outcome-Focused, Not Technical)
  addOns: {
    sendPhotosQuotes: boolean;     // Send/receive photos & estimates
    teamInbox: boolean;             // Multiple people manage same WhatsApp
    smartMenus: boolean;            // Button menus instead of typing
    multiLocation: boolean;        // Separate agents per location
  };
  
  // Status
  status: 'pending_setup' | 'provisioning' | 'active' | 'suspended' | 'cancelled';
  
  // Performance Metrics (Speed-to-Lead Tracking)
  metrics: {
    totalMessages: number;
    averageResponseTime: number;    // In seconds (target: <5 min = 300s)
    leadsCaptured: number;
    appointmentsBooked: number;
    quotesSent: number;
    humanEscalations: number;
    lastResponseTime?: number;       // Most recent response time
  };
  
  // Configuration
  configuration: {
    businessHours?: { start: string; end: string; timezone: string };
    serviceAreas?: string[];        // Geographic coverage
    pricing?: Record<string, number>; // Service pricing for FAQs
    calendarIntegration?: 'tidycal' | 'calendly' | 'google';
    crmIntegration?: 'hubspot' | 'salesforce' | 'pipedrive' | 'workiz' | 'custom';
  };
  
  // Subscription Link
  subscriptionId?: string;          // Links to subscriptions collection
  carePlanId?: string;             // Links to care_plan_deliverables
  
  createdAt: Timestamp;
  activatedAt?: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `status` (ascending)
- `status` (ascending) + `createdAt` (ascending)
- `bundle` (ascending) + `status` (ascending)
- `phoneNumber` (ascending) - unique

---

#### `whatsapp_messages` ❌ (MISSING - HIGH PRIORITY)
**Purpose**: Message history for WhatsApp AI agents  
**Why Needed**: Track conversations, response times, lead quality

**Key Fields**:
```typescript
{
  id: string;
  whatsappInstanceId: string;
  userId: string;
  
  // Message Details
  from: string;                    // Customer phone number
  to: string;                      // Business WhatsApp number
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  content: string;                  // Message text or media URL
  direction: 'inbound' | 'outbound';
  
  // Speed-to-Lead Tracking (CRITICAL METRIC)
  responseTime?: number;           // Seconds between customer message and AI response
  isFirstContact: boolean;         // First message from this customer
  firstResponseTime?: number;      // Time to first response (target: <300s)
  
  // Lead Qualification
  leadStatus?: 'new' | 'qualified' | 'booked' | 'quoted' | 'converted' | 'lost';
  qualificationData?: {
    budget?: string;
    timeline?: string;
    urgency?: 'immediate' | 'this_week' | 'this_month' | 'exploring';
    serviceNeeded?: string;
  };
  
  // Appointment Booking
  appointmentBooked?: {
    appointmentId: string;         // Links to appointment_bookings
    date: Timestamp;
    serviceType: string;
  };
  
  // Human Escalation
  escalatedToHuman: boolean;
  escalatedAt?: Timestamp;
  humanRespondedAt?: Timestamp;
  
  // Metadata
  sessionId?: string;              // Conversation session
  metadata?: Record<string, any>;
  
  createdAt: Timestamp;
}
```

**Indexes Needed**:
- `whatsappInstanceId` (ascending) + `createdAt` (descending)
- `from` (ascending) + `createdAt` (descending)
- `isFirstContact` (ascending) + `firstResponseTime` (ascending)
- `leadStatus` (ascending) + `createdAt` (descending)
- `responseTime` (ascending) - for performance analysis

---

#### `appointment_bookings` ❌ (MISSING - HIGH PRIORITY)
**Purpose**: Appointments booked through WhatsApp AI  
**Why Critical**: Eliminates scheduling back-and-forth (major pain point)

**Key Fields**:
```typescript
{
  id: string;
  whatsappInstanceId: string;
  userId: string;
  
  // Customer Info
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  
  // Appointment Details
  serviceType: string;             // "AC Repair", "Home Inspection", etc.
  appointmentDate: Timestamp;
  appointmentTime: string;          // "10:00 AM"
  duration: number;                // Minutes
  location?: string;               // Service address
  
  // Status
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  confirmedAt?: Timestamp;
  reminderSent?: boolean;
  reminderSentAt?: Timestamp;
  
  // Calendar Integration
  calendarEventId?: string;        // TidyCal/Calendly/Google Calendar ID
  calendarProvider?: 'tidycal' | 'calendly' | 'google';
  
  // Source
  source: 'whatsapp_ai' | 'manual' | 'website' | 'phone';
  whatsappMessageId?: string;      // Links to whatsapp_messages
  
  // Notes
  notes?: string;
  internalNotes?: string;         // Admin-only
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `appointmentDate` (ascending)
- `whatsappInstanceId` (ascending) + `appointmentDate` (ascending)
- `status` (ascending) + `appointmentDate` (ascending)
- `customerPhone` (ascending) + `createdAt` (descending)

---

### **3. SUBSCRIPTIONS & RECURRING SERVICES**

#### `subscriptions` ❌ (MISSING - CRITICAL)
**Purpose**: Active recurring subscriptions (WhatsApp, Care Plans, Lead Gen)  
**Why Critical**: Major revenue stream ($250-$2,497/month)

**Key Fields**:
```typescript
{
  id: string;
  userId: string;
  userEmail: string;
  
  // Stripe Integration
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  stripePriceId: string;
  
  // Subscription Type
  subscriptionType: 'whatsapp' | 'care_plan' | 'lead_generation' | 'content_ai';
  
  // WhatsApp Subscriptions
  whatsappBundle?: 'never_miss_lead' | 'auto_qualify_book' | 'full_ai_sales_rep';
  whatsappInstanceId?: string;     // Links to whatsapp_instances
  
  // Care Plan Subscriptions
  carePlanTier?: 'starter' | 'growth' | 'scale';
  carePlanDeliverables?: {         // What's included this month
    hoursIncluded: number;          // 5, 15, or 40
    hoursUsed: number;
    automationsBuilt: number;
    optimizationsDone: number;
    checkInCalls: number;
  };
  
  // Lead Generation Subscriptions
  leadGenTier?: 'low' | 'medium' | 'high' | 'enterprise';
  leadGenConfig?: {
    leadsPerMonth: number;         // 10-50, 50-200, 200-500, 500+
    sources: string[];              // LinkedIn, Google Maps, Facebook, etc.
    niche?: string;                 // HVAC, realtor, etc.
  };
  
  // Pricing
  amount: number;                  // Monthly amount in cents
  currency: string;
  billingInterval: 'month' | 'year';
  
  // Status
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Timestamp;
  currentPeriodEnd: Timestamp;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Timestamp;
  
  // Usage Tracking
  usageLimits?: {
    leadsPerMonth?: number;
    messagesPerMonth?: number;
    apiCallsPerMonth?: number;
  };
  currentUsage?: {
    leadsThisMonth?: number;
    messagesThisMonth?: number;
    apiCallsThisMonth?: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `status` (ascending)
- `stripeSubscriptionId` (ascending) - unique
- `subscriptionType` (ascending) + `status` (ascending)
- `status` (ascending) + `currentPeriodEnd` (ascending)
- `whatsappInstanceId` (ascending) + `status` (ascending)

---

#### `care_plan_deliverables` ❌ (MISSING - HIGH PRIORITY)
**Purpose**: Track what's delivered each month in Care Plans  
**Why Needed**: Transparency and accountability for monthly retainer

**Key Fields**:
```typescript
{
  id: string;
  userId: string;
  subscriptionId: string;
  carePlanTier: 'starter' | 'growth' | 'scale';
  
  // Period
  periodStart: Timestamp;
  periodEnd: Timestamp;
  month: string;                   // "2026-01"
  
  // Deliverables (Specific, Not Vague)
  deliverables: {
    // Starter Care (5 hours)
    monitoringHours?: number;      // System monitoring time
    fixHours?: number;             // Fixing broken automations
    checkInCall?: boolean;         // Monthly 15-min call
    faqUpdates?: number;           // Number of FAQ updates
    performanceReport?: boolean;   // Basic report sent
    
    // Growth Care (15 hours) - includes Starter +:
    newAutomationsBuilt?: number;  // 1-2 new automations
    optimizationHours?: number;    // Optimizing existing flows
    strategyCall?: boolean;        // Quarterly 1-hour call
    abTestsRun?: number;           // A/B test messaging
    crmMaintenance?: boolean;      // CRM integration maintenance
    
    // Scale Care (40 hours) - includes Growth +:
    customFeatures?: string[];     // Custom features built
    weeklySyncCalls?: number;      // Weekly calls
    analyticsDashboard?: boolean;  // Full dashboard created
    multiLocationSupport?: boolean;
    priorityResponseTime?: number; // Hours (target: <4)
  };
  
  // Hours Tracking
  hoursAllocated: number;          // 5, 15, or 40
  hoursUsed: number;
  hoursRemaining: number;
  
  // Status
  status: 'in_progress' | 'completed' | 'overdue';
  completedAt?: Timestamp;
  
  // Notes
  notes?: string;
  customerFeedback?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `periodStart` (descending)
- `subscriptionId` (ascending) + `periodStart` (descending)
- `status` (ascending) + `periodEnd` (ascending)

---

### **4. LEADS & QUALIFICATION**

#### `leads` ❌ (MISSING - CRITICAL)
**Purpose**: Leads delivered to customers (from subscriptions or WhatsApp)  
**Why Critical**: Track lead quality, speed-to-lead, conversion

**Key Fields**:
```typescript
{
  id: string;
  
  // Source
  source: 'whatsapp' | 'linkedin' | 'google_maps' | 'facebook' | 'apify' | 'manual' | 'qualification_quiz';
  sourceId?: string;               // External ID from source
  
  // Customer Links
  userId: string;                  // Who owns this lead
  subscriptionId?: string;         // If from subscription
  whatsappInstanceId?: string;     // If from WhatsApp
  
  // Lead Data
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  
  // Speed-to-Lead Tracking (CRITICAL METRIC)
  firstContactAt?: Timestamp;     // When lead first reached out
  firstResponseAt?: Timestamp;     // When we first responded
  responseTime?: number;           // Seconds (target: <300s = 5 min)
  responseTimeStatus?: 'excellent' | 'good' | 'poor'; // <5min, 5-30min, >30min
  
  // Qualification (Pre-Qualify Before Owner Invests Time)
  qualificationStatus: 'unqualified' | 'qualified' | 'high_priority';
  qualificationData?: {
    budget?: string;
    timeline?: string;
    urgency?: 'immediate' | 'this_week' | 'this_month' | 'exploring';
    serviceNeeded?: string;
    businessType?: string;
    decisionMaker?: boolean;
  };
  
  // Enrichment
  enrichedData?: {
    linkedinUrl?: string;
    companySize?: string;
    industry?: string;
    revenue?: string;
    technologies?: string[];
  };
  
  // Status (Customer's CRM Status)
  status: 'new' | 'contacted' | 'qualified' | 'quoted' | 'converted' | 'lost';
  statusUpdatedAt?: Timestamp;
  
  // Delivery
  deliveredAt: Timestamp;
  deliveryMethod: 'whatsapp' | 'email' | 'api' | 'webhook' | 'dashboard' | 'crm';
  
  // Conversion Tracking
  convertedAt?: Timestamp;
  conversionValue?: number;        // Revenue from this lead
  conversionSource?: string;       // How they converted
  
  // Metadata
  tags?: string[];
  notes?: string;
  metadata?: Record<string, any>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `deliveredAt` (descending)
- `subscriptionId` (ascending) + `deliveredAt` (descending)
- `whatsappInstanceId` (ascending) + `deliveredAt` (descending)
- `source` (ascending) + `deliveredAt` (descending)
- `status` (ascending) + `deliveredAt` (descending)
- `responseTimeStatus` (ascending) + `deliveredAt` (descending)
- `qualificationStatus` (ascending) + `deliveredAt` (descending)

---

### **5. PRODUCTS & SERVICES**

#### `templates` ✅ (EXISTS)
**Purpose**: Marketplace workflow templates  
**Note**: Only show `readinessStatus: 'Active'` and `showInMarketplace: true`

**Indexes Needed**:
- `readinessStatus` (ascending) + `showInMarketplace` (ascending) + `createdAt` (descending)
- `category` (ascending) + `readinessStatus` (ascending)
- `businessType` (ascending) + `readinessStatus` (ascending) - NEW: Filter by business type

---

#### `service_instances` ✅ (EXISTS)
**Purpose**: Active service deployments  
**Enhancement**: Add WhatsApp-specific fields

**Additional Fields Needed**:
```typescript
{
  // ... existing fields ...
  
  // WhatsApp-Specific
  whatsappInstanceId?: string;    // Links to whatsapp_instances
  whatsappBundle?: string;
  
  // Performance Metrics
  speedToLeadAverage?: number;     // Average response time
  leadsCaptured?: number;
  appointmentsBooked?: number;
}
```

---

### **6. BUSINESS NICHES & TARGETING**

#### `business_niches` ❌ (MISSING - MEDIUM PRIORITY)
**Purpose**: Expanded list of SMB service business types  
**Why Needed**: Better targeting and customization

**Key Fields**:
```typescript
{
  id: string;
  name: string;                    // "HVAC Contractor"
  slug: string;                    // "hvac"
  category: 'home_services' | 'professional_services' | 'retail' | 'food_service' | 'other';
  
  // Common Pain Points (For Personalization)
  painPoints: string[];            // ["Missing calls on jobs", "Tire-kickers waste time"]
  
  // Common Services (For FAQs)
  commonServices: string[];        // ["AC Repair", "Furnace Installation", etc.]
  
  // Typical Business Profile
  typicalRevenue: string;          // "$200k-$1M"
  typicalEmployees: string;         // "1-10"
  
  // WhatsApp Configuration Templates
  whatsappFaqs?: Array<{
    question: string;
    answer: string;
  }>;
  
  isActive: boolean;
  order: number;                    // Display order
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `category` (ascending) + `isActive` (ascending) + `order` (ascending)
- `slug` (ascending) - unique

**Initial Data** (Based on your examples):
- HVAC Contractor
- Real Estate Agent
- Restaurant Manager
- Insurance Agent
- CPA (Small Firm)
- Garage Door Service
- Local Store Owner
- Lawyer (Solo/Small Firm)
- Plumber
- Electrician
- Roofer
- Locksmith
- Photographer
- Bookkeeper
- And more...

---

### **7. ANALYTICS & PERFORMANCE**

#### `response_time_metrics` ❌ (MISSING - HIGH PRIORITY)
**Purpose**: Track speed-to-lead performance (critical SMB metric)  
**Why Critical**: <5 min response = 21x conversion rate

**Key Fields**:
```typescript
{
  id: string;
  userId: string;
  whatsappInstanceId?: string;
  subscriptionId?: string;
  
  // Time Period
  period: string;                  // "2026-01"
  periodStart: Timestamp;
  periodEnd: Timestamp;
  
  // Metrics
  totalLeads: number;
  averageResponseTime: number;      // Seconds
  medianResponseTime: number;
  
  // Response Time Buckets
  responseTimeBuckets: {
    under5min: number;              // <300s (excellent)
    under30min: number;             // 300-1800s (good)
    over30min: number;              // >1800s (poor)
  };
  
  // Conversion by Response Time
  conversionsBySpeed: {
    under5min: { leads: number; conversions: number; rate: number };
    under30min: { leads: number; conversions: number; rate: number };
    over30min: { leads: number; conversions: number; rate: number };
  };
  
  // Goals
  targetResponseTime: number;       // Usually 300s (5 min)
  goalMet: boolean;                 // Average < target?
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Indexes Needed**:
- `userId` (ascending) + `periodStart` (descending)
- `whatsappInstanceId` (ascending) + `periodStart` (descending)

---

### **8. EXISTING COLLECTIONS (Keep As-Is)**

#### ✅ **Keep These**:
- `clients` - Customer profiles for testimonials
- `purchases` - One-time purchases
- `payments` - Payment transaction log
- `customization_requests` - Service modification requests
- `support_cases` - Customer support tickets
- `consultations` - Custom Solutions consultations
- `testimonials` - Marketing testimonials
- `analytics` - General analytics events
- `usage_logs` - Service usage tracking
- `audits` - Service audit logs
- `magic_link_tokens` - Auth tokens
- `downloads` - Download tracking
- `service_manifests` - Service definitions
- `proposals` - Custom Solutions proposals
- `requirements` - Custom Solutions requirements
- `scorecards` - Audit scorecards
- `optimizer_audits` - Optimizer audit results

---

## 📊 Collection Summary

### ✅ **EXISTING (17 collections)**
All existing collections remain, with enhancements where noted.

### ❌ **MISSING - CRITICAL (7 collections)**
1. **`users`** - End-user accounts (HIGHEST PRIORITY)
2. **`whatsapp_instances`** - WhatsApp AI agent deployments (HIGHEST PRIORITY)
3. **`whatsapp_messages`** - Message history & speed-to-lead tracking (HIGH PRIORITY)
4. **`appointment_bookings`** - Appointments booked via AI (HIGH PRIORITY)
5. **`subscriptions`** - Recurring subscriptions (HIGHEST PRIORITY)
6. **`leads`** - Leads with speed-to-lead tracking (HIGHEST PRIORITY)
7. **`care_plan_deliverables`** - Monthly Care Plan deliverables (HIGH PRIORITY)

### ⚠️ **MISSING - MEDIUM PRIORITY (2 collections)**
8. **`business_niches`** - Expanded SMB business types
9. **`response_time_metrics`** - Speed-to-lead performance tracking

**Total Collections**: 26 (17 existing + 9 new)

---

## 🎯 Implementation Priority

### **Phase 1: Critical Foundation** (Week 1)
1. **`users`** - Foundation for all customer relationships
2. **`subscriptions`** - Major revenue stream tracking
3. **`whatsapp_instances`** - Primary product for SMBs

### **Phase 2: WhatsApp Core** (Week 2)
4. **`whatsapp_messages`** - Message tracking & speed-to-lead
5. **`appointment_bookings`** - Eliminate scheduling pain
6. **`leads`** - Lead tracking with speed metrics

### **Phase 3: Care Plans & Analytics** (Week 3)
7. **`care_plan_deliverables`** - Monthly retainer transparency
8. **`response_time_metrics`** - Performance dashboards
9. **`business_niches`** - Better targeting

---

## 📈 Data Volume Estimates (Year 1)

| Collection | Estimated Records | Growth Rate | Storage |
|------------|------------------|-------------|---------|
| `users` | 500-1,000 | Medium | ~5MB |
| `whatsapp_instances` | 200-500 | High | ~10MB |
| `whatsapp_messages` | 500,000-2M | Very High | ~2GB |
| `appointment_bookings` | 10,000-50,000 | High | ~50MB |
| `subscriptions` | 300-800 | Medium | ~5MB |
| `leads` | 100,000-500,000 | Very High | ~1GB |
| `care_plan_deliverables` | 1,200-9,600 | Medium | ~5MB |
| `response_time_metrics` | 1,200-9,600 | Medium | ~5MB |
| `business_niches` | 20-50 | Low | ~1MB |

**Total Storage Estimate**: ~3-4GB in Year 1 (mostly messages & leads)

---

## 🔍 Index Strategy

**Total Indexes Needed**: ~50-60 composite indexes

**Key Query Patterns**:
- **Speed-to-Lead**: `whatsappInstanceId + isFirstContact + firstResponseTime`
- **User Dashboard**: `userId + status + createdAt`
- **Fulfillment Queue**: `status + fulfillmentStatus + createdAt`
- **Performance Metrics**: `userId + periodStart + averageResponseTime`
- **Lead Quality**: `userId + qualificationStatus + deliveredAt`

---

## ✅ Next Steps

1. ✅ **Review this structure** - You're doing this now!
2. **Create missing collections** (9 new collections)
3. **Set up Firestore indexes** (~50-60 indexes)
4. **Migrate existing data** to new structure
5. **Update API routes** to use new collections
6. **Seed `business_niches`** with initial data
7. **Test with real data** before production deployment

---

## 🎯 Key Design Decisions

1. **WhatsApp-First**: Dedicated collections for WhatsApp (primary SMB product)
2. **Speed-to-Lead Tracking**: Built into `whatsapp_messages` and `leads` (critical metric)
3. **Outcome-Focused**: Bundle names reflect outcomes, not technical features
4. **Care Plan Transparency**: `care_plan_deliverables` tracks specific monthly outputs
5. **Business Niche Expansion**: Support for 20+ SMB service business types
6. **Appointment Booking**: Dedicated collection (major pain point solved)

---

**Questions Resolved**:
- ✅ WhatsApp gets dedicated collections (it's the #1 product)
- ✅ Speed-to-lead tracking is built-in (critical SMB metric)
- ✅ Care Plans have specific deliverables (not just "hours")
- ✅ Business niches expanded beyond 7 types
- ✅ Outcome-focused bundles, not technical features
