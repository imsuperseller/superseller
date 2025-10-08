# 🚀 Deploy Now - Step-by-Step Guide

**Estimated Time**: 3-4 hours total
**Prerequisites**: Webflow Designer access
**Pages to Deploy**: 24 total

---

## ⚡ PHASE 1: QUICK FIXES (20 minutes)

### **Fix 1: Remove Broken Footer Links** (5 minutes)

**Problem**: 6 links in footer return 404 errors

**Steps**:
1. Open Webflow Designer
2. Click on any page (footer is global)
3. Find the footer section at bottom
4. Locate these 6 links and DELETE them:
   - Privacy Policy (`/privacy`)
   - Terms of Service (`/terms`)
   - Cookie Policy (`/cookies`)
   - Security (`/security`)
   - API Documentation (`/api`)
   - Case Studies (`/case-studies`)

**Result**: Footer will have fewer links but no 404 errors

**Note**: You'll add legal pages back later (1-2 weeks) with proper content

---

### **Fix 2: Add About + Pricing to Header** (15 minutes)

**Problem**: About and Pricing pages exist but not in navigation

**Steps**:
1. In Webflow Designer, click on header (global component)
2. Find navigation menu
3. Add 2 new nav links:
   - **About** → `/about`
   - **Pricing** → `/pricing`
4. Suggested placement: After "Ready Solutions"

**Result**: Full navigation menu

---

## 📄 PHASE 2: DEPLOY HOMEPAGE (30 minutes)

### **Step 1: Create Homepage in Webflow**

1. Open Webflow Designer
2. Go to Pages panel (left sidebar)
3. Click **"+ New Page"**
4. Settings:
   - **Page name**: Home or Homepage
   - **URL slug**: `/` (root)
   - **Set as home page**: ✅ YES

### **Step 2: Add Custom Code**

1. With homepage selected, click **Page Settings** (gear icon)
2. Scroll to **"Custom Code"** section
3. Find **"Before </body> tag"** field
4. Open `/webflow/pages/WEBFLOW_EMBED_HOMEPAGE.html` on your computer
5. **Copy entire file contents** (all 998 lines)
6. **Paste into Webflow** custom code field
7. Click **"Save"**

### **Step 3: Test Locally**

1. Click **"Preview"** in Webflow Designer
2. Check console (F12) for: `🎯 Rensto Homepage Initialized`
3. Verify:
   - ✅ Hero section loads
   - ✅ Stats display correctly
   - ✅ 4 service path cards visible
   - ✅ Lead magnet form present
   - ✅ FAQ accordion works (click to expand)
   - ✅ Mobile responsive (resize browser)

### **Step 4: Publish**

1. Click **"Publish"** button (top right)
2. Confirm publication
3. Wait for deployment (~30 seconds)
4. Visit `https://www.rensto.com` to verify live

---

## 🛒 PHASE 3: DEPLOY SERVICE PAGES (1 hour)

### **Marketplace Page**

**File**: `WEBFLOW_EMBED_MARKETPLACE_CVJ.html`

1. Go to `/marketplace` page in Webflow
2. If page doesn't exist:
   - Create new page: "Marketplace"
   - URL slug: `/marketplace`
3. Page Settings → Custom Code → Before </body>
4. Copy/paste entire file contents
5. Save and Preview
6. Test: Click any of the 6 Stripe buttons (should open checkout)
7. Publish

---

### **Subscriptions Page**

**File**: `WEBFLOW_EMBED_SUBSCRIPTIONS_CVJ.html`

1. Go to `/subscriptions` page in Webflow
2. If page doesn't exist:
   - Create new page: "Subscriptions"
   - URL slug: `/subscriptions`
3. Page Settings → Custom Code → Before </body>
4. Copy/paste entire file contents
5. Save and Preview
6. Test: Click any of the 3 Stripe buttons
7. Publish

---

### **Custom Solutions Page**

**File**: `WEBFLOW_EMBED_CUSTOM_SOLUTIONS_CVJ.html`

1. Go to `/custom-solutions` page in Webflow
2. If page doesn't exist:
   - Create new page: "Custom Solutions"
   - URL slug: `/custom-solutions`
3. Page Settings → Custom Code → Before </body>
4. Copy/paste entire file contents
5. Save and Preview
6. Test:
   - Click 2 Stripe buttons (Business Audit $297, Automation Sprint $1,997)
   - Click "Book Free Consultation" (should open Typeform popup)
7. Publish

---

### **Ready Solutions Page**

**File**: `WEBFLOW_EMBED_READY_SOLUTIONS_CVJ.html`

1. Go to `/ready-solutions` page in Webflow
2. If page doesn't exist:
   - Create new page: "Ready Solutions"
   - URL slug: `/ready-solutions`
3. Page Settings → Custom Code → Before </body>
4. Copy/paste entire file contents
5. Save and Preview
6. Test:
   - Click 3 Stripe buttons (Single $890, Complete $2,990, Installation $797)
   - Click industry filter chips (All, Home Services, Professional, etc.)
7. Publish

---

## 📝 PHASE 4: DEPLOY CONTENT PAGES (30 minutes)

### **About Page**

**File**: `WEBFLOW_EMBED_ABOUT.html`

1. Go to `/about` page (should already exist)
2. Page Settings → Custom Code → Before </body>
3. Copy/paste entire file contents (654 lines)
4. Save and Preview
5. Verify founder story, mission, impact stats display
6. Publish

---

### **Pricing Page**

**File**: `WEBFLOW_EMBED_PRICING.html`

1. Go to `/pricing` page (should already exist)
2. Page Settings → Custom Code → Before </body>
3. Copy/paste entire file contents (534 lines)
4. Save and Preview
5. Test Monthly/Yearly toggle
6. Test FAQ accordion
7. Publish

---

### **Help Center Page**

**File**: `WEBFLOW_EMBED_HELP_CENTER.html`

1. Go to `/help-center` page
2. If doesn't exist, create with URL: `/help-center`
3. Page Settings → Custom Code → Before </body>
4. Copy/paste entire file contents (671 lines)
5. Save and Preview
6. Test search bar (Enter key should work)
7. Publish

---

## 🏘️ PHASE 5: DEPLOY NICHE PAGES (1 hour)

**All 16 niche pages follow same process:**

### **Batch Deployment Process**

**For each page**:
1. Create page in Webflow (if doesn't exist)
2. Set URL slug (e.g., `/hvac`, `/realtor`, `/dentist`)
3. Page Settings → Custom Code → Before </body>
4. Copy/paste corresponding HTML file
5. Save (don't need to preview each one)

### **List of 16 Niche Pages**

| # | Page | File | URL |
|---|------|------|-----|
| 1 | Amazon Seller | `WEBFLOW_EMBED_AMAZON-SELLER.html` | `/amazon-seller` |
| 2 | Bookkeeping | `WEBFLOW_EMBED_BOOKKEEPING.html` | `/bookkeeping` |
| 3 | Busy Mom | `WEBFLOW_EMBED_BUSY-MOM.html` | `/busy-mom` |
| 4 | Dentist | `WEBFLOW_EMBED_DENTIST.html` | `/dentist` |
| 5 | E-commerce | `WEBFLOW_EMBED_ECOMMERCE.html` | `/ecommerce` |
| 6 | Fence Contractor | `WEBFLOW_EMBED_FENCE-CONTRACTOR.html` | `/fence-contractor` |
| 7 | HVAC | `WEBFLOW_EMBED_HVAC.html` | `/hvac` |
| 8 | Insurance | `WEBFLOW_EMBED_INSURANCE.html` | `/insurance` |
| 9 | Lawyer | `WEBFLOW_EMBED_LAWYER.html` | `/lawyer` |
| 10 | Locksmith | `WEBFLOW_EMBED_LOCKSMITH.html` | `/locksmith` |
| 11 | Photographer | `WEBFLOW_EMBED_PHOTOGRAPHER.html` | `/photographer` |
| 12 | Product Supplier | `WEBFLOW_EMBED_PRODUCT-SUPPLIER.html` | `/product-supplier` |
| 13 | Realtor | `WEBFLOW_EMBED_REALTOR.html` | `/realtor` |
| 14 | Roofer | `WEBFLOW_EMBED_ROOFER.html` | `/roofer` |
| 15 | Synagogue | `WEBFLOW_EMBED_SYNAGOGUE.html` | `/synagogue` |
| 16 | Torah Teacher | `WEBFLOW_EMBED_TORAH-TEACHER.html` | `/torah-teacher` |

### **After All 16 Deployed**

1. Spot-check 3-4 pages (HVAC, Realtor, Dentist)
2. Verify mobile responsiveness
3. **Publish All**

---

## ✅ PHASE 6: TESTING (1 hour)

### **Critical Tests**

#### **1. All Stripe Buttons** (30 minutes)

**Service Pages to Test**:

**Marketplace** (6 buttons):
- [ ] DIY Simple ($29)
- [ ] DIY Standard ($97)
- [ ] DIY Advanced ($197)
- [ ] Full-Service Basic ($797)
- [ ] Full-Service Professional ($1,997)
- [ ] Full-Service Enterprise ($3,500+)

**Subscriptions** (3 buttons):
- [ ] Starter ($299/mo)
- [ ] Professional ($599/mo)
- [ ] Enterprise ($1,499/mo)

**Custom Solutions** (2 buttons):
- [ ] Business Audit ($297)
- [ ] Automation Sprint ($1,997)

**Ready Solutions** (3 buttons):
- [ ] Single Solution ($890)
- [ ] Complete Package ($2,990)
- [ ] +Installation ($797)

**Expected**: All 14 buttons should redirect to Stripe checkout

---

#### **2. Typeform Integration** (5 minutes)

**Custom Solutions Page**:
- [ ] Click "Book Free Consultation" button
- [ ] Typeform popup should open (800x600 window)
- [ ] Verify Typeform ID: `01JKTNHQXKAWM6W90F0A6JQNJ7`

---

#### **3. FAQ Accordions** (5 minutes)

**Test on These Pages**:
- [ ] Homepage (8 questions)
- [ ] Marketplace (6 questions)
- [ ] Subscriptions (6 questions)
- [ ] Custom Solutions (FAQ section)
- [ ] Ready Solutions (FAQ section)
- [ ] Pricing (8 questions)

**Expected**: Click question → Answer expands, icon rotates

---

#### **4. Forms** (5 minutes)

**Homepage Lead Magnet**:
- [ ] Enter email in form
- [ ] Click "Get Free Guide"
- [ ] Should see alert: "Success! Check your email..."
- [ ] Form should reset

**Note**: Replace alert with n8n webhook later (Phase 7)

---

#### **5. Mobile Responsiveness** (10 minutes)

**Test on Mobile Device or Browser DevTools**:

**Pages to Check**:
- [ ] Homepage (all sections stack correctly)
- [ ] Marketplace (pricing cards single column)
- [ ] Subscriptions (tables scroll horizontally)
- [ ] All service pages (buttons full-width)

**Breakpoints to Test**:
- 768px (tablet)
- 375px (mobile)

**Expected**: No horizontal scroll, all content readable

---

#### **6. Console Errors** (5 minutes)

**Open Browser Console (F12) on Each Page**:

- [ ] Homepage: `🎯 Rensto Homepage Initialized`
- [ ] Marketplace: `🎯 Rensto Marketplace Checkout Initialized`
- [ ] Subscriptions: `🎯 Rensto Subscriptions Checkout Initialized`
- [ ] Custom Solutions: `🎯 Rensto Custom Solutions Initialized`
- [ ] Ready Solutions: `🎯 Rensto Ready Solutions Initialized`

**Expected**: No red errors, only initialization messages

---

## 🔧 PHASE 7: POST-LAUNCH FIXES (2 hours)

**Can be done AFTER launch** - not blocking

### **1. Build n8n Webhooks** (1.5 hours)

**Webhooks Needed** (4 total):

#### **Homepage Lead Magnet**
- **Endpoint**: `https://n8n.rensto.com/webhook/homepage-lead-magnet`
- **Fields**: email, source, timestamp
- **Action**: Add to Airtable, send welcome email with guide

#### **Marketplace Lead Magnet**
- **Endpoint**: `https://n8n.rensto.com/webhook/marketplace-lead-magnet`
- **Fields**: email, source, timestamp
- **Action**: Add to Airtable, send template guide

#### **Custom Solutions Scorecard**
- **Endpoint**: `https://n8n.rensto.com/webhook/custom-scorecard`
- **Fields**: Various scorecard responses
- **Action**: Calculate score, add to Airtable, send results

#### **Ready Solutions Checklist**
- **Endpoint**: `https://n8n.rensto.com/webhook/ready-checklist`
- **Fields**: Industry, selected solutions
- **Action**: Add to Airtable, send personalized quote

---

### **2. Update Form Handlers** (30 minutes)

**Homepage** (`WEBFLOW_EMBED_HOMEPAGE.html` line 958):
```javascript
// Replace this section:
fetch('https://n8n.rensto.com/webhook/homepage-lead-magnet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: email,
        source: 'homepage_lead_magnet',
        timestamp: new Date().toISOString()
    })
})
```

**Repeat for**:
- Marketplace form handler
- Custom Solutions scorecard
- Ready Solutions checklist

---

## 📋 DEPLOYMENT CHECKLIST

### **Pre-Deployment** (Done)
- [x] All 24 HTML files created
- [x] All service pages audited
- [x] Homepage created with CVJ framework
- [x] Documentation complete

### **Phase 1: Quick Fixes**
- [ ] Remove 6 broken footer links (5 min)
- [ ] Add About + Pricing to header (15 min)

### **Phase 2: Deploy Homepage**
- [ ] Create homepage in Webflow (5 min)
- [ ] Add custom code (5 min)
- [ ] Test locally (10 min)
- [ ] Publish (2 min)
- [ ] Verify live (5 min)

### **Phase 3: Deploy Service Pages**
- [ ] Marketplace (15 min)
- [ ] Subscriptions (15 min)
- [ ] Custom Solutions (15 min)
- [ ] Ready Solutions (15 min)

### **Phase 4: Deploy Content Pages**
- [ ] About (10 min)
- [ ] Pricing (10 min)
- [ ] Help Center (10 min)

### **Phase 5: Deploy Niche Pages**
- [ ] Create/verify all 16 pages exist (20 min)
- [ ] Paste custom code in all 16 (30 min)
- [ ] Spot-check 3-4 pages (10 min)

### **Phase 6: Testing**
- [ ] Test all 14 Stripe buttons (30 min)
- [ ] Test Typeform integration (5 min)
- [ ] Test FAQ accordions (5 min)
- [ ] Test forms (5 min)
- [ ] Test mobile responsiveness (10 min)
- [ ] Check console for errors (5 min)

### **Phase 7: Post-Launch** (Optional - After Launch)
- [ ] Build 4 n8n webhooks (1.5 hours)
- [ ] Update form handlers (30 min)
- [ ] Create legal pages (1-2 weeks)

---

## 🚨 TROUBLESHOOTING

### **Issue: Stripe Button Doesn't Work**

**Symptoms**: Button click does nothing, or console shows errors

**Checks**:
1. Open browser console (F12)
2. Look for error messages
3. Verify button has correct attributes:
   - `data-flow-type`
   - `data-tier` or `data-product`
   - `data-price`

**Fix**: Re-paste HTML file, ensure no edits were made

---

### **Issue: Page Looks Broken on Mobile**

**Symptoms**: Horizontal scroll, tiny text, overlapping elements

**Checks**:
1. Verify entire HTML file was pasted (not truncated)
2. Check if Webflow added conflicting styles
3. Test in different browsers (Chrome, Safari, Firefox)

**Fix**: Clear Webflow custom CSS if any exists

---

### **Issue: FAQ Doesn't Expand**

**Symptoms**: Clicking FAQ question does nothing

**Checks**:
1. Console shows: `toggleFAQ is not defined`
2. JavaScript didn't load properly

**Fix**:
- Ensure `<script>` tags are included at end of HTML
- Verify GSAP CDN loads: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`

---

### **Issue: Homepage Lead Magnet Shows Error**

**Symptoms**: Alert says "Error: Unable to process request"

**Expected**: Currently uses `alert()` - this is temporary

**Fix** (Post-Launch):
- Build n8n webhook
- Update form handler code
- Deploy updated HTML

---

## 📞 NEED HELP?

**If stuck, check**:
1. `/webflow/HOMEPAGE_COMPLETE_SUMMARY.md` - Overview
2. `/webflow/WEBFLOW_PAGE_PATTERNS_COMPLETE.md` - Technical details
3. Individual audit reports for each service page

**Common Questions**:
- "Which file goes on which page?" → See Phase 3-5 tables above
- "How do I test Stripe?" → Use test mode, buttons should redirect to checkout
- "What about legal pages?" → Phase 7, not blocking launch
- "Can I edit the HTML?" → Yes, but keep design system consistent

---

## 🎉 YOU'RE READY!

**Time Allocation**:
- Phase 1 (Fixes): 20 min
- Phase 2 (Homepage): 30 min
- Phase 3 (Service): 1 hour
- Phase 4 (Content): 30 min
- Phase 5 (Niche): 1 hour
- Phase 6 (Testing): 1 hour
- **Total**: 4 hours 20 min

**Break it down**:
- **Today**: Phases 1-3 (2 hours) = Homepage + Service pages live
- **Tomorrow**: Phases 4-6 (2.5 hours) = All pages live + tested
- **Later**: Phase 7 (2 hours) = Polish and enhancements

**Start with Phase 1 whenever you're ready!** 🚀

---

**Document**: `/webflow/DEPLOY_NOW_GUIDE.md`
**Created**: October 8, 2025
**Purpose**: Step-by-step deployment instructions
**Next**: Start Phase 1 → Fix footer + header
