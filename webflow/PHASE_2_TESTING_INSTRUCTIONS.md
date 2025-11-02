# 🧪 Phase 2: Testing Instructions

**Date**: November 2, 2025  
**Purpose**: Complete guide for testing deployed Marketplace API endpoints

---

## ⚠️ **VERCEL PROTECTION - REQUIRED SETUP**

The preview deployment requires authentication. Choose one method:

### **Method A: Get Bypass Token** (Recommended)

1. **Get Token**:
   - Go to: https://vercel.com/shais-projects-f9b9e359/rensto-main-website/settings/deployment-protection
   - Copy the "Protection Bypass Token"
   - OR: Check Vercel Dashboard → Project → Settings → Deployment Protection

2. **Use Token in Tests**:
   ```bash
   # Add bypass token as query parameter
   ?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN
   ```

### **Method B: Disable Protection for Preview**

1. Vercel Dashboard → Project Settings → Deployment Protection
2. Configure: "Only protect Production deployments"
3. Save (Preview will be accessible without token)

---

## 🧪 **TEST 1: Download Link Generation**

**Endpoint**: `POST /api/marketplace/downloads`

### **With Bypass Token**:
```bash
curl -X POST "https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/marketplace/downloads?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "email-persona-system",
    "customerEmail": "test@rensto.com",
    "sessionId": "cs_test_preview_123",
    "purchaseRecordId": "recPREVIEW123"
  }'
```

### **Expected Response** (200 OK):
```json
{
  "success": true,
  "downloadLink": "https://api.rensto.com/api/marketplace/download/{token}",
  "expiresAt": "2025-11-09T...",
  "product": {
    "name": "AI-Powered Email Persona System",
    "workflowId": "email-persona-system"
  }
}
```

**Verification**:
- [ ] Status 200 OK
- [ ] Response contains `downloadLink`
- [ ] Response contains `expiresAt` (7 days from now)
- [ ] Product name correct

---

## 🧪 **TEST 2: Error Handling - Missing Fields**

**Endpoint**: `POST /api/marketplace/downloads`

```bash
curl -X POST "https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/marketplace/downloads?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Missing required fields: templateId, customerEmail, purchaseRecordId"
}
```

---

## 🧪 **TEST 3: Invalid Product ID**

```bash
curl -X POST "https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/marketplace/downloads?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "non-existent-product",
    "customerEmail": "test@test.com",
    "sessionId": "cs_test",
    "purchaseRecordId": "rec123"
  }'
```

**Expected Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Product not found in Marketplace Products table"
}
```

---

## 🧪 **TEST 4: Installation Booking**

**Endpoint**: `POST /api/installation/booking`

```bash
curl -X POST "https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/installation/booking?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerEmail": "test@rensto.com",
    "workflowName": "Test Workflow",
    "productId": "email-persona-system",
    "projectId": "recPROJECT123",
    "purchaseRecordId": "recPURCHASE123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "success": true,
  "tidycalLink": "https://tidycal.com/shai/installation",
  "bookingUrl": "...",
  "message": "TidyCal booking link generated successfully"
}
```

---

## 🧪 **TEST 5: Download Token Handler**

**Requires**: Valid token from Test 1

```bash
# Extract token from Test 1 downloadLink
# Format: https://api.rensto.com/api/marketplace/download/{TOKEN}

curl -L "https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/marketplace/download/{TOKEN}?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_TOKEN"
```

**Expected**: HTTP 302 Redirect to GitHub raw file

---

## 🔄 **STRIPE INTEGRATION TESTING**

### **Step 1: Update Stripe Webhook URL**

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Find or create webhook for `rensto-main-website`
3. Update URL to: `https://rensto-main-website-ph5ax6in5-shais-projects-f9b9e359.vercel.app/api/stripe/webhook`
4. Copy webhook secret (update `STRIPE_WEBHOOK_SECRET` in Vercel if changed)

### **Step 2: Create Test Checkout**

**Via Stripe Dashboard**:
1. https://dashboard.stripe.com/test/checkout
2. Create session with metadata:
   - `flowType`: `marketplace-template`
   - `productId`: `email-persona-system`
   - `tier`: `standard`
3. Complete with test card: `4242 4242 4242 4242`

### **Step 3: Monitor Results**

- **Stripe**: Webhook delivery status
- **Vercel Logs**: `vercel logs --follow`
- **n8n**: http://173.254.201.134:5678/executions
- **Airtable**: Operations & Automation → Marketplace Purchases

---

## ✅ **TEST CHECKLIST**

### **API Endpoint Tests**
- [ ] Download link generation (valid data)
- [ ] Missing fields error handling
- [ ] Invalid product ID handling
- [ ] Installation booking API
- [ ] Download token handler (if token available)

### **Stripe Integration**
- [ ] Webhook URL updated
- [ ] Test checkout created
- [ ] Payment completed
- [ ] Webhook received
- [ ] n8n workflow triggered
- [ ] Airtable records created

---

**Status**: ⏸️ **READY TO TEST - AWAITING BYPASS TOKEN**

