# 💳 Stripe Integration Testing Guide

**Date**: November 2, 2025  
**Purpose**: Test complete purchase flow from Stripe checkout to download/booking link delivery

---

## 📋 **PRE-TEST CHECKLIST**

### **1. Verify Webhook Configuration**

**Current Setup**:
- **Webhook Handler**: `https://rensto-main-website.vercel.app/api/stripe/webhook`
- **Or Production**: `https://api.rensto.com/api/stripe/webhook` (if deployed)

**n8n Workflow URLs**:
- Template Purchase: `http://173.254.201.134:5678/webhook/stripe-marketplace-template`
- Installation Purchase: `http://173.254.201.134:5678/webhook/stripe-marketplace-install`

**Action**: Verify Stripe webhook URL points to correct Vercel deployment

### **2. Verify n8n Workflows Active**

- ✅ STRIPE-MARKETPLACE-001 (ID: `FOWZV3tTy5Pv84HP`)
- ✅ STRIPE-INSTALL-001 (ID: `QdalBg1LUY0xpwPR`)

**Check**: http://173.254.201.134:5678/workflows → Verify both are active

### **3. Verify Airtable Products**

- Check: Operations & Automation → Marketplace Products
- Verify: Product "email-persona-system" exists
- Verify: "Workflow ID" field = `email-persona-system`

---

## 🧪 **TEST 1: TEMPLATE PURCHASE FLOW**

### **Step 1: Create Test Checkout Session**

**Option A: Via Stripe Dashboard** (Easiest)

1. Go to: https://dashboard.stripe.com/test/products
2. Create checkout session:
   - Amount: $29.00 (or test amount)
   - Customer email: `test-marketplace@rensto.com`
   - **Metadata** (CRITICAL):
     ```
     flowType: marketplace-template
     productId: email-persona-system
     tier: simple
     ```
3. Complete with test card: `4242 4242 4242 4242`

**Option B: Via API** (For automation)

```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u sk_test_YOUR_KEY: \
  -d "mode=payment" \
  -d "success_url=https://rensto.com/success" \
  -d "cancel_url=https://rensto.com/cancel" \
  -d "line_items[0][price_data][currency]=usd" \
  -d "line_items[0][price_data][product_data][name]=Test Template" \
  -d "line_items[0][price_data][unit_amount]=2900" \
  -d "metadata[flowType]=marketplace-template" \
  -d "metadata[productId]=email-persona-system" \
  -d "metadata[tier]=simple"
```

### **Step 2: Complete Payment**

Use test card details:
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/34`
- **CVC**: `123`
- **ZIP**: `12345`

### **Step 3: Monitor Webhook Delivery**

**A. Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Find webhook event: `checkout.session.completed`
3. Verify:
   - Status: Succeeded (200)
   - Response time: < 2 seconds
   - Response body: `{"received": true}`

**B. Vercel Logs**:
```bash
cd apps/web/rensto-site
vercel logs --follow
```

Look for:
- `✅ Stripe webhook received: checkout.session.completed`
- `💳 Payment completed: { sessionId, customerEmail, flowType }`
- `Triggering n8n workflow: http://173.254.201.134:5678/webhook/stripe-marketplace-template`

**C. n8n Execution**:
1. Go to: http://173.254.201.134:5678/executions
2. Filter by: STRIPE-MARKETPLACE-001
3. Check latest execution:
   - ✅ All nodes green (executed successfully)
   - ✅ Customer record created/updated
   - ✅ Marketplace Purchase record created
   - ✅ Download link generated

**D. Airtable Verification**:
1. Open: Operations & Automation base
2. Check: Marketplace Purchases table
3. Find: New purchase record (last 5 minutes)
4. Verify:
   - ✅ Product linked correctly
   - ✅ Customer Email = test email
   - ✅ Download Link populated
   - ✅ Download Link Expiry = 7 days from now
   - ✅ Status = "📥 Download Link Sent"
   - ✅ Access Granted = true

### **Step 4: Test Download Link**

1. **Copy Download Link** from Airtable purchase record
2. **Open in Browser** or curl:
   ```bash
   curl -L "DOWNLOAD_LINK_FROM_AIRTABLE"
   ```
3. **Expected**:
   - Redirects to GitHub raw file URL
   - File downloads (workflow JSON)
   - Download count increments in Airtable

---

## 🧪 **TEST 2: INSTALLATION PURCHASE FLOW**

### **Step 1: Create Test Checkout**

**Stripe Dashboard Metadata**:
```
flowType: marketplace-install
productId: email-persona-system
tier: template
```

### **Step 2: Complete Payment**

Same test card: `4242 4242 4242 4242`

### **Step 3: Monitor Results**

**A. Stripe Dashboard**: Webhook delivery succeeded

**B. Vercel Logs**: Webhook received, n8n triggered

**C. n8n Execution**: STRIPE-INSTALL-001
- ✅ Project record created
- ✅ Marketplace Purchase created
- ✅ TidyCal booking link generated

**D. Airtable Verification**:
- ✅ Project record created (Rensto Client Operations)
- ✅ Marketplace Purchase record created
- ✅ TidyCal Booking Link populated
- ✅ Status = "📅 Installation Booked"
- ✅ Installation Booked = true

### **Step 4: Test TidyCal Booking Link**

1. **Copy TidyCal link** from Airtable
2. **Open in browser**
3. **Verify**: TidyCal calendar page loads
4. **Verify**: Booking type is "Installation" or similar

---

## ✅ **SUCCESS CRITERIA**

### **Template Purchase** ✅
- [ ] Stripe checkout completed
- [ ] Webhook received by Vercel
- [ ] n8n workflow executed successfully
- [ ] Customer record created/updated in Airtable
- [ ] Marketplace Purchase record created
- [ ] Download link generated and populated
- [ ] Download link works (redirects to GitHub)

### **Installation Purchase** ✅
- [ ] Stripe checkout completed
- [ ] Webhook received by Vercel
- [ ] n8n workflow executed successfully
- [ ] Project record created in Airtable
- [ ] Marketplace Purchase record created
- [ ] TidyCal booking link generated
- [ ] Booking link opens TidyCal calendar

---

## 📊 **TESTING CHECKLIST**

- [ ] Stripe webhook URL configured correctly
- [ ] n8n workflows active and accessible
- [ ] Airtable products verified
- [ ] Test checkout created (template)
- [ ] Payment completed
- [ ] Webhook delivery verified
- [ ] n8n execution verified
- [ ] Airtable records verified
- [ ] Download link tested
- [ ] Test checkout created (installation)
- [ ] Installation flow verified
- [ ] TidyCal link tested

---

**Status**: ⏸️ **READY TO TEST**

