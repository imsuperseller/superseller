# 🎯 Customer Journey Flows - Rensto

**Date**: October 7, 2025, 11:45 PM
**Status**: ✅ COMPLETE - All 4 journey stages documented
**Business Model**: 5 service types (Marketplace, Ready Solutions, Subscriptions, Custom Solutions, Content AI)
**Integration**: Stripe + n8n + Airtable + Webflow

---

## 📊 Executive Summary

**Purpose**: Document the complete customer journey from first website visit to active, retained customer

**Journey Stages** (4 total):
1. **Awareness → Purchase** (SEO, landing pages, checkout)
2. **Purchase → Onboarding** (Stripe webhook → n8n → automated emails)
3. **Onboarding → Active** (Portal access, project kickoff, milestone tracking)
4. **Active → Retention** (Engagement, upsell triggers, referral incentives)

**Key Systems**:
- **Webflow**: 19 pages with Stripe checkout integration
- **Stripe**: 18 products across 5 service types
- **n8n**: DEV-FIN-006 workflow (post-purchase automation)
- **Airtable**: Customer, Invoice, Project, Subscription tables
- **Typeform**: 4 forms for lead qualification (not yet integrated)

---

## 🚀 STAGE 1: AWARENESS → PURCHASE

### **Traffic Sources**

**Primary Acquisition Channels**:
| Channel | Landing Pages | Expected Volume | Conversion Rate |
|---------|---------------|-----------------|-----------------|
| **SEO (Organic)** | Niche pages (15 pages) | 60-70% | 2-5% |
| **Direct Traffic** | Service pages (4 pages) | 15-20% | 8-12% |
| **Referrals** | All pages | 10-15% | 12-20% |
| **Social Media** | Homepage, About | 5-10% | 1-3% |

**Landing Page Strategy**:
- **Niche Pages** (15 pages): Target specific industries (HVAC, Realtor, Amazon Seller, etc.)
- **Service Pages** (4 pages): Target solution types (Marketplace, Subscriptions, Ready Solutions, Custom)
- **Homepage**: General brand awareness, multi-path navigation
- **About Page**: Trust building, team credibility

---

### **Landing Pages & Entry Points** (19 pages with Stripe checkout)

#### **Service Pages** (4 pages - Solution-focused):

**1. Marketplace** (/marketplace)
- **Purpose**: Browse and purchase pre-built workflow templates
- **Products**: 8 marketplace products ($197-$997)
- **Buttons**: 8 "Buy Template" buttons
- **Decision Point**: DIY vs Full-Service Install
- **Typical Visitor**: Tech-savvy, looking for quick solution
- **Conversion Path**: Browse templates → View pricing → Click "Buy Template" → Stripe checkout

**2. Subscriptions** (/subscriptions)
- **Purpose**: Sign up for ongoing lead generation services
- **Products**: 5 subscription products ($297-$1,499/month)
- **Buttons**: 5 "Subscribe Now" buttons
- **Decision Point**: Monthly lead volume needed (100, 300, 500+ leads)
- **Typical Visitor**: Business owner needing consistent lead flow
- **Conversion Path**: Review packages → Calculate ROI → Click "Subscribe Now" → Stripe checkout

**3. Ready Solutions** (/ready-solutions)
- **Purpose**: Purchase industry-specific automation packages
- **Products**: 3 ready solution tiers ($890-$2,990+)
- **Buttons**: 3 "Get Started" buttons
- **Decision Point**: Starter vs Professional vs Enterprise
- **Typical Visitor**: Business owner wanting turnkey solution
- **Conversion Path**: Select tier → Review features → Click "Get Started" → Stripe checkout

**4. Custom Solutions** (/custom-solutions)
- **Purpose**: Request custom automation consultation
- **Products**: 2 entry-level products ($297 audit, $1,997 sprint)
- **Buttons**: 2 "Book Now" buttons
- **Decision Point**: Audit first or jump to build sprint
- **Typical Visitor**: Business with complex, unique needs
- **Conversion Path**: Learn about process → Review pricing → Click "Book Now" → Stripe checkout

---

#### **Niche Pages** (15 pages - Industry-focused):

**Niche Page Strategy**: Each page targets a specific industry with tailored messaging, using Ready Solutions products

**Active Niche Pages** (15 total):
1. **/hvac** - HVAC contractors
2. **/amazon-seller** - Amazon FBA sellers
3. **/realtor** - Real estate agents
4. **/roofers** - Roofing companies
5. **/dentist** - Dental practices
6. **/bookkeeping** - Bookkeepers and accountants
7. **/busy-mom** - Busy moms and small businesses
8. **/ecommerce** - E-commerce store owners
9. **/fence-contractors** - Fence installation companies
10. **/insurance** - Insurance agents
11. **/lawyer** - Law firms
12. **/locksmith** - Locksmith businesses
13. **/photographers** - Photography businesses
14. **/product-supplier** - Product suppliers and wholesalers
15. **/synagogues** - Synagogues and religious organizations

**Niche Page Structure** (consistent across all 15):
- **Hero Section**: Industry-specific headline ("Automate Your HVAC Business")
- **Pain Points**: 3-5 industry-specific problems
- **Solution Overview**: How Rensto solves those problems
- **Products**: 3 Ready Solution tiers ($890, $2,990, $2,990+)
- **Buttons**: 3 "Get Started" buttons → Stripe checkout
- **Social Proof**: Testimonials, case studies (when available)
- **CTA**: Below fold, repeat CTA at page bottom

**Typical Niche Visitor Journey**:
1. Google search: "HVAC automation software" → Land on /hvac
2. Read pain points (recognize their problems)
3. Review Ready Solution tiers
4. Click "Get Started" (usually Professional $2,990)
5. Stripe checkout → Purchase
6. Post-purchase automation triggered

---

### **Decision Points & Conversion Triggers**

**Key Decision Point #1: Which Service Type?**

**Visitor Profile → Recommended Path**:
| Visitor Type | Recommended Service | Typical Product | Price Range |
|--------------|---------------------|-----------------|-------------|
| **DIY Tech-Savvy** | Marketplace | Email Automation Template | $197-$597 |
| **Need Ongoing Leads** | Subscriptions | Retainer Growth | $799/month |
| **Want Turnkey Solution** | Ready Solutions | Professional Package | $2,990 |
| **Complex/Unique Needs** | Custom Solutions | Automation Sprint | $1,997 |

**Key Decision Point #2: DIY vs Full-Service?**

**Marketplace Only** (8 products):
- **DIY Template** ($197-$997): Download JSON, self-install in n8n
- **Full-Service Install** (add +$600-$2,400): We install and configure

**Other Services**: Full-service only

---

### **Checkout Initiation Process**

**Button Click Flow** (consistent across all 19 pages):

```
User Clicks "Buy Template" / "Subscribe Now" / "Get Started" / "Book Now"
  ↓
JavaScript Event: rensto-checkout-button click
  ↓
stripe-core.js: initRenstoCheckout() function
  ↓
Fetch Stripe Price ID from button data attribute
  ↓
Create Stripe Checkout Session (via Stripe.js)
  ↓
Redirect to Stripe Checkout Page (checkout.stripe.com)
  ↓
User Enters Payment Info
  ↓
Stripe Processes Payment
  ↓
STAGE 2: Purchase → Onboarding (webhook fired)
```

**Button Implementation Example** (from BUTTON_FLOW_MAP.md):
```html
<button
  class="rensto-checkout-button"
  data-stripe-price-id="price_1SF5qCDE8rt1dEs1SbZCqETE"
  data-product-name="Email Persona System"
  data-price="197">
  Buy Template - $197
</button>
```

**JavaScript Handler** (shared/stripe-core.js):
```javascript
async function initRenstoCheckout(button) {
  const priceId = button.dataset.stripePriceId;
  const productName = button.dataset.productName;

  // Create Stripe checkout session
  const stripe = Stripe('pk_live_...');
  const { error } = await stripe.redirectToCheckout({
    lineItems: [{ price: priceId, quantity: 1 }],
    mode: 'payment', // or 'subscription'
    successUrl: 'https://www.rensto.com/thank-you',
    cancelUrl: window.location.href,
    customerEmail: '' // Stripe collects this
  });
}
```

---

### **Landing Page Performance Metrics** (To Be Tracked)

**Goal Metrics**:
| Page Type | Traffic/Month | Conversion Rate | Revenue/Month |
|-----------|---------------|-----------------|---------------|
| **Service Pages** | 500-1,000 | 5-10% | $10K-$30K |
| **Niche Pages** | 2,000-3,000 | 2-5% | $5K-$15K |
| **Homepage** | 1,000-2,000 | 1-3% | $2K-$10K |

**Conversion Optimization**:
- A/B test button text ("Buy Template" vs "Get Started")
- Test pricing display (show savings vs just price)
- Test CTA placement (above fold vs below)
- Test social proof (testimonials vs case studies)

---

## 💳 STAGE 2: PURCHASE → ONBOARDING

### **Post-Purchase Automation Flow**

**Trigger**: Stripe webhook `checkout.session.completed`

**Complete Flow** (documented in POST_PURCHASE_AUTOMATION.md):

```
Stripe Payment Completed
  ↓
Webhook Event: checkout.session.completed
  ↓
POST to: https://api.rensto.com/api/stripe/webhook
  ↓
Next.js API Route: /apps/web/rensto-site/src/app/api/stripe/webhook/route.ts
  ↓
Validate Stripe Signature (STRIPE_WEBHOOK_SECRET)
  ↓
Extract Event Data (customer_email, product, amount, payment_intent)
  ↓
Trigger n8n Workflow: DEV-FIN-006 (Stripe Revenue Sync v1)
  ↓
[n8n Automation Nodes - 40-60% automated]
  ↓
Create Airtable Records (3 tables)
  ↓
Send Emails (2 emails: customer + admin)
  ↓
Notify Slack (#sales channel)
```

---

### **n8n Workflow: DEV-FIN-006 (Stripe Revenue Sync v1)**

**Purpose**: Automate all post-purchase tasks after Stripe payment

**Workflow Structure**:

**Node 1: Webhook Trigger**
- URL: `http://173.254.201.134:5678/webhook/stripe-revenue-sync`
- Method: POST
- Expected Payload: Stripe checkout.session.completed event

**Node 2: Parse Stripe Event**
- Extract: `customer_email`, `product_id`, `amount_total`, `payment_intent`
- Determine service type (Marketplace, Subscription, Ready Solution, Custom Solution)
- Map Stripe product → Airtable product

**Node 3: Create Customer Record (Airtable)**
- Table: `Customers` (Rensto Client Operations base)
- Fields:
  - Customer Name (from email or manual)
  - Email (from Stripe)
  - Status: "New"
  - Acquisition Source: "Stripe Checkout"
  - Created Date: Today
  - Total Spent: Amount from purchase
- Check for duplicates: If email exists, update record instead

**Node 4: Create Invoice Record (Airtable)**
- Table: `Invoices` (Financial Management base)
- Fields:
  - Invoice Number: Auto-generated
  - Customer: Link to Customer record (from Node 3)
  - Amount: From Stripe
  - Status: "Paid"
  - Payment Method: "Stripe"
  - Payment Date: Today
  - Stripe Payment Intent ID: From webhook

**Node 5: Create Project/Subscription Record (Airtable)**
- **If Marketplace Purchase**: Create record in `Projects` table
  - Project Name: Product name
  - Customer: Link to Customer
  - Status: "Pending Delivery"
  - Product: Link to Products table

- **If Subscription Signup**: Create record in `Subscriptions` table
  - Subscription Name: Product name
  - Customer: Link to Customer
  - Status: "Active"
  - Billing Cycle: Monthly
  - Start Date: Today
  - Next Billing Date: Today + 30 days

**Node 6: Send Customer Confirmation Email**
- Email Service: Mailgun or SendGrid
- To: Customer email (from Stripe)
- From: hello@rensto.com
- Subject: "Thank you for your purchase! Here's what happens next..."
- Template:
  - **Marketplace**: "Your [Product Name] is being prepared. You'll receive download link within 2 hours."
  - **Subscription**: "Your [Subscription Name] is now active. First leads will arrive within 24 hours."
  - **Ready Solution**: "Your [Package Name] project is scheduled. We'll contact you within 1 business day."
  - **Custom Solution**: "Your [Consultation Type] is booked. Expect calendar invite within 1 hour."

**Node 7: Send Admin Notification Email**
- Email Service: Mailgun or SendGrid
- To: admin@rensto.com
- From: notifications@rensto.com
- Subject: "New Sale: [Product Name] - $[Amount]"
- Content:
  - Customer: Name + Email
  - Product: Name + Price
  - Payment Intent: Stripe link
  - Next Actions: What admin needs to do

**Node 8: Notify Slack (#sales channel)**
- Slack Webhook: Post to #sales channel
- Message:
  ```
  🎉 New Sale!
  Customer: [Name] ([Email])
  Product: [Product Name]
  Amount: $[Amount]
  Type: [Marketplace/Subscription/Ready Solution/Custom]
  Next Action: [Deliver template / Start project / Schedule call]
  Airtable: [Link to Customer record]
  ```

---

### **Automated Emails** (To Be Created)

**Email Templates** (8 total, estimated):

**Customer Emails** (4):
1. **marketplace-purchase-confirmation.html**
   - Subject: "Your [Product Name] Template is Ready!"
   - Content: Download link, installation guide, support info
   - CTA: "Download Template Now"

2. **subscription-welcome.html**
   - Subject: "Welcome to [Subscription Name]!"
   - Content: What to expect, first leads timeline, portal access
   - CTA: "Access Your Dashboard"

3. **ready-solution-kickoff.html**
   - Subject: "Let's Get Started with Your [Package Name]!"
   - Content: Project timeline, next steps, calendar booking link
   - CTA: "Schedule Kickoff Call"

4. **custom-solution-confirmation.html**
   - Subject: "Your [Consultation Type] is Confirmed!"
   - Content: Calendar invite, preparation checklist, what to bring
   - CTA: "Prepare for Your Call"

**Admin Emails** (4):
5. **admin-new-marketplace-sale.html**
   - Subject: "Action Required: New Marketplace Sale - [Product Name]"
   - Content: Customer details, product to deliver, deadline
   - CTA: "Prepare Delivery Package"

6. **admin-new-subscription-signup.html**
   - Subject: "New Subscription: [Subscription Name] - [Customer]"
   - Content: Customer details, lead criteria, workflow to activate
   - CTA: "Activate Subscription Workflow"

7. **admin-new-ready-solution-sale.html**
   - Subject: "New Project: [Package Name] - [Customer]"
   - Content: Customer details, package tier, scope of work
   - CTA: "Create Project in Airtable"

8. **admin-new-custom-solution-booking.html**
   - Subject: "New Consultation: [Type] - [Customer]"
   - Content: Customer details, consultation type, preparation needed
   - CTA: "Send Calendar Invite"

---

### **Airtable Data Storage**

**Records Created Per Purchase**:

**Marketplace Purchase** (3 records):
- `Customers` table: 1 customer record
- `Invoices` table: 1 invoice record
- `Projects` table: 1 project record

**Subscription Signup** (3 records):
- `Customers` table: 1 customer record
- `Invoices` table: 1 invoice record (first payment)
- `Subscriptions` table: 1 subscription record

**Ready Solution Purchase** (3 records):
- `Customers` table: 1 customer record
- `Invoices` table: 1 invoice record
- `Projects` table: 1 project record (multi-workflow package)

**Custom Solution Booking** (3 records):
- `Customers` table: 1 customer record
- `Invoices` table: 1 invoice record
- `Consultations` table: 1 consultation record (to be created)

---

### **Onboarding Timing** (By Service Type)

| Service Type | Time to First Action | Time to Full Onboarding | Owner |
|--------------|---------------------|-------------------------|-------|
| **Marketplace** | 2 hours (email with download link) | 2 hours | Automated |
| **Subscription** | 24 hours (first leads delivered) | 3 days (full lead flow) | Automated + Manual |
| **Ready Solution** | 1 business day (kickoff call scheduled) | 7-14 days (project delivered) | Manual |
| **Custom Solution** | 1 hour (calendar invite sent) | 14-30 days (project completed) | Manual |

**Goal**: 100% automation for Marketplace, 80% automation for Subscriptions, 40% automation for Ready Solutions/Custom

---

## 🎯 STAGE 3: ONBOARDING → ACTIVE CUSTOMER

### **Customer Portal Access** (To Be Implemented)

**Portal URL**: `https://portal.rensto.com/{customer-slug}`

**Portal Features** (4 different views):

**1. Marketplace Customer Portal**
- **Downloads**: Access all purchased templates (JSON files)
- **Installation Guides**: Step-by-step tutorials
- **Support**: Submit tickets, chat with support
- **Updates**: Notification when new template versions available

**2. Subscription Customer Portal**
- **Leads Dashboard**: View all leads delivered
- **Lead Filters**: Filter by date, source, status
- **Analytics**: Leads/day, conversion rate, ROI
- **Billing**: View invoices, update payment method
- **Pause/Resume**: Pause subscription anytime

**3. Ready Solution Customer Portal**
- **Project Dashboard**: Current project status
- **Milestones**: 5-7 milestones with completion %
- **Deliverables**: Download completed workflows
- **Communication**: Message project manager
- **Invoices**: View payment schedule

**4. Custom Solution Customer Portal**
- **Project Timeline**: Gantt chart of tasks
- **Documentation**: Requirements, designs, technical specs
- **Workflow Previews**: Test workflows before deployment
- **Change Requests**: Submit change requests with impact analysis
- **Support**: Dedicated support channel

---

### **Project Kickoff Process** (Manual, To Be Automated)

**Ready Solution Projects**:

**Day 1: Kickoff Call** (30-45 minutes)
- Review package scope
- Confirm business processes to automate
- Identify integrations needed (Airtable, Stripe, QuickBooks, etc.)
- Set project timeline (7-14 days)
- Define success metrics

**Day 2-7: Build Phase**
- Build n8n workflows
- Configure integrations
- Set up Airtable bases (if needed)
- Create custom functions
- Set up error handling and logging

**Day 8-12: Testing Phase**
- Test workflows with sample data
- Fix bugs and edge cases
- Performance optimization
- Security review

**Day 13-14: Delivery & Training**
- Deploy workflows to customer's n8n instance (or hosted)
- Training session (1 hour)
- Documentation delivery
- Support handoff

**Custom Solution Projects**:

**Week 1: Discovery & Design**
- Consultation call (1-2 hours)
- Requirements document
- Technical design
- Quote approval

**Week 2-3: Development**
- Build workflows
- Integration setup
- Custom code development
- Testing

**Week 4: Delivery**
- Deployment
- Training (2-3 hours)
- Documentation
- 30-day support included

---

### **Milestone Tracking in Airtable**

**Projects Table** (Structure):
- Project Name
- Customer (linked to Customers table)
- Status: "Planning", "In Progress", "Testing", "Delivered", "Complete"
- Progress: 0-100%
- Milestones (linked to Milestones table)
- Start Date
- Estimated Completion Date
- Actual Completion Date

**Milestones Table** (To Be Created):
- Milestone Name
- Project (linked to Projects table)
- Status: "Not Started", "In Progress", "Complete"
- Due Date
- Completed Date
- Blocker (if any)

**Automated Status Updates** (To Be Built):
- n8n workflow checks project progress daily
- Updates customer via email when milestone completed
- Alerts admin if milestone overdue
- Automatically marks project "Delivered" when all milestones complete

---

### **Success Metrics & KPIs**

**Marketplace Success Criteria**:
- Template downloaded within 2 hours: ✅
- Customer submits support ticket: ⚠️ (means confusion)
- Customer purchases another template within 30 days: ✅ (upsell success)

**Subscription Success Criteria**:
- First leads delivered within 24 hours: ✅
- Customer logs into portal within 7 days: ✅
- Customer exports leads to CRM: ✅
- Subscription active after 3 months: ✅ (retention success)

**Ready Solution Success Criteria**:
- Kickoff call within 1 business day: ✅
- All milestones completed on time: ✅
- Customer satisfied with delivery (NPS ≥8): ✅
- Workflows running error-free for 30 days: ✅

**Custom Solution Success Criteria**:
- Consultation within 1 hour of booking: ✅
- Quote approved within 3 days: ✅
- Project delivered within quoted timeline: ✅
- Customer refers another customer: ✅ (advocacy success)

---

## 🔄 STAGE 4: ACTIVE CUSTOMER → RETENTION & UPSELL

### **Ongoing Engagement Strategy**

**Marketplace Customers**:
- **Week 1**: "How's your template working?" email
- **Week 2**: "Need help installing?" support check-in
- **Month 1**: "New templates added" newsletter
- **Month 3**: "Upgrade to Full-Service Install?" upsell email
- **Month 6**: "Advanced templates for power users" upsell

**Subscription Customers**:
- **Week 1**: "Your first leads delivered" notification
- **Month 1**: "How's your lead quality?" survey
- **Month 3**: "Upgrade to higher tier?" upsell (if using >80% of leads)
- **Month 6**: "Referral bonus" incentive (give $100, get $100)
- **Month 12**: "Annual plan discount" retention offer (save 20%)

**Ready Solution Customers**:
- **Week 1**: Post-delivery check-in
- **Month 1**: "Is everything running smoothly?" support call
- **Month 3**: "Add more workflows?" upsell email
- **Month 6**: "Additional integrations?" upsell
- **Year 1**: "Maintenance package" renewal offer

**Custom Solution Customers**:
- **Week 1**: Post-delivery training follow-up
- **Month 1**: "Need adjustments?" change request check-in
- **Quarter 1**: "Business review" strategic call
- **Quarter 2**: "New automation opportunities?" discovery call
- **Year 1**: "Annual optimization package" retention offer

---

### **Retention Tactics**

**Churn Risk Detection** (To Be Built):
- **Marketplace**: No logins to portal in 60 days → "Miss you" email
- **Subscription**: No lead exports in 14 days → "Everything OK?" email
- **Ready Solution**: Workflows disabled in n8n → "Technical issue?" support call
- **Custom Solution**: No communication in 30 days → "How can we help?" check-in

**Win-Back Campaigns**:
- **Cancelled Subscription**: "Come back" email with 1-month free offer
- **Inactive Marketplace Customer**: "New templates" email with 20% discount
- **Completed Project**: "Need more help?" email 6 months after delivery

---

### **Upsell Triggers & Opportunities**

**Marketplace → Ready Solution** (Natural Upgrade Path):
- Customer purchases 3+ templates → "Save time with Ready Solution" email
- Customer submits 2+ support tickets → "Let us do it for you" offer
- Customer asks "Can you customize this?" → "Custom Solution available" reply

**Subscription Tier Upgrades**:
- **Starter ($299/mo) → Growth ($799/mo)**: When customer exports >80 leads/month
- **Growth ($799/mo) → Scale ($1,499/mo)**: When customer exports >250 leads/month
- **Trigger**: Automated email when threshold reached: "You're at 85% of your plan limit. Upgrade to avoid hitting the cap."

**Ready Solution → Custom Solution** (Complex Needs):
- Customer requests feature not in package → "Custom build available"
- Customer asks for 5+ additional workflows → "Custom package better fit"
- Customer needs unique integration → "Custom Solution recommended"

**One-Time → Recurring Revenue**:
- Marketplace customer → "Subscription maintenance" offer ($99/mo for updates & support)
- Ready Solution customer → "Managed workflows" offer ($299/mo for monitoring & updates)
- Custom Solution customer → "Retainer package" offer ($799-$1,499/mo for ongoing work)

---

### **Referral & Advocacy Program** (To Be Built)

**Affiliate Program** (Already Defined in CLAUDE.md):
- **Give**: $100 credit for referee
- **Get**: $100 credit for referrer
- **Mechanism**: Unique referral link in customer portal
- **Tracking**: Airtable "Affiliate Links" table (to be created)

**Case Study Incentive**:
- **Offer**: 1 month free subscription OR $500 credit
- **Requirements**:
  - Video testimonial (2-3 minutes)
  - Written case study (500-1,000 words)
  - Permission to use logo on website
- **Process**: Outreach email 60 days after project completion

**Review Incentive**:
- **Offer**: $50 credit
- **Requirements**:
  - 5-star review on Google or Trustpilot
  - 100+ word review
- **Process**: Automated email 30 days after purchase

---

### **Customer Health Scoring** (To Be Built)

**Health Score Factors** (0-100 scale):

**Engagement Score** (40 points):
- Portal logins per month (0-10 points)
- Feature usage (0-10 points)
- Support ticket response time (0-10 points)
- Email open rate (0-10 points)

**Product Usage Score** (30 points):
- Workflows active (0-10 points)
- Workflows running without errors (0-10 points)
- API calls per month (0-10 points)

**Payment Score** (20 points):
- Payment on time (0-10 points)
- No failed payments (0-10 points)

**Satisfaction Score** (10 points):
- NPS score (0-10 points)

**Health Score Ranges**:
- **80-100**: Healthy (Green) - Engage for upsell
- **50-79**: At Risk (Yellow) - Check in, offer help
- **0-49**: Churning (Red) - Urgent intervention needed

**Automated Alerts**:
- Health score drops below 50 → Slack notification to account manager
- Health score drops below 30 → Email to CEO (high-value customers only)
- Health score increases above 80 → Add to "upsell prospects" list

---

### **Customer Lifecycle Automation** (n8n Workflow - To Be Built)

**Workflow: INT-CUSTOMER-LIFECYCLE**

**Purpose**: Automate customer engagement, health scoring, upsell triggers, and churn prevention

**Trigger**: Scheduled (daily at 9am CT)

**Nodes**:
1. **Fetch All Customers from Airtable**
2. **Calculate Health Score for Each Customer** (based on factors above)
3. **Update Health Score in Airtable**
4. **Branch by Health Score**:
   - **If Health Score < 50**: Send alert to admin
   - **If Health Score < 30**: Create urgent task in Airtable
   - **If Health Score > 80**: Add to "upsell prospects" list
5. **Check for Upsell Triggers** (usage thresholds)
6. **Send Automated Engagement Emails** (based on customer lifecycle stage)
7. **Log Activity in Airtable**

---

## 📊 Journey Metrics & KPIs

### **Stage 1: Awareness → Purchase**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Website Traffic** | 3,000-5,000/month | Google Analytics |
| **Landing Page Conversion Rate** | 2-5% | Stripe checkout sessions / page views |
| **Average Order Value** | $800-$1,200 | Stripe revenue / orders |
| **Traffic Source ROI** | 3:1 (organic), 2:1 (paid) | Revenue / acquisition cost |

### **Stage 2: Purchase → Onboarding**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Onboarding Completion Rate** | 90%+ | Customers with portal access / total customers |
| **Time to First Value** | <24 hours | First login / first action completed |
| **Support Tickets (Onboarding)** | <10% of customers | Tickets tagged "onboarding" |
| **Customer Satisfaction (NPS)** | 8+ | Post-onboarding survey |

### **Stage 3: Onboarding → Active**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Active Usage Rate** | 80%+ | Customers using product weekly |
| **Feature Adoption** | 60%+ | Customers using 3+ features |
| **Support Ticket Resolution Time** | <24 hours | Ticket close time - create time |
| **Project Completion Rate** | 95%+ | Projects delivered / projects started |

### **Stage 4: Active → Retention**

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Customer Retention Rate** | 85%+ | Customers retained / total customers (monthly cohort) |
| **Monthly Recurring Revenue (MRR)** | $20K-$50K | Sum of all subscription revenue |
| **Upsell Rate** | 20%+ | Customers upgraded / total active customers |
| **Customer Lifetime Value (LTV)** | $3,000-$8,000 | Average revenue per customer over lifetime |
| **Net Revenue Retention** | 110%+ | (Starting MRR + Expansion - Churn) / Starting MRR |
| **Referral Rate** | 15%+ | Customers who referred / total customers |

---

## 🎯 Gaps & Action Items

### **Critical Gaps Identified**:

**Stage 1: Awareness → Purchase** ⚠️
1. ❌ **No Typeform integration on 19 pages**: Forms exist but not embedded
   - Action: Add Typeform embeds to all 19 pages
   - Estimate: 2 hours

2. ❌ **No analytics tracking**: Can't measure conversion rates accurately
   - Action: Add Google Analytics 4 + Stripe conversion tracking
   - Estimate: 1 hour

**Stage 2: Purchase → Onboarding** ⚠️
3. ⚠️ **n8n workflow DEV-FIN-006 only 40-60% automated**: Many manual steps remaining
   - Action: Complete all automation nodes in workflow
   - Estimate: 4-6 hours

4. ❌ **No email templates created**: Using placeholder text
   - Action: Design and code 8 email templates
   - Estimate: 6-8 hours

5. ❌ **Typeform webhook URLs not configured**: Forms won't trigger workflows
   - Action: Update 4 Typeform webhook URLs to production n8n
   - Estimate: 20 minutes

**Stage 3: Onboarding → Active** ❌
6. ❌ **Customer portal doesn't exist**: Referenced but not built
   - Action: Build 4 customer portal views
   - Estimate: 2-3 weeks

7. ❌ **No project milestone tracking**: Manual tracking in spreadsheets
   - Action: Create Milestones table in Airtable + n8n automation
   - Estimate: 1 day

**Stage 4: Active → Retention** ❌
8. ❌ **No customer health scoring**: Can't identify churn risk
   - Action: Build INT-CUSTOMER-LIFECYCLE workflow
   - Estimate: 1-2 days

9. ❌ **No automated engagement emails**: All outreach is manual
   - Action: Build engagement email sequences in n8n
   - Estimate: 2-3 days

10. ❌ **No referral program tracking**: Affiliate links exist but not tracked in Airtable
    - Action: Create "Affiliate Links" table + tracking workflow
    - Estimate: 4 hours

---

## 📋 Recommended Priorities

### **Phase 1: Complete Post-Purchase Automation** (1-2 weeks)
1. Finish n8n workflow DEV-FIN-006 (100% automation)
2. Create 8 email templates (customer + admin notifications)
3. Configure Typeform production webhooks
4. Add Google Analytics tracking to all pages
5. Test end-to-end Stripe checkout → customer email flow

### **Phase 2: Build Customer Portal** (3-4 weeks)
6. Design portal UI/UX (4 different views)
7. Build Marketplace customer portal (downloads, support)
8. Build Subscription customer portal (leads dashboard, analytics)
9. Build Ready Solution customer portal (project status, milestones)
10. Build Custom Solution customer portal (timeline, documentation)

### **Phase 3: Implement Retention System** (2-3 weeks)
11. Build customer health scoring in n8n
12. Create Milestones table in Airtable
13. Build INT-CUSTOMER-LIFECYCLE workflow
14. Create automated engagement email sequences
15. Build referral program tracking

### **Phase 4: Optimize & Scale** (Ongoing)
16. A/B test landing pages
17. Optimize email templates (open rates, click rates)
18. Add more Typeforms (lead qualification, NPS surveys)
19. Build advanced analytics dashboard
20. Expand to new service types

---

## ✅ Customer Journey Documentation Complete

**Status**: ✅ COMPLETE - All 4 journey stages documented (Oct 7, 2025, 11:45 PM)

**Documentation Includes**:
- 19 landing pages mapped with entry points
- 63 buttons documented with checkout flows
- Post-purchase automation (DEV-FIN-006 workflow)
- Onboarding processes for 4 service types
- Retention tactics and upsell triggers
- Customer health scoring framework
- 10 critical gaps identified with action items

**Next Steps**:
- Implement Phase 1 (Complete post-purchase automation)
- Build customer portal (Phase 2)
- Deploy retention system (Phase 3)

**Integration with BMAD Project**:
- Task 1 (Customer Journey): ✅ COMPLETE
- Task 2 (Button Flow Map): ✅ COMPLETE
- Task 3 (Typeform Audit): ✅ COMPLETE
- Task 4 (Post-Purchase Automation): ✅ COMPLETE
- Task 5 (Design Consistency): NEXT

**Total Time**: 2 hours (as estimated)
