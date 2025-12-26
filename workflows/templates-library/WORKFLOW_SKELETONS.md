# 🦴 WORKFLOW SKELETONS - Reusable Patterns Across Niches

**Last Updated**: December 11, 2025  
**Purpose**: Define common workflow skeletons that can be productized and reused across different niches

---

## 🎯 OVERVIEW

Workflow skeletons are **reusable patterns** that solve common business problems across industries. By defining these skeletons, we can:

1. **Productize Faster**: Copy skeleton → Customize for niche → Deploy
2. **Maintain Consistency**: Same structure across all clients
3. **Scale Efficiently**: One skeleton → Multiple niches
4. **Reduce Errors**: Proven patterns, less debugging

---

## 📊 THE 5 CORE SKELETONS

### **1. Lead-to-Customer Journey** (Most Common)
```
Lead Capture → Qualification → Scheduling → Onboarding → Fulfillment → Retention
```

### **2. Service Request Flow**
```
Request → Quote → Approval → Scheduling → Service Delivery → Payment → Follow-up
```

### **3. Content Production Pipeline**
```
Idea → Research → Creation → Review → Publishing → Distribution → Analytics
```

### **4. Support Ticket Lifecycle**
```
Ticket Creation → Classification → Assignment → Resolution → Follow-up → Closure
```

### **5. Appointment Management**
```
Booking Request → Availability Check → Confirmation → Reminders → Service → Follow-up
```

---

## 🦴 SKELETON 1: LEAD-TO-CUSTOMER JOURNEY

### **Pattern Overview**

This is the **most common skeleton** across all niches. Every business needs to:
1. Capture leads
2. Qualify them
3. Schedule consultations
4. Onboard them
5. Deliver service
6. Retain them

### **Full Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│              LEAD-TO-CUSTOMER JOURNEY SKELETON                   │
└─────────────────────────────────────────────────────────────────┘

[1] LEAD CAPTURE
    │
    ├─▶ Web Form (Typeform/Webflow)
    ├─▶ Landing Page CTA
    ├─▶ WhatsApp Message
    ├─▶ Phone Call
    └─▶ Social Media DM
    │
    ▼
[2] LEAD QUALIFICATION
    │
    ├─▶ AI Qualification Agent
    │   ├─▶ Budget Check
    │   ├─▶ Timeline Check
    │   ├─▶ Need Assessment
    │   └─▶ Fit Score (0-100)
    │
    ├─▶ Human Review (if score < 70)
    └─▶ Auto-qualify (if score ≥ 70)
    │
    ▼
[3] SCHEDULING
    │
    ├─▶ Calendar Check (TidyCal/Calendly)
    ├─▶ Send Booking Link
    ├─▶ Confirmation Email/SMS
    └─▶ Reminder Sequence (24h, 2h before)
    │
    ▼
[4] ONBOARDING
    │
    ├─▶ Welcome Email Sequence
    ├─▶ Setup Call (if needed)
    ├─▶ Access Credentials
    ├─▶ Documentation Delivery
    └─▶ Kickoff Meeting
    │
    ▼
[5] FULFILLMENT
    │
    ├─▶ Service Delivery
    ├─▶ Progress Tracking
    ├─▶ Milestone Updates
    └─▶ Quality Checks
    │
    ▼
[6] RETENTION
    │
    ├─▶ Post-Delivery Survey
    ├─▶ Upsell Opportunities
    ├─▶ Referral Request
    └─▶ Renewal Reminders
```

### **Reusable Components**

| Stage | Function Workflow | Purpose |
|-------|------------------|---------|
| **Lead Capture** | `func_capture_lead.json` | Standardize lead data format |
| **Qualification** | `func_qualify_lead.json` | AI-powered qualification scoring |
| **Scheduling** | `func_schedule_meeting.json` | Calendar integration & booking |
| **Onboarding** | `func_onboard_customer.json` | Automated onboarding sequence |
| **Fulfillment** | `func_track_progress.json` | Milestone tracking |
| **Retention** | `func_retention_campaign.json` | Post-delivery engagement |

### **Niche Customizations**

#### **HVAC Contractor**
- **Lead Capture**: Service request form (emergency/non-emergency)
- **Qualification**: Service type, location, urgency
- **Scheduling**: Technician dispatch (same-day/next-day)
- **Onboarding**: Service agreement, payment terms
- **Fulfillment**: Service completion, invoice generation
- **Retention**: Maintenance reminders, seasonal check-ups

#### **Real Estate Agent**
- **Lead Capture**: Property inquiry form
- **Qualification**: Budget, timeline, property type, location
- **Scheduling**: Property viewing appointments
- **Onboarding**: Buyer/seller agreement, MLS access
- **Fulfillment**: Property search, showings, offer management
- **Retention**: Market updates, referral program

#### **Dentist**
- **Lead Capture**: Appointment request form
- **Qualification**: Treatment type, insurance, urgency
- **Scheduling**: Appointment booking (with availability)
- **Onboarding**: New patient forms, insurance verification
- **Fulfillment**: Treatment delivery, follow-up care
- **Retention**: Hygiene reminders, check-up scheduling

#### **Lawyer**
- **Lead Capture**: Consultation request form
- **Qualification**: Case type, jurisdiction, conflict check
- **Scheduling**: Consultation call/meeting
- **Onboarding**: Engagement letter, retainer agreement
- **Fulfillment**: Case work, document management
- **Retention**: Case updates, client communication

### **Implementation Template**

```json
{
  "skeleton": "lead-to-customer-journey",
  "version": "1.0.0",
  "stages": [
    {
      "stage": "lead-capture",
      "workflow": "func_capture_lead",
      "inputs": {
        "source": "{{ $json.source }}",
        "leadData": "{{ $json.leadData }}"
      },
      "outputs": {
        "leadId": "{{ $json.leadId }}",
        "qualified": false
      }
    },
    {
      "stage": "qualification",
      "workflow": "func_qualify_lead",
      "inputs": {
        "leadId": "{{ $json.leadId }}",
        "leadData": "{{ $json.leadData }}"
      },
      "outputs": {
        "qualified": true,
        "score": 85,
        "tier": "premium"
      }
    },
    {
      "stage": "scheduling",
      "workflow": "func_schedule_meeting",
      "condition": "{{ $json.qualified === true }}",
      "inputs": {
        "leadId": "{{ $json.leadId }}",
        "meetingType": "consultation"
      }
    },
    {
      "stage": "onboarding",
      "workflow": "func_onboard_customer",
      "trigger": "meeting_completed",
      "inputs": {
        "customerId": "{{ $json.customerId }}"
      }
    },
    {
      "stage": "fulfillment",
      "workflow": "func_track_progress",
      "inputs": {
        "customerId": "{{ $json.customerId }}",
        "projectId": "{{ $json.projectId }}"
      }
    },
    {
      "stage": "retention",
      "workflow": "func_retention_campaign",
      "trigger": "fulfillment_completed",
      "inputs": {
        "customerId": "{{ $json.customerId }}"
      }
    }
  ]
}
```

---

## 🦴 SKELETON 2: SERVICE REQUEST FLOW

### **Pattern Overview**

For service-based businesses (HVAC, plumbing, locksmith, etc.):

```
Request → Quote → Approval → Scheduling → Service Delivery → Payment → Follow-up
```

### **Full Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE REQUEST FLOW SKELETON                   │
└─────────────────────────────────────────────────────────────────┘

[1] REQUEST
    │
    ├─▶ Customer submits service request
    ├─▶ Capture: Service type, location, urgency, description
    └─▶ Create ticket in CRM
    │
    ▼
[2] QUOTE
    │
    ├─▶ AI Quote Generator (if standard service)
    ├─▶ Manual Quote (if custom)
    ├─▶ Send quote to customer
    └─▶ Track quote status
    │
    ▼
[3] APPROVAL
    │
    ├─▶ Customer approves quote
    ├─▶ Payment processing (deposit/full)
    ├─▶ Contract generation
    └─▶ Service scheduling unlocked
    │
    ▼
[4] SCHEDULING
    │
    ├─▶ Check technician availability
    ├─▶ Send scheduling link
    ├─▶ Confirm appointment
    └─▶ Send reminders
    │
    ▼
[5] SERVICE DELIVERY
    │
    ├─▶ Technician dispatch
    ├─▶ Service completion
    ├─▶ Photo documentation
    └─▶ Customer signature
    │
    ▼
[6] PAYMENT
    │
    ├─▶ Generate final invoice
    ├─▶ Payment processing
    ├─▶ Receipt delivery
    └─▶ Update CRM
    │
    ▼
[7] FOLLOW-UP
    │
    ├─▶ Satisfaction survey
    ├─▶ Review request
    ├─▶ Warranty information
    └─▶ Upsell opportunities
```

### **Reusable Components**

| Stage | Function Workflow | Purpose |
|-------|------------------|---------|
| **Request** | `func_create_service_request.json` | Standardize service requests |
| **Quote** | `func_generate_quote.json` | AI-powered quote generation |
| **Approval** | `func_process_approval.json` | Payment & contract handling |
| **Scheduling** | `func_schedule_service.json` | Technician dispatch |
| **Delivery** | `func_track_service.json` | Service completion tracking |
| **Payment** | `func_process_payment.json` | Invoice & payment processing |
| **Follow-up** | `func_service_followup.json` | Post-service engagement |

### **Niche Customizations**

#### **HVAC**
- **Request**: Emergency vs. scheduled maintenance
- **Quote**: Flat rate vs. hourly + materials
- **Scheduling**: Same-day emergency, next-day routine
- **Delivery**: Service report, warranty activation
- **Payment**: Split payment (deposit + completion)
- **Follow-up**: Seasonal maintenance reminders

#### **Locksmith**
- **Request**: Lockout, rekey, installation
- **Quote**: Emergency premium pricing
- **Scheduling**: Immediate dispatch for lockouts
- **Delivery**: Security assessment, recommendations
- **Payment**: Mobile payment on-site
- **Follow-up**: Security upgrade offers

#### **Roofer**
- **Request**: Repair vs. replacement, inspection
- **Quote**: Material + labor + warranty
- **Scheduling**: Weather-dependent scheduling
- **Delivery**: Before/after photos, inspection report
- **Payment**: Progress payments (30/30/40)
- **Follow-up**: Warranty registration, maintenance

---

## 🦴 SKELETON 3: CONTENT PRODUCTION PIPELINE

### **Pattern Overview**

For content-driven businesses (agencies, consultants, creators):

```
Idea → Research → Creation → Review → Publishing → Distribution → Analytics
```

### **Full Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│              CONTENT PRODUCTION PIPELINE SKELETON                │
└─────────────────────────────────────────────────────────────────┘

[1] IDEA GENERATION
    │
    ├─▶ AI Content Ideas Agent
    ├─▶ Trending Topics Research
    ├─▶ Competitor Analysis
    └─▶ Customer Questions
    │
    ▼
[2] RESEARCH
    │
    ├─▶ Topic Research (Perplexity/Tavily)
    ├─▶ SEO Keyword Research
    ├─▶ Competitor Content Analysis
    └─▶ Source Gathering
    │
    ▼
[3] CREATION
    │
    ├─▶ AI Content Generation (Claude/GPT)
    ├─▶ Image Generation (Midjourney/DALL-E)
    ├─▶ Video Creation (if needed)
    └─▶ Formatting & Optimization
    │
    ▼
[4] REVIEW
    │
    ├─▶ AI Quality Check
    ├─▶ Human Review (util_human_approval)
    ├─▶ SEO Optimization
    └─▶ Fact-Checking
    │
    ▼
[5] PUBLISHING
    │
    ├─▶ WordPress/Webflow Publishing
    ├─▶ Social Media Scheduling
    ├─▶ Email Newsletter
    └─▶ SEO Submission
    │
    ▼
[6] DISTRIBUTION
    │
    ├─▶ Social Media Auto-Post
    ├─▶ Email Newsletter
    ├─▶ Community Sharing
    └─▶ Repurpose for Other Platforms
    │
    ▼
[7] ANALYTICS
    │
    ├─▶ Performance Tracking
    ├─▶ Engagement Metrics
    ├─▶ SEO Rankings
    └─▶ ROI Calculation
```

### **Reusable Components**

| Stage | Function Workflow | Purpose |
|-------|------------------|---------|
| **Idea** | `func_generate_content_ideas.json` | AI-powered idea generation |
| **Research** | `func_research_topic.json` | Multi-source research |
| **Creation** | `func_create_content.json` | AI content generation |
| **Review** | `func_review_content.json` | Quality & SEO check |
| **Publishing** | `func_publish_content.json` | Multi-platform publishing |
| **Distribution** | `func_distribute_content.json` | Social media & email |
| **Analytics** | `func_track_content_performance.json` | Metrics aggregation |

### **Niche Customizations**

#### **Tax4Us (Accounting Blog)**
- **Idea**: Tax tips, deadline reminders, case studies
- **Research**: IRS updates, tax law changes
- **Creation**: Blog posts, podcast scripts
- **Publishing**: WordPress, podcast platforms
- **Distribution**: LinkedIn, email newsletter
- **Analytics**: Blog traffic, podcast downloads

#### **Real Estate Agent**
- **Idea**: Market updates, property highlights, buyer tips
- **Research**: Local market data, property comps
- **Creation**: Blog posts, social media content, video tours
- **Publishing**: Website, MLS, social media
- **Distribution**: Facebook, Instagram, email
- **Analytics**: Lead generation, engagement

---

## 🦴 SKELETON 4: SUPPORT TICKET LIFECYCLE

### **Pattern Overview**

For businesses with customer support needs:

```
Ticket Creation → Classification → Assignment → Resolution → Follow-up → Closure
```

### **Full Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│              SUPPORT TICKET LIFECYCLE SKELETON                  │
└─────────────────────────────────────────────────────────────────┘

[1] TICKET CREATION
    │
    ├─▶ Email → Ticket (Email Trigger)
    ├─▶ Form Submission → Ticket
    ├─▶ WhatsApp Message → Ticket
    └─▶ Phone Call → Ticket (Voice AI)
    │
    ▼
[2] CLASSIFICATION
    │
    ├─▶ AI Classification Agent
    │   ├─▶ Category (Billing, Technical, Feature Request)
    │   ├─▶ Urgency (Low, Medium, High, Critical)
    │   └─▶ Confidence Score
    │
    ├─▶ Human Review (if confidence < 80%)
    └─▶ Auto-assign (if confidence ≥ 80%)
    │
    ▼
[3] ASSIGNMENT
    │
    ├─▶ Route to Correct Team
    ├─▶ Assign to Available Agent
    ├─▶ SLA Tracking Start
    └─▶ Notification to Agent
    │
    ▼
[4] RESOLUTION
    │
    ├─▶ Agent Response
    ├─▶ Knowledge Base Search (RAG)
    ├─▶ Escalation (if needed)
    └─▶ Solution Delivery
    │
    ▼
[5] FOLLOW-UP
    │
    ├─▶ Customer Satisfaction Survey
    ├─▶ Resolution Confirmation
    └─▶ Additional Support (if needed)
    │
    ▼
[6] CLOSURE
    │
    ├─▶ Ticket Closed
    ├─▶ Analytics Update
    ├─▶ Knowledge Base Update (if new solution)
    └─▶ Retention Check
```

### **Reusable Components**

| Stage | Function Workflow | Purpose |
|-------|------------------|---------|
| **Creation** | `func_create_ticket.json` | Standardize ticket format |
| **Classification** | `func_classify_ticket.json` | AI-powered classification |
| **Assignment** | `func_assign_ticket.json` | Smart routing & assignment |
| **Resolution** | `func_resolve_ticket.json` | Solution delivery |
| **Follow-up** | `func_followup_ticket.json` | Customer satisfaction |
| **Closure** | `func_close_ticket.json` | Ticket closure & analytics |

---

## 🦴 SKELETON 5: APPOINTMENT MANAGEMENT

### **Pattern Overview**

For appointment-based businesses (dentists, lawyers, consultants):

```
Booking Request → Availability Check → Confirmation → Reminders → Service → Follow-up
```

### **Full Flow Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│              APPOINTMENT MANAGEMENT SKELETON                    │
└─────────────────────────────────────────────────────────────────┘

[1] BOOKING REQUEST
    │
    ├─▶ Customer requests appointment
    ├─▶ Capture: Service type, preferred time, contact info
    └─▶ Create booking request
    │
    ▼
[2] AVAILABILITY CHECK
    │
    ├─▶ Check calendar (Google Calendar/TidyCal)
    ├─▶ Check service provider availability
    ├─▶ Check resource availability (room, equipment)
    └─▶ Find best slots
    │
    ▼
[3] CONFIRMATION
    │
    ├─▶ Send available time slots
    ├─▶ Customer selects time
    ├─▶ Confirm appointment
    ├─▶ Add to calendar
    └─▶ Send confirmation email/SMS
    │
    ▼
[4] REMINDERS
    │
    ├─▶ 48 hours before: Email reminder
    ├─▶ 24 hours before: SMS reminder
    ├─▶ 2 hours before: Final reminder
    └─▶ Same-day: Morning reminder
    │
    ▼
[5] SERVICE
    │
    ├─▶ Check-in (if in-person)
    ├─▶ Service delivery
    ├─▶ Notes/documentation
    └─▶ Payment processing
    │
    ▼
[6] FOLLOW-UP
    │
    ├─▶ Post-service survey
    ├─▶ Review request
    ├─▶ Next appointment scheduling
    └─▶ Upsell opportunities
```

### **Reusable Components**

| Stage | Function Workflow | Purpose |
|-------|------------------|---------|
| **Booking** | `func_create_booking.json` | Standardize booking requests |
| **Availability** | `func_check_availability.json` | Calendar & resource checking |
| **Confirmation** | `func_confirm_appointment.json` | Appointment confirmation |
| **Reminders** | `func_send_reminders.json` | Automated reminder sequence |
| **Service** | `func_track_appointment.json` | Service delivery tracking |
| **Follow-up** | `func_appointment_followup.json` | Post-appointment engagement |

---

## 🔧 SKELETON CUSTOMIZATION GUIDE

### **Step 1: Choose Your Skeleton**

Based on client needs:
- **B2C Service Business** → Lead-to-Customer Journey
- **Service Provider** → Service Request Flow
- **Content Business** → Content Production Pipeline
- **Support-Heavy** → Support Ticket Lifecycle
- **Appointment-Based** → Appointment Management

### **Step 2: Map to Niche**

For each stage, identify:
- **Industry-specific data** (e.g., HVAC: service type, urgency)
- **Custom integrations** (e.g., Dentist: practice management software)
- **Business rules** (e.g., Lawyer: conflict check before consultation)

### **Step 3: Customize Function Workflows**

For each `func_*` workflow:
1. **Add niche-specific fields** to input/output
2. **Customize AI prompts** for industry context
3. **Add industry integrations** (e.g., Dentist: Dentrix API)
4. **Set business rules** (e.g., pricing tiers, SLAs)

### **Step 4: Create Agent Orchestrator**

Build parent `agent_*` workflow that:
1. Calls function workflows in sequence
2. Handles conditional logic (if/else)
3. Manages error handling
4. Tracks progress

### **Step 5: Test & Deploy**

1. Test each function individually
2. Test full skeleton end-to-end
3. Deploy to client instance
4. Monitor and optimize

---

## 📊 SKELETON USAGE MATRIX

| Skeleton | HVAC | Realtor | Dentist | Lawyer | Consultant | E-commerce |
|----------|------|---------|---------|--------|------------|------------|
| **Lead-to-Customer** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Service Request** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Content Pipeline** | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| **Support Tickets** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Appointments** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

**Legend**:
- ✅ **Primary**: Core to business model
- ⚠️ **Secondary**: Useful but not core
- ❌ **Not Applicable**: Doesn't fit business model

---

## 🎯 IMPLEMENTATION PRIORITY

### **Phase 1: Build Core Skeletons** (Week 1-2)
1. ✅ Lead-to-Customer Journey (highest demand)
2. ✅ Service Request Flow (service businesses)
3. ⚠️ Appointment Management (appointment-based)

### **Phase 2: Build Supporting Skeletons** (Week 3-4)
4. ⚠️ Content Production Pipeline (content businesses)
5. ⚠️ Support Ticket Lifecycle (support-heavy)

### **Phase 3: Create Niche Variants** (Ongoing)
- HVAC variant
- Realtor variant
- Dentist variant
- Lawyer variant
- etc.

---

## 📝 SKELETON TEMPLATE STRUCTURE

Each skeleton should include:

```
workflows/templates-library/skeletons/
├── 01-lead-to-customer/
│   ├── skeleton.json              # Full skeleton definition
│   ├── func_capture_lead.json
│   ├── func_qualify_lead.json
│   ├── func_schedule_meeting.json
│   ├── func_onboard_customer.json
│   ├── func_track_progress.json
│   ├── func_retention_campaign.json
│   ├── agent_lead_to_customer.json  # Parent orchestrator
│   └── README.md
│
├── 02-service-request/
│   └── ...
│
└── 03-content-pipeline/
    └── ...
```

---

## 🔄 NEXT STEPS

1. **Extract Existing Patterns**: Review current workflows to identify skeleton patterns
2. **Build Function Workflows**: Create reusable `func_*` workflows for each stage
3. **Create Agent Orchestrators**: Build parent workflows that call functions
4. **Document Niche Variants**: Document how each skeleton adapts to different niches
5. **Test Across Niches**: Validate skeletons work for multiple industries

---

**Questions?** See `CATALOG.md` for available templates or `IMPLEMENTATION_GUIDE.md` for usage instructions.
