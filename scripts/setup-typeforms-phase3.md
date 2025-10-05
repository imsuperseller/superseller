# TYPEFORM PHASE 3 SETUP
**4 New Typeforms + n8n Webhook Integration**

---

## ✅ EXISTING TYPEFORM

### **Typeform 1: Custom Solutions Voice AI Consultation**
**ID**: `01JKTNHQXKAWM6W90F0A6JQNJ7`
**Status**: ✅ Already integrated in WEBFLOW_EMBED_CUSTOM_SOLUTIONS_CVJ.html
**Purpose**: Book FREE Voice AI consultation for custom automation projects

---

## 🆕 NEW TYPEFORMS TO CREATE

### **Typeform 2: Ready Solutions Industry Quiz**
**Purpose**: Help users discover their ideal industry package
**Estimated Time**: 2 minutes
**Webhook**: → n8n → Airtable (Leads) → Email with recommendation

#### **Questions**:

1. **Welcome Screen**
   ```
   Title: Find Your Perfect Industry Automation Package
   Subtitle: Answer 5 quick questions and we'll recommend the exact solutions for your business.
   Button: Start Quiz →
   ```

2. **Q1: Industry Selection** (Dropdown)
   ```
   Question: What industry are you in?
   Type: Dropdown
   Options:
     - HVAC
     - Roofer
     - Realtor
     - Insurance Agent
     - Synagogue
     - Torah Teacher
     - Locksmith
     - Busy Mom
     - Photographer
     - Dentist
     - E-commerce
     - Fence Contractor
     - Product Supplier
     - Bookkeeping/Tax
     - Lawyer
     - Amazon Seller
     - Other (please specify)
   Required: Yes
   ```

3. **Q2: Top Time-Waster** (Multiple Choice)
   ```
   Question: What's your BIGGEST time-waster right now?
   Type: Multiple Choice (single select)
   Options:
     - Manual data entry
     - Scheduling/calendar management
     - Follow-up emails/calls
     - Invoice/payment processing
     - Lead qualification
     - Report generation
     - Customer communication
     - Document management
   Required: Yes
   ```

4. **Q3: Team Size** (Number)
   ```
   Question: How many people work in your business?
   Type: Number
   Min: 1
   Max: 1000
   Required: Yes
   ```

5. **Q4: Current Tools** (Multiple Select)
   ```
   Question: What tools do you currently use? (Select all that apply)
   Type: Multiple Select
   Options:
     - Google Workspace (Gmail, Calendar, Drive)
     - Microsoft Office 365
     - Salesforce
     - HubSpot
     - QuickBooks
     - Stripe
     - Mailchimp
     - Shopify
     - WordPress
     - Facebook/Instagram
     - None / Other
   Required: No
   ```

6. **Q5: Implementation Timeline** (Multiple Choice)
   ```
   Question: When do you want to start?
   Type: Multiple Choice
   Options:
     - This week (urgent)
     - This month (ready soon)
     - Next 1-3 months (planning)
     - Just exploring (no rush)
   Required: Yes
   ```

7. **Q6: Contact Info** (Email + Optional Phone)
   ```
   Question: Where should we send your personalized recommendation?
   Type: Email
   Placeholder: your@email.com
   Required: Yes

   Follow-up: Phone (optional)
   Type: Phone Number
   Placeholder: +1 (555) 123-4567
   Required: No
   ```

8. **Thank You Screen**
   ```
   Title: Perfect! Check Your Email 📧
   Message: We're sending your personalized industry automation package recommendation to your inbox right now.

   You'll get:
   ✓ Recommended solutions for [INDUSTRY]
   ✓ Pricing breakdown (Single vs Complete package)
   ✓ Implementation timeline
   ✓ Case study from [INDUSTRY]

   Expected: Within 2 minutes
   Button: Browse All Solutions →
   Link: https://rensto.com/solutions
   ```

#### **Webhook Payload** (to n8n):
```json
{
  "form_id": "typeform_id",
  "submitted_at": "2025-10-03T...",
  "answers": {
    "industry": "HVAC",
    "time_waster": "Manual data entry",
    "team_size": 5,
    "current_tools": ["Google Workspace", "QuickBooks"],
    "timeline": "This month",
    "email": "user@example.com",
    "phone": "+15551234567"
  }
}
```

#### **n8n Workflow** (Ready Solutions Quiz):
1. **Trigger**: Typeform Webhook
2. **Lookup**: Airtable Industry Solutions (match industry)
3. **Create Lead**: Airtable Leads table
   - Service Type Interest: Ready Solutions
   - CVJ Stage: Engage → Subscribe
   - Lead Source Page: Ready Solutions
4. **Send Email**: Gmail/SendGrid
   - Subject: "Your [INDUSTRY] Automation Package Recommendation"
   - Body: Personalized with industry solutions, pricing, case study
   - CTA: "Get Your Package →" (link to /solutions/[slug])
5. **If urgent**: Create Slack notification for sales team

---

### **Typeform 3: Subscriptions - FREE 50 Leads Sample**
**Purpose**: Prove lead quality before purchase
**Estimated Time**: 1 minute
**Webhook**: → n8n → Generate leads → Send CSV via email

#### **Questions**:

1. **Welcome Screen**
   ```
   Title: Get 50 FREE Sample Leads 🎯
   Subtitle: No credit card required. See the quality for yourself.
   Button: Get My Free Leads →
   ```

2. **Q1: Email** (Email)
   ```
   Question: Where should we send your 50 free leads?
   Type: Email
   Placeholder: your@email.com
   Required: Yes
   ```

3. **Q2: Industry** (Dropdown)
   ```
   Question: What industry are you in?
   Type: Dropdown
   Options:
     - Insurance
     - Real Estate
     - HVAC/Home Services
     - Financial Services
     - Legal Services
     - Healthcare
     - E-commerce
     - B2B SaaS
     - Marketing Agency
     - Other
   Required: Yes
   ```

4. **Q3: Target Location** (Text)
   ```
   Question: What city/state do you want leads from?
   Type: Short Text
   Placeholder: e.g., "Chicago, IL" or "California"
   Required: Yes
   ```

5. **Q4: Target Business Type** (Text)
   ```
   Question: What type of businesses do you want to reach?
   Type: Short Text
   Placeholder: e.g., "Small business owners with 10-50 employees"
   Required: Yes
   ```

6. **Q5: Preferred Lead Source** (Multiple Select)
   ```
   Question: Where should we source your leads? (Select all that apply)
   Type: Multiple Select
   Options:
     - LinkedIn (business professionals)
     - Google Maps (local businesses)
     - Facebook (groups/pages)
     - Apify (web scraping)
   Required: Yes
   ```

7. **Thank You Screen**
   ```
   Title: Your FREE 50 Leads Are Being Generated! ⚡
   Message: We're pulling 50 high-quality leads matching your criteria.

   What you'll receive:
   ✓ 50 verified business contacts
   ✓ Email addresses + phone numbers
   ✓ Company name + location
   ✓ CSV file (ready to import)

   Delivery: Within 24 hours to [EMAIL]

   While you wait:
   Button: See Our Pricing →
   Link: https://rensto.com/subscriptions#pricing
   ```

#### **Webhook Payload**:
```json
{
  "form_id": "typeform_id",
  "submitted_at": "2025-10-03T...",
  "answers": {
    "email": "user@example.com",
    "industry": "Insurance",
    "location": "Chicago, IL",
    "target_business": "Insurance agencies with 5-20 agents",
    "lead_sources": ["LinkedIn", "Google Maps"]
  }
}
```

#### **n8n Workflow** (FREE Leads Sample):
1. **Trigger**: Typeform Webhook
2. **Create Lead**: Airtable Leads table
   - Service Type Interest: Subscriptions (Lead Generation)
   - CVJ Stage: Subscribe (FREE sample)
3. **Generate Leads**: Call lead gen workflow
   - Use Apify/LinkedIn/GMaps based on sources selected
   - Apply filters: industry, location, business type
   - Limit: 50 records
4. **Format CSV**: Convert to CSV with columns:
   - Company Name, Contact Name, Email, Phone, Location, Industry, Source
5. **Send Email**: Gmail
   - Subject: "Your 50 FREE Sample Leads Are Ready!"
   - Attach CSV
   - Body: "Here are your 50 leads. Quality score: X/10. Ready to get 100-2,000+ per month?"
   - CTA: "Start Trial ($299/mo) →"
6. **Track in Airtable**: Update lead record with delivery status

---

### **Typeform 4: Marketplace Template Request**
**Purpose**: Capture demand for templates not yet built
**Estimated Time**: 2 minutes
**Webhook**: → n8n → Airtable (Template Requests) → Notify team

#### **Questions**:

1. **Welcome Screen**
   ```
   Title: Don't See the Template You Need? 🔍
   Subtitle: Tell us what workflow you want to automate and we'll build it.
   Button: Request a Template →
   ```

2. **Q1: Email** (Email)
   ```
   Question: Your email address
   Type: Email
   Required: Yes
   ```

3. **Q2: Template Name** (Text)
   ```
   Question: What would you call this template?
   Type: Short Text
   Placeholder: e.g., "Shopify Order to QuickBooks Invoice"
   Required: Yes
   ```

4. **Q3: Workflow Description** (Long Text)
   ```
   Question: Describe the workflow you want to automate
   Type: Long Text
   Placeholder: "When a customer places an order on Shopify, I want to automatically create an invoice in QuickBooks, send a confirmation email, and update my inventory spreadsheet."
   Required: Yes
   ```

5. **Q4: Tools to Integrate** (Multiple Select)
   ```
   Question: Which tools need to connect? (Select all that apply)
   Type: Multiple Select
   Options:
     [Show popular integrations: Shopify, Salesforce, HubSpot, Gmail, Slack, QuickBooks, Stripe, WordPress, Google Sheets, Airtable, Mailchimp, Facebook, Instagram, LinkedIn, Zapier, Make, Custom API]
   Required: Yes
   ```

6. **Q5: Urgency** (Multiple Choice)
   ```
   Question: How urgently do you need this?
   Type: Multiple Choice
   Options:
     - ASAP (willing to pay premium for fast delivery)
     - Within 1-2 weeks
     - Within 1 month
     - No rush (just exploring)
   Required: Yes
   ```

7. **Q6: Budget** (Multiple Choice)
   ```
   Question: What's your budget for this template?
   Type: Multiple Choice
   Options:
     - Under $100 (DIY template)
     - $100-$300 (Advanced template)
     - $300-$1,000 (Custom build)
     - $1,000+ (Full-service)
   Required: No
   ```

8. **Thank You Screen**
   ```
   Title: Request Received! 🚀
   Message: We'll review your template request and get back to you within 48 hours.

   What happens next:
   ✓ We'll assess complexity & feasibility
   ✓ Send you a quote + timeline
   ✓ Build the template if approved
   ✓ Deliver with installation guide

   Meanwhile, explore our existing templates:
   Button: Browse Templates →
   Link: https://rensto.com/marketplace#categories
   ```

#### **Webhook Payload**:
```json
{
  "form_id": "typeform_id",
  "submitted_at": "2025-10-03T...",
  "answers": {
    "email": "user@example.com",
    "template_name": "Shopify to QuickBooks",
    "description": "Full workflow description...",
    "tools": ["Shopify", "QuickBooks", "Gmail"],
    "urgency": "Within 1-2 weeks",
    "budget": "$300-$1,000"
  }
}
```

#### **n8n Workflow** (Template Requests):
1. **Trigger**: Typeform Webhook
2. **Create Record**: Airtable "Template Requests" table
   - Template Name
   - Description
   - Tools Required
   - Urgency
   - Budget
   - Status: New
3. **Calculate Complexity**: OpenAI
   - Analyze tools + description
   - Estimate: Hours, Complexity (Simple/Advanced/Complex)
4. **Send Notification**: Slack
   - Channel: #template-requests
   - Message: "New urgent request: [NAME] - Budget: [BUDGET]"
5. **Send Confirmation Email**: Gmail
   - Thank you + timeline
   - If ASAP: "We'll prioritize your request"
6. **If high-value**: Create opportunity in CRM

---

### **Typeform 5: Custom Solutions Readiness Scorecard**
**Purpose**: Qualify leads + provide upfront value
**Estimated Time**: 3 minutes
**Webhook**: → n8n → Calculate score → Email PDF scorecard

#### **Questions**:

1. **Welcome Screen**
   ```
   Title: Is Your Business Ready for Custom Automation? 📊
   Subtitle: Take our 2-minute assessment and get a FREE readiness scorecard.
   Button: Start Assessment →
   ```

2. **Q1: Business Info** (Text)
   ```
   Question: What's your business name?
   Type: Short Text
   Required: Yes

   Follow-up: Your email
   Type: Email
   Required: Yes
   ```

3. **Q2: Manual Processes** (Number)
   ```
   Question: How many repetitive tasks do you do manually each week?
   Type: Number
   Options:
     - 0-5 (minimal)
     - 6-15 (moderate)
     - 16-30 (significant)
     - 31+ (overwhelming)
   Required: Yes
   Logic: Score = selection index * 25
   ```

4. **Q3: Current Automation** (Multiple Select)
   ```
   Question: What automation tools do you currently use?
   Type: Multiple Select
   Options:
     - None (we're manual)
     - Zapier/Make
     - Native integrations (Salesforce → QuickBooks)
     - Custom scripts
     - Other automation tools
   Required: Yes
   Logic: Score = count * 10 (max 30)
   ```

5. **Q4: Team Size** (Number)
   ```
   Question: How many people work in your business?
   Type: Number
   Min: 1
   Required: Yes
   Logic: Score = Math.min(team_size / 10 * 20, 20)
   ```

6. **Q5: Monthly Revenue** (Multiple Choice)
   ```
   Question: What's your approximate monthly revenue?
   Type: Multiple Choice
   Options:
     - Under $10k
     - $10k-$50k
     - $50k-$100k
     - $100k-$500k
     - $500k+
   Required: No
   Logic: Score = selection index * 5 (max 25)
   ```

7. **Q6: Top Priority** (Long Text)
   ```
   Question: What's the #1 workflow you want to automate first?
   Type: Long Text
   Placeholder: "Describe the most time-consuming or error-prone process in your business"
   Required: Yes
   Logic: Length > 50 chars = +10 points (shows clarity)
   ```

8. **Q7: Budget Awareness** (Multiple Choice)
   ```
   Question: What budget have you allocated for automation?
   Type: Multiple Choice
   Options:
     - Haven't thought about it yet
     - Under $5,000
     - $5,000-$10,000
     - $10,000-$25,000
     - $25,000+
   Required: No
   Logic: Score = selection index * 10 (max 40)
   ```

9. **Thank You Screen**
   ```
   Title: Calculating Your Readiness Score... ⚡
   Message: We're analyzing your responses and generating your personalized automation readiness scorecard.

   You'll receive:
   ✓ Your Readiness Score (0-100)
   ✓ Top 3 automation opportunities
   ✓ Estimated ROI for each
   ✓ Recommended implementation timeline
   ✓ Next steps

   Delivery: Check your email in 2 minutes!

   Ready to discuss your results?
   Button: Book FREE Consultation →
   Link: https://form.typeform.com/to/01JKTNHQXKAWM6W90F0A6JQNJ7
   ```

#### **Scoring System**:
```
Total Score (0-100):
- Manual Processes (25 points)
- Current Automation (30 points)
- Team Size (20 points)
- Revenue (25 points)
- Priority Clarity (10 bonus)
- Budget Awareness (40 bonus, capped at 100)

Readiness Levels:
- 0-30: Not Ready (Focus on basics first)
- 31-60: Getting Ready (Start with simple automation)
- 61-80: Ready (Good fit for custom solutions)
- 81-100: Highly Ready (Priority candidate)
```

#### **Webhook Payload**:
```json
{
  "form_id": "typeform_id",
  "submitted_at": "2025-10-03T...",
  "answers": {
    "business_name": "Acme Corp",
    "email": "user@example.com",
    "manual_processes": "16-30",
    "current_automation": ["Zapier", "Native integrations"],
    "team_size": 15,
    "monthly_revenue": "$100k-$500k",
    "top_priority": "Automate our sales quote generation...",
    "budget": "$5,000-$10,000"
  },
  "calculated": {
    "readiness_score": 78,
    "readiness_level": "Ready",
    "recommended_action": "Book consultation"
  }
}
```

#### **n8n Workflow** (Readiness Scorecard):
1. **Trigger**: Typeform Webhook
2. **Calculate Score**: Code node
   - Apply scoring logic
   - Determine readiness level
3. **AI Analysis**: OpenAI
   - Analyze top priority
   - Generate 3 automation opportunities
   - Estimate ROI for each
4. **Generate PDF**: HTML → PDF
   - Branded scorecard design
   - Score visualization
   - Recommendations
   - Next steps
5. **Create Lead**: Airtable
   - Service Type Interest: Custom Solutions
   - CVJ Stage: Subscribe (scorecard delivered)
   - Readiness Score: X/100
6. **Send Email**: Gmail
   - Subject: "Your Automation Readiness Score: [SCORE]/100"
   - Attach PDF scorecard
   - CTA: "Book FREE Consultation →"
7. **If score > 70**: Notify sales team (Slack)
8. **If score < 40**: Add to nurture sequence (educate about automation basics)

---

## 🔗 TYPEFORM WEBHOOK CONFIGURATION

### **For Each Typeform**:
1. Go to: Typeform → Connect → Webhooks
2. Add webhook URL: `https://n8n.rensto.com/webhook/typeform-[form-name]`
3. Select events: `form_response`
4. Test webhook

### **n8n Webhook URLs**:
- Ready Solutions Quiz: `https://n8n.rensto.com/webhook/typeform-ready-solutions-quiz`
- FREE Leads Sample: `https://n8n.rensto.com/webhook/typeform-free-leads-sample`
- Template Request: `https://n8n.rensto.com/webhook/typeform-template-request`
- Readiness Scorecard: `https://n8n.rensto.com/webhook/typeform-readiness-scorecard`

---

## 📋 IMPLEMENTATION CHECKLIST

### **For Each Typeform**:
- [ ] Create Typeform using specifications above
- [ ] Configure logic jumps (if applicable)
- [ ] Add webhook to n8n
- [ ] Build n8n workflow
- [ ] Test end-to-end flow
- [ ] Integrate Typeform link into Webflow page
- [ ] Test form submission → email delivery
- [ ] Monitor for 48 hours

---

## 🚀 NEXT STEPS AFTER PHASE 3

1. **Update Webflow Pages**:
   - Add Typeform embed/popup triggers
   - Replace placeholder forms with real Typeforms
   - Test all CTAs

2. **Build n8n Payment Workflows** (Phase 2.5):
   - Stripe webhook → Airtable
   - Payment success → Email templates
   - QuickBooks integration

3. **Create Email Templates**:
   - Industry recommendation email
   - FREE leads delivery email
   - Template request acknowledgment
   - Readiness scorecard email

4. **Set Up Analytics**:
   - Track form completion rates
   - Monitor CVJ stage transitions
   - Measure conversion rates

---

## 📞 MANUAL CREATION INSTRUCTIONS

Since I can't directly create Typeforms, use this document to manually create each form at https://typeform.com/create

**Pro Tip**: Use Typeform's "Logic Jumps" feature to:
- Show different questions based on answers
- Calculate scores in real-time
- Personalize thank you screens

**Estimated Time**: ~30 minutes per form = 2 hours total
