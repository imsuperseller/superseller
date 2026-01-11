# Website Page Audit Plan - November 12, 2025

**Purpose**: Comprehensive audit of all website pages to identify what needs attention  
**Architecture**: Vercel (Next.js) Frontend + n8n Backend Automation

---

## 🏗️ **ARCHITECTURE CLARIFICATION**

### **Vercel (Next.js) Handles**:
- ✅ **Frontend**: All pages, UI, user interactions
- ✅ **API Routes**: Stripe checkout, webhook validation, data fetching
- ✅ **Static Assets**: Images, CSS, JavaScript
- ✅ **Server-Side Rendering**: Dynamic page generation
- ✅ **Client-Side Logic**: React components, state management

### **n8n Handles** (Backend Automation):
- ✅ **Stripe Webhook Processing**: Post-purchase automation (DEV-FIN-006)
- ✅ **Customer Onboarding**: Automated workflows after purchase
- ✅ **Lead Generation**: INT-LEAD-001 (LinkedIn, Google Maps, Facebook scraping)
- ✅ **Data Syncing**: n8n → Airtable → Notion (INT-TECH-005)
- ✅ **Email Automation**: Customer notifications, admin alerts
- ✅ **Marketplace Product Delivery**: Workflow file delivery, installation booking
- ✅ **Subscription Management**: Lead delivery, CRM integration
- ✅ **Custom Solution Workflows**: Customer-specific automation (on customer n8n Cloud instances)
- ✅ **Affiliate Tracking**: n8n affiliate link tracking and revenue attribution

### **n8n is STILL CRITICAL** because:
1. **Backend Automation**: Vercel can't run long-running workflows
2. **Webhook Processing**: Stripe webhooks trigger n8n workflows
3. **Data Processing**: Lead enrichment, data transformation
4. **Integrations**: Airtable, Notion, Slack, email services
5. **Customer Workflows**: Custom automation for customers (on their n8n Cloud instances)
6. **Product Delivery**: Marketplace workflow files, installation services

---

## 📋 **PAGE AUDIT CHECKLIST**

**Note**: Design system issues resolved November 14, 2025 - All pages now use brand colors (#fe3d51, #1eaef7, #bf5700, #5ffbfd), Outfit font, dark theme (#110d28), and standardized headers.

### **Priority 1: Core Service Pages** (Revenue-Generating)

#### **1. Homepage** (`/`)
- [ ] **Status**: ✅ Live
- [ ] **Content**: Shows all 4 service types
- [ ] **CTAs**: Links to Marketplace, Custom, Subscriptions, Solutions
- [ ] **Needs**: 
  - [ ] Verify all links work
  - [ ] Test Stripe checkout buttons (if any)
  - [ ] Check mobile responsiveness
  - [ ] Verify Typeform integration (if any)

#### **2. Marketplace** (`/marketplace`)
- [ ] **Status**: ✅ Live
- [ ] **API**: ✅ Switched to Boost.space
- [ ] **Needs**:
  - [ ] Test workflow loading from Boost.space
  - [ ] Verify Stripe checkout buttons work
  - [ ] Test download flow (if implemented)
  - [ ] Check category filtering
  - [ ] Verify search functionality
  - [ ] Test "Installation Service" booking

#### **3. Custom Solutions** (`/custom`)
- [ ] **Status**: ✅ Live
- [ ] **Typeform**: ✅ Integrated (`fkYnNvga`)
- [ ] **Needs**:
  - [ ] Test Typeform opens correctly
  - [ ] Verify voice consultation UI (if still needed)
  - [ ] Test consultation data pre-fill
  - [ ] Check Stripe checkout for entry-level products ($297-$1,997)

#### **4. Subscriptions** (`/subscriptions`)
- [ ] **Status**: ✅ Live
- [ ] **Needs**:
  - [ ] Test Stripe checkout for subscriptions
  - [ ] Verify pricing tiers display correctly
  - [ ] Test Typeform integration (if any)
  - [ ] Check lead generation form (if any)
  - [ ] Verify subscription management links

#### **5. Ready Solutions** (`/solutions`)
- [ ] **Status**: ✅ Live
- [ ] **Needs**:
  - [ ] Test Stripe checkout for packages
  - [ ] Verify industry-specific pages (HVAC, Roofer, etc.)
  - [ ] Test Typeform integration (`EpEv9A1S` - Industry Solution Inquiry)
  - [ ] Check pricing display
  - [ ] Verify CTA buttons

---

### **Priority 2: Supporting Pages**

#### **6. About** (`/about` - if exists)
- [ ] **Status**: Check if exists
- [ ] **Needs**: Content review, links verification

#### **7. Contact** (`/contact`)
- [ ] **Status**: ✅ Exists
- [ ] **Needs**:
  - [ ] Test contact form (if any)
  - [ ] Verify email/phone display
  - [ ] Check Typeform integration (if any)

#### **8. Legal Pages**
- [ ] **Privacy Policy** (`/legal/privacy` or `/legal/privacy-policy`)
- [ ] **Terms** (`/legal/terms`)
- [ ] **Needs**: Content review, ensure up-to-date

#### **9. Success/Cancel Pages**
- [ ] **Success** (`/success`)
- [ ] **Cancel** (`/cancel`)
- [ ] **Needs**:
  - [ ] Test redirects from Stripe
  - [ ] Verify success message display
  - [ ] Check if n8n workflows triggered correctly

---

### **Priority 3: Admin & Internal Pages**

#### **10. Admin Dashboard** (`/admin` or `admin.rensto.com`)
- [ ] **Status**: ⚠️ Outdated (August 2024)
- [ ] **Needs**:
  - [ ] Complete redesign for 4 service types
  - [ ] Add revenue cards (Marketplace, Ready Solutions, Subscriptions, Custom)
  - [ ] Add customer portal links
  - [ ] Add n8n workflow status monitoring
  - [ ] Add Stripe integration dashboard
  - [ ] Add Boost.space integration status

#### **11. Customer Portal** (`/portal/:customer`)
- [ ] **Status**: ⚠️ Exists but outdated
- [ ] **Needs**:
  - [ ] Update for new business model
  - [ ] Add 4 different portal views (one per service type)
  - [ ] Add invoice history
  - [ ] Add project status
  - [ ] Add payment tracking
  - [ ] Add n8n Cloud instance links

---

### **Priority 4: Niche Pages** (Industry-Specific)

#### **12. Industry Pages** (HVAC, Roofer, Dentist, etc.)
- [ ] **Status**: ✅ Live (15 niche pages)
- [ ] **Needs**:
  - [ ] Test Stripe checkout on each page
  - [ ] Verify industry-specific content
  - [ ] Check Typeform integration
  - [ ] Test mobile responsiveness
  - [ ] Verify links to main service pages

**Niche Pages List**:
- `/solutions/hvac`
- `/solutions/roofer`
- `/solutions/dentist`
- `/solutions/realtor`
- `/solutions/bookkeeping`
- `/solutions/busy-mom`
- `/solutions/ecommerce`
- `/solutions/fence-contractors`
- `/solutions/insurance`
- `/solutions/lawyer`
- `/solutions/locksmith`
- `/solutions/photographers`
- `/solutions/product-supplier`
- `/solutions/synagogues`
- (Add more as needed)

---

## 🔍 **AUDIT CRITERIA**

For each page, check:

### **Functionality**:
- [ ] Page loads without errors
- [ ] All links work
- [ ] Forms submit correctly
- [ ] Stripe checkout works (if applicable)
- [ ] Typeform integration works (if applicable)
- [ ] API calls succeed (Marketplace, etc.)

### **Content**:
- [ ] Content is accurate and up-to-date
- [ ] Pricing is correct
- [ ] CTAs are clear and compelling
- [ ] No broken images or assets
- [ ] No placeholder text

### **Performance**:
- [ ] Page loads in < 3 seconds
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Images optimized
- [ ] Cache headers working

### **Integration**:
- [ ] Stripe checkout connected
- [ ] Typeform forms linked (if applicable)
- [ ] n8n webhooks triggered (if applicable)
- [ ] Boost.space API working (Marketplace)
- [ ] Email notifications sent (if applicable)

---

## 📊 **n8n WORKFLOW DEPENDENCIES**

### **Pages That Trigger n8n Workflows**:

1. **Marketplace Purchase** (`/marketplace`):
   - Stripe checkout → Webhook → `DEV-FIN-006` (Revenue Sync)
   - Triggers: Customer creation, invoice creation, email notifications

2. **Custom Solutions Purchase** (`/custom`):
   - Stripe checkout → Webhook → `STRIPE-CUSTOM-001`
   - Triggers: Consultation booking, project creation

3. **Subscription Purchase** (`/subscriptions`):
   - Stripe checkout → Webhook → `STRIPE-SUBSCRIPTION-001`
   - Triggers: Subscription activation, lead delivery setup

4. **Ready Solutions Purchase** (`/solutions`):
   - Stripe checkout → Webhook → `STRIPE-READY-001`
   - Triggers: Package delivery, onboarding workflow

---

## 🎯 **AUDIT EXECUTION PLAN**

### **Phase 1: Core Pages** (Priority 1)
1. Homepage
2. Marketplace
3. Custom Solutions
4. Subscriptions
5. Ready Solutions

**Time Estimate**: 2-3 hours

### **Phase 2: Supporting Pages** (Priority 2)
6. Contact
7. Legal pages
8. Success/Cancel pages

**Time Estimate**: 1 hour

### **Phase 3: Niche Pages** (Priority 4)
9. Test 3-5 representative niche pages
10. Document patterns/issues
11. Apply fixes to all niche pages

**Time Estimate**: 2-3 hours

### **Phase 4: Admin & Internal** (Priority 3)
12. Admin dashboard redesign
13. Customer portal updates

**Time Estimate**: 5-7 days (separate project)

---

## 📝 **AUDIT TEMPLATE**

For each page, document:

```markdown
## Page: [URL]

**Status**: ✅ Live / ⚠️ Issues / ❌ Broken
**Last Updated**: [Date]

### **Functionality**:
- [ ] Page loads: ✅ / ❌
- [ ] Links work: ✅ / ❌
- [ ] Forms work: ✅ / ❌
- [ ] Stripe checkout: ✅ / ❌
- [ ] Typeform: ✅ / ❌ / N/A

### **Issues Found**:
1. [Issue description]
2. [Issue description]

### **Actions Needed**:
1. [Action item]
2. [Action item]

### **n8n Dependencies**:
- [Workflow name]: [Purpose]
- [Workflow name]: [Purpose]
```

---

## ✅ **NEXT STEPS**

1. **Start with Priority 1 pages** (Core service pages)
2. **Test each page systematically** using the audit template
3. **Document all issues** found
4. **Create fix tickets** for each issue
5. **Prioritize fixes** by impact (revenue vs. UX)
6. **Test fixes** before marking complete

---

**Status**: 📋 **PLAN READY**  
**Estimated Total Time**: 5-7 hours for Priority 1-2, 2-3 hours for Priority 4, 5-7 days for Priority 3

